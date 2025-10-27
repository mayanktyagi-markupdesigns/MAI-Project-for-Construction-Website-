<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Auth;
use OpenAI;
use App\Models\Document;
use App\Models\Project;
use App\Models\Submittal;
use App\Models\Task;
use Spatie\PdfToText\Pdf;
use PhpOffice\PhpWord\IOFactory as WordIOFactory;
use PhpOffice\PhpSpreadsheet\IOFactory as ExcelIOFactory;
use App\Services\GoogleDriveService;
use App\Models\ChatPrompt;

class OpenAiController extends Controller
{
    protected $client;
    protected $driveService;

    public function __construct(GoogleDriveService $driveService)
    {
        $this->client = OpenAI::client(env('OPENAI_API_KEY'));
        $this->driveService = $driveService;
    }

    public function test(Request $request)
    {
        $apiKey = env('OPENAI_API_KEY');
        $url = 'https://api.openai.com/v1/responses';
        $postData = [
            'model' => 'gpt-5-nano',
            'input' => $request->input('input', 'Hello from MAi beta'),
        ];

        $ch = curl_init($url);
        curl_setopt_array($ch, [
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_HTTPHEADER => [
                'Authorization: Bearer ' . $apiKey,
                'Content-Type: application/json'
            ],
            CURLOPT_POST => true,
            CURLOPT_POSTFIELDS => json_encode($postData)
        ]);
        $response = curl_exec($ch);
        if (curl_errno($ch)) {
            $error = curl_error($ch);
            curl_close($ch);
            return response()->json(['error' => $error], 500);
        }
        curl_close($ch);

        $data = json_decode($response, true);
        return response()->json($data);
    }

