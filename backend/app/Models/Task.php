<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Task extends Model
{
    protected $fillable = [
        'task_list_id', // Diperbarui dari 'list_id' menjadi 'task_list_id'
        'title',
        'description',
        'due_date',
        'status',
        'file',
    ];

    public function taskList()
    {
        return $this->belongsTo(TaskList::class); // Diperbarui dari 'list' menjadi 'taskList'
    }
}
