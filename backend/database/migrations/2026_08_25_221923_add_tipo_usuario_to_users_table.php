<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->enum('tipo_usuario', ['superadmin', 'vendedor', 'estoquista'])
                ->default('vendedor')
                ->after('email');
        });

        // Contas já existentes antes deste controle de acesso continuam com acesso total.
        DB::table('users')->update(['tipo_usuario' => 'superadmin']);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn('tipo_usuario');
        });
    }
};
