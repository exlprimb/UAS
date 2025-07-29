<?php

namespace App\Http\Controllers\Api;

use App\Models\Course;
use App\Http\Requests\StoreCourseRequest;
use App\Http\Requests\UpdateCourseRequest;
use App\Http\Resources\CourseResource;
use App\Http\Resources\CourseCollection;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Storage;


class CourseController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        {
            return new CourseCollection(Course::with(['instructor.profile', 'category'])->where('status', 'published')->paginate(10));
        }
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreCourseRequest $request)
    {
        $validated = $request->validated();
        $validated['slug'] = Str::slug($validated['title']);
        $validated['instructor_id'] = $request->user()->id;

        $course = Course::create($validated);

        return new CourseResource($course);
    }

    /**
     * Display the specified resource.
     */
    public function show(Course $course)
    {
            {

        // Pastikan model Course Anda memiliki getRouteKeyName() { return 'slug'; }
        return new CourseResource($course->load(['instructor.profile', 'category', 'modules.lessons']));
    }
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateCourseRequest $request, Course $course)
    {
        $validated = $request->validated();
        if (isset($validated['title'])) {
            $validated['slug'] = Str::slug($validated['title']);
        }
        $course->update($validated);
        return new CourseResource($course);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Course $course)
    {
        // Gunakan Policy untuk otorisasi
        $this->authorize('delete', $course);

        $course->delete();
        return response()->noContent(); // Respons 204 No Content
    }

    public function uploadThumbnail(Request $request, Course $course)
    {
        // Otorisasi: hanya pemilik kursus atau admin yang boleh upload
        $this->authorize('update', $course);

         $request->validate([
        'thumbnail' => 'required|image|mimes:jpeg,png,jpg,gif|max:2048', // Validasi file
    ]);

        // Hapus thumbnail lama jika ada
        if ($course->thumbnail_url) {
        Storage::disk('public')->delete(str_replace('/storage/', '', $course->thumbnail_url));
    }

        // Simpan file baru dan dapatkan path-nya
        $path = $request->file('thumbnail')->store('thumbnails/courses', 'public');

        // Update path di database
        $course->update([
        'thumbnail_url' => Storage::url($path) // Dapatkan URL yang bisa diakses publik
    ]);

    return new CourseResource($course);
    }
}
