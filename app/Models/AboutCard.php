<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AboutCard extends Model
{
    protected $fillable = ['about_content_id', 'title', 'description'];

    public function aboutContent()
    {
        return $this->belongsTo(AboutContent::class);
    }
}
