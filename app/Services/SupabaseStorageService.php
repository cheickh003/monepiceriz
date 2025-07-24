<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Str;
use Exception;

class SupabaseStorageService
{
    protected string $url;
    protected string $anonKey;
    protected string $serviceKey;
    protected string $bucket;
    
    public function __construct()
    {
        $this->url = config('services.supabase.url');
        $this->anonKey = config('services.supabase.anon_key');
        $this->serviceKey = config('services.supabase.service_key');
        $this->bucket = config('services.supabase.storage_bucket', 'products');
    }
    
    /**
     * Upload a file to Supabase Storage
     * 
     * @param UploadedFile $file
     * @param string $folder
     * @return array
     * @throws Exception
     */
    public function upload(UploadedFile $file, string $folder = ''): array
    {
        // Generate unique filename
        $extension = $file->getClientOriginalExtension();
        $filename = Str::uuid() . '.' . $extension;
        $path = $folder ? trim($folder, '/') . '/' . $filename : $filename;
        
        // Get file content
        $content = file_get_contents($file->getRealPath());
        
        // Upload to Supabase
        $response = Http::withHeaders([
            'Authorization' => 'Bearer ' . $this->serviceKey,
            'Content-Type' => $file->getMimeType(),
        ])->withBody($content, $file->getMimeType())
          ->post("{$this->url}/storage/v1/object/{$this->bucket}/{$path}");
        
        if (!$response->successful()) {
            throw new Exception('Failed to upload file to Supabase: ' . $response->body());
        }
        
        return [
            'path' => $path,
            'url' => $this->getPublicUrl($path),
            'size' => $file->getSize(),
            'mime_type' => $file->getMimeType(),
        ];
    }
    
    /**
     * Upload multiple files
     * 
     * @param array $files
     * @param string $folder
     * @return array
     */
    public function uploadMultiple(array $files, string $folder = ''): array
    {
        $uploaded = [];
        
        foreach ($files as $file) {
            if ($file instanceof UploadedFile) {
                try {
                    $uploaded[] = $this->upload($file, $folder);
                } catch (Exception $e) {
                    // Log error but continue with other files
                    \Log::error('Failed to upload file: ' . $e->getMessage());
                }
            }
        }
        
        return $uploaded;
    }
    
    /**
     * Delete a file from Supabase Storage
     * 
     * @param string $path
     * @return bool
     */
    public function delete(string $path): bool
    {
        $response = Http::withHeaders([
            'Authorization' => 'Bearer ' . $this->serviceKey,
        ])->delete("{$this->url}/storage/v1/object/{$this->bucket}/{$path}");
        
        return $response->successful();
    }
    
    /**
     * Delete multiple files
     * 
     * @param array $paths
     * @return int Number of successfully deleted files
     */
    public function deleteMultiple(array $paths): int
    {
        $deleted = 0;
        
        foreach ($paths as $path) {
            if ($this->delete($path)) {
                $deleted++;
            }
        }
        
        return $deleted;
    }
    
    /**
     * Get public URL for a file
     * 
     * @param string $path
     * @return string
     */
    public function getPublicUrl(string $path): string
    {
        return "{$this->url}/storage/v1/object/public/{$this->bucket}/{$path}";
    }
    
    /**
     * Get signed URL for private access
     * 
     * @param string $path
     * @param int $expiresIn Seconds until expiration
     * @return string|null
     */
    public function getSignedUrl(string $path, int $expiresIn = 3600): ?string
    {
        $response = Http::withHeaders([
            'Authorization' => 'Bearer ' . $this->serviceKey,
        ])->post("{$this->url}/storage/v1/object/sign/{$this->bucket}/{$path}", [
            'expiresIn' => $expiresIn,
        ]);
        
        if ($response->successful()) {
            $data = $response->json();
            return $this->url . $data['signedURL'];
        }
        
        return null;
    }
    
    /**
     * List files in a folder
     * 
     * @param string $folder
     * @param int $limit
     * @param int $offset
     * @return array
     */
    public function listFiles(string $folder = '', int $limit = 100, int $offset = 0): array
    {
        $response = Http::withHeaders([
            'Authorization' => 'Bearer ' . $this->serviceKey,
        ])->post("{$this->url}/storage/v1/object/list/{$this->bucket}", [
            'prefix' => $folder,
            'limit' => $limit,
            'offset' => $offset,
        ]);
        
        if ($response->successful()) {
            return $response->json();
        }
        
        return [];
    }
    
    /**
     * Move/rename a file
     * 
     * @param string $from
     * @param string $to
     * @return bool
     */
    public function move(string $from, string $to): bool
    {
        $response = Http::withHeaders([
            'Authorization' => 'Bearer ' . $this->serviceKey,
        ])->post("{$this->url}/storage/v1/object/move", [
            'bucketId' => $this->bucket,
            'sourceKey' => $from,
            'destinationKey' => $to,
        ]);
        
        return $response->successful();
    }
    
    /**
     * Copy a file
     * 
     * @param string $from
     * @param string $to
     * @return bool
     */
    public function copy(string $from, string $to): bool
    {
        $response = Http::withHeaders([
            'Authorization' => 'Bearer ' . $this->serviceKey,
        ])->post("{$this->url}/storage/v1/object/copy", [
            'bucketId' => $this->bucket,
            'sourceKey' => $from,
            'destinationKey' => $to,
        ]);
        
        return $response->successful();
    }
    
    /**
     * Create a folder structure for organizing files
     * 
     * @param string $type
     * @param string $id
     * @return string
     */
    public function generatePath(string $type, string $id): string
    {
        $date = now()->format('Y/m');
        return "{$type}/{$date}/{$id}";
    }
    
    /**
     * Validate file before upload
     * 
     * @param UploadedFile $file
     * @param array $allowedMimes
     * @param int $maxSize
     * @return bool
     * @throws Exception
     */
    public function validateFile(UploadedFile $file, array $allowedMimes = [], int $maxSize = 10485760): bool
    {
        // Default allowed mime types for images
        if (empty($allowedMimes)) {
            $allowedMimes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
        }
        
        // Check mime type
        if (!in_array($file->getMimeType(), $allowedMimes)) {
            throw new Exception('Invalid file type. Allowed types: ' . implode(', ', $allowedMimes));
        }
        
        // Check file size (default 10MB)
        if ($file->getSize() > $maxSize) {
            throw new Exception('File size exceeds maximum allowed size of ' . ($maxSize / 1048576) . 'MB');
        }
        
        return true;
    }
}