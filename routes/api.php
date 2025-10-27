<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\API\ContactUsController;
use App\Http\Controllers\API\AuthController;
use App\Http\Controllers\API\EarlyAccessController;
use App\Http\Controllers\API\BlogController;
use App\Http\Controllers\API\AboutContentController;
use App\Http\Controllers\API\ProjectController;
use App\Http\Controllers\API\DocumentUploadController;
use App\Http\Controllers\API\OpenAiController;
use App\Http\Controllers\API\TaskController;

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
Route::post('/forgot-password', [AuthController::class, 'forgotPassword']);
Route::post('/verify-email', [AuthController::class, 'verifyEmailOtp']);
Route::post('/reset-password', [AuthController::class, 'resetPassword']);

Route::post('/contact-us', [ContactUsController::class, 'store']);
Route::post('/early-access', [EarlyAccessController::class, 'store']);
Route::get('/about/{slug}', [AboutContentController::class, 'show']);
Route::get('/blogs', [BlogController::class, 'index']);
Route::get('/blogs/{slug}', [BlogController::class, 'show']);

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/me', [AuthController::class, 'me']);
    Route::post('/projects', [ProjectController::class, 'store']);
    Route::get('/projects', [ProjectController::class, 'index']);
    Route::get('/projects/{id}', [ProjectController::class, 'show']);
    Route::post('/documents/upload', [DocumentUploadController::class, 'upload']);
    Route::get('/documents/auth-url', [DocumentUploadController::class, 'getAuthUrl']);
    Route::get('/documents/callback', [DocumentUploadController::class, 'handleCallback']);
    Route::post('/ai/parse-document', [OpenAiController::class, 'parseDocument']);
    Route::post('/ai/parse-uploaded-document', [OpenAiController::class, 'parseUploadedDocument'])->name('parse-uploaded-document');
    Route::post('/ai/generate-submittal-log', [OpenAiController::class, 'generateSubmittalLog']);
    Route::post('/ai/chat', [OpenAiController::class, 'chat']);
    Route::post('/ai/voice-chat', [OpenAiController::class, 'voiceChat']);
    
    Route::post('/tasks', [TaskController::class, 'store']);
    Route::put('/tasks/{id}', [TaskController::class, 'update']);
    Route::get('alltasks', [TaskController::class, 'allTasks']);
    Route::get('/tasks/{projectId}', [TaskController::class, 'index']);
    
    Route::get('report-data', [ProjectController::class, 'reportData']);
    
});

Route::post('/test-openai', [OpenAiController::class, 'test']);