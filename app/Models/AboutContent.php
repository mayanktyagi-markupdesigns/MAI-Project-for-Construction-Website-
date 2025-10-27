<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AboutContent extends Model
{
    protected $fillable = ['slug', 'content', 'title', 'description'];

    public function stages()
    {
        return $this->hasMany(AboutStage::class);
    }

    public function cards()
    {
        return $this->hasMany(AboutCard::class);
    }
}
