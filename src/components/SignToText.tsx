import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Volume2, VolumeX } from 'lucide-react';
import ASLRecognitionCamera from './ASLRecognitionCamera';
import { Translation } from '../types';
import { useTextToSpeech } from '../hooks/useTextToSpeech';

const SignToText: React.FC = () => {
  const [translations, setTranslations] = useState<Translation[]>([]);
  const [isSpeechEnabled, setIsSpeechEnabled] = useState<boolean>(true);
  const { speak } = useTextToSpeech();

  const handleDetection = (letter: string, confidence: number) => {
    if (!letter) return;
    
    // Only add new translations if they're different from the most recent one
    // or if it's been at least 2 seconds since the last one
    const lastTranslation = translations[0];
    const shouldAddNewTranslation = 
      !lastTranslation || 
      lastTranslation.text !== letter || 
      Date.now() - lastTranslation.timestamp.getTime() > 2000;

    if (shouldAddNewTranslation) {
      const newTranslation: Translation = {
        id: Date.now().toString(),
        text: letter,
        timestamp: new Date(),
        confidence,
      };
      
      setTranslations(prev => [newTranslation, ...prev].slice(0, 15));
      
      // Speak the translation if speech is enabled
      if (isSpeechEnabled) {
        speak(letter);
      }
    }
  };

  const toggleSpeech = () => {
    setIsSpeechEnabled(prev => !prev);
  };

  // Form words from recent letters
  const recentLetters = translations.slice(0, 8).map(t => t.text).join('');

  return (
    <div className="flex flex-col items-center w-full max-w-4xl mx-auto">
      <div className="w-full mb-4 flex justify-end">
        <button 
          onClick={toggleSpeech}
          className="flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium
            bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300
            hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors
            border border-gray-200 dark:border-gray-700"
        >
          {isSpeechEnabled ? (
            <>
              <Volume2 size={16} className="text-purple-600 dark:text-purple-400" />
              <span>Sound On</span>
            </>
          ) : (
            <>
              <VolumeX size={16} className="text-gray-500" />
              <span>Sound Off</span>
            </>
          )}
        </button>
      </div>
      
      <ASLRecognitionCamera onDetection={handleDetection} />
      
      <div className="w-full mt-8">
        {recentLetters && (
          <div className="w-full mb-6">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Recent Letters</h3>
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md border border-gray-200 dark:border-gray-700"
            >
              <p className="text-4xl font-bold text-center text-gray-800 dark:text-white tracking-wider">
                {recentLetters}
              </p>
              <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-2">
                {translations.length} letters detected
              </p>
            </motion.div>
          </div>
        )}

        <div className="w-full">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Detection History</h3>
          <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2">
            <AnimatePresence>
              {translations.map(translation => (
                <motion.div
                  key={translation.id}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className={`
                    flex flex-col items-center justify-center p-3 rounded-lg shadow-sm
                    bg-white dark:bg-gray-800 border 
                    ${translation.confidence > 0.8 
                      ? 'border-green-400 bg-green-50 dark:bg-green-900/20' 
                      : translation.confidence > 0.6
                      ? 'border-yellow-400 bg-yellow-50 dark:bg-yellow-900/20'
                      : 'border-gray-300 dark:border-gray-600'
                    }
                  `}
                >
                  <span className="text-2xl font-bold text-gray-800 dark:text-white">{translation.text}</span>
                  <span className="text-xs text-gray-500 mt-1">
                    {Math.round(translation.confidence * 100)}%
                  </span>
                  <span className="text-xs text-gray-400">
                    {translation.timestamp.toLocaleTimeString().slice(0, 5)}
                  </span>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignToText;