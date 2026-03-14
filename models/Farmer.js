const mongoose = require('mongoose');

const farmerSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    location: { type: String, required: true, trim: true },
    soilType: { type: String, required: true, trim: true },
    season: { type: String, required: true, trim: true },
    waterAvailability: { type: String, required: true, trim: true },
    budget: { type: Number, required: true },
    language: { type: String, default: 'en' },
    recommendedCrops: [{ type: String }],
    advisoryNotes: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Farmer', farmerSchema);

