<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Ganti nama tabel dari 'lists' ke 'task_lists'
        // Schema::rename('lists', 'task_lists');
    }

    public function down(): void
    {
        // Kembali ke nama asli jika rollback
        // Schema::rename('task_lists', 'lists');
    }
};
