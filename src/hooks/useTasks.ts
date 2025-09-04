
import { useState, useEffect } from 'react'
import { lumi } from '../lib/lumi'
import toast from 'react-hot-toast'

export interface Task {
  _id: string
  title: string
  description: string
  status: 'todo' | 'in_progress' | 'review' | 'done' | 'cancelled'
  priority: 'low' | 'medium' | 'high' | 'critical'
  project_id: string
  assigned_to?: string
  reporter_id: string
  due_date?: string
  estimated_hours?: number
  actual_hours?: number
  task_type: 'feature' | 'bug' | 'improvement' | 'documentation' | 'testing'
  labels: string[]
  attachments: Array<{
    filename: string
    url: string
    uploaded_by: string
    uploaded_at: string
  }>
  created_by: string
  created_at: string
  updated_at: string
}

export const useTasks = (projectId?: string) => {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(false)

  const fetchTasks = async () => {
    setLoading(true)
    try {
      const filter = projectId ? { project_id: projectId } : {}
      const response = await lumi.entities.tasks.list({
        filter,
        sort: { created_at: -1 }
      })
      setTasks(response.list || [])
    } catch (error) {
      console.error('Failed to fetch tasks:', error)
      toast.error('Failed to load tasks')
    } finally {
      setLoading(false)
    }
  }

  const createTask = async (taskData: Omit<Task, '_id' | 'created_at' | 'updated_at'>) => {
    try {
      const now = new Date().toISOString()
      const newTask = await lumi.entities.tasks.create({
        ...taskData,
        created_at: now,
        updated_at: now
      })
      setTasks(prev => [newTask, ...prev])
      toast.success('Task created successfully')
      return newTask
    } catch (error) {
      console.error('Failed to create task:', error)
      toast.error('Failed to create task')
      throw error
    }
  }

  const updateTask = async (taskId: string, updates: Partial<Task>) => {
    try {
      const updatedTask = await lumi.entities.tasks.update(taskId, {
        ...updates,
        updated_at: new Date().toISOString()
      })
      setTasks(prev => prev.map(t => t._id === taskId ? updatedTask : t))
      toast.success('Task updated successfully')
      return updatedTask
    } catch (error) {
      console.error('Failed to update task:', error)
      toast.error('Failed to update task')
      throw error
    }
  }

  const deleteTask = async (taskId: string) => {
    try {
      await lumi.entities.tasks.delete(taskId)
      setTasks(prev => prev.filter(t => t._id !== taskId))
      toast.success('Task deleted successfully')
    } catch (error) {
      console.error('Failed to delete task:', error)
      toast.error('Failed to delete task')
      throw error
    }
  }

  const uploadTaskAttachment = async (taskId: string, files: File[]) => {
    try {
      const uploadResults = await lumi.tools.file.upload(files)
      const attachments = uploadResults
        .filter(result => result.fileUrl && !result.uploadError)
        .map(result => ({
          filename: result.fileName,
          url: result.fileUrl!,
          uploaded_by: 'current_user',
          uploaded_at: new Date().toISOString()
        }))

      if (attachments.length > 0) {
        const task = tasks.find(t => t._id === taskId)
        if (task) {
          const updatedAttachments = [...(task.attachments || []), ...attachments]
          await updateTask(taskId, { attachments: updatedAttachments })
        }
      }

      const failedUploads = uploadResults.filter(result => result.uploadError)
      if (failedUploads.length > 0) {
        toast.error(`Failed to upload ${failedUploads.length} file(s)`)
      }

      return attachments
    } catch (error) {
      console.error('Failed to upload attachments:', error)
      toast.error('Failed to upload attachments')
      throw error
    }
  }

  useEffect(() => {
    fetchTasks()
  }, [projectId])

  return {
    tasks,
    loading,
    fetchTasks,
    createTask,
    updateTask,
    deleteTask,
    uploadTaskAttachment
  }
}
