@extends('layouts.admin')

@section('title', 'Manage Cards')

@section('content')
<div class="space-y-8">
    <h2 class="text-3xl font-bold text-gray-900 bg-gradient-to-r from-teal-500 to-blue-500 bg-clip-text text-transparent">Manage Cards for {{ $aboutContent->title ?? $aboutContent->slug }}</h2>
    <div class="bg-white/80 backdrop-blur-sm rounded-lg shadow-lg p-6">
        <form action="{{ route('admin.about-content.store-card', $aboutContent->id) }}" method="POST" class="mb-6">
            @csrf
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label for="title" class="block text-sm font-medium text-gray-700">Title</label>
                    <input type="text" name="title" id="title" class="mt-1 block w-full border-gray-300 rounded-md shadow-sm" required>
                </div>
                <div>
                    <label for="description" class="block text-sm font-medium text-gray-700">Description</label>
                    <textarea name="description" id="description" class="mt-1 block w-full border-gray-300 rounded-md shadow-sm" rows="3" required></textarea>
                </div>
            </div>
            <div class="mt-4">
                <button type="submit" class="bg-teal-500 text-white px-4 py-2 rounded hover:bg-teal-600">Add Card</button>
            </div>
        </form>
        <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200">
                <thead class="bg-gray-50">
                    <tr>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-200">
                    @forelse ($aboutContent->cards as $card)
                    <tr>
                        <td class="px-6 py-4 whitespace-nowrap">{{ $card->title }}</td>
                        <td class="px-6 py-4 whitespace-nowrap">{{ $card->description }}</td>
                        <td class="px-6 py-4 whitespace-nowrap">
                            <a href="#" data-bs-toggle="modal" data-bs-target="#editCardModal{{ $card->id }}" class="text-indigo-600 hover:text-indigo-900 mr-2">Edit</a>
                            <form action="{{ route('admin.about-content.destroy-card', $card->id) }}" method="POST" style="display:inline;" onsubmit="return confirm('Are you sure?');">
                                @csrf
                                @method('DELETE')
                                <button type="submit" class="text-red-600 hover:text-red-900">Delete</button>
                            </form>
                        </td>
                    </tr>
                    <!-- Edit Modal -->
                    <div class="modal fade" id="editCardModal{{ $card->id }}" tabindex="-1" aria-labelledby="editCardModalLabel{{ $card->id }}" aria-hidden="true">
                        <div class="modal-dialog">
                            <div class="modal-content">
                                <div class="modal-header">
                                    <h5 class="modal-title" id="editCardModalLabel{{ $card->id }}">Edit Card</h5>
                                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                                </div>
                                <form action="{{ route('admin.about-content.update-card', $card->id) }}" method="POST">
                                    @csrf
                                    @method('PUT')
                                    <div class="modal-body">
                                        <div class="mb-3">
                                            <label for="title_{{ $card->id }}" class="form-label">Title</label>
                                            <input type="text" name="title" id="title_{{ $card->id }}" value="{{ $card->title }}" class="form-control" required>
                                        </div>
                                        <div class="mb-3">
                                            <label for="description_{{ $card->id }}" class="form-label">Description</label>
                                            <textarea name="description" id="description_{{ $card->id }}" class="form-control" rows="3" required>{{ $card->description }}</textarea>
                                        </div>
                                    </div>
                                    <div class="modal-footer">
                                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                                        <button type="submit" class="btn btn-primary">Save changes</button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                    @empty
                    <tr>
                        <td colspan="3" class="px-6 py-4 text-center text-gray-500">No cards found.</td>
                    </tr>
                    @endforelse
                </tbody>
            </table>
        </div>
        <div class="mt-6">
            <a href="{{ route('admin.about-content.index') }}" class="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600">Back</a>
        </div>
    </div>
</div>
@endsection