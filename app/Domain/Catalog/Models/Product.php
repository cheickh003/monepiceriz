<?php

namespace App\Domain\Catalog\Models;

use App\Traits\HasProductImages;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Support\Facades\DB;

class Product extends Model
{
    use HasFactory, HasProductImages;
    
    /**
     * The attributes that are mass assignable.
     *
     * @var array<string>
     */
    protected $fillable = [
        'category_id',
        'name',
        'slug',
        'description',
        'brand',
        'reference',
        'barcode',
        'main_image',
        'gallery_images',
        'is_active',
        'is_featured',
        'is_variable_weight',
        'meta_title',
        'meta_description',
        'meta_keywords',
    ];
    
    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'is_active' => 'boolean',
        'is_featured' => 'boolean',
        'is_variable_weight' => 'boolean',
        'category_id' => 'integer',
        'gallery_images' => 'array',
        'meta_keywords' => 'json',
    ];
    
    /**
     * Get the category of the product
     */
    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }
    
    /**
     * Get all SKUs for the product
     */
    public function skus(): HasMany
    {
        return $this->hasMany(ProductSku::class);
    }
    
    /**
     * Get the default SKU (first one)
     */
    public function defaultSku(): HasOne
    {
        return $this->hasOne(ProductSku::class)->orderBy('id');
    }
    
    /**
     * Get all attributes for the product
     */
    public function attributes(): HasMany
    {
        return $this->hasMany(ProductAttribute::class);
    }
    
    /**
     * Scope for active products
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }
    
    /**
     * Scope for featured products
     */
    public function scopeFeatured($query)
    {
        return $query->where('is_featured', true);
    }
    
    /**
     * Get the product's minimum price
     */
    public function getMinPriceAttribute()
    {
        return $this->skus()->min('price_ttc') ?? 0;
    }
    
    /**
     * Get the product's maximum price
     */
    public function getMaxPriceAttribute()
    {
        return $this->skus()->max('price_ttc') ?? 0;
    }
    
    /**
     * Check if product is in stock
     */
    public function getInStockAttribute()
    {
        return $this->skus()->where('stock_quantity', '>', 0)->exists();
    }
}