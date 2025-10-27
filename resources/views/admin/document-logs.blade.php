@extends('layouts.admin')

@section('title', 'Document Logs')

@section('content')
<h2 class="text-3xl font-bold text-gray-900 bg-gradient-to-r from-teal-500 to-blue-500 bg-clip-text text-transparent">Document Logs</h2>

<!-- Filter Form -->
<div class="bg-white p-6 rounded-lg shadow-md mb-6">
    <form method="GET" action="{{ route('admin.document-logs') }}" class="flex flex-col md:flex-row gap-4">
        <div class="flex-1">
            <label for="search" class="block text-gray-700 mb-2">Search by File Name or Status</label>
            <input type="text" name="search" id="search" value="{{ request('search') }}" class="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-teal-500">
        </div>
        <div class="flex-1">
            <label for="user_id" class="block text-gray-700 mb-2">Filter by User ID</label>
            <input type="number" name="user_id" id="user_id" value="{{ request('user_id') }}" min="0" class="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-teal-500">
        </div>
        <div class="flex items-end">
            <button type="submit" class="bg-teal-500 text-white px-4 py-2 rounded hover:bg-teal-600">Filter</button>
            <a href="{{ route('admin.document-logs') }}" class="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 ml-2">Clear</a>
        </div>
    </form>
</div>

<!-- Document Logs Table -->
<div class="bg-white p-6 rounded-lg shadow-md">
    <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
            <thead>
                <tr class="bg-gray-200 text-gray-700">
                    <th class="p-3">ID</th>
                    <th class="p-3">File Name</th>
                    <th class="p-3">User ID</th>
                    <th class="p-3">Status</th>
                    <th class="p-3">Date</th>
                </tr>
            </thead>
            <tbody>
                @forelse ($logs as $log)
                    <tr class="border-b hover:bg-gray-100">
                        <td class="p-3">{{ $log->id }}</td>
                        <td class="p-3">{{ $log->file_name }}</td>
                        <td class="p-3">{{ $log->user_id }}</td>
                        <td class="p-3">{{ $log->status }}</td>
                        <td class="p-3">{{ $log->upload_date ?? 'N/A' }}</td> <!-- Fixed field name from upload_date to date -->
                    </tr>
                @empty
                    <tr><td colspan="5" class="p-3 text-center">No logs found</td></tr>
                @endforelse
            </tbody>
        </table>
    </div>

    <!-- Pagination -->
    <div class="mt-6">
        {{ $logs->links() }}
    </div>
</div>
@endsection