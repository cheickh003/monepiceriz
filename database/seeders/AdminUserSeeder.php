<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class AdminUserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create admin user
        User::create([
            'name' => 'Admin MonEpice&Riz',
            'email' => 'admin@monepiceriz.com',
            'password' => Hash::make('admin123'),
            'role' => 'admin',
            'email_verified_at' => now(),
        ]);
        
        // Create manager user
        User::create([
            'name' => 'Manager MonEpice&Riz',
            'email' => 'manager@monepiceriz.com',
            'password' => Hash::make('manager123'),
            'role' => 'manager',
            'email_verified_at' => now(),
        ]);
    }
}