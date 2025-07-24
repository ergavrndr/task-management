import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { UserCircle, PlusCircle, Edit2, Trash2, X, Save } from "lucide-react";

const DashboardPage = () => {
  const [boards, setBoards] = useState([]);
  const [newBoard, setNewBoard] = useState("");
  const [editBoardId, setEditBoardId] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [user, setUser] = useState(null);
  const [taskLists, setTaskLists] = useState({});
  const [newListTitles, setNewListTitles] = useState({});
  const [newTasks, setNewTasks] = useState({});
  const [editListId, setEditListId] = useState(null);
  const [editListTitle, setEditListTitle] = useState("");
  const [editTaskId, setEditTaskId] = useState(null);
  const [editTaskData, setEditTaskData] = useState({});
  const [showTaskForm, setShowTaskForm] = useState({});
  const [loadingStates, setLoadingStates] = useState({});
  const [notification, setNotification] = useState({ message: "", type: "" });

  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchUser();
    fetchBoards();
  }, []);

  useEffect(() => {
    if (notification.message) {
      const timer = setTimeout(() => {
        setNotification({ message: "", type: "" });
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const fetchUser = useCallback(async () => {
    try {
      const res = await axios.get("http://localhost:8000/api/user", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUser(res.data);
    } catch (err) {
      console.error("Failed to fetch user data:", err);
      setNotification({ message: "Failed to load user data.", type: "error" });
    }
  }, [token]);

  const fetchBoards = useCallback(async () => {
    setLoadingStates((prev) => ({ ...prev, global: true }));
    try {
      const res = await axios.get("http://localhost:8000/api/boards", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setBoards(res.data);

      const taskListData = {};
      await Promise.all(
        res.data.map(async (board) => {
          const response = await axios.get(
            `http://localhost:8000/api/boards/${board.id}/task-lists`,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          taskListData[board.id] = response.data;
        })
      );
      setTaskLists(taskListData);
    } catch (error) {
      console.error("Failed to fetch boards:", error.response?.data || error.message);
      setNotification({ message: "Failed to load boards.", type: "error" });
    } finally {
      setLoadingStates((prev) => ({ ...prev, global: false }));
    }
  }, [token]);

  const updateSingleTaskList = useCallback(async (boardId, listId) => {
    setLoadingStates((prev) => ({ ...prev, [boardId]: true }));
    try {
      const response = await axios.get(
        `http://localhost:8000/api/boards/${boardId}/task-lists`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setTaskLists((prev) => ({
        ...prev,
        [boardId]: response.data,
      }));
    } catch (error) {
      console.error("Failed to update task list:", error.response?.data || error.message);
      setNotification({ message: "Failed to update task list.", type: "error" });
    } finally {
      setLoadingStates((prev) => ({ ...prev, [boardId]: false }));
    }
  }, [token]);

  const handleAddBoard = async (e) => {
    e.preventDefault();
    if (!newBoard.trim()) {
      setNotification({ message: "Board title is required.", type: "error" });
      return;
    }
    setLoadingStates((prev) => ({ ...prev, global: true }));
    try {
      await axios.post(
        "http://localhost:8000/api/boards",
        { title: newBoard },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setNewBoard("");
      setNotification({ message: "Board added successfully!", type: "success" });
      await fetchBoards();
    } catch (error) {
      console.error("Failed to add board:", error.response?.data || error.message);
      setNotification({ message: "Failed to add board.", type: "error" });
    } finally {
      setLoadingStates((prev) => ({ ...prev, global: false }));
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
    if (!editTitle.trim()) {
      setNotification({ message: "Board title is required.", type: "error" });
      return;
    }
    setLoadingStates((prev) => ({ ...prev, [id]: true }));
    try {
      await axios.put(
        `http://localhost:8000/api/boards/${id}`,
        { title: editTitle },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setEditBoardId(null);
      setEditTitle("");
      setNotification({ message: "Board updated successfully!", type: "success" });
      await fetchBoards();
    } catch (error) {
      console.error("Failed to update board:", error.response?.data || error.message);
      setNotification({ message: "Failed to update board.", type: "error" });
    } finally {
      setLoadingStates((prev) => ({ ...prev, [id]: false }));
    }
  };

  const handleDeleteBoard = async (id) => {
    if (!window.confirm("Are you sure you want to delete this board?")) return;
    setLoadingStates((prev) => ({ ...prev, [id]: true }));
    try {
      await axios.delete(`http://localhost:8000/api/boards/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotification({ message: "Board deleted successfully!", type: "success" });
      await fetchBoards();
    } catch (error) {
      console.error("Failed to delete board:", error.response?.data || error.message);
      setNotification({ message: "Failed to delete board.", type: "error" });
    } finally {
      setLoadingStates((prev) => ({ ...prev, [id]: false }));
    }
  };

  const handleAddList = async (boardId) => {
    if (!newListTitles[boardId]?.trim()) {
      setNotification({ message: "List title is required.", type: "error" });
      return;
    }
    setLoadingStates((prev) => ({ ...prev, [boardId]: true }));
    try {
      await axios.post(
        `http://localhost:8000/api/boards/${boardId}/task-lists`,
        { title: newListTitles[boardId] },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setNewListTitles((prev) => ({ ...prev, [boardId]: "" }));
      setNotification({ message: "Task list added successfully!", type: "success" });
      await updateSingleTaskList(boardId);
    } catch (error) {
      console.error("Failed to add task list:", error.response?.data || error.message);
      setNotification({ message: "Failed to add task list.", type: "error" });
    } finally {
      setLoadingStates((prev) => ({ ...prev, [boardId]: false }));
    }
  };

  const handleEditList = (list) => {
    setEditListId(list.id);
    setEditListTitle(list.title);
  };

  const handleCancelEditList = () => {
    setEditListId(null);
    setEditListTitle("");
  };

  const handleUpdateList = async (boardId, listId) => {
    if (!editListTitle.trim()) {
      setNotification({ message: "List title is required.", type: "error" });
      return;
    }
    setLoadingStates((prev) => ({ ...prev, [boardId]: true }));
    try {
      await axios.put(
        `http://localhost:8000/api/task-lists/${listId}`,
        { title: editListTitle },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setEditListId(null);
      setEditListTitle("");
      setNotification({ message: "Task list updated successfully!", type: "success" });
      await updateSingleTaskList(boardId);
    } catch (error) {
      console.error("Failed to update task list:", error.response?.data || error.message);
      setNotification({ message: "Failed to update task list.", type: "error" });
    } finally {
      setLoadingStates((prev) => ({ ...prev, [boardId]: false }));
    }
  };

  const handleDeleteList = async (boardId, listId) => {
    if (!window.confirm("Are you sure you want to delete this task list?")) return;
    setLoadingStates((prev) => ({ ...prev, [boardId]: true }));
    try {
      await axios.delete(`http://localhost:8000/api/task-lists/${listId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotification({ message: "Task list deleted successfully!", type: "success" });
      await updateSingleTaskList(boardId);
    } catch (error) {
      console.error("Failed to delete task list:", error.response?.data || error.message);
      setNotification({ message: "Failed to delete task list.", type: "error" });
    } finally {
      setLoadingStates((prev) => ({ ...prev, [boardId]: false }));
    }
  };

  const handleTaskInputChange = useCallback((listId, field, value) => {
    setNewTasks((prev) => ({
      ...prev,
      [listId]: {
        ...(prev[listId] || {}),
        [field]: value,
      },
    }));
  }, []);

  const handleAddTask = async (e, listId) => {
    e.preventDefault();
    const taskData = newTasks[listId];
    if (!taskData || !taskData.title?.trim()) {
      setNotification({ message: "Task title is required.", type: "error" });
      return;
    }

    const boardId = taskLists[listId]?.[0]?.board_id || Object.keys(taskLists).find((boardId) =>
      taskLists[boardId].some((list) => list.id === listId)
    );
    setLoadingStates((prev) => ({ ...prev, [boardId]: true }));
    try {
      const formData = new FormData();
      formData.append("title", taskData.title);
      formData.append("description", taskData.description || "");
      formData.append("due_date", taskData.due_date || "");
      formData.append("status", taskData.status || "todo");
      if (taskData.file) formData.append("file", taskData.file);

      await axios.post(
        `http://localhost:8000/api/task-lists/${listId}/tasks`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );
      setNewTasks((prev) => ({ ...prev, [listId]: {} }));
      setShowTaskForm((prev) => ({ ...prev, [listId]: false }));
      setNotification({ message: "Task added successfully!", type: "success" });
      await updateSingleTaskList(boardId, listId);
    } catch (error) {
      console.error("Failed to add task:", error.response?.data || error.message);
      setNotification({ message: "Failed to add task.", type: "error" });
    } finally {
      setLoadingStates((prev) => ({ ...prev, [boardId]: false }));
    }
  };

  const handleEditTask = (task) => {
    setEditTaskId(task.id);
    setEditTaskData({
      title: task.title || "",
      description: task.description || "",
      due_date: task.due_date || "",
      status: task.status || "todo",
      file: null,
    });
  };

  const handleUpdateTaskInput = useCallback((field, value) => {
    setEditTaskData((prev) => ({
      ...prev,
      [field]: value,
    }));
  }, []);

  const handleCancelEditTask = () => {
    setEditTaskId(null);
    setEditTaskData({});
  };

  const handleUpdateTask = async (listId, taskId) => {
    if (!editTaskData.title?.trim()) {
      setNotification({ message: "Task title is required.", type: "error" });
      return;
    }

    const boardId = taskLists[listId]?.[0]?.board_id || Object.keys(taskLists).find((boardId) =>
      taskLists[boardId].some((list) => list.id === listId)
    );
    setLoadingStates((prev) => ({ ...prev, [boardId]: true }));
    try {
      let response;
      if (editTaskData.file) {
        const formData = new FormData();
        formData.append("title", editTaskData.title);
        formData.append("description", editTaskData.description || "");
        formData.append("due_date", editTaskData.due_date || "");
        formData.append("status", editTaskData.status || "todo");
        formData.append("file", editTaskData.file);

        response = await axios.put(
          `http://localhost:8000/api/tasks/${taskId}`,
          formData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "multipart/form-data",
            },
          }
        );
      } else {
        const taskData = {
          title: editTaskData.title,
          description: editTaskData.description || "",
          due_date: editTaskData.due_date || "",
          status: editTaskData.status || "todo",
        };

        response = await axios.put(
          `http://localhost:8000/api/tasks/${taskId}`,
          taskData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );
      }

      setEditTaskId(null);
      setEditTaskData({});
      setNotification({ message: "Task updated successfully!", type: "success" });
      await updateSingleTaskList(boardId, listId);
    } catch (error) {
      console.error("Failed to update task:", {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
      });

      if (error.response) {
        if (error.response.status === 404) {
          setNotification({ message: "Task not found.", type: "error" });
        } else if (error.response.status === 422) {
          setNotification({
            message: `Validation failed: ${JSON.stringify(error.response.data.errors)}`,
            type: "error",
          });
        } else if (error.response.status === 401) {
          setNotification({ message: "Invalid token. Please log in again.", type: "error" });
          navigate("/login");
        } else {
          setNotification({ message: "Failed to update task.", type: "error" });
        }
      } else {
        setNotification({ message: "Failed to connect to server.", type: "error" });
      }
    } finally {
      setLoadingStates((prev) => ({ ...prev, [boardId]: false }));
    }
  };

  const handleDeleteTask = async (listId, taskId) => {
    if (!window.confirm("Are you sure you want to delete this task?")) return;

    const boardId = taskLists[listId]?.[0]?.board_id || Object.keys(taskLists).find((boardId) =>
      taskLists[boardId].some((list) => list.id === listId)
    );
    setLoadingStates((prev) => ({ ...prev, [boardId]: true }));
    try {
      await axios.delete(`http://localhost:8000/api/tasks/${taskId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotification({ message: "Task deleted successfully!", type: "success" });
      await updateSingleTaskList(boardId, listId);
    } catch (error) {
      console.error("Failed to delete task:", error.response?.data || error.message);
      setNotification({ message: "Failed to delete task.", type: "error" });
    } finally {
      setLoadingStates((prev) => ({ ...prev, [boardId]: false }));
    }
  };

  const toggleTaskForm = (listId) => {
    setShowTaskForm((prev) => ({ ...prev, [listId]: !prev[listId] }));
  };

  const Task = ({ task, listId }) => {
    return (
      <li className="bg-white p-3 rounded-lg border border-gray-200 shadow-sm transition-all duration-200">
        {editTaskId === task.id ? (
          <div className="space-y-3">
            <input
              type="text"
              value={editTaskData.title || ""}
              onChange={(e) => handleUpdateTaskInput("title", e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
              placeholder="Task title"
              autoFocus
              aria-label="Edit task title"
            />
            <textarea
              value={editTaskData.description || ""}
              onChange={(e) => handleUpdateTaskInput("description", e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
              placeholder="Description"
              rows="3"
              aria-label="Edit task description"
            />
            <input
              type="date"
              value={editTaskData.due_date || ""}
              onChange={(e) => handleUpdateTaskInput("due_date", e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
              aria-label="Edit task due date"
            />
            <select
              value={editTaskData.status || "todo"}
              onChange={(e) => handleUpdateTaskInput("status", e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
              aria-label="Edit task status"
            >
              <option value="todo">To Do</option>
              <option value="in_progress">In Progress</option>
              <option value="done">Done</option>
            </select>
            <input
              type="file"
              onChange={(e) => handleUpdateTaskInput("file", e.target.files[0])}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm"
              aria-label="Edit task file"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => handleUpdateTask(listId, task.id)}
                disabled={!editTaskData.title?.trim() || loadingStates[listId]}
                className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium disabled:bg-gray-400 disabled:cursor-not-allowed"
                aria-label="Save task"
              >
                {loadingStates[listId] ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                    </svg>
                    Saving...
                  </span>
                ) : (
                  <Save className="w-4 h-4" />
                )}
              </button>
              <button
                onClick={handleCancelEditTask}
                className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors text-sm font-medium"
                aria-label="Cancel edit task"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="flex justify-between items-center">
              <div className="font-medium text-gray-800">{task.title}</div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleEditTask(task)}
                  className="text-indigo-600 hover:text-indigo-800 transition-colors"
                  aria-label="Edit task"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDeleteTask(listId, task.id)}
                  className="text-red-600 hover:text-red-800 transition-colors"
                  aria-label="Delete task"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="text-gray-600 text-sm mt-1">{task.description}</div>
            <div className="text-xs text-gray-500 mt-2">
              Due: {task.due_date || "None"} | Status: {task.status.replace("_", " ")}
            </div>
            {task.file_path && (
              <a
                href={`http://localhost:8000/storage/${task.file_path}`}
                target="_blank"
                rel="noreferrer"
                className="text-indigo-600 hover:underline text-sm mt-2 inline-block"
              >
                View File
              </a>
            )}
          </>
        )}
      </li>
    );
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6 font-sans">
      <div className="max-w-7xl mx-auto">

        {notification.message && (
          <div
            className={`fixed top-4 right-4 p-4 rounded-lg shadow-md transition-opacity duration-300 ${
              notification.type === "success" ? "bg-green-500" : "bg-red-500"
            } text-white text-sm z-50`}
          >
            {notification.message}
            <button
              onClick={() => setNotification({ message: "", type: "" })}
              className="ml-2 font-bold"
            >
              ×
            </button>
          </div>
        )}

        <header className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
            <span className="text-indigo-600">🗂️</span> Task Management App
          </h1>
          <div className="flex items-center gap-4">
            {user && (
              <div className="flex items-center gap-2 text-gray-700">
                <UserCircle className="w-6 h-6 text-indigo-600" />
                <span className="text-sm font-medium">{user.name}</span>
              </div>
            )}
            <button
              onClick={() => {
                localStorage.removeItem("token");
                navigate("/login");
              }}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
              aria-label="Logout"
            >
              Logout
            </button>
          </div>
        </header>

        <form onSubmit={handleAddBoard} className="mb-10 flex items-center gap-4 bg-white p-4 rounded-lg shadow-sm relative">
          {loadingStates.global && (
            <div className="absolute inset-0 bg-gray-200 bg-opacity-50 flex items-center justify-center rounded-lg">
              <svg className="animate-spin h-6 w-6 text-indigo-600" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
              </svg>
            </div>
          )}
          <input
            type="text"
            placeholder="Enter board title"
            value={newBoard}
            onChange={(e) => setNewBoard(e.target.value)}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
            aria-label="Board title"
            disabled={loadingStates.global}
          />
          <button
            type="submit"
            disabled={!newBoard.trim() || loadingStates.global}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2 text-sm font-medium disabled:bg-gray-400 disabled:cursor-not-allowed"
            aria-label="Add board"
          >
            <PlusCircle className="w-4 h-4" /> Add Board
          </button>
        </form>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {boards.map((board) => (
            <div
              key={board.id}
              className={`bg-white p-6 rounded-xl shadow-md border border-gray-200 relative transition-all duration-200 ${
                taskLists[board.id]?.length > 0 ? "min-h-[400px]" : "min-h-[200px]"
              }`}
            >
              {loadingStates[board.id] && (
                <div className="absolute inset-0 bg-gray-200 bg-opacity-50 flex items-center justify-center rounded-xl z-10">
                  <svg className="animate-spin h-6 w-6 text-indigo-600" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                </div>
              )}
              {editBoardId === board.id ? (
                <div className="mb-4">
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                    aria-label="Edit board title"
                    disabled={loadingStates[board.id]}
                  />
                  <div className="flex justify-end gap-2 mt-3">
                    <button
                      onClick={() => handleUpdateBoard(board.id)}
                      disabled={!editTitle.trim() || loadingStates[board.id]}
                      className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium disabled:bg-gray-400 disabled:cursor-not-allowed"
                      aria-label="Save board"
                    >
                      Save
                    </button>
                    <button
                      onClick={handleCancelEdit}
                      className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors text-sm font-medium"
                      aria-label="Cancel edit"
                      disabled={loadingStates[board.id]}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold text-gray-800">{board.title}</h2>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEditBoard(board)}
                      className="text-indigo-600 hover:text-indigo-800 transition-colors"
                      aria-label="Edit board"
                      disabled={loadingStates[board.id]}
                    >
                      <Edit2 className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleDeleteBoard(board.id)}
                      className="text-red-600 hover:text-red-800 transition-colors"
                      aria-label="Delete board"
                      disabled={loadingStates[board.id]}
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              )}

              <div className="mb-6 flex gap-3">
                <input
                  type="text"
                  placeholder="Add new list"
                  value={newListTitles[board.id] || ""}
                  onChange={(e) =>
                    setNewListTitles((prev) => ({
                      ...prev,
                      [board.id]: e.target.value,
                    }))
                  }
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                  aria-label="New list title"
                  disabled={loadingStates[board.id]}
                />
                <button
                  onClick={() => handleAddList(board.id)}
                  disabled={!newListTitles[board.id]?.trim() || loadingStates[board.id]}
                  className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium flex items-center gap-2 disabled:bg-gray-400 disabled:cursor-not-allowed"
                  aria-label="Add list"
                >
                  <PlusCircle className="w-4 h-4" /> Add List
                </button>
              </div>

              <div className="space-y-4">
                {taskLists[board.id]?.map((list) => (
                  <div
                    key={list.id}
                    className="bg-gray-50 p-4 rounded-lg border border-gray-200 transition-all duration-200"
                  >
                    {editListId === list.id ? (
                      <div className="mb-3">
                        <input
                          type="text"
                          value={editListTitle}
                          onChange={(e) => setEditListTitle(e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                          aria-label="Edit list title"
                          disabled={loadingStates[board.id]}
                        />
                        <div className="flex justify-end gap-2 mt-2">
                          <button
                            onClick={() => handleUpdateList(board.id, list.id)}
                            disabled={!editListTitle.trim() || loadingStates[board.id]}
                            className="bg-indigo-600 text-white px-3 py-1 rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium disabled:bg-gray-400 disabled:cursor-not-allowed"
                            aria-label="Save list"
                          >
                            <Save className="w-4 h-4" />
                          </button>
                          <button
                            onClick={handleCancelEditList}
                            className="bg-gray-500 text-white px-3 py-1 rounded-lg hover:bg-gray-600 transition-colors text-sm font-medium"
                            aria-label="Cancel edit list"
                            disabled={loadingStates[board.id]}
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex justify-between items-center mb-3">
                        <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                          <span className="text-indigo-600">📋</span> {list.title}
                        </h3>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEditList(list)}
                            className="text-indigo-600 hover:text-indigo-800 transition-colors"
                            aria-label="Edit list"
                            disabled={loadingStates[board.id]}
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteList(board.id, list.id)}
                            className="text-red-600 hover:text-red-800 transition-colors"
                            aria-label="Delete list"
                            disabled={loadingStates[board.id]}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    )}

                    <ul className="space-y-3">
                      {list.tasks?.length > 0 ? (
                        list.tasks.map((task) => (
                          <Task key={task.id} task={task} listId={list.id} />
                        ))
                      ) : (
                        <p className="italic text-gray-500 text-sm">No tasks yet</p>
                      )}
                    </ul>

                    <button
                      onClick={() => toggleTaskForm(list.id)}
                      className="mt-3 w-full bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium flex items-center justify-center gap-2"
                      aria-label="Toggle new task form"
                      disabled={loadingStates[board.id]}
                    >
                      <PlusCircle className="w-4 h-4" /> {showTaskForm[list.id] ? "Hide Form" : "New Task"}
                    </button>

                    {showTaskForm[list.id] && (
                      <form onSubmit={(e) => handleAddTask(e, list.id)} className="mt-4 bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                        <div className="grid gap-4">
                          <div>
                            <label htmlFor={`task-title-${list.id}`} className="block text-sm font-medium text-gray-700">
                              Task Title
                            </label>
                            <input
                              id={`task-title-${list.id}`}
                              type="text"
                              placeholder="Enter task title"
                              value={newTasks[list.id]?.title || ""}
                              onChange={(e) => handleTaskInputChange(list.id, "title", e.target.value)}
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                              aria-label="Task title"
                              disabled={loadingStates[board.id]}
                            />
                          </div>
                          <div>
                            <label htmlFor={`task-description-${list.id}`} className="block text-sm font-medium text-gray-700">
                              Description
                            </label>
                            <textarea
                              id={`task-description-${list.id}`}
                              placeholder="Enter description"
                              value={newTasks[list.id]?.description || ""}
                              onChange={(e) => handleTaskInputChange(list.id, "description", e.target.value)}
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                              rows="3"
                              aria-label="Task description"
                              disabled={loadingStates[board.id]}
                            />
                          </div>
                          <div>
                            <label htmlFor={`task-due-date-${list.id}`} className="block text-sm font-medium text-gray-700">
                              Due Date
                            </label>
                            <input
                              id={`task-due-date-${list.id}`}
                              type="date"
                              value={newTasks[list.id]?.due_date || ""}
                              onChange={(e) => handleTaskInputChange(list.id, "due_date", e.target.value)}
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                              aria-label="Task due date"
                              disabled={loadingStates[board.id]}
                            />
                          </div>
                          <div>
                            <label htmlFor={`task-status-${list.id}`} className="block text-sm font-medium text-gray-700">
                              Status
                            </label>
                            <select
                              id={`task-status-${list.id}`}
                              value={newTasks[list.id]?.status || "todo"}
                              onChange={(e) => handleTaskInputChange(list.id, "status", e.target.value)}
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                              aria-label="Task status"
                              disabled={loadingStates[board.id]}
                            >
                              <option value="todo">To Do</option>
                              <option value="in_progress">In Progress</option>
                              <option value="done">Done</option>
                            </select>
                          </div>
                          <div>
                            <label htmlFor={`task-file-${list.id}`} className="block text-sm font-medium text-gray-700">
                              File
                            </label>
                            <input
                              id={`task-file-${list.id}`}
                              type="file"
                              onChange={(e) => handleTaskInputChange(list.id, "file", e.target.files[0])}
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm"
                              aria-label="Task file"
                              disabled={loadingStates[board.id]}
                            />
                          </div>
                        </div>
                        <button
                          type="submit"
                          disabled={!newTasks[list.id]?.title?.trim() || loadingStates[board.id]}
                          className="w-full mt-4 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium flex items-center justify-center gap-2 disabled:bg-gray-400 disabled:cursor-not-allowed"
                          aria-label="Add task"
                        >
                          {loadingStates[board.id] ? (
                            <span className="flex items-center gap-2">
                              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                              </svg>
                              Saving...
                            </span>
                          ) : (
                            <>
                              <PlusCircle className="w-4 h-4" /> Add Task
                            </>
                          )}
                        </button>
                      </form>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;