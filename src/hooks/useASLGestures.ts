import { useCallback } from 'react';
import { GestureEstimator, Finger, FingerCurl, FingerDirection } from 'fingerpose';
import { HandLandmark } from './useHandpose';

export interface ASLPrediction {
  letter: string;
  confidence: number;
}

export const useASLGestures = () => {
  // Create gesture estimator
  const createGestureEstimator = useCallback(() => {
    const estimator = new GestureEstimator([
      // Letter A
      {
        name: 'A',
        curls: [
          [Finger.Thumb, FingerCurl.HalfCurl],
          [Finger.Index, FingerCurl.FullCurl],
          [Finger.Middle, FingerCurl.FullCurl],
          [Finger.Ring, FingerCurl.FullCurl],
          [Finger.Pinky, FingerCurl.FullCurl]
        ],
        directions: [
          [Finger.Thumb, FingerDirection.VerticalUp],
          [Finger.Index, FingerDirection.VerticalUp],
          [Finger.Middle, FingerDirection.VerticalUp],
          [Finger.Ring, FingerDirection.VerticalUp],
          [Finger.Pinky, FingerDirection.VerticalUp]
        ]
      },
      
      // Letter B
      {
        name: 'B',
        curls: [
          [Finger.Thumb, FingerCurl.HalfCurl],
          [Finger.Index, FingerCurl.NoCurl],
          [Finger.Middle, FingerCurl.NoCurl],
          [Finger.Ring, FingerCurl.NoCurl],
          [Finger.Pinky, FingerCurl.NoCurl]
        ],
        directions: [
          [Finger.Index, FingerDirection.VerticalUp],
          [Finger.Middle, FingerDirection.VerticalUp],
          [Finger.Ring, FingerDirection.VerticalUp],
          [Finger.Pinky, FingerDirection.VerticalUp]
        ]
      },

      // Letter C
      {
        name: 'C',
        curls: [
          [Finger.Thumb, FingerCurl.HalfCurl],
          [Finger.Index, FingerCurl.HalfCurl],
          [Finger.Middle, FingerCurl.HalfCurl],
          [Finger.Ring, FingerCurl.HalfCurl],
          [Finger.Pinky, FingerCurl.HalfCurl]
        ],
        directions: [
          [Finger.Thumb, FingerDirection.DiagonalUpRight],
          [Finger.Index, FingerDirection.DiagonalUpLeft],
          [Finger.Middle, FingerDirection.VerticalUp],
          [Finger.Ring, FingerDirection.VerticalUp],
          [Finger.Pinky, FingerDirection.DiagonalUpRight]
        ]
      },

      // Letter D
      {
        name: 'D',
        curls: [
          [Finger.Thumb, FingerCurl.HalfCurl],
          [Finger.Index, FingerCurl.NoCurl],
          [Finger.Middle, FingerCurl.FullCurl],
          [Finger.Ring, FingerCurl.FullCurl],
          [Finger.Pinky, FingerCurl.FullCurl]
        ],
        directions: [
          [Finger.Index, FingerDirection.VerticalUp],
          [Finger.Middle, FingerDirection.VerticalUp],
          [Finger.Ring, FingerDirection.VerticalUp],
          [Finger.Pinky, FingerDirection.VerticalUp]
        ]
      },

      // Letter F
      {
        name: 'F',
        curls: [
          [Finger.Thumb, FingerCurl.HalfCurl],
          [Finger.Index, FingerCurl.FullCurl],
          [Finger.Middle, FingerCurl.NoCurl],
          [Finger.Ring, FingerCurl.NoCurl],
          [Finger.Pinky, FingerCurl.NoCurl]
        ],
        directions: [
          [Finger.Middle, FingerDirection.VerticalUp],
          [Finger.Ring, FingerDirection.VerticalUp],
          [Finger.Pinky, FingerDirection.VerticalUp]
        ]
      },

      // Letter I
      {
        name: 'I',
        curls: [
          [Finger.Thumb, FingerCurl.HalfCurl],
          [Finger.Index, FingerCurl.FullCurl],
          [Finger.Middle, FingerCurl.FullCurl],
          [Finger.Ring, FingerCurl.FullCurl],
          [Finger.Pinky, FingerCurl.NoCurl]
        ],
        directions: [
          [Finger.Pinky, FingerDirection.VerticalUp]
        ]
      },

      // Letter L
      {
        name: 'L',
        curls: [
          [Finger.Thumb, FingerCurl.NoCurl],
          [Finger.Index, FingerCurl.NoCurl],
          [Finger.Middle, FingerCurl.FullCurl],
          [Finger.Ring, FingerCurl.FullCurl],
          [Finger.Pinky, FingerCurl.FullCurl]
        ],
        directions: [
          [Finger.Thumb, FingerDirection.HorizontalRight],
          [Finger.Index, FingerDirection.VerticalUp]
        ]
      },

      // Letter O
      {
        name: 'O',
        curls: [
          [Finger.Thumb, FingerCurl.HalfCurl],
          [Finger.Index, FingerCurl.HalfCurl],
          [Finger.Middle, FingerCurl.HalfCurl],
          [Finger.Ring, FingerCurl.HalfCurl],
          [Finger.Pinky, FingerCurl.HalfCurl]
        ],
        directions: [
          [Finger.Thumb, FingerDirection.DiagonalUpLeft],
          [Finger.Index, FingerDirection.DiagonalUpRight],
          [Finger.Middle, FingerDirection.VerticalUp],
          [Finger.Ring, FingerDirection.VerticalUp],
          [Finger.Pinky, FingerDirection.DiagonalUpLeft]
        ]
      },

      // Letter V
      {
        name: 'V',
        curls: [
          [Finger.Thumb, FingerCurl.HalfCurl],
          [Finger.Index, FingerCurl.NoCurl],
          [Finger.Middle, FingerCurl.NoCurl],
          [Finger.Ring, FingerCurl.FullCurl],
          [Finger.Pinky, FingerCurl.FullCurl]
        ],
        directions: [
          [Finger.Index, FingerDirection.VerticalUp],
          [Finger.Middle, FingerDirection.VerticalUp]
        ]
      },

      // Letter Y
      {
        name: 'Y',
        curls: [
          [Finger.Thumb, FingerCurl.NoCurl],
          [Finger.Index, FingerCurl.FullCurl],
          [Finger.Middle, FingerCurl.FullCurl],
          [Finger.Ring, FingerCurl.FullCurl],
          [Finger.Pinky, FingerCurl.NoCurl]
        ],
        directions: [
          [Finger.Thumb, FingerDirection.DiagonalUpRight],
          [Finger.Pinky, FingerDirection.DiagonalUpLeft]
        ]
      }
    ]);

    return estimator;
  }, []);

  // Predict ASL gesture from landmarks
  const predictGesture = useCallback((landmarks: HandLandmark[]): ASLPrediction => {
    try {
      if (landmarks.length !== 21) {
        throw new Error('Expected 21 hand landmarks');
      }

      // Convert landmarks to the format expected by Fingerpose
      const landmarkArray = landmarks.map(point => [
        point.x * 640, // Scale to video dimensions
        point.y * 480,
        point.z || 0
      ]);

      const estimator = createGestureEstimator();
      const estimate = estimator.estimate(landmarkArray, 8.5); // Confidence threshold

      if (estimate.gestures.length > 0) {
        const bestGesture = estimate.gestures[0];
        return {
          letter: bestGesture.name,
          confidence: bestGesture.score
        };
      } else {
        // Fallback to heuristic classification
        return generateHeuristicPrediction(landmarks);
      }
    } catch (error) {
      console.error('Error predicting gesture:', error);
      return generateHeuristicPrediction(landmarks);
    }
  }, [createGestureEstimator]);

  // Fallback heuristic prediction
  const generateHeuristicPrediction = useCallback((landmarks: HandLandmark[]): ASLPrediction => {
    try {
      // Simple heuristic based on finger positions
      const thumbTip = landmarks[4];
      const indexTip = landmarks[8];
      const middleTip = landmarks[12];
      const ringTip = landmarks[16];
      const pinkyTip = landmarks[20];
      const wrist = landmarks[0];

      // Calculate distances from wrist
      const getDistance = (p1: HandLandmark, p2: HandLandmark) => 
        Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));

      const thumbDist = getDistance(wrist, thumbTip);
      const indexDist = getDistance(wrist, indexTip);
      const middleDist = getDistance(wrist, middleTip);
      const ringDist = getDistance(wrist, ringTip);
      const pinkyDist = getDistance(wrist, pinkyTip);

      const avgDist = (thumbDist + indexDist + middleDist + ringDist + pinkyDist) / 5;
      const threshold = avgDist * 0.7;

      const extendedFingers = [
        thumbDist > threshold,
        indexDist > threshold,
        middleDist > threshold,
        ringDist > threshold,
        pinkyDist > threshold
      ];

      const extendedCount = extendedFingers.filter(Boolean).length;

      // Simple classification rules
      if (extendedCount === 0) {
        return { letter: 'A', confidence: 0.7 };
      } else if (extendedCount === 1) {
        if (extendedFingers[1]) return { letter: 'D', confidence: 0.8 };
        if (extendedFingers[4]) return { letter: 'I', confidence: 0.8 };
        return { letter: 'A', confidence: 0.6 };
      } else if (extendedCount === 2) {
        if (extendedFingers[1] && extendedFingers[2]) return { letter: 'V', confidence: 0.8 };
        if (extendedFingers[0] && extendedFingers[1]) return { letter: 'L', confidence: 0.8 };
        if (extendedFingers[0] && extendedFingers[4]) return { letter: 'Y', confidence: 0.8 };
        return { letter: 'V', confidence: 0.6 };
      } else if (extendedCount === 4) {
        return { letter: 'B', confidence: 0.7 };
      } else {
        return { letter: 'B', confidence: 0.6 };
      }
    } catch (error) {
      console.error('Error in heuristic prediction:', error);
      return { letter: 'A', confidence: 0.5 };
    }
  }, []);

  return {
    predictGesture
  };
};