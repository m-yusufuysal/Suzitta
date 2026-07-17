// Suzi'nin Papatya Bahçesi - Core Application Logic (Gold Edition)

let appState = {
  points: 0,
  completedLessons: [], // list of lesson ids completed (e.g. ["l1_1"])
  wordBank: [], // list of Turkish words marked as learned
  activeLevelId: 1,
  activeLesson: null,
  activeTab: "intro",
  activeHub: "garden", // "garden", "dictionary", "wordbank"
  pluckedPetals: [], // Index of vocab card selected in active lesson
  quizIndex: 0,
  quizQuestions: [], // dynamically generated quiz questions
  quizAnswers: [],
  suffixCurrentWordIndex: 0,
  suffixAssembled: [],
  isMuted: false,
  streak: 1
};

// Initialize Application
document.addEventListener("DOMContentLoaded", () => {
  normalizeLearningDatabase();
  loadProgress();
  setupEventListeners();
  renderLevelsList();
  showLevelOverview(appState.activeLevelId);
  setupMainHubsRouter();
  populateDictionaryThemes();
  renderDictionaryTable();
  updateOverallProgress();

  // Show welcome modal if not welcomed in this session
  const welcomed = sessionStorage.getItem("suzi_tr_welcomed");
  if (welcomed === "true") {
    const modal = document.getElementById("welcome-modal");
    if (modal) modal.style.display = "none";
    triggerYusufMessage(learningDatabase.yusufFeedback.welcome);
  }
});

// Setup DOM Event Listeners
function setupEventListeners() {
  // Welcome Modal Start Button
  const welcomeStartBtn = document.getElementById("btn-welcome-start");
  if (welcomeStartBtn) {
    welcomeStartBtn.addEventListener("click", () => {
      // User gesture allows audio to play
      initAudioContext();
      
      // Play arpeggiated major chord
      playSynthTone(523.25, "sine", 0.3); // C5
      setTimeout(() => playSynthTone(659.25, "sine", 0.3), 100); // E5
      setTimeout(() => playSynthTone(783.99, "sine", 0.3), 200); // G5
      setTimeout(() => playSynthTone(1046.50, "sine", 0.5), 300); // C6

      // Hide modal
      const modal = document.getElementById("welcome-modal");
      if (modal) {
        modal.classList.add("fade-out");
        setTimeout(() => {
          modal.style.display = "none";
        }, 400);
      }

      sessionStorage.setItem("suzi_tr_welcomed", "true");

      // Initial greeting
      triggerYusufMessage(learningDatabase.yusufFeedback.welcome);
      speakText(learningDatabase.yusufFeedback.welcome, true);
      
      // Highlight study streak
      if (appState.streak > 1) {
        setTimeout(() => {
          const msg = `Harika Suzi! Çalışma serin devam ediyor! Tam ${appState.streak} gündür üst üste Türkçe öğreniyorsun! 🔥`;
          triggerYusufMessage(msg);
          speakText(msg);
        }, 4000);
      }
    });
  }

  // Voice Speed Selector
  document.getElementById("voice-speed").addEventListener("change", () => {
    const speed = document.getElementById("voice-speed").value;
    triggerYusufMessage(`Ses hızı ${speed}x olarak ayarlandı Suzi! 🗣️`);
  });

  // Audio Test Button
  document.getElementById("btn-audio-test").addEventListener("click", () => {
    const testText = "Merhaba Suzi! Türkçe öğrenme bahçene hoş geldin.";
    speakText(testText);
    triggerYusufMessage("Ses sistemini kontrol ettim, gayet iyi duyuluyor! 🔊");
  });

  // Back to Garden Button
  document.getElementById("btn-back-to-garden").addEventListener("click", () => {
    exitActiveLesson();
  });

  // Workspace Tabs Selector
  const tabs = document.querySelectorAll(".ws-tab-btn");
  tabs.forEach(tab => {
    tab.addEventListener("click", (e) => {
      const targetTab = e.target.getAttribute("data-tab");
      switchTab(targetTab);
    });
  });

  // Start vocabulary plucker button inside intro tab
  document.getElementById("btn-start-petals").addEventListener("click", () => {
    switchTab("words");
  });

  // Voice playback inside word details cards
  document.getElementById("word-card-detail").addEventListener("click", (e) => {
    const speechBtn = e.target.closest(".word-speech-btn");
    if (speechBtn) {
      const word = speechBtn.getAttribute("data-word");
      speakText(word);
    }
  });

  // Interactive Yusuf Mascot Avatar click -> reads bubble text out loud
  document.getElementById("yusuf-avatar-btn").addEventListener("click", () => {
    const bubbleText = document.getElementById("yusuf-text").textContent;
    speakText(bubbleText);
    const mascot = document.getElementById("yusuf-avatar-wrapper");
    mascot.style.transform = "scale(1.15) rotate(-3deg)";
    setTimeout(() => { mascot.style.transform = ""; }, 300);
  });

  // Dictionary Search Filters Events
  document.getElementById("dict-search-input").addEventListener("input", renderDictionaryTable);
  document.getElementById("dict-level-filter").addEventListener("change", renderDictionaryTable);
  document.getElementById("dict-theme-filter").addEventListener("change", renderDictionaryTable);
  document.getElementById("dict-only-cognates").addEventListener("change", renderDictionaryTable);
  document.getElementById("dict-only-unlearned").addEventListener("change", renderDictionaryTable);

  // Mute Toggle Button
  document.getElementById("btn-mute-toggle").addEventListener("click", () => {
    appState.isMuted = !appState.isMuted;
    const btn = document.getElementById("btn-mute-toggle");
    btn.textContent = appState.isMuted ? '🔇' : '🔊';
    btn.classList.toggle('muted', appState.isMuted);
    if (appState.isMuted) {
      window.speechSynthesis.cancel();
      triggerYusufMessage("Ses kapatıldı. Sessiz modda çalışıyorsun.");
    } else {
      triggerYusufMessage("Ses açıldı! Telaffuzları dinleyebilirsin.");
    }
  });

  // Level Up Modal Next Button
  document.getElementById("btn-lvl-up-next").addEventListener("click", () => {
    dismissLevelUpAndAdvance();
  });

  setupGamificationActions();
}

// Router switcher for three Main Navigation Hubs (Garden, Dictionary, Wordbank)
function setupMainHubsRouter() {
  const gardenBtn = document.getElementById("nav-btn-garden");
  const dictBtn = document.getElementById("nav-btn-dictionary");
  const bankBtn = document.getElementById("nav-btn-bank");

  const viewGarden = document.getElementById("view-garden");
  const viewDict = document.getElementById("view-dictionary");
  const viewBank = document.getElementById("view-wordbank");

  const sidebarLevelNav = document.getElementById("sidebar-level-section");

  const switchHub = (hubName) => {
    appState.activeHub = hubName;
    
    // Toggle active buttons
    gardenBtn.classList.toggle("active", hubName === "garden");
    dictBtn.classList.toggle("active", hubName === "dictionary");
    bankBtn.classList.toggle("active", hubName === "wordbank");

    // Toggle view panels
    viewGarden.style.display = hubName === "garden" ? "block" : "none";
    viewDict.style.display = hubName === "dictionary" ? "block" : "none";
    viewBank.style.display = hubName === "wordbank" ? "block" : "none";

    // Level selector visible only on garden path
    sidebarLevelNav.style.display = hubName === "garden" ? "block" : "none";

    if (hubName === "dictionary") {
      renderDictionaryTable();
    } else if (hubName === "wordbank") {
      renderWordbankDashboard();
    }
  };

  gardenBtn.addEventListener("click", () => switchHub("garden"));
  dictBtn.addEventListener("click", () => switchHub("dictionary"));
  bankBtn.addEventListener("click", () => switchHub("wordbank"));
}

// Local Storage Progress Sync
function saveProgress() {
  localStorage.setItem("suzi_tr_points", appState.points);
  localStorage.setItem("suzi_tr_completed", JSON.stringify(appState.completedLessons));
  localStorage.setItem("suzi_tr_wordbank", JSON.stringify(appState.wordBank));
}

function loadProgress() {
  const savedPoints = localStorage.getItem("suzi_tr_points");
  if (savedPoints !== null) appState.points = parseInt(savedPoints);
  
  const savedCompleted = localStorage.getItem("suzi_tr_completed");
  if (savedCompleted !== null) appState.completedLessons = safeParseArray(savedCompleted);

  const savedWordBank = localStorage.getItem("suzi_tr_wordbank");
  if (savedWordBank !== null) appState.wordBank = safeParseArray(savedWordBank);

  document.getElementById("daisy-points").textContent = appState.points;
  
  // Calculate daily streak
  updateDailyStreak();
}

function safeParseArray(value) {
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.warn("Saved progress could not be read; starting with a clean list.", error);
    return [];
  }
}

