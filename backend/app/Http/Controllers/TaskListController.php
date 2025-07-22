<?php

namespace App\Http\Controllers;

use App\Models\TaskList;
use Illuminate\Http\Request;

class TaskListController extends Controller
{
    // GET /api/task-lists
    public function index()
    {
        return TaskList::with('tasks')->get();
    }

    // POST /api/task-lists
    public function store(Request $request, $boardId)
{
    $request->validate([
        'title' => 'required|string|max:255',
    ]);

    $taskList = TaskList::create([
        'board_id' => $boardId,
        'title' => $request->title,
    ]);

    return response()->json($taskList, 201);
}

    // GET /api/task-lists/{id}
    public function show($id)
    {
        $taskList = TaskList::with('tasks')->findOrFail($id);
        return response()->json($taskList);
    }

    // PUT /api/task-lists/{id}
    public function update(Request $request, $id)
    {
        $request->validate([
            'title' => 'required|string|max:255',
        ]);

        $taskList = TaskList::findOrFail($id);
        $taskList->update($request->only('title'));

        return response()->json($taskList);
    }

    // DELETE /api/task-lists/{id}
    public function destroy($id)
    {
        $taskList = TaskList::findOrFail($id);
        $taskList->delete();

        return response()->json(['message' => 'Deleted successfully']);
    }
}
