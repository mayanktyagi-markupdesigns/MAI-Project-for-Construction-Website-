<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Project;
use App\Services\GoogleDriveService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Log;
use App\Models\Task;

class ProjectController extends Controller
{
    protected $driveService;

    public function __construct(GoogleDriveService $driveService)
    {
        $this->driveService = $driveService;
    }

    /**
     * Create a new project and initialize Google Drive folder.
     * POST /api/projects
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'address' => 'nullable|string',
            'client_agency' => 'nullable|string|max:255',
            'contract_amount' => 'nullable|numeric',
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date',
            'architect_name' => 'nullable|string|max:255',
            'subcontractors' => 'nullable|array',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $project = Project::create([
            'user_id' => Auth::id(),
            'name' => $request->name,
            'address' => $request->address,
            'client_agency' => $request->client_agency,
            'contract_amount' => $request->contract_amount,
            'start_date' => $request->start_date,
            'end_date' => $request->end_date,
            'architect_name' => $request->architect_name,
            'subcontractors' => json_encode($request->subcontractors ?? []),
        ]);

        try {
            $this->driveService->setAccessToken();
            $driveFolderId = $this->driveService->createProjectFolder($project->name, $project->id);
            $project->update(['drive_folder_id' => $driveFolderId]);
        } catch (\Exception $e) {
            $project->delete();
            Log::error('Failed to initialize Google Drive folder', ['message' => $e->getMessage()]);
            return response()->json(['message' => 'Failed to initialize Google Drive folder: ' . $e->getMessage()], 500);
        }

        return response()->json([
            'message' => 'Project created successfully!',
            'data' => $project,
        ], 201);
    }

    /**
     * Get all projects for the authenticated user.
     * GET /api/projects
     */
    public function index()
    {
        $projects = Project::with('documents', 'subfolders')->where('user_id', Auth::id())
            ->orderBy('created_at', 'desc')
            ->withCount('documents')
            ->paginate(10);

        return response()->json($projects);
    }

    /**
     * Get a specific project by ID.
     * GET /api/projects/{id}
     */
    public function show($id)
    {
        $project = Project::where('user_id', Auth::id())
            ->with('documents')
            ->findOrFail($id);

        return response()->json($project);
    }
    
    public function reportData()
    {
        $projects = Project::where('user_id', Auth::id())
            ->withCount('documents', 'tasks')
            ->get(['id', 'name', 'contract_amount', 'start_date', 'end_date']);
        
        $totalDocuments = $projects->sum('documents_count');
        $totalTasks = $projects->sum('tasks_count');
        
        $datewiseTasks = Task::whereIn('project_id', $projects->pluck('id'))
            ->selectRaw('DATE(created_at) as date, COUNT(*) as count')
            ->groupBy('date')
            ->orderBy('date', 'asc')
            ->get();

        return response()->json(['success' => true, 'projects' => $projects, 'total_documents' => $totalDocuments, 'total_tasks' => $totalTasks, 'tasks' => $datewiseTasks]);
    }
}