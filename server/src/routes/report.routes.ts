import express from 'express'
import { PrismaClient } from '@prisma/client'
import { authenticateToken } from '../middleware/auth'

const router = express.Router()
const prisma = new PrismaClient()

// GET /api/reports - Lấy danh sách reports
router.get('/', authenticateToken, async (req: any, res) => {
  try {
    const userId = req.user.id
    const { projectId, type, status } = req.query

    const where: any = {
      authorId: userId
    }

    if (projectId && projectId !== 'all') {
      where.projectId = projectId
    }

    if (type) {
      where.type = type
    }

    if (status) {
      where.status = status
    }

    const reports = await prisma.report.findMany({
      where,
      include: {
        project: {
          select: {
            id: true,
            name: true,
            color: true
          }
        },
        author: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    res.json({ reports })
  } catch (error) {
    console.error('Error fetching reports:', error)
    res.status(500).json({ error: 'Failed to fetch reports' })
  }
})

// GET /api/reports/:id - Lấy report cụ thể
router.get('/:id', authenticateToken, async (req: any, res) => {
  try {
    const userId = req.user.id
    const { id } = req.params

    const report = await prisma.report.findFirst({
      where: {
        id,
        authorId: userId
      },
      include: {
        project: {
          select: {
            id: true,
            name: true,
            color: true
          }
        },
        author: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })

    if (!report) {
      return res.status(404).json({ error: 'Report not found' })
    }

    res.json({ report })
  } catch (error) {
    console.error('Error fetching report:', error)
    res.status(500).json({ error: 'Failed to fetch report' })
  }
})

// POST /api/reports - Tạo report mới
router.post('/', authenticateToken, async (req: any, res) => {
  try {
    const userId = req.user.id
    const { title, content, type, status, projectId, tags } = req.body

    // Validate
    if (!title?.trim() || !content?.trim() || !projectId) {
      return res.status(400).json({ error: 'Missing required fields' })
    }

    // Kiểm tra project tồn tại và user có quyền
    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        OR: [
          { ownerId: userId },
          { members: { some: { userId } } }
        ]
      }
    })

    if (!project) {
      return res.status(404).json({ error: 'Project not found or no access' })
    }

    // Tạo report
    const report = await prisma.report.create({
      data: {
        title: title.trim(),
        content: content.trim(),
        type: type || 'note',
        status: status || 'draft',
        projectId,
        authorId: userId,
        tags: tags || []
      },
      include: {
        project: {
          select: {
            id: true,
            name: true,
            color: true
          }
        },
        author: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })

    res.status(201).json({ report })
  } catch (error) {
    console.error('Error creating report:', error)
    res.status(500).json({ error: 'Failed to create report' })
  }
})

// PUT /api/reports/:id - Cập nhật report
router.put('/:id', authenticateToken, async (req: any, res) => {
  try {
    const userId = req.user.id
    const { id } = req.params
    const { title, content, type, status, tags } = req.body

    // Kiểm tra report tồn tại và user là tác giả
    const existingReport = await prisma.report.findFirst({
      where: {
        id,
        authorId: userId
      }
    })

    if (!existingReport) {
      return res.status(404).json({ error: 'Report not found or no permission' })
    }

    // Cập nhật report
    const report = await prisma.report.update({
      where: { id },
      data: {
        title: title?.trim() || existingReport.title,
        content: content?.trim() || existingReport.content,
        type: type || existingReport.type,
        status: status || existingReport.status,
        tags: tags || existingReport.tags
      },
      include: {
        project: {
          select: {
            id: true,
            name: true,
            color: true
          }
        },
        author: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })

    res.json({ report })
  } catch (error) {
    console.error('Error updating report:', error)
    res.status(500).json({ error: 'Failed to update report' })
  }
})

// DELETE /api/reports/:id - Xóa report
router.delete('/:id', authenticateToken, async (req: any, res) => {
  try {
    const userId = req.user.id
    const { id } = req.params

    // Kiểm tra report tồn tại và user là tác giả
    const existingReport = await prisma.report.findFirst({
      where: {
        id,
        authorId: userId
      }
    })

    if (!existingReport) {
      return res.status(404).json({ error: 'Report not found or no permission' })
    }

    // Xóa report
    await prisma.report.delete({
      where: { id }
    })

    res.json({ success: true })
  } catch (error) {
    console.error('Error deleting report:', error)
    res.status(500).json({ error: 'Failed to delete report' })
  }
})

export default router