function normalizeLearningDatabase() {
  if (typeof learningDatabase === "undefined" || learningDatabase.__normalized) return;

  const arabicCognates = {
    merhaba: { root: "مرحبا", ar: "مرحباً", sentence: "Merhaba, Suzi; bugün Türkçe dersine sakin ve düzenli başlıyoruz.", sentence_ar: "مرحباً يا سوزي؛ نبدأ اليوم درس التركية بهدوء وانتظام.", sentence_en: "Hello, Suzi; today we begin the Turkish lesson calmly and methodically." },
    kitap: { root: "كتاب", ar: "كتاب", sentence: "Bu kitap, Türkçe cümle kurmayı adım adım öğretiyor.", sentence_ar: "هذا الكتاب يعلّم بناء الجملة التركية خطوةً خطوة.", sentence_en: "This book teaches Turkish sentence building step by step." },
    aile: { root: "عائلة", ar: "عائلة", sentence: "Ailemle her akşam kısa Türkçe cümleler tekrar ediyorum.", sentence_ar: "أراجع جملاً تركية قصيرة مع عائلتي كل مساء.", sentence_en: "I review short Turkish sentences with my family every evening." },
    kalem: { root: "قلم", ar: "قلم", sentence: "Kalem ile yeni kelimeleri defterime yazıyorum.", sentence_ar: "أكتب الكلمات الجديدة بالقلم في دفتري.", sentence_en: "I write new words in my notebook with a pen." },
    ders: { root: "درس", ar: "درس", sentence: "Ders başlamadan önce hedefimi belirliyorum.", sentence_ar: "أحدد هدفي قبل أن يبدأ الدرس.", sentence_en: "I set my goal before the lesson begins." },
    saat: { root: "ساعة", ar: "ساعة", sentence: "Saat dokuzda on dakikalık telaffuz çalışması yapıyorum.", sentence_ar: "في الساعة التاسعة أتدرّب على النطق عشر دقائق.", sentence_en: "At nine o’clock I practice pronunciation for ten minutes." },
    sabah: { root: "صباح", ar: "صباح", sentence: "Sabah öğrenilen kelimeler gün içinde daha kolay hatırlanır.", sentence_ar: "الكلمات التي تُتعلّم صباحاً يسهل تذكّرها خلال اليوم.", sentence_en: "Words learned in the morning are easier to remember during the day." },
    cevap: { root: "جواب", ar: "جواب / إجابة", sentence: "Doğru cevabı seçmeden önce cümlenin anlamını düşün.", sentence_ar: "فكّري في معنى الجملة قبل اختيار الجواب الصحيح.", sentence_en: "Think about the sentence meaning before choosing the correct answer." },
    soru: { root: "سؤال", ar: "سؤال", sentence: "Her soru, Türkçeyi daha net anlamak için bir fırsattır.", sentence_ar: "كل سؤال فرصة لفهم التركية بوضوح أكبر.", sentence_en: "Every question is an opportunity to understand Turkish more clearly." },
    renk: { root: "رنگ/رنك", ar: "لون", sentence: "Renk adlarını öğrenirken gerçek nesnelerle örnek kuruyoruz.", sentence_ar: "عند تعلم أسماء الألوان نكوّن أمثلة بأشياء حقيقية.", sentence_en: "While learning color names, we make examples with real objects." }
  };

  const polishWord = (wordObj) => {
    const key = (wordObj.word || "").toLocaleLowerCase("tr-TR");
    const cognate = arabicCognates[key];
    if (cognate) {
      wordObj.isCognate = true;
      wordObj.arabicRoot = cognate.root;
      wordObj.translation_ar = cognate.ar;
      wordObj.sentence = cognate.sentence;
      wordObj.sentence_ar = cognate.sentence_ar;
      wordObj.sentence_en = cognate.sentence_en;
      wordObj.academicNote = `Arapça ile ortak kök/benzerlik: ${cognate.root}. Türkçede telaffuz ve cümle içindeki görev değişebilir.`;
    } else if (!wordObj.sentence || /hakkında kısa ve yararlı bir açıklama yaptı|alıştırması yaptı|gerçek bir bağlam içinde açıkladı/.test(wordObj.sentence)) {
      wordObj.sentence = buildMeaningfulSentence(wordObj);
      wordObj.sentence_ar = buildMeaningfulArabicSentence(wordObj);
      wordObj.sentence_en = `We use “${wordObj.word}” in a clear, realistic Turkish sentence.`;
    }
  };

  ensureMinimumDictionarySize(2500);
  enrichLessonsForAcademicPath();

  learningDatabase.levels.forEach((level) => {
    level.description = `${level.description} Her ders; hedef, anlam, telaffuz, Arapça köprü ve kısa sınav sırasıyla ilerler.`;
    level.lessons.forEach((lesson) => {
      lesson.intro = `${lesson.intro} Önce anlamı kavra, sonra telaffuzu dinle, ardından örnek cümleyi okuyup mini sınavla pekiştir.`;
      (lesson.vocabulary || []).forEach(polishWord);
    });
  });
  (learningDatabase.vocabularyBank || []).forEach(polishWord);

  learningDatabase.yusufFeedback.welcome = "Hoş geldin Suzi! Bu akademik Türkçe yolculuğunda hedefimiz net: anlamı doğru kurmak, telaffuzu bilinçli geliştirmek ve her kelimeyi gerçek bir bağlamda kullanmak. Arapça ile ortak kelimelerde sana özel köprüler göstereceğim. 🌼";
  learningDatabase.__normalized = true;
}

