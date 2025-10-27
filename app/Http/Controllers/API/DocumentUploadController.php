<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Document;
use App\Models\Project;
use App\Services\GoogleDriveService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Log;
use Google\Client as Google_Client;
use Google\Service\Drive as Google_Service_Drive;

class DocumentUploadController extends Controller
{
    protected $driveService;

    public function __construct(GoogleDriveService $driveService)
    {
        $this->driveService = $driveService;
    }

    /**
     * Upload file to Google Drive and save metadata.
     * POST /api/documents/upload
     */
    public function upload(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'file' => 'required|file|mimes:pdf,doc,docx|max:10240', // 10MB max
            'project_id' => 'required|exists:projects,id',
            'subfolder' => 'nullable|string|in:BID,Drawings Specs,Project Docs,Photos,Schedule,Submittals,Permit,Meetings,Payment,Insurance,Daily Reports,Safety,Inspections,RFI,Correspondence,Change Order,CADD Files,Closeout,Misc,Templates,Procurement',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $project = Project::findOrFail($request->project_id);
        if ($project->user_id != Auth::id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        // Ensure project folder exists
        if (!$project->drive_folder_id) {
            $this->driveService->setAccessToken(); // Ensure token is set
            $project->drive_folder_id = $this->driveService->createProjectFolder($project->name, $project->id);
            $project->save();
        }

        // Store file temporarily in storage/app/public/uploads
        $file = $request->file('file');
        $filePath = $file->store('uploads', 'public'); // Use 'public' disk
        $fullPath = storage_path('app/public/' . $filePath); // Adjust path for public disk
        $fileName = $file->getClientOriginalName();

        try {
            $this->driveService->setAccessToken(); // Set token before upload
            $uploadedFile = $this->driveService->uploadFile(
                $fullPath,
                $fileName,
                $project->drive_folder_id,
                $request->subfolder ?? 'Contracts'
            );

            $document = Document::create([
                'project_id' => $project->id,
                'user_id' => Auth::id(),
                'file_name' => $fileName,
                'folder_name' => $request->subfolder ?? 'Contracts',
                'file_type' => $file->getClientOriginalExtension(),
                'upload_date' => now(),
                'ai_eligible' => true,
                'parse_status' => 'Pending',
                'drive_file_id' => $uploadedFile->id,
            ]);

            Storage::disk('local')->delete($filePath);

            return response()->json([
                'message' => 'File uploaded successfully to Google Drive!',
                'data' => $document,
                'drive_link' => $uploadedFile->webViewLink,
            ], 201);

        } catch (\Exception $e) {
            Storage::disk('local')->delete($filePath);
            Log::error('Upload failed: ' . $e->getMessage());
            return response()->json(['message' => 'Upload failed: ' . $e->getMessage()], 500);
        }
    }

    /**
     * Get Google OAuth URL (for initial auth).
     * GET /api/documents/auth-url
     */
    public function getAuthUrl(Request $request)
    {
        if ($request->has('code')) {
            try {
                $token = $this->driveService->handleCallback($request->query('code'));
                $user = $request->user();
                if ($user) {
                    $user->google_access_token = $token['access_token'];
                    $user->google_refresh_token = $token['refresh_token'] ?? $user->google_refresh_token;
                    $user->save();
                    Log::info('Token updated for user', ['user_id' => $user->id]);
                }
                return response()->json(['message' => 'Google Drive connected!', 'token' => $token], 200);
            } catch (\Exception $e) {
                Log::error('Callback failed: ' . $e->getMessage());
                return response()->json(['message' => 'Callback failed: ' . $e->getMessage()], 400);
            }
        }

        $authUrl = $this->driveService->getAuthUrl();
        return response()->json(['auth_url' => $authUrl], 200);
    }

    /**
     * Handle OAuth callback.
     * GET /api/documents/callback?code={code}
     */
    public function handleCallback(Request $request)
    {
        $code = $request->query('code');
        if (!$code) {
            return response()->json(['message' => 'Authorization code missing'], 400);
        }

        try {
            $token = $this->driveService->handleCallback($code);
            $user = $request->user();
            if ($user) {
                $user->google_access_token = $token['access_token'];
                $user->google_refresh_token = $token['refresh_token'] ?? $user->google_refresh_token;
                $user->save();
                Log::info('Token updated for user', ['user_id' => $user->id]);
            }
            return response()->json(['message' => 'Google Drive connected!', 'token' => $token], 200);
        } catch (\Exception $e) {
            Log::error('Callback failed: ' . $e->getMessage());
            return response()->json(['message' => 'Callback failed: ' . $e->getMessage()], 400);
        }
    }
}