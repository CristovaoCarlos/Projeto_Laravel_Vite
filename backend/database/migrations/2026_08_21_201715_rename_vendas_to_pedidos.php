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
        Schema::rename('vendas', 'pedidos');
        Schema::rename('venda_items', 'pedido_items');

        Schema::table('pedido_items', function (Blueprint $table) {
            $table->renameColumn('venda_id', 'pedido_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('pedido_items', function (Blueprint $table) {
            $table->renameColumn('pedido_id', 'venda_id');
        });

        Schema::rename('pedido_items', 'venda_items');
        Schema::rename('pedidos', 'vendas');
    }
};
