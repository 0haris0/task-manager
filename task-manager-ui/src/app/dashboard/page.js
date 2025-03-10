"use client"; // Required for useEffect

import { useEffect, useState } from "react";
import axios from "axios";
import ProtectedLayout from "@/components/protectedLayout";

export default function Dashboard() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("");
  const [priority, setPriority] = useState("");

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

  const handleCreateTask = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");

    try {
      const { data } = await axios.post(
        "http://localhost:5000/api/tasks",
        { title, description, status, priority, dueDate: new Date() },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setTasks([...tasks, data]);
      setTitle("");
      setDescription("");
    } catch (error) {
      console.error("Error creating task:", error);
    }
  };

  const handleDeleteTask = async (id) => {
    const token = localStorage.getItem("token");

    try {
      await axios.delete(`http://localhost:5000/api/tasks/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTasks(tasks.filter((task) => task.id !== id));
    } catch (error) {
      console.error("Error deleting task:", error);
    }
  };

  return (
    <ProtectedLayout>
      <div className="bg-white p-6 rounded-lg shadow-md w-full">
        <h2 className="text-2xl font-bold mb-4 ag-body">Dashboard</h2>
        <hr className={"p-6"} />
        <form
          onSubmit={handleCreateTask}
          className="mb-4 p-4 bg-gray-800 text-white rounded shadow"
        >
          <h3 className="text-lg font-semibold mb-2">Create New Task</h3>
          <input
            type="text"
            placeholder="Task title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full p-2 border mb-2 bg-gray-700 text-white"
            required
          />
          <textarea
            placeholder="Task description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full p-2 border mb-2 bg-gray-700 text-white"
          />
          <input
            type="text"
            placeholder="Task status"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full p-2 border mb-2 bg-gray-700 text-white"
          />
          <input
            type="text"
            placeholder="Task priority"
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
            className="w-full p-2 border mb-2 bg-gray-700 text-white"
          />
          <button
            type="submit"
            className="bg-blue-500 p-2 rounded text-white w-full"
          >
            Add Task
          </button>
        </form>
        {loading ? (
          <p>Loading...</p>
        ) : tasks.length === 0 ? (
          <p>No tasks available</p>
        ) : (
          <ul role="list" className="divide-y divide-gray-100">
            {tasks.map((task) => (
              <li
                key={task.id}
                className="flex justify-between gap-x-6 py-5 bg-gray-100 p-4 rounded-md shadow"
              >
                <div className="flex min-w-0 gap-x-4">
                  <img
                    alt="Task"
                    src={task?.imageUrl || "https://via.placeholder.com/50"}
                    className="size-12 flex-none rounded-full bg-gray-50"
                  />
                  <div className="min-w-0 flex-auto">
                    <p className="text-sm font-semibold text-gray-900">
                      {task.title}
                    </p>
                    <p className="mt-1 truncate text-xs text-gray-500">
                      {task.description}
                    </p>
                  </div>
                </div>
                <div className="shrink-0 sm:flex sm:flex-col sm:items-end">
                  <p className="text-sm text-gray-900">
                    <span
                      className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${
                        task.priority === "high"
                          ? "bg-red-50 text-red-700 ring-red-600/10"
                          : task.priority === "medium"
                            ? "bg-yellow-50 text-yellow-700 ring-yellow-600/10"
                            : "bg-green-50 text-green-700 ring-green-600/10"
                      }`}
                    >
                      {task.priority.toUpperCase()}
                    </span>
                  </p>
                  {task.status ? (
                    <p className="mt-1 text-xs text-gray-500">
                      <span
                        className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${
                          task.status === "completed"
                            ? "bg-green-50 text-green-700 ring-green-500"
                            : task.status === "in_progress"
                              ? "bg-yellow-50 text-yellow-700 ring-yellow-500"
                              : "bg-gray-50 text-gray-600 ring-gray-500"
                        }`}
                      >
                        {task.status.replace(/_/g, " ")}
                      </span>
                    </p>
                  ) : (
                    <div className="mt-1 flex items-center gap-x-1.5">
                      <div className="flex-none rounded-full bg-emerald-500/20 p-1">
                        <div className="size-1.5 rounded-full bg-emerald-500" />
                      </div>
                      <p className="text-xs text-gray-500">Online</p>
                    </div>
                  )}
                </div>
                <div className="flex items-center">
                  <button
                    onClick={() => handleDeleteTask(task.id)}
                    className="text-red-500 px-3 py-1 border border-red-500 rounded hover:bg-red-500 hover:text-white transition"
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </ProtectedLayout>
  );
}
