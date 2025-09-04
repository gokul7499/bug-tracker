
import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useNotifications } from '../hooks/useNotification'
import {Home, FolderOpen, SquareCheck as CheckSquare, Bug, BarChart3, Settings, Bell, User, LogOut, LogIn} from 'lucide-react'

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isAuthenticated, signIn, signOut, loading } = useAuth()
  const { notifications } = useNotifications(user?.userId)
  const location = useLocation()
  const [signingIn, setSigningIn] = React.useState(false)

  const unreadCount = notifications?.filter(n => !n.is_read).length || 0

  const navigation = [
    { name: 'Dashboard', href: '/', icon: Home },
    { name: 'Projects', href: '/projects', icon: FolderOpen },
    { name: 'Tasks', href: '/tasks', icon: CheckSquare },
    { name: 'Bugs', href: '/bugs', icon: Bug },
    { name: 'Reports', href: '/reports', icon: BarChart3 },
    { name: 'Settings', href: '/settings', icon: Settings },
  ]

  const handleSignIn = async () => {
    setSigningIn(true)
    try {
      await signIn()
    } catch (error) {
      console.error('Sign in failed:', error)
    } finally {
      setSigningIn(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="loading-spinner h-8 w-8"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen w-full flex d-flex  items-center justify-center " style={{marginLeft:"250px"}} >
        <div className="max-w-md w-full text-center px-6">
          <Bug className="h-16 w-16 text-blue-600 mb-6 mx-auto" />
          <h1 className="text-4xl lg:text-5xl font-extrabold tracking-tight text-gray-900 mb-4">
            Authentication Required
          </h1>
          <p className="text-gray-600 mb-10">
            Please sign in to access project features
          </p>
  
          <div className="bg-white shadow-xl rounded-xl p-6">
            <button
              onClick={handleSignIn}
              disabled={signingIn}
              className="w-full inline-flex items-center justify-center px-6 py-3 border border-transparent rounded-md text-white bg-blue-600 hover:bg-blue-700 shadow focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {signingIn ? (
                <>
                  <div className="loading-spinner h-4 w-4 mr-2"></div>
                  Signing in...
                </>
              ) : (
                <>
                  <LogIn className="h-4 w-4 mr-2" />
                  Sign In to Continue
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    )
  }
  
  

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg">
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center h-16 px-6 border-b border-gray-200">
            <Bug className="h-8 w-8 text-blue-600" />
            <span className="ml-2 text-xl font-bold text-gray-900">Bug Tracker</span>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                    isActive
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                >
                  <item.icon className="mr-3 h-5 w-5" />
                  {item.name}
                </Link>
              )
            })}
          </nav>

          {/* User Menu */}
          <div className="border-t border-gray-200 p-4">
            <div className="flex items-center space-x-3 mb-4">
              <div className="flex-shrink-0">
                <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <User className="h-4 w-4 text-blue-600" />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {user?.userName || user?.email}
                </p>
                <p className="text-xs text-gray-500">User</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Link
                to="/notifications"
                className="flex-1 flex items-center justify-center px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md relative"
              >
                <Bell className="h-4 w-4" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </Link>
              
              <button
                onClick={signOut}
                className="flex-1 flex items-center justify-center px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="pl-64">
        <main className="px-4 sm:px-6 lg:px-9 py-6">
          {children}
        </main>
      </div>
    </div>
  )
}

export default Layout
