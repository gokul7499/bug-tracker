
import { useState, useEffect } from 'react'
import { lumi } from '../lib/lumi'
import toast from 'react-hot-toast'

export interface Notification {
  _id: string
  title: string
  message: string
  type: 'task_assigned' | 'bug_reported' | 'comment_added' | 'status_changed' | 'deadline_reminder' | 'mention'
  recipient_id: string
  sender_id?: string
  entity_type?: 'task' | 'bug' | 'project' | 'comment'
  entity_id?: string
  action_url?: string
  is_read: boolean
  read_at?: string
  created_at: string
}

export const useNotifications = (userId?: string) => {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(false)

  const fetchNotifications = async () => {
    if (!userId) return
    
    setLoading(true)
    try {
      const response = await lumi.entities.notifications.list({
        filter: { recipient_id: userId },
        sort: { created_at: -1 }
      })
      const notificationList = response.list || []
      setNotifications(notificationList)
      setUnreadCount(notificationList.filter(n => !n.is_read).length)
    } catch (error) {
      console.error('Failed to fetch notifications:', error)
      toast.error('Failed to load notifications')
    } finally {
      setLoading(false)
    }
  }

  const markAsRead = async (notificationId: string) => {
    try {
      await lumi.entities.notifications.update(notificationId, {
        is_read: true,
        read_at: new Date().toISOString()
      })
      setNotifications(prev => 
        prev.map(n => 
          n._id === notificationId 
            ? { ...n, is_read: true, read_at: new Date().toISOString() }
            : n
        )
      )
      setUnreadCount(prev => Math.max(0, prev - 1))
    } catch (error) {
      console.error('Failed to mark notification as read:', error)
    }
  }

  const markAllAsRead = async () => {
    if (!userId) return
    
    try {
      const unreadNotifications = notifications.filter(n => !n.is_read)
      const updatePromises = unreadNotifications.map(n => 
        lumi.entities.notifications.update(n._id, {
          is_read: true,
          read_at: new Date().toISOString()
        })
      )
      await Promise.all(updatePromises)
      
      setNotifications(prev => 
        prev.map(n => ({ ...n, is_read: true, read_at: new Date().toISOString() }))
      )
      setUnreadCount(0)
      toast.success('All notifications marked as read')
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error)
      toast.error('Failed to update notifications')
    }
  }

  const createNotification = async (notificationData: Omit<Notification, '_id' | 'created_at'>) => {
    try {
      const newNotification = await lumi.entities.notifications.create({
        ...notificationData,
        created_at: new Date().toISOString()
      })
      
      // Send email notification if recipient is registered
      if (notificationData.recipient_id) {
        try {
          await lumi.tools.email.send({
            to: notificationData.recipient_id,
            subject: notificationData.title,
            html: `
              <h2>${notificationData.title}</h2>
              <p>${notificationData.message}</p>
              ${notificationData.action_url ? `<p><a href="${notificationData.action_url}">View Details</a></p>` : ''}
            `,
            fromName: 'Bug Tracking System'
          })
        } catch (emailError) {
          console.warn('Failed to send email notification:', emailError)
          // Don't fail the notification creation if email fails
        }
      }
      
      return newNotification
    } catch (error) {
      console.error('Failed to create notification:', error)
      throw error
    }
  }

  const deleteNotification = async (notificationId: string) => {
    try {
      await lumi.entities.notifications.delete(notificationId)
      setNotifications(prev => prev.filter(n => n._id !== notificationId))
      setUnreadCount(prev => {
        const notification = notifications.find(n => n._id === notificationId)
        return notification && !notification.is_read ? Math.max(0, prev - 1) : prev
      })
    } catch (error) {
      console.error('Failed to delete notification:', error)
      toast.error('Failed to delete notification')
    }
  }

  useEffect(() => {
    fetchNotifications()
  }, [userId])

  return {
    notifications,
    unreadCount,
    loading,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    createNotification,
    deleteNotification
  }
}
