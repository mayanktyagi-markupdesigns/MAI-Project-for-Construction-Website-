@extends('layouts.admin')

@section('title', 'Users')

@section('content')
<h2 class="text-3xl font-bold text-gray-900 bg-gradient-to-r from-teal-500 to-blue-500 bg-clip-text text-transparent">Users</h2>

<!-- Filter Form -->
<div class="bg-white p-6 rounded-lg shadow-md mb-6">
    <form method="GET" action="{{ route('admin.users') }}" class="flex flex-col md:flex-row gap-4">
        <div class="flex-1">
            <label for="search" class="block text-gray-700 mb-2">Search by Name or Email</label>
            <input type="text" name="search" id="search" value="{{ request('search') }}" class="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-teal-500">
        </div>
        <div class="flex-1">
            <label for="min_projects" class="block text-gray-700 mb-2">Min Projects</label>
            <input type="number" name="min_projects" id="min_projects" value="{{ request('min_projects') }}" min="0" class="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-teal-500">
        </div>
        <div class="flex items-end">
            <button type="submit" class="bg-teal-500 text-white px-4 py-2 rounded hover:bg-teal-600">Filter</button>
            <a href="{{ route('admin.users') }}" class="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 ml-2">Clear</a>
        </div>
    </form>
</div>

<!-- Users Table -->
<div class="bg-white p-6 rounded-lg shadow-md">
    <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
            <thead>
                <tr class="bg-gray-200 text-gray-700">
                    <th class="p-3">ID</th>
                    <th class="p-3">Name</th>
                    <th class="p-3">Email</th>
                    <th class="p-3">Projects</th>
                    <th class="p-3">Last Login</th>
                </tr>
            </thead>
            <tbody>
                @forelse ($users as $user)
                    <tr class="border-b hover:bg-gray-100">
                        <td class="p-3">{{ $user->id }}</td>
                        <td class="p-3">{{ $user->name ?? 'N/A' }}</td>
                        <td class="p-3">{{ $user->email }}</td>
                        <td class="p-3">{{ $user->projects_count }}</td>
                        <td class="p-3">{{ $user->last_login ?? 'N/A' }}</td>
                    </tr>
                @empty
                    <tr><td colspan="5" class="p-3 text-center">No users found</td></tr>
                @endforelse
            </tbody>
        </table>
    </div>

    <!-- Pagination -->
    <div class="mt-6">
        {{ $users->links() }}
    </div>
</div>
@endsection