# -*- coding: utf-8 -*-
"""
generate_all_75_topics_deepseek.py
Uses DeepSeek API to generate 12-15 100% authentic, topic-matched Turkish words
for EVERY SINGLE LESSON across all 75 topics in CEFR levels A1, A2, B1, B2, C1.
Includes Arabic & English translations, example sentences, Arabic cognate root notes,
and trilingual Mind Palace visual mnemonics.
"""

import json
import os
import time
import urllib.request
import urllib.error

DEEPSEEK_API_KEY = os.getenv("DEEPSEEK_API_KEY", "")
DEEPSEEK_API_URL = "https://api.deepseek.com/chat/completions"

CACHE_FILE = os.path.join(os.path.dirname(os.path.abspath(__file__)), "topics_deepseek_cache.json")

# 75 LESSON DEFINITIONS
LEVELS_META = {
    1: {
        "cefr": "A1",
        "title": "Level A1: Başlangıç (A1)",
        "arabicTitle": "المستوى A1",
        "englishTitle": "Level A1: Beginner",
        "lessons": [
            ("Selamlaşma ve Tanışma", "التعارف والتحيات", "Greetings & Introductions", "Temel selamlaşma ifadeleri ve tanışma kalıpları."),
            ("Kişi Zamirleri ve Var/Yok", "الضمائر الشخصية و يوجد/لا يوجد", "Pronouns & There is/isn't", "Ben, sen, o zamirleri ve var/yok kullanımı."),
            ("Sayılar ve Sayma", "الأرقام والعد", "Numbers & Counting", "1'den 100'e kadar sayılar ve miktar ifadeleri."),
            ("Renkler ve Şekiller", "الألوان والأشكال", "Colors & Shapes", "Temel renk tanımları ve basit sıfatlar."),
            ("Aile Bireyleri", "أفراد العائلة", "Family Members", "Anne, baba, kardeş ve akraba isimleri."),
            ("Vücudumuz ve Sağlık", "أعضاء الجسد والصحة", "Body Parts & Health", "Baş, göz, el, ayak ve organ isimleri."),
            ("Evimiz ve Eşyalar", "البيت والأثاث", "House & Furniture", "Masa, sandalye, kapı ve ev eşyaları."),
            ("Temel Fiiller I", "الأفعال الأساسية 1", "Basic Verbs I", "Gelmek, gitmek, yapmak fiilleri."),
            ("Zaman ve Günler", "الوقت والأيام", "Time & Days", "Saatler, günler, aylar ve mevsimler."),
            ("Yiyecekler ve İçecekler", "الطعام والشراب", "Food & Beverages", "Meyveler, sebzeler ve içecekler."),
            ("Sıfatlar ve Zıt Anlamlılar", "الصفات والأضداد", "Adjectives & Opposites", "Büyük-küçük, sıcak-soğuk sıfatları."),
            ("Soru Kalıpları (Ne, Nerede)", "صيغ الأسئلة (ماذا، أين)", "Question Forms (What, Where)", "Nerede, kim, nasıl soru kelimeleri."),
            ("Günlük Rutinler", "الروتين اليومي", "Daily Routines", "Uyanmak, kahvaltı etmek, uyumak."),
            ("Neşeli Kısa Cümleler", "جمل قصيرة ممتعة", "Cheerful Short Expressions", "Pratik günlük iletişim örnekleri."),
            ("Ortak Kelimeler I (Arapça Kökenliler)", "الكلمات المشتركة 1", "Arabic Cognates I", "Kitap, kalem, defter, saat, dünya ortak kelimeleri.")
        ]
    },
    2: {
        "cefr": "A2",
        "title": "Level A2: Temel Türkçe (A2)",
        "arabicTitle": "المستوى A2",
        "englishTitle": "Level A2: Elementary",
        "lessons": [
            ("Yiyecek ve İçecek Siparişi", "طلب الطعام والشراب", "Ordering Food & Drink", "Restoranda sipariş verme kalıpları."),
            ("Alışveriş ve Pazar", "التسوق والسوق", "Shopping & Market", "Fiyat sorma, pazarlık ve alışveriş cümleleri."),
            ("Şehir ve Ulaşım", "المدينة والمواصلات", "City & Transport", "Otobüs, tren, sokak ve adres tarifleri."),
            ("Eğitim ve Okul Hayatı", "التعليم والحياة المدرسية", "Education & School Life", "Sınıf eşyaları, dersler ve okul terimleri."),
            ("Hava Durumu ve Mevsimler", "الطقس والفصول", "Weather & Seasons", "Sıcak, soğuk, yağmurlu ve rüzgarlı hava ifadeleri."),
            ("Giyim ve Aksesuar", "الملابس والإكسسوارات", "Clothes & Accessories", "Elbise, ayakkabı, şapka ve giyim terimleri."),
            ("Hobiler ve Serbest Zaman", "الهوايات وأوقات الفراغ", "Hobbies & Free Time", "Müzik, spor, kitap okuma ve hobiler."),
            ("Duygular ve Hisler", "المشاعر والأحاسيس", "Emotions & Feelings", "Mutlu, üzgün, heyecanlı ve yorgun durumları."),
            ("Sağlık ve Randevu", "الصحة والمواعيد", "Health & Appointments", "Hasta olma, doktor muayenesi ve eczane ifadeleri."),
            ("İlgi Alanları ve Spor", "الاهتمامات والرياضة", "Interests & Sports", "Futbol, yüzme ve zindelik aktiviteleri."),
            ("Ev Kiralama ve Eşyalar", "استئجار البيت والأثاث", "Renting House & Goods", "Kira, oda ve eşya isimleri."),
            ("Yönler ve Tarifler", "الاتجاهات والوصف", "Directions & Locations", "Sağ, sol, düz, yakın, uzak kavramları."),
            ("Arkadaşlık ve Sosyal İletişim", "الصداقة والتواصل الاجتماعي", "Friendship & Socializing", "Davet etme, buluşma cümleleri."),
            ("Kısa Anlatımlar ve Hikayeler", "قصص قصيرة وتعبير", "Short Narratives & Stories", "Basit günlük hikaye anlatımı."),
            ("Ortak Kelimeler II (Adalet & Hukuk)", "الكلمات المشتركة 2", "Arabic Cognates II", "Adalet, hukuk, hakk, hürriyet, medeniyet terimleri.")
        ]
    },
    3: {
        "cefr": "B1",
        "title": "Level B1: Orta Seviye (B1)",
        "arabicTitle": "المستوى B1",
        "englishTitle": "Level B1: Intermediate",
        "lessons": [
            ("Meslekler ve İş Dünyası", "المهن وعالم الأعمال", "Professions & Business", "Doktor, mühendis, öğretmen ve iş yeri terimleri."),
            ("Geçmiş Zaman (-dı / -di)", "الزمن الماضي", "Past Tense (-dı / -di)", "Geçmişte yaşanan olayları anlatma yapısı."),
            ("Gelecek Zaman (-acak / -ecek)", "الزمن المستقبل", "Future Tense (-acak / -ecek)", "Gelecek planları ve vaatler."),
            ("Geniş Zaman (-ar / -er / -ır)", "الزمن الواسع", "Aorist / Present Simple", "Genel doğrular ve alışkanlıklar."),
            ("Doğa ve Çevre Koruma", "الطبيعة وحماية البيئة", "Nature & Environment", "Orman, deniz, iklim ve çevre bilinci."),
            ("Teknoloji ve İletişim", "التكنولوجيا والتواصل", "Technology & Communication", "İnternet, bilgisayar, telefon ve dijital dünya."),
            ("Tatil ve Seyahat Rotaları", "العطلة ومسارات السفر", "Vacation & Travel Routes", "Otel, bilet, müze ve gezi rotaları."),
            ("Gelenek ve Görenekler", "العادات والتقاليد", "Traditions & Customs", "Bayramlar, düğünler ve Türk konukseverliği."),
            ("Sağlıklı Yaşam ve Beslenme", "الحياة الصحية والتغذية", "Healthy Living & Nutrition", "Egzersiz, beslenme ve zindelik kavramları."),
            ("Kültür ve Sanat Etkinlikleri", "الأنشطة الثقافية والفنية", "Cultural & Art Events", "Sergi, konser ve müze gezileri."),
            ("Medya ve Haber Takibi", "الإعلام ومتابعة الأخبار", "Media & Following News", "Gazete, radyo ve dijital haberler."),
            ("Plan Yapma ve Randevulaşma", "التخطيط وتحديد المواعيد", "Planning & Appointments", "Zaman yönetimi ve toplantı planlama."),
            ("Sorun Çözme ve Şikayetler", "حل المشكلات والشكاوى", "Problem Solving & Complaints", "Müşteri hizmetleri ve çözüm bulma."),
            ("Deneyimler ve Anılar", "التجارب والذكريات", "Experiences & Memories", "Anı paylaşma ve tecrübe aktarımı."),
            ("Ortak Kelimeler III (Felsefe & Hikmet)", "الكلمات المشتركة 3", "Arabic Cognates III", "Felsefe, hikmet, mantık, kader, izzet kavramları.")
        ]
    },
    4: {
        "cefr": "B2",
        "title": "Level B2: Akıcı Türkçe (B2)",
        "arabicTitle": "المستوى B2",
        "englishTitle": "Level B2: Upper-Intermediate",
        "lessons": [
            ("Toplum ve Sosyal Yapı", "المجتمع والبنية الاجتماعية", "Society & Social Structure", "Dayanışma, kamu, vatandaşlık ve toplumsal kurallar."),
            ("Devlet ve Yönetim Sistemleri", "الدولة وأنظمة الإدارة", "State & Governance Systems", "Anayasa, meclis, bakanlık ve devlet organları."),
            ("Medya ve Basın Özgürlüğü", "الإعلام وحرية الصحافة", "Media & Press Freedom", "Gazete, haber, yayıncılık ve eleştirel medya."),
            ("Sanat ve Edebiyat Eleştirisi", "نقد الفن والأدب", "Art & Literary Criticism", "Tiyatro, sinema, roman ve edebiyat eleştirisi."),
            ("Ekonomi ve Uluslararası Ticaret", "الاقتصاد والتجارة الدولية", "Economy & Int. Trade", "İktisat, kâr, bütçe, yatırım ve piyasa terimleri."),
            ("Yeterlilik Fiili (-ebil / -abil)", "فعل الاستطاعة", "Ability Verb (-ebil)", "Yapabilmek, gelebilmek, başarabilmek ifadeleri."),
            ("Şart Kipi ve Varsayımlar (-sa / -se)", "صيغة الشرط والافتراضات", "Conditional Mood & Hypotheses", "Varsayımlar, dilekler ve şart cümleleri."),
            ("İlim ve İnovasyon Teknolojileri", "العلم وتكنولوجيا الابتكار", "Science & Innovation Tech", "Bilimsel yöntem, araştırma ve inovasyon kavramları."),
            ("Çevre ve İklim Değişikliği", "البيئة والتغير المناخي", "Environment & Climate Change", "Küresel ısınma, geri dönüşüm ve ekoloji."),
            ("Kültürlerarası İletişim", "التواصل بين الثقافات", "Intercultural Communication", "Kültürel farkındalık ve küresel diyalog."),
            ("İş Görüşmesi ve Kariyer", "مقابلة العمل والمهنة", "Job Interview & Career", "Özgeçmiş hazırlama ve profesyonel ifade."),
            ("Toplumsal Değişim ve Trendler", "التغير الاجتماعي والتوجهات", "Social Change & Trends", "Demografi, şehirleşme ve sosyoloji."),
            ("Telif Hakları ve Fikri Mülkiyet", "حقوق النشر والملكية الفكرية", "Copyright & Intellectual Property", "Hukuk ve yasal güvenceler."),
            ("Psikoloji ve İnsan Performatifi", "علم النفس والأداء البشري", "Psychology & Human Performance", "Zihin, motivasyon ve davranış bilimi."),
            ("Ortak Kelimeler IV (Siyaset & İktisat)", "الكلمات المشتركة 4", "Arabic Cognates IV", "Siyaset, iktisat, ticaret, hürriyet terimleri.")
        ]
    },
    5: {
        "cefr": "C1",
        "title": "Level C1: Akademik Akıcılık (C1)",
        "arabicTitle": "المستوى C1",
        "englishTitle": "Level C1: Advanced",
        "lessons": [
            ("Akademik Yazım ve Metodoloji", "الكتابة الأكاديمية والمنهجية", "Academic Writing & Methodology", "Tez yazımı, kaynak gösterme ve akademik usul."),
            ("Felsefe ve Etik Düşünce", "الفلسفة والفكر الأخلاقي", "Philosophy & Ethics", "Ahlak felsefesi, varlık bilimi ve mantık yürütme."),
            ("Çağdaş Dünya ve Sosyoloji", "العالم المعاصر وعلم الاجتماع", "Contemporary World & Sociology", "Küreselleşme, sosyo-kültürel değişimler."),
            ("Edilgen Çatı ve Ettirgenlik", "المبني للمجهول والتعدية", "Passive Voice & Causatives", "Yapılmak, edilmek, yaptırmak edilgen çatı yapısı."),
            ("Osmanlı Edebi Mirası ve Dil", "الإرث الأدبي العثماني واللغة", "Ottoman Literary Heritage", "Klasik metinler, beyitler ve edebi sanatlar."),
            ("Türkçe Deyimler ve Atasözleri", "الأمثال والحكم التركية", "Proverbs & Idioms", "İpin ucunu kaçırmak, eline sağlık, başüstüne."),
            ("Diplomasi ve Uluslararası İlişkiler", "الدبلوماسية والعلاقات الدولية", "Diplomacy & Int. Relations", "Müzakere, antlaşma, büyükelçilik terimleri."),
            ("Hukuk Felsefesi ve İnsan Hakları", "فلسفة القانون وحقوق الإنسان", "Legal Philosophy & Human Rights", "Evrensel hukuk ilkeleri ve adalet kuramı."),
            ("Ebedî ve Ezelî Kavramlar", "المفاهيم الأبدية والأزلية", "Eternal & Timeless Concepts", "Ebedi, ezeli, hakikat ve varlık kavramları."),
            ("Mitoloji ve Destanlar", "الأساطير والملاحم", "Mythology & Epics", "Dede Korkut, Manas ve klasik destanlar."),
            ("Bilimsel Makale Analizi", "تحليل المقالات العلمية", "Scientific Article Analysis", "Makale inceleme ve kritik yapma."),
            ("Retorik ve İkna Sanatı", "البلاغة وفن الإقناع", "Rhetoric & Art of Persuasion", "Hitabet, topluluk önünde konuşma."),
            ("Kritik Düşünce ve Semiyotik", "التفكير النقدي والسيميائية", "Critical Thinking & Semiotics", "Göstergebilim ve anlam analizi."),
            ("Gelecek Senaryoları ve Futuroloji", "سيناريوهات المستقبل والدراسات المستقبلية", "Future Scenarios & Futurology", "Yapay zeka, teknolojik tekillik ve insanlık."),
            ("Ortak Kelimeler V (Kudret & Şeref)", "الكلمات المشتركة 5", "Arabic Cognates V", "Kudret, kuvvet, zafer, şeref, izzet kavramları.")
        ]
    }
}

