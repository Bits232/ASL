import { useRef, useEffect, useState, useCallback } from 'react';

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
  
  const handsRef = useRef<any>(null);
  const cameraRef = useRef<any>(null);
  const isInitializingRef = useRef(false);
  const cleanupRef = useRef<(() => void) | null>(null);

  // Cleanup function
  const cleanup = useCallback(() => {
    if (cleanupRef.current) {
      cleanupRef.current();
      cleanupRef.current = null;
    }
    
    if (cameraRef.current) {
      try {
        cameraRef.current.stop();
      } catch (e) {
        console.log('Camera already stopped');
      }
      cameraRef.current = null;
    }
    
    if (handsRef.current) {
      try {
        handsRef.current.close();
      } catch (e) {
        console.log('Hands already closed');
      }
      handsRef.current = null;
    }
    
    isInitializingRef.current = false;
  }, []);

  // Initialize MediaPipe Hands with better error handling
  const initializeMediaPipe = useCallback(async () => {
    if (!videoElement || isInitializingRef.current) return;
    
    // Cleanup any existing instances
    cleanup();
    
    isInitializingRef.current = true;

    try {
      // Dynamic import to avoid loading issues
      const { Hands } = await import('@mediapipe/hands');
      const { Camera } = await import('@mediapipe/camera_utils');

      // Initialize Hands with conservative settings
      const hands = new Hands({
        locateFile: (file) => {
          return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
        }
      });

      hands.setOptions({
        maxNumHands: 1,
        modelComplexity: 0, // Use lighter model
        minDetectionConfidence: 0.8, // Higher threshold
        minTrackingConfidence: 0.7
      });

      let lastResultTime = 0;
      const RESULT_THROTTLE = 200; // Throttle results to every 200ms

      hands.onResults((results: any) => {
        const now = Date.now();
        if (now - lastResultTime < RESULT_THROTTLE) {
          return; // Skip this result to reduce processing load
        }
        lastResultTime = now;

        try {
          if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
            const landmarks = results.multiHandLandmarks[0].map((landmark: any) => ({
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
        } catch (resultError) {
          console.error('Error processing MediaPipe results:', resultError);
        }
      });

      // Initialize Camera with throttling
      let lastFrameTime = 0;
      const FRAME_THROTTLE = 100; // Process every 100ms (10 FPS)

      const camera = new Camera(videoElement, {
        onFrame: async () => {
          const now = Date.now();
          if (now - lastFrameTime < FRAME_THROTTLE) {
            return; // Skip this frame
          }
          lastFrameTime = now;

          try {
            if (handsRef.current && videoElement.readyState >= 2) {
              await handsRef.current.send({ image: videoElement });
            }
          } catch (frameError) {
            console.error('Error processing frame:', frameError);
          }
        },
        width: 640,
        height: 480
      });

      handsRef.current = hands;
      cameraRef.current = camera;

      // Set cleanup function
      cleanupRef.current = () => {
        try {
          if (camera) camera.stop();
          if (hands) hands.close();
        } catch (e) {
          console.log('Cleanup error:', e);
        }
      };

      await camera.start();
      setIsInitialized(true);
      setError(null);
      isInitializingRef.current = false;

    } catch (err) {
      console.error('Error initializing MediaPipe:', err);
      setError('Failed to initialize hand tracking. Using fallback detection.');
      setIsInitialized(false);
      isInitializingRef.current = false;
      
      // Fallback to simple detection
      startFallbackDetection();
    }
  }, [videoElement, cleanup]);

  // Fallback detection using simple computer vision
  const startFallbackDetection = useCallback(() => {
    if (!videoElement) return;

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    let lastDetectionTime = 0;

    const detectHand = () => {
      const now = Date.now();
      if (now - lastDetectionTime < 500) { // Throttle to 2 FPS
        animationId = requestAnimationFrame(detectHand);
        return;
      }
      lastDetectionTime = now;

      try {
        if (videoElement.readyState >= 2) {
          canvas.width = 160; // Very small for performance
          canvas.height = 120;
          
          ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          
          // Simple skin detection
          let skinPixels = 0;
          const data = imageData.data;
          
          for (let i = 0; i < data.length; i += 16) { // Sample every 4th pixel
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];
            
            if (r > 95 && g > 40 && b > 20 && r > g && r > b) {
              skinPixels++;
            }
          }
          
          const skinRatio = skinPixels / (data.length / 16);
          const isDetected = skinRatio > 0.1 && skinRatio < 0.4;
          
          setHandsResult({
            landmarks: isDetected ? [generateMockLandmarks()] : [],
            isDetected,
            confidence: isDetected ? 0.6 : 0
          });
        }
      } catch (error) {
        console.error('Fallback detection error:', error);
      }
      
      animationId = requestAnimationFrame(detectHand);
    };

    detectHand();

    // Cleanup function for fallback
    cleanupRef.current = () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };

    setIsInitialized(true);
  }, [videoElement]);

  // Generate mock landmarks for fallback
  const generateMockLandmarks = (): HandLandmark[] => {
    const landmarks: HandLandmark[] = [];
    for (let i = 0; i < 21; i++) {
      landmarks.push({
        x: 0.3 + Math.random() * 0.4,
        y: 0.3 + Math.random() * 0.4,
        z: Math.random() * 0.1
      });
    }
    return landmarks;
  };

  // Initialize when video element is ready
  useEffect(() => {
    if (videoElement && videoElement.readyState >= 2) {
      const timeoutId = setTimeout(() => {
        initializeMediaPipe();
      }, 500); // Small delay to ensure video is stable

      return () => {
        clearTimeout(timeoutId);
      };
    }
  }, [videoElement, initializeMediaPipe]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanup();
    };
  }, [cleanup]);

  return {
    handsResult,
    isInitialized,
    error
  };
};