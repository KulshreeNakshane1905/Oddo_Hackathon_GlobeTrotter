// ============================================================================
// Cities Controller — Handles HTTP requests for city operations
// ============================================================================

import { Request, Response, NextFunction } from 'express';
import { citiesService } from '../services/cities.service';
import { ApiResponse } from '../utils/ApiResponse';

export class CitiesController {
  /**
   * GET /api/cities/popular — Get popular cities (public endpoint)
   */
  async getPopularCities(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const limit = Math.min(30, parseInt(req.query.limit as string || '12', 10));
      const cities = await citiesService.getPopular(limit);
      ApiResponse.success(res, cities);
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/cities/search — Search cities by name
   */
  async searchCities(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const query = (req.query.q as string || '').trim();

      if (!query || query.length < 1) {
        ApiResponse.success(res, []);
        return;
      }

      const country = req.query.country as string | undefined;
      const limit = Math.min(30, parseInt(req.query.limit as string || '20', 10));

      const cities = await citiesService.search(query, country, limit);
      ApiResponse.success(res, cities);
    } catch (err) {
      next(err);
    }
  }
}

export const citiesController = new CitiesController();
