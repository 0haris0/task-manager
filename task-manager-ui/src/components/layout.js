import Link from 'next/link';


export default function Layout({children})
  {
  return (
      <div className="min-h-screen bg-slate-950 text-white">
        <nav className="bg-white shadow-md p-4">
          <div className="max-w-6xl mx-auto flex justify-between">
            <h1 className="text-xl font-bold">Task Manager</h1>
            <div>
              <Link href="/dashboard"
                    className="mr-4 text-blue-600">Dashboard</Link>
              <Link href="/login" className="text-blue-600">Login</Link>
            </div>
          </div>
        </nav>
        <main className="bg-slate-950 w-full">
          <div className={'max-w-6xl mx-auto p-6'}>

            {children}
          </div>
        </main>
      </div>
  );
  }