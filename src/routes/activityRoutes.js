import express from "express";
import { PrismaClient } from "@prisma/client";
import {authMiddleware} from "../middleware/authMiddleware.js";

const router = express.Router();
const prisma = new PrismaClient();

/**
 * @swagger
 * tags:
 *   name: Activity
 *   description: Activity log APIs
 */

/**
 * @swagger
 * /api/activity/{taskId}:
 *   get:
 *     summary: Get activity logs for a specific task
 *     tags: [Activity]
 *     parameters:
 *       - in: path
 *         name: taskId
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the task
 *     responses:
 *       200:
 *         description: List of activity logs
 *       500:
 *         description: Something went wrong
 */
router.get("/:taskId", authMiddleware, async (req, res) => {
  try {
    const { taskId } = req.params;

    const logs = await prisma.activityLog.findMany({
      where: { taskId },
      include: { user: { select: { email: true } } },
      orderBy: { timestamp: "desc" },
    });

    res.json(logs);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Something went wrong" });
  }
});

export default router;
