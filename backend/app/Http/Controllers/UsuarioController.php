<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;

class UsuarioController extends Controller
{
    public function index()
    {
        return User::orderBy('name')->get();
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users,email'],
            'password' => ['required', 'string', 'min:3'],
            'tipo_usuario' => ['required', Rule::in(User::TIPOS_USUARIO)],
        ]);

        $user = User::create([
            'name' => $data['name'],
            'email' => $data['email'],
            'password' => Hash::make($data['password']),
            'tipo_usuario' => $data['tipo_usuario'],
        ]);

        return response()->json($user, 201);
    }

    public function show(User $usuario)
    {
        return $usuario;
    }

    public function update(Request $request, User $usuario)
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', Rule::unique('users', 'email')->ignore($usuario->id)],
            'password' => ['nullable', 'string', 'min:3'],
            'tipo_usuario' => ['required', Rule::in(User::TIPOS_USUARIO)],
        ]);

        if ($usuario->id === $request->user()->id && $data['tipo_usuario'] !== 'superadmin') {
            return response()->json([
                'message' => 'Você não pode remover seu próprio acesso de superadmin.',
            ], 422);
        }

        $usuario->name = $data['name'];
        $usuario->email = $data['email'];
        $usuario->tipo_usuario = $data['tipo_usuario'];
        if (! empty($data['password'])) {
            $usuario->password = Hash::make($data['password']);
        }
        $usuario->save();

        return $usuario;
    }

    public function destroy(Request $request, User $usuario)
    {
        if ($usuario->id === $request->user()->id) {
            return response()->json([
                'message' => 'Você não pode excluir seu próprio usuário.',
            ], 422);
        }

        $usuario->delete();

        return response()->noContent();
    }
}
