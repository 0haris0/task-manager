import {Geist, Geist_Mono} from 'next/font/google';
import Link from 'next/link';
import './globals.css';


const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets : ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets : ['latin'],
});

export const metadata = {
  title      : 'Task Manager',
  description: 'Manage your tasks efficiently',
};

export default function RootLayout({children})
  {
  return (
      <html lang="en">
      <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
      <nav className="bg-white shadow-md p-4">
        <div className="max-w-6xl mx-auto flex justify-between">
          <h1 className="text-xl font-bold">Task Manager</h1>
          <NavLinks/>
        </div>
      </nav>
      <main className="max-w-6xl mx-auto p-6">{children}</main>
      </body>
      </html>
  );
  }

function NavLinks() {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    return token ? (
        <Link href="/dashboard" className="text-blue-600">Dashboard</Link>
    ) : (
        <Link href="/login" className="text-blue-600">Login</Link>
    );
  }
  return null;
}