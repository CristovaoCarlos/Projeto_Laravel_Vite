<?php

namespace App\Http\Controllers;

use App\Models\Produto;
use Illuminate\Database\QueryException;
use Illuminate\Http\Request;

class ProdutoController extends Controller
{
    public function index()
    {
        return Produto::orderBy('description')->get();
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'description' => ['required', 'string', 'max:255'],
            'price' => ['required', 'numeric', 'min:0'],
            'stock' => ['required', 'integer', 'min:0'],
        ]);

        return response()->json(Produto::create($data), 201);
    }

    public function show(Produto $produto)
    {
        return $produto;
    }

    public function update(Request $request, Produto $produto)
    {
        $data = $request->validate([
            'description' => ['required', 'string', 'max:255'],
            'price' => ['required', 'numeric', 'min:0'],
            'stock' => ['required', 'integer', 'min:0'],
        ]);

        $produto->update($data);

        return $produto;
    }

    public function destroy(Produto $produto)
    {
        try {
            $produto->delete();
        } catch (QueryException $e) {
            return response()->json([
                'message' => 'Não é possível excluir um produto que já foi vendido.',
            ], 409);
        }

        return response()->noContent();
    }
}
