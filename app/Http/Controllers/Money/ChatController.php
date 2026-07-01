<?php

namespace App\Http\Controllers\Money;

use App\Ai\Agents\MoneyChatAgent;
use App\Ai\UserContext;
use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ChatController extends Controller
{
    public function index(Request $request): Response
    {
        return Inertia::render('money/chat');
    }

    public function send(Request $request): JsonResponse
    {
        $request->validate([
            'message' => 'required|string|max:1000',
            'conversation_id' => 'nullable|string',
        ]);

        try {
            $user = $request->user();

            // Set user context for tools
            app(UserContext::class)->setUser($user);

            $agent = MoneyChatAgent::make()->forUser($user);

            if ($request->filled('conversation_id')) {
                $agent = $agent->continue($request->input('conversation_id'), as: $user);
            }

            $response = $agent->prompt($request->input('message'));

            return response()->json([
                'response' => $response->text,
                'conversation_id' => $response->conversationId,
            ]);
        } catch (\Throwable $e) {
            report($e);

            return response()->json([
                'response' => 'Maaf, terjadi kesalahan. Silakan coba lagi.',
                'conversation_id' => null,
            ], 500);
        }
    }
}
