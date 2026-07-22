// ═══════════════════════════════════════════════════════════════
// Suzim'in Türkçe Bahçesi - Core Application Logic
// Trilingual (TR / EN / AR / ZH), Arabic Cognates, Mind Palace & Gamification
// ═══════════════════════════════════════════════════════════════

// Global App State
const appState = {
  currentLang: localStorage.getItem("suzitta_lang") || "tr",
  activeView: "garden",
  currentLevelId: 1,
  activeLesson: null,
  selectedWord: null,
  bloomedWords: new Set(JSON.parse(localStorage.getItem("suzitta_bloomed_words") || "[]")),
  isMuted: false,
  voiceSpeed: 0.85,
  yusufPoints: parseInt(localStorage.getItem("suzitta_yusuf_points") || "0")
};

// Interface Internationalization Dictionary (TR / EN / AR)
const i18n = {
  tr: {
    brandTitle: "Suzim'in Türkçe Bahçesi",
    brandSub: "بستان سوزي للغة التركية",
    navGarden: "Papatya Bahçem",
    navCognates: "Ortak Kelimeler",
    navDictionary: "Sözlük",
    navBank: "Kelime Bankam",
    levelsHeader: "SEVİYELER (LEVELS)",
    statPetalsLbl: "Açan Yapraklar",
    statProgressLbl: "Genel İlerleme",
    langLbl: "Dil:",
    backGarden: "Bahçeye Dön",
    daisyTitle: "🌸 Papatya Çiçeği & Yapraklar",
    daisyHint: "Her kelime bir yapraktır. Yaprağa dokun, Zihin Sarayı görünümüyle öğren ve çiçeğini açtır!",
    inspectorEmptyTitle: "Bir Yaprak Seçin",
    inspectorEmptyDesc: "Papatyadan bir yaprağa dokunarak kelimenin anlamını, Zihin Sarayı tekniğini ve Arapça kökenini inceleyin.",
    bloomBtnAction: "Yaprağı Açtır 🌼 (+5 Yusuf Puanı)",
    bloomedStateBtn: "Yaprak Çiçek Açtı 🌸",
    cognateTitle: "💡 Arapça - Türkçe Ortak Kelimeler (الكلمات المشتركة)",
    cognateDesc: "Suzim'in ana dili Arapça olduğu için Türkçe öğrenmek çok kolay! Türkçe'de Arapça ile ortak yüzlerce köklü kelime bulunur.",
    dictTitle: "📚 Büyük Türkçe - İngilizce - Arapça Sözlük",
    dictSubtitle: "3,500'den fazla doğrulanmış kelime, 75 ders ve Zihin Sarayı görselleştirme tekniği.",
    dictSearchPlaceholder: "Kelime ara... (Türkçe, English, العربية)",
    wbTitle: "🗂️ Öğrendiğin Yapraklar & Kelimeler",
    wbSubtitle: "Papatya bahçende suladığın ve tamamen açan kelimeleriniz.",
    wbEmptyText: "Henüz kelime öğrenilmedi. Papatya yapraklarına dokunarak öğrenmeye başla!",
    yusufWelcome: "Hoş geldin Suzim! 🌼 Zihin Sarayı tekniğiyle 3,500'den fazla kelimeyi kolayca öğren!",
    quizBtnLabel: "📝 Ders Testi & Quiz",
    quizSuccessTitle: "Tebrikler Suzim! 🎉",
    quizSuccessDesc: "Yusuf seninle gurur duyuyor! 🌟 Ders sınavını harika bir başarıyla geçtin!",
    quizPointsEarned: "+25 Yusuf Puanı Kazandın! 🏅"
  },
  en: {
    brandTitle: "Suzim's Turkish Garden",
    brandSub: "Suzim's Turkish Learning Garden",
    navGarden: "Daisy Garden",
    navCognates: "Arabic Cognates",
    navDictionary: "Dictionary",
    navBank: "Word Bank",
    levelsHeader: "LEVELS",
    statPetalsLbl: "Bloomed Petals",
    statProgressLbl: "Overall Progress",
    langLbl: "Language:",
    backGarden: "Back to Garden",
    daisyTitle: "🌸 Daisy Flower & Petals",
    daisyHint: "Every word is a petal. Touch a petal to learn with Mind Palace visual scenes and bloom your flower!",
    inspectorEmptyTitle: "Select a Petal",
    inspectorEmptyDesc: "Touch a petal on the daisy to inspect meanings, Mind Palace visual mnemonics, and Arabic root notes.",
    bloomBtnAction: "Bloom This Petal 🌼 (+5 Yusuf Points)",
    bloomedStateBtn: "Petal Bloomed 🌸",
    cognateTitle: "💡 Arabic - Turkish Shared Cognates",
    cognateDesc: "Since Suzim's native language is Arabic, learning Turkish is natural! Turkish shares hundreds of rooted words with Arabic.",
    dictTitle: "📚 Turkish - English - Arabic Dictionary",
    dictSubtitle: "Over 3,500 verified words, 75 lessons, and Mind Palace visual memory mnemonics.",
    dictSearchPlaceholder: "Search word... (Turkish, English, Arabic)",
    wbTitle: "🗂️ Mastered Words & Petals",
    wbSubtitle: "Words and petals you have bloomed in your garden.",
    wbEmptyText: "No petals bloomed yet. Touch daisy petals to start learning!",
    yusufWelcome: "Welcome Suzim! 🌼 Master 3,500+ words easily using rich Mind Palace visual mnemonics!",
    quizBtnLabel: "📝 Lesson Quiz & Test",
    quizSuccessTitle: "Congratulations Suzim! 🎉",
    quizSuccessDesc: "Yusuf is so proud of you! 🌟 You passed the lesson quiz with flying colors!",
    quizPointsEarned: "+25 Yusuf Points Earned! 🏅"
  },
  ar: {
    brandTitle: "بستان سوزي للغة التركية",
    brandSub: "بستان سوزي لتعلم اللغة التركية",
    navGarden: "بستان الأقحوان",
    navCognates: "الكلمات المشتركة",
    navDictionary: "المعجم",
    navBank: "بنك الكلمات",
    levelsHeader: "المستويات",
    statPetalsLbl: "البتلات المتفتحة",
    statProgressLbl: "التقدم العام",
    langLbl: "اللغة:",
    backGarden: "العودة إلى البستان",
    daisyTitle: "🌸 زهرة الأقحوان والبتلات",
    daisyHint: "كل كلمة هي بتلة. إلمس البتلة لتعلمها باستخدام تقنية قصر الذاكرة المصورة!",
    inspectorEmptyTitle: "اختر بتلة",
    inspectorEmptyDesc: "إلمس بتلة في الأقحوان لاستعراض المعنى وتقنية قصر الذاكرة وأصل الكلمة.",
    bloomBtnAction: "افتح البتلة 🌼 (+5 نقاط يوسف)",
    bloomedStateBtn: "تفتحت البتلة 🌸",
    cognateTitle: "💡 الكلمات المشتركة بين العربية والتركية",
    cognateDesc: "بما أن لغة سوزي الأم هي العربية، فتعلم التركية سهل للغاية! هناك مئات الكلمات المشتركة مع العربية.",
    dictTitle: "📚 المعجم الكبير: تركي - إنجليزي - عربي",
    dictSubtitle: "أكثر من 3500 كلمة موثقة، 75 درساً وتقنية قصر الذاكرة التخيلية.",
    dictSearchPlaceholder: "ابحث عن كلمة... (تركي، إنجليزي، عربي)",
    wbTitle: "🗂️ الكلمات والبتلات المكتسبة",
    wbSubtitle: "الكلمات والبتلات التي قمت بسقايتها وتفتيحها في بستانك.",
    wbEmptyText: "لم يتم تفتيح أي بتلات بعد. إلمس بتلات الأقحوان للبدء بالتعلم!",
    yusufWelcome: "أهلاً بكِ يا سوزي! 🌼 احفظي أكثر من 3500 كلمة بسهولة باستخدام تقنية قصر الذاكرة المصورة!",
    quizBtnLabel: "📝 اختبار الدرس والتقييم",
    quizSuccessTitle: "ألف مبروك يا سوزي! 🎉",
    quizSuccessDesc: "يوسف فخور بكِ جداً! 🌟 لقد اجتزتِ اختبار الدرس بنجاح باهر!",
    quizPointsEarned: "اكسبتِ +25 من نقاط يوسف! 🏅"
  }
};

