const mongoose = require('mongoose');

const querySchema = new mongoose.Schema(
  {
    farmerName: { type: String, trim: true },
    language: { type: String, default: 'en' },
    questionText: { type: String, required: true },
    answerText: { type: String, required: true },
    meta: {
      type: Map,
      of: String,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Query', querySchema);

