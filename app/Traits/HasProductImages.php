<?php

namespace App\Traits;

use App\Services\SupabaseStorageService;
use Illuminate\Http\UploadedFile;

trait HasProductImages
{
    /**
     * Upload main product image
     * 
     * @param UploadedFile $image
     * @return bool
     */
    public function uploadMainImage(UploadedFile $image): bool
    {
        $storage = app(SupabaseStorageService::class);
        
        try {
            // Validate image
            $storage->validateFile($image);
            
            // Generate folder path
            $folder = $storage->generatePath('products', $this->id);
            
            // Upload image
            $result = $storage->upload($image, $folder);
            
            // Delete old image if exists
            if ($this->main_image) {
                $storage->delete($this->main_image);
            }
            
            // Update model
            $this->update(['main_image' => $result['path']]);
            
            return true;
        } catch (\Exception $e) {
            \Log::error('Failed to upload main image: ' . $e->getMessage());
            return false;
        }
    }
    
    /**
     * Upload gallery images
     * 
     * @param array $images
     * @return int Number of successfully uploaded images
     */
    public function uploadGalleryImages(array $images): int
    {
        $storage = app(SupabaseStorageService::class);
        $uploaded = 0;
        
        // Generate folder path
        $folder = $storage->generatePath('products', $this->id);
        
        // Get current gallery images
        $gallery = $this->gallery_images ?? [];
        
        foreach ($images as $image) {
            if ($image instanceof UploadedFile) {
                try {
                    // Validate image
                    $storage->validateFile($image);
                    
                    // Upload image
                    $result = $storage->upload($image, $folder);
                    
                    // Add to gallery
                    $gallery[] = $result['path'];
                    $uploaded++;
                } catch (\Exception $e) {
                    \Log::error('Failed to upload gallery image: ' . $e->getMessage());
                }
            }
        }
        
        // Update model
        if ($uploaded > 0) {
            $this->update(['gallery_images' => $gallery]);
        }
        
        return $uploaded;
    }
    
    /**
     * Delete image from gallery
     * 
     * @param string $path
     * @return bool
     */
    public function deleteGalleryImage(string $path): bool
    {
        $storage = app(SupabaseStorageService::class);
        
        // Get current gallery
        $gallery = $this->gallery_images ?? [];
        
        // Remove from array
        $gallery = array_values(array_filter($gallery, function($image) use ($path) {
            return $image !== $path;
        }));
        
        // Delete from storage
        $deleted = $storage->delete($path);
        
        // Update model
        $this->update(['gallery_images' => $gallery]);
        
        return $deleted;
    }
    
    /**
     * Delete all product images
     * 
     * @return void
     */
    public function deleteAllImages(): void
    {
        $storage = app(SupabaseStorageService::class);
        
        // Delete main image
        if ($this->main_image) {
            $storage->delete($this->main_image);
        }
        
        // Delete gallery images
        if ($this->gallery_images) {
            foreach ($this->gallery_images as $image) {
                $storage->delete($image);
            }
        }
        
        // Clear from model
        $this->update([
            'main_image' => null,
            'gallery_images' => null
        ]);
    }
    
    /**
     * Get main image URL
     * 
     * @return string|null
     */
    public function getMainImageUrlAttribute(): ?string
    {
        if (!$this->main_image) {
            return null;
        }
        
        $storage = app(SupabaseStorageService::class);
        return $storage->getPublicUrl($this->main_image);
    }
    
    /**
     * Get gallery image URLs
     * 
     * @return array
     */
    public function getGalleryImageUrlsAttribute(): array
    {
        if (!$this->gallery_images) {
            return [];
        }
        
        $storage = app(SupabaseStorageService::class);
        
        return array_map(function($path) use ($storage) {
            return $storage->getPublicUrl($path);
        }, $this->gallery_images);
    }
    
    /**
     * Get all image URLs (main + gallery)
     * 
     * @return array
     */
    public function getAllImageUrlsAttribute(): array
    {
        $urls = [];
        
        if ($this->main_image_url) {
            $urls[] = $this->main_image_url;
        }
        
        return array_merge($urls, $this->gallery_image_urls);
    }
}