const express = require('express');
const Query = require('../models/Query');

const router = express.Router();

// Simple multilingual advisory snippets keyed by topic.
const advisoryLibrary = {
  fertilizer: {
    en: 'Use balanced NPK dose as per soil test. Apply FYM 5–10 tons/acre and split nitrogen into 2–3 doses.',
    te: 'మట్టి పరీక్ష ఫలితాల ప్రకారం సమతుల్య NPK ఎరువులు వాడాలి. ఎకరాకు 5–10 టన్నుల ఎఫ్‌వైఎమ్ వేసి, నత్రజనాన్ని 2–3 విడతలుగా వేయండి.',
    hi: 'मृदा परीक्षण के अनुसार संतुलित NPK उर्वरक दें। प्रति एकड़ 5–10 टन एफवाईएम दें और नाइट्रोजन को 2–3 बराबर भागों में बांटें।',
  },
  irrigation: {
    en: 'Irrigate based on soil moisture. Avoid waterlogging and prefer drip/sprinkler where possible.',
    te: 'మట్టి తేమను బట్టి నీటిపారుదల చేయండి. నీరు నిల్వ ఉండకుండా జాగ్రత్తపడండి, వీలైతే డ్రిప్/స్ప్రింక్లర్ వాడండి.',
    hi: 'मृदा नमी के आधार पर सिंचाई करें। जलभराव से बचें और संभव हो तो ड्रिप/स्प्रिंकलर का उपयोग करें।',
  },
  pest: {
    en: 'Regularly monitor for pests. Use pheromone traps, light traps and need-based chemical sprays.',
    te: 'కీటకాలను తరచుగా పరిశీలించండి. ఫెరోమోన్ ట్రాప్‌లు, లైట్ ట్రాప్‌లు మరియు అవసరమైతే మాత్రమే రసాయన మందులు వాడండి.',
    hi: 'कीटों की नियमित निगरानी करें। फेरैमोन ट्रैप, लाइट ट्रैप और आवश्यकता अनुसार ही रसायन का छिड़काव करें।',
  },
  weather: {
    en: 'Plan your sowing based on local rainfall forecast. Avoid field operations during heavy rain and ensure drainage for excess water.',
    te: 'స్థానిక వర్షపాతం అంచనాను బట్టి విత్తనాలు వేయండి. భారీ వర్షంలో పనులు చేయకుండా, అదనపు నీరు బయటకు వెళ్లేలా కాలువలు ఏర్పాటు చేయండి.',
    hi: 'स्थानीय वर्षा पूर्वानुमान के अनुसार बुवाई की योजना बनाएं। तेज बारिश में खेत में कार्य न करें और अतिरिक्त पानी की निकासी सुनिश्चित करें।',
  },
  default: {
    en: 'Follow local agricultural university / KVK recommendations for exact dose and schedule.',
    te: 'సరైన మోతాదులు, షెడ్యూల్ కోసం స్థానిక వ్యవసాయ విశ్వవిద్యాలయం / కేఎవికే సూచనలు పాటించండి.',
    hi: 'सही मात्रा और समय के लिए स्थानीय कृषि विश्वविद्यालय / केवीके की सिफारिशें अपनाएँ।',
  },
};

function detectTopic(questionText) {
  const q = questionText.toLowerCase();
  if (q.includes('fertilizer') || q.includes('urea') || q.includes('dap')) {
    return 'fertilizer';
  }
  if (
    q.includes('irrigation') ||
    q.includes('water') ||
    q.includes('neeti') ||
    q.includes('paani')
  ) {
    return 'irrigation';
  }
  if (
    q.includes('pest') ||
    q.includes('insect') ||
    q.includes('keeda') ||
    q.includes('rogam')
  ) {
    return 'pest';
  }
  if (
    q.includes('weather') ||
    q.includes('rain') ||
    q.includes('mausam') ||
    q.includes('climate')
  ) {
    return 'weather';
  }
  return 'default';
}

// POST /api/advisory/ask - handle text/voice queries
router.post('/ask', async (req, res) => {
  try {
    const { questionText, language } = req.body;

    if (!questionText) {
      return res.status(400).json({ error: 'questionText is required.' });
    }

    const lang = ['en', 'te', 'hi'].includes(language) ? language : 'en';
    const topic = detectTopic(questionText);
    const snippets = advisoryLibrary[topic] || advisoryLibrary.default;
    const answerText = snippets[lang] || snippets.en;

    await Query.create({
      farmerName: req.body.farmerName || '',
      language: lang,
      questionText,
      answerText,
      meta: {
        topic,
        source: 'rule-based',
      },
    });

    res.json({
      topic,
      answer: answerText,
    });
  } catch (err) {
    console.error('Error in /api/advisory/ask:', err);
    res.status(500).json({ error: 'Server error. Please try again later.' });
  }
});

module.exports = router;