// Initialize Application
document.addEventListener("DOMContentLoaded", () => {
  initWelcomeModal();
  initLanguageSelector();
  initMuteControls();
  initNavigation();
  initLevelSelector();
  renderCurrentView();
  updateGlobalStats();
});

// Welcome Modal Handler
function initWelcomeModal() {
  const modal = document.getElementById("welcome-modal");
  const startBtn = document.getElementById("btn-welcome-start");

  if (startBtn && modal) {
    startBtn.addEventListener("click", () => {
      modal.style.opacity = "0";
      modal.style.transition = "opacity 0.4s ease";
      setTimeout(() => {
        modal.style.display = "none";
      }, 400);
    });
  }
}

// Mute & TTS Audio Speed Controls
function initMuteControls() {
  const muteBtn = document.getElementById("btn-mute-toggle");
  const muteIcon = document.getElementById("mute-icon");
  const muteLabel = document.getElementById("mute-label");
  const voiceSpeedSelect = document.getElementById("voice-speed");

  if (muteBtn) {
    muteBtn.addEventListener("click", () => {
      appState.isMuted = !appState.isMuted;
      if (muteIcon) muteIcon.textContent = appState.isMuted ? "🔇" : "🔊";
      if (muteLabel) muteLabel.textContent = appState.isMuted ? "Sessiz" : "Ses Açık";
      if (appState.isMuted && window.speechSynthesis) window.speechSynthesis.cancel();
    });
  }

  if (voiceSpeedSelect) {
    voiceSpeedSelect.addEventListener("change", (e) => {
      appState.voiceSpeed = parseFloat(e.target.value);
    });
  }
}

