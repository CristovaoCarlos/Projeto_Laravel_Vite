<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\ClienteController;
use App\Http\Controllers\HistoricoController;
use App\Http\Controllers\PedidoController;
use App\Http\Controllers\ProdutoController;
use App\Http\Controllers\UsuarioController;
use App\Http\Controllers\VendedorController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);

    Route::get('/user', function (Request $request) {
        return $request->user();
    });

    Route::middleware('tipo_usuario:vendedor')->group(function () {
        Route::apiResource('clientes', ClienteController::class);
        Route::apiResource('pedidos', PedidoController::class);
    });

    Route::middleware('tipo_usuario:estoquista')->group(function () {
        Route::apiResource('produtos', ProdutoController::class);
    });

    Route::middleware('tipo_usuario:historico')->group(function () {
        Route::apiResource('historicos', HistoricoController::class)->only(['index', 'store', 'destroy']);
    });

    Route::middleware('tipo_usuario:historico,vendedor')->group(function () {
        Route::get('/vendedores', [VendedorController::class, 'index']);
    });

    Route::middleware('tipo_usuario:superadmin')->group(function () {
        Route::apiResource('vendedores', VendedorController::class)
            ->parameters(['vendedores' => 'vendedor'])
            ->except(['index']);
        Route::apiResource('usuarios', UsuarioController::class)->parameters(['usuarios' => 'usuario']);
    });
});
