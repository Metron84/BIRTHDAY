import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  try {
    // Get quote of the day (random from database)
    const { data: allQuotes } = await supabase
      .from('quotes')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100);

    if (!allQuotes || allQuotes.length === 0) {
      // Return default quotes if database is empty
      const defaultQuotes = [
        {
          id: '1',
          author: 'Warren Buffett',
          content: 'Price is what you pay. Value is what you get.',
          category: 'business',
        },
        {
          id: '2',
          author: 'Don Corleone',
          content: 'A man who doesn\'t spend time with his family can never be a real man.',
          category: 'family',
        },
        {
          id: '3',
          author: 'Peter Drucker',
          content: 'The best way to predict the future is to create it.',
          category: 'business',
        },
        {
          id: '4',
          author: 'Michael Corleone',
          content: 'Keep your friends close, but your enemies closer.',
          category: 'strategy',
        },
      ];

      const randomQuote = defaultQuotes[Math.floor(Math.random() * defaultQuotes.length)];
      return NextResponse.json({
        quoteOfTheDay: randomQuote,
        allQuotes: defaultQuotes,
      });
    }

    // Select random quote for quote of the day
    const randomIndex = Math.floor(Math.random() * allQuotes.length);
    const quoteOfTheDay = allQuotes[randomIndex];

    return NextResponse.json({
      quoteOfTheDay,
      allQuotes: allQuotes.slice(0, 50), // Limit archive to 50 most recent
    });
  } catch (error) {
    console.error('Error fetching quotes:', error);
    return NextResponse.json(
      { error: 'Failed to fetch quotes' },
      { status: 500 }
    );
  }
}
