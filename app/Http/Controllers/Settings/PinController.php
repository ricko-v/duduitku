<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules\Password;
use Inertia\Inertia;
use Inertia\Response;

class PinController extends Controller
{
    public function setup(Request $request)
    {
        $request->validate([
            'pin' => ['required', 'string', 'size:6', 'regex:/^\d{6}$/'],
        ]);

        $user = $request->user();
        $user->pin = Hash::make($request->pin);
        $user->pin_enabled = true;
        $user->save();

        return back()->with('toast', [
            'type' => 'success',
            'message' => 'PIN berhasil diaktifkan.',
        ]);
    }

    public function update(Request $request)
    {
        $request->validate([
            'current_pin' => ['required', 'string', 'size:6'],
            'pin' => ['required', 'string', 'size:6', 'regex:/^\d{6}$/'],
        ]);

        $user = $request->user();

        if (! Hash::check($request->current_pin, $user->pin)) {
            return back()->withErrors(['current_pin' => 'PIN saat ini salah.']);
        }

        $user->pin = Hash::make($request->pin);
        $user->save();

        return back()->with('toast', [
            'type' => 'success',
            'message' => 'PIN berhasil diperbarui.',
        ]);
    }

    public function disable(Request $request)
    {
        $request->validate([
            'pin' => ['required', 'string', 'size:6'],
        ]);

        $user = $request->user();

        if (! Hash::check($request->pin, $user->pin)) {
            return back()->withErrors(['pin' => 'PIN salah.']);
        }

        $user->pin = null;
        $user->pin_enabled = false;
        $user->save();

        return back()->with('toast', [
            'type' => 'success',
            'message' => 'PIN berhasil dinonaktifkan.',
        ]);
    }

    public function check(Request $request)
    {
        $request->validate([
            'email' => ['required', 'email'],
        ]);

        $user = \App\Models\User::where('email', $request->email)->first();

        return response()->json([
            'pin_enabled' => $user?->pin_enabled ?? false,
        ]);
    }

    public function loginWithPin(Request $request)
    {
        $request->validate([
            'email' => ['required', 'email'],
            'pin' => ['required', 'string', 'size:6'],
        ]);

        $user = \App\Models\User::where('email', $request->email)->first();

        if (! $user || ! $user->pin_enabled || ! Hash::check($request->pin, $user->pin)) {
            return response()->json([
                'message' => 'PIN salah atau tidak valid.',
                'errors' => ['pin' => 'PIN salah atau tidak valid.'],
            ], 422);
        }

        auth()->login($user, (bool) $request->input('remember', false));

        $request->session()->regenerate();

        return response()->json([
            'success' => true,
            'redirect' => route('dashboard'),
        ]);
    }
}
