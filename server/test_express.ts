import express from 'express';
import { validate } from './src/middleware/validate';
import { z } from 'zod';

const app = express();
app.get('/test', validate(z.object({ a: z.string().optional() }), 'query'), (req, res) => res.json(req.query));
app.listen(3002, () => console.log('started'));