    /**
 * 3.4 AI Document Parsing: Extract project details from uploaded file on Google Drive.
 */
public function parseDocument(Request $request)
{
    $validator = Validator::make($request->all(), [
        'document_id' => 'required|exists:documents,id',
    ]);

    if ($validator->fails()) {
        return response()->json(['errors' => $validator->errors()], 422);
    }

    $document = Document::findOrFail($request->document_id);
    if ($document->user_id != Auth::id()) {
        return response()->json(['message' => 'Unauthorized'], 403);
    }

    if (!$document->ai_eligible || $document->is_processed) {
        return response()->json(['message' => 'Document not eligible or already processed'], 400);
    }

    try {
        $this->driveService->setAccessToken();
        $fileContent = $this->driveService->downloadFile($document->drive_file_id);
        if (!$fileContent) {
            throw new \Exception('Failed to download file from Google Drive');
        }

        $tempFilePath = tempnam(sys_get_temp_dir(), 'doc_') . '.' . $document->file_type;
        file_put_contents($tempFilePath, $fileContent);

        $extractedText = '';
        switch (strtolower($document->file_type)) {
            case 'pdf':
                try {
                    $extractedText = Pdf::getText($tempFilePath);
                    if (empty(trim($extractedText))) {
                        throw new \Exception('No text extracted from PDF');
                    }
                } catch (\Exception $e) {
                    Log::error('PDF text extraction failed: ' . $e->getMessage(), ['document_id' => $document->id]);
                    $extractedText = (string) $fileContent; // Fallback to raw content
                }
                break;
            case 'doc':
            case 'docx':
                try {
                    $phpWord = WordIOFactory::load($tempFilePath);
                    $section = $phpWord->getSection(0);
                    $textElements = $section->getElements();
                    foreach ($textElements as $element) {
                        if (method_exists($element, 'getText')) {
                            $extractedText .= $element->getText() . "\n";
                        }
                    }
                    if (empty(trim($extractedText))) {
                        throw new \Exception('No text extracted from DOC/DOCX');
                    }
                } catch (\Exception $e) {
                    Log::error('DOC/DOCX text extraction failed: ' . $e->getMessage(), ['document_id' => $document->id]);
                    $extractedText = (string) $fileContent; // Fallback
                }
                break;
            case 'xls':
            case 'xlsx':
                try {
                    $spreadsheet = ExcelIOFactory::load($tempFilePath);
                    $sheet = $spreadsheet->getActiveSheet();
                    $extractedText = $sheet->toArray(null, true, true, true);
                    $extractedText = implode("\n", array_map(function ($row) {
                        return implode(' ', $row);
                    }, $extractedText));
                    if (empty(trim($extractedText))) {
                        throw new \Exception('No text extracted from XLS/XLSX');
                    }
                } catch (\Exception $e) {
                    Log::error('XLS/XLSX text extraction failed: ' . $e->getMessage(), ['document_id' => $document->id]);
                    $extractedText = (string) $fileContent; // Fallback
                }
                break;
            default:
                $extractedText = (string) $fileContent;
                break;
        }

        // Sanitize extracted text to ensure valid UTF-8
        $extractedText = mb_convert_encoding($extractedText, 'UTF-8', 'UTF-8');
        if (empty(trim($extractedText))) {
            throw new \Exception('No valid text extracted from the file after sanitization');
        }

        Log::info('Extracted text for parsing', ['document_id' => $document->id, 'text_sample' => substr($extractedText, 0, 200)]); // Log first 200 chars

        $response = $this->client->chat()->create([
            'model' => 'gpt-4o-mini',
            'messages' => [
                [
                    'role' => 'system',
                    'content' => 'Extract project details from this document text as JSON: project_name, address, client_agency, contract_amount (numeric), start_date (YYYY-MM-DD), end_date (YYYY-MM-DD), architect_name, subcontractors (array of strings). Return only the JSON object.'
                ],
                ['role' => 'user', 'content' => $extractedText],
            ],
            'response_format' => ['type' => 'json_object'],
        ]);

        $extractedData = json_decode($response->choices[0]->message->content, true);

        $requiredFields = ['project_name', 'address', 'client_agency', 'contract_amount', 'start_date', 'end_date', 'architect_name', 'subcontractors'];
        foreach ($requiredFields as $field) {
            if (!isset($extractedData[$field])) {
                $extractedData[$field] = null;
            }
        }

        $document->update([
            'extracted_text' => $extractedText,
            'parsed_data' => $extractedData,
            'parsed_at' => now(),
            'parse_status' => 'Success',
            'parse_attempts' => $document->parse_attempts + 1,
            'is_processed' => true,
        ]);

        // $project = $document->project;
        // $project->update([
        //     'name' => $extractedData['project_name'] ?? $project->name,
        //     'address' => $extractedData['address'] ?? $project->address,
        //     'client_agency' => $extractedData['client_agency'] ?? $project->client_agency,
        //     'contract_amount' => $extractedData['contract_amount'] ?? $project->contract_amount,
        //     'start_date' => $extractedData['start_date'] ?? $project->start_date,
        //     'end_date' => $extractedData['end_date'] ?? $project->end_date,
        //     'architect_name' => $extractedData['architect_name'] ?? $project->architect_name,
        //     'subcontractors' => json_encode($extractedData['subcontractors'] ?? $project->subcontractors),
        // ]);

        unlink($tempFilePath);

        return response()->json([
            'message' => 'Document parsed successfully',
            'data' => $extractedData,
        ], 200);

    } catch (\Exception $e) {
        // if (file_exists($tempFilePath)) unlink($tempFilePath);
        // $document->update([
        //     'parse_status' => 'Error',
        //     'parse_error' => $e->getMessage(),
        //     'parse_attempts' => $document->parse_attempts + 1,
        // ]);
        // Log::error('AI parsing failed: ' . $e->getMessage(), ['document_id' => $document->id, 'extracted_text_sample' => substr($extractedText, 0, 200) ?? 'N/A']);
        return response()->json(['message' => 'Parsing failed: ' . $e->getMessage()]);
    }
}

public function parseUploadedDocument(Request $request)
    {

        // Validate the uploaded file
        $validator = Validator::make($request->all(), [
            'file' => 'required|file|mimes:pdf,doc,docx,xls,xlsx|max:20480', // Max 20MB
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        try {
            $file = $request->file('file');
            $fileType = strtolower($file->getClientOriginalExtension());
            $fileContent = file_get_contents($file->getRealPath());

            // Save temporary file
            $tempFilePath = tempnam(sys_get_temp_dir(), 'doc_') . '.' . $fileType;
            file_put_contents($tempFilePath, $fileContent);

            $extractedText = '';
            switch ($fileType) {
                case 'pdf':
                    try {
                        $extractedText = Pdf::getText($tempFilePath);
                        if (empty(trim($extractedText))) {
                            throw new \Exception('No text extracted from PDF');
                        }
                    } catch (\Exception $e) {
                        Log::error('PDF text extraction failed: ' . $e->getMessage());
                        $extractedText = (string) $fileContent; // Fallback to raw content
                    }
                    break;
                case 'doc':
                case 'docx':
                    try {
                        $phpWord = \PhpOffice\PhpWord\IOFactory::load($tempFilePath);
                        $section = $phpWord->getSection(0);
                        $textElements = $section->getElements();
                        foreach ($textElements as $element) {
                            if (method_exists($element, 'getText')) {
                                $extractedText .= $element->getText() . "\n";
                            }
                        }
                        if (empty(trim($extractedText))) {
                            throw new \Exception('No text extracted from DOC/DOCX');
                        }
                    } catch (\Exception $e) {
                        Log::error('DOC/DOCX text extraction failed: ' . $e->getMessage());
                        $extractedText = (string) $fileContent; // Fallback
                    }
                    break;
                case 'xls':
                case 'xlsx':
                    try {
                        $spreadsheet = \PhpOffice\PhpSpreadsheet\IOFactory::load($tempFilePath);
                        $sheet = $spreadsheet->getActiveSheet();
                        $extractedText = $sheet->toArray(null, true, true, true);
                        $extractedText = implode("\n", array_map(function ($row) {
                            return implode(' ', $row);
                        }, $extractedText));
                        if (empty(trim($extractedText))) {
                            throw new \Exception('No text extracted from XLS/XLSX');
                        }
                    } catch (\Exception $e) {
                        Log::error('XLS/XLSX text extraction failed: ' . $e->getMessage());
                        $extractedText = (string) $fileContent; // Fallback
                    }
                    break;
                default:
                    $extractedText = (string) $fileContent;
                    break;
            }

            // Sanitize extracted text to ensure valid UTF-8
            $extractedText = mb_convert_encoding($extractedText, 'UTF-8', 'UTF-8');
            if (empty(trim($extractedText))) {
                throw new \Exception('No valid text extracted from the file after sanitization');
            }

            Log::info('Extracted text for parsing', ['text_sample' => substr($extractedText, 0, 200)]);

            // Call AI model to parse text
            $response = $this->client->chat()->create([
                'model' => 'gpt-4o-mini',
                'messages' => [
                    [
                        'role' => 'system',
                        'content' => 'Extract project details from this document text as JSON: project_name, address, client_agency, contract_amount (numeric), start_date (YYYY-MM-DD), end_date (YYYY-MM-DD), architect_name, subcontractors (array of strings). Return only the JSON object.'
                    ],
                    ['role' => 'user', 'content' => $extractedText],
                ],
                'response_format' => ['type' => 'json_object'],
            ]);

            $extractedData = json_decode($response->choices[0]->message->content, true);

            // Ensure all required fields are present
            $requiredFields = ['project_name', 'address', 'client_agency', 'contract_amount', 'start_date', 'end_date', 'architect_name', 'subcontractors'];
            foreach ($requiredFields as $field) {
                if (!isset($extractedData[$field])) {
                    $extractedData[$field] = null;
                }
            }

            // Clean up temporary file
            unlink($tempFilePath);

            return response()->json([
                'message' => 'File parsed successfully',
                'data' => $extractedData,
            ], 200);

        } catch (\Exception $e) {
            if (file_exists($tempFilePath)) {
                unlink($tempFilePath);
            }
            Log::error('File parsing failed: ' . $e->getMessage(), ['text_sample' => substr($extractedText ?? '', 0, 200) ?? 'N/A']);
            return response()->json(['message' => 'Parsing failed: ' . $e->getMessage()], 500);
        }
    }

    public function generateSubmittalLog(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'document_id' => 'required|exists:documents,id',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $document = Document::findOrFail($request->document_id);
        if ($document->user_id != Auth::id() || $document->folder_name !== 'Specs') {
            return response()->json(['message' => 'Unauthorized or invalid document'], 403);
        }

        $this->driveService->setAccessToken();
        $fileContent = $this->driveService->downloadFile($document->drive_file_id);
        if (!$fileContent) {
            return response()->json(['message' => 'File not found on Google Drive'], 404);
        }

        $tempFilePath = tempnam(sys_get_temp_dir(), 'spec_') . '.' . $document->file_type;
        file_put_contents($tempFilePath, $fileContent);

        try {
            $response = $this->client->chat()->create([
                'model' => 'gpt-5-nano',
                'messages' => [
                    ['role' => 'system', 'content' => 'Extract submittal log from this spec document as JSON array: each item with spec_section_number, description, responsible_party, status ("Not Started"), notes.'],
                    ['role' => 'user', 'content' => file_get_contents($tempFilePath)],
                ],
                'response_format' => ['type' => 'json_object'],
            ]);

            $logData = json_decode($response->choices[0]->message->content, true)['items'] ?? [];

            foreach ($logData as $item) {
                Submittal::create([
                    'project_id' => $document->project_id,
                    'spec_section_number' => $item['spec_section_number'],
                    'description' => $item['description'],
                    'responsible_party' => $item['responsible_party'],
                    'status' => $item['status'] ?? 'Not Started',
                    'notes' => $item['notes'] ?? null,
                    'linked_document_id' => $document->id,
                ]);
            }

            unlink($tempFilePath);

            return response()->json(['message' => 'Submittal log generated successfully', 'data' => $logData], 200);

        } catch (\Exception $e) {
            if (file_exists($tempFilePath)) unlink($tempFilePath);
            Log::error('Submittal log generation failed: ' . $e->getMessage());
            return response()->json(['message' => 'Generation failed: ' . $e->getMessage()], 500);
        }
    }

    public function chat(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'message' => 'required|string',
            'conversation_id' => 'nullable|integer',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        try {

            $user = auth()->user();

            $projects = Project::where('user_id', $user->id)
            ->select('id', 'name', 'start_date', 'end_date')
            ->withCount('tasks', 'documents')
            ->take(5) // Limit to 5 projects to avoid token overflow
            ->get()
            ->map(function ($project) {
                return "Project ID: {$project->id}, Name: {$project->name}, Status: {$project->status}, Start: {$project->start_date}, End: {$project->end_date}, Tasks: {$project->tasks_count}, Documents: {$project->documents_count}";
            })->implode("\n");

        $tasks = Task::whereIn('project_id', Project::where('user_id', $user->id)->pluck('id'))
            ->select('id', 'title', 'status', 'due_date')
            ->take(5) // Limit to 5 tasks
            ->get()
            ->map(function ($task) {
                return "Task ID: {$task->id}, Title: {$task->title}, Status: {$task->status}, Due: {$task->due_date}, Project ID: {$task->project_id}";
            })->implode("\n");

        $documents = Document::where('user_id', $user->id)
            ->select('id', 'file_name', 'status', 'upload_date')
            ->take(5) // Limit to 5 documents
            ->get()
            ->map(function ($document) {
                return "Document ID: {$document->id}, File: {$document->file_name}, Status: {$document->status}, Uploaded: {$document->upload_date}";
            })->implode("\n");

// Build system prompt with user context
        $systemPrompt = <<<EOT
You are MAi, a construction project management assistant. Respond concisely and use the following user data to provide contextually relevant answers:

**Projects**:
{$projects}

**Tasks**:
{$tasks}

**Documents**:
{$documents}

Use this information to tailor your responses to the user's projects, tasks, and documents. If the user asks about specific project/task/document details, reference this data accurately. Respond in a professional tone and avoid generic answers.
EOT;

        // Include previous conversation messages if conversation_id is provided
        $messages = [
            ['role' => 'system', 'content' => $systemPrompt],
        ];

        if ($request->conversation_id) {
            $previousMessages = ChatPrompt::where('conversation_id', $request->conversation_id)
                ->orderBy('created_at')
                ->get();
            foreach ($previousMessages as $msg) {
                $messages[] = ['role' => 'user', 'content' => $msg->user_message];
                $messages[] = ['role' => 'assistant', 'content' => $msg->ai_response];
            }
        }

        // Add current user message
        $messages[] = ['role' => 'user', 'content' => $request->message];

        // Call OpenAI API
        $response = $this->client->chat()->create([
            'model' => 'gpt-5-nano',
            'messages' => $messages,
        ]);

        $reply = $response->choices[0]->message->content;

        // Save to database
        ChatPrompt::create([
            'user_message' => $request->message,
            'ai_response' => $reply,
            'conversation_id' => $request->conversation_id,
            'user_id' => $user->id, // Store user_id for reference
        ]);

        return response()->json(['reply' => $reply], 200);

        } catch (\Exception $e) {
            Log::error('Chat failed: ' . $e->getMessage());
            return response()->json(['message' => 'Chat failed: ' . $e->getMessage()], 500);
        }
    }

    public function voiceChat(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'audio' => 'required|file|mimes:mp3,wav,ogg|max:25600', // 25MB max
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $audioFile = $request->file('audio');
        $audioPath = $audioFile->store('temp_audio', 'local');
        $fullAudioPath = storage_path('app/' . $audioPath);

        try {
            $transcription = $this->client->audio()->transcribe([
                'model' => 'whisper-1',
                'file' => fopen($fullAudioPath, 'r'),
                'response_format' => 'text',
            ]);

            $userMessage = $transcription->text;

            $messages = [
                ['role' => 'system', 'content' => 'You are MAi, a voice assistant for construction projects. Respond concisely for TTS.'],
                ['role' => 'user', 'content' => $userMessage],
            ];

            $chatResponse = $this->client->chat()->create([
                'model' => 'gpt-5-nano',
                'messages' => $messages,
            ]);

            $replyText = $chatResponse->choices[0]->message->content;

            $ttsResponse = $this->client->audio()->textToSpeech([
                'model' => 'tts-1',
                'input' => $replyText,
                'voice' => 'alloy',
                'response_format' => 'mp3',
            ]);

            $ttsPath = 'tts/' . time() . '.mp3';
            Storage::disk('public')->put($ttsPath, $ttsResponse);

            Storage::disk('local')->delete($audioPath);

            return response()->json([
                'transcribed_text' => $userMessage,
                'reply_text' => $replyText,
                'reply_audio_url' => Storage::disk('public')->url($ttsPath),
            ], 200);

        } catch (\Exception $e) {
            Storage::disk('local')->delete($audioPath);
            Log::error('Voice chat failed: ' . $e->getMessage());
            return response()->json(['message' => 'Voice chat failed: ' . $e->getMessage()], 500);
        }
    }
}