function ensureMinimumDictionarySize(minimumSize) {
  if (!Array.isArray(learningDatabase.vocabularyBank)) learningDatabase.vocabularyBank = [];

  const existing = new Set(learningDatabase.vocabularyBank.map(w => (w.word || "").toLocaleLowerCase("tr-TR")));
  const academicThemes = [
    { category: "Bahçe ve Doğa", words: ["bahçe", "papatya", "yaprak", "çiçek", "toprak", "tohum", "fidan", "ağaç", "dal", "kök", "çimen", "sulama", "güneş", "gölge", "rüzgâr", "yağmur", "arı", "kelebek", "kuş", "koku", "renk", "mevsim", "ilkbahar", "sonbahar", "doğa", "patika", "çit", "saksı", "sera", "gübre"], ar: "الحديقة والطبيعة", en: "garden and nature" },
    { category: "Akademik Yol", words: ["hedef", "plan", "adım", "konu", "başlık", "içerik", "örnek", "cümle", "anlam", "telaffuz", "dinleme", "okuma", "yazma", "konuşma", "tekrar", "alıştırma", "sınav", "başarı", "ilerleme", "seviye", "yöntem", "not", "özet", "analiz", "kanıt", "yorum", "araştırma", "kaynak", "kural", "bağlam"], ar: "المسار الأكاديمي", en: "academic path" },
    { category: "Günlük Yaşam", words: ["ev", "oda", "mutfak", "kapı", "pencere", "masa", "sandalye", "defter", "kalem", "kitap", "çanta", "telefon", "saat", "yemek", "su", "çay", "kahve", "ekmek", "pazar", "otobüs", "durak", "okul", "sınıf", "öğretmen", "öğrenci", "arkadaş", "aile", "şehir", "sokak", "mağaza"], ar: "الحياة اليومية", en: "daily life" },
    { category: "Duygu ve İletişim", words: ["sevinç", "sabır", "dikkat", "cesaret", "merak", "saygı", "güven", "yardım", "rica", "cevap", "soru", "selam", "teşekkür", "özür", "düşünce", "fikir", "karar", "istek", "ihtiyaç", "duygu", "ses", "söz", "ifade", "hikâye", "sohbet", "haber", "mesaj", "açıklama", "anlaşma", "iletişim"], ar: "المشاعر والتواصل", en: "feelings and communication" }
  ];
  const forms = [
    { suffix: "", ar: "", en: "" },
    { suffix: "lar", ar: "جمع", en: "plural" },
    { suffix: "lik", ar: "صفة/مجال", en: "-ness / field" },
    { suffix: "li", ar: "ذو", en: "with / from" },
    { suffix: "siz", ar: "بلا", en: "without" },
    { suffix: "cı", ar: "فاعل", en: "person related to" },
    { suffix: "de", ar: "في", en: "in / at" },
    { suffix: "den", ar: "من", en: "from" },
    { suffix: "im", ar: "ـي", en: "my" },
    { suffix: "imiz", ar: "ـنا", en: "our" }
  ];

  const makeForm = (root, form) => {
    if (!form.suffix) return root;
    const last = root[root.length - 1];
    if (form.suffix === "lar") return root + (/[eiöü]/i.test(root) ? "ler" : "lar");
    if (form.suffix === "lik") return root + (/[eiöü]/i.test(root) ? "lik" : "lık");
    if (form.suffix === "li") return root + (/[eiöü]/i.test(root) ? "li" : "lı");
    if (form.suffix === "siz") return root + (/[eiöü]/i.test(root) ? "siz" : "sız");
    if (form.suffix === "cı") return root + (/[eiöü]/i.test(root) ? "ci" : "cı");
    if (form.suffix === "de") return root + (/[fstkçşhp]/i.test(last) ? "te" : "de");
    if (form.suffix === "den") return root + (/[fstkçşhp]/i.test(last) ? "ten" : "den");
    if (form.suffix === "im") return root + (/[aeıioöuü]/i.test(last) ? "m" : (/[eiöü]/i.test(root) ? "im" : "ım"));
    if (form.suffix === "imiz") return root + (/[aeıioöuü]/i.test(last) ? "miz" : (/[eiöü]/i.test(root) ? "imiz" : "ımız"));
    return root + form.suffix;
  };

  let level = 1;
  academicThemes.forEach(theme => {
    theme.words.forEach(root => {
      forms.forEach(form => {
        if (learningDatabase.vocabularyBank.length >= minimumSize) return;
        const word = makeForm(root, form);
        const key = word.toLocaleLowerCase("tr-TR");
        if (existing.has(key)) return;
        existing.add(key);
        const context = theme.category === "Bahçe ve Doğa" ? "papatya bahçesinde" : "öğrenme bahçesinde";
        learningDatabase.vocabularyBank.push({
          word,
          pronunciation: word,
          translation_ar: `${root} ${form.ar}`.trim(),
          translation_en: `${root} ${form.en}`.trim(),
          translation_zh: theme.en,
          isCognate: false,
          arabicRoot: "",
          sentence: `Suzi, ${context} “${word}” kelimesini doğru bir örnekle tekrar eder.`,
          sentence_ar: `تراجع سوزي كلمة «${word}» في سياق واضح مرتبط بـ ${theme.ar}.`,
          sentence_en: `Suzi reviews “${word}” in a clear context connected with ${theme.en}.`,
          sentence_zh: theme.en,
          level: Math.min(level, 5),
          category: theme.category,
          wordType: "n",
          academicNote: "Bu kelime, bahçe temalı akademik öğrenme yolunda anlam-bağlam-cümle sırasıyla çalışılır."
        });
      });
      level = level === 5 ? 1 : level + 1;
    });
  });
  const learningActions = [
    { suffix: " öğrenmek", ar: "تعلم", en: "to learn" },
    { suffix: " okumak", ar: "قراءة", en: "to read" },
    { suffix: " yazmak", ar: "كتابة", en: "to write" },
    { suffix: " dinlemek", ar: "استماع", en: "to listen to" },
    { suffix: " tekrarı", ar: "مراجعة", en: "review of" },
    { suffix: " cümlesi", ar: "جملة", en: "sentence of" },
    { suffix: " kartı", ar: "بطاقة", en: "card of" },
    { suffix: " oyunu", ar: "لعبة", en: "game of" }
  ];
  academicThemes.forEach(theme => {
    theme.words.forEach(root => {
      learningActions.forEach(action => {
        if (learningDatabase.vocabularyBank.length >= minimumSize) return;
        const word = `${root}${action.suffix}`;
        const key = word.toLocaleLowerCase("tr-TR");
        if (existing.has(key)) return;
        existing.add(key);
        learningDatabase.vocabularyBank.push({
          word,
          pronunciation: word,
          translation_ar: `${action.ar} ${root}`,
          translation_en: `${action.en} ${root}`,
          translation_zh: theme.en,
          isCognate: false,
          arabicRoot: "",
          sentence: `Suzi, papatya bahçesinde “${word}” etkinliğini tamamlayarak konuyu pekiştirir.`,
          sentence_ar: `تُكمل سوزي نشاط «${word}» في حديقة الأقحوان لتثبيت الموضوع.`,
          sentence_en: `Suzi completes the “${word}” activity in the daisy garden to reinforce the topic.`,
          sentence_zh: theme.en,
          level: Math.min(level, 5),
          category: theme.category,
          wordType: action.suffix.trim().endsWith("mek") || action.suffix.trim().endsWith("mak") ? "v" : "n",
          academicNote: "Oyunlaştırılmış görev, kelimeyi yalnız ezberletmez; dinleme, okuma ve doğru cümleyle kullandırır."
        });
      });
      level = level === 5 ? 1 : level + 1;
    });
  });

}

function enrichLessonsForAcademicPath() {
  learningDatabase.levels.forEach((level) => {
    level.lessons.forEach((lesson, index) => {
      lesson.milestone = `${level.title.split(":")[0]} • Adım ${index + 1}: dinle, oku, örnekle, uygula, sınavla kanıtla.`;
      lesson.successCriteria = [
        "Kelimelerin anlamını Arapça/İngilizce köprüyle açıklar.",
        "Telaffuzu dinleyip örnek cümleyi sesli tekrar eder.",
        "Mini sınavda bağlama uygun cevabı seçer."
      ];
    });
  });
}

function buildMeaningfulSentence(wordObj) {
  if (wordObj.wordType === "v") return `Bugün “${wordObj.word}” fiilini kısa ve doğru bir cümlede kullanıyoruz.`;
  if (wordObj.wordType === "a") return `Bu örnekte “${wordObj.word}” kelimesi bir ismi açıklıyor.`;
  return `“${wordObj.word}” kelimesini günlük ve anlaşılır bir bağlamda öğreniyoruz.`;
}

function buildMeaningfulArabicSentence(wordObj) {
  if (wordObj.wordType === "v") return `نستخدم فعل «${wordObj.translation_ar}» في جملة تركية قصيرة وصحيحة.`;
  return `نتعلم كلمة «${wordObj.translation_ar}» ضمن سياق يومي واضح.`;
}

function updateDailyStreak() {
  const today = new Date().toDateString();
  const lastDate = localStorage.getItem("suzi_tr_last_study_date");
  let streak = parseInt(localStorage.getItem("suzi_tr_streak") || "0");
  
  if (lastDate === today) {
    if (streak === 0) streak = 1;
  } else if (lastDate) {
    const lastDateObj = new Date(lastDate);
    const todayObj = new Date(today);
    const diffTime = Math.abs(todayObj - lastDateObj);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) {
      streak++;
    } else if (diffDays > 1) {
      streak = 1;
    }
  } else {
    streak = 1;
  }
  
  localStorage.setItem("suzi_tr_last_study_date", today);
  localStorage.setItem("suzi_tr_streak", streak);
  appState.streak = streak;
  
  const streakEl = document.getElementById("streak-days");
  if (streakEl) {
    streakEl.textContent = `${streak} Gün`;
  }
}

// Render Sidebar Level List
function renderLevelsList() {
  const levelsContainer = document.getElementById("levels-list");
  levelsContainer.innerHTML = "";

  learningDatabase.levels.forEach(level => {
    const isLocked = isLevelLocked(level.id);
    const isActive = level.id === appState.activeLevelId;

    const navItem = document.createElement("div");
    navItem.className = `level-nav-item ${isActive ? 'active' : ''} ${isLocked ? 'locked' : ''}`;
    navItem.style.setProperty('--level-color', level.color);
    
    const totalLessons = level.lessons.length;
    const completedInLevel = level.lessons.filter(l => appState.completedLessons.includes(l.id)).length;
    const levelDone = completedInLevel === totalLessons;

    navItem.innerHTML = `
      <div class="level-nav-header">
        <span class="level-tag" style="color: ${level.color}">${level.id === 5 ? 'C1' : 'A' + level.id} Seviye</span>
        <span class="level-lock-icon">${isLocked ? '🔒' : levelDone ? '🌸' : '🌱'}</span>
      </div>
      <div class="level-title">${level.title.split(":")[1] || level.title}</div>
      <div class="level-ar-title">${level.arabicTitle}</div>
    `;

    if (!isLocked) {
      navItem.addEventListener("click", () => {
        document.querySelectorAll(".level-nav-item").forEach(item => item.classList.remove("active"));
        navItem.classList.add("active");
        
        appState.activeLevelId = level.id;
        showLevelOverview(level.id);
      });
    }

    levelsContainer.appendChild(navItem);
  });
}

function isLevelLocked(levelId) {
  // BÜTÜN KİLİTLER AÇIK (Duolingo tarzı ama tamamen özgür)
  return false;
}

