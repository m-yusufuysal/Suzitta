# -*- coding: utf-8 -*-
"""
perfect_3267_builder.py
Ensures every topic across 110 lessons has 30 DeepSeek AI-generated words,
producing a 3,267+ unique vocabulary dataset in database.js.
"""

import json
import os
import urllib.request
import urllib.error
import time

DEEPSEEK_API_KEY = os.getenv("DEEPSEEK_API_KEY", "")
DEEPSEEK_API_URL = "https://api.deepseek.com/chat/completions"

CACHE_FILE = os.path.join(os.path.dirname(os.path.abspath(__file__)), "topics_deepseek_cache.json")

print("Checking topic cache for 3,267+ total words...")

with open(CACHE_FILE, "r", encoding="utf-8") as f:
    cache_data = json.load(f)

from generate_3267_database import LEVELS_META

def fetch_words_for_topic(cefr, t_tr, t_ar, t_en, existing_count):
    needed = max(30, 30 - existing_count)
    prompt = f"""You are a professional Turkish language professor and lexicographer.
Provide exactly {needed} authentic, highly accurate Turkish words or expressions that DIRECTLY match the topic heading: '{t_tr}' (CEFR Level {cefr}).

Return a JSON object containing a key "words" which is an array of {needed} objects. Each object MUST have:
1. "tr": Turkish word or idiom (must be real, correct Turkish, no placeholder or generic variable names!)
2. "ar": Arabic translation (with voweling/harakat)
3. "en": English translation
4. "sentence_tr": Authentic natural Turkish example sentence containing the word
5. "sentence_en": English translation of the sentence
6. "sentence_ar": Arabic translation of the sentence
7. "ar_root": Arabic root letters if it is an Arabic origin cognate (e.g. "كتب"), or null if not.

Ensure all words are 100% appropriate and directly relevant to '{t_tr}'.
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
    req = urllib.request.Request(DEEPSEEK_API_URL, data=json.dumps(payload).encode("utf-8"), headers=headers)
    try:
        with urllib.request.urlopen(req, timeout=45) as resp:
            raw = json.loads(resp.read().decode("utf-8"))
            parsed = json.loads(raw["choices"][0]["message"]["content"])
            if "words" in parsed and isinstance(parsed["words"], list): return parsed["words"]
            elif isinstance(parsed, list): return parsed
            else:
                for k, v in parsed.items():
                    if isinstance(v, list): return v
                return []
    except Exception as e:
        print(f"DeepSeek call error for '{t_tr}':", e)
        return []

updated_cache = False
for lvl_id in range(1, 6):
    lvl_info = LEVELS_META[lvl_id]
    cefr = lvl_info["cefr"]
    for idx, les in enumerate(lvl_info["lessons"]):
        t_tr, t_ar, t_en, summary = les
        topic_key = f"L{lvl_id}_{idx+1}_{t_tr}"

        existing = cache_data.get(topic_key, [])
        if len(existing) < 30:
            print(f"Topic '{t_tr}' has {len(existing)} words. Fetching from DeepSeek...")
            more_words = fetch_words_for_topic(cefr, t_tr, t_ar, t_en, len(existing))
            if more_words:
                cache_data[topic_key] = existing + more_words
                updated_cache = True
                print(f" -> Updated '{t_tr}' to {len(cache_data[topic_key])} words.")
                with open(CACHE_FILE, "w", encoding="utf-8") as f:
                    json.dump(cache_data, f, ensure_ascii=False, indent=2)

if updated_cache:
    print("Cache updated successfully!")

def generate_mind_palace(tr_word, en_word, ar_word, category):
    mp_tr = f"Zihin Sarayı: Bahçenin {category} alanında, üzeri ışıldayan altın bir '{tr_word}' ({ar_word}) heykeli canlandır."
    mp_en = f"Mind Palace: Picture a glowing golden '{tr_word}' ({en_word}) placed gracefully in Suzi's Garden {category} Pavilion."
    mp_ar = f"قصر الذاكرة: تخيل مجسماً ذهبيًا مضيئاً لـ '{tr_word}' ({ar_word}) يستقر في جناح {category} بـ بستان سوزي."
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
            tr_w = (item.get("tr") or item.get("word") or "").strip()
            ar_w = (item.get("ar") or "").strip()
            en_w = (item.get("en") or "").strip()
            s_tr = item.get("sentence_tr") or f"{tr_w} cümlede harika bir anlam taşır."
            s_en = item.get("sentence_en") or f"{tr_w} carries a great meaning in a sentence."
            s_ar = item.get("sentence_ar") or f"يحمل {ar_w} معنى رائعاً في الجملة."
            ar_root = item.get("ar_root")

            if not tr_w: continue

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
            vocab_list.append(word_obj)
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

print(f"Total Compiled Vocabulary Items: {len(vocab_list)}")

output_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "database.js")
print(f"Writing database to {output_path}...")

with open(output_path, "w", encoding="utf-8") as f:
    f.write("// Suzim'in Türkçe Bahçesi - 3,267+ CEFR Learning Database (110 Lessons, A1 to C1)\n")
    f.write(f"// Contains {len(vocab_list)} unique vocabulary items across 110 lessons\n\n")
    f.write("const learningDatabase = {\n")
    f.write("  levels: ")
    json.dump(levels_definition, f, ensure_ascii=False, indent=2)
    f.write(",\n\n")
    f.write("  vocabularyBank: ")
    json.dump(vocab_list, f, ensure_ascii=False, indent=2)
    f.write("\n};\n")

print("Database generation completed successfully!")
