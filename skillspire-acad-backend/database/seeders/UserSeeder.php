<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Profile;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {

        $defaultUsers = [
            [
                'name' => 'Admin User',
                'email' => 'admin@weblearning.com',
                'password' => 'password',
                'role' => 'admin',
            ],
            [
                'name' => 'Editor User',
                'email' => 'editor@weblearning.com',
                'password' => 'password',
                'role' => 'pengajar', 
            ],
            [
                'name' => 'Basic User',
                'email' => 'user@weblearning.com',
                'password' => 'password',
                'role' => 'pelajar', 
            ],
        ];

        foreach ($defaultUsers as $userData) {
            $user = User::firstOrCreate(
                ['email' => $userData['email']],
                [
                    'name' => $userData['name'],
                    'password' => Hash::make($userData['password']),
                ]
            );

            // Buat profil jika belum ada
            if (!$user->profile) {
                Profile::create([
                    'id' => Str::uuid(),
                    'user_id' => $user->id,
                    'full_name' => $user->name,
                    'role' => $userData['role'],
                ]);
            }
        }
    }
}

