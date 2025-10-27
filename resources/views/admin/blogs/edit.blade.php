@extends('layouts.admin')

@section('title', 'Edit Blog Post')

@section('content')
<h2 class="text-2xl font-bold mb-6 text-gray-800">Edit Blog Post</h2>

<div class="bg-white p-6 rounded-lg shadow-md max-w-2xl">
    <form method="POST" action="{{ route('admin.blogs.update', $blog) }}" enctype="multipart/form-data">
        @csrf
        @method('PUT')
        <div class="mb-4">
            <label class="block text-gray-700 mb-2">Title</label>
            <input type="text" id="title" name="title" value="{{ $blog->title }}" class="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-teal-500" required>
            @error('title') <span class="text-red-500">{{ $message }}</span> @enderror
        </div>
        <div class="mb-4">
            <label class="block text-gray-700 mb-2">Slug</label>
            <input type="text" id="slug" name="slug" value="{{ $blog->slug }}" class="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-teal-500" required>
            @error('slug') <span class="text-red-500">{{ $message }}</span> @enderror
        </div>
        <div class="mb-4">
            <label class="block text-gray-700 mb-2">Content</label>
            <textarea name="content" id="summernote" class="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-teal-500" required>{{ $blog->content }}</textarea>
            @error('content') <span class="text-red-500">{{ $message }}</span> @enderror
        </div>
        <div class="mb-4">
            <label class="block text-gray-700 mb-2">Image</label>
            @if ($blog->featured_image)
                <img src="{{ asset('storage/blogs/' . $blog->featured_image) }}" alt="{{ $blog->title }}" class="w-32 h-32 mb-2 object-cover">
            @endif
            <input type="file" name="featured_image" class="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-teal-500">
            @error('featured_image') <span class="text-red-500">{{ $message }}</span> @enderror
        </div>
        <div class="mb-4">
            <label class="block text-gray-700 mb-2">Status</label>
            <select name="status" class="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-teal-500">
                <option value="draft" {{ $blog->status == 'draft' ? 'selected' : '' }}>Draft</option>
                <option value="published" {{ $blog->status == 'published' ? 'selected' : '' }}>Published</option>
            </select>
            @error('status') <span class="text-red-500">{{ $message }}</span> @enderror
        </div>
        <button type="submit" class="bg-teal-500 text-white px-4 py-2 rounded hover:bg-teal-600">Update Post</button>
        <a href="{{ route('admin.blogs.index') }}" class="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 ml-2">Cancel</a>
    </form>
</div>

<script>
    $(document).ready(function() {
        $('#summernote').summernote({
            height: 300, // Set editor height
            toolbar: [
                ['style', ['bold', 'italic', 'underline', 'clear']],
                ['font', ['strikethrough', 'superscript', 'subscript', 'fontsize', 'color']],
                ['para', ['ul', 'ol', 'paragraph']],
                ['insert', ['link', 'picture', 'hr']],
            ],
            // Customize font sizes
            fontSizes: ['8', '9', '10', '11', '12', '14', '18', '24', '36', '48', '64'],
            // Customize color palette
            colorPalette: [
                '#000000', '#434343', '#666666', '#999999', '#b7b7b7', '#cccccc', '#d9d9d9', '#efefef', '#f3f3f3', '#ffffff',
                '#980000', '#ff0000', '#ff9900', '#ffff00', '#00ff00', '#00ffff', '#4a86e8', '#0000ff', '#9900ff', '#ff00ff'
            ]
        });
        // Initialize with existing content
        $('#summernote').summernote('code', '{{ $blog->content }}');
        
        // Auto-generate slug from title
        $('#title').on('input', function() {
            let title = $(this).val();
            let slug = title.toLowerCase()
                .replace(/[^a-z0-9\s-]/g, '') // Remove special characters except spaces and hyphens
                .replace(/\s+/g, '-') // Replace spaces with hyphens
                .replace(/-+/g, '-') // Replace multiple hyphens with a single one
                .trim(); // Remove leading/trailing spaces
            $('#slug').val(slug);
        });
        
    });
</script>
@endsection