<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Hash;

class EarlyAccessRequest extends Model
{
    protected $fillable = [
        'name',
        'company_name',
        'email',
        'password',
        'years_in_construction',
        'usage_plans',
        'project_management',
        'scheduling_planning',
        'estimating_budgeting',
        'procurement_material',
        'communication_collaboration',
        'quality_safety',
    ];

    /**
     * Automatically hash the password when setting it.
     */
    public function setPasswordAttribute($value)
    {
        $this->attributes['password'] = Hash::make($value);
    }

    /**
     * Cast the pain points as booleans.
     */
    protected $casts = [
        'project_management' => 'boolean',
        'scheduling_planning' => 'boolean',
        'estimating_budgeting' => 'boolean',
        'procurement_material' => 'boolean',
        'communication_collaboration' => 'boolean',
        'quality_safety' => 'boolean',
    ];
}
