
import { useState, useEffect } from 'react'
import { lumi } from '../lib/lumi'
import toast from 'react-hot-toast'

export interface Project {
  _id: string
  name: string
  description: string
  status: 'planning' | 'active' | 'on_hold' | 'completed' | 'cancelled'
  project_manager_id: string
  team_members: string[]
  start_date: string
  end_date: string
  priority: 'low' | 'medium' | 'high' | 'critical'
  budget: number
  progress: number
  created_by: string
  created_at: string
  updated_at: string
}

export const useProjects = () => {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(false)

  const fetchProjects = async () => {
    setLoading(true)
    try {
      const response = await lumi.entities.projects.list({
        sort: { created_at: -1 }
      })
      setProjects(response.list || [])
    } catch (error) {
      console.error('Failed to fetch projects:', error)
      toast.error('Failed to load projects')
    } finally {
      setLoading(false)
    }
  }

  const createProject = async (projectData: Omit<Project, '_id' | 'created_at' | 'updated_at'>) => {
    try {
      const now = new Date().toISOString()
      const newProject = await lumi.entities.projects.create({
        ...projectData,
        created_at: now,
        updated_at: now
      })
      setProjects(prev => [newProject, ...prev])
      toast.success('Project created successfully')
      return newProject
    } catch (error) {
      console.error('Failed to create project:', error)
      toast.error('Failed to create project')
      throw error
    }
  }

  const updateProject = async (projectId: string, updates: Partial<Project>) => {
    try {
      const updatedProject = await lumi.entities.projects.update(projectId, {
        ...updates,
        updated_at: new Date().toISOString()
      })
      setProjects(prev => prev.map(p => p._id === projectId ? updatedProject : p))
      toast.success('Project updated successfully')
      return updatedProject
    } catch (error) {
      console.error('Failed to update project:', error)
      toast.error('Failed to update project')
      throw error
    }
  }

  const deleteProject = async (projectId: string) => {
    try {
      await lumi.entities.projects.delete(projectId)
      setProjects(prev => prev.filter(p => p._id !== projectId))
      toast.success('Project deleted successfully')
    } catch (error) {
      console.error('Failed to delete project:', error)
      toast.error('Failed to delete project')
      throw error
    }
  }

  useEffect(() => {
    fetchProjects()
  }, [])

  return {
    projects,
    loading,
    fetchProjects,
    createProject,
    updateProject,
    deleteProject
  }
}
