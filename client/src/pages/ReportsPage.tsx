import { useState, useEffect, useCallback } from 'react'
import { useProjects } from '../hooks/useProjects'
import { useReports } from '../hooks/useReports'
import { 
  DocumentTextIcon,
  PencilIcon,
  TrashIcon,
  CalendarIcon,
  UserCircleIcon,
  PlusIcon,
  TagIcon
} from '@heroicons/react/24/outline'

interface ReportData {
  title: string
  content: string
  type: 'note' | 'report' | 'comment' | 'review'
  projectId: string
  tags: string[]
}

interface EditingReport {
  id: string
  title: string
  content: string
  type: 'note' | 'report' | 'comment' | 'review'
  projectId: string
  tags: string[]
}

const ReportsPage = () => {
  const { projects, isLoading: projectsLoading } = useProjects()
  const { 
    reports, 
    isLoading: reportsLoading, 
    fetchReports, 
    createReport,
    updateReport,
    deleteReport 
  } = useReports()
  
  const [selectedProject, setSelectedProject] = useState<string>('all')
  const [showNewReportModal, setShowNewReportModal] = useState(false)
  const [editingReport, setEditingReport] = useState<EditingReport | null>(null)
  
  // Khởi tạo reportData với projectId rỗng, để user tự chọn
  const [reportData, setReportData] = useState<ReportData>({
    title: '',
    content: '',
    type: 'note',
    projectId: '', // Bắt đầu với rỗng
    tags: []
  })
  
  const [tagInput, setTagInput] = useState('')

  // Chỉ fetch reports khi selected project thay đổi
  useEffect(() => {
    if (!projectsLoading && projects.length > 0) {
      fetchReports(selectedProject)
    }
  }, [selectedProject, projects, projectsLoading, fetchReports])

  const handleCreateReport = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!reportData.title.trim() || !reportData.content.trim()) {
      alert('Please fill in title and content')
      return
    }

    if (!reportData.projectId || reportData.projectId === 'all') {
      alert('Please select a project')
      return
    }

    try {
      await createReport({
        ...reportData,
        status: 'published'
      })
      
      setShowNewReportModal(false)
      resetReportData()
      alert('Report created successfully!')
    } catch (error) {
      console.error('Failed to create report:', error)
      alert('Failed to create report. Please try again.')
    }
  }

  const handleUpdateReport = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingReport) return

    try {
      await updateReport(editingReport.id, reportData)
      setEditingReport(null)
      setShowNewReportModal(false)
      resetReportData()
      alert('Report updated successfully!')
    } catch (error) {
      console.error('Failed to update report:', error)
      alert('Failed to update report')
    }
  }

  const handleDeleteReport = async (reportId: string) => {
    if (!window.confirm('Are you sure you want to delete this report?')) return

    try {
      await deleteReport(reportId)
      alert('Report deleted successfully!')
    } catch (error) {
      console.error('Failed to delete report:', error)
      alert('Failed to delete report')
    }
  }

  const handleAddTag = () => {
    if (tagInput.trim() && !reportData.tags.includes(tagInput.trim())) {
      setReportData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }))
      setTagInput('')
    }
  }

  const handleRemoveTag = (tagToRemove: string) => {
    setReportData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }))
  }

  const resetReportData = useCallback(() => {
    setReportData({
      title: '',
      content: '',
      type: 'note',
      projectId: '', // Reset về rỗng
      tags: []
    })
  }, [])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'report': return 'bg-blue-100 text-blue-800'
      case 'note': return 'bg-green-100 text-green-800'
      case 'comment': return 'bg-yellow-100 text-yellow-800'
      case 'review': return 'bg-purple-100 text-purple-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'report': return 'Report'
      case 'note': return 'Note'
      case 'comment': return 'Comment'
      case 'review': return 'Review'
      default: return 'Unknown'
    }
  }

  const isLoading = projectsLoading || reportsLoading

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-64"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-48 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Project Notes & Reports</h1>
              <p className="text-gray-600 mt-2">
                Write notes, reports, and comments for your projects
              </p>
            </div>
            
            <div className="flex flex-wrap gap-3 mt-4 md:mt-0">
              <select
                value={selectedProject}
                onChange={(e) => setSelectedProject(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Projects</option>
                {projects.map(project => (
                  <option key={project.id} value={project.id}>
                    {project.name}
                  </option>
                ))}
              </select>

              <button
                onClick={() => {
                  setEditingReport(null)
                  resetReportData()
                  setShowNewReportModal(true)
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
                disabled={projects.length === 0}
              >
                <PlusIcon className="h-5 w-5" />
                <span>New Note/Report</span>
              </button>
            </div>
          </div>
        </div>

        {/* Reports Grid */}
        {reports.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border p-12 text-center">
            <DocumentTextIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Reports Yet</h3>
            <p className="text-gray-600 mb-6">
              {projects.length === 0 
                ? 'Create a project first to start writing reports'
                : 'Create your first project note or report'}
            </p>
            {projects.length > 0 && (
              <button
                onClick={() => setShowNewReportModal(true)}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Create First Report
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {reports.map(report => (
              <div
                key={report.id}
                className="bg-white rounded-xl shadow-sm border hover:shadow-md transition-shadow"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${getTypeColor(report.type)}`}>
                          {getTypeLabel(report.type)}
                        </span>
                        <div 
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: report.project.color || '#3b82f6' }}
                        />
                      </div>
                      
                      <h3 className="font-semibold text-lg mb-2 truncate">{report.title}</h3>
                      
                      <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                        {report.content.substring(0, 150)}
                        {report.content.length > 150 && '...'}
                      </p>
                    </div>
                    
                    <div className="flex space-x-1">
                      <button
                        onClick={() => {
                          setEditingReport({
                            id: report.id,
                            title: report.title,
                            content: report.content,
                            type: report.type,
                            projectId: report.projectId,
                            tags: report.tags
                          })
                          setReportData({
                            title: report.title,
                            content: report.content,
                            type: report.type,
                            projectId: report.projectId,
                            tags: report.tags
                          })
                          setShowNewReportModal(true)
                        }}
                        className="p-1 text-gray-400 hover:text-blue-600"
                        title="Edit"
                      >
                        <PencilIcon className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteReport(report.id)}
                        className="p-1 text-gray-400 hover:text-red-600"
                        title="Delete"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <div className="flex items-center space-x-2">
                      <UserCircleIcon className="h-4 w-4" />
                      <span className="truncate max-w-[100px]">{report.author?.name || 'Unknown'}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CalendarIcon className="h-4 w-4" />
                      <span>{formatDate(report.createdAt)}</span>
                    </div>
                  </div>

                  {report.tags.length > 0 && (
                    <div className="mt-4 pt-4 border-t">
                      <div className="flex items-center space-x-2 mb-2">
                        <TagIcon className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-500">Tags:</span>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {report.tags.slice(0, 3).map(tag => (
                          <span
                            key={tag}
                            className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs"
                          >
                            #{tag}
                          </span>
                        ))}
                        {report.tags.length > 3 && (
                          <span className="px-2 py-1 text-gray-400 text-xs">
                            +{report.tags.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="mt-4 pt-4 border-t">
                    <p className="text-xs text-gray-500">
                      Project: <span className="font-medium">{report.project?.name || 'Unknown'}</span>
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* New/Edit Report Modal */}
        {(showNewReportModal) && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
              <div className="p-6 border-b">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold">
                    {editingReport ? 'Edit Report' : 'Write New Note/Report'}
                  </h2>
                  <button
                    onClick={() => {
                      setShowNewReportModal(false)
                      setEditingReport(null)
                      resetReportData()
                    }}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                  >
                    <svg className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <p className="text-gray-600 mt-1">
                  {editingReport ? 'Update your note or report' : 'Document project progress, issues, or add notes'}
                </p>
              </div>

              <form onSubmit={editingReport ? handleUpdateReport : handleCreateReport} className="p-6 space-y-6 overflow-y-auto max-h-[60vh]">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={reportData.title}
                    onChange={(e) => setReportData(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g., Meeting notes, Bug report, Progress update..."
                    autoFocus
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Type *
                    </label>
                    <select
                      required
                      value={reportData.type}
                      onChange={(e) => setReportData(prev => ({ ...prev, type: e.target.value as ReportData['type'] }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="note">Note</option>
                      <option value="report">Report</option>
                      <option value="comment">Comment</option>
                      <option value="review">Review</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Project *
                    </label>
                    <select
                      required
                      value={reportData.projectId}
                      onChange={(e) => setReportData(prev => ({ ...prev, projectId: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      // Không disable nữa, luôn cho phép chọn
                    >
                      <option value="">Select a project...</option>
                      {projects.map(project => (
                        <option key={project.id} value={project.id}>
                          {project.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Content *
                  </label>
                  <textarea
                    required
                    value={reportData.content}
                    onChange={(e) => setReportData(prev => ({ ...prev, content: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-h-[200px]"
                    placeholder="Write your content here..."
                    rows={6}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    You can write detailed notes, reports, comments, or reviews about the project.
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tags (optional)
                  </label>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {reportData.tags.map(tag => (
                      <span
                        key={tag}
                        className="inline-flex items-center px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-sm"
                      >
                        {tag}
                        <button
                          type="button"
                          onClick={() => handleRemoveTag(tag)}
                          className="ml-2 text-blue-600 hover:text-blue-800"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Add a tag and press Enter"
                    />
                    <button
                      type="button"
                      onClick={handleAddTag}
                      className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      Add
                    </button>
                  </div>
                </div>

                <div className="flex space-x-4 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowNewReportModal(false)
                      setEditingReport(null)
                      resetReportData()
                    }}
                    className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    disabled={!reportData.projectId}
                  >
                    {editingReport ? 'Update' : 'Create'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default ReportsPage
