<?php

namespace App\Domain\Order\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use App\Models\Customer;
use Illuminate\Support\Str;

class Order extends Model
{
    use HasFactory;

    protected $fillable = [
        'order_number',
        'customer_id',
        'customer_name',
        'customer_email',
        'customer_phone',
        'subtotal',
        'delivery_fee',
        'total_amount',
        'status',
        'payment_status',
        'payment_method',
        'payment_reference',
        'delivery_method',
        'delivery_address',
        'delivery_notes',
        'pickup_date',
        'pickup_time_slot',
        'requires_weight_confirmation',
        'weight_confirmed_at',
        'completed_at',
        'notes',
    ];

    protected $casts = [
        'subtotal' => 'decimal:2',
        'delivery_fee' => 'decimal:2',
        'total_amount' => 'decimal:2',
        'pickup_date' => 'date',
        'weight_confirmed_at' => 'datetime',
        'completed_at' => 'datetime',
        'requires_weight_confirmation' => 'boolean',
    ];

    /**
     * Les statuts possibles pour une commande
     */
    const STATUS_PENDING = 'pending';
    const STATUS_CONFIRMED = 'confirmed';
    const STATUS_PROCESSING = 'processing';
    const STATUS_READY = 'ready';
    const STATUS_DELIVERING = 'delivering';
    const STATUS_COMPLETED = 'completed';
    const STATUS_CANCELLED = 'cancelled';

    /**
     * Les statuts de paiement possibles
     */
    const PAYMENT_STATUS_PENDING = 'pending';
    const PAYMENT_STATUS_AUTHORIZED = 'authorized';
    const PAYMENT_STATUS_PAID = 'paid';
    const PAYMENT_STATUS_FAILED = 'failed';
    const PAYMENT_STATUS_REFUNDED = 'refunded';

    /**
     * Les méthodes de livraison disponibles
     */
    const DELIVERY_METHOD_PICKUP = 'pickup';
    const DELIVERY_METHOD_DELIVERY = 'delivery';

    /**
     * Boot method pour générer automatiquement le numéro de commande
     */
    protected static function boot()
    {
        parent::boot();

        static::creating(function ($order) {
            if (empty($order->order_number)) {
                $order->order_number = self::generateOrderNumber();
            }
        });
    }

    /**
     * Génère un numéro de commande unique
     */
    public static function generateOrderNumber(): string
    {
        $date = now()->format('Ymd');
        $random = strtoupper(Str::random(4));
        $count = self::whereDate('created_at', today())->count() + 1;
        
        return sprintf('CMD-%s-%04d-%s', $date, $count, $random);
    }

