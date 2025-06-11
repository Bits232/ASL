import { useRef, useState, useEffect, useCallback } from 'react';
import Webcam from 'react-webcam';

export const useWebcam = () => {
  const webcamRef = useRef<Webcam | null>(null);
  const [isWebcamReady, setIsWebcamReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleUserMedia = useCallback(() => {
    setIsWebcamReady(true);
    setError(null);
    console.log('Webcam ready');
  }, []);

  const handleUserMediaError = useCallback((error: string | DOMException) => {
    setIsWebcamReady(false);
    const errorMessage = typeof error === 'string' ? error : error.message;
    setError(errorMessage);
    console.error('Webcam error:', errorMessage);
  }, []);

  const getVideoConstraints = useCallback(() => {
    return {
      width: { ideal: 640 },
      height: { ideal: 480 },
      facingMode: 'user',
      frameRate: { ideal: 15, max: 30 }, // Limit frame rate to reduce load
    };
  }, []);

  const capture = useCallback(() => {
    if (webcamRef.current) {
      const imageSrc = webcamRef.current.getScreenshot();
      return imageSrc;
    }
    return null;
  }, []);

  // Cleanup function to properly stop webcam
  const stopWebcam = useCallback(() => {
    if (webcamRef.current?.video) {
      const video = webcamRef.current.video;
      if (video.srcObject) {
        const tracks = (video.srcObject as MediaStream).getTracks();
        tracks.forEach(track => {
          track.stop();
          console.log('Stopped webcam track:', track.kind);
        });
        video.srcObject = null;
      }
    }
    setIsWebcamReady(false);
  }, []);

  useEffect(() => {
    // Cleanup webcam on unmount
    return () => {
      stopWebcam();
    };
  }, [stopWebcam]);

  return {
    webcamRef,
    isWebcamReady,
    error,
    handleUserMedia,
    handleUserMediaError,
    getVideoConstraints,
    capture,
    stopWebcam,
  };
};