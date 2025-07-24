<?php

namespace Tests\Unit\Services;

use Tests\TestCase;
use App\Services\SupabaseStorageService;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Storage;
use PHPUnit\Framework\Attributes\Test;

class SupabaseStorageServiceTest extends TestCase
{
    private SupabaseStorageService $service;
    
    protected function setUp(): void
    {
        parent::setUp();
        
        // Mock HTTP responses
        Http::fake([
            '*/storage/v1/object/*' => Http::response(['message' => 'success'], 200),
            '*/storage/v1/object/list/*' => Http::response([
                ['name' => 'test1.jpg', 'id' => '1', 'created_at' => now()->toISOString()],
                ['name' => 'test2.jpg', 'id' => '2', 'created_at' => now()->toISOString()]
            ], 200),
        ]);
        
        $this->service = new SupabaseStorageService();
    }
    
    #[Test]
    public function test_upload_file()
    {
        // Créer un fichier de test
        $file = UploadedFile::fake()->image('product.jpg', 600, 400);
        
        // Tester l'upload
        $result = $this->service->upload($file, 'products/test-product.jpg');
        
        // Vérifier le résultat
        $this->assertIsArray($result);
        $this->assertArrayHasKey('path', $result);
        $this->assertArrayHasKey('url', $result);
        $this->assertStringContainsString('products/test-product.jpg', $result['path']);
    }
    
    #[Test]
    public function test_upload_with_auto_generated_path()
    {
        $file = UploadedFile::fake()->image('product.png');
        
        $result = $this->service->upload($file, null, 'products');
        
        $this->assertIsArray($result);
        $this->assertArrayHasKey('path', $result);
        $this->assertStringStartsWith('products/', $result['path']);
        $this->assertStringEndsWith('.png', $result['path']);
    }
    
    #[Test]
    public function test_delete_file()
    {
        $result = $this->service->delete('products/test-product.jpg');
        
        $this->assertTrue($result);
    }
    
    #[Test]
    public function test_list_files()
    {
        $files = $this->service->list('products');
        
        $this->assertIsArray($files);
        $this->assertCount(2, $files);
        $this->assertEquals('test1.jpg', $files[0]['name']);
    }
    
    #[Test]
    public function test_move_file()
    {
        $result = $this->service->move('products/old.jpg', 'products/new.jpg');
        
        $this->assertTrue($result);
    }
    
    #[Test]
    public function test_copy_file()
    {
        $result = $this->service->copy('products/original.jpg', 'products/copy.jpg');
        
        $this->assertTrue($result);
    }
    
    #[Test]
    public function test_file_validation()
    {
        // Tester avec un fichier invalide (trop grand)
        $file = UploadedFile::fake()->image('large.jpg')->size(20000); // 20MB
        
        $this->expectException(\InvalidArgumentException::class);
        $this->service->upload($file, 'products/large.jpg');
    }
    
    #[Test]
    public function test_invalid_mime_type()
    {
        // Créer un fichier avec un type non autorisé
        $file = UploadedFile::fake()->create('document.pdf', 100);
        
        $this->expectException(\InvalidArgumentException::class);
        $this->expectExceptionMessage('Type de fichier non autorisé');
        
        $this->service->upload($file, 'products/document.pdf');
    }
}