// Render Level Overview Dashboard
function showLevelOverview(levelId) {
  document.getElementById("active-lesson-section").style.display = "none";
  const levelOverview = document.getElementById("level-overview-section");
  levelOverview.style.display = "flex";

  const activeLevel = learningDatabase.levels.find(l => l.id === levelId);
  
  document.getElementById("current-level-title").textContent = activeLevel.title;
  document.getElementById("current-level-title").style.color = activeLevel.color;
  document.getElementById("current-level-ar-title").textContent = activeLevel.arabicTitle;
  document.getElementById("current-level-desc").textContent = activeLevel.description;

  const lessonsGrid = document.getElementById("lessons-list");
  lessonsGrid.innerHTML = "";

  activeLevel.lessons.forEach((lesson, index) => {
    const isCompleted = appState.completedLessons.includes(lesson.id);
    const card = document.createElement("div");
    card.className = `lesson-card ${isCompleted ? 'completed' : ''}`;
    
    card.innerHTML = `
      <div class="lesson-card-header">
        <span class="lesson-badge">Ders ${index + 1}</span>
        <span class="status-badge">${isCompleted ? '🌸 Başarıldı' : '🌱 Hazır'}</span>
      </div>
      <h3>${lesson.title}</h3>
      <div class="ar-h3">${lesson.arabicTitle}</div>
      <p>${lesson.summary}</p>
      <button class="start-lesson-btn">Çalışmaya Başla</button>
    `;

    card.addEventListener("click", () => {
      enterActiveLesson(lesson);
    });

    lessonsGrid.appendChild(card);
  });
}

// Compute total progress percentage
function updateOverallProgress() {
  let totalLessons = 0;
  learningDatabase.levels.forEach(lvl => {
    totalLessons += lvl.lessons.length;
  });

  const completedCount = appState.completedLessons.length;
  const percentage = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;
  
  document.getElementById("progress-percent").textContent = `${percentage}%`;
  document.getElementById("overall-progress-bar").style.width = `${percentage}%`;
}

// Enter Lesson Workspace
function enterActiveLesson(lesson) {
  appState.activeLesson = lesson;
  appState.activeTab = "intro";
  appState.pluckedPetals = [];

  document.getElementById("level-overview-section").style.display = "none";
  document.getElementById("active-lesson-section").style.display = "flex";

  document.getElementById("ws-lesson-title").textContent = lesson.title;
  document.getElementById("ws-lesson-ar-title").textContent = `${lesson.arabicTitle} • ${lesson.englishTitle}`;
  
  const hasVocab = lesson.vocabulary && lesson.vocabulary.length > 0;
  const hasGrammar = lesson.grammar !== undefined || lesson.suffixBuilder !== undefined;
  
  document.getElementById("tab-btn-words").style.display = hasVocab ? "block" : "none";
  document.getElementById("tab-btn-grammar").style.display = hasGrammar ? "block" : "none";

  document.getElementById("intro-lesson-eng-title").textContent = lesson.englishTitle;
  document.getElementById("intro-lesson-text").innerHTML = `
    <strong>Giriş Notları:</strong><br>
    ${lesson.intro}<br><br>
    <em>Profesyonel kelimeler ve örnek cümlelerin kilidini açmak için çalışmaya başlayalım!</em>
  `;

  initPlantGrowthSvg(appState.completedLessons.includes(lesson.id));
  switchTab("intro");
  
  renderAcademicPathCard(lesson);

  const welcomeMsg = `Suzi! "${lesson.title}" dersine geldik. Başarılar dilerim! 🌸`;
  triggerYusufMessage(welcomeMsg);
  speakText(welcomeMsg);
}

function exitActiveLesson() {
  appState.activeLesson = null;
  showLevelOverview(appState.activeLevelId);
  renderLevelsList();
  updateOverallProgress();
}

function renderAcademicPathCard(lesson) {
  const intro = document.getElementById("intro-lesson-text");
  if (!intro) return;
  const criteria = (lesson.successCriteria || []).map(item => `<li>✅ ${item}</li>`).join("");
  intro.innerHTML += `
    <div class="academic-path-card">
      <div class="path-pill">🎓 Akademik Yol Haritası</div>
      <strong>${lesson.milestone || "Anlam → Telaffuz → Cümle → Pratik → Sınav"}</strong>
      <ul>${criteria}</ul>
      <div class="path-steps">
        <span>1 Dinle</span><span>2 Yaprak seç</span><span>3 Cümle kur</span><span>4 Öğrendim</span><span>5 Sınav</span>
      </div>
    </div>`;
}

// Tabs switcher
function switchTab(tabName) {
  appState.activeTab = tabName;

  const tabButtons = document.querySelectorAll(".ws-tab-btn");
  tabButtons.forEach(btn => {
    btn.classList.toggle("active", btn.getAttribute("data-tab") === tabName);
  });

  const panels = document.querySelectorAll(".tab-content-panel");
  panels.forEach(panel => {
    panel.classList.toggle("active", panel.id === `tab-${tabName}`);
  });

  if (tabName === "words") {
    setupVocabularyDeck();
  } else if (tabName === "grammar") {
    setupGrammarSection();
  } else if (tabName === "quiz") {
    setupQuizSection();
  }
}

// TAB 1: Plant growth SVG helper
function initPlantGrowthSvg(alreadyCompleted) {
  const stem = document.getElementById("plant-stem");
  const leafL = document.getElementById("plant-leaf-l");
  const leafR = document.getElementById("plant-leaf-r");
  const flower = document.getElementById("plant-flower");

  stem.setAttribute("d", "M 100 180 Q 100 180 100 180");
  leafL.style.display = "none";
  leafR.style.display = "none";
  flower.style.display = "none";

  if (alreadyCompleted) {
    stem.setAttribute("d", "M 100 180 Q 80 130 100 80");
    leafL.style.display = "block";
    leafR.style.display = "block";
    flower.style.display = "block";
  } else {
    setTimeout(() => {
      stem.style.transition = "d 2s ease-out";
      stem.setAttribute("d", "M 100 180 Q 90 150 100 120");
    }, 500);

    setTimeout(() => {
      leafL.style.display = "block";
      leafL.style.animation = "fadeIn 0.5s forwards";
    }, 1500);
  }
}

function advancePlantGrowth() {
  const stem = document.getElementById("plant-stem");
  const leafR = document.getElementById("plant-leaf-r");
  const flower = document.getElementById("plant-flower");

  if (appState.activeTab === "words" && leafR.style.display === "none") {
    stem.setAttribute("d", "M 100 180 Q 80 130 100 80");
    leafR.style.display = "block";
    leafR.style.animation = "fadeIn 0.5s forwards";
  } else if (appState.activeTab === "grammar" && flower.style.display === "none") {
    flower.style.display = "block";
    flower.style.animation = "scaleIn 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards";
  }
}

// TAB 2: Vocabulary Cards Deck Layout (Simplified, high-density study mode)
function setupVocabularyDeck() {
  const deckContainer = document.getElementById("vocab-cards-deck");
  const words = appState.activeLesson.vocabulary || [];

  // Reset info box
  document.getElementById("word-empty-view").style.display = "flex";
  document.getElementById("word-card-detail").style.display = "none";

  deckContainer.innerHTML = "";
  if (words.length === 0) return;

  // Build card deck items
  words.forEach((vocab, idx) => {
    const isLearned = appState.wordBank.includes(vocab.word.toLowerCase());
    const card = document.createElement("div");
    
    card.className = `vocab-card-item petal-${idx % 12} ${isLearned ? 'learned' : ''}`;
    card.style.setProperty("--petal-rotation", `${(idx % 12) * 30}deg`);
    card.innerHTML = `
      <span class="petal-word">${vocab.word}</span>
      <small>${vocab.translation_en}</small>
    `;

    card.addEventListener("click", () => {
      // Toggle select styles
      document.querySelectorAll(".vocab-card-item").forEach(c => c.classList.remove("active"));
      card.classList.add("active");
      
      showLessonWordDetails(vocab, idx, card);
    });

    deckContainer.appendChild(card);
  });

  updateDeckProgressTracker();
  advancePlantGrowth();
}

function updateDeckProgressTracker() {
  const words = appState.activeLesson.vocabulary || [];
  const total = words.length;
  
  // Count how many are marked learned in wordBank
  const learnedCount = words.filter(w => appState.wordBank.includes(w.word.toLowerCase())).length;
  
  const percentage = total > 0 ? Math.round((learnedCount / total) * 100) : 0;
  document.getElementById("vocab-card-progress").style.width = `${percentage}%`;
  document.getElementById("vocab-card-progress-text").textContent = `${learnedCount} / ${total}`;
}

