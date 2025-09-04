
import { useState, useEffect } from 'react'
import { lumi } from '../lib/lumi'
import toast from 'react-hot-toast'

export interface Bug {
  _id: string
  title: string
  description: string
  severity: 'trivial' | 'minor' | 'major' | 'critical' | 'blocker'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  status: 'new' | 'open' | 'in_progress' | 'fixed' | 'verified' | 'closed' | 'reopened'
  project_id: string
  reporter_id: string
  assigned_to?: string
  steps_to_reproduce?: string
  expected_result?: string
  actual_result?: string
  environment?: string
  version?: string
  attachments: Array<{
    filename: string
    url: string
    uploaded_by: string
    uploaded_at: string
  }>
  fixed_in_version?: string
  verified_by?: string
  verified_at?: string
  created_at: string
  updated_at: string
}

export const useBugs = (projectId?: string) => {
  const [bugs, setBugs] = useState<Bug[]>([])
  const [loading, setLoading] = useState(false)

  const fetchBugs = async () => {
    setLoading(true)
    try {
      const filter = projectId ? { project_id: projectId } : {}
      const response = await lumi.entities.bugs.list({
        filter,
        sort: { created_at: -1 }
      })
      setBugs(response.list || [])
    } catch (error) {
      console.error('Failed to fetch bugs:', error)
      toast.error('Failed to load bugs')
    } finally {
      setLoading(false)
    }
  }

  const createBug = async (bugData: Omit<Bug, '_id' | 'created_at' | 'updated_at'>) => {
    try {
      const now = new Date().toISOString()
      const newBug = await lumi.entities.bugs.create({
        ...bugData,
        created_at: now,
        updated_at: now
      })
      setBugs(prev => [newBug, ...prev])
      toast.success('Bug reported successfully')
      return newBug
    } catch (error) {
      console.error('Failed to create bug:', error)
      toast.error('Failed to report bug')
      throw error
    }
  }

  const updateBug = async (bugId: string, updates: Partial<Bug>) => {
    try {
      const updatedBug = await lumi.entities.bugs.update(bugId, {
        ...updates,
        updated_at: new Date().toISOString()
      })
      setBugs(prev => prev.map(b => b._id === bugId ? updatedBug : b))
      toast.success('Bug updated successfully')
      return updatedBug
    } catch (error) {
      console.error('Failed to update bug:', error)
      toast.error('Failed to update bug')
      throw error
    }
  }

  const deleteBug = async (bugId: string) => {
    try {
      await lumi.entities.bugs.delete(bugId)
      setBugs(prev => prev.filter(b => b._id !== bugId))
      toast.success('Bug deleted successfully')
    } catch (error) {
      console.error('Failed to delete bug:', error)
      toast.error('Failed to delete bug')
      throw error
    }
  }

  const uploadBugAttachment = async (bugId: string, files: File[]) => {
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
        const bug = bugs.find(b => b._id === bugId)
        if (bug) {
          const updatedAttachments = [...(bug.attachments || []), ...attachments]
          await updateBug(bugId, { attachments: updatedAttachments })
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

  const verifyBugFix = async (bugId: string, verifiedBy: string) => {
    try {
      await updateBug(bugId, {
        status: 'verified',
        verified_by: verifiedBy,
        verified_at: new Date().toISOString()
      })
      toast.success('Bug fix verified successfully')
    } catch (error) {
      console.error('Failed to verify bug fix:', error)
      toast.error('Failed to verify bug fix')
      throw error
    }
  }

  useEffect(() => {
    fetchBugs()
  }, [projectId])

  return {
    bugs,
    loading,
    fetchBugs,
    createBug,
    updateBug,
    deleteBug,
    uploadBugAttachment,
    verifyBugFix
  }
}
