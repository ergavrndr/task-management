<?php

namespace App\Http\Controllers;

use App\Models\Board;
use Illuminate\Http\Request;

class BoardController extends Controller
{
    /**
     * Menampilkan semua board milik user.
     *
     * @param \Illuminate\Http\Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function index(Request $request)
    {
        $user = $request->user(); // agar Intelephense tidak error
        $boards = Board::where('user_id', $user->id)->get();

        return response()->json($boards);
    }

    /**
     * Menyimpan board baru.
     *
     * @param \Illuminate\Http\Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function store(Request $request)
    {
        $request->validate([
            'title' => 'required|string|max:255',
        ]);

        $user = $request->user();

        $board = Board::create([
            'user_id' => $user->id,
            'title' => $request->title,
        ]);

        return response()->json($board, 201);
    }

    /**
     * Menampilkan detail board tertentu milik user.
     *
     * @param \Illuminate\Http\Request $request
     * @param int $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function show(Request $request, $id)
    {
        $user = $request->user();

        $board = Board::with(['taskLists.tasks']) // ⬅️ memuat taskLists dan tasks
            ->where('id', $id)
            ->where('user_id', $user->id)
            ->firstOrFail();

        return response()->json($board);
    }

    /**
     * Mengupdate board tertentu milik user.
     *
     * @param \Illuminate\Http\Request $request
     * @param int $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function update(Request $request, $id)
    {
        $request->validate([
            'title' => 'required|string|max:255',
        ]);

        $user = $request->user();

        $board = Board::where('id', $id)
                      ->where('user_id', $user->id)
                      ->firstOrFail();

        $board->update([
            'title' => $request->title,
        ]);

        return response()->json($board);
    }

    /**
     * Menghapus board milik user.
     *
     * @param \Illuminate\Http\Request $request
     * @param int $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function destroy(Request $request, $id)
    {
        $user = $request->user();

        $board = Board::where('id', $id)
                      ->where('user_id', $user->id)
                      ->firstOrFail();

        $board->delete();

        return response()->json(['message' => 'Board deleted']);
    }
}