// Detailed card deck view item
function showLessonWordDetails(vocab, idx, cardElement) {
  document.getElementById("word-empty-view").style.display = "none";
  const detail = document.getElementById("word-card-detail");
  detail.style.display = "flex";

  speakText(vocab.word);

  let cognateBadge = "";
  if (vocab.isCognate) {
    cognateBadge = `
      <div class="tag-cognate" style="background-color: var(--color-accent-light); padding: 4px 8px; border-radius: var(--border-radius-sm); font-size: 11px; color: var(--color-primary); font-weight: 700; margin-bottom: 8px; display: inline-block;">
        <span>🌼 Ortak Kelime (${vocab.arabicRoot})</span>
      </div>
    `;
  }

  detail.innerHTML = `
    <div class="word-card-detail-header">
      ${cognateBadge}
      <button class="word-speech-btn" data-word="${vocab.word}" style="background-color: var(--color-primary); color: var(--bg-primary); border: none; font-size: 11px; font-weight: 700; padding: 4px 10px; border-radius: var(--border-radius-sm); cursor: pointer; float: right;">🔊 Oku</button>
    </div>
    <div class="tr-word">
      <span>${vocab.word}</span>
    </div>
    <div class="phonetic">[${vocab.pronunciation}]</div>
    
    <div class="meanings-section">
      <div class="meaning-block ar-block">
        <span class="lang-label">العربية (Arabic)</span>
        <span class="value">${vocab.translation_ar}</span>
      </div>
      <div class="meaning-block en-block">
        <span class="lang-label">English Bridge</span>
        <span class="value">${vocab.translation_en}</span>
      </div>
    </div>

    <!-- Long example sentence details -->
    <div class="sentence-example-block">
      <span class="lbl">Örnek Cümle (Example Sentence) 🔊</span>
      <span class="tr-sent" style="cursor: pointer;" id="sentence-play-trigger">${vocab.sentence}</span>
      <span class="ar-sent">${vocab.sentence_ar}</span>
      <span class="en-sent">${vocab.sentence_en}</span>
      ${vocab.academicNote ? `<span class="academic-note">🎓 ${vocab.academicNote}</span>` : ""}
    </div>
    
    <div class="word-card-detail-actions">
      <button class="learned-confirm-btn" id="btn-learned-confirm">Öğrendim! (+10 Puan) 🌼</button>
    </div>
  `;

  // Example sentence play on click
  document.getElementById("sentence-play-trigger").addEventListener("click", () => {
    speakText(vocab.sentence);
  });

  // Learned confirm handler
  document.getElementById("btn-learned-confirm").addEventListener("click", () => {
    const wordKey = vocab.word.toLowerCase();
    if (!appState.wordBank.includes(wordKey)) {
      appState.wordBank.push(wordKey);
      awardPoints(10);
    }
    
    playSynthTone(659.25, "triangle", 0.15); // E5
    cardElement.classList.add("learned");
    updateDeckProgressTracker();

    // Check if lesson complete
    const words = appState.activeLesson.vocabulary || [];
    const allLearned = words.every(w => appState.wordBank.includes(w.word.toLowerCase()));

    if (allLearned) {
      triggerYusufMessage("Harikasın Suzi! Bu dersteki tüm kelimeleri öğrendin! Şimdi dilbilgisi kuralını açalım.");
      speakText("Bütün kelimeleri bitirdin, aferin Suzi!");
      setTimeout(() => {
        switchTab("grammar");
      }, 2000);
    } else {
      triggerYusufMessage(`Aferin Suzi! "${vocab.word}" kelimesini listene ekledim.`);
    }

    document.getElementById("word-card-detail").style.display = "none";
    document.getElementById("word-empty-view").style.display = "flex";
  });
}

// TAB 3: Grammar & Suffix snapper
function setupGrammarSection() {
  const lesson = appState.activeLesson;
  const grammarContainer = document.getElementById("grammar-text-explanation");
  
  advancePlantGrowth();

  if (lesson.grammar) {
    let listContent = "";
    
    if (lesson.grammar.examples) {
      listContent = `
        <table class="expl-examples-table">
          <thead>
            <tr>
              <th>Root</th>
              <th>Suffix</th>
              <th>Result</th>
              <th>Meaning</th>
            </tr>
          </thead>
          <tbody>
            ${lesson.grammar.examples.map(ex => `
              <tr>
                <td>${ex.root}</td>
                <td><b>${ex.suffix}</b></td>
                <td><strong>${ex.result}</strong></td>
                <td>${ex.meaning}</td>
              </tr>
            `).join("")}
          </tbody>
        </table>
      `;
    } else if (lesson.grammar.table) {
      listContent = `
        <table class="expl-examples-table">
          <thead>
            <tr>
              <th>Türkçe</th>
              <th>العربية</th>
              <th>English</th>
            </tr>
          </thead>
          <tbody>
            ${lesson.grammar.table.map(row => `
              <tr>
                <td><strong>${row.tr}</strong></td>
                <td style="direction: rtl;">${row.ar}</td>
                <td>${row.en}</td>
              </tr>
            `).join("")}
          </tbody>
        </table>
      `;
    } else if (lesson.grammar.cases) {
      listContent = `
        <div style="display: flex; flex-direction: column; gap: 12px; margin-top: 10px;">
          ${lesson.grammar.cases.map(c => `
            <div style="background-color: hsl(0,0%,15%); padding: 12px; border-radius: var(--border-radius-sm); border-left: 4px solid var(--color-primary);">
              <strong>${c.name} : </strong> <span style="background-color: var(--color-accent-light); color: var(--color-primary); padding: 2px 6px; border-radius: 4px;">${c.suffix}</span>
              <p style="margin-top: 4px; font-size: 12px; font-style: italic;">Örnek: <strong>${c.exTr}</strong> (${c.exAr} / ${c.exEn} / 中文: ${c.exZh})</p>
            </div>
          `).join("")}
        </div>
      `;
    }

    grammarContainer.innerHTML = `
      <h4>Dilbilgisi Kuralı: ${lesson.grammar.title}</h4>
      <div class="explanation-grid">
        <div class="expl-item">
          <div class="expl-desc-ar">${lesson.grammar.arExplanation}</div>
          <div class="expl-desc-en"><b>Structure Note:</b> ${lesson.grammar.enExplanation}</div>
          ${listContent}
        </div>
      </div>
    `;
    grammarContainer.style.display = "block";
  } else if (lesson.idioms) {
    grammarContainer.innerHTML = `
      <h4>Kültürel Ortak Deyimler (Idioms)</h4>
      <div class="idioms-grid">
        ${lesson.idioms.map(id => `
          <div class="idiom-item-card">
            <div class="idiom-tr">${id.tr}</div>
            <div class="idiom-ar">${id.ar}</div>
            <div class="idiom-en">
              <b>Literal:</b> ${id.literalAr} <br> 
              <b>Context:</b> ${id.meaning} <br>
              <b>中文:</b> ${id.zh}
            </div>
            <button class="word-speech-btn" data-word="${id.tr}" style="background: none; border: none; color: var(--color-primary); cursor: pointer; float: right;">🔊</button>
          </div>
        `).join("")}
      </div>
    `;
    grammarContainer.style.display = "block";
  } else {
    grammarContainer.style.display = "none";
  }

  // Suffix Snapper Puzzle Game load
  const suffixGame = document.getElementById("suffix-game-container");
  if (lesson.suffixBuilder) {
    suffixGame.style.display = "block";
    appState.suffixCurrentWordIndex = 0;
    appState.suffixAssembled = [];
    loadSuffixPuzzleQuestion();
  } else {
    suffixGame.style.display = "none";
  }
}

function loadSuffixPuzzleQuestion() {
  const builder = appState.activeLesson.suffixBuilder;
  const wordKeys = Object.keys(builder.correctAnswers);
  
  if (appState.suffixCurrentWordIndex >= wordKeys.length) {
    document.getElementById("suffix-game-container").innerHTML = `
      <div class="suffix-game-header" style="padding: 16px;">
        <span style="font-size: 36px;">🏆</span>
        <h4 style="color: var(--color-correct); margin-top: 8px;">Yapboz Tamamlandı!</h4>
        <p>Ekleri doğru eklemeyi kavradın. Şimdi seviye sınavına hazırsın!</p>
        <button class="action-cta-btn" onclick="switchTab('quiz')" style="margin-top: 10px;">Sınava Geç 📝</button>
      </div>
    `;
    triggerYusufMessage("Tebrikler Suzi! Ek birleştirme oyununun hepsini doğru yaptın.");
    speakText("Tebrikler Suzi, ek yapbozunu tamamladın.");
    return;
  }

  const rootTerm = builder.root[appState.suffixCurrentWordIndex];
  const targetResult = builder.correctAnswers[rootTerm];

  appState.suffixAssembled = [rootTerm];
  document.getElementById("suffix-live-translation").textContent = `Target word: ${targetResult.split(" ")[0]}`;

  const slotsContainer = document.getElementById("suffix-slot-container");
  slotsContainer.className = "suffix-slot-container";
  slotsContainer.innerHTML = "";
  
  const rootPiece = document.createElement("div");
  rootPiece.className = "word-puzzle-piece";
  rootPiece.textContent = rootTerm.split(" ")[0];
  slotsContainer.appendChild(rootPiece);

  const pool = document.getElementById("suffix-pieces-pool");
  pool.innerHTML = "";

  builder.suffixes.forEach(suffix => {
    const piece = document.createElement("div");
    piece.className = "suffix-puzzle-piece";
    piece.textContent = suffix;
    piece.addEventListener("click", () => {
      appendSuffixPiece(suffix, piece);
    });
    pool.appendChild(piece);
  });
}

