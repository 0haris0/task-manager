'use client';

import {useEffect, useState} from 'react';
import {useRouter} from 'next/navigation';
import axios from 'axios';


export default function Login()
  {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');
  const router                  = useRouter();

  const handleLogin = async (e) =>
    {
    e.preventDefault();
    setError('');

    useEffect(()=>{
      const token = localStorage.getItem('token');
      if (token) {
        router.push('/dashboard');
      }
    },[token])

    try {
      const {data} = await axios.post('http://localhost:5000/api/auth/login', {
        email,
        password,
      });
      localStorage.setItem('token', data.token);
      router.push('/dashboard');
    } catch (err) {
      setError('Invalid credentials');
    }
    };

  return (
      <div className="max-w-md mx-auto mt-10 bg-white p-6 shadow-md rounded-md">
        <h2 className="text-2xl font-bold mb-4">Login</h2>
        {error && <p className="text-red-500">{error}</p>}
        <form onSubmit={handleLogin}>
          <input
              type="email"
              placeholder="Email"
              className="w-full p-2 border mb-2"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
          />
          <input
              type="password"
              placeholder="Password"
              className="w-full p-2 border mb-2"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
          />
          <button type="submit"
                  className="w-full bg-blue-500 text-white p-2 rounded">
            Login
          </button>
        </form>
      </div>
  );
  }
