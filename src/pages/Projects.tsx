
import React, { useState } from 'react'
import { useProjects, type Project } from '../hooks/useProjects'
import { useAuth } from '../hooks/useAuth'
import {Plus, Edit, Trash2, Users, Calendar, TrendingUp, Filter} from 'lucide-react'
import { format } from 'date-fns'
import { useForm } from 'react-hook-form'
import './Projects.css'

interface ProjectFormData {
  name: string
  description: string
  status: Project['status']
  priority: Project['priority']
  start_date: string
  end_date: string
  budget: number
  team_members: string
}

const Projects: React.FC = () => {
  const { user } = useAuth()
  const { projects, loading, createProject, updateProject, deleteProject } = useProjects()
  const [showForm, setShowForm] = useState(false)
  const [editingProject, setEditingProject] = useState<Project | null>(null)
  const [filter, setFilter] = useState<'all' | 'active' | 'planning' | 'completed'>('all')

  const { register, handleSubmit, reset, formState: { errors } } = useForm<ProjectFormData>()

  const filteredProjects = projects.filter(project => {
    if (filter === 'all') return true
    return project.status === filter
  })

  const handleCreateProject = async (data: ProjectFormData) => {
    try {
      await createProject({
        ...data,
        project_manager_id: user?.userId || '',
        team_members: data.team_members.split(',').map(id => id.trim()).filter(Boolean),
        start_date: new Date(data.start_date).toISOString(),
        end_date: new Date(data.end_date).toISOString(),
        progress: 0,
        created_by: user?.userId || ''
      })
      setShowForm(false)
      reset()
    } catch (error) {
      console.error('Failed to create project:', error)
    }
  }

  const handleUpdateProject = async (data: ProjectFormData) => {
    if (!editingProject) return
    
    try {
      await updateProject(editingProject._id, {
        ...data,
        team_members: data.team_members.split(',').map(id => id.trim()).filter(Boolean),
        start_date: new Date(data.start_date).toISOString(),
        end_date: new Date(data.end_date).toISOString()
      })
      setEditingProject(null)
      setShowForm(false)
      reset()
    } catch (error) {
      console.error('Failed to update project:', error)
    }
  }

  const handleEdit = (project: Project) => {
    setEditingProject(project)
    reset({
      name: project.name,
      description: project.description,
      status: project.status,
      priority: project.priority,
      start_date: project.start_date.split('T')[0],
      end_date: project.end_date.split('T')[0],
      budget: project.budget,
      team_members: project.team_members?.join(', ') || ''
    })
    setShowForm(true)
  }

  const handleDelete = async (projectId: string) => {
    if (confirm('Are you sure you want to delete this project?')) {
      await deleteProject(projectId)
    }
  }

  const getStatusColor = (status: Project['status']) => {
    switch (status) {
      case 'planning': return 'bg-yellow-100 text-yellow-800'
      case 'active': return 'bg-green-100 text-green-800'
      case 'on_hold': return 'bg-orange-100 text-orange-800'
      case 'completed': return 'bg-blue-100 text-blue-800'
      case 'cancelled': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getPriorityColor = (priority: Project['priority']) => {
    switch (priority) {
      case 'low': return 'bg-green-100 text-green-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      case 'high': return 'bg-orange-100 text-orange-800'
      case 'critical': return 'bg-red-100 text-red-800'
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
    <div className="projects-page">
      {/* Header */}
      <div className="projects-header">
        <div>
          <h1 className="projects-title">Projects</h1>
          <p className="projects-subtitle">Manage your projects and track progress</p>
        </div>
        <button
          onClick={() => {
            setEditingProject(null)
            reset()
            setShowForm(true)
          }}
          className="btn-primary"
        >
          <Plus className="h-5 w-5 mr-2" />
          New Project
        </button>
      </div>

      {/* Filters */}
      <div className="projects-filters">
        <Filter className="h-5 w-5 text-gray-500" />
        <div className="chip-group">
          {(['all', 'active', 'planning', 'completed'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`chip ${filter === status ? 'active' : ''}`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Projects Grid */}
      <div className="projects-grid">
        {filteredProjects.map((project) => (
          <div key={project._id} className="project-card">
            <div className="flex justify-between items-start" style={{ marginBottom: 12 }}>
              <h3>
                {project.name}
              </h3>
              <div className="card-actions">
                <button
                  onClick={() => handleEdit(project)}
                  className="icon-btn edit"
                >
                  <Edit className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleDelete(project._id)}
                  className="icon-btn delete"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>

            <p className="project-desc">
              {project.description}
            </p>

            <div className="flex-1" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {/* Status and Priority */}
              <div className="flex items-center justify-between">
                <span className={`badge ${
                  project.status === 'planning' ? 'yellow' :
                  project.status === 'active' ? 'green' :
                  project.status === 'completed' ? 'blue' : 'orange'
                }`}>
                  {project.status.replace('_', ' ')}
                </span>
                <span className={`badge ${
                  project.priority === 'low' ? 'green' :
                  project.priority === 'medium' ? 'yellow' :
                  project.priority === 'high' ? 'orange' : 'red'
                }`}>
                  {project.priority}
                </span>
              </div>

              {/* Progress */}
              <div>
                <div className="progress-row">
                  <span>Progress</span>
                  <span>{project.progress}%</span>
                </div>
                <div className="progress-track"><div className="progress-bar" style={{ width: `${project.progress}%` }} /></div>
              </div>

              {/* Team and Dates */}
              <div className="meta">
                <div className="flex items-center">
                  <Users className="h-4 w-4 mr-2" />
                  <span>{project.team_members?.length || 0} members</span>
                </div>
                
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-2" />
                  <span>
                    {format(new Date(project.start_date), 'MMM dd')} - {format(new Date(project.end_date), 'MMM dd, yyyy')}
                  </span>
                </div>

                {project.budget && (
                  <div className="flex items-center">
                    <TrendingUp className="h-4 w-4 mr-2" />
                    <span>${project.budget.toLocaleString()}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredProjects.length === 0 && (
        <div className="empty-state">
          <p>No projects found</p>
          <p className="sub">Create your first project to get started</p>
        </div>
      )}

      {/* Project Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b">
              <h2 className="text-xl font-semibold">
                {editingProject ? 'Edit Project' : 'Create New Project'}
              </h2>
              <button
                onClick={() => {
                  setShowForm(false)
                  setEditingProject(null)
                  reset()
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>

            <form
              onSubmit={handleSubmit(editingProject ? handleUpdateProject : handleCreateProject)}
              className="p-6 space-y-6"
            >
              {/* Project Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Project Name *
                </label>
                <input
                  {...register('name', { required: 'Project name is required' })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter project name"
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
                )}
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description *
                </label>
                <textarea
                  {...register('description', { required: 'Description is required' })}
                  rows={4}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Describe the project"
                />
                {errors.description && (
                  <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
                )}
              </div>

              {/* Status and Priority */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <select
                    {...register('status')}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="planning">Planning</option>
                    <option value="active">Active</option>
                    <option value="on_hold">On Hold</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Priority
                  </label>
                  <select
                    {...register('priority')}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>
              </div>

              {/* Start and End Dates */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Start Date *
                  </label>
                  <input
                    {...register('start_date', { required: 'Start date is required' })}
                    type="date"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  {errors.start_date && (
                    <p className="mt-1 text-sm text-red-600">{errors.start_date.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    End Date *
                  </label>
                  <input
                    {...register('end_date', { required: 'End date is required' })}
                    type="date"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  {errors.end_date && (
                    <p className="mt-1 text-sm text-red-600">{errors.end_date.message}</p>
                  )}
                </div>
              </div>

              {/* Budget */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Budget
                </label>
                <input
                  {...register('budget', { min: { value: 0, message: 'Budget must be positive' } })}
                  type="number"
                  min="0"
                  step="1000"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Project budget in USD"
                />
                {errors.budget && (
                  <p className="mt-1 text-sm text-red-600">{errors.budget.message}</p>
                )}
              </div>

              {/* Team Members */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Team Members
                </label>
                <input
                  {...register('team_members')}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter user IDs separated by commas"
                />
                <p className="mt-1 text-sm text-gray-500">
                  Separate multiple user IDs with commas
                </p>
              </div>

              {/* Form Actions */}
              <div className="flex justify-end space-x-3 pt-6 border-t">
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false)
                    setEditingProject(null)
                    reset()
                  }}
                  className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                >
                  {editingProject ? 'Update Project' : 'Create Project'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default Projects
