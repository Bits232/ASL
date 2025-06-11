import { useRef, useEffect, useState, useCallback } from 'react';
import { Hands, Results } from '@mediapipe/hands';
import { Camera } from '@mediapipe/camera_utils';

interface HandLandmark {
  x: number;
  y: number;
  z: number;
}

interface MediaPipeHandsResult {
  landmarks: HandLandmark[][];
  isDetected: boolean;
  confidence: number;
}

export const useMediaPipeHands = (videoElement: HTMLVideoElement | null) => {
  const [handsResult, setHandsResult] = useState<MediaPipeHandsResult>({
    landmarks: [],
    isDetected: false,
    confidence: 0
  });
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const handsRef = useRef<Hands | null>(null);
  const cameraRef = useRef<Camera | null>(null);

  // Initialize MediaPipe Hands
  const initializeMediaPipe = useCallback(async () => {
    if (!videoElement) return;

    try {
      // Initialize Hands
      const hands = new Hands({
        locateFile: (file) => {
          return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
        }
      });

      hands.setOptions({
        maxNumHands: 1,
        modelComplexity: 1,
        minDetectionConfidence: 0.7,
        minTrackingConfidence: 0.5
      });

      hands.onResults((results: Results) => {
        if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
          const landmarks = results.multiHandLandmarks[0].map(landmark => ({
            x: landmark.x,
            y: landmark.y,
            z: landmark.z || 0
          }));

          setHandsResult({
            landmarks: [landmarks],
            isDetected: true,
            confidence: results.multiHandedness?.[0]?.score || 0.8
          });
        } else {
          setHandsResult({
            landmarks: [],
            isDetected: false,
            confidence: 0
          });
        }
      });

      // Initialize Camera
      const camera = new Camera(videoElement, {
        onFrame: async () => {
          if (handsRef.current) {
            await handsRef.current.send({ image: videoElement });
          }
        },
        width: 640,
        height: 480
      });

      handsRef.current = hands;
      cameraRef.current = camera;

      await camera.start();
      setIsInitialized(true);
      setError(null);

    } catch (err) {
      console.error('Error initializing MediaPipe:', err);
      setError('Failed to initialize hand tracking. Using fallback detection.');
      setIsInitialized(false);
    }
  }, [videoElement]);

  // Initialize when video element is ready
  useEffect(() => {
    if (videoElement && videoElement.readyState >= 2) {
      initializeMediaPipe();
    }

    return () => {
      if (cameraRef.current) {
        cameraRef.current.stop();
      }
      if (handsRef.current) {
        handsRef.current.close();
      }
    };
  }, [videoElement, initializeMediaPipe]);

  return {
    handsResult,
    isInitialized,
    error
  };
};