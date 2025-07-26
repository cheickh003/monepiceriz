<?php

namespace App\Exports;

use App\Domain\Order\Models\Order;
use Maatwebsite\Excel\Concerns\FromQuery;
use Maatwebsite\Excel\Concerns\Exportable;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use Maatwebsite\Excel\Concerns\WithStyles;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

class OrdersExport implements FromQuery, WithHeadings, WithMapping, ShouldAutoSize, WithStyles
{
    use Exportable;

    protected array $filters;

    public function __construct(array $filters = [])
    {
        $this->filters = $filters;
    }

    /**
     * Query des commandes à exporter
     */
    public function query()
    {
        $query = Order::with(['customer', 'items']);

        if (!empty($this->filters['status'])) {
            $query->where('status', $this->filters['status']);
        }

        if (!empty($this->filters['payment_status'])) {
            $query->where('payment_status', $this->filters['payment_status']);
        }

        if (!empty($this->filters['date_from'])) {
            $query->whereDate('created_at', '>=', $this->filters['date_from']);
        }

        if (!empty($this->filters['date_to'])) {
            $query->whereDate('created_at', '<=', $this->filters['date_to']);
        }

        return $query->orderBy('created_at', 'desc');
    }

    /**
     * En-têtes du fichier
     */
    public function headings(): array
    {
        return [
            'N° Commande',
            'Date',
            'Heure',
            'Client',
            'Téléphone',
            'Email',
            'Nombre d\'articles',
            'Sous-total',
            'Frais de livraison',
            'Total',
            'Mode de livraison',
            'Adresse de livraison',
            'Date de retrait',
            'Créneau horaire',
            'Statut',
            'Statut paiement',
            'Mode de paiement',
            'Référence paiement',
            'Poids variable',
            'Poids confirmé',
            'Notes',
        ];
    }

    /**
     * Mapping des données
     */
    public function map($order): array
    {
        return [
            $order->order_number,
            $order->created_at->format('d/m/Y'),
            $order->created_at->format('H:i'),
            $order->customer_name,
            $order->customer_phone,
            $order->customer_email ?? '-',
            $order->items->count(),
            number_format($order->subtotal, 0, ',', ' ') . ' FCFA',
            number_format($order->delivery_fee, 0, ',', ' ') . ' FCFA',
            number_format($order->total_amount, 0, ',', ' ') . ' FCFA',
            $order->delivery_method_label,
            $order->delivery_address ?? '-',
            $order->pickup_date ? $order->pickup_date->format('d/m/Y') : '-',
            $order->pickup_time_slot ?? '-',
            $order->status_label,
            $order->payment_status_label,
            $order->payment_method === 'cash' ? 'Espèces' : 'Carte',
            $order->payment_reference ?? '-',
            $order->requires_weight_confirmation ? 'Oui' : 'Non',
            $order->weight_confirmed_at ? 'Oui' : 'Non',
            $order->notes ?? '-',
        ];
    }

    /**
     * Styles pour le fichier Excel
     */
    public function styles(Worksheet $sheet)
    {
        return [
            // Style pour la première ligne (en-têtes)
            1 => [
                'font' => [
                    'bold' => true,
                    'size' => 12,
                ],
                'fill' => [
                    'fillType' => \PhpOffice\PhpSpreadsheet\Style\Fill::FILL_SOLID,
                    'startColor' => [
                        'argb' => 'FFE5E5E5',
                    ],
                ],
            ],
        ];
    }
}