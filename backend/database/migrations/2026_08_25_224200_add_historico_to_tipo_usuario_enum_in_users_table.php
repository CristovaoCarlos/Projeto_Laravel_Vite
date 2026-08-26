<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        DB::statement("ALTER TABLE users MODIFY tipo_usuario ENUM('superadmin', 'vendedor', 'estoquista', 'historico') NOT NULL DEFAULT 'vendedor'");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        DB::statement("ALTER TABLE users MODIFY tipo_usuario ENUM('superadmin', 'vendedor', 'estoquista') NOT NULL DEFAULT 'vendedor'");
    }
};
