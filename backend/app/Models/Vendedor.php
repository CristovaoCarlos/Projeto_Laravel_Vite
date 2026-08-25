<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Table;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Table('vendedores')]
#[Fillable(['nome'])]
class Vendedor extends Model
{
    public function historicos(): HasMany
    {
        return $this->hasMany(Historico::class);
    }
}
