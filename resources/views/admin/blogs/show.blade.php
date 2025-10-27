@extends('layouts.admin')

@section('title', $blog->title)

@section('content')
<h2 class="text-2xl font-bold mb-6 text-gray-800">{{ $blog->title }}</h2>

<div class="bg-white p-6 rounded-lg shadow-md">
    <p class="mb-4"><strong>Slug:</strong> {{ $blog->slug }}</p>
    @if ($blog->image)
        <p class="mb-4"><strong>Image:</strong> <img src="{{ asset('storage/blogs/' . $blog->image) }}" alt="{{ $blog->title }}" class="w-32 h-32 object-cover"></p>
    @endif
    <p class="mb-4">{!! nl2br(e($blog->content)) !!}</p> <!-- Render HTML content from Summernote -->
    <p class="text-sm text-gray-500">Status: <span class="font-semibold">{{ ucfirst($blog->status) }}</span> | Created: {{ $blog->created_at->format('Y-m-d H:i') }}</p>
    <div class="mt-4">
        <a href="{{ route('admin.blogs.edit', $blog) }}" class="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600 mr-2">Edit</a>
        <form method="POST" action="{{ route('admin.blogs.destroy', $blog) }}" class="inline">
            @csrf
            @method('DELETE')
            <button type="submit" class="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600" onclick="return confirm('Are you sure?')">Delete</button>
        </form>
    </div>
</div>
@endsection