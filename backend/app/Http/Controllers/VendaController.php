<?php

namespace App\Http\Controllers;

use App\Models\Produto;
use App\Models\Venda;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class VendaController extends Controller
{
    public function index()
    {
        return Venda::with(['cliente', 'itens.produto'])->latest()->get();
    }

    public function store(Request $request)
    {
        $data = $this->validateVenda($request);

        $venda = DB::transaction(function () use ($data) {
            $venda = Venda::create(['cliente_id' => $data['cliente_id'], 'total' => 0]);

            $this->applyItens($venda, $data['itens']);

            return $venda;
        });

        return response()->json($venda->load(['cliente', 'itens.produto']), 201);
    }

    public function show(Venda $venda)
    {
        return $venda->load(['cliente', 'itens.produto']);
    }

    public function update(Request $request, Venda $venda)
    {
        $data = $this->validateVenda($request);

        DB::transaction(function () use ($venda, $data) {
            foreach ($venda->itens as $item) {
                $item->produto()->increment('stock', $item->quantidade);
            }
            $venda->itens()->delete();

            $venda->update(['cliente_id' => $data['cliente_id']]);

            $this->applyItens($venda, $data['itens']);
        });

        return $venda->load(['cliente', 'itens.produto']);
    }

    public function destroy(Venda $venda)
    {
        DB::transaction(function () use ($venda) {
            foreach ($venda->itens as $item) {
                $item->produto()->increment('stock', $item->quantidade);
            }
            $venda->itens()->delete();
            $venda->delete();
        });

        return response()->noContent();
    }

    private function validateVenda(Request $request): array
    {
        return $request->validate([
            'cliente_id' => ['required', 'exists:clientes,id'],
            'itens' => ['required', 'array', 'min:1'],
            'itens.*.produto_id' => ['required', 'exists:produtos,id'],
            'itens.*.quantidade' => ['required', 'integer', 'min:1'],
        ]);
    }

    /**
     * Decrementa o estoque de cada produto, registra o preço praticado
     * no momento da venda e atualiza o total da venda.
     */
    private function applyItens(Venda $venda, array $itens): void
    {
        $total = 0;

        foreach ($itens as $item) {
            $produto = Produto::findOrFail($item['produto_id']);

            if ($produto->stock < $item['quantidade']) {
                throw ValidationException::withMessages([
                    'itens' => "Estoque insuficiente para o produto \"{$produto->name}\" (disponível: {$produto->stock}).",
                ]);
            }

            $produto->decrement('stock', $item['quantidade']);

            $venda->itens()->create([
                'produto_id' => $produto->id,
                'quantidade' => $item['quantidade'],
                'preco_unitario' => $produto->price,
            ]);

            $total += $produto->price * $item['quantidade'];
        }

        $venda->update(['total' => $total]);
    }
}
