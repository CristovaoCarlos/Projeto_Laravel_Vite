<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable(['name', 'email', 'phone', 'address'])]
class Cliente extends Model
{
    public function vendas(): HasMany
    {
        return $this->hasMany(Venda::class);
    }
}
