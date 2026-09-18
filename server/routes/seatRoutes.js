import express from 'express';
import { getShowSeats } from '../controllers/seatController.js';

const router = express.Router();

router.get('/show/:showId', getShowSeats);

export default router;
