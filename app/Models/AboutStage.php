<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AboutStage extends Model
{
    protected $fillable = ['about_content_id', 'title', 'video'];

    public function aboutContent()
    {
        return $this->belongsTo(AboutContent::class);
    }

    public function points()
    {
        return $this->hasMany(AboutPoint::class);
    }
}