    /**
     * Relations
     */
    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class);
    }

    public function items(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }

    /**
     * Scopes
     */
    public function scopePending($query)
    {
        return $query->where('status', self::STATUS_PENDING);
    }

    public function scopeConfirmed($query)
    {
        return $query->where('status', self::STATUS_CONFIRMED);
    }

    public function scopeProcessing($query)
    {
        return $query->where('status', self::STATUS_PROCESSING);
    }

    public function scopeCompleted($query)
    {
        return $query->where('status', self::STATUS_COMPLETED);
    }

    public function scopeNotCancelled($query)
    {
        return $query->where('status', '!=', self::STATUS_CANCELLED);
    }

    public function scopeRequiringWeightConfirmation($query)
    {
        return $query->where('requires_weight_confirmation', true)
                    ->whereNull('weight_confirmed_at');
    }

    /**
     * Méthodes métier
     */
    public function hasVariableWeightProducts(): bool
    {
        return $this->items()
            ->whereHas('productSku', function ($query) {
                $query->where('is_variable_weight', true);
            })
            ->exists();
    }

    public function calculateTotal(): float
    {
        $subtotal = $this->items->sum(function ($item) {
            return $item->unit_price * $item->quantity;
        });

        return $subtotal + $this->delivery_fee;
    }

    public function canBeCancelled(): bool
    {
        return in_array($this->status, [
            self::STATUS_PENDING,
            self::STATUS_CONFIRMED
        ]) && $this->payment_status !== self::PAYMENT_STATUS_PAID;
    }

    public function needsWeightConfirmation(): bool
    {
        return $this->requires_weight_confirmation && !$this->weight_confirmed_at;
    }

    public function markWeightConfirmed(): void
    {
        $this->update([
            'weight_confirmed_at' => now(),
            'total_amount' => $this->calculateTotal()
        ]);
    }

    /**
     * Vérifie si la commande nécessite une pré-autorisation
     */
    public function requiresPreAuthorization(): bool
    {
        return $this->hasVariableWeightProducts() && 
               $this->payment_method === 'card' &&
               $this->payment_status === self::PAYMENT_STATUS_PENDING;
    }

    /**
     * Transitions de statut autorisées
     */
    public function canTransitionTo(string $newStatus): bool
    {
        $transitions = [
            self::STATUS_PENDING => [self::STATUS_CONFIRMED, self::STATUS_CANCELLED],
            self::STATUS_CONFIRMED => [self::STATUS_PROCESSING, self::STATUS_CANCELLED],
            self::STATUS_PROCESSING => [self::STATUS_READY, self::STATUS_CANCELLED],
            self::STATUS_READY => [self::STATUS_DELIVERING, self::STATUS_COMPLETED],
            self::STATUS_DELIVERING => [self::STATUS_COMPLETED],
            self::STATUS_COMPLETED => [],
            self::STATUS_CANCELLED => [],
        ];

        return in_array($newStatus, $transitions[$this->status] ?? []);
    }

    /**
     * Met à jour le statut de la commande
     */
    public function updateStatus(string $newStatus): bool
    {
        if (!$this->canTransitionTo($newStatus)) {
            return false;
        }

        $this->status = $newStatus;

        if ($newStatus === self::STATUS_COMPLETED) {
            $this->completed_at = now();
        }

        return $this->save();
    }

    /**
     * Accesseurs
     */
    public function getFormattedTotalAttribute(): string
    {
        return number_format($this->total_amount, 0, ',', ' ') . ' FCFA';
    }

    public function getStatusLabelAttribute(): string
    {
        $labels = [
            self::STATUS_PENDING => 'En attente',
            self::STATUS_CONFIRMED => 'Confirmée',
            self::STATUS_PROCESSING => 'En préparation',
            self::STATUS_READY => 'Prête',
            self::STATUS_DELIVERING => 'En livraison',
            self::STATUS_COMPLETED => 'Livrée',
            self::STATUS_CANCELLED => 'Annulée',
        ];

        return $labels[$this->status] ?? $this->status;
    }

    public function getDeliveryMethodLabelAttribute(): string
    {
        $labels = [
            self::DELIVERY_METHOD_PICKUP => 'Retrait en magasin',
            self::DELIVERY_METHOD_DELIVERY => 'Livraison à domicile',
        ];

        return $labels[$this->delivery_method] ?? $this->delivery_method;
    }

    public function getPaymentStatusLabelAttribute(): string
    {
        $labels = [
            self::PAYMENT_STATUS_PENDING => 'En attente',
            self::PAYMENT_STATUS_AUTHORIZED => 'Autorisé',
            self::PAYMENT_STATUS_PAID => 'Payé',
            self::PAYMENT_STATUS_FAILED => 'Échoué',
            self::PAYMENT_STATUS_REFUNDED => 'Remboursé',
        ];

        return $labels[$this->payment_status] ?? $this->payment_status;
    }

    /**
     * Calcule le montant ajusté après confirmation des poids
     */
    public function calculateAdjustedAmount(): float
    {
        if (!$this->needsWeightConfirmation()) {
            return $this->total_amount;
        }

        $adjustedSubtotal = 0;

        foreach ($this->items as $item) {
            if ($item->actual_weight && $item->isVariableWeight()) {
                // Calcul basé sur le poids réel
                $pricePerKg = $item->unit_price;
                $weightInKg = $item->actual_weight / 1000; // Conversion g en kg
                $adjustedSubtotal += $pricePerKg * $weightInKg * $item->quantity;
            } else {
                // Prix fixe
                $adjustedSubtotal += $item->line_total;
            }
        }

        return $adjustedSubtotal + $this->delivery_fee;
    }
}