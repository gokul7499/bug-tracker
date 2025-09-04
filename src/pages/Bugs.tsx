
import React, { useState, useMemo } from 'react'
import { useBugs } from '../hooks/useBugs'
import { useAuth } from '../hooks/useAuth'
import { useProjects } from '../hooks/useProjects'
import BugForm from '../components/BugForm'
import {Plus, Search, Edit, Trash2, Eye, AlertTriangle, Clock, CheckCircle, XCircle, RefreshCw, Bug as BugIcon} from 'lucide-react'
import toast from 'react-hot-toast'

const BugsPage: React.FC = () => {
  const { bugs, loading, createBug, updateBug, deleteBug } = useBugs()
  const { projects } = useProjects()
  const { user } = useAuth()
  const [showForm, setShowForm] = useState(false)
  const [selectedBug, setSelectedBug] = useState<any>(null)
  const [viewingBug, setViewingBug] = useState<any>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [severityFilter, setSeverityFilter] = useState('all')
  const [projectFilter, setProjectFilter] = useState('all')

  // Safe filter bugs function
  const filteredBugs = useMemo(() => {
    if (!bugs || !Array.isArray(bugs)) return []
    
    return bugs.filter(bug => {
      try {
        const matchesSearch = (bug?.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                             (bug?.description || '').toLowerCase().includes(searchTerm.toLowerCase())
        const matchesStatus = statusFilter === 'all' || bug?.status === statusFilter
        const matchesSeverity = severityFilter === 'all' || bug?.severity === severityFilter
        const matchesProject = projectFilter === 'all' || bug?.project_id === projectFilter
        
        return matchesSearch && matchesStatus && matchesSeverity && matchesProject
      } catch (error) {
        console.error('Error filtering bug:', error)
        return false
      }
    })
  }, [bugs, searchTerm, statusFilter, severityFilter, projectFilter])

  const handleCreateBug = async (bugData: any) => {
    try {
      await createBug({
        ...bugData,
        reporter_id: user?.userId || 'anonymous',
        status: 'new'
      })
      setShowForm(false)
      toast.success('Bug reported successfully!')
    } catch (error) {
      console.error('Error creating bug:', error)
      toast.error('Failed to create bug')
    }
  }

  const handleUpdateBug = async (bugData: any) => {
    if (selectedBug) {
      try {
        await updateBug(selectedBug._id, bugData)
        setSelectedBug(null)
        toast.success('Bug updated successfully!')
      } catch (error) {
        console.error('Error updating bug:', error)
        toast.error('Failed to update bug')
      }
    }
  }

  const handleStatusChange = async (bugId: string, newStatus: 'new' | 'open' | 'in_progress' | 'fixed' | 'verified' | 'closed' | 'reopened') => {
    try {
      await updateBug(bugId, { status: newStatus })
      toast.success(`Bug status changed to ${newStatus}`)
    } catch (error) {
      console.error('Error updating status:', error)
      toast.error('Failed to update bug status')
    }
  }

  const handleDeleteBug = async (bugId: string) => {
    if (window.confirm('Are you sure you want to delete this bug?')) {
      try {
        await deleteBug(bugId)
        toast.success('Bug deleted successfully!')
      } catch (error) {
        console.error('Error deleting bug:', error)
        toast.error('Failed to delete bug')
      }
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'new': return <AlertTriangle className="h-4 w-4 text-red-500" />
      case 'open': return <Clock className="h-4 w-4 text-yellow-500" />
      case 'in_progress': return <RefreshCw className="h-4 w-4 text-blue-500" />
      case 'fixed': return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'verified': return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'closed': return <XCircle className="h-4 w-4 text-gray-500" />
      case 'reopened': return <RefreshCw className="h-4 w-4 text-orange-500" />
      default: return <BugIcon className="h-4 w-4 text-gray-400" />
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'trivial': return 'bg-gray-100 text-gray-800'
      case 'minor': return 'bg-blue-100 text-blue-800'
      case 'major': return 'bg-yellow-100 text-yellow-800'
      case 'critical': return 'bg-orange-100 text-orange-800'
      case 'blocker': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return 'bg-red-100 text-red-800'
      case 'open': return 'bg-yellow-100 text-yellow-800'
      case 'in_progress': return 'bg-blue-100 text-blue-800'
      case 'fixed': return 'bg-green-100 text-green-800'
      case 'verified': return 'bg-green-100 text-green-800'
      case 'closed': return 'bg-gray-100 text-gray-800'
      case 'reopened': return 'bg-orange-100 text-orange-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Bug Tracking</h1>
          <p className="text-gray-600">Manage and track bugs across all projects</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
        >
          <Plus className="h-4 w-4 mr-2" />
          Report Bug
        </button>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <AlertTriangle className="h-8 w-8 text-red-500" />
            </div>
            <div className="ml-4">
              <p className="text-2xl font-semibold text-gray-900">
                {bugs?.filter(b => b?.status === 'new').length || 0}
              </p>
              <p className="text-sm text-gray-500">New Bugs</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Clock className="h-8 w-8 text-yellow-500" />
            </div>
            <div className="ml-4">
              <p className="text-2xl font-semibold text-gray-900">
                {bugs?.filter(b => b?.status === 'open').length || 0}
              </p>
              <p className="text-sm text-gray-500">Open</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <RefreshCw className="h-8 w-8 text-blue-500" />
            </div>
            <div className="ml-4">
              <p className="text-2xl font-semibold text-gray-900">
                {bugs?.filter(b => b?.status === 'in_progress').length || 0}
              </p>
              <p className="text-sm text-gray-500">In Progress</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
            <div className="ml-4">
              <p className="text-2xl font-semibold text-gray-900">
                {bugs?.filter(b => b?.status === 'fixed').length || 0}
              </p>
              <p className="text-sm text-gray-500">Fixed</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <XCircle className="h-8 w-8 text-gray-500" />
            </div>
            <div className="ml-4">
              <p className="text-2xl font-semibold text-gray-900">
                {bugs?.filter(b => b?.status === 'closed').length || 0}
              </p>
              <p className="text-sm text-gray-500">Closed</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search bugs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
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
            <label className="block text-sm font-medium text-gray-700 mb-2">Severity</label>
            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Severity</option>
              <option value="trivial">Trivial</option>
              <option value="minor">Minor</option>
              <option value="major">Major</option>
              <option value="critical">Critical</option>
              <option value="blocker">Blocker</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Project</label>
            <select
              value={projectFilter}
              onChange={(e) => setProjectFilter(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Projects</option>
              {projects?.map((project) => (
                <option key={project._id} value={project._id}>
                  {project.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Bug List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            Bugs ({filteredBugs.length})
          </h2>
        </div>
        
        {filteredBugs.length === 0 ? (
          <div className="text-center py-12">
            <BugIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No bugs found</p>
            <button
              onClick={() => setShowForm(true)}
              className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200"
            >
              <Plus className="h-4 w-4 mr-2" />
              Report First Bug
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Bug ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Title
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Severity
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Priority
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredBugs.map((bug) => (
                  <tr key={bug._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900">
                      #{bug._id?.slice(-6) || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{bug.title || 'No title'}</div>
                      <div className="text-sm text-gray-500 truncate max-w-xs">
                        {bug.description || 'No description'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(bug.status)}
                        <select
                          value={bug.status || 'new'}
                          onChange={(e) => handleStatusChange(bug._id, e.target.value as 'new' | 'open' | 'in_progress' | 'fixed' | 'verified' | 'closed' | 'reopened')}
                          className={`text-xs px-2 py-1 rounded-full border-0 focus:ring-2 focus:ring-blue-500 ${getStatusColor(bug.status)}`}
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
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getSeverityColor(bug.severity)}`}>
                        {bug.severity || 'minor'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        bug.priority === 'urgent' ? 'bg-red-100 text-red-800' :
                        bug.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                        bug.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {bug.priority || 'medium'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => setViewingBug(bug)}
                          className="text-blue-600 hover:text-blue-900"
                          title="View Details"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => setSelectedBug(bug)}
                          className="text-indigo-600 hover:text-indigo-900"
                          title="Edit Bug"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteBug(bug._id)}
                          className="text-red-600 hover:text-red-900"
                          title="Delete Bug"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Bug Form Modal */}
      {(showForm || selectedBug) && (
        <BugForm
          bug={selectedBug}
          projectId={projectFilter !== 'all' ? projectFilter : (projects?.[0]?._id || '')}
          onSubmit={selectedBug ? handleUpdateBug : handleCreateBug}
          onCancel={() => {
            setShowForm(false)
            setSelectedBug(null)
          }}
        />
      )}

      {/* Bug Detail Modal */}
      {viewingBug && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b">
              <h2 className="text-xl font-semibold">Bug Details</h2>
              <button
                onClick={() => setViewingBug(null)}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ×
              </button>
            </div>
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">{viewingBug.title}</h3>
                  <p className="text-gray-600 mt-2">{viewingBug.description}</p>
                </div>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="font-medium">Status:</span>
                    <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(viewingBug.status)}`}>
                      {viewingBug.status}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Severity:</span>
                    <span className={`px-2 py-1 text-xs rounded-full ${getSeverityColor(viewingBug.severity)}`}>
                      {viewingBug.severity}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Priority:</span>
                    <span>{viewingBug.priority}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Assigned To:</span>
                    <span>{viewingBug.assigned_to || 'Unassigned'}</span>
                  </div>
                </div>
              </div>
              
              {viewingBug.steps_to_reproduce && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Steps to Reproduce:</h4>
                  <p className="text-gray-600 whitespace-pre-wrap">{viewingBug.steps_to_reproduce}</p>
                </div>
              )}
              
              {viewingBug.attachments && viewingBug.attachments.length > 0 && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Attachments:</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {viewingBug.attachments.map((attachment: any, index: number) => (
                      <div key={index} className="border rounded-lg p-2">
                        {attachment.url?.match(/\.(jpg|jpeg|png|gif)$/i) ? (
                          <img 
                            src={attachment.url} 
                            alt={attachment.filename}
                            className="w-full h-20 object-cover rounded"
                          />
                        ) : (
                          <div className="w-full h-20 bg-gray-100 rounded flex items-center justify-center">
                            <span className="text-xs text-gray-500">{attachment.filename}</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default BugsPage
