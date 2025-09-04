
import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Bug } from '../hooks/useBugs'
import {X, Upload, Trash2} from 'lucide-react'
import { lumi } from '../lib/lumi'
import toast from 'react-hot-toast'

interface BugFormProps {
  bug?: Bug
  projectId: string
  onSubmit: (data: Partial<Bug>) => void
  onCancel: () => void
}

interface BugFormData {
  title: string
  description: string
  severity: Bug['severity']
  priority: Bug['priority']
  status: Bug['status']
  assigned_to: string
  steps_to_reproduce: string
  expected_result: string
  actual_result: string
  environment: string
  version: string
  fixed_in_version: string
}

const BugForm: React.FC<BugFormProps> = ({ bug, projectId, onSubmit, onCancel }) => {
  const [attachments, setAttachments] = useState<Bug['attachments']>(bug?.attachments || [])
  const [uploading, setUploading] = useState(false)
  
  const { register, handleSubmit, formState: { errors } } = useForm<BugFormData>({
    defaultValues: {
      title: bug?.title || '',
      description: bug?.description || '',
      severity: bug?.severity || 'minor',
      priority: bug?.priority || 'medium',
      status: bug?.status || 'new',
      assigned_to: bug?.assigned_to || '',
      steps_to_reproduce: bug?.steps_to_reproduce || '',
      expected_result: bug?.expected_result || '',
      actual_result: bug?.actual_result || '',
      environment: bug?.environment || '',
      version: bug?.version || '',
      fixed_in_version: bug?.fixed_in_version || ''
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

  const onFormSubmit = (data: BugFormData) => {
    const formattedData: Partial<Bug> = {
      ...data,
      project_id: projectId,
      attachments
    }

    onSubmit(formattedData)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-semibold">
            {bug ? 'Edit Bug' : 'Report New Bug'}
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
              Bug Title *
            </label>
            <input
              {...register('title', { 
                required: 'Title is required', 
                minLength: { value: 5, message: 'Title must be at least 5 characters' } 
              })}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Brief description of the bug"
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
              placeholder="Detailed description of the bug"
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
            )}
          </div>

          {/* Severity and Priority */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Severity *
              </label>
              <select
                {...register('severity', { required: 'Severity is required' })}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="trivial">Trivial</option>
                <option value="minor">Minor</option>
                <option value="major">Major</option>
                <option value="critical">Critical</option>
                <option value="blocker">Blocker</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Priority *
              </label>
              <select
                {...register('priority', { required: 'Priority is required' })}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
          </div>

          {/* Status and Assigned To */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                {...register('status')}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="new">New</option>
                <option value="open">Open</option>
                <option value="in_progress">In Progress</option>
                <option value="fixed">Fixed</option>
                <option value="verified">Verified</option>
                <option value="closed">Closed</option>
                <option value="reopened">Reopened</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Assigned To
              </label>
              <input
                {...register('assigned_to')}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Developer user ID or email"
              />
            </div>
          </div>

          {/* Steps to Reproduce */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Steps to Reproduce
            </label>
            <textarea
              {...register('steps_to_reproduce')}
              rows={4}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="1. Go to...&#10;2. Click on...&#10;3. Observe..."
            />
          </div>

          {/* Expected vs Actual Results */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Expected Result
              </label>
              <textarea
                {...register('expected_result')}
                rows={3}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="What should happen"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Actual Result
              </label>
              <textarea
                {...register('actual_result')}
                rows={3}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="What actually happens"
              />
            </div>
          </div>

          {/* Environment and Version */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Environment
              </label>
              <input
                {...register('environment')}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="OS, Browser, Device (e.g., Windows 11, Chrome 120)"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Version
              </label>
              <input
                {...register('version')}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Application version (e.g., v2.1.3)"
              />
            </div>
          </div>

          {/* Fixed in Version (for developers) */}
          {bug && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fixed in Version
              </label>
              <input
                {...register('fixed_in_version')}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Version where bug was fixed"
              />
            </div>
          )}

          {/* File Attachments */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Attachments (Screenshots, Logs, etc.)
            </label>
            
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
              <input
                type="file"
                multiple
                accept="image/*,.txt,.log,.pdf,.doc,.docx"
                onChange={handleFileUpload}
                className="hidden"
                id="bug-file-upload"
                disabled={uploading}
              />
              <label
                htmlFor="bug-file-upload"
                className="cursor-pointer flex flex-col items-center justify-center"
              >
                <Upload className="h-8 w-8 text-gray-400 mb-2" />
                <span className="text-sm text-gray-600">
                  {uploading ? 'Uploading...' : 'Click to upload screenshots, logs, or other files'}
                </span>
                <span className="text-xs text-gray-500 mt-1">
                  Supported: Images, PDF, DOC, TXT, LOG files
                </span>
              </label>
            </div>

            {/* Attachment List */}
            {attachments.length > 0 && (
              <div className="mt-4 space-y-2">
                <h4 className="text-sm font-medium text-gray-700">Uploaded Files:</h4>
                {attachments.map((attachment, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-700 truncate">{attachment.filename}</span>
                      {attachment.url?.match(/\.(jpg|jpeg|png|gif)$/i) && (
                        <img 
                          src={attachment.url} 
                          alt={attachment.filename}
                          className="h-8 w-8 object-cover rounded"
                        />
                      )}
                    </div>
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
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {uploading ? 'Uploading...' : bug ? 'Update Bug' : 'Report Bug'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default BugForm