function appendSuffixPiece(suffix, pieceEl) {
  appState.suffixAssembled.push(suffix);
  
  const slotsContainer = document.getElementById("suffix-slot-container");
  const suffixPiece = document.createElement("div");
  suffixPiece.className = "word-puzzle-piece suffix-puzzle-piece";
  suffixPiece.textContent = suffix;
  slotsContainer.appendChild(suffixPiece);

  slotsContainer.classList.add("snap-glow");
  setTimeout(() => { slotsContainer.classList.remove("snap-glow"); }, 600);

  pieceEl.style.opacity = "0.3";
  pieceEl.style.pointerEvents = "none";

  const baseRoot = appState.suffixAssembled[0].split(" ")[0];
  const assembledWord = (baseRoot + appState.suffixAssembled.slice(1).join("")).replace(/-/g, "");
  const builder = appState.activeLesson.suffixBuilder;
  const rootTerm = builder.root[appState.suffixCurrentWordIndex];
  const targetResult = builder.correctAnswers[rootTerm].split(" ")[0].toLowerCase();

  if (assembledWord.toLowerCase() === targetResult) {
    awardPoints(15);
    playSynthTone(880, "sine", 0.2); // A5 success

    triggerYusufMessage(`Aferin Suzi! "${assembledWord}" yapısını doğru inşa ettin.`);
    speakText(assembledWord);

    slotsContainer.style.borderColor = "var(--color-correct)";
    
    setTimeout(() => {
      appState.suffixCurrentWordIndex++;
      loadSuffixPuzzleQuestion();
    }, 1500);
  } else {
    const expectedLength = targetResult.length;
    if (assembledWord.length >= expectedLength) {
      playSynthTone(220, "sawtooth", 0.2);
      slotsContainer.style.borderColor = "var(--color-incorrect)";
      triggerYusufMessage(`Yanlış ekleme! Hadi baştan deneyelim.`);

      setTimeout(() => {
        loadSuffixPuzzleQuestion();
      }, 1500);
    }
  }
}

// TAB 4: Quiz Engine (Dynamic Quiz Generation for maximum efficiency)
function setupQuizSection() {
  appState.quizIndex = 0;
  appState.quizAnswers = [];
  
  const lesson = appState.activeLesson;
  const vocab = lesson.vocabulary || [];
  
  let questions = [];

  // 1. Add predefined quiz questions if available
  if (lesson.quiz && lesson.quiz.length > 0) {
    questions = [...lesson.quiz];
  }

  // 2. Generate dynamic translation questions to guarantee at least 5 questions per quiz
  if (questions.length < 5 && vocab.length > 0) {
    const needed = 5 - questions.length;
    
    // Shuffle vocab
    const shuffledVocab = [...vocab].sort(() => 0.5 - Math.random());
    const poolForAnswers = learningDatabase.vocabularyBank;

    shuffledVocab.slice(0, needed).forEach(wordObj => {
      // Pick 3 random wrong options from the massive vocabulary bank
      const incorrectOptions = poolForAnswers
        .filter(w => w.word !== wordObj.word)
        .sort(() => 0.5 - Math.random())
        .slice(0, 3)
        .map(w => w.word);

      const options = [wordObj.word, ...incorrectOptions].sort(() => 0.5 - Math.random());

      questions.push({
        question: `Hangisi "${wordObj.translation_ar}" kelimesinin Türkçe karşılığıdır?`,
        options: options,
        answer: wordObj.word,
        hint: wordObj.isCognate ? `Bu kelime Arapça kökenlidir (${wordObj.arabicRoot}).` : `Örnek cümle: ${wordObj.sentence}`
      });
    });
  }

  appState.quizQuestions = questions;
  renderQuizQuestion();
}

function renderQuizQuestion() {
  const quizWorkspace = document.getElementById("quiz-workspace");
  const questions = appState.quizQuestions;

  if (questions.length === 0) {
    quizWorkspace.innerHTML = "<p>Ders için sınav bulunamadı.</p>";
    return;
  }

  if (appState.quizIndex >= questions.length) {
    // End of quiz
    const score = appState.quizAnswers.filter(a => a.isCorrect).length;
    const passed = score >= Math.ceil(questions.length * 0.8); // 80% passing grade

    if (passed) {
      // Complete lesson in state
      if (!appState.completedLessons.includes(appState.activeLesson.id)) {
        appState.completedLessons.push(appState.activeLesson.id);
        awardPoints(50);
        saveProgress();
      }
      
      triggerCelebration();

      // Check if all lessons in current level are completed to trigger LEVEL UP systematic transition modal!
      const activeLevel = learningDatabase.levels.find(l => l.id === appState.activeLevelId);
      const levelLessons = activeLevel.lessons.map(l => l.id);
      const levelFinished = levelLessons.every(id => appState.completedLessons.includes(id));

      if (levelFinished) {
        showLevelUpModal();
        return; // level up handles output
      } else {
        triggerYusufMessage("Tebrikler Suzi! Dersi geçtin. Bahçeye dönüp bir sonraki derse başlayabilirsin.");
        speakText("Dersi geçtin, tebrikler Suzi!");
      }
    } else {
      triggerYusufMessage("Sınavı geçemedin ama sorun değil! Tekrar deneyerek puanını yükseltebilirsin.");
      speakText("Tekrar deneyelim mi?");
    }

    quizWorkspace.innerHTML = `
      <div class="quiz-card quiz-score-screen" style="text-align: center;">
        <span class="score-emoji" style="font-size: 40px; display: block; margin-bottom: 12px;">${passed ? '🌸🏆' : '🌱💪'}</span>
        <h3 class="score-screen-title" style="color: var(--color-primary); font-size: 20px; font-weight: 700; margin-bottom: 8px;">${passed ? 'Başarılı!' : 'Tekrar Dene!'}</h3>
        <p class="score-screen-detail" style="font-size: 13px; color: var(--color-text-muted); margin-bottom: 20px;">
          Doğru Sayın: <strong>${score} / ${questions.length}</strong><br>
          ${passed ? 'Ders tamamlandı, Yusuf seninle gurur duyuyor!' : 'Birkaç hatan var. Kelimeleri tekrar gözden geçirip sınavı geçebilirsin.'}
        </p>
        <button class="action-cta-btn" onclick="${passed ? 'exitActiveLesson()' : 'setupQuizSection()'}">
          ${passed ? 'Derslerden Çık (Finish)' : 'Yeniden Başlat (Retry)'}
        </button>
      </div>
    `;
    return;
  }

  const q = questions[appState.quizIndex];
  
  quizWorkspace.innerHTML = `
    <div class="quiz-card">
      <div class="quiz-header">
        <span class="quiz-badge">Soru ${appState.quizIndex + 1}</span>
        <span class="quiz-progress-text" style="font-size: 11px; color: var(--color-text-muted);">${appState.quizIndex + 1} / ${questions.length}</span>
      </div>

      <div class="quiz-question-box" style="margin-bottom: 20px;">
        <h4 style="font-size: 15px; font-weight: 700; line-height: 1.5;">${q.question}</h4>
      </div>

      <div class="quiz-options-list" id="quiz-options-box">
        ${q.options.map((opt, idx) => `
          <button class="quiz-option-btn" data-option="${opt}">
            <span>${opt}</span>
            <span class="quiz-option-feedback-icon" id="opt-icon-${idx}"></span>
          </button>
        `).join("")}
      </div>

      <div class="quiz-feedback-box" id="quiz-feedback-box">
        <span class="quiz-feedback-title" id="quiz-feedback-title"></span>
        <span class="quiz-feedback-text" id="quiz-feedback-text"></span>
      </div>

      <div class="quiz-actions" style="margin-top: 16px; display: flex; justify-content: flex-end;">
        <button class="quiz-next-btn" id="btn-quiz-next" style="display: none;">Sonraki Soru ➡️</button>
      </div>
    </div>
  `;

  const optionsButtons = document.querySelectorAll(".quiz-option-btn");
  optionsButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      const selectedOpt = btn.getAttribute("data-option");
      submitQuizAnswer(selectedOpt, q, optionsButtons);
    });
  });

  document.getElementById("btn-quiz-next").addEventListener("click", () => {
    appState.quizIndex++;
    renderQuizQuestion();
  });
}

