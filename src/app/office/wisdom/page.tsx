'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowLeftIcon, SparklesIcon } from '@heroicons/react/24/outline';

interface Quote {
  id: string;
  author: string;
  content: string;
  category?: string;
}

export default function BusinessWisdomPage() {
  const [quoteOfTheDay, setQuoteOfTheDay] = useState<Quote | null>(null);
  const [allQuotes, setAllQuotes] = useState<Quote[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadQuotes();
  }, []);

  const loadQuotes = async () => {
    try {
      const response = await fetch('/api/office/wisdom/quotes');
      const data = await response.json();
      setQuoteOfTheDay(data.quoteOfTheDay);
      setAllQuotes(data.allQuotes || []);
    } catch (error) {
      console.error('Error loading quotes:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF7F2]">
      {/* Header */}
      <div className="bg-white elegant-shadow sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-4">
          <Link href="/office" className="text-[#2E6B8A] hover:text-[#C9A227] transition-colors">
            <ArrowLeftIcon className="w-6 h-6" />
          </Link>
          <h1 className="text-2xl font-headline text-[#2D2D2D]">Business Wisdom</h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Quote of the Day */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <div className="flex items-center gap-2 mb-6">
            <SparklesIcon className="w-6 h-6 text-[#C9A227]" />
            <h2 className="text-2xl font-headline text-[#2E6B8A]">Quote of the Day</h2>
          </div>

          {isLoading ? (
            <div className="bg-white rounded-lg elegant-shadow p-8 text-center">
              <p className="text-[#2D2D2D] font-body">Loading wisdom...</p>
            </div>
          ) : quoteOfTheDay ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-lg elegant-shadow-lg p-8 border-l-4 border-[#C9A227]"
            >
              <p className="text-xl text-[#2D2D2D] font-body leading-relaxed mb-4 italic">
                "{quoteOfTheDay.content}"
              </p>
              <p className="text-lg text-[#2E6B8A] font-headline text-right">
                — {quoteOfTheDay.author}
              </p>
            </motion.div>
          ) : (
            <div className="bg-white rounded-lg elegant-shadow p-8 text-center">
              <p className="text-[#2D2D2D] font-body">No quote available</p>
            </div>
          )}
        </motion.div>

        {/* Archive */}
        <div>
          <h2 className="text-2xl font-headline text-[#2E6B8A] mb-6">Wisdom Archive</h2>
          <div className="space-y-4">
            {allQuotes.length === 0 && !isLoading && (
              <div className="bg-white rounded-lg elegant-shadow p-8 text-center">
                <p className="text-[#2D2D2D] font-body">No quotes in archive yet</p>
              </div>
            )}
            {allQuotes.map((quote, index) => (
              <motion.div
                key={quote.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white rounded-lg elegant-shadow p-6 hover:elegant-shadow-lg transition-all"
              >
                <p className="text-lg text-[#2D2D2D] font-body leading-relaxed mb-3">
                  "{quote.content}"
                </p>
                <p className="text-base text-[#2E6B8A] font-headline text-right">
                  — {quote.author}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
