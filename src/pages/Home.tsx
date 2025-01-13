import { Link } from 'react-router-dom'

export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h1 className="mt-6 text-center text-4xl font-extrabold text-gray-900">
            Welcome to CryOutNow
          </h1>
          <p className="mt-2 text-center text-sm text-gray-600">
            A platform for sharing and receiving prayers
          </p>
        </div>
        <div className="mt-8 space-y-4">
          <Link
            to="/login"
            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Sign in
          </Link>
          <Link
            to="/register"
            className="group relative w-full flex justify-center py-2 px-4 border border-gray-300 text-sm font-medium rounded-md text-indigo-600 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Create an account
          </Link>
        </div>
      </div>
    </div>
  )
} 
