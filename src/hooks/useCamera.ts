import { useState, useCallback } from 'react';
import { Camera, CameraResultType, CameraSource, Photo } from '@capacitor/camera';
import { Capacitor } from '@capacitor/core';

export interface CameraPhoto {
  dataUrl: string;
  format: string;
  webPath?: string;
}

export function useCamera() {
  const [photo, setPhoto] = useState<CameraPhoto | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isNative = Capacitor.isNativePlatform();

  const takePhoto = useCallback(async (): Promise<CameraPhoto | null> => {
    setIsLoading(true);
    setError(null);

    try {
      // Check if we're on a native platform
      if (!isNative) {
        // Fall back to file input for web
        return new Promise((resolve) => {
          const input = document.createElement('input');
          input.type = 'file';
          input.accept = 'image/*';
          input.capture = 'environment';
          
          input.onchange = async (e) => {
            const file = (e.target as HTMLInputElement).files?.[0];
            if (file) {
              const reader = new FileReader();
              reader.onload = () => {
                const result: CameraPhoto = {
                  dataUrl: reader.result as string,
                  format: file.type.split('/')[1] || 'jpeg',
                };
                setPhoto(result);
                setIsLoading(false);
                resolve(result);
              };
              reader.readAsDataURL(file);
            } else {
              setIsLoading(false);
              resolve(null);
            }
          };
          
          input.click();
        });
      }

      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.DataUrl,
        source: CameraSource.Prompt, // Let user choose camera or gallery
        promptLabelHeader: 'Select Image',
        promptLabelPhoto: 'From Gallery',
        promptLabelPicture: 'Take Photo',
      });

      const result: CameraPhoto = {
        dataUrl: image.dataUrl!,
        format: image.format,
        webPath: image.webPath,
      };

      setPhoto(result);
      setIsLoading(false);
      return result;
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to take photo';
      // Don't set error if user cancelled
      if (!errorMessage.includes('cancelled') && !errorMessage.includes('canceled')) {
        setError(errorMessage);
      }
      setIsLoading(false);
      return null;
    }
  }, [isNative]);

  const pickFromGallery = useCallback(async (): Promise<CameraPhoto | null> => {
    setIsLoading(true);
    setError(null);

    try {
      if (!isNative) {
        // Fall back to file input for web
        return new Promise((resolve) => {
          const input = document.createElement('input');
          input.type = 'file';
          input.accept = 'image/*';
          
          input.onchange = async (e) => {
            const file = (e.target as HTMLInputElement).files?.[0];
            if (file) {
              const reader = new FileReader();
              reader.onload = () => {
                const result: CameraPhoto = {
                  dataUrl: reader.result as string,
                  format: file.type.split('/')[1] || 'jpeg',
                };
                setPhoto(result);
                setIsLoading(false);
                resolve(result);
              };
              reader.readAsDataURL(file);
            } else {
              setIsLoading(false);
              resolve(null);
            }
          };
          
          input.click();
        });
      }

      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.DataUrl,
        source: CameraSource.Photos,
      });

      const result: CameraPhoto = {
        dataUrl: image.dataUrl!,
        format: image.format,
        webPath: image.webPath,
      };

      setPhoto(result);
      setIsLoading(false);
      return result;
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to pick photo';
      if (!errorMessage.includes('cancelled') && !errorMessage.includes('canceled')) {
        setError(errorMessage);
      }
      setIsLoading(false);
      return null;
    }
  }, [isNative]);

  const clearPhoto = useCallback(() => {
    setPhoto(null);
    setError(null);
  }, []);

  return {
    photo,
    isLoading,
    error,
    isNative,
    takePhoto,
    pickFromGallery,
    clearPhoto,
  };
}
