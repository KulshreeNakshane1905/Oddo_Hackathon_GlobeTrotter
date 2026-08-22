import { TripsController } from './src/controllers/trips.controller';
import { Request, Response } from 'express';

const c = new TripsController();
const req = {
  userId: '123e4567-e89b-12d3-a456-426614174000',
  query: { limit: '3', sort: 'startDate', order: 'asc', upcoming: 'true' }
} as unknown as Request;

const res = {
  status: (s: number) => ({ json: (d: any) => console.log('STATUS:', s, d) })
} as unknown as Response;

c.getTrips(req, res, console.error);
