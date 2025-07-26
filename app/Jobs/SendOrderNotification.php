<?php

namespace App\Jobs;

use App\Domain\Order\Models\Order;
use App\Notifications\OrderConfirmation;
use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\Log;

class SendOrderNotification implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    /**
     * The number of times the job may be attempted.
     */
    public $tries = 3;

    /**
     * The number of seconds the job can run before timing out.
     */
    public $timeout = 120;

    protected Order $order;
    protected string $type;
    protected array $recipients;

    /**
     * Create a new job instance.
     */
    public function __construct(Order $order, string $type = 'confirmation', array $recipients = ['customer'])
    {
        $this->order = $order;
        $this->type = $type;
        $this->recipients = $recipients;
    }

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        try {
            // Envoyer au client
            if (in_array('customer', $this->recipients)) {
                $this->notifyCustomer();
            }

            // Envoyer aux admins
            if (in_array('admin', $this->recipients)) {
                $this->notifyAdmins();
            }

            // Envoyer au livreur (si applicable)
            if (in_array('driver', $this->recipients) && $this->order->delivery_method === 'delivery') {
                $this->notifyDriver();
            }

            Log::info('Order notification sent', [
                'order_id' => $this->order->id,
                'type' => $this->type,
                'recipients' => $this->recipients,
            ]);

        } catch (\Exception $e) {
            Log::error('Failed to send order notification', [
                'order_id' => $this->order->id,
                'type' => $this->type,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            // Re-throw to trigger retry
            throw $e;
        }
    }

    /**
     * Notify the customer
     */
    protected function notifyCustomer(): void
    {
        // Si le client a un compte
        if ($this->order->customer_id && $this->order->customer) {
            $this->order->customer->notify(new OrderConfirmation($this->order, $this->type));
        } else {
            // Notification anonyme via email/SMS
            $this->sendAnonymousNotification();
        }
    }

    /**
     * Send notification to anonymous customer
     */
    protected function sendAnonymousNotification(): void
    {
        // Créer un notifiable temporaire
        $notifiable = new class {
            use \Illuminate\Notifications\Notifiable;
            
            public $email;
            public $phone;
            
            public function routeNotificationForMail()
            {
                return $this->email;
            }
            
            public function routeNotificationForSms()
            {
                return $this->phone;
            }
        };

        $notifiable->email = $this->order->customer_email;
        $notifiable->phone = $this->order->customer_phone;

        // Envoyer uniquement si on a au moins une méthode de contact
        if ($notifiable->email || $notifiable->phone) {
            $notifiable->notify(new OrderConfirmation($this->order, $this->type));
        }
    }

    /**
     * Notify administrators
     */
    protected function notifyAdmins(): void
    {
        $admins = User::whereIn('role', ['admin', 'manager'])->get();
        
        foreach ($admins as $admin) {
            // Notification simple pour les admins
            $admin->notify(new \Illuminate\Notifications\Notification {
                public function via($notifiable)
                {
                    return ['mail', 'database'];
                }
                
                public function toMail($notifiable)
                {
                    $mail = (new \Illuminate\Notifications\Messages\MailMessage)
                        ->subject('Nouvelle commande ' . $this->order->order_number)
                        ->greeting('Nouvelle commande reçue')
                        ->line('Une nouvelle commande a été passée.')
                        ->line('**Numéro :** ' . $this->order->order_number)
                        ->line('**Client :** ' . $this->order->customer_name)
                        ->line('**Montant :** ' . $this->order->formatted_total)
                        ->line('**Statut :** ' . $this->order->status_label)
                        ->action('Voir la commande', url('/admin/orders/' . $this->order->id));
                        
                    if ($this->order->requires_weight_confirmation) {
                        $mail->line('⚠️ Cette commande contient des produits à poids variable.');
                    }
                    
                    return $mail;
                }
                
                public function toArray($notifiable)
                {
                    return [
                        'order_id' => $this->order->id,
                        'order_number' => $this->order->order_number,
                        'customer_name' => $this->order->customer_name,
                        'total' => $this->order->total_amount,
                        'type' => 'new_order',
                    ];
                }
            });
        }
    }

    /**
     * Notify delivery driver
     */
    protected function notifyDriver(): void
    {
        // Cette méthode serait utilisée si on a un système de gestion des livreurs
        // Pour l'instant, on log juste l'intention
        Log::info('Driver notification would be sent here', [
            'order_id' => $this->order->id,
            'delivery_address' => $this->order->delivery_address,
        ]);
    }

    /**
     * Calculate delay for retries
     */
    public function backoff(): array
    {
        return [60, 300, 900]; // 1 min, 5 min, 15 min
    }

    /**
     * Handle a job failure
     */
    public function failed(\Throwable $exception): void
    {
        Log::error('Order notification job failed permanently', [
            'order_id' => $this->order->id,
            'type' => $this->type,
            'error' => $exception->getMessage(),
        ]);
        
        // Optionally send alert to admin about failed notification
    }

    /**
     * Get the tags that should be assigned to the job
     */
    public function tags(): array
    {
        return [
            'order-notification',
            'order:' . $this->order->id,
            'type:' . $this->type,
        ];
    }
}