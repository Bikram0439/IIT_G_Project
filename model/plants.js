const mongoose = require('mongoose');

const plantSchema = new mongoose.Schema({
  scientificName: { type: String, trim: true },
  localName: { type: String, trim: true },
  partsUsed: { type: String, trim: true },
  uses: { type: String, trim: true },
  reference: { type: String, trim: true },

  referenceUrl: { type: String, trim: true },

  englishName: { type: String, trim: true },
  hindiName: { type: String, trim: true },
  assameseName: { type: String, trim: true },

  pictureUrl: { type: String, trim: true },
  pictureSource: { type: String, trim: true },

  picturePage: {   // 🔥 IMPORTANT FIX
    type: String,
    trim: true
  },

  licence: { type: String, trim: true },
  licenceUrl: { type: String, trim: true }

}, { timestamps: true });

module.exports = mongoose.model('Plant', plantSchema);