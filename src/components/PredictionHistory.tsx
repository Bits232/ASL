import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock } from 'lucide-react';
import { ASLPrediction } from '../hooks/useASLGestures';

interface PredictionWithTimestamp extends ASLPrediction {
  id: string;
  timestamp: Date;
}

interface PredictionHistoryProps {
  predictions: PredictionWithTimestamp[];
}

const PredictionHistory: React.FC<PredictionHistoryProps> = ({ predictions }) => {
  const recentLetters = predictions.slice(0, 10).map(p => p.letter).join('');

  return (
    <div className="w-full space-y-6">
      {/* Recent Letters Display */}
      {recentLetters && (
        <div className="w-full">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">Recent Letters</h3>
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md border border-gray-200 dark:border-gray-700"
          >
            <p className="text-4xl font-bold text-center text-gray-800 dark:text-white tracking-wider font-mono">
              {recentLetters}
            </p>
            <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-3">
              {predictions.length} letters detected
            </p>
          </motion.div>
        </div>
      )}

      {/* Prediction History Grid */}
      <div className="w-full">
        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">Detection History</h3>
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
          <AnimatePresence>
            {predictions.slice(0, 24).map((prediction, index) => (
              <motion.div
                key={prediction.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ delay: index * 0.05 }}
                className={`
                  flex flex-col items-center justify-center p-4 rounded-lg shadow-sm border
                  ${prediction.confidence > 0.8 
                    ? 'border-green-400 bg-green-50 dark:bg-green-900/20' 
                    : prediction.confidence > 0.6
                    ? 'border-yellow-400 bg-yellow-50 dark:bg-yellow-900/20'
                    : 'border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800'
                  }
                `}
              >
                <span className="text-2xl font-bold text-gray-800 dark:text-white mb-1">
                  {prediction.letter}
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                  {Math.round(prediction.confidence * 100)}%
                </span>
                <div className="flex items-center text-xs text-gray-400 dark:text-gray-500">
                  <Clock className="w-3 h-3 mr-1" />
                  {prediction.timestamp.toLocaleTimeString().slice(0, 5)}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
        
        {predictions.length === 0 && (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <Hand className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No predictions yet</p>
            <p className="text-sm">Start making ASL signs to see results</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PredictionHistory;