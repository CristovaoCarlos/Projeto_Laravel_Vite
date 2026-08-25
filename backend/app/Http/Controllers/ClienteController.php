<?php

namespace App\Http\Controllers;

use App\Models\Cliente;
use Illuminate\Database\QueryException;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class ClienteController extends Controller
{
    public function index()
    {
        return Cliente::withCount('pedidos')->orderBy('name')->get();
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255', 'unique:clientes,name'],
            'email' => ['nullable', 'email', 'max:255', 'unique:clientes,email'],
            'phone' => ['required', 'string', 'regex:/^\(\d{2}\) \d{5}-\d{4}$/'],
            'street' => ['required', 'string', 'max:255'],
            'number' => ['required', 'string', 'max:20'],
            'city' => ['required', 'string', 'max:255'],
            'state' => ['required', 'string', 'max:255'],
            'zip_code' => ['required', 'string', 'regex:/^\d{5}-\d{3}$/'],
            'location' => ['nullable', 'string', 'regex:/^-?\d{1,3}(\.\d+)?,\s*-?\d{1,3}(\.\d+)?$/'],
        ]);

        return response()->json(Cliente::create($data), 201);
    }

    public function show(Cliente $cliente)
    {
        return $cliente;
    }

    public function update(Request $request, Cliente $cliente)
    {
        if ($cliente->pedidos()->exists()) {
            return response()->json([
                'message' => 'Não é possível alterar os dados de um cliente que possui pedidos registrados.',
            ], 409);
        }

        $data = $request->validate([
            'name' => ['required', 'string', 'max:255', Rule::unique('clientes', 'name')->ignore($cliente->id)],
            'email' => ['nullable', 'email', 'max:255', Rule::unique('clientes', 'email')->ignore($cliente->id)],
            'phone' => ['required', 'string', 'regex:/^\(\d{2}\) \d{5}-\d{4}$/'],
            'street' => ['required', 'string', 'max:255'],
            'number' => ['required', 'string', 'max:20'],
            'city' => ['required', 'string', 'max:255'],
            'state' => ['required', 'string', 'max:255'],
            'zip_code' => ['required', 'string', 'regex:/^\d{5}-\d{3}$/'],
            'location' => ['nullable', 'string', 'regex:/^-?\d{1,3}(\.\d+)?,\s*-?\d{1,3}(\.\d+)?$/'],
        ]);

        $cliente->update($data);

        return $cliente;
    }

    public function destroy(Cliente $cliente)
    {
        try {
            $cliente->delete();
        } catch (QueryException $e) {
            return response()->json([
                'message' => 'Não é possível excluir um cliente que possui pedidos registrados.',
            ], 409);
        }

        return response()->noContent();
    }
}
