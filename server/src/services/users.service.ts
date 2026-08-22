// ============================================================================
// Users Service — User profile and saved cities management
// ============================================================================

import { PrismaClient } from '@prisma/client';
import { getSupabaseAdmin } from '../config/supabase';
import { ApiError } from '../utils/ApiError';
import { logger } from '../utils/logger';

const prisma = new PrismaClient();

export interface UpdateProfileData {
  fullName?: string;
  languagePref?: string;
  profilePic?: string;
}

export class UsersService {
  /**
   * Update user profile information.
   * Syncs fullName to Supabase Auth metadata as well.
   */
  async updateProfile(userId: string, data: UpdateProfileData) {
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(data.fullName && { fullName: data.fullName }),
        ...(data.languagePref && { languagePref: data.languagePref }),
        ...(data.profilePic !== undefined && { profilePic: data.profilePic }),
      },
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

    // Sync full name back to Supabase Auth metadata
    if (data.fullName) {
      const supabase = getSupabaseAdmin();
      await supabase.auth.admin.updateUserById(userId, {
        user_metadata: { full_name: data.fullName },
      });
    }

    return updatedUser;
  }

  /**
   * Delete user account permanently.
   * Deletes from Prisma (cascading to trips, etc.) then from Supabase Auth.
   */
  async deleteAccount(userId: string) {
    // 1. Delete from our database (this triggers Prisma Cascade for trips, stops, etc.)
    try {
      await prisma.user.delete({ where: { id: userId } });
    } catch (err) {
      logger.error(`Error deleting user ${userId} from DB:`, err);
      throw ApiError.internal('Failed to delete user record');
    }

    // 2. Delete from Supabase Auth
    const supabase = getSupabaseAdmin();
    const { error } = await supabase.auth.admin.deleteUser(userId);

    if (error) {
      logger.error(`Error deleting user ${userId} from Supabase:`, error);
      // We already deleted from our DB, so this is a partial failure, but we shouldn't throw 
      // if the primary data is gone. Supabase will reject future logins anyway if DB is out of sync.
    }

    logger.info(`User account deleted: ${userId}`);
  }

  /**
   * Get all cities saved by the user.
   */
  async getSavedCities(userId: string) {
    const savedCities = await prisma.userSavedCity.findMany({
      where: { userId },
      include: {
        city: true,
      },
      orderBy: {
        city: { name: 'asc' },
      },
    });

    return savedCities.map((sc) => sc.city);
  }

  /**
   * Save a city for a user.
   */
  async saveCity(userId: string, cityId: string) {
    // Ensure city exists
    const city = await prisma.city.findUnique({ where: { id: cityId } });
    if (!city) {
      throw ApiError.notFound('City');
    }

    // Upsert to handle unique constraint gracefully
    const savedCity = await prisma.userSavedCity.upsert({
      where: {
        userId_cityId: {
          userId,
          cityId,
        },
      },
      create: {
        userId,
        cityId,
      },
      update: {}, // Do nothing if it already exists
      include: {
        city: true,
      },
    });

    return savedCity.city;
  }

  /**
   * Remove a saved city for a user.
   */
  async unsaveCity(userId: string, cityId: string) {
    try {
      await prisma.userSavedCity.delete({
        where: {
          userId_cityId: {
            userId,
            cityId,
          },
        },
      });
    } catch (err: any) {
      if (err.code === 'P2025') {
        // Record to delete does not exist, which is fine for idempotency
        return;
      }
      throw err;
    }
  }
}

export const usersService = new UsersService();
