<?php

namespace App\Http\Controllers;

use App\Models\Pedido;
use App\Models\Produto;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

class PedidoController extends Controller
{
    public function index()
    {
        return Pedido::with(['cliente', 'itens.produto'])->latest()->get();
    }

    public function store(Request $request)
    {
        $data = $this->validatePedido($request);

        $pedido = DB::transaction(function () use ($data) {
            $pedido = Pedido::create([
                'cliente_id' => $data['cliente_id'],
                'tipo_pagamento' => $data['tipo_pagamento'],
                'status' => $data['status'] ?? 'aguardando_pagamento',
                'total' => 0,
            ]);

            $this->applyItens($pedido, $data['itens']);

            return $pedido;
        });

        $this->storeComprovante($request, $pedido);

        return response()->json($pedido->fresh()->load(['cliente', 'itens.produto']), 201);
    }

    public function show(Pedido $pedido)
    {
        return $pedido->load(['cliente', 'itens.produto']);
    }

    public function update(Request $request, Pedido $pedido)
    {
        $data = $this->validatePedido($request);

        DB::transaction(function () use ($pedido, $data) {
            foreach ($pedido->itens as $item) {
                $item->produto()->increment('stock', $item->quantidade);
            }
            $pedido->itens()->delete();

            $pedido->update([
                'cliente_id' => $data['cliente_id'],
                'tipo_pagamento' => $data['tipo_pagamento'],
                'status' => $data['status'] ?? $pedido->status,
            ]);

            $this->applyItens($pedido, $data['itens']);
        });

        $this->storeComprovante($request, $pedido);

        return $pedido->fresh()->load(['cliente', 'itens.produto']);
    }

    public function destroy(Pedido $pedido)
    {
        DB::transaction(function () use ($pedido) {
            foreach ($pedido->itens as $item) {
                $item->produto()->increment('stock', $item->quantidade);
            }
            $pedido->itens()->delete();
            $pedido->delete();
        });

        if ($pedido->comprovante_pagamento) {
            Storage::disk('public')->delete($pedido->comprovante_pagamento);
        }

        return response()->noContent();
    }

    private function validatePedido(Request $request): array
    {
        return $request->validate([
            'cliente_id' => ['required', 'exists:clientes,id'],
            'tipo_pagamento' => ['required', Rule::in(['dinheiro', 'cartao', 'pix'])],
            'status' => ['nullable', Rule::in(['aguardando_pagamento', 'pagamento_efetuado'])],
            'comprovante_pagamento' => ['nullable', 'file', 'mimes:jpg,jpeg,png,pdf', 'max:5120'],
            'itens' => ['required', 'array', 'min:1'],
            'itens.*.produto_id' => ['required', 'exists:produtos,id'],
            'itens.*.quantidade' => ['required', 'integer', 'min:1'],
        ]);
    }

    /**
     * Guarda o comprovante de pagamento enviado, substituindo o anterior se existir.
     */
    private function storeComprovante(Request $request, Pedido $pedido): void
    {
        if (! $request->hasFile('comprovante_pagamento')) {
            return;
        }

        if ($pedido->comprovante_pagamento) {
            Storage::disk('public')->delete($pedido->comprovante_pagamento);
        }

        $path = $request->file('comprovante_pagamento')->store('comprovantes', 'public');
        $pedido->update(['comprovante_pagamento' => $path]);
    }

    /**
     * Decrementa o estoque de cada produto, registra o preço praticado
     * no momento do pedido e atualiza o total.
     */
    private function applyItens(Pedido $pedido, array $itens): void
    {
        $total = 0;

        foreach ($itens as $item) {
            $produto = Produto::findOrFail($item['produto_id']);

            if ($produto->stock < $item['quantidade']) {
                throw ValidationException::withMessages([
                    'itens' => "Estoque insuficiente para o produto \"{$produto->description}\" (disponível: {$produto->stock}).",
                ]);
            }

            $produto->decrement('stock', $item['quantidade']);

            $pedido->itens()->create([
                'produto_id' => $produto->id,
                'quantidade' => $item['quantidade'],
                'preco_unitario' => $produto->price,
            ]);

            $total += $produto->price * $item['quantidade'];
        }

        $pedido->update(['total' => $total]);
    }
}
