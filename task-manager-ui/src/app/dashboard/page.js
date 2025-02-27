'use client'; // Required for useEffect

import {useEffect, useState} from 'react';
import axios from 'axios';
import ProtectedLayout from '@/components/protectedLayout';


export default function Dashboard()
  {
  const [tasks, setTasks]     = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() =>
  {
  const fetchTasks = async () =>
    {
    const token = localStorage.getItem('token');
    if (!token) {
      return;
    }

    try {
      const {data} = await axios.get('http://localhost:5000/api/tasks', {
        headers: {Authorization: `Bearer ${token}`},
      });
      setTasks(data.tasks);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    }
    setLoading(false);
    };

  fetchTasks();
  }, []);

  return (
      <ProtectedLayout>
        <div className="bg-white p-6 rounded-lg shadow-md w-full">
          <h2 className="text-2xl font-bold mb-4 ag-body">Dashboard</h2>
          <hr className={'p-6'}/>
          {loading ? (
              <p>Loading...</p>
          ) : tasks.length === 0 ? (
              <p>No tasks available</p>
          ) : (
              <ul role="list" className="divide-y divide-gray-100">
                {tasks.map((task) => (
                    <li key={task.id}
                        className="flex justify-between gap-x-6 py-5">
                      <div className="flex min-w-0 gap-x-4">
                        <img alt="" src={task?.imageUrl}
                             className="size-12 flex-none rounded-full bg-gray-50"/>
                        <div className="min-w-0 flex-auto">
                          <p className="text-sm/6 font-semibold text-gray-900">{task.title}</p>
                          <p className="mt-1 truncate text-xs/5 text-gray-500">{task.description}</p>
                        </div>
                      </div>
                      <div
                          className="hidden shrink-0 sm:flex sm:flex-col sm:items-end">
                        <p className="text-sm/6 text-gray-900">
                          <span
                              className="inline-flex items-center rounded-md bg-red-50 px-2 py-1 text-xs font-medium text-red-700 ring-1 ring-red-600/10 ring-inset">
                              {task.priority.toUpperCase()}
                          </span>
                        </p>
                        {task.status ? (
                            <p className="mt-1 text-xs/5 text-gray-500">
                              <span
                                  className="inline-flex items-center rounded-md bg-gray-50 px-2 py-1 text-xs font-medium text-green-600 ring-1 ring-green-500 ring-inset">
                              {task.status.replace(/_/g, ' ')}</span>

                            </p>
                        ) : (
                            <div className="mt-1 flex items-center gap-x-1.5">
                              <div
                                  className="flex-none rounded-full bg-emerald-500/20 p-1">
                                <div
                                    className="size-1.5 rounded-full bg-emerald-500"/>
                              </div>
                              <p className="text-xs/5 text-gray-500">Online</p>
                            </div>
                        )}
                      </div>
                    </li>
                    /*
                      <li key={task.id}
                    className="bg-white p-4 shadow-md rounded mb-2">
                    <h3 className="font-bold">{task.title}</h3>
                    <p>{task.description}</p>
                    <span className={`text-sm ${task.status === 'completed'
                        ? 'text-green-600'
                        : 'text-yellow-600'}`}>
                    {task.status}
                  </span>
                  </li>
                  {*/
                ))}
              </ul>
          )}
        </div>

      </ProtectedLayout>
  )
      ;
  }
