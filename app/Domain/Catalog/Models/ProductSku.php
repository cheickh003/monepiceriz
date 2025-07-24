<?php

namespace App\Domain\Catalog\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class ProductSku extends Model
{
    use HasFactory;
    
    /**
     * The attributes that are mass assignable.
     *
     * @var array<string>
     */
    protected $fillable = [
        'product_id',
        'sku',
        'purchase_price',
        'price_ht',
        'price_ttc',
        'compare_at_price',
        'stock_quantity',
        'reserved_quantity',
        'low_stock_threshold',
        'weight_grams',
        'is_variable_weight',
        'min_weight_grams',
        'max_weight_grams',
        'weight',
        'images',
        'is_default',
    ];
    
    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'product_id' => 'integer',
        'purchase_price' => 'decimal:2',
        'price_ht' => 'decimal:2',
        'price_ttc' => 'decimal:2',
        'compare_at_price' => 'decimal:2',
        'stock_quantity' => 'integer',
        'reserved_quantity' => 'integer',
        'low_stock_threshold' => 'integer',
        'weight_grams' => 'integer',
        'min_weight_grams' => 'integer',
        'max_weight_grams' => 'integer',
        'weight' => 'decimal:3',
        'is_variable_weight' => 'boolean',
        'is_default' => 'boolean',
        'images' => 'array',
    ];
    
    /**
     * Get the product that owns the SKU
     */
    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }
    
    /**
     * Get the attribute values for this SKU
     */
    public function attributeValues(): BelongsToMany
    {
        return $this->belongsToMany(
            ProductAttributeValue::class, 
            'product_sku_attributes',
            'product_sku_id',
            'product_attribute_value_id'
        );
    }
    
    /**
     * Scope for default SKUs
     */
    public function scopeDefault($query)
    {
        return $query->where('is_default', true);
    }
    
    /**
     * Scope for in-stock SKUs
     */
    public function scopeInStock($query)
    {
        return $query->where('stock_quantity', '>', 0);
    }
    
    /**
     * Check if SKU is on promotion
     */
    public function getIsOnPromoAttribute()
    {
        return $this->compare_at_price !== null && $this->compare_at_price > $this->price_ttc;
    }
    
    /**
     * Get the effective price (always price_ttc for now)
     */
    public function getEffectivePriceAttribute()
    {
        return $this->price_ttc;
    }
    
    /**
     * Get discount percentage
     */
    public function getDiscountPercentageAttribute()
    {
        if (!$this->is_on_promo) {
            return 0;
        }
        
        return round((($this->compare_at_price - $this->price_ttc) / $this->compare_at_price) * 100);
    }
}