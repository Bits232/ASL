import { useRef, useState, useCallback, useEffect } from 'react';

export const useWebcam = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const startWebcam = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Stop any existing stream
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }

      const constraints: MediaStreamConstraints = {
        video: {
          width: { ideal: 640, max: 1280 },
          height: { ideal: 480, max: 720 },
          facingMode: 'user',
          frameRate: { ideal: 30, max: 30 }
        }
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        
        // Wait for video to be ready
        await new Promise<void>((resolve, reject) => {
          if (!videoRef.current) {
            reject(new Error('Video element not available'));
            return;
          }

          const video = videoRef.current;
          
          const handleLoadedMetadata = () => {
            video.removeEventListener('loadedmetadata', handleLoadedMetadata);
            video.removeEventListener('error', handleError);
            resolve();
          };

          const handleError = (e: Event) => {
            video.removeEventListener('loadedmetadata', handleLoadedMetadata);
            video.removeEventListener('error', handleError);
            reject(new Error('Video failed to load'));
          };

          video.addEventListener('loadedmetadata', handleLoadedMetadata);
          video.addEventListener('error', handleError);
        });

        // Play the video
        await videoRef.current.play();
        setIsReady(true);
      }
    } catch (err) {
      console.error('Error starting webcam:', err);
      let errorMessage = 'Failed to access webcam';
      
      if (err instanceof Error) {
        if (err.name === 'NotAllowedError') {
          errorMessage = 'Camera access denied. Please allow camera permissions.';
        } else if (err.name === 'NotFoundError') {
          errorMessage = 'No camera found. Please connect a camera.';
        } else if (err.name === 'NotReadableError') {
          errorMessage = 'Camera is being used by another application.';
        }
      }
      
      setError(errorMessage);
      setIsReady(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const stopWebcam = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    
    setIsReady(false);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopWebcam();
    };
  }, [stopWebcam]);

  return {
    videoRef,
    isReady,
    error,
    isLoading,
    startWebcam,
    stopWebcam
  };
};