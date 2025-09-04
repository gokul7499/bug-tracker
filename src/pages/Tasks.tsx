
import React, { useState } from 'react'
import { useTasks, Task } from '../hooks/useTasks'
import { useAuth } from '../hooks/useAuth'
import KanbanBoard from '../components/KanbanBoard'
import TaskForm from '../components/TaskForm'
import {Plus, List, Grid3X3, Filter, Search, Calendar, User} from 'lucide-react'
import { format } from 'date-fns'
import './Tasks.css'

const Tasks: React.FC = () => {
  const { user } = useAuth()
  const { tasks, loading, createTask, updateTask, deleteTask } = useTasks()
  const [showForm, setShowForm] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban')
  const [searchTerm, setSearchTerm] = useState('')
  const [filters, setFilters] = useState({
    status: 'all',
    priority: 'all',
    assignee: 'all',
    project: 'all'
  })

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         task.description.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = filters.status === 'all' || task.status === filters.status
    const matchesPriority = filters.priority === 'all' || task.priority === filters.priority
    const matchesAssignee = filters.assignee === 'all' || task.assigned_to === filters.assignee
    const matchesProject = filters.project === 'all' || task.project_id === filters.project

    return matchesSearch && matchesStatus && matchesPriority && matchesAssignee && matchesProject
  })

  const handleTaskSubmit = async (taskData: Partial<Task>) => {
    try {
      if (editingTask) {
        await updateTask(editingTask._id, taskData)
      } else {
        await createTask({
          ...taskData,
          reporter_id: user?.userId || '',
          created_by: user?.userId || ''
        } as Omit<Task, '_id' | 'created_at' | 'updated_at'>)
      }
      setShowForm(false)
      setEditingTask(null)
    } catch (error) {
      console.error('Failed to save task:', error)
    }
  }

  const handleTaskClick = (task: Task) => {
    setEditingTask(task)
    setShowForm(true)
  }

  const getPriorityColor = (priority: Task['priority']) => {
    switch (priority) {
      case 'low': return 'bg-green-100 text-green-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      case 'high': return 'bg-orange-100 text-orange-800'
      case 'critical': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusColor = (status: Task['status']) => {
    switch (status) {
      case 'todo': return 'bg-gray-100 text-gray-800'
      case 'in_progress': return 'bg-blue-100 text-blue-800'
      case 'review': return 'bg-purple-100 text-purple-800'
      case 'done': return 'bg-green-100 text-green-800'
      case 'cancelled': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="loading-spinner h-8 w-8"></div>
      </div>
    )
  }

  return (
    <div className="tasks-page">
      {/* Header */}
      <div className="tasks-header">
        <div>
          <h1 className="tasks-title">Tasks</h1>
          <p className="tasks-subtitle">Manage and track your tasks</p>
        </div>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <div className="view-toggle">
            <button onClick={() => setViewMode('kanban')} className={viewMode === 'kanban' ? 'active' : ''} title="Kanban View">
              <Grid3X3 className="h-4 w-4" />
            </button>
            <button onClick={() => setViewMode('list')} className={viewMode === 'list' ? 'active' : ''} title="List View">
              <List className="h-4 w-4" />
            </button>
          </div>
          <button
            onClick={() => { setEditingTask(null); setShowForm(true); }}
            className="btn-primary"
          >
            <Plus className="h-5 w-5 icon" />
            New Task
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="filter-card">
        {/* Search */}
        <div className="search-wrap">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <input
            type="text"
            placeholder="Search tasks..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>

        {/* Filters */}
        <div className="filters-grid">
          <select
            value={filters.status}
            onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
            className=""
          >
            <option value="all">All Status</option>
            <option value="todo">To Do</option>
            <option value="in_progress">In Progress</option>
            <option value="review">Review</option>
            <option value="done">Done</option>
            <option value="cancelled">Cancelled</option>
          </select>

          <select
            value={filters.priority}
            onChange={(e) => setFilters(prev => ({ ...prev, priority: e.target.value }))}
            className=""
          >
            <option value="all">All Priorities</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="critical">Critical</option>
          </select>

          <input
            type="text"
            placeholder="Filter by assignee"
            value={filters.assignee === 'all' ? '' : filters.assignee}
            onChange={(e) => setFilters(prev => ({ ...prev, assignee: e.target.value || 'all' }))}
            className=""
          />

          <input
            type="text"
            placeholder="Filter by project ID"
            value={filters.project === 'all' ? '' : filters.project}
            onChange={(e) => setFilters(prev => ({ ...prev, project: e.target.value || 'all' }))}
            className=""
          />
        </div>

        <div className="filters-foot">
          <span>Showing {filteredTasks.length} of {tasks.length} tasks</span>
          {(searchTerm || Object.values(filters).some(f => f !== 'all')) && (
            <button
              onClick={() => {
                setSearchTerm('')
                setFilters({ status: 'all', priority: 'all', assignee: 'all', project: 'all' })
              }}
              className="clear"
            >
              Clear filters
            </button>
          )}
        </div>
      </div>

      {/* Tasks Content */}
      {viewMode === 'kanban' ? (
        <div className="content-card" style={{ minHeight: 600 }}>
          <KanbanBoard
            tasks={filteredTasks}
            onTaskUpdate={updateTask}
            onTaskClick={handleTaskClick}
          />
        </div>
      ) : (
        <div className="content-card">
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>
                    Task
                  </th>
                  <th>
                    Status
                  </th>
                  <th>
                    Priority
                  </th>
                  <th>
                    Assignee
                  </th>
                  <th>
                    Due Date
                  </th>
                  <th>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredTasks.map((task) => (
                  <tr key={task._id}>
                    <td>
                      <div>
                        <div style={{ fontWeight: 600, color: '#111827' }}>{task.title}</div>
                        <div style={{ color: '#6b7280' }} className="truncate max-w-xs">
                          {task.description}
                        </div>
                        {task.labels && task.labels.length > 0 && (
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 4 }}>
                            {task.labels.slice(0, 3).map((label, idx) => (
                              <span
                                key={idx}
                                className="inline-block px-2 py-1 text-xs bg-gray-200 text-gray-700 rounded"
                              >
                                {label}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </td>
                    <td>
                      <span className={`status-badge ${
                        task.status === 'todo' ? 'status-gray' :
                        task.status === 'in_progress' ? 'status-blue' :
                        task.status === 'review' ? 'status-purple' :
                        task.status === 'done' ? 'status-green' : 'status-red'
                      }`}>
                        {task.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td>
                      <span className={`status-badge ${
                        task.priority === 'low' ? 'status-green' :
                        task.priority === 'medium' ? 'status-yellow' :
                        task.priority === 'high' ? 'status-orange' : 'status-red'
                      }`}>
                        {task.priority}
                      </span>
                    </td>
                    <td>
                      {task.assigned_to ? (
                        <div className="flex items-center">
                          <User className="h-4 w-4 mr-2" />
                          {task.assigned_to}
                        </div>
                      ) : (
                        <span style={{ color: '#9ca3af' }}>Unassigned</span>
                      )}
                    </td>
                    <td>
                      {task.due_date ? (
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-2" />
                          {format(new Date(task.due_date), 'MMM dd, yyyy')}
                        </div>
                      ) : (
                        <span style={{ color: '#9ca3af' }}>No due date</span>
                      )}
                    </td>
                    <td>
                      <button
                        onClick={() => handleTaskClick(task)}
                        className="clear"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => {
                          if (confirm('Are you sure you want to delete this task?')) {
                            deleteTask(task._id)
                          }
                        }}
                        className="text-red-600"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredTasks.length === 0 && (
            <div className="empty-state">
              <p>No tasks found</p>
              <p className="sub">
                {searchTerm || Object.values(filters).some(f => f !== 'all')
                  ? 'Try adjusting your search or filters'
                  : 'Create your first task to get started'
                }
              </p>
            </div>
          )}
        </div>
      )}

      {/* Task Form */}
      {showForm && (
        <TaskForm
          task={editingTask || undefined}
          projectId="default-project"
          onSubmit={handleTaskSubmit}
          onCancel={() => {
            setShowForm(false)
            setEditingTask(null)
          }}
        />
      )}
    </div>
  )
}

export default Tasks
