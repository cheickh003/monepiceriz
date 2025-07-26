<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Commande {{ $order->order_number }} - MonEpice&Riz</title>
    <style>
        @media print {
            body { margin: 0; }
            .no-print { display: none; }
        }
        
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
        }
        
        .header {
            text-align: center;
            margin-bottom: 30px;
            border-bottom: 2px solid #333;
            padding-bottom: 20px;
        }
        
        .logo {
            font-size: 24px;
            font-weight: bold;
            color: #d97706;
        }
        
        .order-info {
            display: flex;
            justify-content: space-between;
            margin-bottom: 30px;
        }
        
        .section {
            margin-bottom: 25px;
        }
        
        .section-title {
            font-size: 18px;
            font-weight: bold;
            margin-bottom: 10px;
            color: #1f2937;
        }
        
        .info-grid {
            display: grid;
            grid-template-columns: 150px 1fr;
            gap: 10px;
        }
        
        .info-label {
            font-weight: bold;
        }
        
        table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 10px;
        }
        
        th, td {
            border: 1px solid #ddd;
            padding: 8px;
            text-align: left;
        }
        
        th {
            background-color: #f3f4f6;
            font-weight: bold;
        }
        
        .text-right {
            text-align: right;
        }
        
        .total-section {
            margin-top: 20px;
            text-align: right;
        }
        
        .total-row {
            display: flex;
            justify-content: flex-end;
            margin-bottom: 5px;
        }
        
        .total-label {
            width: 150px;
            text-align: right;
            margin-right: 20px;
        }
        
        .total-value {
            width: 150px;
            text-align: right;
        }
        
        .grand-total {
            font-size: 20px;
            font-weight: bold;
            border-top: 2px solid #333;
            padding-top: 10px;
            margin-top: 10px;
        }
        
        .footer {
            margin-top: 50px;
            text-align: center;
            font-size: 12px;
            color: #666;
        }
        
        .badge {
            display: inline-block;
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 12px;
            font-weight: bold;
        }
        
        .badge-success {
            background-color: #10b981;
            color: white;
        }
        
        .badge-warning {
            background-color: #f59e0b;
            color: white;
        }
        
        .badge-danger {
            background-color: #ef4444;
            color: white;
        }
        
        .badge-info {
            background-color: #3b82f6;
            color: white;
        }
        
        .weight-notice {
            background-color: #fef3c7;
            border: 1px solid #f59e0b;
            padding: 10px;
            margin: 20px 0;
            border-radius: 4px;
        }
    </style>
