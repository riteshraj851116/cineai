import express from 'express';
import {
  getMovies,
  getMovieById,
  getMovieBySlug,
  createMovie,
  updateMovie,
  deleteMovie,
} from '../controllers/movieController.js';
import { protect } from '../middleware/auth.js';
import { authorize } from '../middleware/role.js';

const router = express.Router();

router.get('/', getMovies);
router.get('/slug/:slug', getMovieBySlug);
router.get('/:id', getMovieById);

router.post('/', protect, authorize('admin'), createMovie);
router.put('/:id', protect, authorize('admin'), updateMovie);
router.delete('/:id', protect, authorize('admin'), deleteMovie);

export default router;
