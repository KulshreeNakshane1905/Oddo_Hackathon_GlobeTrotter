import { tripsService } from './src/services/trips.service';
tripsService.findAllByUser('123e4567-e89b-12d3-a456-426614174000', { page: 1, limit: 3, sort: 'startDate', order: 'asc', upcoming: true }).then(console.log).catch(console.error);
