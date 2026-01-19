'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

const comedians = [
  { id: 'rodney', name: 'Rodney Dangerfield', bgColor: 'bg-[#E8F4F8]', textColor: 'text-[#2E6B8A]', borderColor: 'border-[#2E6B8A]' },
  { id: 'george', name: 'George Carlin', bgColor: 'bg-[#F0F8F4]', textColor: 'text-[#4A9B7A]', borderColor: 'border-[#4A9B7A]' },
  { id: 'don', name: 'Don Rickles', bgColor: 'bg-[#FFF8E8]', textColor: 'text-[#C9A227]', borderColor: 'border-[#C9A227]' },
];

const topics = [
  { id: 'marriage', label: 'Marriage' },
  { id: 'aging', label: 'Aging' },
  { id: 'money', label: 'Money' },
  { id: 'family', label: 'Family' },
  { id: 'no_respect', label: 'No Respect' },
  { id: 'truth', label: 'Truth' },
  { id: 'roast', label: 'The Roast' },
  { id: 'wajed', label: 'Wajed' },
];

export default function ComedyClubPage() {
  const [selectedComedian, setSelectedComedian] = useState<string | null>(null);
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [joke, setJoke] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleGetJoke = async () => {
    if (!selectedComedian || !selectedTopic) return;

    setIsLoading(true);
    try {
      const response = await fetch('/api/office/comedy/joke', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          comedian: selectedComedian,
          category: selectedTopic,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch joke');
      }

      const data = await response.json();
      if (data.joke) {
        setJoke(data.joke);
      } else if (data.error) {
        setJoke(`Sorry, ${data.error}. Please try again.`);
      } else {
        setJoke('Sorry, I could not fetch a joke at this time.');
      }
    } catch (error: any) {
      console.error('Error fetching joke:', error);
      setJoke(`Sorry, ${error.message || 'I could not fetch a joke at this time.'} Please try again.`);
    } finally {
      setIsLoading(false);
    }
  };

  const reset = () => {
    setSelectedComedian(null);
    setSelectedTopic(null);
    setJoke(null);
  };

  return (
    <div className="min-h-screen bg-[#FAF7F2]">
      {/* Header - Theatrical Theme */}
      <div className="bg-gradient-to-r from-[#E8F4F8] to-white elegant-shadow sticky top-0 z-10 border-b-2 border-[#C9A227]">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-4">
          <Link href="/office" className="text-[#2E6B8A] hover:text-[#C9A227] transition-colors">
            <ArrowLeftIcon className="w-6 h-6" />
          </Link>
          <div className="flex-1">
            <h1 className="text-2xl font-headline text-[#2D2D2D]">Comedy Club</h1>
            <p className="text-xs text-[#2E6B8A] font-body">Where wit meets wisdom</p>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Step 1: Select Comedian */}
        {!selectedComedian && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <h2 className="text-3xl font-headline text-[#2E6B8A] text-center mb-8">
              Choose Your Comedian
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {comedians.map((comedian) => (
                <motion.button
                  key={comedian.id}
                  onClick={() => setSelectedComedian(comedian.id)}
                  className={`${comedian.bgColor} ${comedian.textColor} rounded-lg elegant-shadow p-8 hover:elegant-shadow-lg transition-all text-center border-2 ${comedian.borderColor}`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <h3 className="text-xl font-headline mb-2">{comedian.name}</h3>
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}

        {/* Step 2: Select Topic */}
        {selectedComedian && !selectedTopic && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="flex items-center justify-between mb-8">
              <button
                onClick={reset}
                className="text-[#2E6B8A] hover:text-[#C9A227] transition-colors"
              >
                ← Back
              </button>
              <h2 className="text-3xl font-headline text-[#2E6B8A] text-center flex-1">
                Choose a Topic
              </h2>
              <div className="w-20"></div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {topics.map((topic) => (
                <motion.button
                  key={topic.id}
                  onClick={() => setSelectedTopic(topic.id)}
                  className="bg-white text-[#2D2D2D] rounded-lg elegant-shadow p-6 hover:elegant-shadow-lg transition-all text-center border-2 border-transparent hover:border-[#C9A227]"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <p className="font-body">{topic.label}</p>
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}

        {/* Step 3: Show Joke */}
        {selectedComedian && selectedTopic && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="flex items-center justify-between mb-8">
              <button
                onClick={reset}
                className="text-[#2E6B8A] hover:text-[#C9A227] transition-colors"
              >
                ← New Joke
              </button>
              <h2 className="text-2xl font-headline text-[#2E6B8A] text-center flex-1">
                {comedians.find((c) => c.id === selectedComedian)?.name}
              </h2>
              <div className="w-20"></div>
            </div>

            {!joke && !isLoading && (
              <div className="text-center">
                <button
                  onClick={handleGetJoke}
                  className="px-8 py-4 bg-[#2E6B8A] text-white rounded-lg elegant-shadow hover:elegant-shadow-lg transition-all text-lg font-body"
                >
                  Get Joke
                </button>
              </div>
            )}

            {isLoading && (
              <div className="bg-white rounded-lg elegant-shadow p-12 text-center">
                <p className="text-[#2D2D2D] font-body">Loading your joke...</p>
              </div>
            )}

            {joke && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white rounded-lg elegant-shadow-lg p-8 text-center"
              >
                <p className="text-xl text-[#2D2D2D] font-body leading-relaxed whitespace-pre-wrap">
                  {joke}
                </p>
                <button
                  onClick={handleGetJoke}
                  className="mt-6 px-6 py-3 bg-[#2E6B8A] text-white rounded-lg elegant-shadow hover:elegant-shadow-lg transition-all"
                >
                  Another One
                </button>
              </motion.div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}