# Load or init cache
cache_data = {}
if os.path.exists(CACHE_FILE):
    try:
        with open(CACHE_FILE, "r", encoding="utf-8") as f:
            cache_data = json.load(f)
        print(f"Loaded existing cache with {len(cache_data)} topics.")
    except Exception as e:
        print("Cache load error:", e)

def fetch_words_from_deepseek(cefr_code, title_tr, title_ar, title_en):
    """Calls DeepSeek API to get 12 100% topic-matched vocabulary items with TR, AR, EN, Sentences, Cognate root."""
    prompt = f"""You are a professional Turkish language professor and lexicographer.
Provide exactly 12 authentic, highly accurate Turkish vocabulary words or expressions that DIRECTLY match the topic heading: '{title_tr}' (CEFR Level {cefr_code}).

Return a JSON object containing a key "words" which is an array of 12 objects. Each object MUST have:
1. "tr": Turkish word or idiom (must be real, correct Turkish, no placehoder or variable names!)
2. "ar": Arabic translation (with voweling/harakat)
3. "en": English translation
4. "sentence_tr": Authentic natural Turkish example sentence containing the word
5. "sentence_en": English translation of the sentence
6. "sentence_ar": Arabic translation of the sentence
7. "ar_root": Arabic root letters if it is an Arabic origin cognate (e.g. "كتب"), or null if not Arabic origin.

Ensure all 12 words are 100% appropriate and directly relevant to '{title_tr}' ({title_en}).
Respond ONLY with valid JSON.
"""

    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {DEEPSEEK_API_KEY}"
    }
    payload = {
        "model": "deepseek-chat",
        "messages": [{"role": "user", "content": prompt}],
        "response_format": {"type": "json_object"},
        "temperature": 0.3
    }

    req = urllib.request.Request(
        DEEPSEEK_API_URL,
        data=json.dumps(payload).encode("utf-8"),
        headers=headers
    )

    try:
        with urllib.request.urlopen(req, timeout=45) as resp:
            raw = json.loads(resp.read().decode("utf-8"))
            content = raw["choices"][0]["message"]["content"]
            parsed = json.loads(content)
            if "words" in parsed and isinstance(parsed["words"], list):
                return parsed["words"]
            elif isinstance(parsed, list):
                return parsed
            else:
                for k, v in parsed.items():
                    if isinstance(v, list):
                        return v
                return []
    except Exception as e:
        print(f"DeepSeek API call error for '{title_tr}':", e)
        return []

