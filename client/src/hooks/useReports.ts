import { useState, useCallback } from 'react'

interface Report {
  id: string
  title: string
  content: string
  type: 'note' | 'report' | 'comment' | 'review'
  status: 'draft' | 'published' | 'archived'
  projectId: string
  project: {
    id: string
    name: string
    color: string
  }
  author: {
    id: string
    name: string
    email: string
  }
  tags: string[]
  createdAt: string
  updatedAt: string
}

interface CreateReportData {
  title: string
  content: string
  type?: Report['type']
  status?: Report['status']
  projectId: string
  tags?: string[]
}

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api'

export const useReports = () => {
  const [reports, setReports] = useState<Report[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchReports = useCallback(async (projectId: string = 'all', filters?: {
    type?: string
    status?: string
  }) => {
    setIsLoading(true)
    setError(null)
    
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        throw new Error('No authentication token found')
      }

      const params = new URLSearchParams()
      if (projectId !== 'all') params.append('projectId', projectId)
      if (filters?.type) params.append('type', filters.type)
      if (filters?.status) params.append('status', filters.status)

      const response = await fetch(`${API_URL}/reports?${params.toString()}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      
      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Unauthorized - Please login again')
        }
        throw new Error('Failed to fetch reports')
      }

      const data = await response.json()
      setReports(data.reports || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
      console.error('Error fetching reports:', err)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const createReport = useCallback(async (data: CreateReportData) => {
    setIsLoading(true)
    setError(null)
    
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        throw new Error('No authentication token found')
      }

      const response = await fetch(`${API_URL}/reports`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create report')
      }

      const result = await response.json()
      
      // Thêm report mới vào state
      setReports(prev => [result.report, ...prev])
      
      return result.report
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
      console.error('Error creating report:', err)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [])

  const updateReport = useCallback(async (id: string, data: Partial<CreateReportData>) => {
    setIsLoading(true)
    setError(null)
    
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        throw new Error('No authentication token found')
      }

      const response = await fetch(`${API_URL}/reports/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to update report')
      }

      const result = await response.json()
      
      // Cập nhật report trong state
      setReports(prev => prev.map(report => 
        report.id === id ? result.report : report
      ))
      
      return result.report
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
      console.error('Error updating report:', err)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [])

  const deleteReport = useCallback(async (id: string) => {
    setIsLoading(true)
    setError(null)
    
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        throw new Error('No authentication token found')
      }

      const response = await fetch(`${API_URL}/reports/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to delete report')
      }

      // Xóa report khỏi state
      setReports(prev => prev.filter(report => report.id !== id))
      
      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
      console.error('Error deleting report:', err)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [])

  return {
    reports,
    isLoading,
    error,
    fetchReports,
    createReport,
    updateReport,
    deleteReport
  }
}
