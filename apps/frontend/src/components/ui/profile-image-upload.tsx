'use client';

import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  deleteImageFromImageKit,
  getOptimizedImageUrl,
  uploadProfileImage,
  validateImageFile,
} from '@/lib/imagekit';
import { cn } from '@/lib/utils';
import { Camera, Check, Upload, X } from 'lucide-react';
import Image from 'next/image';
import { useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';

interface ProfileImageUploadProps {
  currentImageUrl?: string;
  onImageUpload?: (imageUrl: string, fileId: string) => void;
  onImageRemove?: () => void;
  userId?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  // Add a prop to track the current fileId from parent
  currentFileId?: string;
  // Add a prop to prevent deletion during form submission
  preventDeletion?: boolean;
  // New props for better lifecycle management
  preserveOnUnmount?: boolean; // Don't delete image when component unmounts
  isFormSubmitting?: boolean; // Prevent deletion during form submission
}

export function ProfileImageUpload({
  currentImageUrl,
  onImageUpload,
  onImageRemove,
  userId,
  className,
  size = 'md',
  disabled = false,
  currentFileId: externalFileId,
  preventDeletion = false,
  preserveOnUnmount = false,
  isFormSubmitting = false,
}: ProfileImageUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState<string>('');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [internalFileId, setInternalFileId] = useState<string | null>(null);

  // Use external fileId if provided, otherwise use internal state
  const currentFileId = externalFileId || internalFileId;
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Track if image was successfully uploaded to prevent unnecessary cleanup
  const imageUploadedRef = useRef(false);

  const sizeClasses = {
    sm: 'w-16 h-16',
    md: 'w-24 h-24',
    lg: 'w-32 h-32',
  };

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
  };

  const handleFileSelect = useCallback(
    async (file: File) => {
      if (disabled) return;

      // Validate file
      const validation = validateImageFile(file);
      if (!validation.isValid) {
        console.error('File validation failed:', validation.error);
        return;
      }

      // Create preview
      const preview = URL.createObjectURL(file);
      setPreviewUrl(preview);
      setIsUploading(true);
      setUploadProgress(0);
      setUploadStatus('Preparing upload...');

      try {
        // Upload to ImageKit with real progress tracking
        const result = await uploadProfileImage(file, userId || 'anonymous', (progress: number) => {
          setUploadProgress(progress);
          if (progress < 10) {
            setUploadStatus('Compressing image...');
          } else if (progress < 100) {
            setUploadStatus(`Uploading... ${progress}%`);
          } else {
            setUploadStatus('Processing...');
          }
        });

        // Store fileId for potential deletion (only if no external fileId is provided)
        if (!externalFileId) {
          setInternalFileId(result.fileId);
        }

        // Mark image as successfully uploaded
        imageUploadedRef.current = true;

        // // Show success feedback
        // toast.success('Profile image uploaded successfully!');

        // Clean up preview
        URL.revokeObjectURL(preview);
        setPreviewUrl(null);

        // Call success callback with URL and fileId
        onImageUpload?.(result.url, result.fileId);
      } catch (error) {
        console.error('Upload error:', error);

        // Show user-friendly error message
        const errorMessage = error instanceof Error ? error.message : 'Upload failed';
        toast.error(`Image upload failed: ${errorMessage}`);

        // Clean up preview silently
        URL.revokeObjectURL(preview);
        setPreviewUrl(null);
      } finally {
        setIsUploading(false);
        setUploadProgress(0);
        setUploadStatus('');
      }
    },
    [disabled, userId, onImageUpload]
  );

  const handleDragOver = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      if (!disabled) {
        setIsDragging(true);
      }
    },
    [disabled]
  );

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);

      if (disabled) return;

      const files = Array.from(e.dataTransfer.files);
      const imageFile = files.find(file => file.type.startsWith('image/'));

      if (imageFile) {
        handleFileSelect(imageFile);
      } else {
        toast.error('Please drop an image file');
      }
    },
    [disabled, handleFileSelect]
  );

  const handleFileInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        handleFileSelect(file);
      }
    },
    [handleFileSelect]
  );

  // Enhanced cleanup logic with better lifecycle management
  const handleRemoveImage = useCallback(async () => {
    // CRITICAL: Multiple layers of protection against unwanted deletion
    if (disabled || preventDeletion || isFormSubmitting || preserveOnUnmount) {
      console.log(
        '🚫 Image removal prevented - disabled:',
        disabled,
        'preventDeletion:',
        preventDeletion,
        'isFormSubmitting:',
        isFormSubmitting,
        'preserveOnUnmount:',
        preserveOnUnmount
      );
      return;
    }

    console.log('🗑️ handleRemoveImage called - currentFileId:', currentFileId);
    console.log('🗑️ externalFileId:', externalFileId, 'internalFileId:', internalFileId);

    // Delete from ImageKit silently if we have a fileId
    if (currentFileId) {
      try {
        console.log('🗑️ Attempting to delete image from ImageKit:', currentFileId);
        await deleteImageFromImageKit(currentFileId);
        console.log('✅ Image deleted from ImageKit:', currentFileId);
      } catch (error) {
        console.error('❌ Failed to delete image from ImageKit:', error);
        // Continue with local removal even if deletion fails
      }
    }

    // Clear local state only if using internal fileId
    if (!externalFileId) {
      setInternalFileId(null);
    }

    // Reset upload tracking
    imageUploadedRef.current = false;

    // Call parent callback
    onImageRemove?.();
  }, [disabled, preventDeletion, isFormSubmitting, preserveOnUnmount, currentFileId, internalFileId, onImageRemove]);

  // Enhanced cleanup effect with multiple safeguards to prevent unwanted image deletion
  useEffect(() => {
    return () => {
      // CRITICAL FIX 1: Check preserveOnUnmount FIRST - this is the primary protection
      if (preserveOnUnmount) {
        console.log(
          '🛡️ Component unmounting - preserveOnUnmount is true, skipping cleanup for:',
          internalFileId
        );
        return;
      }

      // CRITICAL FIX 2: Additional safeguard - don't cleanup if form is/was submitting
      if (isFormSubmitting) {
        console.log(
          '🛡️ Component unmounting - form is submitting, skipping cleanup for:',
          internalFileId
        );
        return;
      }

      // CRITICAL FIX 3: Don't cleanup if external fileId exists (managed by parent)
      if (externalFileId) {
        console.log(
          '🛡️ Component unmounting - external fileId exists, skipping cleanup for:',
          internalFileId
        );
        return;
      }

      // CRITICAL FIX 4: Only cleanup truly orphaned images (uploaded but never used)
      // This should only happen when user uploads an image but navigates away without submitting
      if (internalFileId && !imageUploadedRef.current) {
        console.log('🧹 Component unmounting - cleaning up orphaned image:', internalFileId);
        // Cleanup orphaned images silently in the background
        deleteImageFromImageKit(internalFileId).catch(error => {
          console.warn('⚠️ Failed to cleanup orphaned image on unmount:', error);
        });
      } else if (internalFileId && imageUploadedRef.current) {
        console.log(
          '🛡️ Component unmounting - image was successfully uploaded, preserving:',
          internalFileId
        );
      }
    };
  }, [preserveOnUnmount, isFormSubmitting, internalFileId, externalFileId]);

  const displayImageUrl = previewUrl || currentImageUrl;
  const optimizedImageUrl = displayImageUrl
    ? getOptimizedImageUrl(displayImageUrl, {
        width: size === 'sm' ? 64 : size === 'md' ? 96 : 128,
        height: size === 'sm' ? 64 : size === 'md' ? 96 : 128,
        quality: 80,
        format: 'auto',
      })
    : null;

  return (
    <div className={cn('relative flex flex-col justify-center items-center', className)}>
      <div
        className={cn(
          'relative rounded-full border-2 border-dashed transition-all duration-200 overflow-hidden flex items-center justify-center',
          sizeClasses[size],
          {
            'border-primary bg-primary/5': isDragging,
            'border-muted-foreground/25 hover:border-primary/50': !isDragging && !disabled,
            'border-muted-foreground/10': disabled,
            'cursor-pointer': !disabled,
            'cursor-not-allowed opacity-50': disabled,
          }
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !disabled && fileInputRef.current?.click()}
      >
        {/* Background Image */}
        {optimizedImageUrl && (
          <Image
            src={optimizedImageUrl}
            alt="Profile"
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            priority={false}
          />
        )}

        {/* Upload Overlay */}
        {!optimizedImageUrl && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground">
            <Camera className={cn(iconSizes[size], 'mb-1')} />
            {size !== 'sm' && (
              <span className="text-xs text-center px-1">
                {isDragging ? 'Drop here' : 'Add photo'}
              </span>
            )}
          </div>
        )}

        {/* Upload Progress Overlay */}
        {isUploading && (
          <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center text-white">
            <Upload className={cn(iconSizes[size], 'mb-2 animate-pulse')} />
            {size !== 'sm' && (
              <div className="w-3/4">
                <Progress value={uploadProgress} className="h-1" />
                <span className="text-xs mt-1 block text-center">
                  {uploadStatus || `${uploadProgress}%`}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Success Overlay */}
        {uploadProgress === 100 && (
          <div className="absolute inset-0 bg-green-500/80 flex items-center justify-center text-white">
            <Check className={iconSizes[size]} />
          </div>
        )}
      </div>

      {/* Remove Button */}
      {optimizedImageUrl && !isUploading && !disabled && !preventDeletion && (
        <Button
          variant="destructive"
          size="icon"
          className="absolute -top-1 -right-1 w-6 h-6 rounded-full cursor-pointer"
          onClick={e => {
            e.stopPropagation();
            handleRemoveImage();
          }}
        >
          <X className="w-3 h-3" />
        </Button>
      )}

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileInputChange}
        className="hidden"
        disabled={disabled}
      />

      {/* Upload Instructions */}
      {size === 'lg' && !optimizedImageUrl && !isUploading && (
        <div className="mt-3 text-center">
          <p className="text-sm text-muted-foreground">
            Drag and drop or{' '}
            <button
              type="button"
              className="text-primary hover:underline"
              onClick={() => !disabled && fileInputRef.current?.click()}
              disabled={disabled}
            >
              browse
            </button>{' '}
            to upload
          </p>
          <p className="text-xs text-muted-foreground mt-1">PNG, JPG, WebP up to 5MB</p>
        </div>
      )}
    </div>
  );
}
