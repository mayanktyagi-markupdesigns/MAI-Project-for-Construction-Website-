<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ChatPrompt extends Model
{
    protected $fillable = ['user_message', 'ai_response', 'conversation_id'];
}
