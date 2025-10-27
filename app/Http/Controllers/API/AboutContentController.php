<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\AboutContent;

class AboutContentController extends Controller
{
    /**
     * Fetch About Us content by slug for the frontend.
     */
    public function show($slug)
    {
        $aboutContent = AboutContent::where('slug', $slug)
            ->with(['stages.points', 'cards'])
            ->firstOrFail();

        return response()->json([
            'status' => 'success',
            'data' => $aboutContent
        ], 200);
    }
}
