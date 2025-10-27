<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Task;
use App\Models\Project;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Log;

class TaskController extends Controller
{
    /**
     * Create a new task.
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'project_id' => 'required|exists:projects,id',
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'due_date' => 'nullable|date',
            'priority' => 'nullable|in:Low,Medium,High',
            'assigned_to' => 'nullable|exists:users,id',
            'linked_document_id' => 'nullable|exists:documents,id',
            'linked_email_id' => 'nullable|exists:emails,id',
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }

        $project = Project::findOrFail($request->project_id);
        if ($project->user_id != Auth::id()) {
            return response()->json(['success' => false, 'message' => 'Unauthorized'], 403);
        }

        $task = Task::create(array_merge($request->all(), [
            'status' => 'Not Started',
            'user_id' => Auth::id(), // Assuming tasks are created by the authenticated user
        ]));

        return response()->json(['success' => true, 'message' => 'Task created successfully', 'data' => $task], 201);
    }

    /**
     * List all tasks for a project.
     *
     * @param int $projectId
     * @return \Illuminate\Http\JsonResponse
     */
    public function index($projectId)
    {
        $project = Project::findOrFail($projectId);
        if ($project->user_id != Auth::id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $tasks = Task::where('project_id', $projectId)
            ->with(['assignedTo', 'document'])
            ->orderBy('due_date', 'asc')
            ->get();

        return response()->json(['success' => true, 'data' => $tasks], 200);
    }

    /**
     * Update an existing task.
     *
     * @param Request $request
     * @param int $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function update(Request $request, $id)
    {
        $task = Task::findOrFail($id);
        if ($task->project->user_id != Auth::id()) {
            return response()->json(['success' => false, 'message' => 'Unauthorized!'], 403);
        }

        $validator = Validator::make($request->all(), [
            'title' => 'sometimes|string|max:255',
            'description' => 'sometimes|nullable|string',
            'status' => 'sometimes|in:Not Started,In Progress,Completed',
            'due_date' => 'sometimes|nullable|date',
            'priority' => 'sometimes|in:Low,Medium,High',
            'assigned_to' => 'sometimes|nullable|exists:users,id',
            // 'linked_submittal_id' => 'sometimes|nullable|exists:submittals,id',
            'linked_document_id' => 'sometimes|nullable|exists:documents,id',
            'linked_email_id' => 'sometimes|nullable|exists:emails,id',
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }

        $task->update($request->all());

        return response()->json(['success' => true, 'message' => 'Task updated successfully', 'data' => $task], 200);
    }
    
    public function allTasks()
    {
        try{
            $tasks = Task::whereHas('project', function ($query) {
                $query->where('user_id', Auth::id());
            })->with(['assignedTo', 'document', 'project'])->orderBy('due_date', 'asc')->get();

            return response()->json(['success' => true, 'data' => $tasks], 200);
        }catch(\Exception $e){
            return response()->json(['success' => false, 'message' => 'Failed to fetch tasks']);
        }
        
    }
}
