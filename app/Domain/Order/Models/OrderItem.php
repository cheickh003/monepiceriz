<?php

namespace App\Domain\Order\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use App\Domain\Catalog\Models\ProductSku;

class OrderItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'order_id',
        'product_sku_id',
        'product_name',
        'sku_code',
        'sku_name',
        'quantity',
        'unit_price',
        'line_total',
        'estimated_weight',
        'actual_weight',
        'is_variable_weight',
        'weight_difference',
        'price_adjustment',
    ];

    protected $casts = [
        'quantity' => 'decimal:3',
        'unit_price' => 'decimal:2',
        'line_total' => 'decimal:2',
        'estimated_weight' => 'integer',
        'actual_weight' => 'integer',
        'is_variable_weight' => 'boolean',
        'weight_difference' => 'integer',
        'price_adjustment' => 'decimal:2',
    ];

    /**
     * Relations
     */
    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }

    public function productSku(): BelongsTo
    {
        return $this->belongsTo(ProductSku::class);
    }

    /**
     * Vérifie si l'item est à poids variable
     */
    public function isVariableWeight(): bool
    {
        return $this->is_variable_weight;
    }

    /**
     * Vérifie s'il y a une différence de poids
     */
    public function hasWeightDifference(): bool
    {
        return $this->actual_weight !== null && 
               $this->actual_weight !== $this->estimated_weight;
    }

    /**
     * Calcule le montant total de la ligne
     */
    public function calculateLineTotal(): float
    {
        if ($this->isVariableWeight() && $this->actual_weight) {
            // Pour les produits à poids variable, on calcule basé sur le poids réel
            // Le prix unitaire est au kg, le poids est en grammes
            $weightInKg = $this->actual_weight / 1000;
            return $this->unit_price * $weightInKg * $this->quantity;
        }

        // Pour les produits à prix fixe
        return $this->unit_price * $this->quantity;
    }

    /**
     * Calcule la différence de poids en grammes
     */
    public function calculateWeightDifference(): int
    {
        if (!$this->isVariableWeight() || !$this->actual_weight) {
            return 0;
        }

        return $this->actual_weight - $this->estimated_weight;
    }

    /**
     * Calcule l'ajustement de prix basé sur la différence de poids
     */
    public function calculatePriceAdjustment(): float
    {
        if (!$this->hasWeightDifference()) {
            return 0;
        }

        $weightDifferenceKg = $this->calculateWeightDifference() / 1000;
        return $this->unit_price * $weightDifferenceKg * $this->quantity;
    }

    /**
     * Met à jour le poids réel et recalcule les montants
     */
    public function updateActualWeight(int $actualWeight): void
    {
        if (!$this->isVariableWeight()) {
            throw new \Exception("Cannot update weight for non-variable weight product");
        }

        $this->actual_weight = $actualWeight;
        $this->weight_difference = $this->calculateWeightDifference();
        $this->price_adjustment = $this->calculatePriceAdjustment();
        $this->line_total = $this->calculateLineTotal();
        
        $this->save();
    }

    /**
     * Valide que le poids réel est dans une fourchette acceptable
     */
    public function validateActualWeight(int $actualWeight, float $tolerancePercent = 20): bool
    {
        if (!$this->isVariableWeight()) {
            return true;
        }

        $minWeight = $this->estimated_weight * (1 - $tolerancePercent / 100);
        $maxWeight = $this->estimated_weight * (1 + $tolerancePercent / 100);

        return $actualWeight >= $minWeight && $actualWeight <= $maxWeight;
    }

    /**
     * Accesseurs
     */
    public function getFormattedUnitPriceAttribute(): string
    {
        return number_format($this->unit_price, 0, ',', ' ') . ' FCFA';
    }

    public function getFormattedLineTotalAttribute(): string
    {
        return number_format($this->line_total, 0, ',', ' ') . ' FCFA';
    }

    public function getFormattedWeightAttribute(): string
    {
        $weight = $this->actual_weight ?? $this->estimated_weight;
        
        if ($weight >= 1000) {
            return number_format($weight / 1000, 2, ',', ' ') . ' kg';
        }
        
        return $weight . ' g';
    }

    public function getWeightDifferencePercentAttribute(): float
    {
        if (!$this->estimated_weight || !$this->hasWeightDifference()) {
            return 0;
        }

        return round(($this->weight_difference / $this->estimated_weight) * 100, 1);
    }

    /**
     * Retourne les informations pour l'affichage
     */
    public function getDisplayInfoAttribute(): array
    {
        $info = [
            'name' => $this->product_name,
            'sku' => $this->sku_name,
            'quantity' => $this->quantity,
            'unit_price' => $this->formatted_unit_price,
            'total' => $this->formatted_line_total,
        ];

        if ($this->isVariableWeight()) {
            $info['weight'] = [
                'estimated' => $this->estimated_weight . ' g',
                'actual' => $this->actual_weight ? $this->actual_weight . ' g' : null,
                'difference' => $this->weight_difference ? $this->weight_difference . ' g' : null,
                'difference_percent' => $this->weight_difference_percent,
            ];
        }

        return $info;
    }

    /**
     * Scope pour les items nécessitant une confirmation de poids
     */
    public function scopeRequiringWeightConfirmation($query)
    {
        return $query->where('is_variable_weight', true)
                    ->whereNull('actual_weight');
    }

    /**
     * Scope pour les items avec ajustement de prix
     */
    public function scopeWithPriceAdjustment($query)
    {
        return $query->whereNotNull('price_adjustment')
                    ->where('price_adjustment', '!=', 0);
    }
}