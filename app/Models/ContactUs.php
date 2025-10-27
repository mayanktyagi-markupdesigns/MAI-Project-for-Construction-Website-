<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ContactUs extends Model
{
    protected $fillable = [
        'firstname',
        'lastname',
        'email',
        'company_name',
        'message',
    ];
}
