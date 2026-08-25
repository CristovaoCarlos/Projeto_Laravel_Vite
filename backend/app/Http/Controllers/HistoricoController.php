<?php

namespace App\Http\Controllers;

use App\Models\Historico;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;

class HistoricoController extends Controller
{
    public function index()
    {
        return Historico::with('vendedor')->orderByDesc('data_hora')->get();
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'cliente_nome' => ['required', 'string', 'max:255'],
            'vendedor_id' => ['required', 'exists:vendedores,id'],
            'valor' => ['required', 'numeric', 'min:0'],
            'hora' => ['required', 'date_format:H:i'],
        ]);

        $historico = Historico::create([
            'cliente_nome' => $data['cliente_nome'],
            'vendedor_id' => $data['vendedor_id'],
            'valor' => $data['valor'],
            'data_hora' => Carbon::today()->setTimeFromTimeString($data['hora']),
        ]);

        return response()->json($historico->load('vendedor'), 201);
    }

    public function destroy(Historico $historico)
    {
        $historico->delete();

        return response()->noContent();
    }
}
