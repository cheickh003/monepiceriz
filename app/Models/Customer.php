<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use App\Domain\Order\Models\Order;
use Illuminate\Support\Str;

class Customer extends Model
{
    use HasFactory;

    protected $fillable = [
        'guest_token',
        'name',
        'phone',
        'phone_hash',
        'email',
    ];

    protected $casts = [
        'guest_token' => 'string',
    ];

    /**
     * Boot method pour générer automatiquement le guest_token
     */
    protected static function boot()
    {
        parent::boot();

        static::creating(function ($customer) {
            if (empty($customer->guest_token)) {
                $customer->guest_token = Str::uuid();
            }
            
            if (!empty($customer->phone) && empty($customer->phone_hash)) {
                $customer->phone_hash = hash('sha256', $customer->phone);
            }
        });
    }

    /**
     * Relations
     */
    public function orders(): HasMany
    {
        return $this->hasMany(Order::class);
    }

    /**
     * Trouve ou crée un client basé sur le téléphone
     */
    public static function findOrCreateByPhone(string $phone, array $data = []): self
    {
        $phoneHash = hash('sha256', $phone);
        
        $customer = self::where('phone_hash', $phoneHash)->first();
        
        if (!$customer) {
            $customer = self::create([
                'phone' => $phone,
                'phone_hash' => $phoneHash,
                'name' => $data['name'] ?? '',
                'email' => $data['email'] ?? null,
            ]);
        }
        
        return $customer;
    }
}
