import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const searchUsers = async (req: Request, res: Response) => {
  try {
    const { email, name } = req.query;
    const currentUserId = req.user?.userId;

    if (!email && !name) {
      return res.status(400).json({ 
        error: 'Please provide email or name to search' 
      });
    }

    const users = await prisma.user.findMany({
      where: {
        AND: [
          { id: { not: currentUserId } }, // Không tìm chính mình
          {
            OR: [
              email ? { email: { contains: email as string, mode: 'insensitive' } } : {},
              name ? { name: { contains: name as string, mode: 'insensitive' } } : {},
            ]
          }
        ]
      },
      select: {
        id: true,
        email: true,
        name: true,
        avatar: true,
        createdAt: true
      },
      take: 10
    });

    res.json(users);
  } catch (error) {
    console.error('Error searching users:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
