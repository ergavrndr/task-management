<?php

namespace App\Http\Controllers;

use App\Models\TaskList;
use Illuminate\Http\Request;

class TaskListController extends Controller
{

    public function index(Request $request, $boardId)
    {
        $user = $request->user();

        $lists = TaskList::where('board_id', $boardId)
            ->whereHas('board', function ($query) use ($user) {
                $query->where('user_id', $user->id);
            })
            ->with('tasks')
            ->get();

        return response()->json($lists);
    }

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

    public function show($id)
    {
        $taskList = TaskList::with('tasks')->findOrFail($id);
        return response()->json($taskList);
    }

    public function update(Request $request, $id)
    {
        $request->validate([
            'title' => 'required|string|max:255',
        ]);

        $taskList = TaskList::findOrFail($id);
        $taskList->update($request->only('title'));

        return response()->json($taskList);
    }

    public function destroy($id)
    {
        $taskList = TaskList::findOrFail($id);
        $taskList->delete();

        return response()->json(['message' => 'Deleted successfully']);
    }
}
