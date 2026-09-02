<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    public function login(Request $istek)
    {
        $istek->validate([
            'email' => 'required|string',
            'password' => 'required|string',
        ], [
            'email.required' => 'E-posta zorunludur.',
            'password.required' => 'Şifre zorunludur.',
        ]);

        $kullanici = User::where('email', $istek->email)->where('is_active', true)->first();

        if (!$kullanici || !Hash::check($istek->password, $kullanici->password)) {
            return response()->json(['message' => 'E-posta veya şifre hatalı.'], 401);
        }

        // Her girişte yeni token; eskiler kalabilir (birden fazla cihaz)
        $token = $kullanici->createToken('emlak-crm')->plainTextToken;

        return response()->json([
            'token' => $token,
            'user' => [
                'id' => $kullanici->id,
                'name' => $kullanici->name,
                'email' => $kullanici->email,
                'role' => $kullanici->role,
                'phone' => $kullanici->phone,
            ],
        ]);
    }

    public function me(Request $istek)
    {
        $k = $istek->user();
        return response()->json([
            'id' => $k->id,
            'name' => $k->name,
            'email' => $k->email,
            'role' => $k->role,
            'phone' => $k->phone,
        ]);
    }

    public function logout(Request $istek)
    {
        $istek->user()->currentAccessToken()->delete();
        return response()->json(['message' => 'Çıkış yapıldı.']);
    }

    // Randevu ve portföy atamalarında kullanılan danışman listesi
    public function agents()
    {
        return User::where('is_active', true)
            ->orderBy('name')
            ->get(['id', 'name', 'role', 'phone']);
    }
}
