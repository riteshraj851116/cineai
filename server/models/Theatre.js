import mongoose from 'mongoose';

const theatreSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Theatre name is required'],
      trim: true,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    city: {
      type: String,
      required: true,
      index: true,
    },
    address: {
      type: String,
      required: true,
    },
    coordinates: {
      lat: { type: Number, default: 19.076 },
      lng: { type: Number, default: 72.8777 },
    },
    facilities: [{
      type: String, // e.g. 'Dolby Atmos', 'Recliner Seats', 'Gourmet Food', 'Valet Parking', 'Wheelchair Accessible'
    }],
    screens: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Screen',
    }],
    rating: {
      type: Number,
      default: 4.8,
      min: 1,
      max: 5,
    },
    contact: {
      phone: String,
      email: String,
    },
    images: [{
      type: String,
    }],
  },
  { timestamps: true }
);

theatreSchema.index({ city: 1, name: 1 });

export const Theatre = mongoose.model('Theatre', theatreSchema);
