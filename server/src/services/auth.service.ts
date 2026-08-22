// ============================================================================
// Auth Service — Business logic for authentication
// ============================================================================

import { ApiError } from '../utils/ApiError';
import { logger } from '../utils/logger';
import prisma from '../utils/prisma';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

interface RegisterData {
  email: string;
  password: string;
  fullName: string;
}

interface LoginData {
  email: string;
  password: string;
}

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-key-for-dev-only-do-not-use-in-prod';
const JWT_EXPIRES_IN = '7d';

export class AuthService {
  /**
   * Register a new user with local JWT and bcrypt.
   */
  async register(data: RegisterData) {
    // 1. Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email }
    });

    if (existingUser) {
      throw ApiError.conflict('An account with this email already exists');
    }

    // 2. Hash password
    const hashedPassword = await bcrypt.hash(data.password, 10);

    // 3. Create user in our database
    const user = await prisma.user.create({
      data: {
        email: data.email,
        password: hashedPassword,
        fullName: data.fullName,
      },
      select: {
        id: true,
        email: true,
        fullName: true,
        profilePic: true,
        languagePref: true,
        createdAt: true,
      },
    });

    logger.info(`User registered: ${user.email}`);
    return user;
  }

  /**
   * Login via local Auth — returns session with tokens.
   */
  async login(data: LoginData) {
    // 1. Find user
    const user = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (!user) {
      logger.warn(`Login failed for ${data.email}: User not found`);
      throw ApiError.unauthorized('Invalid email or password');
    }

    // 2. Verify password
    const isValidPassword = await bcrypt.compare(data.password, user.password);
    if (!isValidPassword) {
      logger.warn(`Login failed for ${data.email}: Invalid password`);
      throw ApiError.unauthorized('Invalid email or password');
    }

    // 3. Generate JWT
    const token = jwt.sign(
      { 
        id: user.id, 
        email: user.email, 
        role: user.isAdmin ? 'admin' : 'user' 
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    // 4. Return user info and session
    const { password, ...userWithoutPassword } = user;
    
    return {
      user: userWithoutPassword,
      session: {
        accessToken: token,
        refreshToken: token, // Refresh tokens not strictly implemented in local auth for simplicity
        expiresAt: Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60, // 7 days in seconds
      },
    };
  }

  /**
   * Refresh the access token using a refresh token.
   */
  async refreshToken(refreshToken: string) {
    try {
      const decoded = jwt.verify(refreshToken, JWT_SECRET) as any;
      
      const user = await prisma.user.findUnique({
        where: { id: decoded.id }
      });

      if (!user) {
        throw new Error('User not found');
      }

      const token = jwt.sign(
        { 
          id: user.id, 
          email: user.email, 
          role: user.isAdmin ? 'admin' : 'user' 
        },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES_IN }
      );

      return {
        accessToken: token,
        refreshToken: token,
        expiresAt: Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60,
      };
    } catch (error) {
      throw ApiError.unauthorized('Invalid or expired refresh token');
    }
  }

  /**
   * Send password reset email (Dummy implementation for local auth)
   */
  async forgotPassword(email: string) {
    // In a real local auth system, you would generate a token, save it to DB, and send an email
    logger.info(`Forgot password requested for ${email}`);
    return { message: 'If an account with that email exists, a reset link has been sent.' };
  }

  /**
   * Get user profile by ID.
   */
  async getUserById(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        fullName: true,
        profilePic: true,
        languagePref: true,
        isAdmin: true,
        createdAt: true,
      },
    });

    if (!user) {
      throw ApiError.notFound('User');
    }

    return user;
  }
}

export const authService = new AuthService();
