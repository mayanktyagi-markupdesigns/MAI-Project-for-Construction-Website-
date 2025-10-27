@extends('layouts.admin')

@section('title', 'Projects')

@section('content')
<h2 class="text-3xl font-bold text-gray-900 bg-gradient-to-r from-teal-500 to-blue-500 bg-clip-text text-transparent">Projects</h2>

<!-- Filter Form -->
<div class="bg-white p-6 rounded-lg shadow-md mb-6">
    <form method="GET" action="{{ route('admin.projects') }}" class="flex flex-col md:flex-row gap-4">
        <div class="flex-1">
            <label for="search" class="block text-gray-700 mb-2">Search by Name</label>
            <input type="text" name="search" id="search" value="{{ request('search') }}" class="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-teal-500">
        </div>
        <div class="flex-1">
            <label for="min_docs" class="block text-gray-700 mb-2">Min Documents</label>
            <input type="number" name="min_docs" id="min_docs" value="{{ request('min_docs') }}" min="0" class="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-teal-500">
        </div>
        <div class="flex items-end">
            <button type="submit" class="bg-teal-500 text-white px-4 py-2 rounded hover:bg-teal-600">Filter</button>
            <a href="{{ route('admin.projects') }}" class="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 ml-2">Clear</a>
        </div>
    </form>
</div>

<!-- Projects Table -->
<div class="bg-white p-6 rounded-lg shadow-md">
    <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
            <thead>
                <tr class="bg-gray-200 text-gray-700">
                    <th class="p-3">ID</th>
                    <th class="p-3">Name</th>
                    <th class="p-3">Documents</th>
                    <th class="p-3">Last Activity</th>
                </tr>
            </thead>
            <tbody>
                @forelse ($projects as $project)
                    <tr class="border-b hover:bg-gray-100">
                        <td class="p-3">{{ $project->id }}</td>
                        <td class="p-3">{{ $project->name }}</td>
                        <td class="p-3">{{ $project->doc_count }}</td>
                        <td class="p-3">{{ $project->last_activity ?? 'N/A' }}</td>
                    </tr>
                @empty
                    <tr><td colspan="4" class="p-3 text-center">No projects found</td></tr>
                @endforelse
            </tbody>
        </table>
    </div>

    <!-- Pagination -->
    <div class="mt-6">
        {{ $projects->links() }}
    </div>
</div>
@endsection