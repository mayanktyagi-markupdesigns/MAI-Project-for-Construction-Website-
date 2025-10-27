@extends('layouts.admin')

@section('title', 'Contact Us Submissions')

@section('content')
<div class="space-y-8">
    <h2 class="text-3xl font-bold text-gray-900 bg-gradient-to-r from-teal-500 to-blue-500 bg-clip-text text-transparent">Contact Us Submissions</h2>
    <div class="bg-white/80 backdrop-blur-sm rounded-lg shadow-lg p-6">
        <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200">
                <thead class="bg-gray-50">
                    <tr>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">First Name</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Name</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Company</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-200">
                    @forelse ($contacts as $contact)
                    <tr>
                        <td class="px-6 py-4 whitespace-nowrap">{{ $contact->firstname }}</td>
                        <td class="px-6 py-4 whitespace-nowrap">{{ $contact->lastname }}</td>
                        <td class="px-6 py-4 whitespace-nowrap">{{ $contact->email }}</td>
                        <td class="px-6 py-4 whitespace-nowrap">{{ $contact->company_name ?? 'N/A' }}</td>
                        <td class="px-6 py-4 whitespace-nowrap">
                            <a href="{{ route('admin.contact-us.show', $contact->id) }}" class="text-indigo-600 hover:text-indigo-900">View</a>
                        </td>
                    </tr>
                    @empty
                    <tr>
                        <td colspan="5" class="px-6 py-4 text-center text-gray-500">No contact submissions found.</td>
                    </tr>
                    @endforelse
                </tbody>
            </table>
        </div>
    </div>
</div>
@endsection