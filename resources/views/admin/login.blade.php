@extends('layouts.auth')

@section('title', 'Login')

@section('content')
<div class="login-form bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
    <img src="/mai-beta/logo.png" style="margin-left: auto;margin-right: auto;">
    <h2 class="text-2xl font-bold text-gray-800 mb-6 text-center">Admin Login</h2>
    @if ($errors->any())
        <div class="text-red-500 mb-4 text-center">
            {{ $errors->first() }}
        </div>
    @endif
    <form method="POST" action="{{ route('admin.login') }}">
        @csrf
        <div class="space-y-4">
            <div>
                <label class="block text-gray-700">Email</label>
                <input type="email" name="email" value="{{ old('email') }}" class="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-teal-500" required>
            </div>
            <div>
                <label class="block text-gray-700">Password</label>
                <input type="password" name="password" class="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-teal-500" required>
            </div>
            <button type="submit" class="w-full bg-teal-500 text-white py-2 rounded hover:bg-teal-600 animate-pulse">Login</button>
        </div>
    </form>
    <a href="{{ route('admin.forgot-password-form') }}" class="block mt-4 text-center text-sm text-gray-600 hover:text-gray-800">Forgot Your Password?</a>
</div>
@endsection