import { useState, useRef } from 'react';
import { useToast } from '@chakra-ui/react';
import { useUploadAvatar } from '@/context/AuthContextService';

interface UploadResponseData {
  filename: string;
  path: string;
  size: number;
  mimetype: string;
  avatar: string;
}

interface UploadResponse {
  success: boolean;
  message: string;
  data: UploadResponseData;
}

export const useAvatarUpload = (onAvatarChange: (url: string) => void) => {
  const uploadAvatar = useUploadAvatar();
  const toast = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [isUploading, setIsUploading] = useState(false);

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: 'File too large',
        description: 'Please select an image smaller than 5MB',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    setSelectedFile(file);
    const imageUrl = URL.createObjectURL(file);
    setPreviewUrl(imageUrl);

    // Auto-upload
    try {
      setIsUploading(true);

      const uploadResponse = await uploadAvatar.mutateAsync({
        file,
        endpoint: '/auth/upload-avatar',
      });

      let avatarUrl = '';

      if (uploadResponse && typeof uploadResponse === 'object') {
        const response = uploadResponse as UploadResponse;

        if (response.success && response.data) {
          avatarUrl = response.data.avatar || response.data.path;

          if (avatarUrl && !avatarUrl.startsWith('/')) {
            avatarUrl = '/' + avatarUrl;
          }
        } else if (response.success === false) {
          throw new Error(response.message || 'Upload failed');
        }
      } else if (typeof uploadResponse === 'string') {
        avatarUrl = uploadResponse;
      }

      if (!avatarUrl) {
        console.error('No avatar URL in response:', uploadResponse);
        throw new Error('Invalid response: No avatar URL received');
      }
      onAvatarChange(avatarUrl);

      toast({
        title: 'Avatar uploaded successfully',
        description: 'Your profile picture has been updated',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });

      // Clean up
      URL.revokeObjectURL(imageUrl);
      setPreviewUrl('');
      setSelectedFile(null);

      // Reset the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error('Avatar upload error:', error);
      toast({
        title: 'Upload failed',
        description: 'Something went wrong',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });

      URL.revokeObjectURL(imageUrl);
      setPreviewUrl('');
      setSelectedFile(null);

      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } finally {
      setIsUploading(false);
    }
  };

  return {
    selectedFile,
    fileInputRef,
    previewUrl,
    isUploading,
    handleAvatarClick,
    handleFileChange,
  };
};
