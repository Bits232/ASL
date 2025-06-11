import React, { useRef, useEffect } from 'react';

interface HandLandmark {
  x: number;
  y: number;
  z: number;
}

interface HandLandmarksOverlayProps {
  landmarks: HandLandmark[][];
  videoWidth: number;
  videoHeight: number;
  className?: string;
}

const HandLandmarksOverlay: React.FC<HandLandmarksOverlayProps> = ({
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

    // Draw landmarks for each detected hand
    landmarks.forEach((handLandmarks) => {
      if (handLandmarks.length === 21) {
        // Draw connections
        ctx.strokeStyle = '#00ff00';
        ctx.lineWidth = 2;
        ctx.beginPath();

        HAND_CONNECTIONS.forEach(([start, end]) => {
          const startPoint = handLandmarks[start];
          const endPoint = handLandmarks[end];

          ctx.moveTo(startPoint.x * canvas.width, startPoint.y * canvas.height);
          ctx.lineTo(endPoint.x * canvas.width, endPoint.y * canvas.height);
        });

        ctx.stroke();

        // Draw landmark points
        handLandmarks.forEach((landmark, index) => {
          const x = landmark.x * canvas.width;
          const y = landmark.y * canvas.height;

          // Different colors for different parts of the hand
          if (index === 0) {
            // Wrist - larger red circle
            ctx.fillStyle = '#ff0000';
            ctx.beginPath();
            ctx.arc(x, y, 6, 0, 2 * Math.PI);
            ctx.fill();
          } else if ([4, 8, 12, 16, 20].includes(index)) {
            // Fingertips - blue circles
            ctx.fillStyle = '#0066ff';
            ctx.beginPath();
            ctx.arc(x, y, 5, 0, 2 * Math.PI);
            ctx.fill();
          } else {
            // Other joints - green circles
            ctx.fillStyle = '#00ff00';
            ctx.beginPath();
            ctx.arc(x, y, 3, 0, 2 * Math.PI);
            ctx.fill();
          }

          // Add landmark index labels for debugging
          ctx.fillStyle = '#ffffff';
          ctx.font = '10px Arial';
          ctx.fillText(index.toString(), x + 8, y - 8);
        });
      }
    });
  }, [landmarks, videoWidth, videoHeight]);

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 pointer-events-none ${className}`}
      style={{ transform: 'scaleX(-1)' }} // Mirror to match video
    />
  );
};

export default HandLandmarksOverlay;