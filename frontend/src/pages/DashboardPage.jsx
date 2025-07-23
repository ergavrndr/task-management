import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { UserCircle } from "lucide-react";

const DashboardPage = () => {
  const [boards, setBoards] = useState([]);
  const [newBoard, setNewBoard] = useState("");
  const [editBoardId, setEditBoardId] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [user, setUser] = useState(null);

  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchUser();
    fetchBoards();
  }, []);

  const fetchUser = async () => {
    try {
      const res = await axios.get("http://localhost:8000/api/user", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setUser(res.data);
    } catch (err) {
      console.error("Gagal mengambil data user:", err);
    }
  };

  const fetchBoards = async () => {
    try {
      const response = await axios.get("http://localhost:8000/api/boards", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setBoards(response.data);
    } catch (error) {
      console.error("Gagal mengambil data board:", error);
    }
  };

  const handleAddBoard = async (e) => {
    e.preventDefault();
    if (!newBoard.trim()) return;

    try {
      await axios.post(
        "http://localhost:8000/api/boards",
        { title: newBoard },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setNewBoard("");
      fetchBoards();
    } catch (error) {
      console.error("Gagal menambahkan board:", error);
    }
  };

  const handleEditBoard = (board) => {
    setEditBoardId(board.id);
    setEditTitle(board.title);
  };

  const handleCancelEdit = () => {
    setEditBoardId(null);
    setEditTitle("");
  };

  const handleUpdateBoard = async (id) => {
    if (!editTitle.trim()) return;

    try {
      await axios.put(
        `http://localhost:8000/api/boards/${id}`,
        { title: editTitle },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setEditBoardId(null);
      setEditTitle("");
      fetchBoards();
    } catch (error) {
      console.error("Gagal mengupdate board:", error);
    }
  };

  const handleDeleteBoard = async (id) => {
    try {
      await axios.delete(`http://localhost:8000/api/boards/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      fetchBoards();
    } catch (error) {
      console.error("Gagal menghapus board:", error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-blue-100 to-purple-100 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="relative mb-8">
  <h1 className="text-3xl font-bold text-center text-gray-800 drop-shadow">
    🗂️ Dashboard Task
  </h1>
  <div className="absolute right-0 top-1/2 -translate-y-1/2 flex items-center gap-4">
    {user && (
      <>
        <UserCircle className="w-7 h-7 text-gray-600" />
        <span className="font-medium text-gray-700">{user.name}</span>
      </>
    )}
    <button
      onClick={handleLogout}
      className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 text-sm"
    >
      Logout
    </button>
  </div>
</div>

        {/* Form tambah board */}
        <form
          onSubmit={handleAddBoard}
          className="mb-8 flex justify-center gap-4"
        >
          <input
            type="text"
            placeholder="Nama Board Baru"
            value={newBoard}
            onChange={(e) => setNewBoard(e.target.value)}
            className="px-4 py-2 border rounded-md w-1/3 focus:outline-none focus:ring-2 focus:ring-indigo-400 shadow"
          />
          <button
            type="submit"
            className="bg-indigo-500 text-white px-4 py-2 rounded-md hover:bg-indigo-600 shadow"
          >
            Tambah Board
          </button>
        </form>

        {/* List board */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {boards.map((board) => (
            <div
              key={board.id}
              className="bg-white p-4 rounded-xl shadow-md hover:shadow-lg transition border border-gray-200"
            >
              {editBoardId === board.id ? (
                <>
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="w-full px-3 py-2 border border-indigo-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  />
                  <div className="flex gap-2 justify-end mt-3">
                    <button
                      onClick={() => handleUpdateBoard(board.id)}
                      className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition text-sm"
                    >
                      Ubah
                    </button>
                    <button
                      onClick={handleCancelEdit}
                      className="px-4 py-2 bg-gray-400 text-white rounded hover:bg-gray-500 transition text-sm"
                    >
                      Batal
                    </button>
                  </div>
                </>
              ) : (
                <div className="flex justify-between items-start">
                  <span className="text-gray-800 font-semibold">
                    {board.title}
                  </span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEditBoard(board)}
                      className="text-indigo-600 hover:text-indigo-800 font-medium text-sm"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteBoard(board.id)}
                      className="text-red-600 hover:text-red-800 font-medium text-sm"
                    >
                      Hapus
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
