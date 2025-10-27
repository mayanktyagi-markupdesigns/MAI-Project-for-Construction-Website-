<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ProjectSubfolder extends Model
{
    protected $fillable = [
        'project_id',
        'name',
        'drive_folder_id',
    ];

    public function project()
    {
        return $this->belongsTo(Project::class);
    }
}
