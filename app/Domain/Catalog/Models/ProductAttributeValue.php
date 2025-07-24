<?php

namespace App\Domain\Catalog\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class ProductAttributeValue extends Model
{
    use HasFactory;
    
    /**
     * The attributes that are mass assignable.
     *
     * @var array<string>
     */
    protected $fillable = [
        'product_attribute_id',
        'value',
        'label',
        'hex_color',
        'position',
    ];
    
    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'product_attribute_id' => 'integer',
        'position' => 'integer',
    ];
    
    /**
     * Get the attribute that owns this value
     */
    public function attribute(): BelongsTo
    {
        return $this->belongsTo(ProductAttribute::class, 'product_attribute_id');
    }
    
    /**
     * Get the SKUs that have this attribute value
     */
    public function skus(): BelongsToMany
    {
        return $this->belongsToMany(
            ProductSku::class,
            'product_sku_attributes',
            'product_attribute_value_id',
            'product_sku_id'
        );
    }
}