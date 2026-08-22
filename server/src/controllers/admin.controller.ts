import { Response, NextFunction } from 'express';
import { adminService } from '../services/admin.service';
import { ApiResponse } from '../utils/ApiResponse';
import { AuthenticatedRequest } from '../middleware/auth.middleware';

export class AdminController {
  async getPlatformStats(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const stats = await adminService.getPlatformStats();
      ApiResponse.success(res, stats);
    } catch (err) {
      next(err);
    }
  }

  async getTopCities(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const limit = req.query.limit ? parseInt(String(req.query.limit)) : 10;
      const cities = await adminService.getTopCities(limit);
      ApiResponse.success(res, cities);
    } catch (err) {
      next(err);
    }
  }

  async getAllUsers(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const page = req.query.page ? parseInt(String(req.query.page)) : 1;
      const limit = req.query.limit ? parseInt(String(req.query.limit)) : 20;
      
      const usersData = await adminService.getAllUsers(page, limit);
      ApiResponse.success(res, usersData);
    } catch (err) {
      next(err);
    }
  }
}
