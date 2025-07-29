<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreCourseRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        // Hanya user dengan peran 'pengajar' atau 'admin' yang boleh membuat kursus
        $user = $this->user();
        return $user != null && ($user->profile->role === 'pengajar' || $user->profile->role === 'admin');
        return false;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'category_id' => 'required|exists:categories,id',
            'price' => 'required_if:is_free,false|numeric|min:0',
            'is_free' => 'required|boolean',
        ];
    }
}
