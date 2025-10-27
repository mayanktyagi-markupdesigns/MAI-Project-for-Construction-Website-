@extends('layouts.admin')

@section('title', 'System Logs')

@section('content')
<h2 class="text-3xl font-bold text-gray-900 bg-gradient-to-r from-teal-500 to-blue-500 bg-clip-text text-transparent">System Logs</h2>
<div class="bg-white p-6 rounded-lg shadow-md">
    <table class="w-full text-left">
        <thead>
            <tr class="bg-gray-200 text-gray-700">
                <th class="p-3">Timestamp</th>
                <th class="p-3">Message</th>
            </tr>
        </thead>
        <tbody>
            @forelse ($logs as $log)
                <tr class="border-b hover:bg-gray-100">
                    <td class="p-3">{{ $log->timestamp }}</td>
                    <td class="p-3">{{ $log->message }}</td>
                </tr>
            @empty
                <tr><td colspan="2" class="p-3 text-center">No logs found</td></tr>
            @endforelse
        </tbody>
    </table>
</div>
@endsection