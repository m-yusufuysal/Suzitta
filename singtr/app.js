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
  const drawerBtn = document.getElementById("btn-toggle-drawer");
  const drawerCloseBtn = document.getElementById("btn-close-drawer");
  const drawerBackdrop = document.getElementById("drawer-backdrop");
  const asideElement = document.querySelector("aside");

  const closeDrawer = () => {
    if (asideElement) asideElement.classList.remove("open");
    if (drawerBackdrop) drawerBackdrop.classList.remove("active");
  };

  const openDrawer = () => {
    if (asideElement) asideElement.classList.add("open");
    if (drawerBackdrop) drawerBackdrop.classList.add("active");
  };

  if (drawerBtn) drawerBtn.addEventListener("click", openDrawer);
  if (drawerCloseBtn) drawerCloseBtn.addEventListener("click", closeDrawer);
  if (drawerBackdrop) drawerBackdrop.addEventListener("click", closeDrawer);

  const navMap = [
    { btnId: "nav-btn-garden", mobId: "mob-nav-garden", viewId: "garden" },
    { btnId: "nav-btn-cognates", mobId: "mob-nav-cognates", viewId: "cognates" },
    { btnId: "nav-btn-dictionary", mobId: "mob-nav-dictionary", viewId: "dictionary" },
    { btnId: "nav-btn-quiz", mobId: "mob-nav-quiz", viewId: "quiz" },
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
      closeDrawer();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    if (desktopBtn) desktopBtn.addEventListener("click", switchHandler);
    if (mobBtn) mobBtn.addEventListener("click", switchHandler);
  });

  document.getElementById("btn-back-to-garden").addEventListener("click", () => {
    document.getElementById("active-lesson-section").style.display = "none";
    document.getElementById("level-overview-section").style.display = "block";
    window.scrollTo({ top: 0, behavior: 'smooth' });
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
  } else if (appState.activeView === "quiz") {
    document.getElementById("view-quiz").style.display = "block";
    renderQuizHubView();
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

// Render Daisy Flower Radial Canvas using Responsive Dual-Ring Calc Positioning
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

  // Responsive radius & dual-ring layout calculation
  const isMobile = window.innerWidth <= 600;
  const baseOuterRadius = isMobile ? 125 : (total > 16 ? 175 : 155);
  const baseInnerRadius = isMobile ? 75 : 110;

  lesson.vocabulary.forEach((wordObj, idx) => {
    let radius = baseOuterRadius;
    if (total > 14) {
      radius = (idx % 2 === 0) ? baseOuterRadius : baseInnerRadius;
    }

    const angle = (idx / total) * (2 * Math.PI) - (Math.PI / 2);
    const x = Math.round(Math.cos(angle) * radius);
    const y = Math.round(Math.sin(angle) * radius);

    const petal = document.createElement("div");
    petal.className = "daisy-petal-item";
    if (appState.bloomedWords.has(wordObj.word)) petal.classList.add("bloomed");
    if (wordObj.is_cognate) petal.classList.add("is-cognate");

    const offsetW = isMobile ? 42 : 55;
    const offsetH = isMobile ? 18 : 22;

    petal.style.left = `calc(50% + ${x}px - ${offsetW}px)`;
    petal.style.top = `calc(50% + ${y}px - ${offsetH}px)`;
    petal.textContent = wordObj.word;

    petal.addEventListener("click", (e) => {
      e.stopPropagation();
      document.querySelectorAll(".daisy-petal-item").forEach(p => p.classList.remove("selected"));
      petal.classList.add("selected");
      appState.selectedWord = wordObj;
      renderWordInspector(wordObj, petal);

      // On mobile screens, scroll down smoothly to word inspector detail card
      if (window.innerWidth <= 768) {
        const detailCard = document.getElementById("word-card-detail");
        if (detailCard) detailCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
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

// ═══════════════════════════════════════════════════════════════
// Interactive Quiz & Test Suite (Multi-Type Questions, Audio TTS, Zihin Sarayı Box)
// ═══════════════════════════════════════════════════════════════

function renderQuizHubView() {
  const currentLvlObj = learningDatabase.levels.find(l => l.id === appState.currentLevelId) || learningDatabase.levels[0];

  const btnLesson = document.getElementById("btn-start-current-lesson-quiz");
  if (btnLesson) {
    btnLesson.onclick = () => {
      const lesson = appState.activeLesson || currentLvlObj.lessons[0];
      startInteractiveQuizEngine(`Ders Sınavı: ${lesson.title}`, lesson.vocabulary, 8);
    };
  }

  const btnCognates = document.getElementById("btn-start-cognates-quiz");
  if (btnCognates) {
    btnCognates.onclick = () => {
      const cognates = learningDatabase.vocabularyBank.filter(w => w.is_cognate);
      startInteractiveQuizEngine("💡 Arapça Ortak Kelimeler Testi", cognates, 10);
    };
  }

  const btnLevel = document.getElementById("btn-start-level-exam");
  if (btnLevel) {
    btnLevel.onclick = () => {
      const allWordsInLevel = currentLvlObj.lessons.flatMap(l => l.vocabulary);
      startInteractiveQuizEngine(`🏆 Seviye Bitirme Sınavı (${currentLvlObj.cefrCode})`, allWordsInLevel, 10);
    };
  }

  const btnMP = document.getElementById("btn-start-mind-palace-quiz");
  if (btnMP) {
    btnMP.onclick = () => {
      const mpWords = learningDatabase.vocabularyBank.filter(w => w.mind_palace_tr || w.mind_palace_en);
      startInteractiveQuizEngine("🧠 Zihin Sarayı Görsel Hafıza Testi", mpWords, 8);
    };
  }
}

function launchLessonQuiz(lesson) {
  startInteractiveQuizEngine(`Ders Testi: ${lesson.title}`, lesson.vocabulary, 8);
}

function startInteractiveQuizEngine(quizTitle, vocabList, questionCount = 8) {
  if (!vocabList || vocabList.length === 0) {
    vocabList = learningDatabase.vocabularyBank;
  }

  const shuffled = [...vocabList].sort(() => Math.random() - 0.5);
  const selectedWords = shuffled.slice(0, Math.min(questionCount, shuffled.length));

  const questions = selectedWords.map(wordObj => {
    let possibleTypes = ['translate', 'sentence', 'audio'];
    if (wordObj.is_cognate) possibleTypes.push('cognate');
    if (wordObj.mind_palace_tr || wordObj.mind_palace_en) possibleTypes.push('mind_palace');

    const qType = possibleTypes[Math.floor(Math.random() * possibleTypes.length)];

    // SMART TOPIC-MATCHED DISTRACTOR GENERATOR
    // Priority 1: Other words in current lesson/vocabList
    // Priority 2: Other words in current level
    // Priority 3: Overall vocabulary bank
    let candidatePool = vocabList.filter(w => w.word !== wordObj.word);

    if (candidatePool.length < 3 && wordObj.level) {
      const sameLevelWords = learningDatabase.vocabularyBank.filter(
        w => w.level === wordObj.level && w.word !== wordObj.word && !candidatePool.some(cp => cp.word === w.word)
      );
      candidatePool = candidatePool.concat(sameLevelWords);
    }

    if (candidatePool.length < 3) {
      const remainingBank = learningDatabase.vocabularyBank.filter(
        w => w.word !== wordObj.word && !candidatePool.some(cp => cp.word === w.word)
      );
      candidatePool = candidatePool.concat(remainingBank);
    }

    const poolShuffled = [...candidatePool].sort(() => Math.random() - 0.5);

    const distractors = [];
    for (let item of poolShuffled) {
      if (distractors.length >= 3) break;

      let val = "";
      if (qType === 'translate') {
        val = appState.currentLang === 'ar' ? item.ar : item.en;
      } else {
        val = item.word;
      }

      const correctOptionVal = (qType === 'translate') ? (appState.currentLang === 'ar' ? wordObj.ar : wordObj.en) : wordObj.word;

      if (val && val !== correctOptionVal && !distractors.includes(val)) {
        distractors.push(val);
      }
    }

    let prompt = "";
    let correctVal = "";
    let typeBadge = "";

    if (qType === 'translate') {
      typeBadge = "🌐 Anlam Testi";
      const targetLangName = appState.currentLang === 'ar' ? 'Arapça' : 'İngilizce';
      prompt = `"${wordObj.word}" kelimesinin ${targetLangName} karşılığı nedir?`;
      correctVal = appState.currentLang === 'ar' ? wordObj.ar : wordObj.en;
    } else if (qType === 'sentence') {
      typeBadge = "💬 Cümle Tamamlama";
      const sentenceClean = wordObj.sentence_tr ? wordObj.sentence_tr.replace(new RegExp(wordObj.word, 'gi'), '_____') : `... ${wordObj.en}`;
      prompt = `Cümlede boş bırakılan yere hangi kelime gelmelidir?\n"${sentenceClean}"`;
      correctVal = wordObj.word;
    } else if (qType === 'audio') {
      typeBadge = "🔊 Sesli Telaffuz Testi";
      prompt = `Dinlediğiniz Türkçe kelime hangisidir? (Ses açılmadıysa ses butonuna basın)`;
      correctVal = wordObj.word;
    } else if (qType === 'cognate') {
      typeBadge = "💡 Arapça Ortak Kök Testi";
      const rootNote = wordObj.cognate_info ? (wordObj.cognate_info.note_ar || wordObj.ar) : wordObj.ar;
      prompt = `"${rootNote}" (Arapça) kelimesi ile aynı kökten gelen Türkçe kelime hangisidir?`;
      correctVal = wordObj.word;
    } else if (qType === 'mind_palace') {
      typeBadge = "🧠 Zihin Sarayı Hafıza Testi";
      const mpText = appState.currentLang === 'en' ? (wordObj.mind_palace_en || wordObj.mind_palace_tr) : (wordObj.mind_palace_tr || wordObj.mind_palace_en);
      prompt = `Zihin Sarayı Görsel Sahnesi:\n"${mpText}"\nBu görsel sahne hangi kelimeye aittir?`;
      correctVal = wordObj.word;
    }

    const options = [correctVal, ...distractors].sort(() => Math.random() - 0.5);

    return {
      wordObj,
      qType,
      typeBadge,
      prompt,
      correctVal,
      options
    };
  });

  let currentIdx = 0;
  let score = 0;
  let answered = false;

  const backdrop = document.createElement("div");
  backdrop.className = "welcome-modal-backdrop quiz-interactive-backdrop";
  backdrop.id = "quiz-modal-backdrop";

  const card = document.createElement("div");
  card.className = "welcome-glass-card quiz-runner-card";

  // Permanent Close X Button
  const closeBtnX = document.createElement("button");
  closeBtnX.className = "modal-close-icon-btn";
  closeBtnX.id = "btn-quiz-modal-x";
  closeBtnX.setAttribute("title", "Sınavdan Çık / Kapat");
  closeBtnX.innerHTML = "✕";

  const closeQuiz = () => {
    backdrop.remove();
  };

  closeBtnX.onclick = closeQuiz;
  backdrop.onclick = (e) => {
    if (e.target === backdrop) closeQuiz();
  };

  const cardBody = document.createElement("div");
  cardBody.id = "quiz-card-body";
  cardBody.style.width = "100%";

  card.appendChild(closeBtnX);
  card.appendChild(cardBody);
  backdrop.appendChild(card);
  document.body.appendChild(backdrop);

  const renderCurrentQuestion = () => {
    answered = false;
    if (currentIdx >= questions.length) {
      const percent = Math.round((score / questions.length) * 100);
      const pointsEarned = score * 5 + 15;
      appState.yusufPoints += pointsEarned;
      localStorage.setItem("suzitta_yusuf_points", appState.yusufPoints.toString());
      updateGlobalStats();

      let praiseMsg = "Harika bir çalışma Suzim!";
      if (percent === 100) praiseMsg = "Tebrikler Suzim! %100 Mükemmel Başarı! Yusuf seninle gurur duyuyor! 🌟";
      else if (percent >= 70) praiseMsg = "Tebrikler Suzim! Harika bir performans gösterdin! 🌸";

      speakText(praiseMsg);

      cardBody.innerHTML = `
        <div class="welcome-flower-icon">🏆</div>
        <h2>Sınav Tamamlandı! 🎉</h2>
        <div style="font-size: 32px; font-weight: 800; color: var(--color-primary); margin: 10px 0;">%${percent} Başarı</div>
        <p style="font-size: 15px; color: var(--color-text-muted);">${score} / ${questions.length} Soru Doğru Cevaplandı</p>

        <div class="welcome-intro-box" style="background: var(--color-accent-light); border-color: var(--color-accent); margin: 16px 0;">
          <strong style="font-size: 18px; color: var(--color-primary-dark);">+${pointsEarned} Yusuf Puanı Kazandın! 🏅</strong>
        </div>

        <div style="display: flex; gap: 12px; justify-content: center; width: 100%; margin-top: 10px;">
          <button class="welcome-start-btn" id="btn-quiz-retry" style="background: var(--color-secondary);">Yeniden Çöz 🔄</button>
          <button class="welcome-start-btn" id="btn-quiz-close">Tamam & Bahçeye Dön 🌼</button>
        </div>
      `;

      document.getElementById("btn-quiz-retry").onclick = () => {
        backdrop.remove();
        startInteractiveQuizEngine(quizTitle, vocabList, questionCount);
      };
      document.getElementById("btn-quiz-close").onclick = closeQuiz;
      return;
    }

    const q = questions[currentIdx];
    const progressPercent = Math.round(((currentIdx) / questions.length) * 100);

    if (q.qType === 'audio') {
      setTimeout(() => speakText(q.wordObj.word), 300);
    }

    cardBody.innerHTML = `
      <div style="width: 100%; display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; padding-right: 28px;">
        <span style="font-size: 12px; font-weight: 700; color: var(--color-secondary);">${escapeHtml(quizTitle)}</span>
        <span style="font-size: 12px; font-weight: 700; color: var(--color-primary);">Soru ${currentIdx + 1} / ${questions.length}</span>
      </div>

      <div class="quiz-progress-track">
        <div class="quiz-progress-bar" style="width: ${progressPercent}%;"></div>
      </div>

      <div style="display: inline-block; padding: 4px 12px; border-radius: var(--radius-pill); background: var(--color-accent-light); border: 1px solid var(--color-accent); font-size: 12px; font-weight: 700; color: var(--color-primary-dark); margin: 8px 0;">
        ${q.typeBadge}
      </div>

      <div style="font-size: 17px; font-weight: 700; color: var(--color-text-main); margin: 10px 0; text-align: center; line-height: 1.4;">
        ${q.prompt.replace(/\n/g, '<br>')}
      </div>

      ${q.qType === 'audio' ? `
        <button class="quiz-listen-btn" id="btn-quiz-tts-listen">
          <span>🔊</span> <span>Telaffuzu Dinle</span>
        </button>
      ` : ''}

      <div class="quiz-options-grid" style="display: flex; flex-direction: column; gap: 10px; width: 100%; margin: 14px 0;">
        ${q.options.map((opt, i) => `
          <button class="quiz-opt-btn" data-val="${escapeHtml(opt)}">
            <span class="opt-letter">${String.fromCharCode(65 + i)}</span>
            <span class="opt-text">${escapeHtml(opt)}</span>
          </button>
        `).join('')}
      </div>

      <div class="quiz-memory-box" id="quiz-memory-box" style="display: none;"></div>

      <button class="welcome-start-btn" id="btn-quiz-next" style="display: none; margin-top: 12px;">Devam Et ➡️</button>
    `;

    if (document.getElementById("btn-quiz-tts-listen")) {
      document.getElementById("btn-quiz-tts-listen").onclick = () => speakText(q.wordObj.word);
    }

    const optBtns = cardBody.querySelectorAll(".quiz-opt-btn");
    optBtns.forEach(btn => {
      btn.onclick = () => {
        if (answered) return;
        answered = true;

        const val = btn.getAttribute("data-val");
        const isCorrect = val === q.correctVal;

        if (isCorrect) {
          btn.classList.add("correct");
          score++;
          speakText("Harika!");
          setTimeout(() => {
            currentIdx++;
            renderCurrentQuestion();
          }, 1100);
        } else {
          btn.classList.add("incorrect");
          speakText("Yanlış cevap!");

          optBtns.forEach(b => {
            if (b.getAttribute("data-val") === q.correctVal) {
              b.classList.add("correct");
            }
          });

          const memBox = document.getElementById("quiz-memory-box");
          memBox.style.display = "block";
          memBox.innerHTML = `
            <div style="font-size: 13px; font-weight: 700; color: #D32F2F; margin-bottom: 4px;">❌ Yanlış Cevap - Doğruyu Öğrenelim:</div>
            <div style="font-size: 15px; font-weight: 700; color: var(--color-primary);">✅ Doğru Cevap: ${escapeHtml(q.wordObj.word)} (${escapeHtml(q.wordObj.en)} / ${escapeHtml(q.wordObj.ar)})</div>
            ${q.wordObj.mind_palace_tr ? `<div style="font-size: 12px; color: var(--color-text-main); margin-top: 6px;">🧠 <strong>Zihin Sarayı İpucu:</strong> ${escapeHtml(q.wordObj.mind_palace_tr)}</div>` : ''}
            ${q.wordObj.sentence_tr ? `<div style="font-size: 12px; color: var(--color-text-muted); margin-top: 4px;">💬 <strong>Örnek Cümle:</strong> ${escapeHtml(q.wordObj.sentence_tr)}</div>` : ''}
          `;

          const nextBtn = document.getElementById("btn-quiz-next");
          nextBtn.style.display = "block";
          nextBtn.onclick = () => {
            currentIdx++;
            renderCurrentQuestion();
          };

          setTimeout(() => {
            card.scrollTo({ top: card.scrollHeight, behavior: 'smooth' });
          }, 150);
        }
      };
    });
  };

  backdrop.appendChild(card);
  document.body.appendChild(backdrop);
  renderCurrentQuestion();
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
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

    // Display all matching vocabulary items in the dictionary (up to 500 per rendering cycle for performance)
    items.slice(0, 600).forEach(w => {
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
