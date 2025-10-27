@extends('layouts.admin')

@section('title', 'Edit About Us Content')

@section('content')
<div class="space-y-8">
    <h2 class="text-3xl font-bold text-gray-900 bg-gradient-to-r from-teal-500 to-blue-500 bg-clip-text text-transparent">Edit About Us Content</h2>
    <div class="bg-white/80 backdrop-blur-sm rounded-lg shadow-lg p-6">
        <form action="{{ route('admin.about-content.update', $aboutContent->id) }}" method="POST">
            @csrf
            @method('PUT')
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label for="slug" class="block text-sm font-medium text-gray-700">Slug</label>
                    <input type="text" name="slug" id="slug" value="{{ old('slug', $aboutContent->slug) }}" class="mt-1 block w-full border-gray-300 rounded-md shadow-sm" required>
                </div>
                <div>
                    <label for="title" class="block text-sm font-medium text-gray-700">Title</label>
                    <input type="text" name="title" id="title" value="{{ old('title', $aboutContent->title) }}" class="mt-1 block w-full border-gray-300 rounded-md shadow-sm">
                </div>
                <div class="md:col-span-2">
                    <label for="content" class="block text-sm font-medium text-gray-700">Content</label>
                    <textarea name="content" id="content" class="mt-1 block w-full border-gray-300 rounded-md shadow-sm" rows="4">{{ old('content', $aboutContent->content) }}</textarea>
                </div>
                <div class="md:col-span-2">
                    <label for="description" class="block text-sm font-medium text-gray-700">Description</label>
                    <textarea name="description" id="description" class="mt-1 block w-full border-gray-300 rounded-md shadow-sm" rows="4">{{ old('description', $aboutContent->description) }}</textarea>
                </div>
            </div>
            <div class="mt-6">
                <button type="submit" class="bg-teal-500 text-white px-4 py-2 rounded hover:bg-teal-600">Update</button>
                <a href="{{ route('admin.about-content.index') }}" class="ml-2 text-gray-500 hover:text-gray-700">Cancel</a>
            </div>
        </form>
    </div>
</div>
@endsection