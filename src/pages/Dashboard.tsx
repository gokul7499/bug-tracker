
import React from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useProjects } from '../hooks/useProjects'
import { useTasks } from '../hooks/useTasks'
import { useBugs } from '../hooks/useBugs'
import { useNotifications } from '../hooks/useNotification'
import {FolderOpen, SquareCheck as CheckSquare, Bug, AlertCircle, TrendingUp, Clock, Users, Activity} from 'lucide-react'
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

const Dashboard: React.FC = () => {
  const { user } = useAuth()
  const { projects } = useProjects()
  const { tasks } = useTasks()
  const { bugs } = useBugs()
  const { notifications } = useNotifications(user?.userId)

  // Calculate metrics
  const totalProjects = projects.length
  const activeProjects = projects.filter(p => p.status === 'active').length
  const totalTasks = tasks.length
  const completedTasks = tasks.filter(t => t.status === 'done').length
  const totalBugs = bugs.length
  const openBugs = bugs.filter(b => !['fixed', 'verified', 'closed'].includes(b.status)).length
  const criticalBugs = bugs.filter(b => b.severity === 'critical' || b.severity === 'blocker').length

  // Task status distribution
  const taskStatusData = [
    { name: 'To Do', value: tasks.filter(t => t.status === 'todo').length, color: '#6B7280' },
    { name: 'In Progress', value: tasks.filter(t => t.status === 'in_progress').length, color: '#3B82F6' },
    { name: 'Review', value: tasks.filter(t => t.status === 'review').length, color: '#8B5CF6' },
    { name: 'Done', value: tasks.filter(t => t.status === 'done').length, color: '#10B981' }
  ]

  // Bug severity distribution
  const bugSeverityData = [
    { name: 'Trivial', value: bugs.filter(b => b.severity === 'trivial').length, color: '#6B7280' },
    { name: 'Minor', value: bugs.filter(b => b.severity === 'minor').length, color: '#F59E0B' },
    { name: 'Major', value: bugs.filter(b => b.severity === 'major').length, color: '#EF4444' },
    { name: 'Critical', value: bugs.filter(b => b.severity === 'critical').length, color: '#DC2626' },
    { name: 'Blocker', value: bugs.filter(b => b.severity === 'blocker').length, color: '#7F1D1D' }
  ]

  // Project progress data
  const projectProgressData = projects.map(p => ({
    name: p.name.substring(0, 15) + (p.name.length > 15 ? '...' : ''),
    progress: p.progress || 0
  }))

  // Recent activities (last 10 items)
  const recentActivities = [
    ...tasks.slice(0, 5).map(task => ({
      type: 'task',
      title: `Task: ${task.title}`,
      time: task.updated_at,
      status: task.status,
      id: task._id
    })),
    ...bugs.slice(0, 5).map(bug => ({
      type: 'bug',
      title: `Bug: ${bug.title}`,
      time: bug.updated_at,
      status: bug.status,
      id: bug._id
    }))
  ].sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()).slice(0, 10)

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-lg p-6 text-white">
        <h1 className="text-3xl font-bold mb-2">Welcome back, {user?.userName}!</h1>
        <p className="text-blue-100">Here's an overview of your projects and tasks</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-500 text-white">
              <FolderOpen className="h-6 w-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-blue-600">Active Projects</p>
              <p className="text-2xl font-bold text-blue-900">{activeProjects}/{totalProjects}</p>
            </div>
          </div>
        </div>

        <div className="card bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-500 text-white">
              <CheckSquare className="h-6 w-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-green-600">Completed Tasks</p>
              <p className="text-2xl font-bold text-green-900">{completedTasks}/{totalTasks}</p>
            </div>
          </div>
        </div>

        <div className="card bg-gradient-to-br from-red-50 to-red-100 border-red-200">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-red-500 text-white">
              <Bug className="h-6 w-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-red-600">Open Bugs</p>
              <p className="text-2xl font-bold text-red-900">{openBugs}/{totalBugs}</p>
            </div>
          </div>
        </div>

        <div className="card bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-orange-500 text-white">
              <AlertCircle className="h-6 w-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-orange-600">Critical Bugs</p>
              <p className="text-2xl font-bold text-orange-900">{criticalBugs}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Task Status Distribution */}
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Task Status Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={taskStatusData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {taskStatusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Bug Severity Distribution */}
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Bug Severity Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={bugSeverityData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#EF4444" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Project Progress */}
      <div className="card">
        <h3 className="text-lg font-semibold mb-4">Project Progress</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={projectProgressData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis domain={[0, 100]} />
            <Tooltip formatter={(value: number) => [`${value}%`, 'Progress']} />
            <Bar dataKey="progress" fill="#3B82F6" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Recent Activities and Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Activities */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold flex items-center">
              <Activity className="h-5 w-5 mr-2" />
              Recent Activities
            </h3>
            <Link to="/notifications" className="text-blue-600 hover:text-blue-800 text-sm">
              View all
            </Link>
          </div>
          <div className="space-y-3">
            {recentActivities.length > 0 ? (
              recentActivities.map((activity, index) => (
                <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <div className={`p-2 rounded-full ${activity.type === 'task' ? 'bg-blue-100 text-blue-600' : 'bg-red-100 text-red-600'}`}>
                    {activity.type === 'task' ? <CheckSquare className="h-4 w-4" /> : <Bug className="h-4 w-4" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {activity.title}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(activity.time).toLocaleDateString()} • Status: {activity.status}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-4">No recent activities</p>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-4">
            <Link
              to="/projects"
              className="flex flex-col items-center p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
            >
              <FolderOpen className="h-8 w-8 text-blue-600 mb-2" />
              <span className="text-sm font-medium text-blue-900">New Project</span>
            </Link>
            
            <Link
              to="/tasks"
              className="flex flex-col items-center p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
            >
              <CheckSquare className="h-8 w-8 text-green-600 mb-2" />
              <span className="text-sm font-medium text-green-900">Create Task</span>
            </Link>
            
            <Link
              to="/bugs"
              className="flex flex-col items-center p-4 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
            >
              <Bug className="h-8 w-8 text-red-600 mb-2" />
              <span className="text-sm font-medium text-red-900">Report Bug</span>
            </Link>
            
            <Link
              to="/reports"
              className="flex flex-col items-center p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors"
            >
              <TrendingUp className="h-8 w-8 text-purple-600 mb-2" />
              <span className="text-sm font-medium text-purple-900">View Reports</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Upcoming Deadlines */}
      <div className="card">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <Clock className="h-5 w-5 mr-2" />
          Upcoming Deadlines
        </h3>
        <div className="space-y-3">
          {tasks
            .filter(task => task.due_date && new Date(task.due_date) > new Date())
            .sort((a, b) => new Date(a.due_date!).getTime() - new Date(b.due_date!).getTime())
            .slice(0, 5)
            .map(task => (
              <div key={task._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">{task.title}</p>
                  <p className="text-sm text-gray-600">
                    Due: {new Date(task.due_date!).toLocaleDateString()}
                  </p>
                </div>
                <span className={`status-badge priority-${task.priority}`}>
                  {task.priority}
                </span>
              </div>
            ))}
          {tasks.filter(task => task.due_date && new Date(task.due_date) > new Date()).length === 0 && (
            <p className="text-gray-500 text-center py-4">No upcoming deadlines</p>
          )}
        </div>
      </div>
    </div>
  )
}

export default Dashboard
