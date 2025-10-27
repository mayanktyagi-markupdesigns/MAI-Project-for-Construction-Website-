@extends('layouts.admin')

@section('title', 'Blog Management')

@section('content')
<h2 class="text-2xl font-bold mb-6 text-gray-800">Blog Posts</h2>

@if (session('success'))
    <div class="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
        {{ session('success') }}
    </div>
@endif

<div class="bg-white p-6 rounded-lg shadow-md">
    <div class="flex justify-between mb-4">
        <h3 class="text-lg font-semibold">All Posts</h3>
        <a href="{{ route('admin.blogs.create') }}" class="bg-teal-500 text-white px-4 py-2 rounded hover:bg-teal-600">Create New Post</a>
    </div>
    <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
            <thead>
                <tr class="bg-gray-200 text-gray-700">
                    <th class="p-3">ID</th>
                    <th class="p-3">Title</th>
                    <th class="p-3">Slug</th>
                    <th class="p-3">Image</th>
                    <th class="p-3">Status</th>
                    <th class="p-3">Created At</th>
                    <th class="p-3">Actions</th>
                </tr>
            </thead>
            <tbody>
                @forelse ($blogs as $blog)
                    <tr class="border-b hover:bg-gray-100">
                        <td class="p-3">{{ $blog->id }}</td>
                        <td class="p-3">{{ $blog->title }}</td>
                        <td class="p-3">{{ $blog->slug }}</td>
                        <td class="p-3">
                            @if ($blog->image)
                                <img src="{{ asset('storage/blogs/' . $blog->image) }}" alt="{{ $blog->title }}" class="w-16 h-16 object-cover">
                            @else
                                No Image
                            @endif
                        </td>
                        <td class="p-3">
                            <span class="px-2 py-1 rounded text-sm {{ $blog->status == 'published' ? 'bg-green-200 text-green-800' : 'bg-yellow-200 text-yellow-800' }}">
                                {{ ucfirst($blog->status) }}
                            </span>
                        </td>
                        <td class="p-3">{{ $blog->created_at->format('Y-m-d') }}</td>
                        <td class="p-3">
                            <a href="{{ route('admin.blogs.show', $blog) }}" class="text-blue-500 mr-2">View</a>
                            <a href="{{ route('admin.blogs.edit', $blog) }}" class="text-yellow-500 mr-2">Edit</a>
                            <form method="POST" action="{{ route('admin.blogs.destroy', $blog) }}" class="inline">
                                @csrf
                                @method('DELETE')
                                <button type="submit" class="text-red-500" onclick="return confirm('Are you sure?')">Delete</button>
                            </form>
                        </td>
                    </tr>
                @empty
                    <tr><td colspan="7" class="p-3 text-center">No blog posts found</td></tr>
                @endforelse
            </tbody>
        </table>
    </div>

    {{ $blogs->links() }} <!-- Pagination -->
</div>
@endsection