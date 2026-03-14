// Basic voice assistant client using the Web Speech API where available.
// NOTE: Actual offline speech recognition support depends on the browser
// and device. On some platforms Web Speech can work with an offline model;
// on others it will call a built-in network service. As a fallback,
// farmers can always type their questions.

(function () {
  const micButton = document.getElementById('micButton');
  const languageSelect = document.getElementById('languageSelect');
  const questionInput = document.getElementById('questionInput');
  const askButton = document.getElementById('askButton');
  const quickTopicButtons = document.querySelectorAll('.quick-topic-btn');
  const voiceResultCard = document.getElementById('voiceResult');
  const voiceAnswerText = document.getElementById('voiceAnswerText');

  let recognition = null;
  let isListening = false;

  function getCurrentLanguageCode() {
    const lang = languageSelect.value;
    if (lang === 'te') return 'te-IN';
    if (lang === 'hi') return 'hi-IN';
    return 'en-IN';
  }

  function createRecognition() {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      return null;
    }
    const rec = new SpeechRecognition();
    rec.lang = getCurrentLanguageCode();
    rec.interimResults = false;
    rec.maxAlternatives = 1;
    return rec;
  }

  // Text-to-speech helper using the Web Speech synthesis API.
  // This can work fully offline on some devices/browsers when local
  // voices are available.
  function speakText(text) {
    if (!window.speechSynthesis || !text) return;
    const utterance = new SpeechSynthesisUtterance(text);
    // Match voice language with selected UI language.
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

  function ensureRecognition() {
    if (!recognition) {
      recognition = createRecognition();
    } else {
      recognition.lang = getCurrentLanguageCode();
    }
    return recognition;
  }

  async function fetchAdvisory(questionText) {
    if (!questionText || !questionText.trim()) {
      return;
    }
    try {
      const response = await fetch('/api/advisory/ask', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          questionText,
          language: languageSelect.value,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to get advisory');
      }

      voiceAnswerText.textContent = data.answer;
      voiceResultCard.classList.remove('hidden');
      // Speak the advisory response aloud in the selected language.
      speakText(data.answer);
    } catch (err) {
      voiceAnswerText.textContent =
        'Unable to fetch advisory right now. Please try again.';
      voiceResultCard.classList.remove('hidden');
      console.error(err);
    }
  }

  // Handle "Get advisory" button
  askButton.addEventListener('click', () => {
    const questionText = questionInput.value;
    fetchAdvisory(questionText);
  });

  // Handle quick topic shortcut buttons (fertilizer, irrigation, pest, weather)
  quickTopicButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const topic = btn.getAttribute('data-topic');
      let exampleQuestion = '';
      switch (topic) {
        case 'fertilizer':
          exampleQuestion = 'Fertilizer recommendation for my crop.';
          break;
        case 'irrigation':
          exampleQuestion = 'How often should I irrigate my field?';
          break;
        case 'pest':
          exampleQuestion = 'How can I control pests in my crop?';
          break;
        case 'weather':
          exampleQuestion = 'How should I plan sowing based on weather?';
          break;
        default:
          exampleQuestion = '';
      }
      if (exampleQuestion) {
        questionInput.value = exampleQuestion;
        fetchAdvisory(exampleQuestion);
      }
    });
  });

  // Handle microphone button
  micButton.addEventListener('click', () => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert(
        'Voice recognition is not supported in this browser. You can type your question instead.'
      );
      return;
    }

    if (isListening) {
      recognition && recognition.stop();
      return;
    }

    recognition = ensureRecognition();
    if (!recognition) {
      alert(
        'Voice recognition is not available. Please type your question instead.'
      );
      return;
    }

    isListening = true;
    micButton.classList.add('listening');

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      questionInput.value = transcript;
      fetchAdvisory(transcript);
    };

    recognition.onerror = () => {
      isListening = false;
      micButton.classList.remove('listening');
    };

    recognition.onend = () => {
      isListening = false;
      micButton.classList.remove('listening');
    };

    recognition.start();
  });
})();

