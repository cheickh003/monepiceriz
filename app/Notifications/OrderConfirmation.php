<?php

namespace App\Notifications;

use App\Domain\Order\Models\Order;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class OrderConfirmation extends Notification implements ShouldQueue
{
    use Queueable;

    protected Order $order;
    protected string $type;

    /**
     * Create a new notification instance.
     */
    public function __construct(Order $order, string $type = 'confirmation')
    {
        $this->order = $order;
        $this->type = $type;
    }

    /**
     * Get the notification's delivery channels.
     */
    public function via(object $notifiable): array
    {
        $channels = ['mail'];
        
        // Ajouter SMS si configuré et si le client a un téléphone
        if (config('services.sms.enabled') && $this->order->customer_phone) {
            $channels[] = 'sms';
        }
        
        return $channels;
    }

    /**
     * Get the mail representation of the notification.
     */
    public function toMail(object $notifiable): MailMessage
    {
        $mail = (new MailMessage)
            ->subject($this->getSubject())
            ->greeting($this->getGreeting());

        switch ($this->type) {
            case 'confirmation':
                $mail = $this->buildConfirmationMail($mail);
                break;
            case 'processing':
                $mail = $this->buildProcessingMail($mail);
                break;
            case 'ready':
                $mail = $this->buildReadyMail($mail);
                break;
            case 'delivered':
                $mail = $this->buildDeliveredMail($mail);
                break;
            case 'cancelled':
                $mail = $this->buildCancelledMail($mail);
                break;
            case 'payment_failed':
                $mail = $this->buildPaymentFailedMail($mail);
                break;
        }

        return $mail->salutation('L\'équipe MonEpice&Riz');
    }

    /**
     * Build confirmation email
     */
    protected function buildConfirmationMail(MailMessage $mail): MailMessage
    {
        $mail->line('Nous avons bien reçu votre commande ' . $this->order->order_number . ' et nous vous remercions pour votre confiance.')
            ->line('**Récapitulatif de votre commande :**');

        // Ajouter les items
        foreach ($this->order->items as $item) {
            $mail->line('• ' . $item->product_name . ' - ' . $item->sku_name . ' x' . $item->quantity . ' - ' . $item->formatted_line_total);
            
            if ($item->is_variable_weight) {
                $mail->line('  *Produit à poids variable - Poids estimé : ' . $item->estimated_weight . 'g*');
            }
        }

        $mail->line('---')
            ->line('**Sous-total :** ' . $this->order->formatted_subtotal)
            ->line('**Frais de livraison :** ' . formatPrice($this->order->delivery_fee))
            ->line('**Total :** ' . $this->order->formatted_total)
            ->line('---');

        // Informations de livraison
        if ($this->order->delivery_method === 'pickup') {
            $mail->line('**Mode de récupération :** Retrait en magasin')
                ->line('**Date de retrait :** ' . $this->order->pickup_date->format('d/m/Y'))
                ->line('**Créneau horaire :** ' . $this->order->pickup_time_slot)
                ->line('**Adresse :** MonEpice&Riz, Cocody, Abidjan');
        } else {
            $mail->line('**Mode de récupération :** Livraison à domicile')
                ->line('**Adresse de livraison :** ' . $this->order->delivery_address)
                ->line('**Délai estimé :** 24-48h');
        }

        // Instructions supplémentaires
        if ($this->order->requires_weight_confirmation) {
            $mail->line('---')
                ->line('**Note importante :** Votre commande contient des produits à poids variable. Le montant final pourra être ajusté selon le poids réel des produits.');
        }

        $mail->action('Suivre ma commande', url('/shop/order/track/' . $this->order->order_number));

        return $mail;
    }

    /**
     * Build processing email
     */
    protected function buildProcessingMail(MailMessage $mail): MailMessage
    {
        return $mail->line('Bonne nouvelle ! Nous avons commencé la préparation de votre commande ' . $this->order->order_number . '.')
            ->line('Notre équipe sélectionne avec soin vos produits pour garantir leur fraîcheur et leur qualité.')
            ->line('Vous recevrez une nouvelle notification dès que votre commande sera prête.')
            ->action('Voir ma commande', url('/shop/order/track/' . $this->order->order_number));
    }

    /**
     * Build ready email
     */
    protected function buildReadyMail(MailMessage $mail): MailMessage
    {
        $mail->line('Votre commande ' . $this->order->order_number . ' est prête !');

        if ($this->order->delivery_method === 'pickup') {
            $mail->line('Vous pouvez venir la récupérer selon les informations suivantes :')
                ->line('**Date :** ' . $this->order->pickup_date->format('d/m/Y'))
                ->line('**Créneau :** ' . $this->order->pickup_time_slot)
                ->line('**Adresse :** MonEpice&Riz, Cocody, Abidjan')
                ->line('**Téléphone :** +225 07 00 00 00 00');
        } else {
            $mail->line('Notre livreur va prendre en charge votre commande très prochainement.')
                ->line('Il vous contactera au ' . $this->order->customer_phone . ' avant son arrivée.');
        }

        return $mail->action('Voir ma commande', url('/shop/order/track/' . $this->order->order_number));
    }

    /**
     * Build delivered email
     */
    protected function buildDeliveredMail(MailMessage $mail): MailMessage
    {
        return $mail->line('Votre commande ' . $this->order->order_number . ' a été livrée avec succès !')
            ->line('Nous espérons que vous êtes satisfait de vos achats.')
            ->line('N\'hésitez pas à nous faire part de vos commentaires pour nous aider à améliorer notre service.')
            ->action('Donner mon avis', url('/shop/order/review/' . $this->order->order_number))
            ->line('Merci de votre confiance et à très bientôt !');
    }

    /**
     * Build cancelled email
     */
    protected function buildCancelledMail(MailMessage $mail): MailMessage
    {
        return $mail->line('Votre commande ' . $this->order->order_number . ' a été annulée.')
            ->line('Si vous avez déjà effectué un paiement, vous serez remboursé dans les plus brefs délais.')
            ->line('Pour toute question, n\'hésitez pas à nous contacter.')
            ->action('Contacter le support', url('/contact'))
            ->line('Nous espérons vous revoir bientôt sur notre boutique.');
    }

    /**
     * Build payment failed email
     */
    protected function buildPaymentFailedMail(MailMessage $mail): MailMessage
    {
        return $mail->line('Le paiement de votre commande ' . $this->order->order_number . ' a échoué.')
            ->line('Votre commande est en attente et sera automatiquement annulée dans 24h si le paiement n\'est pas effectué.')
            ->action('Réessayer le paiement', url('/shop/order/' . $this->order->id . '/retry-payment'))
            ->line('Si vous rencontrez des difficultés, n\'hésitez pas à nous contacter.');
    }

    /**
     * Get the SMS representation of the notification.
     */
    public function toSms(object $notifiable): array
    {
        $message = match($this->type) {
            'confirmation' => "MonEpice&Riz: Commande {$this->order->order_number} confirmée. Total: {$this->order->formatted_total}",
            'processing' => "MonEpice&Riz: Votre commande {$this->order->order_number} est en préparation.",
            'ready' => "MonEpice&Riz: Commande {$this->order->order_number} prête! " . 
                       ($this->order->delivery_method === 'pickup' ? 
                        "À récupérer le {$this->order->pickup_date->format('d/m')} {$this->order->pickup_time_slot}" : 
                        "Livraison en cours"),
            'delivered' => "MonEpice&Riz: Commande {$this->order->order_number} livrée. Merci!",
            'cancelled' => "MonEpice&Riz: Commande {$this->order->order_number} annulée.",
            'payment_failed' => "MonEpice&Riz: Échec paiement commande {$this->order->order_number}. Réessayez sur monepiceriz.ci",
            default => "MonEpice&Riz: Mise à jour de votre commande {$this->order->order_number}"
        };

        return [
            'to' => $this->order->customer_phone,
            'message' => $message,
        ];
    }

    /**
     * Get email subject
     */
    protected function getSubject(): string
    {
        return match($this->type) {
            'confirmation' => 'Confirmation de votre commande ' . $this->order->order_number,
            'processing' => 'Votre commande est en préparation',
            'ready' => 'Votre commande est prête !',
            'delivered' => 'Votre commande a été livrée',
            'cancelled' => 'Annulation de votre commande',
            'payment_failed' => 'Échec du paiement de votre commande',
            default => 'Mise à jour de votre commande ' . $this->order->order_number
        };
    }

    /**
     * Get email greeting
     */
    protected function getGreeting(): string
    {
        $name = $this->order->customer_name;
        return "Bonjour " . ($name ? ucfirst(explode(' ', $name)[0]) : '') . ",";
    }

    /**
     * Get the array representation of the notification.
     */
    public function toArray(object $notifiable): array
    {
        return [
            'order_id' => $this->order->id,
            'order_number' => $this->order->order_number,
            'type' => $this->type,
            'status' => $this->order->status,
            'total' => $this->order->total_amount,
        ];
    }
}

// Helper function for price formatting
if (!function_exists('formatPrice')) {
    function formatPrice($amount) {
        return number_format($amount, 0, ',', ' ') . ' FCFA';
    }
}