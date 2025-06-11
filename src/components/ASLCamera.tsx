import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, CameraOff, RefreshCw, Hand, Eye, EyeOff } from 'lucide-react';
import { useWebcam } from '../hooks/useWebcam';
import { useHandpose } from '../hooks/useHandpose';
import { useASLGestures, ASLPrediction } from '../hooks/useASLGestures';
import HandLandmarksCanvas from './HandLandmarksCanvas';

interface ASLCameraProps {
  onDetection: (prediction: ASLPrediction) => void;
}

const ASLCamera: React.FC<ASLCameraProps> = ({ onDetection }) => {
  const { videoRef, isReady, error, isLoading, startWebcam, stopWebcam } = useWebcam();
  const { handposeResult, isModelLoaded, error: modelError } = useHandpose(
    isReady ? videoRef.current : null
  );
  const { predictGesture } = useASLGestures();
  
  const [showLandmarks, setShowLandmarks] = useState(true);
  const [currentPrediction, setCurrentPrediction] = useState<ASLPrediction | null>(null);
  const [lastPredictionTime, setLastPredictionTime] = useState(0);

  // Handle gesture prediction with throttling
  useEffect(() => {
    if (handposeResult.isDetected && handposeResult.landmarks.length === 21) {
      const now = Date.now();
      
      // Throttle predictions to every 1 second
      if (now - lastPredictionTime > 1000) {
        const prediction = predictGesture(handposeResult.landmarks);
        setCurrentPrediction(prediction);
        onDetection(prediction);
        setLastPredictionTime(now);
      }
    } else {
      setCurrentPrediction(null);
    }
  }, [handposeResult, predictGesture, onDetection, lastPredictionTime]);

  // Auto-start webcam on mount
  useEffect(() => {
    startWebcam();
    return () => stopWebcam();
  }, [startWebcam, stopWebcam]);

  const handleRetry = () => {
    stopWebcam();
    setTimeout(() => startWebcam(), 100);
  };

  const toggleLandmarks = () => {
    setShowLandmarks(prev => !prev);
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Status Bar */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          {/* Model Status */}
          <div className="flex items-center gap-2">
            {isModelLoaded ? (
              <>
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-sm text-green-600 dark:text-green-400">
                  Handpose Ready
                </span>
              </>
            ) : modelError ? (
              <>
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <span className="text-sm text-red-600 dark:text-red-400">
                  Model Error
                </span>
              </>
            ) : (
              <>
                <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-blue-600 dark:text-blue-400">
                  Loading Model...
                </span>
              </>
            )}
          </div>

          {/* Camera Status */}
          <div className="flex items-center gap-2">
            {isReady ? (
              <>
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-sm text-green-600 dark:text-green-400">
                  Camera Active
                </span>
              </>
            ) : error ? (
              <>
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <span className="text-sm text-red-600 dark:text-red-400">
                  Camera Error
                </span>
              </>
            ) : (
              <>
                <div className="w-3 h-3 bg-yellow-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-yellow-600 dark:text-yellow-400">
                  {isLoading ? 'Starting...' : 'Camera Off'}
                </span>
              </>
            )}
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={toggleLandmarks}
            className={`flex items-center gap-1 px-3 py-1 text-sm rounded-md transition-colors ${
              showLandmarks 
                ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' 
                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
            }`}
          >
            {showLandmarks ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
            Landmarks
          </button>
        </div>
      </div>

      {/* Camera Container */}
      <div className="relative aspect-video bg-gray-900 rounded-xl overflow-hidden">
        {error ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-white bg-gray-900">
            <CameraOff className="w-16 h-16 mb-4 text-red-500" />
            <p className="text-center mb-2 font-medium">Camera Error</p>
            <p className="text-center text-sm text-gray-300 mb-4">{error}</p>
            <button
              onClick={handleRetry}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Retry Camera
            </button>
          </div>
        ) : (
          <>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover scale-x-[-1]"
            />

            {/* Hand Landmarks Overlay */}
            {showLandmarks && isReady && handposeResult.landmarks.length > 0 && (
              <HandLandmarksCanvas
                landmarks={handposeResult.landmarks}
                videoWidth={videoRef.current?.videoWidth || 640}
                videoHeight={videoRef.current?.videoHeight || 480}
              />
            )}

            {/* Loading Overlay */}
            {!isReady && !error && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-900 bg-opacity-70 text-white">
                <div className="text-center">
                  <Camera className="w-12 h-12 mx-auto mb-2 animate-pulse" />
                  <p>{isLoading ? 'Starting camera...' : 'Camera initializing...'}</p>
                </div>
              </div>
            )}

            {/* Instructions */}
            {isReady && !handposeResult.isDetected && (
              <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-40 text-white pointer-events-none">
                <div className="text-center p-4">
                  <Hand className="w-10 h-10 mx-auto mb-3 opacity-80" />
                  <p className="text-lg font-medium opacity-90">Show your hand</p>
                  <p className="text-sm opacity-70 mt-1">Make an ASL sign in the center</p>
                </div>
              </div>
            )}

            {/* Hand Detection Indicator */}
            <AnimatePresence>
              {handposeResult.isDetected && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="absolute top-4 right-4 bg-green-500 text-white px-3 py-2 rounded-lg text-sm font-medium shadow-lg"
                >
                  Hand Detected ({Math.round(handposeResult.confidence * 100)}%)
                </motion.div>
              )}
            </AnimatePresence>

            {/* Prediction Display */}
            <AnimatePresence>
              {currentPrediction && currentPrediction.confidence > 0.6 && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.8, y: -20 }}
                  className="absolute top-4 left-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-4 rounded-lg shadow-lg"
                >
                  <div className="text-4xl font-bold mb-1">{currentPrediction.letter}</div>
                  <div className="text-sm opacity-90">
                    {Math.round(currentPrediction.confidence * 100)}% confident
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Detection Zone Guide */}
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-60 border-2 border-dashed border-white opacity-20 rounded-lg"></div>
            </div>
          </>
        )}
      </div>

      {/* Status Information */}
      <div className="mt-4 text-center text-sm">
        {error ? (
          <div className="flex items-center justify-center text-red-500">
            <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
            Camera unavailable
          </div>
        ) : handposeResult.isDetected ? (
          <div className="flex items-center justify-center text-green-500">
            <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></span>
            Analyzing hand gesture... (21 landmarks detected)
          </div>
        ) : isReady ? (
          <div className="flex items-center justify-center text-yellow-500">
            <span className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></span>
            Position your hand in the detection area
          </div>
        ) : (
          <div className="flex items-center justify-center text-gray-500">
            <span className="w-2 h-2 bg-gray-500 rounded-full mr-2 animate-pulse"></span>
            Initializing camera...
          </div>
        )}
      </div>

      {/* Technical Information */}
      <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <h3 className="text-sm font-medium mb-2">System Status</h3>
        <div className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
          <p>• TensorFlow.js Handpose: {isModelLoaded ? '✅ Loaded' : '⏳ Loading'}</p>
          <p>• Fingerpose Gestures: ✅ Ready (A, B, C, D, F, I, L, O, V, Y)</p>
          <p>• Hand landmarks: {handposeResult.landmarks.length}/21 detected</p>
          <p>• Detection confidence: {Math.round(handposeResult.confidence * 100)}%</p>
          <p>• Camera resolution: {videoRef.current?.videoWidth || 0}×{videoRef.current?.videoHeight || 0}</p>
        </div>
      </div>
    </div>
  );
};

export default ASLCamera;