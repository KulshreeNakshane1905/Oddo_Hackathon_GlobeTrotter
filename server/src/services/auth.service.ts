// ============================================================================
// Auth Service — Business logic for authentication
// ============================================================================

import { PrismaClient } from '@prisma/client';
import { getSupabaseAdmin } from '../config/supabase';
import { ApiError } from '../utils/ApiError';
import { logger } from '../utils/logger';

import prisma from '../utils/prisma';


interface RegisterData {
  email: string;
  password: string;
  fullName: string;
}

interface LoginData {
  email: string;
  password: string;
}

export class AuthService {
  /**
   * Register a new user via Supabase Auth, then create a profile in our DB.
   */
  async register(data: RegisterData) {
    const supabase = getSupabaseAdmin();

    // 1. Create user in Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: data.email,
      password: data.password,
      email_confirm: true, // Auto-confirm for now; switch to false for email verification
      user_metadata: {
        full_name: data.fullName,
        is_admin: false,
      },
    });

    if (authError) {
      logger.error('Supabase auth register error:', authError);
      if (authError.message.includes('already registered')) {
        throw ApiError.conflict('An account with this email already exists');
      }
      throw ApiError.internal('Failed to create account');
    }

    if (!authData.user) {
      throw ApiError.internal('User creation failed');
    }

    // 2. Create user profile in our database
    const user = await prisma.user.create({
      data: {
        id: authData.user.id,
        email: data.email,
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
   * Login via Supabase Auth — returns session with tokens.
   */
  async login(data: LoginData) {
    const supabase = getSupabaseAdmin();

    // Use signInWithPassword through Supabase client
    // Note: For server-side login, we create a temporary client
    const { createClient } = await import('@supabase/supabase-js');
    const anonClient = createClient(
      process.env.SUPABASE_URL || '',
      process.env.SUPABASE_ANON_KEY || ''
    );

    const { data: authData, error: authError } = await anonClient.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    });

    if (authError) {
      logger.warn(`Login failed for ${data.email}: ${authError.message}`);
      throw ApiError.unauthorized('Invalid email or password');
    }

    if (!authData.session) {
      throw ApiError.unauthorized('Failed to create session');
    }

    // Fetch user profile from our database
    const user = await prisma.user.findUnique({
      where: { id: authData.user.id },
      select: {
        id: true,
        email: true,
        fullName: true,
        profilePic: true,
        languagePref: true,
        isAdmin: true,
      },
    });

    // If user doesn't exist in our DB yet (edge case: created via Supabase dashboard)
    if (!user) {
      await prisma.user.create({
        data: {
          id: authData.user.id,
          email: authData.user.email!,
          fullName: authData.user.user_metadata?.full_name || 'User',
        },
      });
    }

    return {
      user: user || {
        id: authData.user.id,
        email: authData.user.email,
        fullName: authData.user.user_metadata?.full_name || 'User',
      },
      session: {
        accessToken: authData.session.access_token,
        refreshToken: authData.session.refresh_token,
        expiresAt: authData.session.expires_at,
      },
    };
  }

  /**
   * Refresh the access token using a refresh token.
   */
  async refreshToken(refreshToken: string) {
    const { createClient } = await import('@supabase/supabase-js');
    const anonClient = createClient(
      process.env.SUPABASE_URL || '',
      process.env.SUPABASE_ANON_KEY || ''
    );

    const { data, error } = await anonClient.auth.refreshSession({
      refresh_token: refreshToken,
    });

    if (error || !data.session) {
      throw ApiError.unauthorized('Invalid or expired refresh token');
    }

    return {
      accessToken: data.session.access_token,
      refreshToken: data.session.refresh_token,
      expiresAt: data.session.expires_at,
    };
  }

  /**
   * Send password reset email via Supabase.
   */
  async forgotPassword(email: string) {
    const supabase = getSupabaseAdmin();

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.CORS_ORIGIN}/reset-password`,
    });

    if (error) {
      logger.error('Password reset error:', error);
      // Don't reveal if email exists — always return success
    }

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
