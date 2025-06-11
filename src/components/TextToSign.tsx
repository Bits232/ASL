import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Mic, MicOff, ArrowRight, Send } from 'lucide-react';
import { Suggestion } from '../types';
import { suggestionData } from '../data/suggestionData';
import { mockSignData } from '../data/mockSignData';

const TextToSign: React.FC = () => {
  const [inputText, setInputText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [currentSign, setCurrentSign] = useState<string | null>(null);
  const [suggestions] = useState<Suggestion[]>(suggestionData);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputText(e.target.value);
  };

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    if (inputText.trim()) {
      // In a real app, this would analyze the text and find matching signs
      // For now, we'll just use the first letter to show a sign
      const firstLetter = inputText.trim().charAt(0).toUpperCase();
      if (firstLetter && mockSignData[firstLetter]) {
        setCurrentSign(firstLetter);
      } else {
        // If no matching sign, pick a random one as fallback
        const randomLetter = Object.keys(mockSignData)[
          Math.floor(Math.random() * Object.keys(mockSignData).length)
        ];
        setCurrentSign(randomLetter);
      }
    }
  };

  const handleSuggestionClick = (text: string) => {
    setInputText(text);
    // Use timeout to ensure the UI updates before processing
    setTimeout(() => {
      handleSubmit();
    }, 10);
  };

  const toggleSpeechRecognition = () => {
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      alert('Speech recognition is not supported in your browser.');
      return;
    }

    if (isListening) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
        recognitionRef.current = null;
      }
      setIsListening(false);
      return;
    }

    // Initialize speech recognition
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognitionRef.current = new SpeechRecognition();
    
    recognitionRef.current.continuous = false;
    recognitionRef.current.interimResults = true;
    recognitionRef.current.lang = 'en-US';
    
    recognitionRef.current.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setInputText(transcript);
      
      // If we have a final result, process it
      if (event.results[0].isFinal) {
        setTimeout(() => handleSubmit(), 100);
      }
    };
    
    recognitionRef.current.onerror = (event) => {
      console.error('Speech recognition error', event.error);
      setIsListening(false);
    };
    
    recognitionRef.current.onend = () => {
      setIsListening(false);
    };
    
    recognitionRef.current.start();
    setIsListening(true);
  };

  return (
    <div className="flex flex-col items-center w-full max-w-3xl mx-auto">
      <form onSubmit={handleSubmit} className="w-full flex gap-2 mb-6">
        <div className="relative flex-grow">
          <input
            type="text"
            value={inputText}
            onChange={handleInputChange}
            placeholder="Type text to translate to sign language..."
            className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 
                      bg-white dark:bg-gray-800 text-gray-900 dark:text-white 
                      focus:outline-none focus:ring-2 focus:ring-purple-500"
            aria-label="Text to translate"
          />
          <button
            type="button"
            onClick={toggleSpeechRecognition}
            className={`absolute right-14 top-1/2 transform -translate-y-1/2 p-2 rounded-full
                      ${isListening 
                        ? 'bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-400' 
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'} 
                      hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors`}
            aria-label={isListening ? "Stop listening" : "Start voice input"}
          >
            {isListening ? <MicOff size={18} /> : <Mic size={18} />}
          </button>
        </div>
        <button
          type="submit"
          className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg 
                  transition-colors flex items-center justify-center"
          disabled={!inputText.trim()}
          aria-label="Translate text to sign language"
        >
          <Send size={18} />
        </button>
      </form>

      {currentSign ? (
        <div className="w-full mb-8">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Sign Translation</h3>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md border border-gray-200 dark:border-gray-700"
          >
            <div className="aspect-square max-w-xs mx-auto mb-4 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
              {/* In a real app, this would be a video or animation */}
              <div className="text-center">
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ 
                    scale: [0.8, 1.1, 1], 
                    opacity: 1 
                  }}
                  transition={{ 
                    duration: 0.5,
                    times: [0, 0.7, 1]
                  }}
                  className="text-7xl font-bold text-purple-600 dark:text-purple-400"
                >
                  {currentSign}
                </motion.div>
                <p className="mt-4 text-gray-600 dark:text-gray-300">
                  {mockSignData[currentSign]?.description || 'Hand sign animation'}
                </p>
              </div>
            </div>
            <div className="text-center">
              <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-1">
                Sign for "{currentSign}"
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {inputText}
              </p>
            </div>
          </motion.div>
        </div>
      ) : (
        <div className="w-full mb-8 bg-gray-100 dark:bg-gray-800 rounded-lg p-8 flex items-center justify-center">
          <p className="text-gray-500 dark:text-gray-400 text-center">
            Type or speak text above to see the corresponding sign language
          </p>
        </div>
      )}

      <div className="w-full">
        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Common Phrases</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
          {suggestions.map(suggestion => (
            <button
              key={suggestion.id}
              onClick={() => handleSuggestionClick(suggestion.text)}
              className={`
                p-3 text-sm rounded-lg border text-left hover:shadow-md transition-shadow
                ${suggestion.category === 'greeting' ? 'border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/30' : ''}
                ${suggestion.category === 'question' ? 'border-purple-200 dark:border-purple-800 bg-purple-50 dark:bg-purple-900/30' : ''}
                ${suggestion.category === 'common' ? 'border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/30' : ''}
                ${suggestion.category === 'emergency' ? 'border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/30' : ''}
              `}
            >
              <div className="flex items-center justify-between">
                <span className={`
                  ${suggestion.category === 'greeting' ? 'text-blue-800 dark:text-blue-300' : ''}
                  ${suggestion.category === 'question' ? 'text-purple-800 dark:text-purple-300' : ''}
                  ${suggestion.category === 'common' ? 'text-green-800 dark:text-green-300' : ''}
                  ${suggestion.category === 'emergency' ? 'text-red-800 dark:text-red-300' : ''}
                `}>
                  {suggestion.text}
                </span>
                <ArrowRight className="w-3 h-3 opacity-70" />
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TextToSign;