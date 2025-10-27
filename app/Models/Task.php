<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Task extends Model
{
    protected $fillable = [
        'project_id', 'title', 'description', 'status', 'due_date', 'priority', 'assigned_to',
        'linked_submittal_id', 'linked_document_id', 'linked_email_id'
    ];

    public function project()
    {
        return $this->belongsTo(Project::class);
    }

    public function assignedTo()
    {
        return $this->belongsTo(User::class, 'assigned_to');
    }

    public function submittal()
    {
        return $this->belongsTo(Submittal::class, 'linked_submittal_id');
    }

    public function document()
    {
        return $this->belongsTo(Document::class, 'linked_document_id');
    }

    public function email()
    {
        return $this->belongsTo(Email::class, 'linked_email_id');
    }
}