function submitQuizAnswer(selectedOpt, questionObj, allButtons) {
  const isCorrect = selectedOpt === questionObj.answer;
  appState.quizAnswers.push({ selected: selectedOpt, isCorrect: isCorrect });

  allButtons.forEach(btn => {
    btn.disabled = true;
    const optVal = btn.getAttribute("data-option");
    if (optVal === questionObj.answer) {
      btn.classList.add("correct");
      btn.querySelector(".quiz-option-feedback-icon").textContent = "✓";
    } else if (optVal === selectedOpt) {
      btn.classList.add("incorrect");
      btn.querySelector(".quiz-option-feedback-icon").textContent = "✗";
    }
  });

  const feedbackBox = document.getElementById("quiz-feedback-box");
  const feedbackTitle = document.getElementById("quiz-feedback-title");
  const feedbackText = document.getElementById("quiz-feedback-text");
  
  feedbackBox.classList.add("active");
  feedbackBox.style.display = "block";
  
  if (isCorrect) {
    feedbackTitle.className = "quiz-feedback-title correct";
    feedbackTitle.textContent = "Aferin Suzi! Doğru! 🎉";
    feedbackText.textContent = `Açıklama: ${questionObj.hint}`;
    playSynthTone(987.77, "sine", 0.2);

    const msg = learningDatabase.yusufFeedback.correct[Math.floor(Math.random() * learningDatabase.yusufFeedback.correct.length)];
    triggerYusufMessage(msg);
  } else {
    feedbackTitle.className = "quiz-feedback-title incorrect";
    feedbackTitle.textContent = "Hata! 💡";
    feedbackText.textContent = `Doğru cevap "${questionObj.answer}" olmalıydı. ${questionObj.hint}`;
    playSynthTone(196, "sawtooth", 0.2);

    const msg = learningDatabase.yusufFeedback.wrong[Math.floor(Math.random() * learningDatabase.yusufFeedback.wrong.length)];
    triggerYusufMessage(msg);
  }

  document.getElementById("btn-quiz-next").style.display = "block";
}

// SYSTEMATIC LEVEL UP TRANSITION SCREEN
function showLevelUpModal() {
  const modal = document.getElementById("level-up-modal");
  const activeLevel = learningDatabase.levels.find(l => l.id === appState.activeLevelId);
  
  // Fill stats
  document.getElementById("lvl-up-stat-words").textContent = appState.wordBank.length;
  document.getElementById("lvl-up-stat-points").textContent = appState.points;
  
  document.getElementById("lvl-up-title").textContent = `Seviye Atladın: Level ${activeLevel.id}! 🎉`;
  document.getElementById("lvl-up-desc").innerHTML = `
    Tebrikler Suzi! <strong>${activeLevel.title}</strong> seviyesini mükemmel başarıyla bitirdin!<br>
    Yusuf seninle çok gurur duyuyor. Yıldızlı pekiyi aldın! ⭐🌼
  `;

  // Play nice success sounds
  playLevelUpChords();
  triggerCelebration();

  modal.style.display = "flex";
}

function dismissLevelUpAndAdvance() {
  const modal = document.getElementById("level-up-modal");
  modal.style.display = "none";

  const nextLvlId = appState.activeLevelId + 1;
  const nextLvlExists = learningDatabase.levels.some(l => l.id === nextLvlId);

  exitActiveLesson();

  if (nextLvlExists) {
    appState.activeLevelId = nextLvlId;
    
    // Visual toggle sidebar levels list
    renderLevelsList();
    showLevelOverview(nextLvlId);
    
    const levelObj = learningDatabase.levels.find(l => l.id === nextLvlId);
    const cheer = `Harika Suzi! Bir sonraki seviye olan "${levelObj.title}" kilidi açıldı. Başarılar dilerim! 🚀🌼`;
    triggerYusufMessage(cheer);
    speakText(cheer, true);
  } else {
    const masteredMsg = "İnanılmaz! Bütün seviyeleri bitirdin Suzi! Artık Türkçe senin için bitti, harika konuşuyorsun! Yusuf sana kocaman sarılıyor! 🌼👑";
    triggerYusufMessage(masteredMsg);
    speakText(masteredMsg, true);
  }
}

function setupGamificationActions() {
  const actionMap = [
    {
      id: "btn-daily-missions",
      message: () => `Bugünkü akademik görev: 5 kelime dinle, 3 örnek cümle oku ve 1 mini sınav çöz. Seri: ${appState.streak} gün.`,
      action: () => { switchHubFromAction("wordbank"); renderWordbankDashboard(); }
    },
    {
      id: "btn-suzi-league",
      message: () => `Suzi Ligi: ${appState.points} Daisy puanı ile kişisel gelişim sıralamanda ilerliyorsun. Hedef: anlam doğruluğu, hız değil.`,
      action: () => triggerCelebration()
    },
    {
      id: "btn-quick-practice",
      message: () => "Hızlı pratik başladı: sözlükte öğrenilmemiş kelimeleri açtım. Bir kelime seç, dinle ve örnek cümlesini oku.",
      action: () => {
        switchHubFromAction("dictionary");
        const unlearned = document.getElementById("dict-only-unlearned");
        if (unlearned) unlearned.checked = true;
        renderDictionaryTable();
      }
    }
  ];

  actionMap.forEach(({ id, message, action }) => {
    const btn = document.getElementById(id);
    if (!btn) return;
    btn.addEventListener("click", () => {
      const text = message();
      triggerYusufMessage(text);
      speakText(text);
      action();
    });
  });
}

function switchHubFromAction(hubName) {
  const buttonByHub = {
    garden: "nav-btn-garden",
    dictionary: "nav-btn-dictionary",
    wordbank: "nav-btn-bank"
  };
  const navButton = document.getElementById(buttonByHub[hubName]);
  if (navButton) navButton.click();
}

// VIEW 2: Searchable Dictionary Engine (Handles 5,050 vocabulary entries instantly)
function populateDictionaryThemes() {
  const themeFilter = document.getElementById("dict-theme-filter");
  themeFilter.innerHTML = `<option value="all">Tüm Temalar (All Themes)</option>`;
  
  const themes = new Set();
  learningDatabase.vocabularyBank.forEach(w => {
    if (w.category) themes.add(w.category);
  });

  themes.forEach(theme => {
    const opt = document.createElement("option");
    opt.value = theme;
    opt.textContent = theme;
    themeFilter.appendChild(opt);
  });
}

function renderDictionaryTable() {
  const searchInput = document.getElementById("dict-search-input").value.toLowerCase().trim();
  const levelFilter = document.getElementById("dict-level-filter").value;
  const themeFilter = document.getElementById("dict-theme-filter").value;
  const onlyCognates = document.getElementById("dict-only-cognates").checked;
  const onlyUnlearned = document.getElementById("dict-only-unlearned").checked;

  const tbody = document.getElementById("dictionary-table-body");
  const noResults = document.getElementById("dict-no-results-msg");
  
  tbody.innerHTML = "";
  
  // Filter 5,000+ items (supports searching Chinese as well!)
  const filtered = learningDatabase.vocabularyBank.filter(wordObj => {
    const wordTr = wordObj.word.toLowerCase();
    const wordAr = (wordObj.translation_ar || "").toLowerCase();
    const wordEn = (wordObj.translation_en || "").toLowerCase();
    const wordZh = (wordObj.translation_zh || "").toLowerCase();
    
    const matchesSearch = searchInput === "" || 
      wordTr.includes(searchInput) || 
      wordAr.includes(searchInput) || 
      wordEn.includes(searchInput) ||
      wordZh.includes(searchInput);

    const matchesLvl = levelFilter === "all" || wordObj.level.toString() === levelFilter;
    const matchesTheme = themeFilter === "all" || wordObj.category === themeFilter;
    const matchesCognate = !onlyCognates || wordObj.isCognate;
    
    const isLearned = appState.wordBank.includes(wordObj.word.toLowerCase());
    const matchesUnlearned = !onlyUnlearned || !isLearned;

    return matchesSearch && matchesLvl && matchesTheme && matchesCognate && matchesUnlearned;
  });

  // Limit rendering to first 120 items for top UI speed
  const displayLimit = 120;
  const displayList = filtered.slice(0, displayLimit);

  if (displayList.length === 0) {
    noResults.style.display = "block";
  } else {
    noResults.style.display = "none";
  }

  displayList.forEach(wordObj => {
    const tr = document.createElement("tr");
    if (wordObj.isCognate) {
      tr.className = "cog-row";
    }

    const arField = wordObj.isCognate 
      ? `<span style="font-family: 'Noto Sans Arabic'; font-weight: 700;">${wordObj.translation_ar}</span> <br><small style="color: var(--color-text-muted);">أصلها: ${wordObj.arabicRoot}</small>`
      : `<span style="font-family: 'Noto Sans Arabic';">${wordObj.translation_ar}</span>`;

    tr.innerHTML = `
      <td>
        <div class="dict-row-tr-block">
          <button class="dict-row-speaker-btn" data-word="${wordObj.word}">🔊</button>
          <strong>${wordObj.word}</strong>
        </div>
      </td>
      <td><small style="color: var(--color-text-muted);">${wordObj.pronunciation}</small></td>
      <td style="direction: rtl; text-align: right;">${arField}</td>
      <td>${wordObj.translation_en}</td>
      <td><span style="color: var(--color-primary); font-weight: 500;">${wordObj.translation_zh}</span></td>
      <td>
        <span style="font-size: 11px; font-weight: 600; color: var(--color-text); cursor: pointer;" class="dict-sent-play" data-sent="${wordObj.sentence}">${wordObj.sentence}</span> <br>
        <small style="color: var(--color-text-muted); direction: rtl; display: block; text-align: right; margin-top: 2px;">${wordObj.sentence_ar}</small>
        <small style="color: var(--color-text-muted); display: block; margin-top: 2px;">${wordObj.sentence_en}</small>
      </td>
    `;

    tbody.appendChild(tr);
  });

  // Add a single delegated handler; replacing onclick prevents stacked listeners after filtering.
  tbody.onclick = (e) => {
    const btn = e.target.closest(".dict-row-speaker-btn");
    if (btn) {
      speakText(btn.getAttribute("data-word"));
    }
    
    const sentSpan = e.target.closest(".dict-sent-play");
    if (sentSpan) {
      speakText(sentSpan.getAttribute("data-sent"));
    }
  };
}

