<?php

namespace Database\Factories;

use App\Models\Cliente;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Cliente>
 */
class ClienteFactory extends Factory
{
    /**
     * @return \Faker\Generator
     */
    protected function withFaker()
    {
        return \Faker\Factory::create('pt_BR');
    }

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'name' => $this->faker->unique()->name(),
            'email' => $this->faker->boolean(70) ? $this->faker->unique()->safeEmail() : null,
            'phone' => sprintf(
                '(%02d) 9%04d-%04d',
                $this->faker->numberBetween(11, 99),
                $this->faker->numberBetween(0, 9999),
                $this->faker->numberBetween(0, 9999)
            ),
            'street' => $this->faker->streetName(),
            'number' => (string) $this->faker->numberBetween(1, 9999),
            'city' => $this->faker->city(),
            'state' => $this->faker->stateAbbr(),
            'zip_code' => sprintf('%05d-%03d', $this->faker->numberBetween(0, 99999), $this->faker->numberBetween(0, 999)),
            'location' => $this->faker->boolean(70)
                ? sprintf('%s, %s', $this->faker->latitude(-33, 5), $this->faker->longitude(-73, -34))
                : null,
        ];
    }
}
