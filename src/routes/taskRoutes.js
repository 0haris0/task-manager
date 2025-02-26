import express from 'express';
import {PrismaClient} from '@prisma/client';
import {authMiddleware} from '../middleware/authMiddleware.js';


const router = express.Router();
const prisma = new PrismaClient();

/**
 * @swagger
 * tags:
 *   name: Tasks
 *   description: Task management APIs
 */

/**
 * @swagger
 * /api/tasks:
 *   get:
 *     summary: Get paginated tasks
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
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
 *         description: Number of tasks per page
 *     responses:
 *       200:
 *         description: Paginated list of tasks
 */

// 🔹 Task fetch
router.get('/', authMiddleware, async (req, res) =>
{
try {
  const {
          status,
          priority,
          dueDate,
          sort,
          page  = 1,
          limit = 10,
        } = req.query;

  let filters      = {userId: req.user.id};
  const pageNumber = parseInt(page);
  const pageSize   = parseInt(limit);
  if (status) {
    filters.status = status;
  }
  if (priority) {
    filters.priority = priority;
  }
  if (dueDate) {
    filters.dueDate = new Date(dueDate);
  }

  const totalTasks = await prisma.task.count({where: filters});

  const tasks = await prisma.task.findMany({
    where  : filters,
    orderBy: {createdAt: sort === 'asc' ? 'asc' : 'desc'}, // default "desc"
    skip   : (pageNumber - 1) * pageSize,
    take   : pageSize,
  });

  res.json({
    totalTasks,
    totalPages : Math.ceil(totalTasks / pageSize),
    currentPage: pageNumber,
    pageSize,
    tasks,
  });
} catch (error) {
  console.error(error);
  res.status(500).json({error: 'Something went wrong'});
}
});

router.post('/', authMiddleware, async (req, res) =>
{
try {
  const {
          title,
          description,
          status,
          priority,
          dueDate,
        } = req.body;

  if (!title || !dueDate) {
    return res.status(400).json({error: 'Title and due date are required'});
  }

  const task = await prisma.task.create({
    data: {
      title,
      description,
      status   : status || 'pending',
      priority : priority || 'medium',
      dueDate  : new Date(dueDate),
      createdBy: {connect: {id: req.user.id}}, // Add task to user
    },
  });

  await prisma.activityLog.create({
    data: {
      action: 'created',
      task  : {connect: {id: task.id}},
      user  : {connect: {id: req.user.id}},
    },
  });

  res.status(201).json(task);
} catch (error) {
  console.error(error);
  res.status(500).json({error: 'Something went wrong'});
}
});

// 🔹 Task edit
router.put('/:id', authMiddleware, async (req, res) =>
{
try {
  const {id} = req.params;
  const {
          title,
          description,
          status,
          priority,
          dueDate,
        }    = req.body;

  const task = await prisma.task.findUnique({where: {id}});

  if (!task || task.userId !== req.user.id) {
    return res.status(404).json({error: 'Task not found'});
  }
  const updatedTask = await prisma.task.update({
    where: {id},
    data : {
      title,
      description,
      status,
      priority,
      dueDate: new Date(dueDate),
    },
  });
  await prisma.activityLog.create({
    data: {
      action: 'updated',
      task  : {connect: {id: id}},
      user  : {connect: {id: req.user.id}},
    },
  });
  res.json(updatedTask);
} catch (error) {
  console.error(error);
  res.status(500).json({error: 'Something went wrong'});
}
});

// 🔹 Task remove
router.delete('/:id', authMiddleware, async (req, res) =>
{
try {
  const {id} = req.params;

  const task = await prisma.task.findUnique({where: {id}});

  if (!task || task.userId !== req.user.id) {
    return res.status(404).json({error: 'Task not found'});
  }

  await prisma.task.delete({where: {id}});
  await prisma.activityLog.create({
    data: {
      action: 'deleted',
      taskId: id,
      user  : {connect: {id: req.user.id}},
    },
  });

  res.json({message: 'Task deleted successfully'});
} catch (error) {
  console.error(error);
  res.status(500).json({error: 'Something went wrong'});
}
});

export default router;
