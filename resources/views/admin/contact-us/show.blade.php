@extends('layouts.admin')

@section('title', 'Contact Us Details')

@section('content')
<div class="space-y-8">
    <h2 class="text-3xl font-bold text-gray-900 bg-gradient-to-r from-teal-500 to-blue-500 bg-clip-text text-transparent">Contact Us Details</h2>
    <div class="bg-white/80 backdrop-blur-sm rounded-lg shadow-lg p-6">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
                <p class="text-gray-700"><strong>First Name:</strong> {{ $contact->firstname }}</p>
                <p class="text-gray-700 mt-2"><strong>Last Name:</strong> {{ $contact->lastname }}</p>
                <p class="text-gray-700 mt-2"><strong>Email:</strong> {{ $contact->email }}</p>
                <p class="text-gray-700 mt-2"><strong>Company:</strong> {{ $contact->company_name ?? 'N/A' }}</p>
            </div>
            <div>
                <p class="text-gray-700"><strong>Message:</strong></p>
                <p class="text-gray-600 mt-2">{{ $contact->message }}</p>
            </div>
        </div>
        <div class="mt-6">
            <a href="{{ route('admin.contact-us.index') }}" class="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600">Back</a>
        </div>
    </div>
</div>
@endsection