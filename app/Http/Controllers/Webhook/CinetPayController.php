<?php

namespace App\Http\Controllers\Webhook;

use App\Http\Controllers\Controller;
use App\Domain\Order\Models\Order;
use App\Domain\Payment\Services\CinetPayService;
use App\Jobs\SendOrderNotification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Cache;

class CinetPayController extends Controller
{
    protected CinetPayService $cinetPayService;

    public function __construct(CinetPayService $cinetPayService)
    {
        $this->cinetPayService = $cinetPayService;
    }

    /**
     * Traite les notifications webhook de CinetPay
     */
    public function handle(Request $request)
    {
        Log::info('CinetPay webhook received', $request->all());

        try {
            // Vérifier la signature du webhook
            if (!$this->verifyWebhookSignature($request)) {
                Log::warning('Invalid CinetPay webhook signature', [
                    'ip' => $request->ip(),
                    'data' => $request->all()
                ]);
                return response()->json(['error' => 'Invalid signature'], 401);
            }

            // Récupérer les données du webhook
            $transactionId = $request->input('cpm_trans_id');
            $status = $request->input('cpm_trans_status');
            $amount = $request->input('cpm_amount');
            $currency = $request->input('cpm_currency');
            $customData = $request->input('cpm_custom');

            // Éviter les webhooks dupliqués
            $cacheKey = "cinetpay_webhook_{$transactionId}_{$status}";
            if (Cache::has($cacheKey)) {
                Log::info('Duplicate CinetPay webhook ignored', ['transaction_id' => $transactionId]);
                return response()->json(['success' => true, 'message' => 'Already processed']);
            }
            Cache::put($cacheKey, true, now()->addMinutes(30));

            // Extraire l'order_id des données personnalisées
            $orderData = json_decode($customData, true);
            $orderId = $orderData['order_id'] ?? null;

            if (!$orderId) {
                Log::error('Order ID not found in webhook data', ['custom_data' => $customData]);
                return response()->json(['error' => 'Order ID not found'], 400);
            }

            // Récupérer la commande
            $order = Order::find($orderId);
            if (!$order) {
                Log::error('Order not found', ['order_id' => $orderId]);
                return response()->json(['error' => 'Order not found'], 404);
            }

            // Traiter selon le statut
            switch ($status) {
                case 'ACCEPTED':
                    $this->handleAcceptedPayment($order, $transactionId, $amount);
                    break;

                case 'REFUSED':
                case 'CANCELLED':
                    $this->handleFailedPayment($order, $transactionId, $status);
                    break;

                case 'PENDING':
                    $this->handlePendingPayment($order, $transactionId);
                    break;

                default:
                    Log::warning('Unknown CinetPay payment status', [
                        'status' => $status,
                        'order_id' => $orderId
                    ]);
            }

            return response()->json(['success' => true]);

        } catch (\Exception $e) {
            Log::error('CinetPay webhook error', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            return response()->json(['error' => 'Internal server error'], 500);
        }
    }

    /**
     * Vérifie la signature du webhook
     */
    protected function verifyWebhookSignature(Request $request): bool
    {
        $signature = $request->header('X-CinetPay-Signature');
        if (!$signature) {
            return false;
        }

        // Construire la chaîne à signer
        $data = [
            'cpm_site_id' => $request->input('cpm_site_id'),
            'cpm_trans_id' => $request->input('cpm_trans_id'),
            'cpm_trans_date' => $request->input('cpm_trans_date'),
            'cpm_amount' => $request->input('cpm_amount'),
            'cpm_currency' => $request->input('cpm_currency'),
            'signature' => config('cinetpay.secret_key'),
        ];

        $computedSignature = hash('sha256', implode('', $data));

        return hash_equals($computedSignature, $signature);
    }

    /**
     * Traite un paiement accepté
     */
    protected function handleAcceptedPayment(Order $order, string $transactionId, float $amount)
    {
        // Vérifier que le montant correspond
        if (abs($order->total_amount - $amount) > 0.01) {
            Log::error('Payment amount mismatch', [
                'order_id' => $order->id,
                'expected' => $order->total_amount,
                'received' => $amount
            ]);
            return;
        }

        // Mettre à jour la commande
        $order->update([
            'payment_status' => Order::PAYMENT_STATUS_PAID,
            'payment_reference' => $transactionId,
            'status' => Order::STATUS_CONFIRMED,
        ]);

        // Logger le paiement
        Log::info('Payment accepted', [
            'order_id' => $order->id,
            'order_number' => $order->order_number,
            'transaction_id' => $transactionId,
            'amount' => $amount
        ]);

        // Envoyer la notification de confirmation
        SendOrderNotification::dispatch($order, 'confirmation');
    }

    /**
     * Traite un paiement échoué
     */
    protected function handleFailedPayment(Order $order, string $transactionId, string $status)
    {
        // Mettre à jour la commande
        $order->update([
            'payment_status' => Order::PAYMENT_STATUS_FAILED,
            'payment_reference' => $transactionId,
            'notes' => "Paiement {$status} - Transaction: {$transactionId}",
        ]);

        // Logger l'échec
        Log::warning('Payment failed', [
            'order_id' => $order->id,
            'order_number' => $order->order_number,
            'transaction_id' => $transactionId,
            'status' => $status
        ]);

        // Envoyer une notification d'échec
        SendOrderNotification::dispatch($order, 'payment_failed');
    }

    /**
     * Traite un paiement en attente
     */
    protected function handlePendingPayment(Order $order, string $transactionId)
    {
        // Logger le statut en attente
        Log::info('Payment pending', [
            'order_id' => $order->id,
            'order_number' => $order->order_number,
            'transaction_id' => $transactionId
        ]);

        // Pas de mise à jour du statut pour l'instant
    }

    /**
     * Vérifie manuellement le statut d'un paiement
     */
    public function checkStatus(Request $request)
    {
        $request->validate([
            'transaction_id' => 'required|string',
            'order_id' => 'required|integer|exists:orders,id',
        ]);

        try {
            $order = Order::findOrFail($request->input('order_id'));
            
            // Vérifier le statut via l'API CinetPay
            $status = $this->cinetPayService->checkTransactionStatus(
                $request->input('transaction_id')
            );

            if ($status['status'] === 'ACCEPTED' && $order->payment_status !== Order::PAYMENT_STATUS_PAID) {
                $this->handleAcceptedPayment($order, $status['transaction_id'], $status['amount']);
            }

            return response()->json([
                'success' => true,
                'status' => $status,
                'order_status' => $order->fresh()->payment_status,
            ]);

        } catch (\Exception $e) {
            Log::error('Payment status check failed', [
                'error' => $e->getMessage(),
                'transaction_id' => $request->input('transaction_id')
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Impossible de vérifier le statut du paiement',
            ], 500);
        }
    }
}