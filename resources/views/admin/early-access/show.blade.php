@extends('layouts.admin')

@section('title', 'Early Access Request Details')

@section('content')
<div class="space-y-8">
    <h2 class="text-3xl font-bold text-gray-900 bg-gradient-to-r from-teal-500 to-blue-500 bg-clip-text text-transparent">Early Access Request Details</h2>
    <div class="bg-white/80 backdrop-blur-sm rounded-lg shadow-lg p-6">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
                <p class="text-gray-700"><strong>Name:</strong> {{ $earlyAccessRequest->name }}</p>
                <p class="text-gray-700 mt-2"><strong>Email:</strong> {{ $earlyAccessRequest->email }}</p>
                <p class="text-gray-700 mt-2"><strong>Company:</strong> {{ $earlyAccessRequest->company_name }}</p>
                <p class="text-gray-700 mt-2"><strong>Years in Construction:</strong> {{ $earlyAccessRequest->years_in_construction }}</p>
            </div>
            <div>
                <p class="text-gray-700"><strong>Usage Plans:</strong> {{ implode(', ', json_decode($earlyAccessRequest->usage_plans)) }}</p>
                <p class="text-gray-700 mt-2"><strong>Project Management:</strong> {{ $earlyAccessRequest->project_management ? 'Yes' : 'No' }}</p>
                <p class="text-gray-700 mt-2"><strong>Scheduling & Planning:</strong> {{ $earlyAccessRequest->scheduling_planning ? 'Yes' : 'No' }}</p>
                <p class="text-gray-700 mt-2"><strong>Estimating & Budgeting:</strong> {{ $earlyAccessRequest->estimating_budgeting ? 'Yes' : 'No' }}</p>
                <p class="text-gray-700 mt-2"><strong>Procurement & Material:</strong> {{ $earlyAccessRequest->procurement_material ? 'Yes' : 'No' }}</p>
                <p class="text-gray-700 mt-2"><strong>Communication & Collaboration:</strong> {{ $earlyAccessRequest->communication_collaboration ? 'Yes' : 'No' }}</p>
                <p class="text-gray-700 mt-2"><strong>Quality & Safety:</strong> {{ $earlyAccessRequest->quality_safety ? 'Yes' : 'No' }}</p>
            </div>
        </div>
        <div class="mt-6">
            <a href="{{ route('admin.early-access.index') }}" class="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600">Back</a>
        </div>
    </div>
</div>
@endsection