// Internationalization Handler
function initLanguageSelector() {
  const langBtns = document.querySelectorAll(".lang-btn");
  langBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      langBtns.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      appState.currentLang = btn.dataset.lang;
      localStorage.setItem("suzitta_lang", appState.currentLang);
      applyTrilingualText();
      if (appState.selectedWord) renderWordInspector(appState.selectedWord, null);
    });
  });

  const currentBtn = document.querySelector(`.lang-btn[data-lang="${appState.currentLang}"]`);
  if (currentBtn) {
    langBtns.forEach(b => b.classList.remove("active"));
    currentBtn.classList.add("active");
  }

  applyTrilingualText();
}

function applyTrilingualText() {
  const t = i18n[appState.currentLang] || i18n.tr;

  document.getElementById("ui-brand-title").textContent = t.brandTitle;
  document.getElementById("ui-nav-garden").textContent = t.navGarden;
  document.getElementById("ui-nav-cognates").textContent = t.navCognates;
  document.getElementById("ui-nav-dictionary").textContent = t.navDictionary;
  document.getElementById("ui-nav-bank").textContent = t.navBank;
  document.getElementById("ui-levels-header").textContent = t.levelsHeader;
  document.getElementById("ui-stat-petals-lbl").textContent = t.statPetalsLbl;
  document.getElementById("ui-stat-progress-lbl").textContent = t.statProgressLbl;
  document.getElementById("ui-lang-lbl").textContent = t.langLbl;
  document.getElementById("ui-back-garden-lbl").textContent = t.backGarden;

  document.getElementById("ui-daisy-canvas-title").textContent = t.daisyTitle;
  document.getElementById("ui-daisy-canvas-hint").textContent = t.daisyHint;
  document.getElementById("ui-inspector-empty-title").textContent = t.inspectorEmptyTitle;
  document.getElementById("ui-inspector-empty-desc").textContent = t.inspectorEmptyDesc;

  document.getElementById("ui-dict-title").textContent = t.dictTitle;
  document.getElementById("ui-dict-subtitle").textContent = t.dictSubtitle;
  document.getElementById("dict-search-input").placeholder = t.dictSearchPlaceholder;

  document.getElementById("ui-wb-title").textContent = t.wbTitle;
  document.getElementById("ui-wb-subtitle").textContent = t.wbSubtitle;
  document.getElementById("ui-wb-empty-text").textContent = t.wbEmptyText;

  document.getElementById("yusuf-text").textContent = t.yusufWelcome;
}

