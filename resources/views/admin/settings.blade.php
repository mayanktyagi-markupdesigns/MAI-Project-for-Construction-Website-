@extends('layouts.admin')

@section('title', 'Settings')

@section('content')
<h2 class="text-2xl font-bold mb-6 text-gray-800">Account Settings</h2>

<div class="bg-white p-6 rounded-lg shadow-md max-w-2xl">
    @if (session('success'))
        <div class="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
            {{ session('success') }}
        </div>
    @endif

    @if ($errors->any())
        <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            <ul>
                @foreach ($errors->all() as $error)
                    <li>{{ $error }}</li>
                @endforeach
            </ul>
        </div>
    @endif

    <!-- Profile Update Form -->
    <h3 class="text-lg font-semibold mb-4 text-gray-700">Update Profile</h3>
    <form method="POST" action="{{ route('admin.settings.update') }}" class="space-y-4">
        @csrf
        <div>
            <label for="name" class="block text-gray-700 mb-2">Name</label>
            <input type="text" name="name" id="name" value="{{ old('name', $admin->name) }}" class="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-teal-500" required>
        </div>
        <div>
            <label for="email" class="block text-gray-700 mb-2">Email</label>
            <input type="email" name="email" id="email" value="{{ old('email', $admin->email) }}" class="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-teal-500" required>
        </div>
        <button type="submit" class="bg-teal-500 text-white px-4 py-2 rounded hover:bg-teal-600">Update Profile</button>
    </form>

    <!-- Password Change Form -->
    <h3 class="text-lg font-semibold mt-8 mb-4 text-gray-700">Change Password</h3>
    <form method="POST" action="{{ route('admin.settings.password') }}" class="space-y-4">
        @csrf
        <div>
            <label for="current_password" class="block text-gray-700 mb-2">Current Password</label>
            <input type="password" name="current_password" id="current_password" class="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-teal-500" required>
        </div>
        <div>
            <label for="new_password" class="block text-gray-700 mb-2">New Password</label>
            <input type="password" name="new_password" id="new_password" class="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-teal-500" required>
        </div>
        <div>
            <label for="new_password_confirmation" class="block text-gray-700 mb-2">Confirm New Password</label>
            <input type="password" name="new_password_confirmation" id="new_password_confirmation" class="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-teal-500" required>
        </div>
        <button type="submit" class="bg-teal-500 text-white px-4 py-2 rounded hover:bg-teal-600">Change Password</button>
    </form>
</div>
@endsection