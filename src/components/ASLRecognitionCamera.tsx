import React, { useRef, useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, CameraOff, Upload, AlertCircle, CheckCircle, Hand, RefreshCw, Eye } from 'lucide-react';
import { useMediaPipeHands } from '../hooks/useMediaPipeHands';
import { useASLModel } from '../hooks/useASLModel';
import HandLandmarksOverlay from './HandLandmarksOverlay';

interface ASLRecognitionCameraProps {
  onDetection: (letter: string, confidence: number) => void;
}

const ASLRecognitionCamera: React.FC<ASLRecognitionCameraProps> = ({ onDetection }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isVideoReady, setIsVideoReady] = useState(false);
  const [videoError, setVideoError] = useState<string | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [showLandmarks, setShowLandmarks] = useState(true);
  const [currentPrediction, setCurrentPrediction] = useState<{letter: string, confidence: number} | null>(null);

  // MediaPipe Hands integration
  const { handsResult, isInitialized: isMediaPipeReady, error: mediaPipeError } = useMediaPipeHands(
    isVideoReady ? videoRef.current : null
  );

  // ASL Model integration
  const { model, isLoading: isModelLoading, error: modelError, predict } = useASLModel();

  // Prediction timing with throttling
  const lastPredictionTime = useRef<number>(0);
  const predictionTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Cleanup function for stream
  const cleanupStream = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach(track => {
        track.stop();
        console.log('Stopped track:', track.kind, track.label);
      });
      setStream(null);
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }, [stream]);

  // Start webcam with improved error handling
  const startWebcam = useCallback(async () => {
    try {
      // Clean up existing stream first
      cleanupStream();
      
      setVideoError(null);
      setIsVideoReady(false);

      // Request camera with conservative settings
      const constraints: MediaStreamConstraints = {
        video: {
          width: { ideal: 640, max: 640 },
          height: { ideal: 480, max: 480 },
          facingMode: 'user',
          frameRate: { ideal: 15, max: 20 } // Lower frame rate to reduce load
        }
      };

      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      
      if (!videoRef.current) {
        // Component unmounted, cleanup
        mediaStream.getTracks().forEach(track => track.stop());
        return;
      }

      setStream(mediaStream);
      videoRef.current.srcObject = mediaStream;
      
      // Handle video events
      const video = videoRef.current;
      
      const handleLoadedMetadata = () => {
        if (video && !video.paused) {
          setIsVideoReady(true);
        }
      };

      const handleError = (error: Event) => {
        console.error('Video error:', error);
        setVideoError('Video playback failed');
        cleanupStream();
      };

      video.addEventListener('loadedmetadata', handleLoadedMetadata);
      video.addEventListener('error', handleError);
      
      // Auto-play video
      try {
        await video.play();
      } catch (playError) {
        console.error('Video play error:', playError);
        setVideoError('Failed to start video playback');
      }

      // Cleanup event listeners
      return () => {
        video.removeEventListener('loadedmetadata', handleLoadedMetadata);
        video.removeEventListener('error', handleError);
      };

    } catch (error) {
      console.error('Error accessing webcam:', error);
      let errorMessage = 'Unable to access webcam.';
      
      if (error instanceof Error) {
        if (error.name === 'NotAllowedError') {
          errorMessage = 'Camera access denied. Please allow camera permissions.';
        } else if (error.name === 'NotFoundError') {
          errorMessage = 'No camera found. Please connect a camera.';
        } else if (error.name === 'NotReadableError') {
          errorMessage = 'Camera is being used by another application.';
        } else if (error.name === 'OverconstrainedError') {
          errorMessage = 'Camera constraints not supported.';
        }
      }
      
      setVideoError(errorMessage);
    }
  }, [cleanupStream, retryCount]);

  // Throttled prediction function
  const makePrediction = useCallback(async () => {
    if (!handsResult.isDetected || handsResult.landmarks.length === 0) {
      setCurrentPrediction(null);
      return;
    }

    const now = Date.now();
    
    // Throttle predictions to every 2 seconds to reduce load
    if (now - lastPredictionTime.current < 2000) {
      return;
    }

    lastPredictionTime.current = now;
    
    // Clear any existing timeout
    if (predictionTimeoutRef.current) {
      clearTimeout(predictionTimeoutRef.current);
    }

    // Debounce prediction to avoid rapid calls
    predictionTimeoutRef.current = setTimeout(async () => {
      try {
        const prediction = await predict(handsResult.landmarks[0]);
        setCurrentPrediction(prediction);
        onDetection(prediction.letter, prediction.confidence);
      } catch (error) {
        console.error('Error making prediction:', error);
        setCurrentPrediction(null);
      }
    }, 300);
  }, [handsResult, predict, onDetection]);

  // Handle predictions with proper cleanup
  useEffect(() => {
    if (isMediaPipeReady && !isModelLoading) {
      makePrediction();
    }

    return () => {
      if (predictionTimeoutRef.current) {
        clearTimeout(predictionTimeoutRef.current);
      }
    };
  }, [handsResult, isMediaPipeReady, isModelLoading, makePrediction]);

  // Initialize webcam on mount
  useEffect(() => {
    const cleanup = startWebcam();
    
    return () => {
      if (cleanup && typeof cleanup === 'function') {
        cleanup();
      }
      cleanupStream();
      if (predictionTimeoutRef.current) {
        clearTimeout(predictionTimeoutRef.current);
      }
    };
  }, [startWebcam, cleanupStream]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanupStream();
      if (predictionTimeoutRef.current) {
        clearTimeout(predictionTimeoutRef.current);
      }
    };
  }, [cleanupStream]);

  const handleRetry = () => {
    setRetryCount(prev => prev + 1);
  };

  const handleModelUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      console.log('Model file selected:', file.name);
      alert('Model upload functionality would be implemented here. Place your model files in /public/models/');
    }
  };

  const toggleLandmarks = () => {
    setShowLandmarks(prev => !prev);
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Status Bar */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          {/* MediaPipe Status */}
          <div className="flex items-center gap-2">
            {isMediaPipeReady ? (
              <>
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span className="text-xs text-green-600 dark:text-green-400">
                  Hand Tracking Ready
                </span>
              </>
            ) : mediaPipeError ? (
              <>
                <AlertCircle className="w-4 h-4 text-yellow-500" />
                <span className="text-xs text-yellow-600 dark:text-yellow-400">
                  Using Fallback Detection
                </span>
              </>
            ) : (
              <>
                <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                <span className="text-xs text-blue-600 dark:text-blue-400">
                  Loading MediaPipe...
                </span>
              </>
            )}
          </div>

          {/* Model Status */}
          <div className="flex items-center gap-2">
            {!isModelLoading ? (
              <>
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span className="text-xs text-green-600 dark:text-green-400">
                  {model ? 'Custom Model' : 'Heuristic Model'}
                </span>
              </>
            ) : (
              <>
                <div className="w-4 h-4 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
                <span className="text-xs text-purple-600 dark:text-purple-400">
                  Loading Model...
                </span>
              </>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Toggle Landmarks */}
          <button
            onClick={toggleLandmarks}
            className={`flex items-center gap-1 px-2 py-1 text-xs rounded transition-colors ${
              showLandmarks 
                ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' 
                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
            }`}
          >
            <Eye className="w-3 h-3" />
            Landmarks
          </button>

          {/* Model Upload */}
          <label className="flex items-center gap-1 px-2 py-1 text-xs bg-gray-100 dark:bg-gray-800 rounded cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
            <Upload className="w-3 h-3" />
            Upload
            <input
              type="file"
              accept=".json,.h5"
              onChange={handleModelUpload}
              className="hidden"
            />
          </label>
        </div>
      </div>

      {/* Camera Container */}
      <div className="relative aspect-video bg-gray-900 rounded-xl overflow-hidden">
        {videoError ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-white bg-gray-900">
            <CameraOff className="w-12 h-12 mb-4 text-red-500" />
            <p className="text-center mb-2 font-medium">Camera Error</p>
            <p className="text-center text-sm text-gray-300 mb-4">{videoError}</p>
            <button
              onClick={handleRetry}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
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
              style={{ transform: 'scaleX(-1)' }}
            />

            {/* Hand Landmarks Overlay */}
            {showLandmarks && isVideoReady && handsResult.landmarks.length > 0 && (
              <HandLandmarksOverlay
                landmarks={handsResult.landmarks}
                videoWidth={videoRef.current?.videoWidth || 640}
                videoHeight={videoRef.current?.videoHeight || 480}
              />
            )}

            {/* Loading Overlay */}
            {!isVideoReady && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-900 bg-opacity-70 text-white">
                <div className="text-center">
                  <Camera className="w-12 h-12 mx-auto mb-2 animate-pulse" />
                  <p>Starting camera...</p>
                </div>
              </div>
            )}

            {/* Instructions */}
            {isVideoReady && !handsResult.isDetected && (
              <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-40 text-white pointer-events-none">
                <div className="text-center p-4">
                  <Hand className="w-8 h-8 mx-auto mb-2 opacity-70" />
                  <p className="text-sm opacity-90">Show your hand and make an ASL sign</p>
                  <p className="text-xs opacity-70 mt-1">Keep your hand steady in the center</p>
                </div>
              </div>
            )}

            {/* Hand Detection Indicator */}
            <AnimatePresence>
              {handsResult.isDetected && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="absolute top-4 right-4 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium shadow-lg"
                >
                  Hand Detected ({Math.round(handsResult.confidence * 100)}%)
                </motion.div>
              )}
            </AnimatePresence>

            {/* Prediction Display */}
            <AnimatePresence>
              {currentPrediction && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.8, y: -20 }}
                  className="absolute top-4 left-4 bg-gradient-to-r from-purple-600 to-purple-700 text-white px-6 py-4 rounded-lg shadow-lg"
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
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-48 border-2 border-dashed border-white opacity-30 rounded-lg"></div>
            </div>
          </>
        )}
      </div>

      {/* Status Information */}
      <div className="mt-4 text-center text-sm">
        {videoError ? (
          <div className="flex items-center justify-center text-red-500">
            <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
            Camera unavailable
          </div>
        ) : handsResult.isDetected ? (
          <div className="flex items-center justify-center text-green-500">
            <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></span>
            Analyzing ASL gesture... ({handsResult.landmarks[0]?.length || 0} landmarks detected)
          </div>
        ) : isVideoReady ? (
          <div className="flex items-center justify-center text-yellow-500">
            <span className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></span>
            Position your hand in the dashed area
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
          <p>• MediaPipe Hands: {isMediaPipeReady ? '✅ Active' : '⚠️ Fallback mode'}</p>
          <p>• TensorFlow.js: {!isModelLoading ? '✅ Ready' : '⏳ Loading'}</p>
          <p>• Model: {model ? '✅ Custom model loaded' : '🔄 Using heuristic classification'}</p>
          <p>• Hand landmarks: {handsResult.landmarks[0]?.length || 0}/21 detected</p>
          <p>• Features extracted: {handsResult.landmarks[0] ? '63 landmark + 10 distance = 73 total' : 'None'}</p>
          <p>• Stream status: {stream ? '🟢 Active' : '🔴 Inactive'}</p>
        </div>
      </div>
    </div>
  );
};

export default ASLRecognitionCamera;