// Main View Navigation
function initNavigation() {
  const navMap = [
    { btnId: "nav-btn-garden", mobId: "mob-nav-garden", viewId: "garden" },
    { btnId: "nav-btn-cognates", mobId: "mob-nav-cognates", viewId: "cognates" },
    { btnId: "nav-btn-dictionary", mobId: "mob-nav-dictionary", viewId: "dictionary" },
    { btnId: "nav-btn-bank", mobId: "mob-nav-bank", viewId: "bank" }
  ];

  navMap.forEach(item => {
    const desktopBtn = document.getElementById(item.btnId);
    const mobBtn = document.getElementById(item.mobId);

    const switchHandler = () => {
      document.querySelectorAll(".sidebar-nav-btn, .mobile-nav-item").forEach(b => b.classList.remove("active"));
      if (desktopBtn) desktopBtn.classList.add("active");
      if (mobBtn) mobBtn.classList.add("active");

      appState.activeView = item.viewId;
      renderCurrentView();
      document.querySelector("aside").classList.remove("open");
    };

    if (desktopBtn) desktopBtn.addEventListener("click", switchHandler);
    if (mobBtn) mobBtn.addEventListener("click", switchHandler);
  });

  const drawerBtn = document.getElementById("btn-toggle-drawer");
  if (drawerBtn) {
    drawerBtn.addEventListener("click", () => {
      document.querySelector("aside").classList.toggle("open");
    });
  }

  document.getElementById("btn-back-to-garden").addEventListener("click", () => {
    document.getElementById("active-lesson-section").style.display = "none";
    document.getElementById("level-overview-section").style.display = "block";
  });
}

function renderCurrentView() {
  document.querySelectorAll(".main-view-panel").forEach(p => p.style.display = "none");

  if (appState.activeView === "garden") {
    document.getElementById("view-garden").style.display = "block";
    renderLevelOverview();
  } else if (appState.activeView === "cognates") {
    document.getElementById("view-cognates").style.display = "block";
    renderCognatesView();
  } else if (appState.activeView === "dictionary") {
    document.getElementById("view-dictionary").style.display = "block";
    renderDictionaryView();
  } else if (appState.activeView === "bank") {
    document.getElementById("view-wordbank").style.display = "block";
    renderWordBankView();
  }
}

