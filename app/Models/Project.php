<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Project extends Model
{
    protected $fillable = [
        'user_id',
        'name',
        'address',
        'client_agency',
        'contract_amount',
        'start_date',
        'end_date',
        'architect_name',
        'subcontractors',
        'drive_folder_id',
    ];

    /**
     * Relationship with User (creator).
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Relationship with Documents.
     */
    public function documents()
    {
        return $this->hasMany(Document::class);
    }
    
    public function tasks()
    {
        return $this->hasMany(Task::class);
    }
    
    public function subfolders()
    {
        return $this->hasMany(ProjectSubfolder::class);
    }
}
