<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\EarlyAccessRequest;
use Illuminate\Support\Facades\Validator;

class EarlyAccessController extends Controller
{
    public function store(Request $request)
    {
        // Validation
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'company_name' => 'required|string|max:255',
            'email' => 'required|email|unique:early_access_requests,email',
            'password' => 'required|string|min:6',
            'years_in_construction' => 'required', // Assuming ranges like onboarding in FRD
            'usage_plans' => 'required|array', // e.g., ["Automate project setup", "AI document parsing"]
            'usage_plans.*' => 'string',
            'project_management' => 'required|boolean',
            'scheduling_planning' => 'required|boolean',
            'estimating_budgeting' => 'required|boolean',
            'procurement_material' => 'required|boolean',
            'communication_collaboration' => 'required|boolean',
            'quality_safety' => 'required|boolean',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        // Create record
        $earlyAccess = EarlyAccessRequest::create([
            'name' => $request->name,
            'company_name' => $request->company_name,
            'email' => $request->email,
            'password' => $request->password, // Hashed automatically via mutator
            'years_in_construction' => $request->years_in_construction,
            'usage_plans' => json_encode($request->usage_plans), // Convert array to JSON
            'project_management' => $request->project_management,
            'scheduling_planning' => $request->scheduling_planning,
            'estimating_budgeting' => $request->estimating_budgeting,
            'procurement_material' => $request->procurement_material,
            'communication_collaboration' => $request->communication_collaboration,
            'quality_safety' => $request->quality_safety,
        ]);

        return response()->json([
            'message' => 'Early access request submitted successfully!',
            'data' => $earlyAccess,
        ], 201);
    }
}