// Sidebar Level Selector
function initLevelSelector() {
  const levelsListContainer = document.getElementById("levels-list");
  levelsListContainer.innerHTML = "";

  const cefrLabels = ["Level A1", "Level A2", "Level B1", "Level B2", "Level C1"];

  learningDatabase.levels.forEach((lvl, idx) => {
    const item = document.createElement("div");
    item.className = `level-nav-item ${lvl.id === appState.currentLevelId ? "active" : ""}`;
    item.innerHTML = `
      <span class="lvl-dot"></span>
      <span style="font-size: 13px; font-weight: 600;">${cefrLabels[idx]}</span>
    `;

    item.addEventListener("click", () => {
      document.querySelectorAll(".level-nav-item").forEach(i => i.classList.remove("active"));
      item.classList.add("active");
      appState.currentLevelId = lvl.id;
      appState.activeView = "garden";
      document.getElementById("active-lesson-section").style.display = "none";
      document.getElementById("level-overview-section").style.display = "block";
      renderCurrentView();
    });

    levelsListContainer.appendChild(item);
  });
}

function renderLevelOverview() {
  const currentLvlObj = learningDatabase.levels.find(l => l.id === appState.currentLevelId) || learningDatabase.levels[0];

  document.getElementById("current-level-title").textContent = currentLvlObj.title;
  document.getElementById("current-level-ar-title").textContent = currentLvlObj.arabicTitle;

  const lessonsGrid = document.getElementById("lessons-list");
  lessonsGrid.innerHTML = "";

  currentLvlObj.lessons.forEach(les => {
    const card = document.createElement("div");
    card.className = "lesson-card";

    const totalVocab = les.vocabulary.length;
    const bloomedCount = les.vocabulary.filter(w => appState.bloomedWords.has(w.word)).length;

    card.innerHTML = `
      <h4>${les.title}</h4>
      <p class="les-ar" dir="rtl">${les.arabicTitle}</p>
      <p class="les-summary">${les.summary}</p>
      <div class="lesson-card-footer">
        <span>🌼 ${bloomedCount} / ${totalVocab} Yaprak Açtı</span>
        <span>Aç ➡️</span>
      </div>
    `;

    card.addEventListener("click", () => openLessonWorkspace(les));
    lessonsGrid.appendChild(card);
  });
}

function openLessonWorkspace(lesson) {
  appState.activeLesson = lesson;
  document.getElementById("level-overview-section").style.display = "none";
  document.getElementById("active-lesson-section").style.display = "block";

  document.getElementById("ws-lesson-title").textContent = lesson.title;
  document.getElementById("ws-lesson-ar-title").textContent = lesson.arabicTitle;

  // Add Lesson Quiz Button in Workspace Nav if not existing
  const wsNav = document.querySelector(".workspace-nav-bar");
  let quizBtn = document.getElementById("btn-lesson-quiz");
  if (!quizBtn) {
    quizBtn = document.createElement("button");
    quizBtn.id = "btn-lesson-quiz";
    quizBtn.className = "lesson-quiz-btn";
    wsNav.appendChild(quizBtn);
  }
  const t = i18n[appState.currentLang] || i18n.tr;
  quizBtn.innerHTML = `<span>📝</span> <span>${t.quizBtnLabel}</span>`;
  quizBtn.onclick = () => launchLessonQuiz(lesson);

  renderDaisyFlower(lesson);

  document.getElementById("word-empty-view").style.display = "flex";
  document.getElementById("word-card-detail").style.display = "none";
}

