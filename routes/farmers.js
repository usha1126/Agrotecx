const express = require('express');
const Farmer = require('../models/Farmer');

const router = express.Router();

// Simple rule-based crop recommendation engine.
function recommendCrops({ soilType, season, waterAvailability, budget }) {
  const results = [];
  const lowerSoil = soilType.toLowerCase();
  const lowerSeason = season.toLowerCase();
  const lowerWater = waterAvailability.toLowerCase();
  const numericBudget = Number(budget) || 0;

  // Rice
  if (
    lowerSoil.includes('clay') ||
    lowerWater.includes('high') ||
    lowerWater.includes('canal')
  ) {
    results.push('Rice');
  }

  // Wheat
  if (
    lowerSeason.includes('rabi') ||
    lowerSeason.includes('winter') ||
    lowerSoil.includes('loam')
  ) {
    results.push('Wheat');
  }

  // Cotton
  if (
    lowerSeason.includes('kharif') &&
    (lowerSoil.includes('black') || lowerSoil.includes('alluvial'))
  ) {
    results.push('Cotton');
  }

  // Groundnut
  if (lowerSoil.includes('sandy') || lowerSoil.includes('red')) {
    results.push('Groundnut');
  }

  // Millets
  if (lowerWater.includes('low') || lowerWater.includes('rainfed')) {
    results.push('Millets (Jowar, Bajra, Ragi)');
  }

  // Vegetables with small budget
  if (numericBudget > 0 && numericBudget <= 50000) {
    results.push('Short-duration vegetables (Okra, Brinjal, Tomato)');
  }

  // Fruits or plantation crops for higher budget
  if (numericBudget > 50000) {
    results.push('Fruits / plantation crops (Mango, Banana, Coconut)');
  }

  // Fallback if no rule matched
  if (!results.length) {
    results.push('Pulses (Red gram, Green gram, Black gram)');
  }

  return Array.from(new Set(results));
}

// Generate short advisory text based on inputs.
function buildAdvisoryText(farmer, recommendedCrops) {
  const hints = [];

  hints.push(
    `For ${farmer.soilType} soil in ${farmer.season} season near ${farmer.location}, the following crops are suitable: ${recommendedCrops.join(
      ', '
    )}.`
  );

  hints.push(
    'Use well-decomposed farmyard manure (FYM) 5–10 tons per acre during land preparation.'
  );

  if (farmer.waterAvailability.toLowerCase().includes('low')) {
    hints.push(
      'Water is limited. Prefer micro-irrigation (drip/sprinkler) and drought-tolerant varieties.'
    );
  } else {
    hints.push(
      'Maintain proper irrigation schedule and avoid waterlogging in the field.'
    );
  }

  hints.push(
    'Monitor the crop weekly for pests and diseases. Use pheromone traps and light traps where possible.'
  );

  hints.push(
    'Always follow local agricultural university / KVK recommendations for exact fertilizer dose and plant protection chemicals.'
  );

  return hints.join(' ');
}

// POST /api/farmers - create farmer record and get crop recommendation + advisory
router.post('/', async (req, res) => {
  try {
    const {
      name,
      location,
      soilType,
      season,
      waterAvailability,
      budget,
      language,
    } = req.body;

    if (
      !name ||
      !location ||
      !soilType ||
      !season ||
      !waterAvailability ||
      budget === undefined
    ) {
      return res.status(400).json({ error: 'Missing required fields.' });
    }

    const recommendedCrops = recommendCrops({
      soilType,
      season,
      waterAvailability,
      budget,
    });

    const advisoryText = buildAdvisoryText(
      { name, location, soilType, season, waterAvailability, budget },
      recommendedCrops
    );

    const farmer = await Farmer.create({
      name,
      location,
      soilType,
      season,
      waterAvailability,
      budget,
      language: language || 'en',
      recommendedCrops,
      advisoryNotes: advisoryText,
    });

    return res.status(201).json({
      farmerId: farmer._id,
      recommendedCrops,
      advisory: advisoryText,
    });
  } catch (err) {
    console.error('Error in /api/farmers:', err);
    res.status(500).json({ error: 'Server error. Please try again later.' });
  }
});

// GET /api/farmers/:id - fetch a saved farmer record
router.get('/:id', async (req, res) => {
  try {
    const farmer = await Farmer.findById(req.params.id);
    if (!farmer) {
      return res.status(404).json({ error: 'Farmer not found.' });
    }
    res.json(farmer);
  } catch (err) {
    console.error('Error in GET /api/farmers/:id:', err);
    res.status(500).json({ error: 'Server error.' });
  }
});

module.exports = router;

