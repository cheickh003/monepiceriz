<?php

namespace Database\Seeders;

use App\Domain\Catalog\Models\Category;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class CategorySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $categories = [
            // Boissons
            ['name' => 'Boissons', 'icon' => 'cup-soda', 'children' => [
                ['name' => 'Boissons Gazeuses', 'icon' => 'soda'],
                ['name' => 'Boissons Sans Gaz', 'icon' => 'droplet'],
                ['name' => 'Eau Minérale', 'icon' => 'water'],
            ]],
            
            // Alimentation
            ['name' => 'Alimentation', 'icon' => 'shopping-basket', 'children' => [
                ['name' => 'Beurre et Gras Végétal', 'icon' => 'butter'],
                ['name' => 'Biscuits', 'icon' => 'cookie'],
                ['name' => 'Charcuteries Spécialisées', 'icon' => 'ham'],
                ['name' => 'Conserve Thon et Sardine', 'icon' => 'fish'],
                ['name' => 'Divers', 'icon' => 'package-2'],
                ['name' => 'Farine', 'icon' => 'wheat'],
                ['name' => 'Granules', 'icon' => 'grain'],
                ['name' => 'Huiles', 'icon' => 'droplets'],
                ['name' => 'Pâtes Alimentaires', 'icon' => 'noodles'],
                ['name' => 'Riz', 'icon' => 'rice'],
                ['name' => 'Vinaigre', 'icon' => 'flask-conical'],
            ]],
            
            // Épices et Condiments
            ['name' => 'Épices', 'icon' => 'pepper', 'children' => []],
            ['name' => 'Sauces', 'icon' => 'sauce', 'children' => [
                ['name' => 'Ketchup', 'icon' => 'tomato'],
                ['name' => 'Mayonnaise', 'icon' => 'egg'],
                ['name' => 'Moutarde', 'icon' => 'jar'],
            ]],
            
            // Viandes et Poissons
            ['name' => 'Boucherie', 'icon' => 'beef', 'children' => [
                ['name' => 'Viande de Bœuf Fraîche', 'icon' => 'cow'],
                ['name' => 'Viande de Bœuf Fumée', 'icon' => 'smoke'],
                ['name' => 'Viande Fraîche d\'Agneau', 'icon' => 'sheep'],
                ['name' => 'Viande Fraîche de Veau', 'icon' => 'baby'],
                ['name' => 'Volaille', 'icon' => 'drumstick-bite'],
                ['name' => 'Saucisse pour Barbecue', 'icon' => 'hotdog'],
                ['name' => 'Salaisons', 'icon' => 'bacon'],
                ['name' => 'Pâtés', 'icon' => 'pie'],
                ['name' => 'Jambons', 'icon' => 'ham'],
                ['name' => 'Viandes Cuites', 'icon' => 'utensils'],
                ['name' => 'Pondeuse Fumée', 'icon' => 'egg'],
            ]],
            
            ['name' => 'Poissonnerie', 'icon' => 'fish', 'children' => [
                ['name' => 'Poissons et Fruits de Mer', 'icon' => 'waves'],
            ]],
            
            // Petit Déjeuner
            ['name' => 'Petit Déjeuner', 'icon' => 'coffee', 'children' => [
                ['name' => 'Friandise', 'icon' => 'candy-cane'],
                ['name' => 'Yaourt', 'icon' => 'glass-water'],
            ]],
            
            // Hygiène et Entretien
            ['name' => 'Hygiène', 'icon' => 'soap', 'children' => [
                ['name' => 'Hygiène Buccale', 'icon' => 'toothbrush'],
                ['name' => 'Hygiène Corporelle', 'icon' => 'shower'],
            ]],
            
            ['name' => 'Produits d\'Entretien', 'icon' => 'spray-can', 'children' => [
                ['name' => 'PH', 'icon' => 'sparkles'],
                ['name' => 'Emballage', 'icon' => 'package'],
            ]],
            
            // MonEpice&Riz
            ['name' => 'Mon Épice&Riz', 'icon' => 'store', 'children' => []],
        ];
        
        foreach ($categories as $position => $categoryData) {
            $parent = Category::create([
                'name' => $categoryData['name'],
                'slug' => Str::slug($categoryData['name']),
                'icon' => $categoryData['icon'],
                'position' => $position + 1,
                'is_active' => true,
            ]);
            
            foreach ($categoryData['children'] as $childPosition => $childData) {
                Category::create([
                    'name' => $childData['name'],
                    'slug' => Str::slug($childData['name']),
                    'icon' => $childData['icon'],
                    'parent_id' => $parent->id,
                    'position' => $childPosition + 1,
                    'is_active' => true,
                ]);
            }
        }
    }
}