// Render Daisy Flower Radial Canvas using Absolute Calc Positioning
function renderDaisyFlower(lesson) {
  const canvas = document.getElementById("daisy-flower-canvas");
  canvas.innerHTML = "";

  const total = lesson.vocabulary.length;
  const bloomedCount = lesson.vocabulary.filter(w => appState.bloomedWords.has(w.word)).length;

  document.getElementById("ws-bloomed-count").textContent = bloomedCount;
  document.getElementById("ws-total-count").textContent = total;

  // Center Flower Core
  const core = document.createElement("div");
  core.className = "flower-center-core";
  core.innerHTML = `
    <span class="icon">🌼</span>
    <span class="lbl">${bloomedCount}/${total} Açtı</span>
  `;
  canvas.appendChild(core);

  // Absolute positioning around 440px canvas center (220px, 220px)
  const radius = 155;
  lesson.vocabulary.forEach((wordObj, idx) => {
    const angle = (idx / total) * (2 * Math.PI) - (Math.PI / 2);
    const x = Math.round(Math.cos(angle) * radius);
    const y = Math.round(Math.sin(angle) * radius);

    const petal = document.createElement("div");
    petal.className = "daisy-petal-item";
    if (appState.bloomedWords.has(wordObj.word)) petal.classList.add("bloomed");
    if (wordObj.is_cognate) petal.classList.add("is-cognate");

    petal.style.left = `calc(50% + ${x}px - 55px)`;
    petal.style.top = `calc(50% + ${y}px - 22px)`;
    petal.textContent = wordObj.word;

    petal.addEventListener("click", (e) => {
      e.stopPropagation();
      document.querySelectorAll(".daisy-petal-item").forEach(p => p.classList.remove("selected"));
      petal.classList.add("selected");
      appState.selectedWord = wordObj;
      renderWordInspector(wordObj, petal);
    });

    canvas.appendChild(petal);
  });
}

function renderWordInspector(wordObj, petalElement) {
  document.getElementById("word-empty-view").style.display = "none";
  const detailCard = document.getElementById("word-card-detail");
  detailCard.style.display = "flex";

  const isBloomed = appState.bloomedWords.has(wordObj.word);
  const t = i18n[appState.currentLang] || i18n.tr;

  const mpTip = appState.currentLang === "en" ? (wordObj.mind_palace_en || wordObj.mind_palace_tr) :
                appState.currentLang === "ar" ? (wordObj.mind_palace_ar || wordObj.mind_palace_tr) :
                wordObj.mind_palace_tr;

  const mpTitle = appState.currentLang === "en" ? "🧠 Mind Palace Visual Mnemonic:" :
                  appState.currentLang === "ar" ? "🧠 تقنية قصر الذاكرة (Mind Palace):" :
                  "🧠 Zihin Sarayı Görselleştirme Tekniği:";

  detailCard.innerHTML = `
    <div class="detail-word-header">
      <div>
        <h3>${wordObj.word}</h3>
        <span style="font-size: 13px; color: var(--color-text-muted);">${wordObj.pronunciation || ''}</span>
      </div>
      <button class="audio-btn-large" id="btn-play-tts" title="Dinle">🔊</button>
    </div>

    <div class="translations-box">
      <div class="trans-item">
        <span class="flag">🇬🇧</span>
        <strong>${wordObj.en}</strong>
      </div>
      <div class="trans-item">
        <span class="flag">🇸🇦</span>
        <p class="ar-text">${wordObj.ar}</p>
      </div>
    </div>

    ${wordObj.is_cognate ? `
      <div class="cognate-note-card">
        <span>💡</span>
        <div>
          <strong>Arapça Ortak Kelime (Cognate): ${wordObj.ar}</strong>
          <p>${wordObj.cognate_info ? wordObj.cognate_info.note_tr : 'Türkçe ve Arapça ortak kökenli kelime.'}</p>
        </div>
      </div>
    ` : ''}

    ${mpTip ? `
      <div class="mind-palace-note-card">
        <span class="mp-icon">🧠</span>
        <div>
          <strong>${mpTitle}</strong>
          <p style="font-size: 13px; line-height: 1.4; margin-top: 4px;">${mpTip}</p>
        </div>
      </div>
    ` : ''}

    <div class="sentence-card-box">
      <p class="sentence-tr">"${wordObj.sentence_tr || ''}"</p>
      <p class="sentence-en">${wordObj.sentence_en || ''}</p>
      <p class="sentence-ar" dir="rtl">${wordObj.sentence_ar || ''}</p>
    </div>

    <button class="bloom-action-btn ${isBloomed ? 'bloomed-state' : ''}" id="btn-bloom-petal">
      ${isBloomed ? t.bloomedStateBtn : t.bloomBtnAction}
    </button>
  `;

  document.getElementById("btn-play-tts").addEventListener("click", () => speakText(wordObj.word));

  document.getElementById("btn-bloom-petal").addEventListener("click", () => {
    if (!appState.bloomedWords.has(wordObj.word)) {
      appState.bloomedWords.add(wordObj.word);
      appState.yusufPoints += 5;
      localStorage.setItem("suzitta_bloomed_words", JSON.stringify(Array.from(appState.bloomedWords)));
      localStorage.setItem("suzitta_yusuf_points", appState.yusufPoints.toString());

      if (petalElement) petalElement.classList.add("bloomed");
      speakText(`Tebrikler Suzim! ${wordObj.word} kelimesini öğrendin. 5 Yusuf Puanı kazandın.`);

      renderDaisyFlower(appState.activeLesson);
      updateGlobalStats();
      renderWordInspector(wordObj, petalElement);
    }
  });
}

