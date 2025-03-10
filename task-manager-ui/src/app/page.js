"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import ProtectedLayout from "@/components/protectedLayout";

export default function Home() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogType, setDialogType] = useState(""); // 'add', 'edit', 'delete'
  const [currentTask, setCurrentTask] = useState(null);

  // Task Form Fields
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("pending");
  const [priority, setPriority] = useState("low");
  const [dueDate, setDueDate] = useState("");

  useEffect(() => {
    const fetchTasks = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        return;
      }

      try {
        const { data } = await axios.get("http://localhost:5000/api/tasks", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setTasks(data.tasks);
      } catch (error) {
        console.error("Error fetching tasks:", error);
      }
      setLoading(false);
    };

    fetchTasks();
  }, []);

  const openDialog = (type, task = null) => {
    setDialogType(type);
    setCurrentTask(task);

    if (task) {
      setTitle(task.title || "");
      setDescription(task.description || "");
      setStatus(task.status || "pending");
      setPriority(task.priority || "low");
      setDueDate(task.dueDate ? task.dueDate.split("T")[0] : "");
    } else {
      setTitle("");
      setDescription("");
      setStatus("pending");
      setPriority("low");
      setDueDate("");
    }

    setDialogOpen(true);
  };

  const closeDialog = () => {
    setDialogOpen(false);
    setCurrentTask(null);
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");

    try {
      const { data } = await axios.post(
        "http://localhost:5000/api/tasks",
        {
          title,
          description,
          status,
          priority,
          dueDate: new Date(dueDate).toISOString(),
        },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setTasks([...tasks, data]);
      closeDialog();
    } catch (error) {
      console.error("Error creating task:", error);
    }
  };

  const handleEditTask = async (e) => {
    e.preventDefault();
    if (!currentTask) {
      return;
    }
    const token = localStorage.getItem("token");

    try {
      const { data } = await axios.put(
        `http://localhost:5000/api/tasks/${currentTask.id}`,
        {
          title,
          description,
          status,
          priority,
          dueDate: new Date(dueDate).toISOString(),
        },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setTasks(tasks.map((t) => (t.id === currentTask.id ? data : t)));
      closeDialog();
    } catch (error) {
      console.error("Error editing task:", error);
    }
  };

  const handleDeleteTask = async () => {
    if (!currentTask) {
      return;
    }
    const token = localStorage.getItem("token");

    try {
      await axios.delete(`http://localhost:5000/api/tasks/${currentTask.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTasks(tasks.filter((task) => task.id !== currentTask.id));
      closeDialog();
    } catch (error) {
      console.error("Error deleting task:", error);
    }
  };

  return (
    <ProtectedLayout>
      <div className="bg-white p-6 rounded-lg shadow-md w-full">
        <h2 className="text-2xl font-bold mb-4">Dashboard</h2>
        <button
          onClick={() => openDialog("add")}
          className="bg-blue-500 p-2 rounded text-white"
        >
          Add New Task
        </button>

        {loading ? (
          <p>Loading...</p>
        ) : tasks.length === 0 ? (
          <p>No tasks available</p>
        ) : (
          <ul className="divide-y divide-gray-100 mt-4">
            {tasks.map((task) => (
              <li
                key={task.id}
                className="flex justify-between p-4 bg-gray-100 rounded-md shadow mb-2"
              >
                <div className="flex flex-col">
                  <p className="font-semibold">{task.title}</p>
                  <p className="text-gray-500 text-sm">{task.description}</p>
                  <p className="text-xs text-gray-700 pt-2">
                    <span className="inline-flex items-center rounded-md bg-gray-50 px-2 py-1 text-xs font-medium text-gray-600 ring-1 ring-gray-500/10 ring-inset">
                      {task.status.replace(/_/g, " ").toUpperCase()}
                    </span>
                  </p>
                  <p className="text-xs text-gray-700 pt-2">
                    <span className="inline-flex items-center rounded-md bg-red-50 px-2 py-1 text-xs font-medium text-red-700 ring-1 ring-red-600/10 ring-inset">
                      {task.priority.toUpperCase()}
                    </span>
                  </p>
                  <p className="text-xs text-gray-700 pt-2">
                    <strong>Due Date:</strong>{" "}
                    <span className="inline-flex items-center rounded-md bg-yellow-50 px-2 py-1 text-xs font-medium text-yellow-800 ring-1 ring-yellow-600/20 ring-inset">
                      {task.dueDate ? task.dueDate.split("T")[0] : "N/A"}
                    </span>
                  </p>
                </div>
                <div className="gap-2 flex-col flex items-end">
                  <button
                    onClick={() => openDialog("edit", task)}
                    className="bg-yellow-500 px-3 py-1 rounded text-white block"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => openDialog("delete", task)}
                    className="bg-red-500 px-3 py-1 rounded text-white"
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Side Dialog */}
      {dialogOpen && (
        <div className="fixed inset-0 flex justify-end bg-black bg-opacity-50">
          <div className="w-1/3 bg-white p-6 shadow-lg h-full">
            <button onClick={closeDialog} className="text-gray-600 text-xl">
              &times;
            </button>
            {dialogType === "add" || dialogType === "edit" ? (
              <>
                <h3 className="text-xl font-bold mb-4">
                  {dialogType === "add" ? "Add New Task" : "Edit Task"}
                </h3>
                <form
                  onSubmit={
                    dialogType === "add" ? handleCreateTask : handleEditTask
                  }
                >
                  <input
                    type="text"
                    placeholder="Title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full p-2 border mb-2"
                    required
                  />
                  <textarea
                    placeholder="Description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full p-2 border mb-2"
                  />
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full p-2 border mb-2"
                  />
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full p-2 border mb-2"
                  >
                    <option value="pending">Pending</option>
                    <option value="in_progress">In Progress</option>
                    <option value="completed">Completed</option>
                    <option value="canceled">Canceled</option>
                  </select>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                    className="w-full p-2 border mb-2"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                  <button
                    type="submit"
                    className="bg-blue-500 p-2 rounded text-white w-full"
                  >
                    {dialogType === "add" ? "Create Task" : "Save Changes"}
                  </button>
                </form>
              </>
            ) : (
              <>
                <h3 className="text-xl font-bold mb-4 text-red-500">
                  Delete Task
                </h3>
                <button
                  onClick={handleDeleteTask}
                  className="bg-red-500 p-2 rounded text-white w-full"
                >
                  Confirm Delete
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </ProtectedLayout>
  );
}
