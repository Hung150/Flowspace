import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

interface AuthRequest extends Request {
  user?: {
    userId: string;
    email: string;
  };
}

const prisma = new PrismaClient();

// 1. Lấy tất cả members trong project
export const getProjectMembers = async (req: AuthRequest, res: Response) => {
  try {
    const { projectId } = req.params;
    
    const members = await prisma.member.findMany({
      where: { projectId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true
          }
        }
      },
      orderBy: { createdAt: 'asc' }
    });

    res.json(members);
  } catch (error) {
    console.error('Error getting project members:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// 2. Thêm member vào project
export const addMemberToProject = async (req: AuthRequest, res: Response) => {
  try {
    const { projectId } = req.params;
    const { userId, role = 'MEMBER' } = req.body;
    const currentUserId = req.user?.userId; // Từ auth middleware

    // Kiểm tra project tồn tại
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: { owner: true }
    });

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    // Kiểm tra user có quyền thêm member không (chỉ owner)
    if (project.ownerId !== currentUserId) {
      return res.status(403).json({ error: 'Only project owner can add members' });
    }

    // Kiểm tra user tồn tại
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Kiểm tra member đã tồn tại chưa
    const existingMember = await prisma.member.findUnique({
      where: {
        userId_projectId: {
          userId,
          projectId
        }
      }
    });

    if (existingMember) {
      return res.status(400).json({ error: 'User is already a member of this project' });
    }

    // Tạo member
    const member = await prisma.member.create({
      data: {
        userId,
        projectId,
        role
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true
          }
        }
      }
    });

    res.status(201).json(member);
  } catch (error) {
    console.error('Error adding member:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// 3. Cập nhật role của member
export const updateMemberRole = async (req: AuthRequest, res: Response) => {
  try {
    const { projectId, memberId } = req.params;
    const { role } = req.body;
    const currentUserId = req.user?.userId;

    // Kiểm tra project và owner
    const project = await prisma.project.findUnique({
      where: { id: projectId }
    });

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    // Chỉ owner mới được update role
    if (project.ownerId !== currentUserId) {
      return res.status(403).json({ error: 'Only project owner can update member roles' });
    }

    // Update role
    const updatedMember = await prisma.member.update({
      where: {
        id: memberId,
        projectId // Đảm bảo member thuộc project này
      },
      data: { role },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true
          }
        }
      }
    });

    res.json(updatedMember);
  } catch (error) {
    console.error('Error updating member role:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// 4. Xóa member khỏi project
export const removeMemberFromProject = async (req: AuthRequest, res: Response) => {
  try {
    const { projectId, memberId } = req.params;
    const currentUserId = req.user?.userId;

    // Kiểm tra project
    const project = await prisma.project.findUnique({
      where: { id: projectId }
    });

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    // Chỉ owner mới được xóa member (trừ tự xóa chính mình)
    const memberToDelete = await prisma.member.findUnique({
      where: { id: memberId }
    });

    if (!memberToDelete) {
      return res.status(404).json({ error: 'Member not found' });
    }

    // Owner có thể xóa bất kỳ ai, member chỉ có thể tự xóa chính mình
    if (project.ownerId !== currentUserId && memberToDelete.userId !== currentUserId) {
      return res.status(403).json({ error: 'You do not have permission to remove this member' });
    }

    // Không cho owner xóa chính mình
    if (memberToDelete.userId === project.ownerId) {
      return res.status(400).json({ error: 'Project owner cannot be removed' });
    }

    // Xóa member
    await prisma.member.delete({
      where: { id: memberId }
    });

    res.json({ message: 'Member removed successfully' });
  } catch (error) {
    console.error('Error removing member:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// 5. Lấy tất cả projects mà user là member
export const getUserTeams = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;

    const memberships = await prisma.member.findMany({
      where: { userId },
      include: {
        project: {
          include: {
            owner: {
              select: {
                id: true,
                name: true,
                email: true
              }
            },
            _count: {
              select: {
                tasks: true,
                members: true
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    // Transform data
    const teams = memberships.map(membership => ({
      id: membership.project.id,
      name: membership.project.name,
      description: membership.project.description,
      color: membership.project.color,
      role: membership.role,
      owner: membership.project.owner,
      stats: {
        tasks: membership.project._count.tasks,
        members: membership.project._count.members
      },
      joinedAt: membership.createdAt
    }));

    res.json(teams);
  } catch (error) {
    console.error('Error getting user teams:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
