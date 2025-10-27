<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Document extends Model
{
    protected $fillable = [
        'project_id', 'user_id', 'file_name', 'folder_name', 'file_type', 'upload_date',
        'ai_eligible', 'parse_status', 'drive_file_id', 'local_path', 'parsed_data',
        'extracted_text', 'parsed_at', 'parse_error', 'parse_attempts', 'is_processed',
    ];

    protected $casts = [
        'parsed_data' => 'array',
        'subcontractors' => 'array', // If linked to project subcontractors
        'upload_date' => 'datetime',
        'parsed_at' => 'datetime',
        'ai_eligible' => 'boolean',
        'is_processed' => 'boolean',
    ];

    /**
     * Relationship with Project.
     */
    public function project()
    {
        return $this->belongsTo(Project::class);
    }

    /**
     * Relationship with User (uploader).
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
