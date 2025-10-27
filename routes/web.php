<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AdminController;
use App\Http\Controllers\AdminBlogController;
use App\Http\Controllers\AdminEarlyAccessController;
use App\Http\Controllers\AdminContactUsController;
use App\Http\Middleware\AuthAdminMiddleware;
use App\Http\Controllers\AdminAboutContentController as AboutContentController;

Route::get('/', function () {
    return view('welcome');
});

Route::get('storage-link', function () {
    \Artisan::call('storage:link');
});



Route::get('/admin/login', [AdminController::class, 'showLoginForm'])->name('admin.login');
Route::post('/admin/login', [AdminController::class, 'login']);
Route::get('/admin/logout', [AdminController::class, 'logout'])->name('admin.logout');

Route::get('/forgot-password', function(){
    return view('admin.forgot-password');
})->name('admin.forgot-password-form');
Route::post('/forgot-password', [AdminController::class, 'forgotPassword'])->name('admin.forgot-password');
Route::post('/verify-email', [AdminController::class, 'verifyEmailOtp'])->name('admin.verify-email');
Route::post('/reset-password', [AdminController::class, 'resetPassword'])->name('admin.reset-password');

Route::middleware(AuthAdminMiddleware::class)->group(function () {
    Route::get('/admin/dashboard', [AdminController::class, 'dashboard'])->name('admin.dashboard');
    Route::get('/admin/users', [AdminController::class, 'users'])->name('admin.users');
    Route::get('/admin/projects', [AdminController::class, 'projects'])->name('admin.projects');
    Route::get('/admin/logs/documents', [AdminController::class, 'documentLogs'])->name('admin.document-logs');
    Route::get('/admin/ai-summary', [AdminController::class, 'aiSummary'])->name('admin.ai-summary');
    Route::get('/admin/system-logs', [AdminController::class, 'systemLogs'])->name('admin.system-logs');
    Route::get('/admin/settings', [AdminController::class, 'settings'])->name('admin.settings');
    Route::post('/admin/toggle-feature', [AdminController::class, 'toggleFeature'])->name('admin.toggle-feature');
    Route::get('/admin/export/{type}', [AdminController::class, 'exportCsv'])->name('admin.export');

    Route::prefix('admin')->name('admin.')->group(function () {
        Route::resource('/admin/blogs', AdminBlogController::class);
        Route::get('/early-access', [AdminEarlyAccessController::class, 'index'])->name('early-access.index');
        Route::get('/early-access/{id}', [AdminEarlyAccessController::class, 'show'])->name('early-access.show');
        Route::get('/contact-us', [AdminContactUsController::class, 'index'])->name('contact-us.index');
        Route::get('/contact-us/{id}', [AdminContactUsController::class, 'show'])->name('contact-us.show');
        
        Route::get('/settings', [AdminController::class, 'settings'])->name('settings');
        Route::post('/settings/update', [AdminController::class, 'updateSettings'])->name('settings.update');
        Route::post('/settings/password', [AdminController::class, 'updatePassword'])->name('settings.password');

        Route::prefix('about-content')->group(function () {
            
            Route::get('/', [AboutContentController::class, 'index'])->name('about-content.index');
            Route::get('/create', [AboutContentController::class, 'create'])->name('about-content.create');
            Route::post('', [AboutContentController::class, 'store'])->name('about-content.store');
            Route::get('/{id}/edit', [AboutContentController::class, 'edit'])->name('about-content.edit');
            Route::put('/{id}', [AboutContentController::class, 'update'])->name('about-content.update');
            Route::delete('/{id}', [AboutContentController::class, 'destroy'])->name('about-content.destroy');
            Route::get('/{id}/stages', [AboutContentController::class, 'manageStages'])->name('about-content.manage-stages');
            Route::post('/{id}/stages', [AboutContentController::class, 'storeStage'])->name('about-content.store-stage');
            Route::put('/stages/{stageId}', [AboutContentController::class, 'updateStage'])->name('about-content.update-stage');
            Route::delete('/stages/{stageId}', [AboutContentController::class, 'destroyStage'])->name('about-content.destroy-stage');
            Route::get('/stages/{stageId}/points', [AboutContentController::class, 'managePoints'])->name('about-content.manage-points');
            Route::post('/stages/{stageId}/points', [AboutContentController::class, 'storePoint'])->name('about-content.store-point');
            Route::put('/points/{pointId}', [AboutContentController::class, 'updatePoint'])->name('about-content.update-point');
            Route::delete('/points/{pointId}', [AboutContentController::class, 'destroyPoint'])->name('about-content.destroy-point');
            Route::get('/{id}/cards', [AboutContentController::class, 'manageCards'])->name('about-content.manage-cards');
            Route::post('/{id}/cards', [AboutContentController::class, 'storeCard'])->name('about-content.store-card');
            Route::put('/cards/{cardId}', [AboutContentController::class, 'updateCard'])->name('about-content.update-card');
            Route::delete('/cards/{cardId}', [AboutContentController::class, 'destroyCard'])->name('about-content.destroy-card');
        });
    });
    
});