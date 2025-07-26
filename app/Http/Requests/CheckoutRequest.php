<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use App\Domain\Order\Models\Order;

class CheckoutRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true; // Checkout public, pas d'authentification requise
    }

    /**
     * Get the validation rules that apply to the request.
     */
    public function rules(): array
    {
        $rules = [
            // Données client
            'customer.name' => 'required|string|max:255',
            'customer.phone' => [
                'required',
                'string',
                'regex:/^(\+225|00225)?[0-9]{10}$/', // Format téléphone ivoirien
            ],
            'customer.email' => 'nullable|email|max:255',

            // Méthode de livraison
            'delivery.method' => 'required|in:' . implode(',', [
                Order::DELIVERY_METHOD_PICKUP,
                Order::DELIVERY_METHOD_DELIVERY,
            ]),

            // Méthode de paiement
            'payment_method' => 'required|in:cash,card',

            // Items du panier
            'cart.items' => 'required|array|min:1',
            'cart.items.*.sku_id' => 'required|integer|exists:product_skus,id',
            'cart.items.*.quantity' => 'required|numeric|min:0.1|max:999',
            'cart.items.*.estimated_weight' => 'nullable|integer|min:100|max:50000', // En grammes
        ];

        // Règles conditionnelles pour la livraison
        if ($this->input('delivery.method') === Order::DELIVERY_METHOD_DELIVERY) {
            $rules['delivery.address'] = 'required|string|max:500';
            $rules['delivery.notes'] = 'nullable|string|max:500';
        }

        // Règles conditionnelles pour le retrait
        if ($this->input('delivery.method') === Order::DELIVERY_METHOD_PICKUP) {
            $rules['delivery.pickup_date'] = 'required|date|after_or_equal:today';
            $rules['delivery.pickup_time_slot'] = 'required|string|in:' . implode(',', array_keys(
                config('shop.pickup.time_slots', [
                    '09:00-12:00' => 'Matin',
                    '14:00-17:00' => 'Après-midi',
                    '17:00-20:00' => 'Soir',
                ])
            ));
        }

        return $rules;
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'customer.name.required' => 'Le nom est obligatoire.',
            'customer.name.max' => 'Le nom ne doit pas dépasser 255 caractères.',
            
            'customer.phone.required' => 'Le numéro de téléphone est obligatoire.',
            'customer.phone.regex' => 'Le numéro de téléphone doit être un numéro ivoirien valide.',
            
            'customer.email.email' => 'L\'adresse email n\'est pas valide.',
            
            'delivery.method.required' => 'Veuillez choisir une méthode de livraison.',
            'delivery.method.in' => 'La méthode de livraison sélectionnée n\'est pas valide.',
            
            'delivery.address.required' => 'L\'adresse de livraison est obligatoire pour la livraison à domicile.',
            'delivery.address.max' => 'L\'adresse de livraison est trop longue.',
            
            'delivery.pickup_date.required' => 'Veuillez choisir une date de retrait.',
            'delivery.pickup_date.date' => 'La date de retrait n\'est pas valide.',
            'delivery.pickup_date.after_or_equal' => 'La date de retrait doit être aujourd\'hui ou dans le futur.',
            
            'delivery.pickup_time_slot.required' => 'Veuillez choisir un créneau horaire.',
            'delivery.pickup_time_slot.in' => 'Le créneau horaire sélectionné n\'est pas valide.',
            
            'payment_method.required' => 'Veuillez choisir un mode de paiement.',
            'payment_method.in' => 'Le mode de paiement sélectionné n\'est pas valide.',
            
            'cart.items.required' => 'Le panier ne peut pas être vide.',
            'cart.items.array' => 'Le format du panier est invalide.',
            'cart.items.min' => 'Le panier doit contenir au moins un article.',
            
            'cart.items.*.sku_id.required' => 'L\'identifiant du produit est manquant.',
            'cart.items.*.sku_id.exists' => 'Le produit sélectionné n\'existe pas.',
            
            'cart.items.*.quantity.required' => 'La quantité est obligatoire.',
            'cart.items.*.quantity.numeric' => 'La quantité doit être un nombre.',
            'cart.items.*.quantity.min' => 'La quantité minimum est de 0.1.',
            'cart.items.*.quantity.max' => 'La quantité maximum est de 999.',
            
            'cart.items.*.estimated_weight.integer' => 'Le poids estimé doit être un nombre entier.',
            'cart.items.*.estimated_weight.min' => 'Le poids minimum est de 100g.',
            'cart.items.*.estimated_weight.max' => 'Le poids maximum est de 50kg.',
        ];
    }

    /**
     * Prepare the data for validation.
     */
    protected function prepareForValidation(): void
    {
        // Nettoyer le numéro de téléphone
        if ($this->has('customer.phone')) {
            $phone = $this->input('customer.phone');
            // Supprimer les espaces et tirets
            $phone = str_replace([' ', '-', '.'], '', $phone);
            // Ajouter le préfixe +225 si nécessaire
            if (strlen($phone) === 10 && !str_starts_with($phone, '+')) {
                $phone = '+225' . $phone;
            }
            $this->merge(['customer' => array_merge($this->input('customer', []), ['phone' => $phone])]);
        }

        // S'assurer que les quantités sont des nombres
        if ($this->has('cart.items')) {
            $items = collect($this->input('cart.items'))->map(function ($item) {
                if (isset($item['quantity'])) {
                    $item['quantity'] = floatval($item['quantity']);
                }
                if (isset($item['estimated_weight'])) {
                    $item['estimated_weight'] = intval($item['estimated_weight']);
                }
                return $item;
            })->toArray();
            
            $this->merge(['cart' => ['items' => $items]]);
        }
    }

    /**
     * Configure the validator instance.
     */
    public function withValidator($validator): void
    {
        $validator->after(function ($validator) {
            // Vérifier le montant minimum pour la livraison
            if ($this->input('delivery.method') === Order::DELIVERY_METHOD_DELIVERY) {
                $subtotal = $this->calculateSubtotal();
                if ($subtotal < 3000) {
                    $validator->errors()->add(
                        'delivery.method',
                        'Le montant minimum pour la livraison est de 3 000 FCFA. Votre panier : ' . number_format($subtotal, 0, ',', ' ') . ' FCFA'
                    );
                }
            }

            // Vérifier la disponibilité du retrait selon le jour
            if ($this->input('delivery.method') === Order::DELIVERY_METHOD_PICKUP) {
                $pickupDate = $this->input('delivery.pickup_date');
                if ($pickupDate) {
                    $dayOfWeek = \Carbon\Carbon::parse($pickupDate)->dayOfWeek;
                    // Si dimanche (0), pas de retrait
                    if ($dayOfWeek === 0) {
                        $validator->errors()->add(
                            'delivery.pickup_date',
                            'Les retraits ne sont pas disponibles le dimanche.'
                        );
                    }
                }
            }
        });
    }

    /**
     * Calcule le sous-total du panier
     */
    protected function calculateSubtotal(): float
    {
        $items = $this->input('cart.items', []);
        $subtotal = 0;

        foreach ($items as $item) {
            // On devrait idéalement récupérer le prix depuis la DB
            // mais pour la validation on utilise une estimation
            $subtotal += ($item['price'] ?? 0) * ($item['quantity'] ?? 0);
        }

        return $subtotal;
    }
}