import React, { useEffect, useState } from 'react';
import Webcam from 'react-webcam';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, CameraOff, RefreshCw, Hand } from 'lucide-react';
import { useWebcam } from '../hooks/useWebcam';
import { useHandDetection } from '../hooks/useHandDetection';

interface WebcamCaptureProps {
  onDetection: (letter: string | null, confidence: number) => void;
}

const WebcamCapture: React.FC<WebcamCaptureProps> = ({ onDetection }) => {
  const {
    webcamRef,
    isWebcamReady,
    error,
    handleUserMedia,
    handleUserMediaError,
    getVideoConstraints,
    stopWebcam,
  } = useWebcam();

  const { handDetection, detectedLetter, letterConfidence } = useHandDetection(webcamRef);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    if (detectedLetter) {
      onDetection(detectedLetter, letterConfidence);
    }
  }, [detectedLetter, letterConfidence, onDetection]);

  const handleRetry = () => {
    setRetryCount(prev => prev + 1);
    stopWebcam();
    setTimeout(() => {
      window.location.reload();
    }, 100);
  };

  return (
    <div className="relative w-full max-w-md mx-auto overflow-hidden">
      <div className="aspect-video bg-gray-900 rounded-xl overflow-hidden relative">
        {error ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-white bg-gray-900 bg-opacity-90">
            <CameraOff className="w-12 h-12 mb-2 text-red-500" />
            <p className="text-center mb-2 text-sm">Camera Error:</p>
            <p className="text-center mb-4 text-xs text-gray-300">{error}</p>
            <button 
              onClick={handleRetry}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
            >
              <RefreshCw size={16} />
              Retry Camera
            </button>
          </div>
        ) : (
          <>
            <Webcam
              key={retryCount}
              audio={false}
              ref={webcamRef}
              screenshotFormat="image/jpeg"
              videoConstraints={getVideoConstraints()}
              onUserMedia={handleUserMedia}
              onUserMediaError={handleUserMediaError}
              mirrored={true}
              className="w-full h-full object-cover"
              style={{ transform: 'scaleX(-1)' }}
            />

            {/* Loading overlay */}
            {!isWebcamReady && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-900 bg-opacity-70 text-white">
                <div className="text-center">
                  <Camera className="w-12 h-12 mx-auto mb-2 animate-pulse" />
                  <p>Starting camera...</p>
                </div>
              </div>
            )}

            {/* Instructions overlay when ready but no hand detected */}
            {isWebcamReady && !handDetection.isDetected && (
              <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-40 text-white pointer-events-none">
                <div className="text-center p-4">
                  <Hand className="w-8 h-8 mx-auto mb-2 opacity-70" />
                  <p className="text-sm opacity-90">Show your hand and make an ASL sign</p>
                  <p className="text-xs opacity-70 mt-1">Position your hand in the center of the frame</p>
                </div>
              </div>
            )}

            {/* Hand detection indicator - only show when confidence is high */}
            <AnimatePresence>
              {handDetection.isDetected && handDetection.confidence > 0.4 && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.3 }}
                  className="absolute inset-4 border-3 rounded-lg pointer-events-none"
                  style={{ 
                    borderColor: `rgba(34, 197, 94, ${Math.max(0.4, handDetection.confidence)})`,
                    boxShadow: `0 0 15px rgba(34, 197, 94, ${handDetection.confidence * 0.4})`,
                    borderWidth: '3px',
                    borderStyle: 'solid'
                  }}
                />
              )}
            </AnimatePresence>

            {/* Current detection display */}
            <AnimatePresence>
              {detectedLetter && letterConfidence > 0.6 && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.8, y: -20 }}
                  transition={{ duration: 0.4 }}
                  className="absolute top-4 left-4 bg-gradient-to-r from-purple-600 to-purple-700 text-white px-4 py-3 rounded-lg shadow-lg"
                >
                  <div className="text-3xl font-bold">{detectedLetter}</div>
                  <div className="text-xs opacity-90">
                    {Math.round(letterConfidence * 100)}% confident
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Detection zone indicator */}
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-48 h-36 border-2 border-dashed border-white opacity-30 rounded-lg"></div>
            </div>
          </>
        )}
      </div>

      {/* Enhanced status indicator */}
      <div className="mt-3 text-center text-sm">
        {error ? (
          <div className="flex items-center justify-center text-red-500">
            <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
            Camera unavailable
          </div>
        ) : handDetection.isDetected && handDetection.confidence > 0.4 ? (
          <div className="flex items-center justify-center text-green-500">
            <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></span>
            Hand detected - Hold steady for sign recognition
          </div>
        ) : isWebcamReady ? (
          <div className="flex items-center justify-center text-gray-600 dark:text-gray-400">
            <span className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></span>
            Position your hand in the dashed area and make an ASL sign
          </div>
        ) : (
          <div className="flex items-center justify-center text-gray-500">
            <span className="w-2 h-2 bg-gray-500 rounded-full mr-2 animate-pulse"></span>
            Initializing camera...
          </div>
        )}
      </div>
    </div>
  );
};

export default WebcamCapture;