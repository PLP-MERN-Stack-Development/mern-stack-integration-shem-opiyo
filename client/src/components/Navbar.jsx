// src/components/Navbar.jsx
import { Link, useNavigate } from 'react-router-dom'
import { authService } from '../services/api'

export default function Navbar() {
  const navigate = useNavigate()

  // SAFELY get the current logged-in user
  let user = null
  try {
    const stored = localStorage.getItem('user')
    if (stored && stored !== 'null' && stored !== 'undefined') {
      user = JSON.parse(stored)
    }
  } catch (e) {
    // corrupted data → clean it
    authService.logout()
  }

  const handleLogout = () => {
    authService.logout()
    navigate('/login')
  }

  return (
    <nav className="bg-blue-600 text-white p-4 shadow-lg">
      <div className="container mx-auto flex justify-between items-center">
        {/* Logo – always visible */}
        <Link to="/" className="text-2xl font-bold">
          MERN Blog
        </Link>

        <div className="flex items-center space-x-6">
          <Link to="/" className="hover:underline">
            Home
          </Link>

          {/* LOGGED-IN STATE */}
          {user ? (
            <>
              <Link to="/create" className="hover:underline">
                Write Post
              </Link>
              <span>Hello, {user.name}!</span>
              <button
                onClick={handleLogout}
                className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded transition"
              >
                Logout
              </button>
            </>
          ) : (
            /* LOGGED-OUT STATE */
            <>
              <Link to="/login" className="hover:underline">
                Login
              </Link>
              <Link to="/register" className="hover:underline">
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}