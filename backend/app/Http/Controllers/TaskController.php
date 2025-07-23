<?php

namespace App\Http\Controllers;

use App\Models\Task;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class TaskController extends Controller
{
    /**
     * Menampilkan semua task dalam satu task list.
     */
    public function index(Request $request, $taskListId)
    {
        $tasks = Task::where('task_list_id', $taskListId)->get();
        return response()->json($tasks);
    }

    /**
     * Menyimpan task baru.
     */
    public function store(Request $request, $taskListId)
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'due_date' => 'nullable|date',
            'status' => 'required|in:todo,in_progress,done',
            'file' => 'nullable|file|max:2048',
        ]);

        $filePath = null;
        if ($request->hasFile('file')) {
            $filePath = $request->file('file')->store('tasks', 'public');
        }

        $task = Task::create([
            'task_list_id' => $taskListId,
            'title' => $request->title,
            'description' => $request->description,
            'due_date' => $request->due_date,
            'status' => $request->status,
            'file_path' => $filePath,
        ]);

        return response()->json($task, 201);
    }

    /**
     * Menampilkan detail 1 task.
     */
    public function show($id)
    {
        $task = Task::findOrFail($id);
        return response()->json($task);
    }

    /**
     * Mengupdate task.
     */
    public function update(Request $request, $id)
    {
        $request->validate([
            'title' => 'sometimes|string|max:255',
            'description' => 'nullable|string',
            'due_date' => 'nullable|date',
            'status' => 'nullable|in:todo,in_progress,done',
            'file' => 'nullable|file|max:2048',
        ]);

        $task = Task::findOrFail($id);

        // Jika ada file baru, hapus file lama dan upload baru
        if ($request->hasFile('file')) {
            if ($task->file_path) {
                Storage::disk('public')->delete($task->file_path);
            }
            $filePath = $request->file('file')->store('tasks', 'public');
            $task->file_path = $filePath;
        }

        $task->update($request->only(['title', 'description', 'due_date', 'status']));

        return response()->json($task);
    }

    /**
     * Menghapus task.
     */
    public function destroy($id)
    {
        $task = Task::findOrFail($id);

        if ($task->file_path) {
            Storage::disk('public')->delete($task->file_path);
        }

        $task->delete();

        return response()->json(['message' => 'Task deleted']);
    }
}
