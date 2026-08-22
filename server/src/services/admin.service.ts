import prisma from '../utils/prisma';
import { ApiError } from '../utils/ApiError';

export const adminService = {
  /**
   * Get overall platform statistics
   */
  async getPlatformStats() {
    const totalUsers = await prisma.user.count();
    const totalTrips = await prisma.trip.count();
    const publicTrips = await prisma.trip.count({ where: { isPublic: true } });
    const totalActivities = await prisma.activity.count();

    // Get trips created per month for the last 6 months
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const recentTrips = await prisma.trip.findMany({
      where: {
        createdAt: {
          gte: sixMonthsAgo
        }
      },
      select: {
        createdAt: true
      }
    });

    const userGrowth = await prisma.user.findMany({
      where: {
        createdAt: {
          gte: sixMonthsAgo
        }
      },
      select: {
        createdAt: true
      }
    });

    return {
      overview: {
        totalUsers,
        totalTrips,
        publicTrips,
        totalActivities,
      },
      growth: {
        trips: recentTrips.map(t => t.createdAt),
        users: userGrowth.map(u => u.createdAt)
      }
    };
  },

  /**
   * Get top saved/visited cities
   */
  async getTopCities(limit = 10) {
    const cities = await prisma.city.findMany({
      take: limit,
      orderBy: {
        popularityScore: 'desc'
      }
    });
    return cities;
  },

  /**
   * Get paginated list of all users
   */
  async getAllUsers(page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    
    const [users, total] = await Promise.all([
      prisma.user.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          email: true,
          fullName: true,
          isAdmin: true,
          createdAt: true,
          _count: {
            select: { trips: true }
          }
        }
      }),
      prisma.user.count()
    ]);

    return {
      users,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }
};
