<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CourseController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\CommentController;
use App\Http\Controllers\Api\ProfileController;
use App\Http\Controllers\Api\EnrollmentController;
use App\Http\Controllers\Api\CourseModuleController;
use App\Http\Controllers\Api\LessonController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

// --- PUBLIC ROUTES (Bisa diakses tanpa login) ---
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// Hanya mengizinkan orang melihat daftar dan detail
Route::apiResource('courses', CourseController::class)->only(['index', 'show']);
Route::apiResource('categories', CategoryController::class)->only(['index', 'show']);

// Endpoint publik untuk melihat komentar
Route::get('/lessons/{lesson}/comments', [CommentController::class, 'index']);

// --- PROTECTED ROUTES (Wajib login) ---
Route::middleware('auth:sanctum')->group(function () {
    // Endpoint untuk user yang sedang login
    Route::get('/user', function (Request $request) {
        // Gunakan {course:slug} agar bisa mencari berdasarkan slug
    Route::post('/courses/{course:slug}/upload-thumbnail', [CourseController::class, 'uploadThumbnail']);
       return $request->user()->load('profile');
    });
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::put('/user/profile', [ProfileController::class, 'update']);

    // Endpoint untuk pengajar/admin mengelola kursus (Create, Update, Delete)
    Route::apiResource('courses', CourseController::class)->except(['index', 'show']);

    // Endpoint untuk mengelola modul di dalam sebuah kursus (Nested Resource)
    Route::apiResource('courses.modules', CourseModuleController::class);

    // Endpoint untuk mengelola pelajaran di dalam sebuah modul
    Route::apiResource('modules.lessons', LessonController::class);

    // Endpoint untuk memposting komentar
    Route::apiResource('lessons.comments', CommentController::class)->only(['store', 'update', 'destroy']);

    // Endpoint untuk pendaftaran kursus
    Route::post('/enroll', [EnrollmentController::class, 'store']);
    
});
