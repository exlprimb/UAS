<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CourseResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
    return [
        'id' => $this->id,
        'title' => $this->title,
        'slug' => $this->slug,
        'description' => $this->description,
        'price' => $this->price,
        'is_free' => $this->is_free,
        'thumbnail_url' => $this->thumbnail_url,
        'instructor' => new UserResource($this->whenLoaded('instructor')),
        'category' => new CategoryResource($this->whenLoaded('category')),
    ];
    }
}
