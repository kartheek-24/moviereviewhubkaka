import { Camera, ImagePlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useCamera, CameraPhoto } from '@/hooks/useCamera';

interface CameraButtonProps {
  onPhotoCapture: (photo: CameraPhoto) => void;
  variant?: 'default' | 'outline' | 'ghost' | 'secondary';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
}

export function CameraButton({ 
  onPhotoCapture, 
  variant = 'outline',
  size = 'default',
  className 
}: CameraButtonProps) {
  const { takePhoto, pickFromGallery, isLoading, isNative } = useCamera();

  const handleTakePhoto = async () => {
    const photo = await takePhoto();
    if (photo) {
      onPhotoCapture(photo);
    }
  };

  const handlePickFromGallery = async () => {
    const photo = await pickFromGallery();
    if (photo) {
      onPhotoCapture(photo);
    }
  };

  // On web, just show a simple button that opens file picker
  if (!isNative) {
    return (
      <Button
        variant={variant}
        size={size}
        onClick={handlePickFromGallery}
        disabled={isLoading}
        className={className}
      >
        <ImagePlus className="w-4 h-4 mr-2" />
        {isLoading ? 'Loading...' : 'Add Photo'}
      </Button>
    );
  }

  // On native, show dropdown with camera/gallery options
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant={variant}
          size={size}
          disabled={isLoading}
          className={className}
        >
          <Camera className="w-4 h-4 mr-2" />
          {isLoading ? 'Loading...' : 'Add Photo'}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="bg-popover border-border">
        <DropdownMenuItem onClick={handleTakePhoto}>
          <Camera className="w-4 h-4 mr-2" />
          Take Photo
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handlePickFromGallery}>
          <ImagePlus className="w-4 h-4 mr-2" />
          Choose from Gallery
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
