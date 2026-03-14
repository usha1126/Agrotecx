// Handles form submission, image upload and multilingual UI text.

(function () {
  const farmerForm = document.getElementById('farmerForm');
  const languageSelect = document.getElementById('languageSelect');
  const recommendationPanel = document.getElementById('recommendationPanel');
  const recommendationList = document.getElementById('recommendationList');
  const advisoryText = document.getElementById('advisoryText');

  const imageForm = document.getElementById('imageForm');
  const imageInput = document.getElementById('imageInput');
  const imageResult = document.getElementById('imageResult');
  const imageResultText = document.getElementById('imageResultText');
  const imageFindingsList = document.getElementById('imageFindingsList');

  // Simple text-to-speech helper for crop recommendations and advisory.
  function speakText(text) {
    if (!window.speechSynthesis || !text) return;
    const utterance = new SpeechSynthesisUtterance(text);
    const lang = languageSelect.value;
    if (lang === 'te') {
      utterance.lang = 'te-IN';
    } else if (lang === 'hi') {
      utterance.lang = 'hi-IN';
    } else {
      utterance.lang = 'en-IN';
    }
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  }

  // Labels and text in three languages
  const translations = {
    farmerFormTitle: {
      en: 'Farmer details & crop planner',
      te: 'రైతు వివరాలు & పంట ప్రణాళిక',
      hi: 'किसान विवरण और फसल योजना',
    },
    farmerFormSubtitle: {
      en: 'Enter basic details to get suitable crop recommendations and advisory.',
      te: 'మీ పంటకు సరైన సలహాలు మరియు పంట సూచనలు పొందడానికి వివరాలు ఇవ్వండి.',
      hi: 'उपयुक्त फसल सिफारिश और मार्गदर्शन के लिए विवरण भरें।',
    },
    labelName: {
      en: 'Farmer name',
      te: 'రైతు పేరు',
      hi: 'किसान का नाम',
    },
    labelLocation: {
      en: 'Location',
      te: 'ప్రాంతం',
      hi: 'स्थान',
    },
    labelSoil: {
      en: 'Soil type',
      te: 'మట్టిరకం',
      hi: 'मृदा प्रकार',
    },
    labelSeason: {
      en: 'Season',
      te: 'సీజన్',
      hi: 'मौसम',
    },
    labelWater: {
      en: 'Water availability',
      te: 'నీటి లభ్యత',
      hi: 'पानी की उपलब्धता',
    },
    labelBudget: {
      en: 'Budget (₹)',
      te: 'బడ్జెట్ (₹)',
      hi: 'बजट (₹)',
    },
    submitButton: {
      en: 'Get recommendations',
      te: 'పంట సిఫారసులు పొందండి',
      hi: 'फसल की सिफारिश पाएँ',
    },
    recommendationTitle: {
      en: 'Recommended crops',
      te: 'సిఫారసు చేసిన పంటలు',
      hi: 'अनुशंसित फसलें',
    },
    advisoryTitle: {
      en: 'General advisory',
      te: 'సామాన్య సలహాలు',
      hi: 'सामान्य परामर्श',
    },
    voiceTitle: {
      en: 'Voice-based advisory',
      te: 'వాయిస్ ఆధారిత సలహాలు',
      hi: 'आवाज आधारित सलाह',
    },
    voiceSubtitle: {
      en: 'Ask questions about crops, fertilizer, irrigation, pests and weather.',
      te: 'పంట, ఎరువులు, సాగు నీరు, తుమ్మెదలు మరియు వాతావరణం గురించి అడగండి.',
      hi: 'फसल, उर्वरक, सिंचाई, कीट और मौसम से जुड़े सवाल पूछें।',
    },
    labelQuestion: {
      en: 'Or type your question',
      te: 'లేదా మీ ప్రశ్నను టైప్ చేయండి',
      hi: 'या अपना प्रश्न लिखें',
    },
    askButton: {
      en: 'Get advisory',
      te: 'సలహా పొందండి',
      hi: 'सलाह प्राप्त करें',
    },
    voiceAnswerTitle: {
      en: 'Advisory',
      te: 'సలహా',
      hi: 'सलाह',
    },
    imageTitle: {
      en: 'Crop image upload (prototype)',
      te: 'పంట ఫోటో అప్‌లోడ్ (ప్రోటోటైప్)',
      hi: 'फसल छवि अपलोड (प्रोटोटाइप)',
    },
    imageSubtitle: {
      en: 'Upload a crop image to get a basic, non-diagnostic explanation.',
      te: 'పంట ఫోటో అప్‌లోడ్ చేసి సాదారణ వివరణ పొందండి.',
      hi: 'फसल की तस्वीर अपलोड कर सामान्य विवरण प्राप्त करें।',
    },
    imageResultTitle: {
      en: 'Image analysis (demo)',
      te: 'చిత్ర విశ్లేషణ (డెమో)',
      hi: 'छवि विश्लेषण (डेमो)',
    },
  };

  function setText(id, key) {
    const el = document.getElementById(id);
    if (!el) return;
    const lang = languageSelect.value || 'en';
    el.textContent = translations[key][lang] || translations[key].en;
  }

  function updateLanguageTexts() {
    setText('farmerFormTitle', 'farmerFormTitle');
    setText('farmerFormSubtitle', 'farmerFormSubtitle');
    setText('labelName', 'labelName');
    setText('labelLocation', 'labelLocation');
    setText('labelSoil', 'labelSoil');
    setText('labelSeason', 'labelSeason');
    setText('labelWater', 'labelWater');
    setText('labelBudget', 'labelBudget');
    setText('submitButton', 'submitButton');
    setText('recommendationTitle', 'recommendationTitle');
    setText('advisoryTitle', 'advisoryTitle');
    setText('voiceTitle', 'voiceTitle');
    setText('voiceSubtitle', 'voiceSubtitle');
    setText('labelQuestion', 'labelQuestion');
    setText('askButton', 'askButton');
    setText('voiceAnswerTitle', 'voiceAnswerTitle');
    setText('imageTitle', 'imageTitle');
    setText('imageSubtitle', 'imageSubtitle');
    setText('imageResultTitle', 'imageResultTitle');
  }

  languageSelect.addEventListener('change', updateLanguageTexts);

  // Initialize language labels on first load
  updateLanguageTexts();

  // Farmer form handler
  farmerForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const formData = new FormData(farmerForm);
    const payload = {
      name: formData.get('name'),
      location: formData.get('location'),
      soilType: formData.get('soilType'),
      season: formData.get('season'),
      waterAvailability: formData.get('waterAvailability'),
      budget: parseFloat(formData.get('budget')),
      language: languageSelect.value,
    };

    try {
      const response = await fetch('/api/farmers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to get recommendation');
      }

      recommendationList.textContent = (data.recommendedCrops || []).join(', ');
      advisoryText.textContent = data.advisory || '';
      recommendationPanel.classList.remove('hidden');

      // Speak a short summary of the crop recommendation and advisory.
      const cropsText = (data.recommendedCrops || []).join(', ');
      const spokenSummary =
        (cropsText ? `Recommended crops: ${cropsText}. ` : '') +
        (data.advisory || '');
      speakText(spokenSummary);
    } catch (err) {
      recommendationList.textContent =
        'Unable to calculate crop recommendation. Please try again.';
      advisoryText.textContent = '';
      recommendationPanel.classList.remove('hidden');
      console.error(err);
    }
  });

  // Image upload handler
  imageForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (!imageInput.files || !imageInput.files[0]) {
      alert('Please select an image file first.');
      return;
    }

    const formData = new FormData();
    formData.append('cropImage', imageInput.files[0]);

    try {
      const response = await fetch('/api/upload-image', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to upload image');
      }

      imageResultText.textContent = data.possibleDisease;
      imageFindingsList.innerHTML = '';
      (data.findings || []).forEach((line) => {
        const li = document.createElement('li');
        li.textContent = line;
        imageFindingsList.appendChild(li);
      });
      imageResult.classList.remove('hidden');
    } catch (err) {
      imageResultText.textContent =
        'Unable to analyze image right now. Please try again.';
      imageFindingsList.innerHTML = '';
      imageResult.classList.remove('hidden');
      console.error(err);
    }
  });
})();

