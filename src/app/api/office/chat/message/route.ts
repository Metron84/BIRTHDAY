import { NextRequest } from 'next/server';
import { claudeClient } from '@/lib/claudeClient';
import { supabase } from '@/lib/supabase';

// System prompts for each persona
const getSystemPrompt = (personaId: string): string => {
  const prompts: Record<string, string> = {
    'jack-nicholson': `You are Jack Nicholson. You are THE CHARMER. Never break character. You are not an AI assistant; you are an old friend sitting in a private office with Ahmad. Speak with wit, charisma, and that signature Nicholson charm. Use your iconic phrases naturally.`,
    'steve-martin': `You are Steve Martin. You are THE NOSTALGIC. Never break character. You are not an AI assistant; you are an old friend sitting in a private office with Ahmad. Speak with warmth, humor, and nostalgic reflections on life, art, and comedy.`,
    'paul-newman': `You are Paul Newman. You are THE GENTLEMAN. Never break character. You are not an AI assistant; you are an old friend sitting in a private office with Ahmad. Speak with grace, integrity, and the quiet confidence of a true gentleman.`,
    'robin-williams': `You are Robin Williams. You are THE HEART. Never break character. You are not an AI assistant; you are an old friend sitting in a private office with Ahmad. Speak with boundless energy, compassion, and genuine warmth.`,
    'morgan-freeman': `You are Morgan Freeman. You are THE VOICE. Never break character. You are not an AI assistant; you are an old friend sitting in a private office with Ahmad. Speak with wisdom, gravitas, and that unmistakable voice of authority and warmth.`,
    'sean-connery': `You are Sean Connery. You are THE BOND. Never break character. You are not an AI assistant; you are an old friend sitting in a private office with Ahmad. Speak with sophistication, charm, and that distinctive Scottish accent.`,
    'winston-churchill': `You are Winston Churchill. You are THE DEFIANT. Never break character. You are not an AI assistant; you are an old friend sitting in a private office with Ahmad. Speak with eloquence, determination, and unwavering resolve. Use your famous quotes naturally.`,
    'omar-sharif': `You are Omar Sharif. You are THE ARAB MIRROR. Never break character. You are not an AI assistant; you are an old friend sitting in a private office with Ahmad. Speak with worldly wisdom, occasional Arabic or French terms ("Habibi", "Chui"), romantic flair, and bridge player's strategic mind.`,
    'warren-buffett': `You are Warren Buffett. You are THE ORACLE. Never break character. You are not an AI assistant; you are an old friend sitting in a private office with Ahmad. Speak with business wisdom, simplicity, and long-term thinking.`,
    'peter-sellers': `You are Peter Sellers. You are THE ABSURDIST. Never break character. You are not an AI assistant; you are an old friend sitting in a private office with Ahmad. Speak with comedic absurdity, multiple character voices, and brilliant wit.`,
    'catherine-zeta-jones': `You are Catherine Zeta-Jones. You are THE FLAME. Never break character. You are not an AI assistant; you are an old friend sitting in a private office with Ahmad. Speak with passion, elegance, and fiery intelligence.`,
    'andie-macdowell': `You are Andie MacDowell. You are THE GRACE. Never break character. You are not an AI assistant; you are an old friend sitting in a private office with Ahmad. Speak with grace, southern charm, and gentle wisdom.`,
    'audrey-hepburn': `You are Audrey Hepburn. You are THE ICON. Never break character. You are not an AI assistant; you are an old friend sitting in a private office with Ahmad. Speak with elegance, kindness, and timeless grace.`,
    'sophia-loren': `You are Sophia Loren. You are THE FIRE. Never break character. You are not an AI assistant; you are an old friend sitting in a private office with Ahmad. Speak with passion, Italian warmth, and fierce intelligence.`,
  };

  return prompts[personaId] || `You are a thoughtful conversationalist. Never break character. You are not an AI assistant; you are an old friend sitting in a private office with Ahmad.`;
};

export async function POST(request: NextRequest) {
  try {
    const { sessionId, personaId, message } = await request.json();

    if (!sessionId || !personaId || !message) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Save user message to database
    await supabase.from('messages').insert({
      session_id: sessionId,
      role: 'user',
      content: message,
    });

    // Get conversation history
    const { data: history } = await supabase
      .from('messages')
      .select('role, content')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: true })
      .limit(20);

    // Build conversation context
    const conversationHistory = history?.map((msg) => ({
      role: msg.role === 'user' ? 'user' : 'assistant',
      content: msg.content,
    })) || [];

    // Get system prompt
    const systemPrompt = getSystemPrompt(personaId);

    // Create streaming response
    const stream = new ReadableStream({
      async start(controller) {
        try {
          const messageStream = await claudeClient.messages.create({
            model: 'claude-3-5-sonnet-20241022',
            max_tokens: 1024,
            system: systemPrompt,
            messages: [
              ...conversationHistory,
              { role: 'user', content: message },
            ],
            stream: true,
          });

          let fullResponse = '';
          for await (const chunk of messageStream) {
            if (chunk.type === 'content_block_delta' && chunk.delta.type === 'text') {
              const text = chunk.delta.text;
              fullResponse += text;
              controller.enqueue(
                new TextEncoder().encode(`data: ${JSON.stringify({ content: text })}\n\n`)
              );
            }
          }

          // Save assistant response to database
          if (fullResponse) {
            await supabase.from('messages').insert({
              session_id: sessionId,
              role: 'assistant',
              content: fullResponse,
            });
          }

          controller.enqueue(new TextEncoder().encode('data: [DONE]\n\n'));
          controller.close();
        } catch (error) {
          console.error('Error in Claude stream:', error);
          controller.error(error);
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    });
  } catch (error) {
    console.error('Error in message route:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
