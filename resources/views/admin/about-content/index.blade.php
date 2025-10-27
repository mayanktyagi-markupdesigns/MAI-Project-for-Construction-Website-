@extends('layouts.admin')

@section('title', 'Manage About Us Content')

@section('content')
<div class="space-y-8">
    <h2 class="text-3xl font-bold text-gray-900 bg-gradient-to-r from-teal-500 to-blue-500 bg-clip-text text-transparent">Manage About Us Content</h2>
    <div class="bg-white/80 backdrop-blur-sm rounded-lg shadow-lg p-6">
        <a href="{{ route('admin.about-content.create') }}" class="mb-4 inline-block bg-teal-500 text-white px-4 py-2 rounded hover:bg-teal-600">Add New Content</a>
        <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200">
                <thead class="bg-gray-50">
                    <tr>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Slug</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-200">
                    @forelse ($aboutContents as $content)
                    <tr>
                        <td class="px-6 py-4 whitespace-nowrap">{{ $content->slug }}</td>
                        <td class="px-6 py-4 whitespace-nowrap">{{ $content->title ?? 'N/A' }}</td>
                        <td class="px-6 py-4 whitespace-nowrap">
                            <a href="{{ route('admin.about-content.edit', $content->id) }}" class="text-indigo-600 hover:text-indigo-900 mr-2">Edit</a>
                            <a href="{{ route('admin.about-content.manage-stages', $content->id) }}" class="text-blue-600 hover:text-blue-900 mr-2">Manage Stages</a>
                            <a href="{{ route('admin.about-content.manage-cards', $content->id) }}" class="text-green-600 hover:text-green-900 mr-2">Manage Cards</a>
                            <form action="{{ route('admin.about-content.destroy', $content->id) }}" method="POST" style="display:inline;" onsubmit="return confirm('Are you sure?');">
                                @csrf
                                @method('DELETE')
                                <button type="submit" class="text-red-600 hover:text-red-900">Delete</button>
                            </form>
                        </td>
                    </tr>
                    @empty
                    <tr>
                        <td colspan="3" class="px-6 py-4 text-center text-gray-500">No content found.</td>
                    </tr>
                    @endforelse
                </tbody>
            </table>
        </div>
    </div>
</div>
@endsection