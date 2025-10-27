<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Session;
use App\Models\User;
use App\Models\Project;
use App\Models\Document;
use App\Models\SystemLog;
use App\Models\Setting;
use Illuminate\Support\Facades\Response;
use App\Models\ChatPrompt;
use App\Models\Admin;

class AdminController extends Controller
{
    public function __construct()
    {
        
    }

    // Check if the current user is an admin
    protected function isAdmin()
    {
        return Auth::guard('admin')->check();
    }

    // Show login form
    public function showLoginForm()
    {
        if ($this->isAdmin()) {
            return redirect()->route('admin.dashboard');
        }
        return view('admin.login');
    }

    // Handle login
    public function login(Request $request)
    {
        $credentials = $request->only('email', 'password');

        if (Auth::guard('admin')->attempt($credentials)) {
            Session::regenerate();
            return redirect()->intended(route('admin.dashboard'));
        }

        return back()->withErrors([
            'email' => 'Invalid credentials',
        ]);
    }

    // Handle logout
    public function logout()
    {
        Auth::guard('admin')->logout();
        Session::flush();
        return redirect()->route('admin.login');
    }

    // Dashboard with stats
    public function dashboard()
    {
        if (!$this->isAdmin()) {
            return redirect()->route('admin.login');
        }

        $stats = [
            'users' => User::count(),
            'projects' => Project::count(),
            'docs' => Document::count(),
            'aiPrompts' => ChatPrompt::count(), // Placeholder; replace with actual AI prompt count if tracked
        ];

        return view('admin.dashboard', compact('stats'));
    }

    // List all users
    public function users(Request $request)
    {
        if (!$this->isAdmin()) {
            return redirect()->route('admin.login');
        }

        $query = User::query()
            ->select('id', 'name', 'email', 'last_login')
            ->withCount('projects');

        // Apply filters
        if ($request->filled('search')) {
            $searchTerm = '%' . $request->input('search') . '%';
            $query->where(function ($q) use ($searchTerm) {
                $q->where('name', 'like', $searchTerm)
                ->orWhere('email', 'like', $searchTerm);
            });
        }

        if ($request->filled('min_projects')) {
            $query->having('projects_count', '>=', $request->input('min_projects'));
        }

        $users = $query->paginate(10)->appends($request->except('page')); // Paginate with 10 items per page

        return view('admin.users', ['users' => $users]);
    }

    // List all projects
    public function projects(Request $request)
    {
        if (!$this->isAdmin()) {
            return redirect()->route('admin.login');
        }

        $query = Project::query()
            ->select('id', 'name')
            ->withCount('documents');

        // Apply filters
        if ($request->filled('search')) {
            $searchTerm = '%' . $request->input('search') . '%';
            $query->where('name', 'like', $searchTerm);
        }

        if ($request->filled('min_docs')) {
            $query->having('documents_count', '>=', $request->input('min_docs'));
        }

        $projects = $query->paginate(10)->appends($request->except('page')); // Paginate with 10 items per page

        return view('admin.projects', ['projects' => $projects]);
    }

    // List document logs
    public function documentLogs(Request $request)
    {
        if (!$this->isAdmin()) {
            return redirect()->route('admin.login');
        }

        $query = Document::query()
            ->select('id', 'file_name', 'user_id', 'status', 'upload_date');

        // Apply filters
        if ($request->filled('search')) {
            $searchTerm = '%' . $request->input('search') . '%';
            $query->where(function ($q) use ($searchTerm) {
                $q->where('file_name', 'like', $searchTerm)
                ->orWhere('status', 'like', $searchTerm);
            });
        }

        if ($request->filled('user_id')) {
            $query->where('user_id', $request->input('user_id'));
        }

        $logs = $query->paginate(10)->appends($request->except('page')); // Paginate with 10 items per page

        return view('admin.document-logs', ['logs' => $logs]);
    }

    // Show AI summary
    public function aiSummary()
    {
        if (!$this->isAdmin()) {
            return redirect()->route('admin.login');
        }

        $chatPrompts = ChatPrompt::orderBy('created_at', 'desc')->get();
        return view('admin.ai-summary', compact('chatPrompts'));
    }

    // List system logs
    public function systemLogs()
    {
        if (!$this->isAdmin()) {
            return redirect()->route('admin.login');
        }

        $logs = SystemLog::select('timestamp', 'message')
            ->get();

        return view('admin.system-logs', ['logs' => $logs]);
    }

    // Show settings page
    // public function settings()
    // {
    //     if (!$this->isAdmin()) {
    //         return redirect()->route('admin.login');
    //     }

    //     $features = Setting::first() ?? new Setting(); // Get or create default settings
    //     $features = [
    //         'learning_mode' => $features->learning_mode ?? false,
    //         'voice_assistant' => $features->voice_assistant ?? false,
    //     ];

    //     return view('admin.settings', compact('features'));
    // }

