import { useRef, useEffect, useState, useCallback } from 'react';
import * as tf from '@tensorflow/tfjs';
import * as handpose from '@tensorflow-models/handpose';

export interface HandLandmark {
  x: number;
  y: number;
  z?: number;
}

export interface HandposeResult {
  landmarks: HandLandmark[];
  isDetected: boolean;
  confidence: number;
}

export const useHandpose = (videoElement: HTMLVideoElement | null) => {
  const [handposeResult, setHandposeResult] = useState<HandposeResult>({
    landmarks: [],
    isDetected: false,
    confidence: 0
  });
  const [isModelLoaded, setIsModelLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const modelRef = useRef<handpose.HandPose | null>(null);
  const animationRef = useRef<number | null>(null);
  const isDetectingRef = useRef(false);

  // Load Handpose model
  const loadModel = useCallback(async () => {
    try {
      setError(null);
      
      // Initialize TensorFlow.js
      await tf.ready();
      
      // Set backend to WebGL for better performance
      if (tf.getBackend() !== 'webgl') {
        await tf.setBackend('webgl');
      }
      
      console.log('TensorFlow.js backend:', tf.getBackend());
      
      // Load Handpose model
      const model = await handpose.load();
      modelRef.current = model;
      setIsModelLoaded(true);
      
      console.log('Handpose model loaded successfully');
    } catch (err) {
      console.error('Error loading Handpose model:', err);
      setError('Failed to load hand detection model');
      setIsModelLoaded(false);
    }
  }, []);

  // Detect hands in video frame
  const detectHands = useCallback(async () => {
    if (!modelRef.current || !videoElement || isDetectingRef.current) {
      return;
    }

    if (videoElement.readyState !== 4) {
      return;
    }

    try {
      isDetectingRef.current = true;
      
      const predictions = await modelRef.current.estimateHands(videoElement);
      
      if (predictions.length > 0) {
        const hand = predictions[0];
        const landmarks = hand.landmarks.map((point: number[]) => ({
          x: point[0] / videoElement.videoWidth,
          y: point[1] / videoElement.videoHeight,
          z: point[2] || 0
        }));

        setHandposeResult({
          landmarks,
          isDetected: true,
          confidence: hand.handInViewConfidence || 0.8
        });
      } else {
        setHandposeResult({
          landmarks: [],
          isDetected: false,
          confidence: 0
        });
      }
    } catch (err) {
      console.error('Error detecting hands:', err);
      setHandposeResult({
        landmarks: [],
        isDetected: false,
        confidence: 0
      });
    } finally {
      isDetectingRef.current = false;
    }
  }, [videoElement]);

  // Animation loop for continuous detection
  const startDetection = useCallback(() => {
    const detect = async () => {
      await detectHands();
      animationRef.current = requestAnimationFrame(detect);
    };
    
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    
    detect();
  }, [detectHands]);

  // Stop detection
  const stopDetection = useCallback(() => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }
    isDetectingRef.current = false;
  }, []);

  // Start detection when model and video are ready
  useEffect(() => {
    if (isModelLoaded && videoElement) {
      startDetection();
    } else {
      stopDetection();
    }

    return () => {
      stopDetection();
    };
  }, [isModelLoaded, videoElement, startDetection, stopDetection]);

  // Load model on mount
  useEffect(() => {
    loadModel();

    return () => {
      stopDetection();
      if (modelRef.current) {
        modelRef.current = null;
      }
    };
  }, [loadModel, stopDetection]);

  return {
    handposeResult,
    isModelLoaded,
    error,
    loadModel
  };
};