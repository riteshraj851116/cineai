import mongoose from 'mongoose';

const movieSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Movie title is required'],
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    description: {
      type: String,
      required: true,
    },
    poster: {
      type: String,
      required: true,
    },
    backdrop: {
      type: String,
      required: true,
    },
    trailerUrl: {
      type: String,
      default: '',
    },
    genres: [{
      type: String,
      required: true,
    }],
    languages: [{
      type: String,
      required: true,
    }],
    duration: {
      type: Number, // in minutes
      required: true,
    },
    releaseDate: {
      type: Date,
      required: true,
    },
    certification: {
      type: String,
      enum: ['U', 'UA', 'A', 'R', 'PG-13'],
      default: 'UA',
    },
    cast: [{
      name: String,
      role: String,
      image: String,
    }],
    crew: [{
      name: String,
      role: String,
    }],
    rating: {
      type: Number,
      default: 8.5,
      min: 0,
      max: 10,
    },
    reviewCount: {
      type: Number,
      default: 0,
    },
    formats: [{
      type: String,
      enum: ['2D', '3D', 'IMAX', '4DX'],
      default: ['2D', '3D', 'IMAX'],
    }],
    status: {
      type: String,
      enum: ['now_showing', 'upcoming', 'archived'],
      default: 'now_showing',
    },
    trendingScore: {
      type: Number,
      default: 90,
    },
  },
  { timestamps: true }
);

movieSchema.index({ title: 'text', description: 'text' });
movieSchema.index({ genres: 1, status: 1 });
movieSchema.index({ languages: 1 });

export const Movie = mongoose.model('Movie', movieSchema);