    // Toggle feature
    public function toggleFeature(Request $request)
    {
        if (!$this->isAdmin()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $request->validate([
            'feature' => 'required|in:learning_mode,voice_assistant',
            'enabled' => 'required|boolean',
        ]);

        $feature = $request->input('feature');
        $enabled = $request->input('enabled');

        $settings = Setting::first() ?? new Setting();
        $settings->$feature = $enabled;
        $settings->save();

        return response()->json(['message' => 'Feature toggled successfully']);
    }

    // Export data as CSV
    public function exportCsv($type)
    {
        if (!$this->isAdmin()) {
            return redirect()->route('admin.login');
        }

        $data = [];
        $filename = date('Ymd_His') . '.csv';
        switch ($type) {
            case 'users':
                $users = User::select('id', 'name', 'email', 'last_login')->get();
                foreach ($users as $user) {
                    $data[] = [
                        'ID' => $user->id,
                        'Name' => $user->name ?? 'N/A',
                        'Email' => $user->email ?? 'N/A',
                        'Last Login' => $user->last_login ?? 'N/A',
                    ];
                }
                $filename = 'users_' . $filename;
                break;

            case 'projects':
                $projects = Project::select('id', 'name')->withCount('documents')->get();
                foreach ($projects as $project) {
                    $data[] = [
                        'ID' => $project->id,
                        'Name' => $project->name ?? 'N/A',
                        'Documents' => $project->documents_count,
                        // 'Last Activity' => $project->last_activity ?? 'N/A',
                    ];
                }
                $filename = 'projects_' . $filename;
                break;

            default:
                return redirect()->back()->withErrors(['message' => 'Invalid export type']);
        }

        $headers = array_keys($data[0] ?? []);
        $callback = function() use ($data, $headers) {
            $file = fopen('php://output', 'w');
            fputcsv($file, $headers);
            foreach ($data as $row) {
                fputcsv($file, $row);
            }
            fclose($file);
        };

        return Response::stream($callback, 200, [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename="' . $filename . '"',
        ]);
    }
    
    public function settings()
    {
        if (!$this->isAdmin()) {
            return redirect()->route('admin.login');
        }
    
        $admin = Auth::guard('admin')->user();
        return view('admin.settings', compact('admin'));
    }
    
    public function updateSettings(Request $request)
    {
        if (!$this->isAdmin()) {
            return redirect()->route('admin.login');
        }
    
        $admin = Auth::guard('admin')->user();
    
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:admins,email,' . $admin->id,
        ]);
    
        $admin->update([
            'name' => $request->input('name'),
            'email' => $request->input('email'),
        ]);
    
        return redirect()->route('admin.settings')->with('success', 'Profile updated successfully.');
    }
    
    public function updatePassword(Request $request)
    {
        if (!$this->isAdmin()) {
            return redirect()->route('admin.login');
        }
    
        $request->validate([
            'current_password' => 'required',
            'new_password' => 'required|string|min:8|confirmed',
        ]);
    
        $admin = Auth::guard('admin')->user();
    
        if (!Hash::check($request->input('current_password'), $admin->password)) {
            return back()->withErrors(['current_password' => 'Current password is incorrect.']);
        }
    
        $admin->update([
            'password' => Hash::make($request->input('new_password')),
        ]);
    
        return redirect()->route('admin.settings')->with('success', 'Password updated successfully.');
    }
    
    public function forgotPassword(Request $request)
    {
        try{
            $request->validate([
                'email' => 'required|email',
            ]);
    
            $user = Admin::where('email', $request->email)->first();
    
            if ($user) {
                $otp = $user->sendForgotPasswordOtp();
            }

            return response()->json(['success' => true, 'message' => __('auth.forgot-success'), 'otp' => $otp ?? null]);

        }catch(\Exception $e){
            return response()->json(['success' => false, 'message' => $e->getMessage()]);
        }
    }

    // Reset Password
    public function resetPassword(Request $request)
    {
        try{
            $request->validate([
                'email' => 'required|email',
                'password' => 'required|confirmed|min:6',
                // 'otp' => 'required',
            ]);
    
            $customer = Admin::where('email', $request->email)->first();
    
            if (!$customer) {
                return response()->json(['error' => __('auth.invalid_credentials')]);
            }
    
            if (!$customer->otp || now()->gt($customer->otp_expires_at)) {
                return response()->json(['error' => __('auth.invalid_or_expired_otp')]);
            }
    
            // Update the password
            $customer->password = Hash::make($request->password);
            $customer->otp = null; // Clear OTP after reset
            $customer->otp_expires_at = null; // Clear OTP expiration
            $customer->save();
    
            return response()->json(['success' => true, 'message' => 'Password reset successfully.']);
        }catch(\Exception $e){
            return response()->json(['success' => false, 'message' => $e->getMessage()]);
        }
        
    }

    public function verifyEmailOtp(Request $request)
    {
        try{
            $request->validate([
                'email' => 'required|email',
                'otp'   => 'required|digits:4',
            ]);

            $customer = Admin::where('email', $request->email)->first();

            if (!$customer) {
                return response()->json(['success' => false, 'message' => __('auth.invalid_credentials')]);
            }

            if ($customer->otp !== $request->otp || now()->gt($customer->otp_expires_at)) {
                return response()->json(['success' => false, 'message' => __('auth.invalid_or_expired_otp')]);
            }


            return response()->json(['success' => true, 'message' => __('auth.email_verified_success')]);
        }
        catch(\Exception $e){
            return response()->json(['success' => false, 'message' => $e->getMessage()]);
        }
    }

}