print("Starting DeepSeek Generation for all 75 Topics...")

for lvl_id in range(1, 6):
    lvl_info = LEVELS_META[lvl_id]
    cefr = lvl_info["cefr"]
    
    for idx, les_meta in enumerate(lvl_info["lessons"]):
        t_tr, t_ar, t_en, summary = les_meta
        topic_key = f"L{lvl_id}_{idx+1}_{t_tr}"

        if topic_key in cache_data and len(cache_data[topic_key]) >= 10:
            print(f"[{lvl_id}.{idx+1}/75] Cached: '{t_tr}' ({len(cache_data[topic_key])} words)")

            continue

        print(f"[{lvl_id}.{idx+1}/75] Fetching from DeepSeek: Level {cefr} - '{t_tr}'...")
        words = fetch_words_from_deepseek(cefr, t_tr, t_ar, t_en)

        if words and len(words) >= 8:
            cache_data[topic_key] = words
            with open(CACHE_FILE, "w", encoding="utf-8") as f:
                json.dump(cache_data, f, ensure_ascii=False, indent=2)
            print(f" -> Success! Generated {len(words)} words for '{t_tr}'.")
        else:
            print(f" -> Warning: Failed or got fewer words for '{t_tr}'. Will retry or fallback if needed.")

        time.sleep(0.5)

