<?php

namespace Database\Factories;

use App\Models\Produto;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Produto>
 */
class ProdutoFactory extends Factory
{
    /**
     * @return \Faker\Generator
     */
    protected function withFaker()
    {
        return \Faker\Factory::create('pt_BR');
    }

    /**
     * @var array<int, string>
     */
    private static array $baseNames = [
        'Caneta Esferográfica', 'Caderno Universitário', 'Mochila Escolar', 'Fone de Ouvido Bluetooth',
        'Mouse sem Fio', 'Teclado Mecânico', 'Monitor LED', 'Cadeira de Escritório', 'Mesa de Escritório',
        'Smartphone', 'Carregador Portátil', 'Cabo USB-C', 'Garrafa Térmica', 'Tênis Esportivo',
        'Camiseta de Algodão', 'Calça Jeans', 'Relógio de Pulso', 'Óculos de Sol', 'Panela de Pressão',
        'Liquidificador', 'Cafeteira Elétrica', 'Ventilador de Mesa', 'Luminária de Mesa', 'Livro de Ficção',
        'Jogo de Tabuleiro', 'Bicicleta', 'Skate', 'Bola de Futebol', 'Tapete Antiderrapante', 'Cortina Blackout',
    ];

    /**
     * @var array<int, string>
     */
    private static array $variants = [
        'Premium', 'Básico', 'Pro', 'Plus', 'Standard', 'Compacto', 'Deluxe', 'Slim',
    ];

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'description' => sprintf(
                '%s %s',
                $this->faker->randomElement(self::$baseNames),
                $this->faker->randomElement(self::$variants)
            ),
            'price' => $this->faker->randomFloat(2, 5, 500),
            'stock' => $this->faker->numberBetween(0, 200),
        ];
    }
}
