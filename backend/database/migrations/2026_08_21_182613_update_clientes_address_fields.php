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
            $table->dropColumn('address');
            $table->string('street')->after('phone');
            $table->string('city')->after('street');
            $table->string('state')->after('city');
            $table->string('zip_code')->after('state');
            $table->string('location')->nullable()->after('zip_code');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('clientes', function (Blueprint $table) {
            $table->dropColumn(['street', 'city', 'state', 'zip_code', 'location']);
            $table->string('address')->nullable();
        });
    }
};
