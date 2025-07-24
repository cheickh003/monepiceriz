<?php

namespace Database\Seeders;

use App\Domain\Catalog\Models\ProductAttribute;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class ProductAttributeSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $attributes = [
            [
                'name' => 'Poids',
                'type' => 'weight',
                'is_required' => true,
                'values' => [
                    ['value' => '250g', 'label' => '250 grammes'],
                    ['value' => '500g', 'label' => '500 grammes'],
                    ['value' => '750g', 'label' => '750 grammes'],
                    ['value' => '1kg', 'label' => '1 kilogramme'],
                    ['value' => '1.5kg', 'label' => '1.5 kilogrammes'],
                    ['value' => '2kg', 'label' => '2 kilogrammes'],
                    ['value' => '2.5kg', 'label' => '2.5 kilogrammes'],
                    ['value' => '3kg', 'label' => '3 kilogrammes'],
                    ['value' => '5kg', 'label' => '5 kilogrammes'],
                    ['value' => '10kg', 'label' => '10 kilogrammes'],
                    ['value' => '25kg', 'label' => '25 kilogrammes'],
                ]
            ],
            [
                'name' => 'Volume',
                'type' => 'size',
                'is_required' => false,
                'values' => [
                    ['value' => '25cl', 'label' => '25 centilitres'],
                    ['value' => '33cl', 'label' => '33 centilitres'],
                    ['value' => '50cl', 'label' => '50 centilitres'],
                    ['value' => '75cl', 'label' => '75 centilitres'],
                    ['value' => '1L', 'label' => '1 litre'],
                    ['value' => '1.5L', 'label' => '1.5 litres'],
                    ['value' => '2L', 'label' => '2 litres'],
                    ['value' => '3L', 'label' => '3 litres'],
                    ['value' => '5L', 'label' => '5 litres'],
                    ['value' => '10L', 'label' => '10 litres'],
                    ['value' => '20L', 'label' => '20 litres'],
                ]
            ],
            [
                'name' => 'Format',
                'type' => 'select',
                'is_required' => false,
                'values' => [
                    ['value' => 'unite', 'label' => 'À l\'unité'],
                    ['value' => 'pack', 'label' => 'Pack'],
                    ['value' => 'carton', 'label' => 'Carton'],
                    ['value' => 'sachet', 'label' => 'Sachet'],
                    ['value' => 'boite', 'label' => 'Boîte'],
                    ['value' => 'bouteille', 'label' => 'Bouteille'],
                    ['value' => 'bidon', 'label' => 'Bidon'],
                    ['value' => 'sac', 'label' => 'Sac'],
                ]
            ],
            [
                'name' => 'Conditionnement',
                'type' => 'select',
                'is_required' => false,
                'values' => [
                    ['value' => 'vrac', 'label' => 'Vrac'],
                    ['value' => 'emballe', 'label' => 'Emballé'],
                    ['value' => 'sous-vide', 'label' => 'Sous-vide'],
                    ['value' => 'surgele', 'label' => 'Surgelé'],
                    ['value' => 'frais', 'label' => 'Frais'],
                    ['value' => 'conserve', 'label' => 'Conserve'],
                ]
            ],
        ];
        
        foreach ($attributes as $attributeData) {
            $values = $attributeData['values'];
            unset($attributeData['values']);
            
            $attributeData['slug'] = Str::slug($attributeData['name']);
            $attribute = ProductAttribute::create($attributeData);
            
            foreach ($values as $valueData) {
                $attribute->values()->create($valueData);
            }
        }
    }
}