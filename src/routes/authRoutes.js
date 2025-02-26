import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import {PrismaClient} from '@prisma/client';
import dotenv from 'dotenv';


dotenv.config();
const router = express.Router();
const prisma = new PrismaClient();

const generateToken = (user) =>
  {
  return jwt.sign({
    id   : user.id,
    email: user.email,
    role : user.role,
  }, process.env.JWT_SECRET, {
    expiresIn: '7d',
  });
  };

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Authentication APIs
 */

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 example: user@example.com
 *               password:
 *                 type: string
 *                 example: password123
 *     responses:
 *       201:
 *         description: User registered successfully
 *       400:
 *         description: User already exists or missing fields
 */
router.post('/register', async (req, res) =>
{
try {
  const {
          email,
          password,
          role,
        } = req.body;

  if (!email || !password) {
    return res.status(400).json({error: 'Email and password are required'});
  }

  const existingUser = await prisma.user.findUnique({where: {email}});
  if (existingUser) {
    return res.status(400).json({error: 'User already exists'});
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const user           = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      role    : role || 'user',
    },
  });

  res.status(201).
      json({
        message: 'User registered',
        token  : generateToken(user),
      });
} catch (error) {
  res.status(500).json({error: 'Something went wrong'});
}
});

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 example: user@example.com
 *               password:
 *                 type: string
 *                 example: password123
 *     responses:
 *       200:
 *         description: Login successful
 *       401:
 *         description: Invalid credentials
 */
router.post('/login', async (req, res) =>
{
try {
  const {
          email,
          password,
        } = req.body;

  if (!email || !password) {
    return res.status(400).json({error: 'Email and password are required'});
  }

  const user = await prisma.user.findUnique({where: {email}});
  if (!user) {
    return res.status(401).json({error: 'Invalid credentials'});
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    return res.status(401).json({error: 'Invalid credentials'});
  }

  res.json({
    message: 'Login successful',
    token  : generateToken(user),
  });
} catch (error) {
  res.status(500).json({error: 'Something went wrong'});
  console.log(error);
}
});

export default router;