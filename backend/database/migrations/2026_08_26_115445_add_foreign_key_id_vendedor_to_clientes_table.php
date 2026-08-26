<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('clientes', function (Blueprint $table) {
            $table->unsignedBigInteger('id_vendedor')->nullable()->change();
        });

        Schema::table('clientes', function (Blueprint $table) {
            $table->foreign('id_vendedor')->references('id')->on('vendedores')->restrictOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('clientes', function (Blueprint $table) {
            $table->dropForeign(['id_vendedor']);
        });

        Schema::table('clientes', function (Blueprint $table) {
            $table->BigInteger('id_vendedor')->nullable(false)->change();
        });
    }
};
