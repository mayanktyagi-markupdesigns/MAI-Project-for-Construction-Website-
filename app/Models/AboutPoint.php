<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AboutPoint extends Model
{
    protected $fillable = ['about_stage_id', 'point'];

    public function stage()
    {
        return $this->belongsTo(AboutStage::class);
    }
}
