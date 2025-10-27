<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\ContactUs;

class AdminContactUsController extends Controller
{
    public function index()
    {
        $contacts = ContactUs::orderBy('created_at', 'desc')->get();
        return view('admin.contact-us.index', compact('contacts'));
    }

    public function show($id)
    {
        $contact = ContactUs::findOrFail($id);
        return view('admin.contact-us.show', compact('contact'));
    }
}
