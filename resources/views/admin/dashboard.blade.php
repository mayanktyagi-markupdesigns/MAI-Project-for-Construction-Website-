@extends('layouts.admin')

@section('title', 'Dashboard')

@section('content')
<div class="space-y-8">
    <h2 class="text-3xl font-bold text-gray-900 bg-gradient-to-r from-teal-500 to-blue-500 bg-clip-text text-transparent">Dashboard Overview</h2>
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div class="relative bg-gradient-to-br from-blue-500 to-teal-500 p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 overflow-hidden">
            <div class="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-12 -mt-12"></div>
            <div class="flex items-center justify-between">
                <h3 class="text-lg font-semibold text-white">Users</h3>
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1z"/>
                </svg>
            </div>
            <p class="text-4xl font-bold mt-4 text-white">{{ $stats['users'] ?? 0 }}</p>
            <p class="text-sm text-white/80 mt-2">Total registered users</p>
        </div>
        <div class="relative bg-gradient-to-br from-purple-500 to-indigo-500 p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 overflow-hidden">
            <div class="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-12 -mt-12"></div>
            <div class="flex items-center justify-between">
                <h3 class="text-lg font-semibold text-white">Projects</h3>
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="current{keyword:1}currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
                </svg>
            </div>
            <p class="text-4xl font-bold mt-4 text-white">{{ $stats['projects'] ?? 0 }}</p>
            <p class="text-sm text-white/80 mt-2">Active projects</p>
       </div>
        <div class="relative bg-gradient-to-br from-green-500 to-emerald-500 p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 overflow-hidden">
            <div class="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-12 -mt-12"></div>
            <div class="flex items-center justify-between">
                <h3 class="text-lg font-semibold text-white">Documents</h3>
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                </svg>
            </div>
            <p class="text-4xl font-bold mt-4 text-white">{{ $stats['docs'] ?? 0 }}</p>
            <p class="text-sm text-white/80 mt-2">Total documents uploaded</p>
        </div>
        <div class="relative bg-gradient-to-br from-yellow-500 to-amber-500 p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 overflow-hidden">
            <div class="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-12 -mt-12"></div>
            <div class="flex items-center justify-between">
                <h3 class="text-lg font-semibold text-white">AI Prompts</h3>
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.749 3.749 0 0012 17.755a3.749 3.749 0 10-2.625-1.045l-.548-.547z"/>
                </svg>
            </div>
            <p class="text-4xl font-bold mt-4 text-white">{{ $stats['aiPrompts'] ?? 0 }}</p>
            <p class="text-sm text-white/80 mt-2">AI interactions</p>
        </div>
    </div>
</div>
@endsection