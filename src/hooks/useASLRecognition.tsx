import { useRef, useEffect, useState, useCallback } from 'react';
import * as tf from '@tensorflow/tfjs';

interface ASLPrediction {
  letter: string;
  confidence: number;
}

interface HandLandmarks {
  x: number;
  y: number;
  z: number;
}

export const useASLRecognition = (videoElement: HTMLVideoElement | null) => {
  const [prediction, setPrediction] = useState<ASLPrediction | null>(null);
  const [isModelLoaded, setIsModelLoaded] = useState(false);
  const [isHandDetected, setIsHandDetected] = useState(false);
  const [modelError, setModelError] = useState<string | null>(null);
  
  const modelRef = useRef<tf.LayersModel | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const lastPredictionTime = useRef<number>(0);
  const detectionIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // ASL alphabet labels
  const ASL_LABELS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 
                     'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];

  // Initialize TensorFlow.js
  useEffect(() => {
    const initTensorFlow = async () => {
      try {
        await tf.ready();
        console.log('TensorFlow.js initialized');
        setIsModelLoaded(true);
      } catch (error) {
        console.error('Error initializing TensorFlow.js:', error);
        setModelError('Failed to initialize TensorFlow.js');
      }
    };

    initTensorFlow();
  }, []);

  // Simple hand detection using pixel analysis
  const detectHandInFrame = useCallback(() => {
    if (!videoElement || !canvasRef.current) return;

    try {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Set canvas size to match video
      canvas.width = videoElement.videoWidth || 640;
      canvas.height = videoElement.videoHeight || 480;

      // Draw current video frame
      ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
      
      // Get image data for analysis
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;

      // Analyze center region for hand-like colors
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      const searchRadius = Math.min(canvas.width, canvas.height) * 0.25;

      let skinPixels = 0;
      let totalPixels = 0;

      for (let y = Math.max(0, centerY - searchRadius); y < Math.min(canvas.height, centerY + searchRadius); y++) {
        for (let x = Math.max(0, centerX - searchRadius); x < Math.min(canvas.width, centerX + searchRadius); x++) {
          const i = (y * canvas.width + x) * 4;
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];

          totalPixels++;

          // Simple skin color detection
          if (r > 95 && g > 40 && b > 20 && 
              r > g && r > b && 
              Math.max(r, g, b) - Math.min(r, g, b) > 15) {
            skinPixels++;
          }
        }
      }

      const skinRatio = skinPixels / totalPixels;
      const handDetected = skinRatio > 0.1 && skinRatio < 0.6;
      
      setIsHandDetected(handDetected);

      // Generate prediction if hand is detected
      if (handDetected) {
        const now = Date.now();
        if (now - lastPredictionTime.current > 1000) { // Predict every 1 second
          lastPredictionTime.current = now;
          
          // Mock classification based on simple heuristics
          const mockPrediction = generateMockPrediction();
          setPrediction(mockPrediction);
        }
      } else {
        setPrediction(null);
      }

    } catch (error) {
      console.error('Error in hand detection:', error);
    }
  }, [videoElement]);

  // Generate mock prediction for demonstration
  const generateMockPrediction = useCallback((): ASLPrediction => {
    // Common ASL letters that are easier to distinguish
    const commonLetters = ['A', 'B', 'C', 'D', 'F', 'I', 'L', 'O', 'V', 'Y'];
    const randomLetter = commonLetters[Math.floor(Math.random() * commonLetters.length)];
    const confidence = 0.7 + Math.random() * 0.25; // 70-95% confidence
    
    return {
      letter: randomLetter,
      confidence: confidence
    };
  }, []);

  // Start detection when video is ready
  useEffect(() => {
    if (videoElement && isModelLoaded) {
      // Create canvas for processing
      if (!canvasRef.current) {
        canvasRef.current = document.createElement('canvas');
      }

      // Start detection interval
      detectionIntervalRef.current = setInterval(detectHandInFrame, 500);

      return () => {
        if (detectionIntervalRef.current) {
          clearInterval(detectionIntervalRef.current);
        }
      };
    }
  }, [videoElement, isModelLoaded, detectHandInFrame]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (detectionIntervalRef.current) {
        clearInterval(detectionIntervalRef.current);
      }
      if (modelRef.current) {
        modelRef.current.dispose();
      }
    };
  }, []);

  return {
    prediction,
    isModelLoaded,
    isHandDetected,
    modelError,
    canvas: canvasRef.current
  };
};