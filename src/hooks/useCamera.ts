import { useState, useRef, useCallback, useEffect } from 'react';
import { captureVideoFrame } from '../services/imageProcessor';

export interface CameraHookState {
  isActive: boolean;
  hasPermission: boolean | null;
  error: string | null;
  facingMode: 'environment' | 'user';
  availableCameras: MediaDeviceInfo[];
}

export function useCamera() {
  const [isActive, setIsActive] = useState(false);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [availableCameras, setAvailableCameras] = useState<MediaDeviceInfo[]>([]);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Lista câmeras disponíveis
  const listCameras = useCallback(async () => {
    try {
      if (!navigator.mediaDevices?.enumerateDevices) return;
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter((device) => device.kind === 'videoinput');
      setAvailableCameras(videoDevices);
    } catch (err) {
      console.warn('Não foi possível listar câmeras:', err);
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsActive(false);
  }, []);

  const startCamera = useCallback(async (desiredFacing: 'environment' | 'user' = facingMode) => {
    stopCamera();
    setError(null);

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setError('Seu navegador não possui suporte para câmera direta. Você pode carregar uma foto da galeria.');
      setHasPermission(false);
      return;
    }

    try {
      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: desiredFacing === 'environment' ? { ideal: 'environment' } : 'user',
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        },
        audio: false
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }

      setFacingMode(desiredFacing);
      setHasPermission(true);
      setIsActive(true);
      await listCameras();
    } catch (err: unknown) {
      console.error('Erro ao abrir a câmera:', err);
      const domException = err as DOMException;
      if (domException.name === 'NotAllowedError' || domException.name === 'PermissionDeniedError') {
        setError('Permissão da câmera foi negada. Permita o acesso nas configurações ou selecione uma foto da galeria.');
      } else if (domException.name === 'NotFoundError' || domException.name === 'DevicesNotFoundError') {
        setError('Nenhuma câmera foi encontrada no dispositivo.');
      } else {
        setError('Não foi possível iniciar a câmera. Tente utilizar o upload de fotos.');
      }
      setHasPermission(false);
      setIsActive(false);
    }
  }, [facingMode, listCameras, stopCamera]);

  const toggleFacingMode = useCallback(async () => {
    const nextMode = facingMode === 'environment' ? 'user' : 'environment';
    await startCamera(nextMode);
  }, [facingMode, startCamera]);

  const capturePhoto = useCallback((): string | null => {
    if (!videoRef.current || !isActive) {
      return null;
    }
    try {
      return captureVideoFrame(videoRef.current, {
        maxWidth: 1080,
        maxHeight: 1350,
        quality: 0.85,
        format: 'image/jpeg'
      });
    } catch (err) {
      console.error('Erro ao capturar foto do vídeo:', err);
      setError('Erro ao capturar imagem da câmera.');
      return null;
    }
  }, [isActive]);

  // Garante que para a câmera quando o componente desmontar
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  return {
    videoRef,
    isActive,
    hasPermission,
    error,
    facingMode,
    availableCameras,
    startCamera,
    stopCamera,
    toggleFacingMode,
    capturePhoto,
  };
}