// Interactive Lesson Quiz System with Yusuf Pride Celebration Modal
function launchLessonQuiz(lesson) {
  const t = i18n[appState.currentLang] || i18n.tr;
  const questions = lesson.vocabulary.slice(0, 3).map(wordObj => {
    const wrong1 = learningDatabase.vocabularyBank[(Math.floor(Math.random() * learningDatabase.vocabularyBank.length))].en;
    const wrong2 = learningDatabase.vocabularyBank[(Math.floor(Math.random() * learningDatabase.vocabularyBank.length))].en;
    const options = [wordObj.en, wrong1, wrong2].sort(() => Math.random() - 0.5);

    return {
      word: wordObj.word,
      correct: wordObj.en,
      options: options
    };
  });

  let currentQ = 0;
  let score = 0;

  const quizBackdrop = document.createElement("div");
  quizBackdrop.className = "welcome-modal-backdrop";
  quizBackdrop.id = "quiz-modal-backdrop";

  const quizCard = document.createElement("div");
  quizCard.className = "welcome-glass-card";

  const renderQuestion = () => {
    if (currentQ >= questions.length) {
      // Quiz Finished! Trigger Yusuf Pride Celebration
      appState.yusufPoints += 25;
      localStorage.setItem("suzitta_yusuf_points", appState.yusufPoints.toString());
      updateGlobalStats();

      speakText(`Tebrikler Suzim! Yusuf seninle gurur duyuyor!`);

      quizCard.innerHTML = `
        <div class="welcome-flower-icon">🎉</div>
        <h2>${t.quizSuccessTitle}</h2>
        <p style="font-size: 16px; font-weight: 600; color: var(--color-primary); margin: 12px 0;">${t.quizSuccessDesc}</p>
        <div class="welcome-intro-box" style="background: var(--color-accent-light); border-color: var(--color-accent);">
          <strong style="font-size: 18px; color: var(--color-primary-dark);">${t.quizPointsEarned}</strong>
        </div>
        <button class="welcome-start-btn" id="btn-close-quiz">Tamam & Bahçeye Dön 🌼</button>
      `;

      document.getElementById("btn-close-quiz").onclick = () => {
        quizBackdrop.remove();
      };
      return;
    }

    const qData = questions[currentQ];
    quizCard.innerHTML = `
      <div style="font-size: 13px; font-weight: 700; color: var(--color-secondary);">Soru ${currentQ + 1} / ${questions.length}</div>
      <h3 style="font-size: 24px; color: var(--color-primary); margin: 10px 0;">"${qData.word}" kelimesinin İngilizce karşılığı nedir?</h3>
      <div style="display: flex; flex-direction: column; gap: 10px; margin: 20px 0;">
        ${qData.options.map(opt => `
          <button class="quiz-opt-btn" data-val="${opt}">${opt}</button>
        `).join('')}
      </div>
    `;

    quizCard.querySelectorAll(".quiz-opt-btn").forEach(btn => {
      btn.onclick = () => {
        if (btn.dataset.val === qData.correct) score++;
        currentQ++;
        renderQuestion();
      };
    });
  };

  quizBackdrop.appendChild(quizCard);
  document.body.appendChild(quizBackdrop);
  renderQuestion();
}

