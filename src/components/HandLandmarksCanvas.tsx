import React, { useRef, useEffect } from 'react';
import { HandLandmark } from '../hooks/useHandpose';

interface HandLandmarksCanvasProps {
  landmarks: HandLandmark[];
  videoWidth: number;
  videoHeight: number;
  className?: string;
}

const HandLandmarksCanvas: React.FC<HandLandmarksCanvasProps> = ({
  landmarks,
  videoWidth,
  videoHeight,
  className = ''
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Hand connections for drawing skeleton
  const HAND_CONNECTIONS = [
    [0, 1], [1, 2], [2, 3], [3, 4], // Thumb
    [0, 5], [5, 6], [6, 7], [7, 8], // Index finger
    [0, 9], [9, 10], [10, 11], [11, 12], // Middle finger
    [0, 13], [13, 14], [14, 15], [15, 16], // Ring finger
    [0, 17], [17, 18], [18, 19], [19, 20], // Pinky
    [5, 9], [9, 13], [13, 17] // Palm connections
  ];

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    canvas.width = videoWidth;
    canvas.height = videoHeight;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (landmarks.length === 21) {
      // Draw connections
      ctx.strokeStyle = '#00ff41';
      ctx.lineWidth = 2;
      ctx.beginPath();

      HAND_CONNECTIONS.forEach(([start, end]) => {
        const startPoint = landmarks[start];
        const endPoint = landmarks[end];

        const startX = startPoint.x * canvas.width;
        const startY = startPoint.y * canvas.height;
        const endX = endPoint.x * canvas.width;
        const endY = endPoint.y * canvas.height;

        ctx.moveTo(startX, startY);
        ctx.lineTo(endX, endY);
      });

      ctx.stroke();

      // Draw landmark points
      landmarks.forEach((landmark, index) => {
        const x = landmark.x * canvas.width;
        const y = landmark.y * canvas.height;

        // Different colors for different parts of the hand
        if (index === 0) {
          // Wrist - larger red circle
          ctx.fillStyle = '#ff0040';
          ctx.beginPath();
          ctx.arc(x, y, 8, 0, 2 * Math.PI);
          ctx.fill();
        } else if ([4, 8, 12, 16, 20].includes(index)) {
          // Fingertips - blue circles
          ctx.fillStyle = '#0080ff';
          ctx.beginPath();
          ctx.arc(x, y, 6, 0, 2 * Math.PI);
          ctx.fill();
        } else {
          // Other joints - green circles
          ctx.fillStyle = '#00ff41';
          ctx.beginPath();
          ctx.arc(x, y, 4, 0, 2 * Math.PI);
          ctx.fill();
        }

        // Add landmark index for debugging (optional)
        if (process.env.NODE_ENV === 'development') {
          ctx.fillStyle = '#ffffff';
          ctx.font = '12px Arial';
          ctx.fillText(index.toString(), x + 10, y - 10);
        }
      });
    }
  }, [landmarks, videoWidth, videoHeight]);

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 pointer-events-none ${className}`}
      style={{ transform: 'scaleX(-1)' }} // Mirror to match video
    />
  );
};

export default HandLandmarksCanvas;