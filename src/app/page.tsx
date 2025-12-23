import Link from 'next/link'

export default function Home() {
    return (
          <main className="flex min-h-screen flex-col items-center justify-center p-24">
                <h1 className="text-4xl font-bold mb-4">BIG Oakland Virtual Mail</h1>h1>
                <p className="text-xl text-gray-600 mb-8">Your mail, managed your way</p>p>
                <div className="flex gap-4">
                        <Link href="/login" className="bg-blue-600 text-white px-6 py-3 rounded-lg">Sign In</Link>Link>
                        <Link href="/register" className="bg-gray-200 px-6 py-3 rounded-lg">Get Started</Link>Link>
                </div>div>
          </main>main>
        )
}</main>