function renderCognatesView() {
  const container = document.getElementById("cognates-grid-container");
  container.innerHTML = "";

  const cognates = learningDatabase.vocabularyBank.filter(w => w.is_cognate);

  cognates.forEach(c => {
    const card = document.createElement("div");
    card.className = "cognate-card";
    card.innerHTML = `
      <div class="cognate-card-top">
        <h4>${c.word}</h4>
        <span class="ar-root">${c.ar}</span>
      </div>
      <div class="cognate-meanings">
        <p><strong>EN:</strong> ${c.en}</p>
      </div>
      <div style="font-size: 12px; color: var(--color-primary); background: rgba(255,255,255,0.7); padding: 8px; border-radius: 8px; border: 1px solid var(--color-border-subtle);">
        "${c.sentence_tr}"
      </div>
    `;

    card.addEventListener("click", () => speakText(c.word));
    container.appendChild(card);
  });
}

function renderDictionaryView() {
  const tbody = document.getElementById("dictionary-table-body");
  const input = document.getElementById("dict-search-input");
  const filter = document.getElementById("dict-level-filter");

  const renderTable = () => {
    tbody.innerHTML = "";
    const query = input.value.toLowerCase().trim();
    const selectedLvl = filter.value;

    let items = learningDatabase.vocabularyBank;

    if (selectedLvl !== "all") {
      items = items.filter(w => w.level.toString() === selectedLvl);
    }

    if (query) {
      items = items.filter(w =>
        w.word.toLowerCase().includes(query) ||
        w.en.toLowerCase().includes(query) ||
        w.ar.includes(query)
      );
    }

    items.slice(0, 250).forEach(w => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td><strong>${w.word}</strong> ${w.is_cognate ? '💡' : ''}</td>
        <td style="color: var(--color-text-muted);">${w.pronunciation || ''}</td>
        <td>${w.en}</td>
        <td class="ar-cell">${w.ar}</td>
        <td>${w.sentence_tr || ''}</td>
      `;
      tr.addEventListener("click", () => speakText(w.word));
      tbody.appendChild(tr);
    });
  };

  input.oninput = renderTable;
  filter.onchange = renderTable;
  renderTable();
}

function renderWordBankView() {
  const container = document.getElementById("wb-learned-tags-cloud");
  const emptyMsg = document.getElementById("wb-empty-msg");
  container.innerHTML = "";

  const bloomedList = Array.from(appState.bloomedWords);

  if (bloomedList.length === 0) {
    emptyMsg.style.display = "block";
    return;
  }

  emptyMsg.style.display = "none";

  bloomedList.forEach(wName => {
    const tag = document.createElement("div");
    tag.className = "wb-tag-item";
    tag.innerHTML = `<span>🌼</span> <span>${wName}</span>`;
    tag.addEventListener("click", () => speakText(wName));
    container.appendChild(tag);
  });
}

function updateGlobalStats() {
  const totalBloomed = appState.bloomedWords.size;
  const totalVocab = learningDatabase.vocabularyBank.length;

  document.getElementById("bloomed-petals-count").textContent = `${totalBloomed} Yaprak (${appState.yusufPoints} Yusuf Puanı)`;

  const percent = Math.min(100, Math.round((totalBloomed / totalVocab) * 100));
  document.getElementById("progress-percent").textContent = `${percent}%`;
  document.getElementById("overall-progress-bar").style.width = `${percent}%`;
}

function speakText(text) {
  if (appState.isMuted || !('speechSynthesis' in window)) return;

  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "tr-TR";
  utterance.rate = appState.voiceSpeed;
  window.speechSynthesis.speak(utterance);
}
