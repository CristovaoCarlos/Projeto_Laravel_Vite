<?php

namespace App\Http\Controllers;

use App\Models\Vendedor;
use Illuminate\Database\QueryException;
use Illuminate\Http\Request;

class VendedorController extends Controller
{
    public function index()
    {
        return Vendedor::orderBy('nome')->get();
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'nome' => ['required', 'string', 'max:255'],
        ]);

        return response()->json(Vendedor::create($data), 201);
    }

    public function show(Vendedor $vendedor)
    {
        return $vendedor;
    }

    public function update(Request $request, Vendedor $vendedor)
    {
        $data = $request->validate([
            'nome' => ['required', 'string', 'max:255'],
        ]);

        $vendedor->update($data);

        return $vendedor;
    }

    public function destroy(Vendedor $vendedor)
    {
        try {
            $vendedor->delete();
        } catch (QueryException $e) {
            return response()->json([
                'message' => 'Não é possível excluir um vendedor que possui lançamentos registrados.',
            ], 409);
        }

        return response()->noContent();
    }
}
