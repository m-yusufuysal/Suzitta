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
    navQuiz: "Test & Quiz",
    navBank: "Kelime Bankam",
    levelsHeader: "SEVİYELER (LEVELS)",
    statPetalsLbl: "Açan Yapraklar",
    statProgressLbl: "Genel İlerleme",
    langLbl: "Dil:",
    backGarden: "Bahçeye Dön",
    daisyTitle: "🌸 Papatya Çiçeği & Yapraklar",
    daisyHint: "Her kelime bir yapraktır. Yaprağa dokun, anlamını ve örnek cümlesini öğrenerek çiçeğini açtır!",
    inspectorEmptyTitle: "Bir Yaprak Seçin",
    inspectorEmptyDesc: "Papatyadan bir yaprağa dokunarak kelimenin anlamını, örnek cümlesini ve Arapça/İngilizce kökenini inceleyin.",
    bloomBtnAction: "Yaprağı Açtır 🌼 (+5 Yusuf Puanı)",
    bloomedStateBtn: "Yaprak Çiçek Açtı 🌸",
    cognateTitle: "💡 Ortak Kelimeler Rehberi (Shared Cognates)",
    cognateDesc: "Türkçe'deki Arapça kökenli ve uluslararası İngilizce ortak kelimelerle Türkçe öğrenmeyi 10 kat hızlandırın!",
    dictTitle: "📚 Büyük Türkçe - İngilizce - Arapça Sözlük",
    dictSubtitle: "3,500'den fazla doğrulanmış kelime, 75 ders ve örnek cümle rehberi.",
    dictSearchPlaceholder: "Kelime ara... (Türkçe, English, العربية)",
    wbTitle: "🗂️ Öğrendiğin Yapraklar & Kelimeler",
    wbSubtitle: "Papatya bahçende suladığın ve tamamen açan kelimeleriniz.",
    wbEmptyText: "Henüz kelime öğrenilmedi. Papatya yapraklarına dokunarak öğrenmeye başla!",
    quizHubTitle: "📝 Suzim'in Türkçe Test & Quiz Merkezi",
    quizHubDesc: "Öğrendiğin kelimeleri, Arapça ortak kökleri ve örnek cümleleri interaktif sınavlarla pekiştir!",
    yusufWelcome: "Hoş geldin Suzim! 🌼 3,500'den fazla kelimeyi ve örnek cümleleri kolayca öğren!",
    quizBtnLabel: "📝 Ders Testi & Quiz",
    quizSuccessTitle: "Tebrikler Suzim! 🎉",
    quizSuccessDesc: "Yusuf seninle gurur duyuyor! 🌟 Ders sınavını harika bir başarıyla geçtin!",
    quizPointsEarned: "+25 Yusuf Puanı Kazandın! 🏅"
  },
  en: {
    brandTitle: "Suzim's Turkish Garden",
    brandSub: "Suzim's Turkish Learning Garden",
    navGarden: "Daisy Garden",
    navCognates: "Shared Cognates",
    navDictionary: "Dictionary",
    navQuiz: "Tests & Quizzes",
    navBank: "Word Bank",
    levelsHeader: "LEVELS",
    statPetalsLbl: "Bloomed Petals",
    statProgressLbl: "Overall Progress",
    langLbl: "Language:",
    backGarden: "Back to Garden",
    daisyTitle: "🌸 Daisy Flower & Petals",
    daisyHint: "Every word is a petal. Touch a petal to learn meanings and sample sentences, then bloom your flower!",
    inspectorEmptyTitle: "Select a Petal",
    inspectorEmptyDesc: "Touch a petal on the daisy to inspect meanings, sample sentences, and shared cognate roots.",
    bloomBtnAction: "Bloom This Petal 🌼 (+5 Yusuf Points)",
    bloomedStateBtn: "Petal Bloomed 🌸",
    cognateTitle: "💡 Shared Cognates Guide (Arabic & English)",
    cognateDesc: "Accelerate your Turkish 10x with authentic Arabic cognates and international English loanwords!",
    dictTitle: "📚 Turkish - English - Arabic Dictionary",
    dictSubtitle: "Over 3,500 verified words, 75 lessons, and example sentences.",
    dictSearchPlaceholder: "Search word... (Turkish, English, Arabic)",
    wbTitle: "🗂️ Mastered Words & Petals",
    wbSubtitle: "Words and petals you have bloomed in your garden.",
    wbEmptyText: "No petals bloomed yet. Touch daisy petals to start learning!",
    quizHubTitle: "📝 Suzim's Turkish Test & Quiz Center",
    quizHubDesc: "Master vocabulary, Arabic shared roots, and sentences with interactive quizzes!",
    yusufWelcome: "Welcome Suzim! 🌼 Master 3,500+ Turkish words and sentences with ease!",
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
    navQuiz: "الاختبارات والتقييم",
    navBank: "بنك الكلمات",
    levelsHeader: "المستويات",
    statPetalsLbl: "البتلات المتفتحة",
    statProgressLbl: "التقدم العام",
    langLbl: "اللغة:",
    backGarden: "العودة إلى البستان",
    daisyTitle: "🌸 زهرة الأقحوان والبتلات",
    daisyHint: "كل كلمة هي بتلة. إلمس البتلة لتعلم معناها وجملتها التوضيحية وتفتيح زهرتك!",
    inspectorEmptyTitle: "اختر بتلة",
    inspectorEmptyDesc: "إلمس بتلة في الأقحوان لاستعراض المعنى والجملة التوضيحية والأصل العربي.",
    bloomBtnAction: "افتح البتلة 🌼 (+5 نقاط يوسف)",
    bloomedStateBtn: "تفتحت البتلة 🌸",
    cognateTitle: "💡 دليل الكلمات المشتركة (عربي وإنجليزي)",
    cognateDesc: "سرّعي تعلم اللغة التركية 10 أضعاف باستخدام الكلمات المشتركة مع العربية والإنجليزي!",
    dictTitle: "📚 المعجم الكبير: تركي - إنجليزي - عربي",
    dictSubtitle: "أكثر من 3500 كلمة موثقة، 75 درساً وجمل توضيحية.",
    dictSearchPlaceholder: "ابحث عن كلمة... (تركي، إنجليزي، عربي)",
    wbTitle: "🗂️ الكلمات والبتلات المكتسبة",
    wbSubtitle: "الكلمات والبتلات التي قمت بسقايتها وتفتيحها في بستانك.",
    wbEmptyText: "لم يتم تفتيح أي بتلات بعد. إلمس بتلات الأقحوان للبدء بالتعلم!",
    quizHubTitle: "📝 مركز سوزي للاختبارات والتقييم",
    quizHubDesc: "أتقني الكلمات والجذور المشتركة والجمل من خلال اختبارات تفاعلية!",
    yusufWelcome: "أهلاً بكِ يا سوزي! 🌼 احفظي أكثر من 3500 كلمة وجملة بسهولة!",
    quizBtnLabel: "📝 اختبار الدرس والتقييم",
    quizSuccessTitle: "ألف مبروك يا سوزي! 🎉",
    quizSuccessDesc: "يوسف فخور بكِ جداً! 🌟 لقد اجتزتِ اختبار الدرس بنجاح باهر!",
    quizPointsEarned: "اكسبتِ +25 من نقاط يوسف! 🏅"
  },
  zh: {
    brandTitle: "Suzim的土耳其语花园",
    brandSub: "Suzim土耳其语学习花园",
    navGarden: "雏菊花园",
    navCognates: "同源同义词",
    navDictionary: "词典",
    navQuiz: "测试与测验",
    navBank: "词汇库",
    levelsHeader: "等级 (LEVELS)",
    statPetalsLbl: "已绽放花瓣",
    statProgressLbl: "总体进度",
    langLbl: "语言:",
    backGarden: "返回花园",
    daisyTitle: "🌸 雏菊花与花瓣",
    daisyHint: "每个单词都是一片花瓣。点击花瓣学习含义与例句，让花朵绽放！",
    inspectorEmptyTitle: "请选择花瓣",
    inspectorEmptyDesc: "点击雏菊上的花瓣，查看释义、例句与同源词。",
    bloomBtnAction: "让花瓣绽放 🌼 (+5 Yusuf积分)",
    bloomedStateBtn: "花瓣已绽放 🌸",
    cognateTitle: "💡 同源词指南 (阿拉伯语与英语)",
    cognateDesc: "利用阿拉伯语与国际英语同源词，10倍加速土耳其语学习！",
    dictTitle: "📚 土耳其语 - 英语 - 阿拉伯语大词典",
    dictSubtitle: "超过3,500个核实词汇，75堂课程及例句。",
    dictSearchPlaceholder: "搜索单词... (土耳其语, English, 阿拉伯语)",
    wbTitle: "🗂️ 已掌握单词与花瓣",
    wbSubtitle: "在花园中已灌溉并绽放的单词与花瓣。",
    wbEmptyText: "尚未绽放花瓣。点击雏菊花瓣开始学习！",
    quizHubTitle: "📝 Suzim土耳其语测试中心",
    quizHubDesc: "通过互动测试，掌握词汇、阿拉伯语同源词与例句！",
    yusufWelcome: "欢迎Suzim！🌼 轻松掌握3,500+个土耳其语单词与例句！",
    quizBtnLabel: "📝 课程测试与测验",
    quizSuccessTitle: "恭喜Suzim！🎉",
    quizSuccessDesc: "Yusuf为你感到非常自豪！🌟 你以优异成绩通过了课程测试！",
    quizPointsEarned: "获得 +25 Yusuf积分！🏅"
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
  initQuizHubGlobalListeners();
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

  const setTex = (id, txt) => {
    const el = document.getElementById(id);
    if (el && txt) el.textContent = txt;
  };

  setTex("ui-brand-title", t.brandTitle);
  setTex("ui-nav-garden", t.navGarden);
  setTex("ui-nav-cognates", t.navCognates);
  setTex("ui-nav-dictionary", t.navDictionary);
  setTex("ui-nav-quiz", t.navQuiz);
  setTex("ui-nav-bank", t.navBank);
  setTex("ui-levels-header", t.levelsHeader);
  setTex("ui-stat-petals-lbl", t.statPetalsLbl);
  setTex("ui-stat-progress-lbl", t.statProgressLbl);
  setTex("ui-lang-lbl", t.langLbl);
  setTex("ui-back-garden-lbl", t.backGarden);

  setTex("mob-lbl-garden", t.navGarden);
  setTex("mob-lbl-cognates", t.navCognates);
  setTex("mob-lbl-dictionary", t.navDictionary);
  setTex("mob-lbl-quiz", t.navQuiz);
  setTex("mob-lbl-bank", t.navBank);

  setTex("ui-daisy-canvas-title", t.daisyTitle);
  setTex("ui-daisy-canvas-hint", t.daisyHint);
  setTex("ui-inspector-empty-title", t.inspectorEmptyTitle);
  setTex("ui-inspector-empty-desc", t.inspectorEmptyDesc);

  setTex("ui-cognate-title", t.cognateTitle);
  setTex("ui-cognate-desc", t.cognateDesc);

  setTex("ui-dict-title", t.dictTitle);
  setTex("ui-dict-subtitle", t.dictSubtitle);
  if (document.getElementById("dict-search-input")) {
    document.getElementById("dict-search-input").placeholder = t.dictSearchPlaceholder;
  }

  setTex("ui-wb-title", t.wbTitle);
  setTex("ui-wb-subtitle", t.wbSubtitle);
  setTex("ui-wb-empty-text", t.wbEmptyText);

  setTex("ui-quiz-hub-title", t.quizHubTitle);
  setTex("ui-quiz-hub-desc", t.quizHubDesc);

  setTex("yusuf-text", t.yusufWelcome);
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
    document.body.style.overflow = "";
  };

  const openDrawer = () => {
    if (asideElement) asideElement.classList.add("open");
    if (drawerBackdrop) drawerBackdrop.classList.add("active");
    document.body.style.overflow = "hidden";
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

// Render Daisy Flower Canvas (Multi-Ring Staggered Engine + Grid Mode + Pagination)
appState.daisyViewMode = appState.daisyViewMode || "flower";
appState.daisyPage = 1;

function renderDaisyFlower(lesson) {
  const canvas = document.getElementById("daisy-flower-canvas");
  canvas.innerHTML = "";
  canvas.className = `daisy-flower-canvas mode-${appState.daisyViewMode}`;

  const total = lesson.vocabulary.length;
  const bloomedCount = lesson.vocabulary.filter(w => appState.bloomedWords.has(w.word)).length;

  document.getElementById("ws-bloomed-count").textContent = bloomedCount;
  document.getElementById("ws-total-count").textContent = total;

  // View Mode Switcher buttons
  const btnFlower = document.getElementById("btn-mode-flower");
  const btnGrid = document.getElementById("btn-mode-grid");

  if (btnFlower && btnGrid) {
    btnFlower.classList.toggle("active", appState.daisyViewMode === "flower");
    btnGrid.classList.toggle("active", appState.daisyViewMode === "grid");

    btnFlower.onclick = () => {
      appState.daisyViewMode = "flower";
      renderDaisyFlower(lesson);
    };
    btnGrid.onclick = () => {
      appState.daisyViewMode = "grid";
      renderDaisyFlower(lesson);
    };
  }

  // Handle Pagination for large lessons (> 18 words)
  const pageSize = 16;
  const totalPages = Math.ceil(total / pageSize);
  const paginationBar = document.getElementById("daisy-pagination-bar");

  if (totalPages > 1) {
    paginationBar.style.display = "flex";
    paginationBar.innerHTML = "";

    const prevBtn = document.createElement("button");
    prevBtn.className = "page-num-btn";
    prevBtn.textContent = "◀";
    prevBtn.disabled = appState.daisyPage === 1;
    prevBtn.onclick = () => {
      if (appState.daisyPage > 1) {
        appState.daisyPage--;
        renderDaisyFlower(lesson);
      }
    };
    paginationBar.appendChild(prevBtn);

    for (let p = 1; p <= totalPages; p++) {
      const pageBtn = document.createElement("button");
      pageBtn.className = `page-num-btn ${p === appState.daisyPage ? "active" : ""}`;
      const startNum = (p - 1) * pageSize + 1;
      const endNum = Math.min(total, p * pageSize);
      pageBtn.textContent = `${startNum}-${endNum}`;
      pageBtn.onclick = () => {
        appState.daisyPage = p;
        renderDaisyFlower(lesson);
      };
      paginationBar.appendChild(pageBtn);
    }

    const allBtn = document.createElement("button");
    allBtn.className = `page-num-btn ${appState.daisyPage === 0 ? "active" : ""}`;
    allBtn.textContent = `Tümü (${total})`;
    allBtn.onclick = () => {
      appState.daisyPage = 0;
      renderDaisyFlower(lesson);
    };
    paginationBar.appendChild(allBtn);

    const nextBtn = document.createElement("button");
    nextBtn.className = "page-num-btn";
    nextBtn.textContent = "▶";
    nextBtn.disabled = appState.daisyPage === totalPages || appState.daisyPage === 0;
    nextBtn.onclick = () => {
      if (appState.daisyPage < totalPages && appState.daisyPage !== 0) {
        appState.daisyPage++;
        renderDaisyFlower(lesson);
      }
    };
    paginationBar.appendChild(nextBtn);
  } else {
    paginationBar.style.display = "none";
    appState.daisyPage = 1;
  }

  let currentSlice = lesson.vocabulary;
  if (appState.daisyPage > 0 && totalPages > 1 && appState.daisyViewMode === "flower") {
    const startIndex = (appState.daisyPage - 1) * pageSize;
    currentSlice = lesson.vocabulary.slice(startIndex, startIndex + pageSize);
  }

  // MODE A: GRID / LIST VIEW (100% Non-overlapping clean list)
  if (appState.daisyViewMode === "grid") {
    canvas.style.minHeight = "360px";
    canvas.style.height = "auto";
    canvas.style.display = "grid";
    canvas.style.gridTemplateColumns = "repeat(auto-fill, minmax(130px, 1fr))";
    canvas.style.gap = "10px";
    canvas.style.padding = "16px";
    canvas.style.alignContent = "start";

    currentSlice.forEach((wordObj) => {
      const petal = document.createElement("div");
      petal.className = "daisy-petal-item grid-style";
      if (appState.bloomedWords.has(wordObj.word)) petal.classList.add("bloomed");
      if (wordObj.is_cognate) petal.classList.add("is-cognate");

      petal.innerHTML = `
        <span class="petal-icon">${appState.bloomedWords.has(wordObj.word) ? '🌸' : (wordObj.is_cognate ? '💡' : '🌼')}</span>
        <span class="petal-label" title="${wordObj.word}">${wordObj.word}</span>
      `;

      petal.addEventListener("click", (e) => {
        e.stopPropagation();
        document.querySelectorAll(".daisy-petal-item").forEach(p => p.classList.remove("selected"));
        petal.classList.add("selected");
        appState.selectedWord = wordObj;
        renderWordInspector(wordObj, petal);

        if (window.innerWidth <= 768) {
          const detailCard = document.getElementById("word-card-detail");
          if (detailCard) detailCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
      });

      canvas.appendChild(petal);
    });
    return;
  }

  // MODE B: RADIAL FLOWER VIEW (Concentric Multi-Ring Positioning Engine)
  canvas.style.minHeight = "";
  canvas.style.height = "";
  canvas.style.display = "block";

  const core = document.createElement("div");
  core.className = "flower-center-core";
  core.innerHTML = `
    <span class="icon">🌼</span>
    <span class="lbl">${bloomedCount}/${total} Açtı</span>
  `;
  canvas.appendChild(core);

  const isMobile = window.innerWidth <= 600;
  const sliceCount = currentSlice.length;

  let rings = [];
  if (sliceCount <= 12) {
    rings = [
      { count: sliceCount, radius: isMobile ? 125 : 155, startAngle: -Math.PI / 2 }
    ];
  } else if (sliceCount <= 20) {
    rings = [
      { count: Math.ceil(sliceCount * 0.45), radius: isMobile ? 80 : 105, startAngle: -Math.PI / 2 },
      { count: Math.floor(sliceCount * 0.55), radius: isMobile ? 135 : 175, startAngle: -Math.PI / 2 + 0.2 }
    ];
  } else if (sliceCount <= 36) {
    const r1 = Math.ceil(sliceCount * 0.25);
    const r2 = Math.ceil(sliceCount * 0.35);
    const r3 = sliceCount - r1 - r2;
    rings = [
      { count: r1, radius: isMobile ? 70 : 90, startAngle: -Math.PI / 2 },
      { count: r2, radius: isMobile ? 115 : 145, startAngle: -Math.PI / 2 + 0.15 },
      { count: r3, radius: isMobile ? 160 : 205, startAngle: -Math.PI / 2 + 0.3 }
    ];
  } else {
    const r1 = 8;
    const r2 = 14;
    const r3 = 18;
    const r4 = sliceCount - r1 - r2 - r3;
    rings = [
      { count: r1, radius: isMobile ? 65 : 85, startAngle: -Math.PI / 2 },
      { count: r2, radius: isMobile ? 105 : 135, startAngle: -Math.PI / 2 + 0.1 },
      { count: r3, radius: isMobile ? 145 : 185, startAngle: -Math.PI / 2 + 0.2 },
      { count: r4, radius: isMobile ? 185 : 235, startAngle: -Math.PI / 2 + 0.3 }
    ];
  }

  if (sliceCount > 24) {
    canvas.style.width = isMobile ? "340px" : "500px";
    canvas.style.height = isMobile ? "340px" : "500px";
  } else {
    canvas.style.width = "";
    canvas.style.height = "";
  }

  let itemIdx = 0;
  rings.forEach(ring => {
    const count = ring.count;
    const radius = ring.radius;
    const startAngle = ring.startAngle;

    for (let i = 0; i < count; i++) {
      if (itemIdx >= sliceCount) break;
      const wordObj = currentSlice[itemIdx];
      itemIdx++;

      const angle = startAngle + (i / count) * (2 * Math.PI);
      const x = Math.round(Math.cos(angle) * radius);
      const y = Math.round(Math.sin(angle) * radius);

      const petal = document.createElement("div");
      petal.className = "daisy-petal-item";
      if (appState.bloomedWords.has(wordObj.word)) petal.classList.add("bloomed");
      if (wordObj.is_cognate) petal.classList.add("is-cognate");

      if (sliceCount > 20) {
        petal.classList.add("compact-petal");
      }

      petal.style.left = `calc(50% + ${x}px)`;
      petal.style.top = `calc(50% + ${y}px)`;
      petal.textContent = wordObj.word;
      petal.title = wordObj.word;

      petal.addEventListener("click", (e) => {
        e.stopPropagation();
        document.querySelectorAll(".daisy-petal-item").forEach(p => p.classList.remove("selected"));
        petal.classList.add("selected");
        appState.selectedWord = wordObj;
        renderWordInspector(wordObj, petal);

        if (window.innerWidth <= 768) {
          const detailCard = document.getElementById("word-card-detail");
          if (detailCard) detailCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
      });

      canvas.appendChild(petal);
    }
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

// ═══════════════════════════════════════════════════════════════
// Interactive Quiz & Test Suite (Multi-Type Questions, Audio TTS, Zihin Sarayı Box)
// ═══════════════════════════════════════════════════════════════

function getEnglishMeaning(w) {
  if (!w) return "";
  return w.meaning_en || w.en || w.meaning_tr || "";
}

function getArabicMeaning(w) {
  if (!w) return "";
  return w.arabic_word || w.arabic_meaning || w.ar || "";
}

function updateQuizStatsDisplay() {
  const completedCount = parseInt(localStorage.getItem("suzitta_quiz_completed_count") || "0", 10);
  const avgAcc = parseInt(localStorage.getItem("suzitta_quiz_avg_accuracy") || "0", 10);
  const points = appState.yusufPoints || 0;

  const elCompleted = document.getElementById("qs-total-completed");
  const elAcc = document.getElementById("qs-avg-accuracy");
  const elPoints = document.getElementById("qs-total-points");

  if (elCompleted) elCompleted.textContent = completedCount.toString();
  if (elAcc) elAcc.textContent = `%${avgAcc}`;
  if (elPoints) elPoints.textContent = points.toString();
}

function getVocabularyBank() {
  if (learningDatabase && Array.isArray(learningDatabase.vocabularyBank) && learningDatabase.vocabularyBank.length > 0) {
    return learningDatabase.vocabularyBank;
  }
  if (learningDatabase && Array.isArray(learningDatabase.levels)) {
    return learningDatabase.levels.flatMap(lvl => (lvl.lessons || []).flatMap(les => les.vocabulary || []));
  }
  return [];
}

function initQuizHubGlobalListeners() {
  const attach = (id, fn) => {
    const btn = document.getElementById(id);
    if (!btn) return;

    const handler = (e) => {
      if (e) {
        e.preventDefault();
        e.stopPropagation();
      }
      fn();
    };

    btn.onclick = handler;

    const card = btn.closest(".quiz-cat-card");
    if (card) {
      card.style.cursor = "pointer";
      card.onclick = handler;
    }
  };

  const getActiveLesson = () => {
    const currentLvlObj = learningDatabase.levels.find(l => l.id === appState.currentLevelId) || learningDatabase.levels[0];
    return appState.activeLesson || currentLvlObj.lessons[0];
  };

  const getCurrentLevelObj = () => {
    return learningDatabase.levels.find(l => l.id === appState.currentLevelId) || learningDatabase.levels[0];
  };

  attach("btn-start-current-lesson-quiz", () => {
    const lesson = getActiveLesson();
    startInteractiveQuizEngine(`Ders Sınavı: ${lesson.title}`, lesson.vocabulary, 8);
  });

  attach("btn-start-cognates-quiz", () => {
    const cognates = getVocabularyBank().filter(w => w.is_cognate || w.cognate_info);
    startInteractiveQuizEngine("💡 Arapça Ortak Kelimeler Testi", cognates.length > 0 ? cognates : getVocabularyBank().slice(0, 15), 10);
  });

  attach("btn-start-level-exam", () => {
    const lvl = getCurrentLevelObj();
    const allWordsInLevel = lvl ? lvl.lessons.flatMap(l => l.vocabulary) : getVocabularyBank().slice(0, 30);
    startInteractiveQuizEngine(`🏆 Seviye Bitirme Sınavı (${lvl ? lvl.cefrCode : 'A1'})`, allWordsInLevel, 10);
  });

  attach("btn-start-sentence-quiz", () => {
    const sentenceWords = getVocabularyBank().filter(w => w.sentence_tr);
    startInteractiveQuizEngine("💬 Cümle & Bağlam Sınavı", sentenceWords.length > 0 ? sentenceWords : getVocabularyBank().slice(0, 15), 10);
  });

  attach("btn-start-speed-quiz", () => {
    startInteractiveQuizEngine("⚡ Karma Hızlı Pekiştirme Sınavı", getVocabularyBank(), 10);
  });
}

function renderQuizHubView() {
  const currentLvlObj = learningDatabase.levels.find(l => l.id === appState.currentLevelId) || learningDatabase.levels[0];
  const activeLesson = appState.activeLesson || currentLvlObj.lessons[0];

  updateQuizStatsDisplay();

  // Dynamic Badges & Descriptions
  const badgeLesson = document.getElementById("quiz-badge-lesson");
  const descLesson = document.getElementById("quiz-desc-lesson");
  if (badgeLesson && activeLesson) badgeLesson.textContent = activeLesson.title || "Aktif Ders";
  if (descLesson && activeLesson) descLesson.textContent = `"${activeLesson.title}" dersindeki ${activeLesson.vocabulary.length} kelime ve cümle ile pratik yapın.`;

  const badgeLevel = document.getElementById("quiz-badge-level");
  const descLevel = document.getElementById("quiz-desc-level");
  if (badgeLevel && currentLvlObj) badgeLevel.textContent = `${currentLvlObj.cefrCode} Seviye Sınavı`;
  if (descLevel && currentLvlObj) descLevel.textContent = `${currentLvlObj.cefrCode} seviyesindeki 10 derse ait tüm konulardan oluşan seviye bitirme sınavı.`;

  initQuizHubGlobalListeners();
}

function launchLessonQuiz(lesson) {
  if (!lesson) {
    const currentLvlObj = learningDatabase.levels.find(l => l.id === appState.currentLevelId) || learningDatabase.levels[0];
    lesson = appState.activeLesson || currentLvlObj.lessons[0];
  }
  startInteractiveQuizEngine(`Ders Testi: ${lesson.title}`, lesson.vocabulary, 8);
}

function startInteractiveQuizEngine(quizTitle, vocabList, questionCount = 8) {
  if (!vocabList || vocabList.length === 0) {
    vocabList = learningDatabase.vocabularyBank;
  }

  const shuffled = [...vocabList].sort(() => Math.random() - 0.5);
  const selectedWords = shuffled.slice(0, Math.min(questionCount, shuffled.length));

  const questions = selectedWords.map(wordObj => {
    let possibleTypes = ['translate', 'reverse_translate', 'sentence', 'audio'];
    if (wordObj.is_cognate) possibleTypes.push('cognate');

    const qType = possibleTypes[Math.floor(Math.random() * possibleTypes.length)];

    // SMART TOPIC-MATCHED DISTRACTOR GENERATOR
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
        val = appState.currentLang === 'ar' ? getArabicMeaning(item) : getEnglishMeaning(item);
      } else {
        val = item.word;
      }

      const correctOptionVal = (qType === 'translate') ?
        (appState.currentLang === 'ar' ? getArabicMeaning(wordObj) : getEnglishMeaning(wordObj)) :
        wordObj.word;

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
      correctVal = appState.currentLang === 'ar' ? getArabicMeaning(wordObj) : getEnglishMeaning(wordObj);
    } else if (qType === 'reverse_translate') {
      typeBadge = "🔄 Türkçe Kelime Bulma";
      const sourceMeaning = appState.currentLang === 'ar' ? getArabicMeaning(wordObj) : getEnglishMeaning(wordObj);
      prompt = `"${sourceMeaning}" karşılığı olan Türkçe kelime hangisidir?`;
      correctVal = wordObj.word;
    } else if (qType === 'sentence') {
      typeBadge = "💬 Cümle Tamamlama";
      const sentenceClean = wordObj.sentence_tr ? wordObj.sentence_tr.replace(new RegExp(escapeRegex(wordObj.word), 'gi'), '_____') : `... ${getEnglishMeaning(wordObj)}`;
      prompt = `Cümlede boş bırakılan yere hangi kelime gelmelidir?\n"${sentenceClean}"`;
      correctVal = wordObj.word;
    } else if (qType === 'audio') {
      typeBadge = "🔊 Sesli Telaffuz Testi";
      prompt = `Dinlediğiniz Türkçe kelime hangisidir? (Ses duyulmadıysa butona basın)`;
      correctVal = wordObj.word;
    } else if (qType === 'cognate') {
      typeBadge = "💡 Arapça Ortak Kök Testi";
      const rootNote = wordObj.cognate_info ? (wordObj.cognate_info.note_ar || getArabicMeaning(wordObj)) : getArabicMeaning(wordObj);
      prompt = `"${rootNote}" (Arapça) kelimesi ile aynı kökten gelen Türkçe kelime hangisidir?`;
      correctVal = wordObj.word;
    }

    if (!correctVal) correctVal = wordObj.word;

    const options = [correctVal, ...distractors].filter(Boolean).sort(() => Math.random() - 0.5);

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

      // Update quiz stats in localStorage
      const prevCompleted = parseInt(localStorage.getItem("suzitta_quiz_completed_count") || "0", 10);
      const prevAvg = parseInt(localStorage.getItem("suzitta_quiz_avg_accuracy") || "0", 10);
      const newCompleted = prevCompleted + 1;
      const newAvg = Math.round(((prevAvg * prevCompleted) + percent) / newCompleted);

      localStorage.setItem("suzitta_quiz_completed_count", newCompleted.toString());
      localStorage.setItem("suzitta_quiz_avg_accuracy", newAvg.toString());

      updateGlobalStats();
      updateQuizStatsDisplay();

      let praiseMsg = "Harika bir çalışma Suzim!";
      if (percent === 100) praiseMsg = "Tebrikler Suzim! %100 Mükemmel Başarı! Yusuf seninle gurur duyuyor! 🌟";
      else if (percent >= 70) praiseMsg = "Tebrikler Suzim! Harika bir performans gösterdin! 🌸";

      speakText(praiseMsg);

      cardBody.innerHTML = `
        <div class="welcome-flower-icon">🏆</div>
        <h2>Sınav Tamamlandı! 🎉</h2>
        <div style="font-size: 36px; font-weight: 800; color: var(--color-primary); margin: 10px 0;">%${percent} Başarı</div>
        <p style="font-size: 15px; color: var(--color-text-muted);">${score} / ${questions.length} Soru Doğru Cevaplandı</p>

        <div class="welcome-intro-box" style="background: var(--color-accent-light); border-color: var(--color-accent); margin: 16px 0;">
          <strong style="font-size: 18px; color: var(--color-primary-dark);">+${pointsEarned} Yusuf Puanı Kazandın! 🏅</strong>
        </div>

        <div style="display: flex; gap: 12px; justify-content: center; width: 100%; margin-top: 10px; flex-wrap: wrap;">
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
      setTimeout(() => speakText(q.wordObj.word), 350);
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
        <div style="text-align: center;">
          <button class="quiz-listen-btn" id="btn-quiz-tts-listen">
            <span>🔊</span> <span>Telaffuzu Dinle</span>
          </button>
        </div>
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

      <button class="welcome-start-btn" id="btn-quiz-next" style="display: none; margin-top: 12px; width: 100%;">Devam Et ➡️</button>
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
          }, 1000);
        } else {
          btn.classList.add("incorrect");
          speakText("Yanlış cevap!");

          optBtns.forEach(b => {
            if (b.getAttribute("data-val") === q.correctVal) {
              b.classList.add("correct");
            }
          });

          const memBox = document.getElementById("quiz-memory-box");
          const enMeaning = getEnglishMeaning(q.wordObj);
          const arMeaning = getArabicMeaning(q.wordObj);

          memBox.style.display = "block";
          memBox.innerHTML = `
            <div style="font-size: 13px; font-weight: 700; color: #D32F2F; margin-bottom: 4px;">❌ Yanlış Cevap - Doğruyu Öğrenelim:</div>
            <div style="font-size: 15px; font-weight: 700; color: var(--color-primary);">✅ Doğru Cevap: ${escapeHtml(q.wordObj.word)} ${enMeaning ? `(${escapeHtml(enMeaning)})` : ''} ${arMeaning ? `(${escapeHtml(arMeaning)})` : ''}</div>
            ${q.wordObj.mind_palace_tr ? `<div style="font-size: 12.5px; color: var(--color-text-main); margin-top: 6px;">🧠 <strong>Zihin Sarayı İpucu:</strong> ${escapeHtml(q.wordObj.mind_palace_tr)}</div>` : ''}
            ${q.wordObj.sentence_tr ? `<div style="font-size: 12.5px; color: var(--color-text-muted); margin-top: 4px;">💬 <strong>Örnek Cümle:</strong> ${escapeHtml(q.wordObj.sentence_tr)}</div>` : ''}
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

appState.cognateFilter = appState.cognateFilter || "all";

function renderCognatesView() {
  const container = document.getElementById("cognates-grid-container");
  if (!container) return;
  container.innerHTML = "";

  // Set filter button state
  const filterBtns = document.querySelectorAll(".cognate-filter-btn");
  filterBtns.forEach(btn => {
    btn.classList.toggle("active", btn.dataset.filter === appState.cognateFilter);
    btn.onclick = () => {
      appState.cognateFilter = btn.dataset.filter;
      renderCognatesView();
    };
  });

  // Strict Cognates Filter Engine: Authentically matching Arabic roots & English loanwords
  const allBank = getVocabularyBank();
  let cognates = [];

  const isArabicCognateWord = (w) => {
    if (!w || !w.word) return false;
    if (w.is_cognate === true) return true;
    if (w.cognate_info && (w.cognate_info.ar_root || w.cognate_info.note_ar || w.cognate_info.note_tr)) return true;
    return false;
  };

  const isEnglishLoanword = (w) => {
    if (!w || !w.word) return false;
    const cleanWord = w.word.trim().toLowerCase();
    return englishLoanwordList.includes(cleanWord);
  };

  if (appState.cognateFilter === "ar") {
    cognates = allBank.filter(w => isArabicCognateWord(w) && !isEnglishLoanword(w));
  } else if (appState.cognateFilter === "en") {
    cognates = allBank.filter(w => isEnglishLoanword(w));
  } else {
    // "all": Arabic cognates + English loanwords
    cognates = allBank.filter(w => isArabicCognateWord(w) || isEnglishLoanword(w));
  }

  // Robust Fallback if filter returns empty
  if (cognates.length === 0) {
    cognates = allBank.filter(w => w.is_cognate === true || w.ar || w.arabic_word);
  }

  if (cognates.length === 0) {
    container.innerHTML = `<div class="dict-no-results"><span>💡</span> <span>Seçilen filtrede ortak kelime bulunamadı.</span></div>`;
    return;
  }

  cognates.forEach(c => {
    const card = document.createElement("div");
    card.className = "cognate-card liquid-glass-card";
    const enMeaning = getEnglishMeaning(c);
    const arMeaning = getArabicMeaning(c);
    const isEnglish = englishLoanwordList.includes((c.word || "").toLowerCase());

    card.innerHTML = `
      <div class="cognate-card-top" style="display: flex; justify-content: space-between; align-items: flex-start; width: 100%;">
        <div>
          <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
            <h4 style="font-size: 18px; font-weight: 800; color: var(--color-primary-dark); margin: 0;">${c.word}</h4>
            <span style="font-size: 11px; background: ${isEnglish ? 'rgba(33,150,243,0.12)' : 'rgba(242,187,5,0.18)'}; color: ${isEnglish ? '#1565C0' : '#B37D00'}; padding: 2px 8px; border-radius: 10px; font-weight: 700;">
              ${isEnglish ? '🌐 İngilizce Okunuşu Aynı' : '🇸🇦 Arapça Okunuşu Aynı'}
            </span>
          </div>
          <span style="font-size: 12px; color: var(--color-text-sub);">${c.pronunciation || ''}</span>
        </div>
        <button class="fc-audio-btn cog-audio-btn" title="Telaffuzu Dinle">🔊</button>
      </div>
      <div class="cognate-meanings" style="margin: 10px 0; display: flex; flex-direction: column; gap: 4px;">
        ${enMeaning ? `<p style="font-size: 13.5px; font-weight: 600; color: var(--color-text-main); margin: 0;">🇬🇧 <strong>EN:</strong> ${enMeaning}</p>` : ''}
        ${arMeaning ? `<p style="font-size: 15px; font-family: 'Amiri', serif; color: var(--color-accent-dark); margin: 0;" dir="rtl">🇸🇦 <strong>AR:</strong> ${arMeaning}</p>` : ''}
      </div>
      ${c.sentence_tr ? `
        <div style="font-size: 12.5px; color: var(--color-primary-dark); background: rgba(45,90,39,0.06); padding: 8px 10px; border-radius: 8px; border-left: 3px solid var(--color-primary); line-height: 1.35;">
          💬 "${c.sentence_tr}"
        </div>
      ` : ''}
    `;

    const audioBtn = card.querySelector(".cog-audio-btn");
    if (audioBtn) {
      audioBtn.onclick = (e) => {
        e.stopPropagation();
        speakText(c.word);
      };
    }

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

// ==========================================================================
// WORD BANK & 3D FLASHCARD ENGINE
// ==========================================================================

appState.wbMode = appState.wbMode || "cards";
appState.flashcardIndex = appState.flashcardIndex || 0;
appState.flashcardFlipped = false;

function renderWordBankView() {
  // 1. View Mode Button Listeners
  const modeBtns = document.querySelectorAll(".wb-mode-btn");
  modeBtns.forEach(btn => {
    btn.classList.toggle("active", btn.dataset.mode === appState.wbMode);
    btn.onclick = () => {
      appState.wbMode = btn.dataset.mode;
      renderWordBankView();
    };
  });

  const sectionCards = document.getElementById("wb-container-cards");
  const sectionSentences = document.getElementById("wb-container-sentences");
  const sectionTags = document.getElementById("wb-container-tags");
  const emptyMsg = document.getElementById("wb-empty-msg");

  if (sectionCards) sectionCards.style.display = appState.wbMode === "cards" ? "block" : "none";
  if (sectionSentences) sectionSentences.style.display = appState.wbMode === "sentences" ? "block" : "none";
  if (sectionTags) sectionTags.style.display = appState.wbMode === "tags" ? "block" : "none";

  // 2. Gather dataset for Word Bank
  let learnedItems = [];
  if (appState.bloomedWords && appState.bloomedWords.size > 0) {
    const bloomedSet = appState.bloomedWords;
    if (learningDatabase && learningDatabase.vocabularyBank) {
      learnedItems = learningDatabase.vocabularyBank.filter(w => bloomedSet.has(w.word));
    }
  }

  // Fallback: If no words bloomed yet, show active lesson items or top 10 vocab items so user can experience flashcards!
  if (learnedItems.length === 0) {
    if (appState.activeLesson && appState.activeLesson.vocabulary) {
      learnedItems = appState.activeLesson.vocabulary;
    } else if (learningDatabase && learningDatabase.vocabularyBank) {
      learnedItems = learningDatabase.vocabularyBank.slice(0, 10);
    }
  }

  if (emptyMsg) {
    emptyMsg.style.display = (appState.bloomedWords.size === 0 && learnedItems.length === 0) ? "block" : "none";
  }

  if (appState.wbMode === "cards") {
    renderFlashcardSection(learnedItems);
  } else if (appState.wbMode === "sentences") {
    renderSentencesSection(learnedItems);
  } else if (appState.wbMode === "tags") {
    renderTagsSection();
  }
}

function renderFlashcardSection(items) {
  if (!items || items.length === 0) return;

  if (appState.flashcardIndex >= items.length) {
    appState.flashcardIndex = 0;
  }

  const activeCard = document.getElementById("active-flashcard");
  const currentItem = items[appState.flashcardIndex];

  // Element references
  const badgeLevel = document.getElementById("fc-badge-level");
  const badgeCognate = document.getElementById("fc-badge-cognate");
  const wordTr = document.getElementById("fc-word-tr");
  const wordAr = document.getElementById("fc-word-ar");
  const sentenceTr = document.getElementById("fc-sentence-tr");

  const meaningEn = document.getElementById("fc-meaning-en");
  const meaningAr = document.getElementById("fc-meaning-ar");
  const sentenceAr = document.getElementById("fc-sentence-ar");
  const sentenceEn = document.getElementById("fc-sentence-en");

  const counter = document.getElementById("fc-counter");
  const btnPrev = document.getElementById("btn-fc-prev");
  const btnNext = document.getElementById("btn-fc-next");
  const btnFlip = document.getElementById("btn-fc-flip");
  const btnAudioFront = document.getElementById("btn-fc-audio");
  const btnAudioBack = document.getElementById("btn-fc-audio-back");

  // Populate card front
  if (badgeLevel) badgeLevel.textContent = currentItem.level ? `Level A${currentItem.level}` : (currentItem.cefr_level || "A1");
  if (badgeCognate) badgeCognate.style.display = currentItem.is_cognate ? "inline-block" : "none";
  if (wordTr) wordTr.textContent = currentItem.word || "";
  if (wordAr) wordAr.textContent = getArabicMeaning(currentItem);
  if (sentenceTr) sentenceTr.textContent = currentItem.sentence_tr || `${currentItem.word} kelimesi ile pratik yapın.`;

  // Populate card back
  const enMeaningStr = getEnglishMeaning(currentItem);
  const arMeaningStr = getArabicMeaning(currentItem);

  if (meaningEn) meaningEn.textContent = enMeaningStr || "Translation";
  if (meaningAr) meaningAr.textContent = arMeaningStr || "";
  if (sentenceAr) sentenceAr.textContent = currentItem.sentence_ar || "ـ";
  if (sentenceEn) sentenceEn.textContent = currentItem.sentence_en || "";

  // Counter & Nav state
  if (counter) counter.textContent = `Kart ${appState.flashcardIndex + 1} / ${items.length}`;
  if (btnPrev) btnPrev.disabled = appState.flashcardIndex === 0;
  if (btnNext) btnNext.disabled = appState.flashcardIndex === items.length - 1;

  // Reset card rotation
  appState.flashcardFlipped = false;
  if (activeCard) activeCard.classList.remove("flipped");

  // Card Flip Handlers
  const toggleFlip = () => {
    appState.flashcardFlipped = !appState.flashcardFlipped;
    if (activeCard) activeCard.classList.toggle("flipped", appState.flashcardFlipped);
  };

  if (activeCard) activeCard.onclick = toggleFlip;
  if (btnFlip) btnFlip.onclick = (e) => {
    e.stopPropagation();
    toggleFlip();
  };

  // Nav Handlers
  if (btnPrev) {
    btnPrev.onclick = (e) => {
      e.stopPropagation();
      if (appState.flashcardIndex > 0) {
        appState.flashcardIndex--;
        renderFlashcardSection(items);
      }
    };
  }

  if (btnNext) {
    btnNext.onclick = (e) => {
      e.stopPropagation();
      if (appState.flashcardIndex < items.length - 1) {
        appState.flashcardIndex++;
        renderFlashcardSection(items);
      }
    };
  }

  // Audio Handlers
  if (btnAudioFront) {
    btnAudioFront.onclick = (e) => {
      e.stopPropagation();
      speakText(`${currentItem.word}. ${currentItem.sentence_tr || ''}`);
    };
  }

  if (btnAudioBack) {
    btnAudioBack.onclick = (e) => {
      e.stopPropagation();
      speakText(currentItem.sentence_tr || currentItem.word);
    };
  }
}

function renderSentencesSection(items) {
  const container = document.getElementById("wb-sentences-list-body");
  if (!container) return;
  container.innerHTML = "";

  if (!items || items.length === 0) {
    container.innerHTML = `<div class="dict-no-results"><span>🌱</span> <span>Henüz cümle bulunmuyor.</span></div>`;
    return;
  }

  items.forEach(item => {
    const card = document.createElement("div");
    card.className = "wb-sentence-card";
    card.innerHTML = `
      <div class="wb-sc-header">
        <span class="wb-sc-word">🌸 ${item.word} ${item.is_cognate ? '💡' : ''}</span>
        <button class="fc-audio-btn wb-sc-audio" title="Cümleyi Dinle">🔊</button>
      </div>
      <div class="wb-sc-tr">${item.sentence_tr || `${item.word} kelimesini içeren örnek cümle.`}</div>
      ${item.sentence_ar ? `<div class="wb-sc-ar">${item.sentence_ar}</div>` : ''}
      ${item.sentence_en ? `<div class="wb-sc-en">${item.sentence_en}</div>` : ''}
      ${item.mind_palace_tr ? `<div class="wb-sc-mp">💡 <b>Zihin Sarayı:</b> ${item.mind_palace_tr}</div>` : ''}
    `;

    const audioBtn = card.querySelector(".wb-sc-audio");
    if (audioBtn) {
      audioBtn.onclick = () => speakText(item.sentence_tr || item.word);
    }

    container.appendChild(card);
  });
}

function renderTagsSection() {
  const container = document.getElementById("wb-learned-tags-cloud");
  const emptyMsg = document.getElementById("wb-empty-msg");
  if (!container) return;
  container.innerHTML = "";

  const bloomedList = Array.from(appState.bloomedWords || []);

  if (bloomedList.length === 0) {
    if (emptyMsg) emptyMsg.style.display = "block";
    return;
  }

  if (emptyMsg) emptyMsg.style.display = "none";

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
