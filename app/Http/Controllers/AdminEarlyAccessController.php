<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\EarlyAccessRequest;

class AdminEarlyAccessController extends Controller
{
    public function index()
    {
        $earlyAccessRequests = EarlyAccessRequest::orderBy('created_at', 'desc')->get();
        return view('admin.early-access.index', compact('earlyAccessRequests'));
    }

    public function show($id)
    {
        $earlyAccessRequest = EarlyAccessRequest::findOrFail($id);
        return view('admin.early-access.show', compact('earlyAccessRequest'));
    }
}
