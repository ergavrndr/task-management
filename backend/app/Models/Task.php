<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Task extends Model
{
    protected $fillable = [
        'task_list_id',
        'title',
        'description',
        'due_date',
        'status',
        'file_path',
    ];

    public function taskList()
    {
        return $this->belongsTo(TaskList::class); // Diperbarui dari 'list' menjadi 'taskList'
    }
}
