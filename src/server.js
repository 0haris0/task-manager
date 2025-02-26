"use strict";
/* jshint esversion: 6 */
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { PrismaClient } from "@prisma/client";
import authRoutes from "./routes/authRoutes.js";
import taskRoutes from './routes/taskRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import commentRoutes from './routes/commentRoutes.js';
import activityRoutes from './routes/activityRoutes.js';
import setupSwagger from './swaggerConfig.js';

dotenv.config();
const app = express();
const prisma = new PrismaClient();

setupSwagger(app);

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Task Manager API is running...");
});

app.use("/api/auth", authRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/comments", commentRoutes);
app.use("/api/activity", activityRoutes);



const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));