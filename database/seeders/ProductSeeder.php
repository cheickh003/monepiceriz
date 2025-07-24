<?php

namespace Database\Seeders;

use App\Domain\Catalog\Models\Category;
use App\Domain\Catalog\Models\Product;
use App\Domain\Catalog\Models\ProductAttribute;
use App\Domain\Catalog\Models\ProductAttributeValue;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class ProductSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get attributes for SKU variations
        $weightAttribute = ProductAttribute::where('slug', 'poids')->first();
        $formatAttribute = ProductAttribute::where('slug', 'format')->first();
        
        // Sample products data structure matching the PDF catalog format
        // This is a demonstration - actual data should be imported from the PDF
        $productsData = [
            'RIZ' => [
                [
                    'name' => 'Riz Parfumé Jasmin',
                    'reference' => 'RIZ001',
                    'barcode' => '3000000000001',
                    'description' => 'Riz jasmin parfumé de qualité supérieure',
                    'is_variable_weight' => false,
                    'skus' => [
                        [
                            'weight' => '1kg',
                            'purchase_price' => 800,
                            'price_ht' => 1000,
                            'price_ttc' => 1000,
                            'stock_quantity' => 100,
                        ],
                        [
                            'weight' => '5kg',
                            'purchase_price' => 3800,
                            'price_ht' => 4500,
                            'price_ttc' => 4500,
                            'stock_quantity' => 50,
                        ],
                        [
                            'weight' => '25kg',
                            'purchase_price' => 18000,
                            'price_ht' => 22000,
                            'price_ttc' => 22000,
                            'stock_quantity' => 20,
                        ],
                    ]
                ],
                [
                    'name' => 'Riz Basmati Premium',
                    'reference' => 'RIZ002',
                    'barcode' => '3000000000002',
                    'description' => 'Riz basmati à grains longs',
                    'is_variable_weight' => false,
                    'skus' => [
                        [
                            'weight' => '1kg',
                            'purchase_price' => 1200,
                            'price_ht' => 1500,
                            'price_ttc' => 1500,
                            'stock_quantity' => 80,
                        ],
                        [
                            'weight' => '5kg',
                            'purchase_price' => 5500,
                            'price_ht' => 7000,
                            'price_ttc' => 7000,
                            'stock_quantity' => 40,
                        ],
                    ]
                ],
            ],
            'HUILES' => [
                [
                    'name' => 'Huile de Tournesol',
                    'reference' => 'HUI001',
                    'barcode' => '3000000000003',
                    'description' => 'Huile de tournesol raffinée',
                    'is_variable_weight' => false,
                    'skus' => [
                        [
                            'format' => '1L',
                            'purchase_price' => 1000,
                            'price_ht' => 1300,
                            'price_ttc' => 1300,
                            'stock_quantity' => 150,
                        ],
                        [
                            'format' => '5L',
                            'purchase_price' => 4500,
                            'price_ht' => 5800,
                            'price_ttc' => 5800,
                            'stock_quantity' => 60,
                        ],
                    ]
                ],
                [
                    'name' => 'Huile d\'Olive Vierge Extra',
                    'reference' => 'HUI002',
                    'barcode' => '3000000000004',
                    'description' => 'Huile d\'olive vierge extra première pression à froid',
                    'is_variable_weight' => false,
                    'skus' => [
                        [
                            'format' => '75cl',
                            'purchase_price' => 3500,
                            'price_ht' => 4500,
                            'price_ttc' => 4500,
                            'stock_quantity' => 40,
                        ],
                        [
                            'format' => '1L',
                            'purchase_price' => 4500,
                            'price_ht' => 5800,
                            'price_ttc' => 5800,
                            'stock_quantity' => 30,
                        ],
                    ]
                ],
            ],
            'EPICES' => [
                [
                    'name' => 'Poivre Noir Moulu',
                    'reference' => 'EPI001',
                    'barcode' => '3000000000005',
                    'description' => 'Poivre noir moulu finement',
                    'is_variable_weight' => false,
                    'skus' => [
                        [
                            'weight' => '250g',
                            'purchase_price' => 2000,
                            'price_ht' => 2800,
                            'price_ttc' => 2800,
                            'stock_quantity' => 80,
                        ],
                        [
                            'weight' => '500g',
                            'purchase_price' => 3800,
                            'price_ht' => 5200,
                            'price_ttc' => 5200,
                            'stock_quantity' => 40,
                        ],
                    ]
                ],
                [
                    'name' => 'Curcuma en Poudre',
                    'reference' => 'EPI002',
                    'barcode' => '3000000000006',
                    'description' => 'Curcuma en poudre de qualité supérieure',
                    'is_variable_weight' => false,
                    'skus' => [
                        [
                            'weight' => '250g',
                            'purchase_price' => 1500,
                            'price_ht' => 2200,
                            'price_ttc' => 2200,
                            'stock_quantity' => 60,
                        ],
                        [
                            'weight' => '500g',
                            'purchase_price' => 2800,
                            'price_ht' => 4000,
                            'price_ttc' => 4000,
                            'stock_quantity' => 30,
                        ],
                    ]
                ],
            ],
            'LEGUMES FRAIS' => [
                [
                    'name' => 'Tomates Fraîches',
                    'reference' => 'LEG001',
                    'barcode' => '3000000000007',
                    'description' => 'Tomates fraîches de saison',
                    'is_variable_weight' => true,
                    'skus' => [
                        [
                            'weight' => '1kg',
                            'purchase_price' => 500,
                            'price_ht' => 800,
                            'price_ttc' => 800,
                            'stock_quantity' => 200,
                        ],
                    ]
                ],
                [
                    'name' => 'Oignons Rouges',
                    'reference' => 'LEG002',
                    'barcode' => '3000000000008',
                    'description' => 'Oignons rouges frais',
                    'is_variable_weight' => true,
                    'skus' => [
                        [
                            'weight' => '1kg',
                            'purchase_price' => 400,
                            'price_ht' => 600,
                            'price_ttc' => 600,
                            'stock_quantity' => 150,
                        ],
                    ]
                ],
            ],
            'CONSERVES' => [
                [
                    'name' => 'Concentré de Tomate',
                    'reference' => 'CON001',
                    'barcode' => '3000000000009',
                    'description' => 'Concentré de tomate double concentration',
                    'is_variable_weight' => false,
                    'skus' => [
                        [
                            'weight' => '400g',
                            'purchase_price' => 300,
                            'price_ht' => 450,
                            'price_ttc' => 450,
                            'stock_quantity' => 200,
                        ],
                        [
                            'weight' => '800g',
                            'purchase_price' => 550,
                            'price_ht' => 800,
                            'price_ttc' => 800,
                            'stock_quantity' => 100,
                        ],
                    ]
                ],
                [
                    'name' => 'Thon à l\'Huile',
                    'reference' => 'CON002',
                    'barcode' => '3000000000010',
                    'description' => 'Thon entier à l\'huile de tournesol',
                    'is_variable_weight' => false,
                    'skus' => [
                        [
                            'weight' => '185g',
                            'purchase_price' => 800,
                            'price_ht' => 1200,
                            'price_ttc' => 1200,
                            'stock_quantity' => 150,
                        ],
                    ]
                ],
            ],
            'BOISSONS' => [
                [
                    'name' => 'Eau Minérale Naturelle',
                    'reference' => 'BOI001',
                    'barcode' => '3000000000011',
                    'description' => 'Eau minérale naturelle de source',
                    'is_variable_weight' => false,
                    'skus' => [
                        [
                            'format' => '1.5L',
                            'purchase_price' => 250,
                            'price_ht' => 400,
                            'price_ttc' => 400,
                            'stock_quantity' => 300,
                        ],
                        [
                            'format' => '5L',
                            'purchase_price' => 600,
                            'price_ht' => 900,
                            'price_ttc' => 900,
                            'stock_quantity' => 100,
                        ],
                    ]
                ],
                [
                    'name' => 'Jus d\'Orange 100% Pur Jus',
                    'reference' => 'BOI002',
                    'barcode' => '3000000000012',
                    'description' => 'Jus d\'orange 100% pur jus sans sucre ajouté',
                    'is_variable_weight' => false,
                    'skus' => [
                        [
                            'format' => '1L',
                            'purchase_price' => 1200,
                            'price_ht' => 1800,
                            'price_ttc' => 1800,
                            'stock_quantity' => 80,
                        ],
                    ]
                ],
            ],
        ];
        
        // Create products for each category
        foreach ($productsData as $categorySlug => $products) {
            $category = Category::where('slug', Str::slug($categorySlug))->first();
            
            if (!$category) {
                continue;
            }
            
            foreach ($products as $productData) {
                $skusData = $productData['skus'];
                unset($productData['skus']);
                
                // Add category and slug
                $productData['category_id'] = $category->id;
                $productData['slug'] = Str::slug($productData['name']);
                $productData['is_active'] = true;
                
                // Create product
                $product = Product::create($productData);
                
                // Create SKUs
                foreach ($skusData as $index => $skuData) {
                    $attributes = [];
                    
                    // Handle weight attribute
                    if (isset($skuData['weight']) && $weightAttribute) {
                        $weightValue = ProductAttributeValue::where('product_attribute_id', $weightAttribute->id)
                            ->where('value', $skuData['weight'])
                            ->first();
                        if ($weightValue) {
                            $attributes[$weightAttribute->id] = $weightValue->id;
                        }
                        unset($skuData['weight']);
                    }
                    
                    // Handle format attribute
                    if (isset($skuData['format']) && $formatAttribute) {
                        $formatValue = ProductAttributeValue::where('product_attribute_id', $formatAttribute->id)
                            ->where('value', $skuData['format'])
                            ->first();
                        if ($formatValue) {
                            $attributes[$formatAttribute->id] = $formatValue->id;
                        }
                        unset($skuData['format']);
                    }
                    
                    // Set default SKU
                    $skuData['is_default'] = $index === 0;
                    
                    // Generate SKU code
                    $skuData['sku'] = $product->reference . '-' . ($index + 1);
                    
                    // Create SKU
                    $sku = $product->skus()->create($skuData);
                    
                    // Attach attributes
                    foreach ($attributes as $attributeId => $valueId) {
                        $sku->attributeValues()->attach($valueId);
                    }
                }
            }
        }
        
        $this->command->info('Sample products seeded successfully!');
        $this->command->info('Note: This is demonstration data. Import actual product data from the PDF catalog.');
    }
}