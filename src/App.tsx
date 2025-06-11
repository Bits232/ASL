import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Hand, Brain, Camera } from 'lucide-react';
import ASLCamera from './components/ASLCamera';
import PredictionHistory from './components/PredictionHistory';
import { ASLPrediction } from './hooks/useASLGestures';

interface PredictionWithTimestamp extends ASLPrediction {
  id: string;
  timestamp: Date;
}

function App() {
  const [predictions, setPredictions] = useState<PredictionWithTimestamp[]>([]);

  const handleDetection = (prediction: ASLPrediction) => {
    // Only add if it's different from the last prediction or enough time has passed
    const lastPrediction = predictions[0];
    const shouldAdd = !lastPrediction || 
      lastPrediction.letter !== prediction.letter || 
      Date.now() - lastPrediction.timestamp.getTime() > 2000;

    if (shouldAdd && prediction.confidence > 0.6) {
      const newPrediction: PredictionWithTimestamp = {
        ...prediction,
        id: Date.now().toString(),
        timestamp: new Date()
      };
      
      setPredictions(prev => [newPrediction, ...prev].slice(0, 50)); // Keep last 50
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header */}
      <header className="w-full bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg">
                <Hand className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  ASL Translator
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Real-time American Sign Language Recognition
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                <Brain className="w-4 h-4" />
                <span>TensorFlow.js + Handpose</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                <Camera className="w-4 h-4" />
                <span>Real-time</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Camera Section */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Live Camera Feed
              </h2>
              <ASLCamera onDetection={handleDetection} />
            </motion.div>
          </div>

          {/* History Section */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Recognition Results
              </h2>
              <PredictionHistory predictions={predictions} />
            </motion.div>
          </div>
        </div>

        {/* Instructions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-12 bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700"
        >
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            How to Use
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Camera className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <h4 className="font-medium text-gray-900 dark:text-white mb-2">1. Allow Camera</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Grant camera permissions when prompted to start hand detection.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Hand className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <h4 className="font-medium text-gray-900 dark:text-white mb-2">2. Show Your Hand</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Position your hand in the detection area and make ASL signs.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Brain className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <h4 className="font-medium text-gray-900 dark:text-white mb-2">3. See Results</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Watch as the AI recognizes your signs and displays the letters.
              </p>
            </div>
          </div>
          
          <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <h4 className="font-medium text-gray-900 dark:text-white mb-2">Supported Letters</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Currently recognizes: <span className="font-mono font-medium">A, B, C, D, F, I, L, O, V, Y</span>
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
              More letters will be added with improved gesture definitions.
            </p>
          </div>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="w-full bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 mt-16">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="text-center text-sm text-gray-600 dark:text-gray-400">
            <p>Built with TensorFlow.js Handpose, Fingerpose, and React</p>
            <p className="mt-1">Real-time ASL recognition in the browser</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;