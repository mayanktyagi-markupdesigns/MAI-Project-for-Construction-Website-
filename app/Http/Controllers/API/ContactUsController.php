<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use App\Models\ContactUs;

class ContactUsController extends Controller
{
    public function store(Request $request)
    {
        try{
            // Validation
            $validator = Validator::make($request->all(), [
                'firstname' => 'required|string|max:255',
                'lastname' => 'required|string|max:255',
                'email' => 'required|email|max:255',
                'company_name' => 'nullable|string|max:255',
                'message' => 'required|string',
            ]);

            if ($validator->fails()) {
                return response()->json(['errors' => $validator->errors()]);
            }

            // Create record
            $contact = ContactUs::create($request->only(['firstname', 'lastname', 'email', 'company_name', 'message']));

            return response()->json([
                'message' => 'Contact form submitted successfully!',
                'data' => $contact,
            ], 201);
        }catch(\Exception $e){
            return response()->json(['success' => false, 'message' => $e->getMessage()]);
        }
        
    }
}
