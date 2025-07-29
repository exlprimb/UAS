<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Course extends Model
{
    public function instructor() {
    return $this->belongsTo(User::class, 'instructor_id');
}
    public function category() {
    return $this->belongsTo(Category::class);
}
    public function modules() {
    return $this->hasMany(CourseModule::class);
}
    public function getRouteKeyName()
{
    return 'slug';
}

}
