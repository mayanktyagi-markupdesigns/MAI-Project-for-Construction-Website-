<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Blog;

class AdminBlogController extends Controller
{
    public function index()
    {
        $blogs = Blog::latest()->paginate(10); // Paginate for better UX
        return view('admin.blogs.index', compact('blogs'));
    }

    public function create()
    {
        return view('admin.blogs.create');
    }

    public function store(Request $request)
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'content' => 'required|string',
            'status' => 'required|in:draft,published',
            'featured_image' => 'nullable|image|max:2048', // Image validation: max 2MB
            'slug' => 'required|string|unique:blogs,slug|max:255',
        ]);

        $data = $request->all();
        if ($request->hasFile('featured_image')) {
            $imageName = time() . '.' . $request->featured_image->extension();
            $request->featured_image->move(public_path('storage/blogs'), $imageName);
            $data['featured_image'] = $imageName;
        }

        Blog::create($data);

        return redirect()->route('admin.blogs.index')->with('success', 'Blog post created successfully.');
    }

    public function show(Blog $blog)
    {
        return view('admin.blogs.show', compact('blog'));
    }

    public function edit(Blog $blog)
    {
        return view('admin.blogs.edit', compact('blog'));
    }

    public function update(Request $request, Blog $blog)
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'content' => 'required|string',
            'status' => 'required|in:draft,published',
            'featured_image' => 'nullable|image|max:2048', // Image validation: max 2MB
            'slug' => 'required|string|unique:blogs,slug,' . $blog->id . '|max:255',
        ]);

        $data = $request->all();
        if ($request->hasFile('featured_image')) {
            // Delete old image if exists
            if ($blog->featured_image && file_exists(public_path('storage/blogs/' . $blog->featured_image))) {
                unlink(public_path('storage/blogs/' . $blog->featured_image));
            }
            $imageName = time() . '.' . $request->featured_image->extension();
            $request->featured_image->move(public_path('storage/blogs'), $imageName);
            $data['featured_image'] = $imageName;
        }

        $blog->update($data);

        return redirect()->route('admin.blogs.index')->with('success', 'Blog post updated successfully.');
    }

    public function destroy(Blog $blog)
    {
        if ($blog->featured_image && file_exists(public_path('storage/blogs/' . $blog->featured_image))) {
            unlink(public_path('storage/blogs/' . $blog->featured_image));
        }
        $blog->delete();

        return redirect()->route('admin.blogs.index')->with('success', 'Blog post deleted successfully.');
    }
}
