@extends('layouts.admin')

@section('title', 'Manage Points')

@section('content')
<div class="space-y-8">
    <h2 class="text-3xl font-bold text-gray-900 bg-gradient-to-r from-teal-500 to-blue-500 bg-clip-text text-transparent">Manage Points for {{ $stage->title }}</h2>
    <div class="bg-white/80 backdrop-blur-sm rounded-lg shadow-lg p-6">
        <form action="{{ route('admin.about-content.store-point', $stage->id) }}" method="POST" class="mb-6">
            @csrf
            <div class="grid grid-cols-1 gap-6">
                <div>
                    <label for="point" class="block text-sm font-medium text-gray-700">Point</label>
                    <textarea name="point" id="point" class="mt-1 block w-full border-gray-300 rounded-md shadow-sm" rows="3" required></textarea>
                </div>
            </div>
            <div class="mt-4">
                <button type="submit" class="bg-teal-500 text-white px-4 py-2 rounded hover:bg-teal-600">Add Point</button>
            </div>
        </form>
        <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200">
                <thead class="bg-gray-50">
                    <tr>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Point</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-200">
                    @forelse ($stage->points as $point)
                    <tr>
                        <td class="px-6 py-4 whitespace-nowrap">{{ $point->point }}</td>
                        <td class="px-6 py-4 whitespace-nowrap">
                            <a href="#" data-bs-toggle="modal" data-bs-target="#editPointModal{{ $point->id }}" class="text-indigo-600 hover:text-indigo-900 mr-2">Edit</a>
                            <form action="{{ route('admin.about-content.destroy-point', $point->id) }}" method="POST" style="display:inline;" onsubmit="return confirm('Are you sure?');">
                                @csrf
                                @method('DELETE')
                                <button type="submit" class="text-red-600 hover:text-red-900">Delete</button>
                            </form>
                        </td>
                    </tr>
                    
                    @empty
                    <tr>
                        <td colspan="2" class="px-6 py-4 text-center text-gray-500">No points found.</td>
                    </tr>
                    @endforelse
                </tbody>
            </table>
        </div>
        <div class="mt-6">
            <a href="{{ route('admin.about-content.manage-stages', $stage->aboutContent->id) }}" class="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600">Back</a>
        </div>
    </div>
</div>
@endsection

@push('modals')
    @foreach ($stage->points as $point)
        <!-- Edit Modal -->
        <div class="modal fade" id="editPointModal{{ $point->id }}" tabindex="-1" aria-labelledby="editPointModalLabel{{ $point->id }}" aria-hidden="true">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title" id="editPointModalLabel{{ $point->id }}">Edit Point</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <form action="{{ route('admin.about-content.update-point', $point->id) }}" method="POST">
                        @csrf
                        @method('PUT')
                        <div class="modal-body">
                            <div class="mb-3">
                                <label for="point_{{ $point->id }}" class="form-label">Point</label>
                                <textarea name="point" id="point_{{ $point->id }}" class="form-control" rows="3" required>{{ $point->point }}</textarea>
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