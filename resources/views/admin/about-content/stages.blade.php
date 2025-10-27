@extends('layouts.admin')

@section('title', 'Manage Stages')

@section('content')
<div class="space-y-8">
    <h2 class="text-3xl font-bold text-gray-900 bg-gradient-to-r from-teal-500 to-blue-500 bg-clip-text text-transparent">Manage Stages for {{ $aboutContent->title ?? $aboutContent->slug }}</h2>
    <div class="bg-white/80 backdrop-blur-sm rounded-lg shadow-lg p-6">
        <form action="{{ route('admin.about-content.store-stage', $aboutContent->id) }}" method="POST" class="mb-6">
            @csrf
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label for="title" class="block text-sm font-medium text-gray-700">Title</label>
                    <input type="text" name="title" id="title" class="mt-1 block w-full border-gray-300 rounded-md shadow-sm" required>
                </div>
                <div>
                    <label for="video" class="block text-sm font-medium text-gray-700">Video URL</label>
                    <input type="url" name="video" id="video" class="mt-1 block w-full border-gray-300 rounded-md shadow-sm">
                </div>
            </div>
            <div class="mt-4">
                <button type="submit" class="bg-teal-500 text-white px-4 py-2 rounded hover:bg-teal-600">Add Stage</button>
            </div>
        </form>
        <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200">
                <thead class="bg-gray-50">
                    <tr>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Video</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-200">
                    @forelse ($aboutContent->stages as $stage)
                    <tr>
                        <td class="px-6 py-4 whitespace-nowrap">{{ $stage->title }}</td>
                        <td class="px-6 py-4 whitespace-nowrap">{{ $stage->video ?? 'N/A' }}</td>
                        <td class="px-6 py-4 whitespace-nowrap">
                            <a href="{{ route('admin.about-content.manage-points', $stage->id) }}" class="text-blue-600 hover:text-blue-900 mr-2">Manage Points</a>
                            <a href="#" data-bs-toggle="modal" data-bs-target="#editStageModal{{ $stage->id }}" class="text-indigo-600 hover:text-indigo-900 mr-2">Edit</a>
                            <form action="{{ route('admin.about-content.destroy-stage', $stage->id) }}" method="POST" style="display:inline;" onsubmit="return confirm('Are you sure?');">
                                @csrf
                                @method('DELETE')
                                <button type="submit" class="text-red-600 hover:text-red-900">Delete</button>
                            </form>
                        </td>
                    </tr>
                    
                    @empty
                    <tr>
                        <td colspan="3" class="px-6 py-4 text-center text-gray-500">No stages found.</td>
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

@push('modals')
    @foreach ($aboutContent->stages as $stage)
        <!-- Edit Modal -->
        <div class="modal fade" id="editStageModal{{ $stage->id }}" tabindex="-1" aria-labelledby="editStageModalLabel{{ $stage->id }}" aria-hidden="true">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title" id="editStageModalLabel{{ $stage->id }}">Edit Stage</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <form action="{{ route('admin.about-content.update-stage', $stage->id) }}" method="POST">
                        @csrf
                        @method('PUT')
                        <div class="modal-body">
                            <div class="mb-3">
                                <label for="title_{{ $stage->id }}" class="form-label">Title</label>
                                <input type="text" name="title" id="title_{{ $stage->id }}" value="{{ $stage->title }}" class="form-control" required>
                            </div>
                            <div class="mb-3">
                                <label for="video_{{ $stage->id }}" class="form-label">Video URL</label>
                                <input type="url" name="video" id="video_{{ $stage->id }}" value="{{ $stage->video }}" class="form-control">
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
    @endforeach
@endpush