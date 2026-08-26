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
        //removendo chave estrangeira da tabela clientes
        Schema::table('clientes', function(Blueprint $table) {
            $table->dropForeign(['vendedor_id']);
        });  

        Schema::table('clientes', function (Blueprint $table) {
            $table->renameColumn('vendedor_id', 'vendedor_id');
        });

        Schema::table('clientes', function (Blueprint $table) {
            $table->foreign('vendedor_id')->references('id')->on('vendedores')->restrictOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('cliente', function (Blueprint $table) {
            $table->dropForeign(['vendedor_id']);
        });

        Schema::table('clientes', function(Blueprint $table){
            $table->renameColumn('vendedor_id', 'vendedor_id');
        });

        Schema::table('cliente', function(Blueprint $table){
            $table->foreign('vendedor_id')->references('id')->on('vendedores')->restrictOnDelete();
        });
    }
};