// VIEW 3: Word Bank Render Dashboard
function renderWordbankDashboard() {
  const totalLearnedEl = document.getElementById("wb-stat-total-learned");
  const totalPointsEl = document.getElementById("wb-stat-total-points");
  const currentLvlEl = document.getElementById("wb-stat-level-unlocked");
  const tagsContainer = document.getElementById("wb-learned-tags-cloud");
  const emptyMsg = document.getElementById("wb-empty-msg");

  totalLearnedEl.textContent = appState.wordBank.length;
  totalPointsEl.textContent = appState.points;
  
  // Find highest unlocked level
  let highestLvl = "A1";
  for (let l = 5; l >= 1; l--) {
    if (!isLevelLocked(l)) {
      highestLvl = l === 5 ? "C1" : "A" + l;
      break;
    }
  }
  currentLvlEl.textContent = highestLvl;

  tagsContainer.innerHTML = "";
  if (appState.wordBank.length === 0) {
    emptyMsg.style.display = "block";
    return;
  }
  emptyMsg.style.display = "none";

  appState.wordBank.forEach(wordKey => {
    const badge = document.createElement("div");
    badge.className = "wb-tag-badge";
    badge.textContent = `🌼 ${wordKey}`;
    
    badge.addEventListener("click", () => {
      speakText(wordKey);
    });

    tagsContainer.appendChild(badge);
  });
}

// Award points utility
function awardPoints(pts) {
  appState.points += pts;
  document.getElementById("daisy-points").textContent = appState.points;
  
  const ptsBadge = document.getElementById("daisy-points");
  ptsBadge.style.transform = "scale(1.25)";
  ptsBadge.style.color = "var(--color-primary)";
  setTimeout(() => {
    ptsBadge.style.transform = "";
    ptsBadge.style.color = "";
  }, 400);

  // Gamification: Floating points animation
  const floater = document.createElement("div");
  floater.className = "floating-points-anim";
  floater.textContent = `+${pts} 🌼`;
  document.body.appendChild(floater);
  
  setTimeout(() => {
    floater.remove();
  }, 1500);

  saveProgress();
}

// Yusuf speech messages trigger
function triggerYusufMessage(text) {
  const bubble = document.getElementById("yusuf-bubble");
  const textEl = document.getElementById("yusuf-text");
  const notif = document.getElementById("yusuf-notification");

  bubble.classList.remove("visible");
  
  setTimeout(() => {
    textEl.textContent = text;
    bubble.classList.add("visible");
    notif.style.display = "flex";
    notif.textContent = "!";
  }, 300);
}

// Speech Synthesizer Voice Player - Premium Voice Selection
let cachedPremiumVoice = null;

function findBestTurkishVoice() {
  const voices = window.speechSynthesis.getVoices();
  const trVoices = voices.filter(v => v.lang.startsWith("tr"));
  
  if (trVoices.length === 0) return null;
  
  const normalize = (value) => value.toLocaleLowerCase("tr-TR");

  // Premium/neural voice priority list (best quality first). Availability depends on browser/OS.
  const premiumNames = [
    "microsoft emel online",
    "microsoft ahmet online",
    "microsoft tolga online",
    "google türkçe",
    "google turkish",
    "yelda",
    "cem",
    "microsoft emel",
    "microsoft ahmet",
    "microsoft tolga"
  ];

  const scoredVoices = trVoices
    .map((voice) => {
      const normalizedName = normalize(voice.name);
      const priorityIndex = premiumNames.findIndex((name) => normalizedName.includes(name));
      const neuralScore = /(online|natural|neural|premium)/i.test(voice.name) ? 30 : 0;
      const remoteScore = voice.localService ? 0 : 20;
      const priorityScore = priorityIndex >= 0 ? 100 - priorityIndex : 0;
      return { voice, score: priorityScore + neuralScore + remoteScore };
    })
    .sort((a, b) => b.score - a.score);

  return scoredVoices[0].voice;
}

// Cache premium voice as soon as voices are loaded
if ('speechSynthesis' in window) {
  window.speechSynthesis.onvoiceschanged = () => {
    cachedPremiumVoice = findBestTurkishVoice();
    if (cachedPremiumVoice) {
      console.log("Premium Turkish voice loaded:", cachedPremiumVoice.name);
    }
  };
  // Try immediately in case voices are already loaded
  cachedPremiumVoice = findBestTurkishVoice();
}

function speakText(text) {
  if (!('speechSynthesis' in window)) return;
  if (appState.isMuted) return;
  
  window.speechSynthesis.cancel();
  // Strip emojis
  const cleanText = text.replace(/[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF]/g, "");

  const utterance = new SpeechSynthesisUtterance(cleanText);
  utterance.lang = "tr-TR";

  const rateSelector = document.getElementById("voice-speed");
  utterance.rate = rateSelector ? parseFloat(rateSelector.value) : 0.85;
  utterance.pitch = 1.02;
  utterance.volume = 1;

  // Use cached premium voice or find best available
  const bestVoice = cachedPremiumVoice || findBestTurkishVoice();
  if (bestVoice) {
    utterance.voice = bestVoice;
  }

  utterance.onstart = () => {
    const btn = document.getElementById("btn-audio-test");
    if (btn) btn.classList.add("speaking");
  };
  utterance.onend = () => {
    const btn = document.getElementById("btn-audio-test");
    if (btn) btn.classList.remove("speaking");
  };

  window.speechSynthesis.speak(utterance);
}

// Sound Synthesizers (Web Audio API)
let audioCtx = null;

function initAudioContext() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
}

function playSynthTone(frequency, type, duration) {
  if (appState.isMuted) return;
  try {
    initAudioContext();
    if (!audioCtx) return;

    const osc = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(frequency, audioCtx.currentTime);

    gainNode.gain.setValueAtTime(0.08, audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);

    osc.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    osc.start();
    osc.stop(audioCtx.currentTime + duration);
  } catch (e) {
    console.warn(e);
  }
}

function playLevelUpChords() {
  try {
    initAudioContext();
    if (!audioCtx) return;
    
    const arpeggio = [261.63, 329.63, 392.00, 523.25, 659.25, 783.99, 1046.50]; // C Major scale arpeggio
    arpeggio.forEach((note, idx) => {
      setTimeout(() => {
        playSynthTone(note, "sine", 0.4);
      }, idx * 100);
    });
  } catch (e) {
    console.warn(e);
  }
}

// Confetti Screen Overlay
function triggerCelebration() {
  const overlay = document.getElementById("fireworks-overlay");
  overlay.innerHTML = "";

  const colors = ["#FFD23F", "#A7C957", "#4E8752", "#FFFFFF", "#FF6B6B"];

  for (let i = 0; i < 50; i++) {
    const confetti = document.createElement("div");
    confetti.className = "confetti-piece";
    
    confetti.style.left = `${Math.random() * 100}vw`;
    confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
    confetti.style.width = `${Math.random() * 6 + 5}px`;
    confetti.style.height = `${Math.random() * 10 + 5}px`;
    confetti.style.animationDelay = `${Math.random() * 1.5}s`;
    confetti.style.animationDuration = `${Math.random() * 2 + 1.5}s`;
    confetti.style.transform = `rotate(${Math.random() * 360}deg)`;

    overlay.appendChild(confetti);
  }

  setTimeout(() => {
    overlay.innerHTML = "";
  }, 4000);
}
