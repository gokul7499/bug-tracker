
import React, { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { Task } from '../hooks/useTasks'
import {X, Upload, Trash2} from 'lucide-react'
import { lumi } from '../lib/lumi'
import toast from 'react-hot-toast'

interface TaskFormProps {
  task?: Task
  projectId: string
  onSubmit: (data: Partial<Task>) => void
  onCancel: () => void
}

interface TaskFormData {
  title: string
  description: string
  status: Task['status']
  priority: Task['priority']
  assigned_to: string
  due_date: string
  estimated_hours: number
  task_type: Task['task_type']
  labels: string
}

const TaskForm: React.FC<TaskFormProps> = ({ task, projectId, onSubmit, onCancel }) => {
  const [attachments, setAttachments] = useState<Task['attachments']>(task?.attachments || [])
  const [uploading, setUploading] = useState(false)
  
  const { register, handleSubmit, formState: { errors }, reset } = useForm<TaskFormData>({
    defaultValues: {
      title: task?.title || '',
      description: task?.description || '',
      status: task?.status || 'todo',
      priority: task?.priority || 'medium',
      assigned_to: task?.assigned_to || '',
      due_date: task?.due_date ? task.due_date.split('T')[0] : '',
      estimated_hours: task?.estimated_hours || 0,
      task_type: task?.task_type || 'feature',
      labels: task?.labels?.join(', ') || ''
    }
  })

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files || files.length === 0) return

    setUploading(true)
    try {
      const uploadResults = await lumi.tools.file.upload(Array.from(files))
      const newAttachments = uploadResults
        .filter(result => result.fileUrl && !result.uploadError)
        .map(result => ({
          filename: result.fileName,
          url: result.fileUrl!,
          uploaded_by: 'current_user',
          uploaded_at: new Date().toISOString()
        }))

      setAttachments(prev => [...prev, ...newAttachments])
      
      const failedUploads = uploadResults.filter(result => result.uploadError)
      if (failedUploads.length > 0) {
        toast.error(`Failed to upload ${failedUploads.length} file(s)`)
      } else {
        toast.success(`Uploaded ${newAttachments.length} file(s)`)
      }
    } catch (error) {
      console.error('Upload failed:', error)
      toast.error('Failed to upload files')
    } finally {
      setUploading(false)
    }
  }

  const removeAttachment = async (index: number) => {
    const attachment = attachments[index]
    try {
      await lumi.tools.file.delete([attachment.url])
      setAttachments(prev => prev.filter((_, i) => i !== index))
      toast.success('Attachment removed')
    } catch (error) {
      console.error('Failed to remove attachment:', error)
      toast.error('Failed to remove attachment')
    }
  }

  const onFormSubmit = (data: TaskFormData) => {
    const formattedData: Partial<Task> = {
      ...data,
      project_id: projectId,
      due_date: data.due_date ? new Date(data.due_date).toISOString() : undefined,
      labels: data.labels.split(',').map(label => label.trim()).filter(Boolean),
      attachments
    }

    onSubmit(formattedData)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-semibold">
            {task ? 'Edit Task' : 'Create New Task'}
          </h2>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onFormSubmit)} className="p-6 space-y-6">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Title *
            </label>
            <input
              {...register('title', { required: 'Title is required', minLength: { value: 3, message: 'Title must be at least 3 characters' } })}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter task title"
            />
            {errors.title && (
              <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
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
              placeholder="Describe the task in detail"
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
                <option value="todo">To Do</option>
                <option value="in_progress">In Progress</option>
                <option value="review">Review</option>
                <option value="done">Done</option>
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

          {/* Task Type and Assigned To */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Task Type
              </label>
              <select
                {...register('task_type')}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="feature">Feature</option>
                <option value="bug">Bug</option>
                <option value="improvement">Improvement</option>
                <option value="documentation">Documentation</option>
                <option value="testing">Testing</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Assigned To
              </label>
              <input
                {...register('assigned_to')}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="User ID or email"
              />
            </div>
          </div>

          {/* Due Date and Estimated Hours */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Due Date
              </label>
              <input
                {...register('due_date')}
                type="date"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Estimated Hours
              </label>
              <input
                {...register('estimated_hours', { min: { value: 0, message: 'Hours must be positive' } })}
                type="number"
                step="0.5"
                min="0"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="0"
              />
              {errors.estimated_hours && (
                <p className="mt-1 text-sm text-red-600">{errors.estimated_hours.message}</p>
              )}
            </div>
          </div>

          {/* Labels */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Labels
            </label>
            <input
              {...register('labels')}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter labels separated by commas (e.g., frontend, urgent, api)"
            />
            <p className="mt-1 text-sm text-gray-500">Separate multiple labels with commas</p>
          </div>

          {/* File Attachments */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Attachments
            </label>
            
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
              <input
                type="file"
                multiple
                onChange={handleFileUpload}
                className="hidden"
                id="file-upload"
                disabled={uploading}
              />
              <label
                htmlFor="file-upload"
                className="cursor-pointer flex flex-col items-center justify-center"
              >
                <Upload className="h-8 w-8 text-gray-400 mb-2" />
                <span className="text-sm text-gray-600">
                  {uploading ? 'Uploading...' : 'Click to upload files or drag and drop'}
                </span>
              </label>
            </div>

            {/* Attachment List */}
            {attachments.length > 0 && (
              <div className="mt-4 space-y-2">
                <h4 className="text-sm font-medium text-gray-700">Uploaded Files:</h4>
                {attachments.map((attachment, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <span className="text-sm text-gray-700 truncate">{attachment.filename}</span>
                    <button
                      type="button"
                      onClick={() => removeAttachment(index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-3 pt-6 border-t">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={uploading}
              className="btn-primary disabled:opacity-50"
            >
              {uploading ? 'Uploading...' : task ? 'Update Task' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default TaskForm
