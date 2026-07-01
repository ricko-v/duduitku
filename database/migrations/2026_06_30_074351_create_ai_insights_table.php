<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('ai_insights', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->enum('type', ['spending_insight', 'budget_advice', 'forecast']);
            $table->json('content');
            $table->string('period');
            $table->timestamps();

            $table->index(['user_id', 'type', 'period']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('ai_insights');
    }
};