</head>
<body>
    <div class="no-print" style="margin-bottom: 20px;">
        <button onclick="window.print()" style="padding: 10px 20px; font-size: 16px; cursor: pointer;">
            Imprimer
        </button>
        <button onclick="window.close()" style="padding: 10px 20px; font-size: 16px; cursor: pointer; margin-left: 10px;">
            Fermer
        </button>
    </div>

    <div class="header">
        <div class="logo">MonEpice&Riz</div>
        <div>Votre épicerie en ligne à Abidjan</div>
        <div style="margin-top: 10px; font-size: 14px;">
            Tél: {{ config('shop.contact.phone') }} | Email: {{ config('shop.contact.email') }}
        </div>
    </div>

    <div class="order-info">
        <div>
            <h2 style="margin: 0;">Commande {{ $order->order_number }}</h2>
            <div style="font-size: 14px; color: #666;">
                {{ $order->created_at->format('d/m/Y à H:i') }}
            </div>
        </div>
        <div style="text-align: right;">
            <span class="badge badge-{{ $order->status === 'completed' ? 'success' : ($order->status === 'cancelled' ? 'danger' : 'warning') }}">
                {{ $order->status_label }}
            </span>
            <span class="badge badge-{{ $order->payment_status === 'paid' ? 'success' : 'info' }}" style="margin-left: 5px;">
                {{ $order->payment_status_label }}
            </span>
        </div>
    </div>

    <div class="section">
        <div class="section-title">Informations client</div>
        <div class="info-grid">
            <div class="info-label">Nom :</div>
            <div>{{ $order->customer_name }}</div>
            
            <div class="info-label">Téléphone :</div>
            <div>{{ $order->customer_phone }}</div>
            
            @if($order->customer_email)
            <div class="info-label">Email :</div>
            <div>{{ $order->customer_email }}</div>
            @endif
        </div>
    </div>

    <div class="section">
        <div class="section-title">Informations de livraison</div>
        <div class="info-grid">
            <div class="info-label">Mode :</div>
            <div>{{ $order->delivery_method_label }}</div>
            
            @if($order->delivery_method === 'pickup')
                <div class="info-label">Date de retrait :</div>
                <div>{{ $order->pickup_date->format('d/m/Y') }}</div>
                
                <div class="info-label">Créneau horaire :</div>
                <div>{{ $order->pickup_time_slot }}</div>
                
                <div class="info-label">Lieu de retrait :</div>
                <div>MonEpice&Riz, Cocody, Abidjan</div>
            @else
                <div class="info-label">Adresse :</div>
                <div>{{ $order->delivery_address }}</div>
                
                @if($order->delivery_notes)
                <div class="info-label">Instructions :</div>
                <div>{{ $order->delivery_notes }}</div>
                @endif
            @endif
        </div>
    </div>

    @if($order->requires_weight_confirmation)
    <div class="weight-notice">
        <strong>⚠️ Attention :</strong> Cette commande contient des produits à poids variable. 
        Les montants peuvent être ajustés selon le poids réel des produits.
    </div>
    @endif

    <div class="section">
        <div class="section-title">Articles commandés</div>
        <table>
            <thead>
                <tr>
                    <th>Produit</th>
                    <th>SKU</th>
                    <th>Quantité</th>
                    <th>Prix unitaire</th>
                    <th>Total</th>
                </tr>
            </thead>
            <tbody>
                @foreach($order->items as $item)
                <tr>
                    <td>
                        {{ $item->product_name }}
                        @if($item->is_variable_weight)
                            <br><small style="color: #666;">
                                Poids estimé: {{ $item->estimated_weight }}g
                                @if($item->actual_weight)
                                    | Poids réel: {{ $item->actual_weight }}g
                                @endif
                            </small>
                        @endif
                    </td>
                    <td>{{ $item->sku_name }}</td>
                    <td>{{ $item->quantity }}{{ $item->is_variable_weight ? ' kg' : '' }}</td>
                    <td class="text-right">{{ number_format($item->unit_price, 0, ',', ' ') }} FCFA</td>
                    <td class="text-right">{{ number_format($item->line_total, 0, ',', ' ') }} FCFA</td>
                </tr>
                @endforeach
            </tbody>
        </table>
    </div>

    <div class="total-section">
        <div class="total-row">
            <div class="total-label">Sous-total :</div>
            <div class="total-value">{{ number_format($order->subtotal, 0, ',', ' ') }} FCFA</div>
        </div>
        
        @if($order->delivery_fee > 0)
        <div class="total-row">
            <div class="total-label">Frais de livraison :</div>
            <div class="total-value">{{ number_format($order->delivery_fee, 0, ',', ' ') }} FCFA</div>
        </div>
        @endif
        
        <div class="total-row grand-total">
            <div class="total-label">Total :</div>
            <div class="total-value">{{ number_format($order->total_amount, 0, ',', ' ') }} FCFA</div>
        </div>
    </div>

    <div class="section">
        <div class="section-title">Informations de paiement</div>
        <div class="info-grid">
            <div class="info-label">Mode de paiement :</div>
            <div>{{ $order->payment_method === 'cash' ? 'Espèces' : 'Carte bancaire' }}</div>
            
            @if($order->payment_reference)
            <div class="info-label">Référence :</div>
            <div>{{ $order->payment_reference }}</div>
            @endif
        </div>
    </div>

    @if($order->notes)
    <div class="section">
        <div class="section-title">Notes internes</div>
        <div style="background-color: #f9fafb; padding: 10px; border-radius: 4px;">
            {{ $order->notes }}
        </div>
    </div>
    @endif

    <div class="footer">
        <p>Merci pour votre commande !</p>
        <p>MonEpice&Riz - {{ config('shop.store.address') }}</p>
        <p>Document généré le {{ now()->format('d/m/Y à H:i') }}</p>
    </div>
</body>
</html>