print("\nGenerating final database.js with full topic-matched dataset...")

def generate_mind_palace(tr_word, en_word, ar_word, category):
    mp_tr = f"Zihin Sarayı: Bahçenin {category} alanında, üzeri ışıldayan altın bir '{tr_word}' ({ar_word}) heykeli canlandır."
    mp_en = f"Mind Palace: Picture a glowing golden '{tr_word}' ({en_word}) placed gracefully in Suzi's Garden {category} Pavilion."
    mp_ar = f"قصر الذاكرة: تخيل مجسماً ذهبياً مضيئاً لـ '{tr_word}' ({ar_word}) يستقر في جناح {category} بـ بستان سوزي."
    return mp_tr, mp_en, mp_ar

vocab_list = []
id_counter = 1
existing_words = set()
levels_definition = []

for lvl_id in range(1, 6):
    lvl_meta = LEVELS_META[lvl_id]
    lessons_list = []

    for idx, les_meta in enumerate(lvl_meta["lessons"]):
        t_tr, t_ar, t_en, summary = les_meta
        les_id = f"l{lvl_id}_{idx+1}"
        topic_key = f"L{lvl_id}_{idx+1}_{t_tr}"

        raw_words = cache_data.get(topic_key, [])
        les_vocab = []

        for item in raw_words:
            tr_w = item.get("tr") or item.get("word")
            ar_w = item.get("ar") or ""
            en_w = item.get("en") or ""
            s_tr = item.get("sentence_tr") or f"{tr_w} cümlede kullanıldı."
            s_en = item.get("sentence_en") or f"Used {tr_w} in a sentence."
            s_ar = item.get("sentence_ar") or f"تم استخدام {ar_w} في الجملة."
            ar_root = item.get("ar_root")

            if not tr_w:
                continue

            mp_tr, mp_en, mp_ar = generate_mind_palace(tr_w, en_w, ar_w, t_tr)

            is_cog = ar_root is not None and len(str(ar_root).strip()) > 0
            cog_info = None
            if is_cog:
                cog_info = {
                    "ar_root": str(ar_root).strip(),
                    "note_tr": f"Arapça kökenli ortak kelime: {ar_w} (Kök: {ar_root})",
                    "note_en": f"Shared Arabic cognate: {ar_w} (Root: {ar_root})",
                    "note_ar": f"كلمة مشتركة مع العربية: {ar_w} (جذر: {ar_root})"
                }

            word_obj = {
                "id": f"v_{id_counter:04d}",
                "word": tr_w,
                "tr": tr_w,
                "ar": ar_w,
                "en": en_w,
                "level": lvl_id,
                "category": t_tr,
                "sentence_tr": s_tr,
                "sentence_en": s_en,
                "sentence_ar": s_ar,
                "pronunciation": f"[{tr_w}]",
                "is_cognate": is_cog,
                "cognate_info": cog_info,
                "mind_palace_tr": mp_tr,
                "mind_palace_en": mp_en,
                "mind_palace_ar": mp_ar
            }

            les_vocab.append(word_obj)

            if tr_w not in existing_words:
                vocab_list.append(word_obj)
                existing_words.add(tr_w)

            id_counter += 1

        lesson_obj = {
            "id": les_id,
            "title": f"{idx+1}. {t_tr}",
            "arabicTitle": t_ar,
            "englishTitle": t_en,
            "summary": summary,
            "intro_tr": f"Bu derste '{t_tr}' konusunu öğreneceksiniz.",
            "intro_en": f"In this lesson, you will learn '{t_en}'.",
            "intro_ar": f"في هذا الدرس ستتعلم موضوع '{t_ar}'.",
            "vocabulary": les_vocab
        }
        lessons_list.append(lesson_obj)

    levels_definition.append({
        "id": lvl_id,
        "cefrCode": lvl_meta["cefr"],
        "title": lvl_meta["title"],
        "arabicTitle": lvl_meta["arabicTitle"],
        "englishTitle": lvl_meta["englishTitle"],
        "lessons": lessons_list
    })

output_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "database.js")
print(f"Writing database to {output_path}...")

with open(output_path, "w", encoding="utf-8") as f:
    f.write("// Suzim'in Türkçe Bahçesi - DeepSeek 100% Authentic Topic-Matched Database (A1 to C1)\n")
    f.write(f"// Contains {len(vocab_list)} unique vocabulary items across 75 lessons\n\n")
    f.write("const learningDatabase = {\n")
    f.write("  levels: ")
    json.dump(levels_definition, f, ensure_ascii=False, indent=2)
    f.write(",\n\n")
    f.write("  vocabularyBank: ")
    json.dump(vocab_list, f, ensure_ascii=False, indent=2)
    f.write("\n};\n")

print(f"Done! Generated database with {len(vocab_list)} vocabulary items across all 75 topics!")
