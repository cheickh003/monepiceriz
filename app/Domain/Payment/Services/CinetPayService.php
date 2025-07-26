<?php

namespace App\Domain\Payment\Services;

use App\Domain\Order\Models\Order;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class CinetPayService
{
    protected string $apiKey;
    protected string $siteId;
    protected string $secretKey;
    protected string $apiUrl;
    protected string $notifyUrl;
    protected string $returnUrl;
    protected string $cancelUrl;

    public function __construct()
    {
        $this->apiKey = config('cinetpay.api_key');
        $this->siteId = config('cinetpay.site_id');
        $this->secretKey = config('cinetpay.secret_key');
        $this->apiUrl = config('cinetpay.api_url', 'https://api-checkout.cinetpay.com/v2');
        $this->notifyUrl = config('cinetpay.notify_url');
        $this->returnUrl = config('cinetpay.return_url');
        $this->cancelUrl = config('cinetpay.cancel_url');
    }

    /**
     * Initialise un paiement CinetPay
     */
    public function initializePayment(Order $order): string
    {
        try {
            $transactionId = $this->generateTransactionId($order);
            
            $data = [
                'apikey' => $this->apiKey,
                'site_id' => $this->siteId,
                'transaction_id' => $transactionId,
                'amount' => intval($order->total_amount),
                'currency' => 'XOF',
                'description' => "Commande {$order->order_number}",
                'notify_url' => $this->notifyUrl,
                'return_url' => route('shop.order.success', $order),
                'cancel_url' => route('shop.order.failed', ['order_number' => $order->order_number]),
                'customer_name' => $order->customer_name,
                'customer_surname' => '',
                'customer_email' => $order->customer_email ?? '',
                'customer_phone_number' => $this->formatPhoneNumber($order->customer_phone),
                'customer_address' => $order->delivery_address ?? '',
                'customer_city' => 'Abidjan',
                'customer_country' => 'CI',
                'customer_zip_code' => '00225',
                'channels' => 'ALL',
                'lang' => 'fr',
                'metadata' => json_encode([
                    'order_id' => $order->id,
                    'order_number' => $order->order_number,
                ]),
            ];

            // Pour les produits à poids variable, utiliser la pré-autorisation
            if ($order->requiresPreAuthorization()) {
                $data['payment_method'] = 'PREAUTH';
                $data['preauth_amount'] = intval($order->total_amount * 1.2); // 20% de marge
            }

            $response = Http::post($this->apiUrl . '/payment', $data);

            if ($response->successful()) {
                $result = $response->json();
                
                if ($result['code'] === '201') {
                    // Sauvegarder la référence de transaction
                    $order->update([
                        'payment_reference' => $transactionId,
                    ]);

                    Log::info('CinetPay payment initialized', [
                        'order_id' => $order->id,
                        'transaction_id' => $transactionId,
                        'payment_url' => $result['data']['payment_url'],
                    ]);

                    return $result['data']['payment_url'];
                }
            }

            throw new \Exception('Failed to initialize payment: ' . $response->body());

        } catch (\Exception $e) {
            Log::error('CinetPay initialization error', [
                'order_id' => $order->id,
                'error' => $e->getMessage(),
            ]);
            throw $e;
        }
    }

    /**
     * Capture un paiement pré-autorisé
     */
    public function capturePayment(Order $order): array
    {
        try {
            if (!$order->payment_reference) {
                throw new \Exception('No payment reference found');
            }

            $data = [
                'apikey' => $this->apiKey,
                'site_id' => $this->siteId,
                'transaction_id' => $order->payment_reference,
                'amount' => intval($order->total_amount),
            ];

            $response = Http::post($this->apiUrl . '/payment/capture', $data);

            if ($response->successful()) {
                $result = $response->json();
                
                if ($result['code'] === '00') {
                    Log::info('Payment captured successfully', [
                        'order_id' => $order->id,
                        'transaction_id' => $order->payment_reference,
                        'amount' => $order->total_amount,
                    ]);

                    return [
                        'success' => true,
                        'transaction_id' => $order->payment_reference,
                        'amount' => $order->total_amount,
                    ];
                }
            }

            return [
                'success' => false,
                'message' => $result['message'] ?? 'Capture failed',
            ];

        } catch (\Exception $e) {
            Log::error('Payment capture error', [
                'order_id' => $order->id,
                'error' => $e->getMessage(),
            ]);
            
            return [
                'success' => false,
                'message' => $e->getMessage(),
            ];
        }
    }

    /**
     * Rembourse un paiement
     */
    public function refundPayment(Order $order, float $amount = null): array
    {
        try {
            if (!$order->payment_reference) {
                throw new \Exception('No payment reference found');
            }

            $refundAmount = $amount ?? $order->total_amount;

            $data = [
                'apikey' => $this->apiKey,
                'site_id' => $this->siteId,
                'transaction_id' => $order->payment_reference,
                'amount' => intval($refundAmount),
            ];

            $response = Http::post($this->apiUrl . '/payment/refund', $data);

            if ($response->successful()) {
                $result = $response->json();
                
                if ($result['code'] === '00') {
                    Log::info('Payment refunded successfully', [
                        'order_id' => $order->id,
                        'transaction_id' => $order->payment_reference,
                        'amount' => $refundAmount,
                    ]);

                    return [
                        'success' => true,
                        'transaction_id' => $order->payment_reference,
                        'amount' => $refundAmount,
                    ];
                }
            }

            return [
                'success' => false,
                'message' => $result['message'] ?? 'Refund failed',
            ];

        } catch (\Exception $e) {
            Log::error('Payment refund error', [
                'order_id' => $order->id,
                'error' => $e->getMessage(),
            ]);
            
            return [
                'success' => false,
                'message' => $e->getMessage(),
            ];
        }
    }

    /**
     * Vérifie le statut d'une transaction
     */
    public function checkTransactionStatus(string $transactionId): array
    {
        try {
            $data = [
                'apikey' => $this->apiKey,
                'site_id' => $this->siteId,
                'transaction_id' => $transactionId,
            ];

            $response = Http::post($this->apiUrl . '/payment/check', $data);

            if ($response->successful()) {
                $result = $response->json();
                
                if ($result['code'] === '00') {
                    return [
                        'status' => $result['data']['status'],
                        'amount' => $result['data']['amount'],
                        'transaction_id' => $transactionId,
                        'payment_method' => $result['data']['payment_method'] ?? null,
                        'payment_date' => $result['data']['payment_date'] ?? null,
                    ];
                }
            }

            throw new \Exception('Failed to check transaction status');

        } catch (\Exception $e) {
            Log::error('Transaction status check error', [
                'transaction_id' => $transactionId,
                'error' => $e->getMessage(),
            ]);
            throw $e;
        }
    }

    /**
     * Génère un ID de transaction unique
     */
    protected function generateTransactionId(Order $order): string
    {
        return sprintf(
            '%s-%s-%s',
            $order->order_number,
            date('YmdHis'),
            Str::random(6)
        );
    }

    /**
     * Formate un numéro de téléphone pour CinetPay
     */
    protected function formatPhoneNumber(string $phone): string
    {
        // Retirer les espaces, tirets, points
        $phone = preg_replace('/[\s\-\.]/', '', $phone);
        
        // Retirer le préfixe +225 ou 00225 s'il existe
        $phone = preg_replace('/^(\+225|00225)/', '', $phone);
        
        // S'assurer que le numéro fait 10 chiffres
        if (strlen($phone) === 10) {
            return $phone;
        }
        
        return $phone;
    }

    /**
     * Valide la signature d'un webhook
     */
    public function validateWebhookSignature(array $data, string $signature): bool
    {
        $expectedSignature = $this->generateWebhookSignature($data);
        return hash_equals($expectedSignature, $signature);
    }

    /**
     * Génère la signature pour un webhook
     */
    protected function generateWebhookSignature(array $data): string
    {
        $string = $data['cpm_site_id'] . 
                 $data['cpm_trans_id'] . 
                 $data['cpm_trans_date'] . 
                 $data['cpm_amount'] . 
                 $data['cpm_currency'] . 
                 $this->secretKey;
                 
        return hash('sha256', $string);
    }

    /**
     * Retourne les méthodes de paiement disponibles
     */
    public function getAvailablePaymentMethods(): array
    {
        return [
            'VISA' => [
                'name' => 'Visa',
                'icon' => 'visa',
                'enabled' => true,
            ],
            'MASTERCARD' => [
                'name' => 'Mastercard',
                'icon' => 'mastercard',
                'enabled' => true,
            ],
            'ORANGE_MONEY' => [
                'name' => 'Orange Money',
                'icon' => 'orange-money',
                'enabled' => true,
            ],
            'MTN_MONEY' => [
                'name' => 'MTN Money',
                'icon' => 'mtn-money',
                'enabled' => true,
            ],
            'MOOV_MONEY' => [
                'name' => 'Moov Money',
                'icon' => 'moov-money',
                'enabled' => true,
            ],
            'WAVE' => [
                'name' => 'Wave',
                'icon' => 'wave',
                'enabled' => true,
            ],
        ];
    }

    /**
     * Calcule les frais de transaction
     */
    public function calculateTransactionFees(float $amount, string $paymentMethod = 'CARD'): float
    {
        $fees = [
            'CARD' => 0.018, // 1.8%
            'ORANGE_MONEY' => 0.015, // 1.5%
            'MTN_MONEY' => 0.015, // 1.5%
            'MOOV_MONEY' => 0.015, // 1.5%
            'WAVE' => 0.01, // 1%
        ];

        $rate = $fees[$paymentMethod] ?? 0.02; // 2% par défaut
        return round($amount * $rate, 0);
    }
}