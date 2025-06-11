import { useState, useEffect, useRef, useCallback } from 'react';
import { HandDetection } from '../types';
import { detectSign } from '../data/mockSignData';

export const useHandDetection = (webcamRef: React.RefObject<any>) => {
  const [handDetection, setHandDetection] = useState<HandDetection>({
    isDetected: false,
    confidence: 0,
  });
  const [detectedLetter, setDetectedLetter] = useState<string | null>(null);
  const [letterConfidence, setLetterConfidence] = useState<number>(0);
  const detectionIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastDetectionRef = useRef<number>(0);
  const previousFrameRef = useRef<ImageData | null>(null);

  // More sophisticated hand detection
  const detectHandInFrame = useCallback(() => {
    if (!webcamRef.current?.video) return;

    const video = webcamRef.current.video;
    if (video.readyState !== 4) return;

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = Math.min(video.videoWidth || 640, 320); // Reduce resolution for performance
    canvas.height = Math.min(video.videoHeight || 480, 240);

    try {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;

      // Focus on the center area where hands are typically shown
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      const searchRadius = Math.min(canvas.width, canvas.height) * 0.3;

      let handPixels = 0;
      let motionPixels = 0;
      let totalSearchPixels = 0;

      // Analyze motion if we have a previous frame
      let hasMotion = false;
      if (previousFrameRef.current) {
        const prevData = previousFrameRef.current.data;
        
        for (let y = Math.max(0, centerY - searchRadius); y < Math.min(canvas.height, centerY + searchRadius); y++) {
          for (let x = Math.max(0, centerX - searchRadius); x < Math.min(canvas.width, centerX + searchRadius); x++) {
            const i = (y * canvas.width + x) * 4;
            totalSearchPixels++;

            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];

            // Check for motion (difference from previous frame)
            const prevR = prevData[i];
            const prevG = prevData[i + 1];
            const prevB = prevData[i + 2];
            
            const motionDiff = Math.abs(r - prevR) + Math.abs(g - prevG) + Math.abs(b - prevB);
            if (motionDiff > 30) { // Threshold for motion detection
              motionPixels++;
            }

            // Improved skin detection (more restrictive)
            const isValidSkin = (
              r > 95 && g > 40 && b > 20 && // Basic skin color range
              r > g && r > b && // Red dominance
              Math.max(r, g, b) - Math.min(r, g, b) > 15 && // Color variation
              Math.abs(r - g) > 15 && // Red-green difference
              r < 250 && g < 250 && b < 250 // Not too bright (avoid overexposure)
            );

            // Additional check: avoid face detection by checking for hand-like proportions
            // Hands typically have more varied color distribution than faces
            if (isValidSkin) {
              // Check surrounding pixels for hand-like characteristics
              let colorVariation = 0;
              const checkRadius = 3;
              
              for (let dy = -checkRadius; dy <= checkRadius; dy++) {
                for (let dx = -checkRadius; dx <= checkRadius; dx++) {
                  const checkX = x + dx;
                  const checkY = y + dy;
                  
                  if (checkX >= 0 && checkX < canvas.width && checkY >= 0 && checkY < canvas.height) {
                    const checkI = (checkY * canvas.width + checkX) * 4;
                    const checkR = data[checkI];
                    const checkG = data[checkI + 1];
                    const checkB = data[checkI + 2];
                    
                    colorVariation += Math.abs(r - checkR) + Math.abs(g - checkG) + Math.abs(b - checkB);
                  }
                }
              }
              
              // Hands have more color variation than faces due to fingers, shadows, etc.
              if (colorVariation > 200) {
                handPixels++;
              }
            }
          }
        }

        const motionRatio = motionPixels / totalSearchPixels;
        hasMotion = motionRatio > 0.05; // At least 5% motion in search area
      }

      // Store current frame for next comparison
      previousFrameRef.current = imageData;

      const handRatio = handPixels / totalSearchPixels;
      
      // More restrictive detection criteria
      const isHandDetected = (
        handRatio > 0.08 && // At least 8% hand-like pixels
        handRatio < 0.4 && // But not too much (likely face if > 40%)
        hasMotion && // Must have motion
        handPixels > 50 // Minimum absolute number of hand pixels
      );

      const confidence = isHandDetected ? Math.min(handRatio * 3, 0.9) : 0;

      setHandDetection({
        isDetected: isHandDetected,
        confidence: confidence,
      });

      // Only trigger sign detection with stricter criteria
      const now = Date.now();
      if (isHandDetected && confidence > 0.5 && now - lastDetectionRef.current > 3000) {
        lastDetectionRef.current = now;
        
        // Simulate more realistic sign detection
        detectSign(null).then(({ letter, confidence: letterConf }) => {
          setDetectedLetter(letter);
          setLetterConfidence(letterConf);
        }).catch(error => {
          console.error('Error detecting sign:', error);
        });
      }

    } catch (error) {
      console.error('Error in hand detection:', error);
    }
  }, [webcamRef]);

  useEffect(() => {
    if (!webcamRef.current?.video) return;

    // Start detection interval with lower frequency to reduce false positives
    detectionIntervalRef.current = setInterval(detectHandInFrame, 300); // Check every 300ms

    return () => {
      if (detectionIntervalRef.current) {
        clearInterval(detectionIntervalRef.current);
        detectionIntervalRef.current = null;
      }
    };
  }, [webcamRef, detectHandInFrame]);

  // Clear detected letter after some time
  useEffect(() => {
    if (detectedLetter) {
      const timeout = setTimeout(() => {
        setDetectedLetter(null);
        setLetterConfidence(0);
      }, 4000); // Keep letter visible longer

      return () => clearTimeout(timeout);
    }
  }, [detectedLetter]);

  return { handDetection, detectedLetter, letterConfidence };
};