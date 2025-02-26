import express from 'express';
import {PrismaClient} from '@prisma/client';
import {authMiddleware} from '../middleware/authMiddleware.js';


const router = express.Router();
const prisma = new PrismaClient();

/**
 * @swagger
 * /api/comments/{taskId}:
 *   post:
 *     summary: Create a comment for a task
 *     tags: [Comments]
 *     parameters:
 *       - in: path
 *         name: taskId
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the task
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               content:
 *                 type: string
 *                 example: This is a comment
 *     responses:
 *       201:
 *         description: Comment created successfully
 *       400:
 *         description: Comment content is required
 *       404:
 *         description: Task not found
 *       500:
 *         description: Something went wrong
 */
router.post('/:taskId', authMiddleware, async (req, res) =>
{
try {
  const {taskId}  = req.params;
  const {content} = req.body;

  if (!content) {
    return res.status(400).json({error: 'Comment content is required'});
  }

  const task = await prisma.task.findUnique({where: {id: taskId}});
  if (!task) {
    return res.status(404).json({error: 'Task not found'});
  }

  const comment = await prisma.comment.create({
    data: {
      content,
      task  : {connect: {id: taskId}},
      author: {connect: {id: req.user.id}},
    },
  });

  res.status(201).json(comment);
} catch (error) {
  console.error(error);
  res.status(500).json({error: 'Something went wrong'});
}
});

/**
 * @swagger
 * /api/comments/{taskId}:
 *   get:
 *     summary: Get paginated comments for a task
 *     tags: [Comments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: taskId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the task to retrieve comments for
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of comments per page
 *     responses:
 *       200:
 *         description: Paginated list of comments for the specified task
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totalComments:
 *                   type: integer
 *                 totalPages:
 *                   type: integer
 *                 currentPage:
 *                   type: integer
 *                 pageSize:
 *                   type: integer
 *                 comments:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       content:
 *                         type: string
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                       author:
 *                         type: object
 *                         properties:
 *                           email:
 *                             type: string
 *       401:
 *         description: Unauthorized, invalid or missing token
 *       500:
 *         description: Internal server error
 */
router.get('/:taskId', authMiddleware, async (req, res) =>
{
try {
  const {taskId} = req.params;
  const {
          page  = 1,
          limit = 10,
        }        = req.query;

  const pageNumber = parseInt(page);
  const pageSize   = parseInt(limit);

  const totalComments = await prisma.comment.count({where: {taskId}});

  const comments = await prisma.comment.findMany({
    where  : {taskId},
    include: {author: {select: {email: true}}},
    orderBy: {createdAt: 'asc'},
    skip   : (pageNumber - 1) * pageSize,
    take   : pageSize,

  });

  res.json({
    totalComments,
    totalPages : Math.ceil(totalComments / pageSize),
    currentPage: pageNumber,
    pageSize,
    comments,
  });
} catch (error) {
  console.error(error);
  res.status(500).json({error: 'Something went wrong'});
}
});

export default router;
