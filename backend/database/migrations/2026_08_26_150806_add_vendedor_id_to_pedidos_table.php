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
        Schema::table('pedidos', function(Blueprint $table) {
            $table->unsignedBigInteger('vendedor_id', false)->nullable()->after('id');            
        });

        Schema::table('pedidos', function(Blueprint $table){
            $table->foreign('vendedor_id')->references('id')->on('vendedores')->restrictOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('pedidos', function(Blueprint $table) {
            $table->dropForeign(['vendedor_id']);
        });

        Schema::table('pedidos', function(Blueprint $table) {
           $table->dropColumn('vendedor_id');
        });
    }
};
