<?php

namespace App\Http\Controllers;

use App\Models\Task;
use Illuminate\Http\Request;

class TaskController extends Controller
{
    // Create Task
    public function store(Request $request, $taskListId)
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'due_date' => 'nullable|date',
            'status' => 'nullable|string|max:50',
            'file_path' => 'nullable|string', // disesuaikan dari 'file'
        ]);

        $task = Task::create([
            'task_list_id' => $taskListId,
            'title' => $request->title,
            'description' => $request->description,
            'due_date' => $request->due_date,
            'status' => $request->status ?? 'pending',
            'file_path' => $request->file_path, // disesuaikan
        ]);

        return response()->json($task, 201);
    }

    // Update Task
    public function update(Request $request, $id)
    {
        $request->validate([
            'title' => 'sometimes|string|max:255',
            'description' => 'nullable|string',
            'due_date' => 'nullable|date',
            'status' => 'nullable|string|max:50',
            'file_path' => 'nullable|string', // disesuaikan
        ]);

        $task = Task::findOrFail($id);
        $task->update($request->only([
            'title', 'description', 'due_date', 'status', 'file_path' // disesuaikan
        ]));

        return response()->json($task);
    }

    // Delete Task
    public function destroy($id)
    {
        $task = Task::findOrFail($id);
        $task->delete();

        return response()->json(['message' => 'Task deleted']);
    }
}
