# -*- coding: utf-8 -*-
# generate_database.py
# Compiles a CEFR-aligned Turkish learning database with 5,000+ real words.
# Uses advanced Turkish suffix generation rules for nouns and verbs.
# Resolves nonsense word suffixes by using a semantic whitelist for derived forms.
# Ensures contextual sentences are realistic and semantically correct for phrases and adjectives.

import json
import os
import urllib.request
import urllib.error
import ssl
import time

print("Generating academically correct CEFR-aligned Turkish database with 5000+ unique words...")

# ═══════════════════════════════════════════════════════════════
# OPENAI SENTENCE GENERATOR & CACHE ENGINE
# ═══════════════════════════════════════════════════════════════
CACHE_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "openai_sentences_cache.json")
openai_cache = {}
if os.path.exists(CACHE_PATH):
    try:
        with open(CACHE_PATH, "r", encoding="utf-8") as f:
            openai_cache = json.load(f)
        print(f"Loaded {len(openai_cache)} cached sentences from local cache.")
    except Exception as e:
        print(f"Error loading cache: {e}")

def save_cache():
    try:
        with open(CACHE_PATH, "w", encoding="utf-8") as f:
            json.dump(openai_cache, f, ensure_ascii=False, indent=2)
    except Exception as e:
        print(f"Error saving cache: {e}")

def fetch_openai_sentences_batch(batch_words):
    api_key = os.environ.get("OPENAI_API_KEY", "").strip()
    if not api_key:
        print("OPENAI_API_KEY is not set. Using local academic sentence templates.")
        return None
    
    prompt = (
        "You are an expert Turkish linguist and native language instructor. "
        "For each of the following Turkish words, write a highly natural, realistic, grammatically correct, "
        "and academically sensible Turkish example sentence. Ensure the sentence is appropriate for the word's meaning, CEFR level, and part of speech. "
        "Never use picture/display templates for abstract nouns (e.g. politics, justice, science), time words, or processes. "
        "Prefer daily-life contexts for A1/A2, social/professional contexts for B1/B2, and academic contexts for C1. "
        "Also write the corresponding Arabic translation and English translation for that sentence. "
        "Respond ONLY with a JSON array containing objects with keys: 'word', 'sentence', 'sentence_ar', 'sentence_en'. "
        "Do not include any Markdown blocks, backticks, or extra text. Output raw JSON only.\n\n"
        f"Words list:\n{json.dumps(batch_words, ensure_ascii=False)}"
    )
    
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {api_key}"
    }
    
    data = {
        "model": "gpt-4o-mini",
        "messages": [
            {"role": "user", "content": prompt}
        ],
        "temperature": 0.3
    }
    
    req = urllib.request.Request(
        "https://api.openai.com/v1/chat/completions",
        data=json.dumps(data).encode("utf-8"),
        headers=headers,
        method="POST"
    )
    
    context = ssl._create_unverified_context()
    try:
        with urllib.request.urlopen(req, context=context, timeout=25) as response:
            res_data = json.loads(response.read().decode("utf-8"))
            content = res_data["choices"][0]["message"]["content"].strip()
            if content.startswith("```"):
                content = content.split("```")[1]
                if content.startswith("json"):
                    content = content[4:]
            return json.loads(content)
    except urllib.error.HTTPError as e:
        err_body = e.read().decode()
        if "insufficient_quota" in err_body:
            print("Notice: Provided OpenAI API Key has insufficient quota (out of credits). Using local templates.")
        else:
            print(f"API Error ({e.code}): {err_body}")
        return None
    except Exception as e:
        print(f"Connection Error: {e}")
        return None

def prefetch_missing_sentences(all_words):
    missing_words = [w for w in all_words if w["tr"].lower().strip() not in openai_cache]
    if not missing_words:
        return
        
    print(f"Fetching sentences for {len(missing_words)} new words from OpenAI in batches...")
    
    # Process in batches of 30
    batch_size = 30
    for i in range(0, len(missing_words), batch_size):
        batch = missing_words[i:i+batch_size]
        batch_input = [{"tr": item["tr"], "ar": item["ar"], "en": item["en"], "type": item["type"]} for item in batch]
        
        print(f"Fetching batch {i//batch_size + 1}/{(len(missing_words)-1)//batch_size + 1}...")
        results = fetch_openai_sentences_batch(batch_input)
        
        if results is None:
            print("API fetch stopped. Fallback templates will be used for remaining words.")
            break
            
        for res in results:
            w_key = res.get("word", "").lower().strip()
            if w_key:
                openai_cache[w_key] = {
                    "sentence": res.get("sentence", ""),
                    "sentence_ar": res.get("sentence_ar", ""),
                    "sentence_en": res.get("sentence_en", "")
                }
        
        save_cache()
        time.sleep(1) # brief rate limiting protection

# ═══════════════════════════════════════════════════════════════
# ROOT WORD DATASET (500+ roots)
# Format: "turkish;arabic;english;chinese(pinyin);isCognate;arabicRoot;type;allowed_derived"
# ═══════════════════════════════════════════════════════════════

a1_raw = [
  # Greetings & Basics
  "merhaba;مرحباً;hello;你好 (nǐ hǎo);true;مرحبا;p;",
  "selam;سلام;hi;你好 (nǐ hǎo);true;سلام;p;",
  "günaydın;صباح الخير;good morning;早上好 (zǎoshang hǎo);false;;p;",
  "iyi akşamlar;مساء الخير;good evening;晚上好 (wǎnshang hǎo);false;;p;",
  "iyi geceler;ليلة سعيدة;good night;晚安 (wǎn'ān);false;;p;",
  "hoş geldiniz;أهلاً وسهلاً;welcome;欢迎 (huānyíng);false;;p;",
  "güle güle;مع السلامة;goodbye;再见 (zàijiàn);false;;p;",
  "lütfen;رجاءً;please;请 (qǐng);true;لطفاً;p;",
  "teşekkürler;شكراً;thank you;谢谢 (xièxie);true;تشكرات;p;",
  "evet;نعم;yes;是 (shì);false;;p;",
  "hayır;لا;no;不是 (bú shì);false;;p;",
  "tamam;تمام;okay;好的 (hǎo de);true;تمام;p;",
  "affedersiniz;عفواً;excuse me;对不起 (duìbuqǐ);false;;p;",
  "nasılsınız;كيف حالك;how are you;你好吗 (nǐ hǎo ma);false;;p;",
  "iyiyim;بخير;I am fine;我很好 (wõ hěn hǎo);false;;p;",
  "hoşça kal;ابقَ بخير;stay well / goodbye;再见 (zàijiàn);false;;p;",
  "rica ederim;على الرحب والسعة;you are welcome;不客气 (bú kèqì);false;;p;",
  "gün;يوم;day;天 / 日 (tiān / rì);false;;n;lik",
  "hafta;أسبوع;week;星期 (xīngqī);false;;n;lik",
  "ay;شهر;month;月 (yuè);false;;n;lik",
  "yıl;سنة;year;年 (nián);false;;n;lik",
  # Pronouns
  "ben;أنا;I;我 (wǒ);false;;p;",
  "sen;أنت;you;你 (nǐ);false;;p;",
  "o;هو / هي;he / she / it;他/她/它 (tā);false;;p;",
  "biz;نحن;we;我们 (wǒmen);false;;p;",
  "siz;أنتم;you (plural/formal);你们 (nǐmen);false;;p;",
  "onlar;هم;they;他们 (tāmen);false;;p;",
  "bu;هذا;this;这 (zhè);false;;p;",
  "şu;ذاك;that (medium);那 (nà);false;;p;",
  "o;ذلك;that (far);那 (nà);false;;p;",
  # Numbers
  "bir;واحد;one;一 (yī);false;;p;",
  "iki;اثنان;two;二 (èr);false;;p;",
  "üç;ثلاثة;three;三 (sān);false;;p;",
  "dört;أربعة;four;四 (sì);false;;p;",
  "beş;خمسة;five;五 (wǔ);false;;p;",
  "altı;ستة;six;六 (liù);false;;p;",
  "yedi;سبعة;seven;七 (qī);false;;p;",
  "sekiz;ثمانية;eight;八 (bā);false;;p;",
  "dokuz;تسعة;nine;九 (jiǔ);false;;p;",
  "on;عشرة;ten;十 (shí);false;;p;",
  "yirmi;عشرون;twenty;二十 (èrshí);false;;p;",
  "otuz;ثلاثون;thirty;三十 (sānshí);false;;p;",
  "kırk;اربعون;forty;四十 (sìshí);false;;p;",
  "elli;خمسون;fifty;五十 (wǔshí);false;;p;",
  "altmış;ستون;sixty;六十 (liùshí);false;;p;",
  "yetmiş;سبعون;seventy;七十 (qīshí);false;;p;",
  "seksen;ثمانون;eighty;八十 (bāshí);false;;p;",
  "doksan;تسعون;ninety;九十 (jiǔshí);false;;p;",
  "yüz;مئة;hundred;百 (bǎi);false;;p;",
  "bin;ألف;thousand;千 (qiān);false;;p;",
  # Colors
  "kırmızı;أحمر;red;红色 (hóngsè);false;;a;",
  "mavi;أزرق;blue;蓝色 (lánsè);false;;a;",
  "yeşil;أخضر;green;绿色 (lǜsè);false;;a;",
  "sarı;أصفر;yellow;黄色 (huángsè);false;;a;",
  "beyaz;أبيض;white;白色 (báisè);false;;a;",
  "siyah;أسود;black;黑色 (hēisè);false;;a;",
  "turuncu;برتقالي;orange;橙色 (chéngsè);false;;a;",
  "mor;بنفسجي;purple;紫色 (zǐsè);false;;a;",
  "pembe;وردي;pink;粉色 (fěnsè);false;;a;",
  "kahverengi;بني;brown;棕色 (zōngsè);false;;a;",
  "gri;رمادي;gray;灰色 (huīsè);false;;a;",
  # Family
  "aile;عائلة;family;家庭 (jiātíng);true;عائلة;n;lik",
  "anne;أم;mother;母亲 (mǔqīn);false;;n;lik,siz",
  "baba;أب;father;父亲 (fùqīn);false;;n;lik,siz",
  "kardeş;أخ / أخت;sibling;兄弟姐妹 (xiōngdì jiěmèi);false;;n;lik,siz",
  "abla;أخت كبرى;older sister;姐姐 (jiějie);false;;n;lik,siz",
  "ağabey;أخ أكبر;older brother;哥哥 (gēge);false;;n;lik,siz",
  "çocuk;طفel;child;孩子 (háizi);false;;n;lik,siz",
  "bebek;رضيع;baby;婴儿 (yīng'ér);false;;n;lik,siz",
  "dede;جد;grandfather;爷爷 (yéye);false;;n;lik",
  "nine;جدة;grandmother;奶奶 (nǎinai);false;;n;lik",
  "amca;عم;uncle (paternal);叔叔 (shūshu);false;;n;lik",
  "teyze;خالة;aunt (maternal);阿姨 (āyí);false;;n;lik",
  "hala;عمة;aunt (paternal);姑姑 (gūgu);false;;n;lik",
  "dayı;خال;uncle (maternal);舅舅 (jiùjiu);false;;n;lik",
  "oğul;ابن;son;儿子 (érzi);false;;n;siz",
  "kız;بنت / فتاة;daughter / girl;女儿 / 女孩 (nǚ'ér / nǚhái);false;;n;siz",
  # Body
  "baş;رأس;head;头 (tóu);false;;n;lik,li,siz",
  "göz;عين;eye;眼睛 (yǎnjīng);false;;n;lik,ci,li,siz",
  "kulak;أذن;ear;耳朵 (ěrduo);false;;n;lik,li,siz",
  "burun;أنف;nose;鼻子 (bízi);false;;n;li,siz",
  "ağız;فم;mouth;嘴巴 (zuǐba);false;;n;lık,li",
  "el;يد;hand;手 (shǒu);false;;n;li,siz",
  "ayak;قدم;foot;脚 (jiǎo);false;;n;lik,li,siz",
  "saç;شعر;hair;头发 (tóufa);false;;n;li,siz",
  "yüz;وجه;face;脸 (liǎn);false;;n;lik",
  "dil;لسان / لغة;tongue / language;舌头 / 语言 (shétou / yǔyán);false;;n;li,siz",
  "diş;سن;tooth;牙齿 (yáchǐ);false;;n;ci,li,siz,lik",
  "boyun;رقبة;neck;脖子 (bózi);false;;n;lu",
  "kol;ذراع;arm;手臂 (shǒubì);false;;n;suz,lu",
  "bacak;ساق;leg;腿 (tuǐ);false;;n;siz",
  "kalp;قلب;heart;心 (xīn);true;قلب;n;li,siz",
  # Basic Objects
  "ev;بيت;house;家 (jiā);false;;n;li,siz,lik,ci",
  "su;ماء;water;水 (shuǐ);false;;n;lu,suz,lik,ci",
  "ekmek;خبز;bread;面包 (miànbāo);false;;n;li,siz,lik,ci",
  "kitap;كتاب;book;书 (shū);true;كتاب;n;lik,ci",
  "kalem;قلم;pen;笔 (bǐ);true;قلم;n;lik,ci",
  "defter;دفتر;notebook;笔记本 (bǐjìběn);true;دفتر;n;lik",
  "masa;طاولة;table;桌子 (zhuōzi);false;;n;lık",
  "sandalye;كرسي;chair;椅子 (yǐzi);false;;n;",
  "kapı;باب;door;门 (mén);false;;n;lık,ci",
  "pencere;نافذة;window;窗户 (chuānghu);false;;n;li,siz",
  "araba;سيارة;car;汽车 (qìchē);false;;n;lı,sız,ci",
  "oda;غرفة;room;房间 (fángjiān);false;;n;lı",
  "dolap;خزانة;cupboard;柜子 (guìzi);false;;n;lık",
  "perde;ستارة;curtain;窗帘 (chuānglián);false;;n;li,siz",
  "lamba;مصباح;lamp;灯 (dēng);false;;n;lı",
  "ayna;مرآة;mirror;镜子 (jìngzi);false;;n;lı",
  "anahtar;مفتاح;key;钥匙 (yàoshi);false;;n;lik",
  "çanta;حقيبة;bag;包 (bāo);false;;n;lı,sız",
  "harita;خريطة;map;地图 (dìtú);true;خريطة;n;",
  "resim;صورة;picture / drawing;图片 (túpiàn);true;رسم;n;",
  # Basic Verbs
  "gelmek;مجيء;to come;来 (lái);false;;v;",
  "gitmek;ذهاب;to go;去 (qù);false;;v;",
  "yapmak;فعل;to do / make;做 (zuò);false;;v;",
  "yemek;أكل;to eat;吃 (chī);false;;v;",
  "içmek;شرب;to drink;喝 (hē);false;;v;",
  "uyumak;نوم;to sleep;睡觉 (shuìjiào);false;;v;",
  "konuşmak;كلام;to speak;说话 (shuōhuà);false;;v;",
  "anlamak;فهم;to understand;理解 (lǐjiě);false;;v;",
  "sevmek;حب;to love;爱 (ài);false;;v;",
  "istemek;إرادة;to want;要 (yào);false;;v;",
  "okumak;قراءة;to read;读 (dú);false;;v;",
  "yazmak;كتابة;to write;写 (xiě);false;;v;",
  "almak;أخذ / شراء;to take / buy;拿 / 买 (ná / mǎi);false;;v;",
  "vermek;إعطاء;to give;给 (gěi);false;;v;",
  "bakmak;نظر;to look;看 (kàn);false;;v;",
  "görmek;رؤية;to see;看见 (kànjiàn);false;;v;",
  "duymak;سماع;to hear;听见 (tīngjiàn);false;;v;",
  # Basic Adjectives
  "büyük;كبير;big;大 (dà);false;;a;",
  "küçük;صغير;small;小 (xiǎo);false;;a;",
  "güzel;جميل;beautiful;美丽 (měilì);false;;a;",
  "iyi;جيد;good;好 (hǎo);false;;a;",
  "kötü;سيء;bad;坏 (huài);false;;a;",
  "yeni;جديد;new;新 (xīn);false;;a;",
  "eski;قديم;old;旧 (jiù);false;;a;",
  "sıcak;حار;hot;热 (rè);false;;a;",
  "soğuk;بارd;cold;冷 (lěng);false;;a;",
  "var;يوجد;there is;有 (yǒu);false;;p;",
  "yok;لا يوجد;there is not;没有 (méiyǒu);false;;p;"
]

a2_raw = [
  # Food & Drinks
  "süt;حليب;milk;牛奶 (niúnǎi);false;;n;ci,li,siz,lik",
  "peynir;جبن;cheese;奶酪 (nǎilào);false;;n;ci,li,siz",
  "yumurta;بيض;egg;鸡蛋 (jīdàn);false;;n;cı,li,siz",
  "pilav;أرز;rice;米饭 (mǐfàn);false;;n;lı",
  "çorba;شوربة;soup;汤 (tāng);true;شوربة;n;cı,lı",
  "salata;سلطة;salad;沙拉 (shālā);true;سلطة;n;lık",
  "tavuk;دجاج;chicken;鸡 (jī);false;;n;cu,lu",
  "et;لحم;meat;肉 (ròu);false;;n;çi,li,siz,lik",
  "balık;سمك;fish;鱼 (yú);false;;n;çı,lı,sız,lık",
  "sebze;خضار;vegetable;蔬菜 (shūcài);false;;n;ci,li",
  "meyve;فاكهة;fruit;水果 (shuǐguǒ);false;;n;ci,li,siz",
  "elma;تفاحة;apple;苹果 (píngguǒ);false;;n;lı",
  "portakal;برتقال;orange;橙子 (chengzi);true;برتقال;n;lı",
  "muz;موز;banana;香蕉 (xiāngjiāo);true;موز;n;lu",
  "limon;ليمون;lemon;柠檬 (níngméng);true;ليمون;n;lu,suz,luk",
  "çay;شاي;tea;茶 (chá);false;;n;ci,li,siz",
  "kahve;قهوة;coffee;咖啡 (kāfēi);true;قهوة;n;ci,li,siz",
  "şeker;سكر;sugar;糖 (táng);true;سكر;n;ci,li,siz,lik",
  "tuz;ملح;salt;盐 (yán);false;;n;cu,lu,suz,luk",
  "biber;فلفل;pepper;胡椒 (hújiāo);false;;n;li,siz",
  "zeytin;زيتون;olive;العقد (gǎnlǎn);true;زيتون;n;ci,li,lik",
  "suya;مياه;waters;水 (shuǐ);false;;n;lu,suz",
  "ekmek;خبز;bread;面包 (miànbāo);false;;n;ci,li,siz,lik",
  # Shopping & Commerce
  "para;فلوس;money;钱 (qián);false;;n;cı,li,siz",
  "fiyat;سعر;price;价格 (jiàgé);false;;n;lı,sız",
  "hesap;حساب;bill / account;账单 (zhàngdān);true;حساب;n;lı,sız",
  "market;سوبرماركت;supermarket;超市 (chāoshì);false;;n;",
  "mağaza;متجر;store;商店 (shāngdiàn);false;;n;",
  "kasap;قصاب;butcher;肉铺 (ròupù);true;قصاب;n;lık",
  "fırın;فرن;bakery;面包房 (miànbāofáng);true;فرن;n;cılık,lık",
  "manav;بائع خضار;greengrocer;蔬菜商 (shūcàishāng);false;;n;lık",
  "pazar;سوق;market / Sunday;市场 / 星期天 (shìchǎng / xīngqītiān);false;;n;lık",
  "çarşı;سوق مسقوف;bazaar / shopping street;市集 (shìjí);false;;n;",
  # Home & Daily Life
  "mutfak;مطبخ;kitchen;厨房 (chúfáng);true;مطبخ;n;lık",
  "banyo;حمام;bathroom;浴室 (yùshì);false;;n;lık",
  "yatak;سرير;bed;床 (chuáng);false;;n;lık",
  "buzdolabı;ثلاجة;fridge;冰箱 (bīngxiāng);false;;n;",
  "ocak;موقد;stove;炉子 (lúzi);false;;n;lık",
  "halı;سجادة;carpet;地毯 (dìtǎn);false;;n;cılık",
  "yastık;وسادة;pillow;枕头 (zhěntou);false;;n;lık",
  "havlu;منشفة;towel;毛巾 (máojīn);false;;n;luk",
  "sabun;صابون;soap;肥皂 (féizào);true;صابون;n;lu,suz,luk",
  # Clothes
  "gömlek;قميص;shirt;衬衫 (chènshān);false;;n;li,siz",
  "pantolon;بنطال;pants;裤子 (kùzi);false;;n;lu,suz",
  "etek;تنورة;skirt;裙子 (qúnzi);false;;n;li,siz",
  "ceket;سترة;jacket;外套 (wàitào);false;;n;li,siz",
  "ayakkabı;حذاء;shoes;鞋子 (xiézi);false;;n;cı,lı,sız",
  "çorap;جوارب;socks;袜子 (wàzi);false;;n;çı,lı,sız",
  "şapka;قبعة;hat;帽子 (màozi);false;;n;lı,sız",
  "elbise;ثوب / فستان;dress / clothes;衣服 / 连衣裙 (yīfu / liányīqún);true;ألبسة;n;li,siz",
  # Transport & Places
  "otobüs;حافلة;bus;公交车 (gōngjiāochē);false;;n;çü",
  "tren;قطار;train;火车 (huǒchē);false;;n;",
  "uçak;طائرة;plane;飞机 (fēijī);false;;n;savar",
  "taksi;تاكسي;taxi;出租车 (chūzūchē);true;تاكسي;n;ci",
  "bisiklet;دراجة;bicycle;自行车 (zìxíngchē);false;;n;li,ci",
  "yol;طريق;road / way;路 (lù);false;;n;cu,lu,suz",
  "durak;موقف;stop / station;车站 (chēzhàn);false;;n;",
  "istasyon;محطة;station;火车站 (huǒchēzhàn);false;;n;",
  "bilet;بطاقة;ticket;票 (piào);false;;n;çi,li,siz",
  "şehir;مدينة;city;城市 (chéngshì);false;;n;li,lik",
  "köy;قرية;village;村庄 (cūnzhuāng);false;;n;lü,lük",
  "sokak;شارع;street;街道 (jiēdào);false;;n;",
  # Weather
  "hava;طقس / هواء;weather / air;天气 / 空气 (tiānqì / kōngqì);true;هواء;n;lı,sız",
  "güneş;شمس;sun;太阳 (tàiyáng);false;;n;li,siz",
  "yağmur;مطر;rain;雨 (yǔ);false;;n;lı,sız",
  "kar;ثلج;snow;雪 (xuě);false;;n;lı,sız",
  "rüzgar;ريح;wind;风 (fēng);false;;n;li,siz",
  "bulut;غيم;cloud;云 (yún);false;;n;lu,suz",
  "sıcaklık;حرارة;temperature;温度 (wēndù);false;;n;",
  # A2 Verbs
  "oturmak;جلوس / سكن;to sit / live;坐 / 居住 (zuò / jūzhù);false;;v;",
  "kalkmak;نهوض;to stand up / get up;起床 / 起飞 (qǐchuáng / qǐfēi);false;;v;",
  "çalışmak;عمل / دراسة;to work / study;工作 / 学习 (gōngzuò / xuéxí);false;;v;",
  "durmak;وقوف;to stop / stand;停止 / 站立 (tíngzhǐ / zhànlì);false;;v;",
  "açmak;فتح;to open;打开 (dǎkāi);false;;v;",
  "kapatmak;إغلاق;to close;关闭 (guānbì);false;;v;",
  "yürümek;مشي;to walk;走路 (zǒulù);false;;v;",
  "koşmak;ركض;to run;跑步 (pǎobù);false;;v;",
  "bulmak;إيجاد;to find;找到 (zhǎodào);false;;v;",
  "aramak;بحث / اتصال;to search / call;寻找 / 打电话 (xúnzhǎo / dǎdiànhuà);false;;v;",
  "sormak;سؤال;to ask;问 (wèn);false;;v;",
  "öğrenmek;تعلم;to learn;学习 (xuéxí);false;;v;",
  "öğretmek;تعليم;to teach;教 (jiāo);false;;v;",
  "bilmek;معرفة;to know;知道 (zhīdào);false;;v;",
  "satmak;بيع;to sell;卖 (mài);false;;v;",
  "almak;شراء;to buy;买 (mǎi);false;;v;",
  # A2 Adjectives
  "pahalı;غالٍ;expensive;贵 (guì);false;;a;",
  "ucuz;رخيص;cheap;便宜 (piányi);false;;a;",
  "temiz;نظيف;clean;干净 (gānjìng);false;;a;",
  "kirli;متسخ;dirty;脏 (zàng);false;;a;",
  "uzun;طويل;long / tall;长 / 高 (cháng / gāo);false;;a;",
  "kısa;قصير;short;短 (duǎn);false;;a;",
  "ağır;ثقيل;heavy;重 (zhòng);false;;a;",
  "hafif;خفيف;light;轻 (qīng);false;;a;",
  "hızlı;سريع;fast;快 (kuài);false;;a;",
  "yavaş;بطيء;slow;慢 (màn);false;;a;",
  "kolay;سهل;easy;简单 (jiǎndān);false;;a;",
  "zor;صعب;difficult;难 (nán);false;;a;",
  "açık;مفتوح;open / clear;开 / 浅色 (kāi / qiǎnsè);false;;a;",
  "kapalı;مغلق;closed;关 / 阴天 (guān / yīntiān);false;;a"
]

b1_raw = [
  # Professions
  "doktor;طبيب;doctor;医生 (yīshēng);false;;n;luk",
  "öğretmen;معلم;teacher;老师 (lǎoshī);false;;n;lik",
  "mühendis;مهندس;engineer;工程师 (gōngchéngshī);true;مهندس;n;lik",
  "avukat;محامٍ;lawyer;律师 (lǜshī);false;;n;lik",
  "hemşire;ممرضة;nurse;护士 (hùshi);false;;n;lik",
  "polis;شرطة;police;警察 (jǐngchá);false;;n;lik",
  "asker;عسكري;soldier;士兵 (shìbīng);true;عسكر;n;lik",
  "müdür;مدير;manager / director;经理 / 校长 (jīnglǐ / xiàozhǎng);true;مدير;n;lük",
  "memur;موظف;civil servant / officer;公务员 (gōngwùyuán);true;مأمور;n;luk",
  "yazar;كاتب;writer;作家 (zuòjiā);false;;n;lık",
  "mimar;معمار;architect;建筑师 (jiànzhùshī);true;معmar;n;lık",
  "işçi;عامل;worker;工人 (gōngrén);false;;n;lik",
  "aşçı;طباخ;cook / chef;厨师 (chúshī);false;;n;lık,cılık",
  "şoför;سائق;driver;司机 (sījī);false;;n;lük",
  "çiftçi;فلاح;farmer;农民 (nóngmín);false;;n;lik",
  "postacı;ساعي البريد;postman;邮递员 (yóudìyuán);false;;n;lık",
  "eczacı;صيدلي;pharmacist;药剂师 (yàojìshī);true;اجزا;n;lık",
  "ressam;رسام;painter / artist;画家 (huàjiā);true;رسام;n;lık",
  # Education
  "okul;مدرسة;school;学校 (xuéxiào);false;;n;luk",
  "üniversite;جامعة;university;大学 (dàxué);false;;n;",
  "ders;درس;lesson / class;课 (kè);true;درس;n;lik",
  "sınıf;صف;classroom / grade;教室 / 班级 (jiàoshì / bānjí);true;صنف;n;lık",
  "sınav;امتحان;exam;考试 (kǎoshì);false;;n;",
  "ödev;واجب;homework;作业 (zuòyè);false;;n;",
  "diploma;شهادة;diploma;毕业证书 (bìyèzhèngshū);false;;n;lı",
  "kütüphane;مكتبة;library;图书馆 (túshūguǎn);false;;n;",
  "öğrenci;طالب;student;学生 (xuéshēng);false;;n;lik",
  # Health
  "hastane;مستشفى;hospital;医院 (yīyuàn);false;;n;lik",
  "ilaç;دواء;medicine;药 (yào);true;علاج;n;lı,sız",
  "ateş;حرارة / نار;fever / fire;发烧 / 火 (fāshāo / huǒ);false;;n;li,siz",
  "ağrı;ألم;pain / ache;疼痛 (téngtòng);false;;n;lı,sız",
  "grip;إنفلونزا;flu;流感 (liúgǎn);false;;n;li",
  "reçete;وصفة طبية;prescription;处方 (chǔfāng);false;;n;li",
  "muayene;معاينة;medical exam;体检 (tǐjiǎn);true;معاينة;n;",
  "sağlık;صحة;health;健康 (jiànkāng);false;;n;lı,sız",
  "hasta;مريض;patient / sick;病人 / 生病 (bìngrén / shēngbìng);true;خسته;a;",
  # Nature & Animals
  "deniz;بحر;sea;海洋 (hǎiyáng);false;;n;li",
  "dağ;جبل;mountain;山 (shān);false;;n;lık,lı",
  "nehir;نهر;river;河流 (héliú);true;نهر;n;",
  "orman;غابة;forest;森林 (sēnlín);false;;n;lık",
  "göl;بحيرة;lake;湖泊 (húpò);false;;n;",
  "çiçek;زهرة;flower;花 (huā);false;;n;ci,li,siz,lik",
  "ağaç;شجرة;tree;树 (shù);false;;n;lık,lı,sız",
  "taş;حجر;stone;石头 (shítou);false;;n;lı,sız,lık",
  "toprak;تراب / أرض;soil / earth;土壤 (tǔrǎng);false;;n;lu,suz",
  "kedi;قطة;cat;猫 (māo);false;;n;li,siz",
  "köpek;كلب;dog;狗 (gǒu);false;;n;li,siz",
  "kuş;طائر;bird;鸟 (niǎo);false;;n;çu,lu",
  "at;حصان;horse;马 (mǎ);false;;n;çı,lı",
  "aslan;أسد;lion;狮子 (shīzi);false;;n;",
  # Feelings & Emotions
  "mutlu;سعيد;happy;快乐 (kuàilè);false;;a;",
  "üzgün;حزين;sad;悲伤 (bēishāng);false;;a;",
  "kızgın;غاضب;angry;生气 (shēngqì);false;;a;",
  "korkak;خائف;scared / coward;胆小 (dǎnxiǎo);false;;a;",
  "meşgul;مشغول;busy;忙 (máng);true;مشغول;a;",
  "rahat;مرتاح;comfortable;舒服 (shūfu);true;راحة;a;",
  "heyecan;حماس / إثارة;excitement;激动 (jīdòng);false;;n;li",
  # B1 Verbs
  "düşünmek;تفكير;to think;想 (xiǎng);false;;v;",
  "hatırlamak;تذكر;to remember;记得 (jìde);false;;v;",
  "unutmak;نسيان;to forget;忘记 (wàngjì);false;;v;",
  "başlamak;بدء;to start;开始 (kāishǐ);false;;v;",
  "bitirmek;إنهاء;to finish;结束 (jiéshù);false;;v;",
  "taşımak;نقل / حمل;to carry / move;搬运 (bānyùn);false;;v;",
  "denemek;تجربة / محاولة;to try;尝试 (chángshì);false;;v;",
  "hazırlamak;تجهيز;to prepare;准备 (zhǔnbèi);false;;v;",
  "seçmek;اختيار;to choose;选择 (xuǎnzé);false;;v;",
  "kazanmak;ربح / فوز;to win / earn;赢得 / 赚 (yíngdé / zhuàn);false;;v;",
  "kaybetmek;خسارة;to lose;输 / 丢失 (shū / diūshī);false;;v;",
  "yaşamak;عيش;to live;生活 (shēnghuó);false;;v;",
  "ölmek;موت;to die;死亡 (sǐwáng);false;;v;",
  "anlatmak;شرح / رواية;to explain / tell;叙述 (xùshù);false;;v;",
  "dinlemek;استماع;to listen;听 (tīng);false;;v;",
  "izlemek;مشاهدة;to watch / follow;观看 (guānkàn);false;;v;"
]

b2_raw = [
  # Society & Government
  "hükümet;حكومة;government;政府 (zhèngfǔ);true;حكومة;n;",
  "devlet;دولة;state / nation;国家 (guójiā);true;دولة;n;lik",
  "kanun;قانون;law;法律 (fǎlǜ);true;قانون;n;suz,luk",
  "hukuk;حقوق;law / legal science;法学 (fǎxué);true;حقوق;n;çu,sal",
  "seçim;انتخابات;election / choice;选举 (xuǎnjǔ);false;;n;",
  "vatandaş;مواطن;citizen;公民 (gōngmín);true;وطن;n;lık",
  "nüfus;نفوس / سكان;population;人口 (rénkǒu);true;نفوس;n;lu,suz",
  "vergi;ضريبة;tax;税 (shuì);false;;n;ci,li,siz",
  "siyaset;سياسة;politics;政治 (zhèngzhì);true;سياسة;n;çi",
  "adalet;عدالة;justice;正义 (zhèngyì);true;عدالة;n;li,siz,lik",
  "hürriyet;حرية;freedom;自由 (zìyóu);true;حرية;n;",
  # Media & Technology
  "haber;خبر;news;新闻 (xīnwén);true;خبر;n;ci,li,siz",
  "gazete;جريدة;newspaper;报纸 (bàozhǐ);false;;n;ci",
  "dergi;مجلة;magazine;杂志 (zázhì);false;;n;ci",
  "internet;إنترنت;internet;网络 (wǎngluò);false;;n;li,siz",
  "telefon;هاتف;phone;电话 (diànhuà);false;;n;cu",
  "bilgisayar;حasub;computer;电脑 (diànnǎo);false;;n;cı",
  "yazılım;برمجيات;software;软件 (ruǎnjiàn);false;;n;cı",
  "veri;بيانات;data;数据 (shùjù);false;;n;",
  "bağlantı;اتصال;connection;连接 (liánjiē);false;;n;lı,sız",
  "uygulama;تطبيق;application / practice;应用 (yìngyòng);false;;n;lı",
  # Business & Economy
  "şirket;شركة;company;公司 (gōngsī);true;شركة;n;",
  "maaş;معاش / راتب;salary;薪水 (xīnshuǐ);true;معاش;n;lı,sız",
  "toplantı;اجتماع;meeting;会议 (huìyì);false;;n;lı",
  "proje;مشروع;project;项目 (xiàngmù);false;;n;li",
  "bütçe;ميزانية;budget;预算 (yùsuàn);false;;n;li",
  "yatırım;استثمار;investment;投资 (tóuzī);false;;n;cı",
  "ticaret;تجارة;commerce / trade;贸易 (màoyì);true;تجارة;n;hane,ci",
  "ithalat;واردات;import;进口 (jìnkǒu);true;إدخالات;n;çı",
  "ihracat;صادرات;export;出口 (chūkǒu);true;إخراجات;n;çı",
  # Abstract Concepts
  "gelenek;تقليد;tradition;传统 (chuántǒng);false;;n;sel,li",
  "tarih;تاريخ;history / date;历史 / 日期 (lìshǐ / rìqī);true;تاريخ;n;çi,li,sel",
  "coğrafya;جغرافيا;geography;地理 (dìlǐ);true;جغرافيا;n;cı",
  "edebiyat;أدب;literature;文学 (wénxué);true;أدبيات;n;çı",
  "felsefe;فلسفة;philosophy;哲学 (zhéxué);true;فلسفة;n;ci",
  "kültür;ثقافة;culture;文化 (wénhuà);false;;n;lü,süz",
  "sanat;فن;art;艺术 (yìshù);true;صناعة;n;çı,sal,lık",
  "saygı;احترام;respect;尊重 (zūnzhòng);false;;n;lı,sız",
  "sevgi;محبة;love / affection;爱 (ài);false;;n;li,siz",
  "güven;ثقة / أمان;trust / safety;信任 (xìnrèn);false;;n;li,siz,lik",
  # B2 Verbs
  "tartışmak;نقاش;to discuss / argue;讨论 (tǎolùn);false;;v;",
  "açıklamak;توضيح;to explain;解释 (jiěshì);false;;v;",
  "kabul etmek;قبول;to accept;接受 (jiēshòu);true;قبول;v;",
  "reddetmek;رفض;to reject;拒绝 (jùjué);true;رفض;v;",
  "önermek;اقتراح;to suggest;建议 (jiànyì);false;;v;",
  "eleştirmek;انتقاد;to criticize;批评 (pīpíng);false;;v;",
  "yönetmek;إدارة;to manage / rule;管理 (guǎnlǐ);false;;v;",
  "planlamak;تخطيط;to plan;计划 (jìhuà);false;;v;",
  "geliştirmek;تطوير;to develop;提升 (tíshēng);false;;v;",
  "etkilemek;تأثير;to affect / impress;影响 (yǐngxiǎng);false;;v;",
  "katılmak;انضمام;to join / participate;参加 (cānjiā);false;;v;",
  "paylaşmak;مشاركة;to share;分享 (fēnxiǎng);false;;v;",
  # B2 Adjectives
  "karmaşık;معقد;complex;复杂 (fùzá);false;;a;",
  "basit;بسيط;simple;简单 (jiǎndān);true;بسيط;a;",
  "önemli;مهم;important;重要 (zhòngyào);false;;a;",
  "gerekli;ضروري;necessary;必要 (bìyào);false;;a;",
  "mümkün;ممكن;possible;可能 (kěnéng);true;ممكن;a;",
  "imkansız;مستحيل;impossible;不可能 (bù kěnéng);false;;a;",
  "resmi;رسمي;official;正式 (zhèngshì);true;رسمي;a;",
  "samimi;حميم;sincere / warm;真诚 (zhēnchén);true;ميم;a;",
  "kesin;مؤكد;definite;确定 (quèdìng);false;;a;"
]

c1_raw = [
  # Formal & Literary
  "saray;قصر;palace;宫殿 (gōngdiàn);false;;n;;",
  "imparatorluk;إمبراطورية;empire;帝国 (dìguó);false;;n;;",
  "medeniyet;حضارة;civilization;文明 (wénmíng);true;مدنية;n;;",
  "ferman;مرسوم;decree;法令 (fǎlìng);true;فرمان;n;;",
  "yüzyıl;قرن;century;世纪 (shìjì);false;;n;;",
  "anayasa;دستور;constitution;宪法 (xiànfǎ);false;;n;;",
  "demokrasi;ديمقراطية;democracy;民主 (mínzhǔ);false;;n;lik",
  "cumhuriyet;جمهورية;republic;共和国 (gònghéguó);true;جمهورية;n;çilik",
  "bağımsızlık;استقلال;independence;独立 (dúlì);false;;n;;",
  "egemenlik;سيادة;sovereignty;主权 (zhǔquán);false;;n;;",
  # Philosophy & Ethics
  "ahlak;أخلاق;morals / ethics;道德 (dàodé);true;أخلاق;n;lı,sız,sal",
  "vicdan;وجدان;conscience;良心 (liángxīn);true;وجدان;n;lı,sız",
  "erdem;فضيلة;virtue;美德 (měidé);false;;n;li,siz",
  "şeref;شرف;honor;荣誉 (róngyù);true;شرف;n;li,siz",
  "namus;شرف / عفة;honor / integrity;尊严 (zūnyán);true;ناموس;n;lu,suz",
  "merhamet;رحمة;mercy;慈悲 (cíbēi);true;مرحمة;n;li,siz",
  "hikmet;حكمة;wisdom;智慧 (zhìhuì);true;حكمة;n;li",
  "ilham;إلهام;inspiration;灵感 (línggǎn);true;إلهام;n;lı",
  # Advanced Society & Science
  "diplomasi;دبلوماسية;diplomacy;外交 (wàijiāo);false;;n;lik",
  "bürokrasi;بيروقراطية;bureaucracy;官僚 (guānliáo);false;;n;lik",
  "yolsuzluk;فساد;corruption;腐败 (fǔbài);false;;n;;",
  "reform;إصلاح;reform;改革 (gǎigé);false;;n;cu",
  "strateji;إستراتيجية;strategy;战略 (zhànlüè);true;إستراتيجية;n;lik",
  "bilim;علم;science;科学 (kēxué);false;;n;ci,sel",
  "deney;تجربة;experiment;实验 (shíyàn);false;;n;sel,lik",
  "kuram;نظرية;theory;理论 (lǐlùn);false;;n;sal",
  "analiz;تحليل;analysis;分析 (fēnxī);true;تحليل;n;ci",
  "sentez;تركيب;synthesis;综合 (zōnghé);true;تركيب;n;;",
  "istatistik;إحصاء;statistics;统计 (tǒngjì);true;إحصاء;n;çi,sel",
  # C1 Verbs
  "savunmak;دفاع;to defend;防守 (fángshǒu);false;;v;",
  "yargılamak;محاكمة;to judge;审判 (shěnpàn);false;;v;",
  "öngörmek;توقع;to foresee;预见 (yùjiàn);false;;v;",
  "dönüştürmek;تحويل;to transform;转变 (zhuǎnbiàn);false;;v;",
  "kanıtlamak;إثبات;to prove;证明 (zhèngmíng);false;;v;",
  "uygulamak;تطبيق;to implement;应用 (yìngyòng);false;;v;",
  "sürdürmek;إدامة;to sustain / maintain;维持 (wéichí);false;;v;",
  "pekiştirmek;تعزيز;to reinforce;巩固 (gǒnggù);false;;v;",
  "çözümlemek;تحليل;to analyze / resolve;解析 (jiěxī);false;;v;",
  # C1 Adjectives
  "kapsamlı;شamal;comprehensive;全面 (quánmiàn);false;;a;",
  "sürdürülebilir;مستدام;sustainable;可持续 (kěchíxù);false;;a;",
  "somut;ملموس;concrete;具体 (jùtǐ);false;;a;",
  "soyut;مجرد;abstract;抽象 (chōuxiàng);false;;a;",
  "özgün;أصيل;original;独创 (dúchuàng);false;;a;",
  "çağdaş;معاصر;contemporary;现代 (xiàndài);false;;a;",
  "evrensel;عالمي;universal;宇宙 / 全球 (yǔzhòu / quánqiú);false;;a;"
]

# Secondary Roots to ensure we reach over 5,000 unique words
# Grouped under Level 3 and 4 to expand vocab banks naturally
filler_nouns = [
  "kalemtıraş;مبراة;pencil sharpener;卷笔刀;false;;n;",
  "silgi;ممحاة;eraser;橡皮擦;false;;n;lik",
  "cetvel;مسطرة;ruler;直尺;true;مسطرة;n;",
  "harita;خريطة;map;地图;true;خريطة;n;",
  "kâğıt;ورق;paper;纸;true;كاغد;n;lık",
  "makas;مقص;scissors;剪刀;true;مقص;n;",
  "yapıştırıcı;صمغ;glue;胶水;false;;n;",
  "boya;طلاء;paint;颜料;false;;n;cı,lı,sız,lık",
  "sözlük;قاموس;dictionary;词典;false;;n;lük",
  "kütüphane;مكتبة;library;图书馆;false;;n;",
  "müze;متحف;museum;博物馆;true;متحف;n;",
  "tiyatro;مسرح;theater;剧院;false;;n;cu",
  "sinema;سينما;cinema;电影院;false;;n;ci",
  "eczane;صيدلية;pharmacy;药店;true;اجزا;n;lik",
  "postane;بريد;post office;邮局;true;بوستة;n;",
  "banka;بنك;bank;银行;true;بنك;n;cı,lık",
  "durak;موقف;bus stop;车站;false;;n;",
  "liman;ميناء;port / harbor;港口;false;;n;",
  "istasyon;محطة;station;火车站;false;;n;",
  "bilet;تذكرة;ticket;票;false;;n;çi,li,siz",
  "pasaport;جواز سفر;passport;护照;false;;n;lı,sız",
  "gümrük;جمارك;customs;海关;true;كمرك;n;çü",
  "otel;فندق;hotel;酒店;false;;n;ci",
  "rezervasyon;حجز;reservation;预订;false;;n;lu,suz",
  "lokanta;مطعم;restaurant;餐馆;false;;n;",
  "garson;نادل;waiter;服务员;false;;n;luk",
  "aşçı;طباخ;cook;厨师;false;;n;lık",
  "menü;قائمة الطعام;menu;菜单;false;;n;",
  "fatura;فاتورة;bill;发票;true;فاتورة;n;lı,sız",
  "bahşiş;بخشيش;tip;小费;true;بخشيش;n;li,siz",
  "kahvaltı;فطور;breakfast;早餐;false;;n;lı,sız",
  "öğle yemeği;غداء;lunch;午餐;false;;n;",
  "akşam yemeği;عشاء;dinner;晚餐;false;;n;",
  "tatlı;حلويات;dessert;甜点;false;;n;ci,lik",
  "meyve suyu;عصير;juice;果汁;false;;n;",
  "bardak;كوب;glass;杯子;false;;n;lık",
  "tabak;طبق;plate;盘子;true;طبق;n;lık",
  "kaşık;ملعقة;spoon;勺子;false;;n;lık",
  "çatal;شوكة;fork;叉子;false;;n;lık",
  "bıçak;سكين;knife;刀;false;;n;lık",
  "tencere;طنجرة;pot;锅;false;;n;",
  "tava;مقلاة;pan;平底锅;false;;n;lık",
  "yastık;وسادة;pillow;枕头;false;;n;lık",
  "çarşaf;شرشف;sheet;床单;true;شرشف;n;lı,sız",
  "battaniye;بطانية;blanket;毯子;true;بطانية;n;lı",
  "klima;مكيف;air conditioner;空调;false;;n;lı",
  "saat;ساعة;clock;钟表;true;ساعة;n;çi,li,siz",
  "takvim;تقويم;calendar;日历;true;تقويم;n;li",
  "kulaklık;سماعات;headphones;耳机;false;;n;lı",
  "şarj aleti;شاحن;charger;充电器;false;;n;",
  "pil;بطارية;battery;电池;false;;n;li,siz",
  "kamera;كاميرا;camera;相机;false;;n;cı,lık",
  "fotoğraf;صورة;photo;照片;true;فوتوغراف;n;çı,lık",
  "dosya;ملف;file;文件;true;ملف;n;leme",
  "evrak;أوراق;document;公文;true;أوراق;n;",
  "kutu;صندوق;box;盒子;false;;n;lu,suz,luk",
  "torba;كيس;bag;袋子;false;;n;lı",
  "sepet;سلة;basket;篮子;false;;n;lik",
  "çekiç;مطرقة;hammer;锤子;false;;n;lik",
  "tornavida;مفك;screwdriver;螺丝刀;false;;n;",
  "pense;زرادية;pliers;钳子;false;;n;",
  "çivi;مسمار;nail;钉子;false;;n;li,siz,lik",
  "vida;برغي;screw;螺丝;false;;n;lı,sız,lık",
  "fırça;فرشاة;brush;刷子;false;;n;lık",
  "hortum;خرطوم;hose;软管;true;خرطوم;n;lu",
  "kova;دلو;bucket;水桶;false;;n;lık",
  "merdiven;سلم;ladder;梯子;false;;n;li",
  "ip;حبل;rope;绳子;false;;n;lik",
  "tel;سلك;wire;金属丝;false;;n;li,siz,lik",
  "zincir;سلسلة;chain;链条;false;;n;li,lik"
]

filler_verbs = [
  "bulmak;إيجاد;to find;找到;false;;v;",
  "kaybetmek;فقد;to lose;丢失;false;;v;",
  "aramak;بحث;to search;寻找;false;;v;",
  "sormak;سؤال;to ask;询问;false;;v;",
  "cevaplamak;إجابة;to answer;回答;true;جواب;v;",
  "anlatmak;شرح;to explain;叙述;false;;v;",
  "öğrenmek;تعلم;to learn;学习;false;;v;",
  "öğretmek;تعليم;to teach;教授;false;;v;",
  "ezberlemek;حفظ;to memorize;背诵;false;;v;",
  "hatırlamak;تذكر;to remember;记得;false;;v;",
  "unutmak;نسيان;to forget;忘记;false;;v;",
  "istemek;طلب;to request / want;想要;false;;v;",
  "beklemek;انتظار;to wait;等待;false;;v;",
  "hazırlamak;تجهيز;to prepare;准备;false;;v;",
  "başlamak;بدء;to start;开始;false;;v;",
  "bitirmek;إنهاء;to finish;结束;false;;v;",
  "devam etmek;متابعة;to continue;继续;true;متابعة;v;",
  "durmak;توقف;to stop;停止;false;;v;",
  "çalışmak;عمل;to work;工作;false;;v;",
  "dinlenmek;راحة;to rest;休息;false;;v;",
  "tatil yapmak;عطلة;to holiday;度假;true;تعطيل;v;",
  "seyahat etmek;سفر;to travel;旅行;true;سياحة;v;",
  "uçmak;طيران;to fly;飞;false;;v;",
  "sürmek;قيادة;to drive;驾驶;false;;v;",
  "binmek;ركوب;to ride;骑;false;;v;",
  "inmek;نزول;to get off;下车;false;;v;",
  "yürümek;مشي;to walk;步行;false;;v;",
  "koşmak;ركض;to run;跑;false;;v;",
  "yüzmek;سباحة;to swim;游泳;false;;v;",
  "oynamak;لعب;to play;玩;false;;v;",
  "gülmek;ضحك;to laugh;笑;false;;v;",
  "ağlamak;بكاء;to cry;哭;false;;v;",
  "şarkı söylemek;غناء;to sing;唱歌;false;;v;",
  "dans etmek;رقص;to dance;跳舞;false;;v;",
  "resim yapmak;رسم;to paint;绘画;true;رسم;v;",
  "fotoğraf çekmek;تصوير;to photograph;拍照;true;تصوير;v;",
  "izlemek;مشاهدة;to watch;观看;false;;v;",
  "dinlemek;استماع;to listen;听;false;;v;",
  "okumak;قراءة;to read;阅读;false;;v;",
  "yazmak;كتابة;to write;写;false;;v;",
  "çizmek;رسم خط;to draw;画线;false;;v;",
  "kesmek;قص;to cut;剪;false;;v;",
  "yapıştırmak;لصق;to glue;粘贴;false;;v;",
  "katlamak;طوي;to fold;折叠;false;;v;",
  "açmak;فتح;to open;打开;false;;v;",
  "kapatmak;إغلاق;to close;关闭;false;;v;",
  "kilitlemek;قفل;to lock;锁上;false;;v;",
  "temizlemek;تنظيف;to clean;清洁;true;تمسح;v;",
  "yıkamak;غسيل;to wash;洗;false;;v;",
  "ütülemek;كي;to iron;熨烫;false;;v;",
  "yemek pişirmek;طبخ;to cook;做饭;false;;v"
]

# Merge arrays with balanced levels
a1_roots = a1_raw
a2_roots = a2_raw
b1_roots = b1_raw + filler_nouns[:30] + filler_verbs[:15]
b2_roots = b2_raw + filler_nouns[30:60] + filler_verbs[15:30]
c1_roots = c1_raw + filler_nouns[60:] + filler_verbs[30:]

# ═══════════════════════════════════════════════════════════════
# CONTEXTUAL AND NATURAL SENTENCE DEFINITIONS (NO "Bu çok merhaba")
# ═══════════════════════════════════════════════════════════════

custom_sentences = {
  # Greetings & Basics
  "merhaba": (
    "Merhaba, bugün nasılsınız?",
    "مرحباً، كيف حالك اليوم؟",
    "Hello, how are you today?",
    "你好，你今天怎么样？"
  ),
  "selam": (
    "Selam, nasılsın?",
    "سلام، كيف حالك؟",
    "Hi, how are you?",
    "嗨，你好吗？"
  ),
  "günaydın": (
    "Günaydın, iyi sabahlar!",
    "صباح الخير، أتمنى لك صباحاً سعيداً!",
    "Good morning, have a nice morning!",
    "早上好，祝你有个美好的早晨！"
  ),
  "iyi akşamlar": (
    "İyi akşamlar, nasılsınız?",
    "مساء الخير، كيف حالكم؟",
    "Good evening, how are you?",
    "晚上好，你怎么样？"
  ),
  "iyi geceler": (
    "İyi geceler, tatlı rüyalar!",
    "ليلة سعيدة، أحلام سعيدة!",
    "Good night, sweet dreams!",
    "晚安，好梦！"
  ),
  "hoş geldiniz": (
    "Hoş geldiniz, nasılsınız?",
    "أهلاً وسهلاً، كيف حالكم؟",
    "Welcome, how are you?",
    "欢迎，你好吗？"
  ),
  "güle güle": (
    "Güle güle, kendinize iyi bakın.",
    "مع السلامة، انتبه لنفسك.",
    "Goodbye, take good care of yourself.",
    "再见，保重。"
  ),
  "lütfen": (
    "Lütfen bana bu konuda yardım edin.",
    "الرجاء مساعدتي في هذا الموضوع.",
    "Please help me with this subject.",
    "请在这件事上帮帮我。"
  ),
  "teşekkürler": (
    "Yardımınız için çok teşekkürler.",
    "شكراً جزيلاً على مساعدتك.",
    "Thank you very much for your help.",
    "非常感谢你的帮助。"
  ),
  "evet": (
    "Evet, bu karar çok doğrudur.",
    "نعم، هذا القرار صحيح جداً.",
    "Yes, this decision is very correct.",
    "是的，这个决定非常正确。"
  ),
  "hayır": (
    "Hayır, ben bu fikre katılmıyorum.",
    "لا، أنا لا أتفق مع هذه الفكرة.",
    "No, I do not agree with this idea.",
    "不，我不同意这个想法。"
  ),
  "tamam": (
    "Tamam, yarın orada olacağım.",
    "تمام، سأكون هناك غداً.",
    "Okay, I will be there tomorrow.",
    "好的，我明天会去那儿。"
  ),
  "affedersiniz": (
    "Affedersiniz, saat kaç acaba?",
    "عفواً، كم الساعة لو سمحت؟",
    "Excuse me, what time is it?",
    "请问，现在几点了？"
  ),
  "nasılsınız": (
    "Merhaba nasılsınız, iyi misiniz?",
    "مرحباً كيف حالكم، هل أنتم بخير؟",
    "Hello how are you, are you fine?",
    "你好，你好吗，你还好吗？"
  ),
  "iyiyim": (
    "Ben çok iyiyim, siz nasılsınız?",
    "أنا بخير جداً، كيف حالكم أنتم؟",
    "I am very fine, how are you?",
    "我很好，你呢？"
  ),
  "hoşça kal": (
    "Hoşça kal arkadaşım, yakında görüşürüz.",
    "ابقَ بخير يا صديقي، نلتقي قريباً.",
    "Goodbye my friend, see you soon.",
    "再见我的朋友，回头见。"
  ),
  "rica ederim": (
    "Rica ederim, her zaman yardımcı olurum.",
    "على الرحب والسعة، يسعدني تقديم المساعدة دائماً.",
    "You are welcome, I am always happy to help.",
    "不客气，我很乐意提供帮助。"
  ),
  "ben": (
    "Ben yarın Türkçe dersine başlayacağım.",
    "أنا سأبدأ درس اللغة التركية غداً.",
    "I will start Turkish class tomorrow.",
    "我明天要开始上土耳其语课了。"
  ),
  "sen": (
    "Sen bu akşam bizimle gelecek misin?",
    "هل ستأتي معنا هذا المساء؟",
    "Will you come with us this evening?",
    "你今天晚上跟我们一起去吗？"
  ),
  "o": (
    "O, okulda çok başarılı bir öğrencidir.",
    "هو طالب ناجح جداً في المدرسة.",
    "He/She is a very successful student at school.",
    "他/她是个在学校成绩非常优秀的学生。"
  ),
  "biz": (
    "Biz bu bahçede çiçek yetiştiriyoruz.",
    "نحن نزرع الزهور في هذه الحديقة.",
    "We are growing flowers in this garden.",
    "我们在花园里种花。"
  ),
  "siz": (
    "Siz nerede oturuyorsunuz?",
    "أين تسكنون؟",
    "Where do you live?",
    "你们住在哪里？"
  ),
  "onlar": (
    "Onlar Türkçe konuşmayı çok seviyorlar.",
    "هم يحبون التحدث باللغة التركية كثيراً.",
    "They love speaking Turkish very much.",
    "他们非常喜欢说土耳其语。"
  ),
  "bu": (
    "Bu kitap bana çok yardımcı oldu.",
    "هذا الكتاب ساعدني كثيراً.",
    "This book helped me a lot.",
    "这本书帮了我很多忙。"
  ),
  "şu": (
    "Şu kalem senin mi?",
    "هل هذا القلم لك؟",
    "Is that pen yours?",
    "那支笔是你的吗？"
  )
}

numbers_tr = ["bir", "iki", "üç", "dört", "beş", "altı", "yedi", "sekiz", "dokuz", "on", "yirmi", "otuz", "kırk", "elli", "altmış", "yetmiş", "seksen", "doksan", "yüz", "bin"]

def get_number_sentence(num, ar, en, zh):
  return (
    f"Kütüphanede {num} yeni kitap buldum.",
    f"وجدت {ar} كتب جديدة في المكتبة.",
    f"I found {en} new books in the library.",
    f"我在图书馆里找到了{zh.split(' ')[0]}本新书。"
  )

def get_adjective_sentence(adj, ar, en, zh):
  return (
    f"Bu metinde {adj} bir örnek üzerinde çalıştık.",
    f"عملنا في هذا النص على مثال {ar}.",
    f"In this text, we worked on a {en} example.",
    f"我们在这篇课文中学习了一个{zh.split(' ')[0]}的例子。"
  )

noun_sentences_tr = [
  "Derste {} kavramını örneklerle inceledik.",
  "Bu metinde {} konusu açık ve anlaşılır biçimde anlatılıyor.",
  "Öğretmen, {} hakkında kısa ve yararlı bir açıklama yaptı."
]
noun_sentences_ar = [
  "درسنا مفهوم {} بالأمثلة في الدرس.",
  "يشرح هذا النص موضوع {} بطريقة واضحة ومفهومة.",
  "قدّم المعلم شرحاً قصيراً ومفيداً عن {}."
]
noun_sentences_en = [
  "In class, we examined the concept of {} with examples.",
  "This text explains the topic of {} clearly and understandably.",
  "The teacher gave a short and useful explanation about {}."
]
noun_sentences_zh = [
  "我们在课上用例子学习了{}这个概念。",
  "这篇课文清楚易懂地解释了{}这个主题。",
  "老师对{}做了简短而有用的说明。"
]

verb_sentences_tr = [
  "Öğrenciler bugün sınıfta {} alıştırması yaptı.",
  "Bu görevi tamamlamak için önce plan yapmak gerekir.",
  "Öğretmen, {} fiilini gerçek bir bağlam içinde açıkladı."
]
verb_sentences_ar = [
  "تدرّب الطلاب اليوم في الصف على {}.",
  "لإكمال هذه المهمة، يجب إعداد خطة أولاً.",
  "شرح المعلم فعل {} ضمن سياق حقيقي."
]
verb_sentences_en = [
  "The students practiced {} in class today.",
  "To complete this task, it is necessary to make a plan first.",
  "The teacher explained the verb {} in a real context."
]
verb_sentences_zh = [
  "学生们今天在课堂上练习了{}。",
  "要完成这项任务，首先需要制定计划。",
  "老师在真实语境中解释了{}这个动词。"
]

all_level_groups = [
  (1, "A1 Başlangıç", a1_roots),
  (2, "A2 Günlük Yaşam", a2_roots),
  (3, "B1 İletişim", b1_roots),
  (4, "B2 İfadeler", b2_roots),
  (5, "C1 Akıcılık", c1_roots),
]

def build_source_theme_map():
  """Read the source root arrays and remember the human-authored section for each root word."""
  theme_map = {}
  current_theme = None
  in_roots = False
  array_names = {"a1_raw", "a2_raw", "b1_raw", "b2_raw", "c1_raw", "filler_nouns", "filler_verbs"}
  try:
    with open(__file__, "r", encoding="utf-8") as src:
      for raw_line in src:
        line = raw_line.strip()
        if any(line.startswith(f"{name} = [") for name in array_names):
          in_roots = True
          current_theme = None
          continue
        if in_roots and line.startswith("]"):
          in_roots = False
          current_theme = None
          continue
        if not in_roots:
          continue
        if line.startswith("#"):
          current_theme = line.lstrip("#").strip()
          continue
        if line.startswith('"'):
          root = line.split(';', 1)[0].strip().strip('",')
          if root and current_theme:
            theme_map[root] = current_theme
  except Exception:
    return {}
  return theme_map

source_theme_map = build_source_theme_map()

expanded_vocab = []

for level_num, category, roots in all_level_groups:
  for idx, item in enumerate(roots):
    parts = item.split(";")
    tr_root = parts[0]
    ar_root = parts[1]
    en_root = parts[2]
    zh_root = parts[3]
    is_cog = parts[4] == "true"
    cog_root = parts[5] if len(parts) > 5 else ""
    word_type = parts[6] if len(parts) > 6 else "n"
    
    # Parse allowed derived suffixes whitelisted for this noun
    allowed_derived = []
    if len(parts) > 7 and parts[7].strip():
      allowed_derived = [s.strip() for s in parts[7].split(",")]

    # --- SENSICAL CONTEXTUAL SENTENCE SETUP ---
    if tr_root in custom_sentences:
      # Use manual hand-crafted realistic sentences
      s_tr, s_ar, s_en, s_zh = custom_sentences[tr_root]
    elif tr_root in numbers_tr:
      # Use dynamic number sentence
      s_tr, s_ar, s_en, s_zh = get_number_sentence(tr_root, ar_root, en_root, zh_root)
    elif word_type == "a":
      # Use dynamic adjective sentence
      s_tr, s_ar, s_en, s_zh = get_adjective_sentence(tr_root, ar_root, en_root, zh_root)
    elif word_type == "v":
      vi = idx % len(verb_sentences_tr)
      s_tr = verb_sentences_tr[vi].format(tr_root)
      s_ar = verb_sentences_ar[vi].format(ar_root)
      s_en = verb_sentences_en[vi].format(en_root)
      s_zh = verb_sentences_zh[vi].format(zh_root)
    else:
      si = idx % len(noun_sentences_tr)
      s_tr = noun_sentences_tr[si].format(tr_root)
      s_ar = noun_sentences_ar[si].format(ar_root)
      s_en = noun_sentences_en[si].format(en_root)
      s_zh = noun_sentences_zh[si].format(zh_root)

    expanded_vocab.append({
      "word": tr_root,
      "pronunciation": tr_root,
      "translation_ar": ar_root,
      "translation_en": en_root,
      "translation_zh": zh_root,
      "isCognate": is_cog,
      "arabicRoot": cog_root,
      "sentence": s_tr,
      "sentence_ar": s_ar,
      "sentence_en": s_en,
      "sentence_zh": s_zh,
      "level": level_num,
      "category": category,
      "theme": source_theme_map.get(tr_root, category),
      "wordType": word_type
    })

unique_vocab = list({item["word"]: item for item in expanded_vocab}.values())

# ═══════════════════════════════════════════════════════════════
# GRAMMAR ENGINE FUNCTIONS
# ═══════════════════════════════════════════════════════════════

vowels = "aeıioöuü"
vowels_back = "aıou"
vowels_front = "eiöü"

vowel_drops = {
  "burun": "burn",
  "ağız": "ağz",
  "akıl": "akl",
  "fikir": "fikr",
  "sabır": "sabr",
  "şehir": "şehr",
  "isim": "ism",
  "vakit": "vakt",
  "resim": "resm"
}

def get_last_vowel(word):
  clean = word.replace(" ", "").lower()
  for char in reversed(clean):
    if char in vowels:
      return char
  return 'e'

def apply_vowel_drop(word):
  w = word.lower().strip()
  if w in vowel_drops:
    return vowel_drops[w]
  return word

def soften_consonant(word):
  if not word or len(word) <= 3:
    return word
  last_char = word[-1].lower()
  if last_char == 'p':
    return word[:-1] + 'b'
  elif last_char == 'ç':
    return word[:-1] + 'c'
  elif last_char == 't':
    return word[:-1] + 'd'
  elif last_char == 'k':
    return word[:-1] + 'ğ'
  return word

def is_hard_consonant(char):
  return char.lower() in "fşstkçhp"

# ═════════════════════════════════════
# NOUN SUFFIXES (14 Forms)
# ═════════════════════════════════════

def plural(w):
  last = get_last_vowel(w)
  return w + ("lar" if last in vowels_back else "ler")

def possessive(w):
  last_char = w[-1].lower()
  last_vowel = get_last_vowel(w)
  
  if last_char in vowels:
    return w + "m"
    
  dropped = apply_vowel_drop(w)
  softened = soften_consonant(dropped)
  
  if last_vowel in "aı": return softened + "ım"
  elif last_vowel in "ei": return softened + "im"
  elif last_vowel in "ou": return softened + "um"
  return softened + "üm"

def locative(w):
  last_char = w[-1].lower()
  last_vowel = get_last_vowel(w)
  d_t = "t" if is_hard_consonant(last_char) else "d"
  a_e = "a" if last_vowel in vowels_back else "e"
  return w + d_t + a_e

def dative(w):
  last_char # Re-map vocabulary subsets to lessons by semantic source section.
# This keeps every lesson title aligned with the words/cards shown in that lesson.
theme_to_lesson = {
  # A1
  "Greetings & Basics": "l1_1", "Pronouns": "l1_1",
  "Numbers": "l1_2",
  "Colors": "l1_3", "Basic Adjectives": "l1_3",
  "Family": "l1_4",
  "Body": "l1_5",
  "Basic Objects": "l1_7",
  "Basic Verbs": "l1_10",
  # A2
  "A2 Verbs": "l2_1",
  "Home & Daily Life": "l2_2",
  "Weather": "l2_3",
  "Education": "l2_4",
  "Professions": "l2_5",
  "Health": "l2_6",
  "Nature & Animals": "l2_7",
  "Feelings & Emotions": "l2_9",
  "Transport & Places": "l2_10",
  "Food & Drinks": "l1_8",
  "Shopping & Commerce": "l1_9",
  "Clothes": "l1_9",
  # B1
  "Media & Technology": "l3_1",
  "B1 Verbs": "l3_2",
  "Society & Government": "l3_3",
  "Business & Economy": "l3_5",
  "Abstract Concepts": "l3_6",
  # B2
  "B2 Verbs": "l4_1",
  "B2 Adjectives": "l4_2",
  "Philosophy & Ethics": "l4_3",
  "Formal & Literary": "l4_4",
  "Advanced Society & Science": "l4_5",
  # C1
  "C1 Verbs": "l5_1",
  "C1 Adjectives": "l5_2",
}

fallback_lessons = {1: "l1_10", 2: "l2_10", 3: "l3_6", 4: "l4_5", 5: "l5_4"}
lesson_vocab_map = {f"l{lvl}_{i}": [] for lvl in range(1, 6) for i in range(1, 11)}
for w in unique_vocab:
  lesson_id = theme_to_lesson.get(w.get("theme"), fallback_lessons[w["level"]])
  lesson_vocab_map[lesson_id].append(w)


# Hand-curated supplemental cards for lessons whose topic is narrower than the root pools.
def supplemental(word, ar, en, level, theme, word_type="n"):
  return {
    "word": word, "pronunciation": word, "translation_ar": ar, "translation_en": en, "translation_zh": en,
    "isCognate": False, "arabicRoot": "",
    "sentence": f"Bu derste {word} kelimesini doğru bağlamda kullanıyoruz.",
    "sentence_ar": f"نستخدم كلمة {ar} في سياقها الصحيح في هذا الدرس.",
    "sentence_en": f"In this lesson, we use {en} in the correct context.",
    "sentence_zh": f"本课在正确语境中使用 {en}。",
    "level": level, "category": f"{level}. seviye", "theme": theme, "wordType": word_type
  }

supplemental_by_lesson = {
  "l1_6": [("yirmi", "عشرون", "twenty"), ("otuz", "ثلاثون", "thirty"), ("kırk", "أربعون", "forty"), ("elli", "خمسون", "fifty"), ("saat", "ساعة", "hour/clock"), ("gün", "يوم", "day"), ("hafta", "أسبوع", "week"), ("ay", "شهر", "month"), ("yıl", "سنة", "year")],
  "l2_8": [("kedi", "قط", "cat"), ("köpek", "كلب", "dog"), ("kuş", "طائر", "bird"), ("balık", "سمكة", "fish"), ("at", "حصان", "horse"), ("inek", "بقرة", "cow"), ("aslan", "أسد", "lion"), ("arı", "نحلة", "bee")],
  "l3_4": [("bilgisayar", "حاسوب", "computer"), ("yazılım", "برمجيات", "software"), ("donanım", "عتاد", "hardware"), ("klavye", "لوحة مفاتيح", "keyboard"), ("ekran", "شاشة", "screen"), ("internet", "إنترنت", "internet"), ("veri", "بيانات", "data"), ("şifre", "كلمة مرور", "password")],
  "l3_6": [("özgürlük", "حرية", "freedom"), ("adalet", "عدالة", "justice"), ("gerçek", "حقيقة", "truth"), ("güzellik", "جمال", "beauty"), ("fikir", "فكرة", "idea"), ("anlam", "معنى", "meaning"), ("değer", "قيمة", "value"), ("zaman", "زمن", "time")],
  "l3_7": [("seyahat", "سفر", "travel"), ("bilet", "تذكرة", "ticket"), ("pasaport", "جواز سفر", "passport"), ("valiz", "حقيبة سفر", "suitcase"), ("otel", "فندق", "hotel"), ("harita", "خريطة", "map"), ("rota", "مسار", "route"), ("macera", "مغامرة", "adventure")],
  "l3_8": [("kültür", "ثقافة", "culture"), ("sanat", "فن", "art"), ("müzik", "موسيقى", "music"), ("tiyatro", "مسرح", "theater"), ("resim", "لوحة", "painting"), ("heykel", "تمثال", "sculpture"), ("müze", "متحف", "museum"), ("gelenek", "تقليد", "tradition")],
  "l3_9": [("hobi", "هواية", "hobby"), ("oyun", "لعبة", "game"), ("spor", "رياضة", "sport"), ("yüzme", "سباحة", "swimming"), ("okuma", "قراءة", "reading"), ("sinema", "سينما", "cinema"), ("eğlence", "تسلية", "entertainment"), ("dinlenme", "راحة", "rest")],
  "l3_10": [("banka", "مصرف", "bank"), ("hizmet", "خدمة", "service"), ("kargo", "شحن", "cargo"), ("posta", "بريد", "post"), ("berber", "حلاق", "barber"), ("eczane", "صيدلية", "pharmacy"), ("fatura", "فاتورة", "bill"), ("ödeme", "دفع", "payment")],
  "l4_5": [("bilim", "علم", "science"), ("araştırma", "بحث", "research"), ("deney", "تجربة", "experiment"), ("laboratuvar", "مختبر", "laboratory"), ("kuram", "نظرية", "theory"), ("kanıt", "دليل", "evidence"), ("analiz", "تحليل", "analysis"), ("sonuç", "نتيجة", "result")],
  "l4_6": [("yapay zeka", "ذكاء اصطناعي", "artificial intelligence"), ("robot", "روبوت", "robot"), ("uzay", "فضاء", "space"), ("yenilik", "ابتكار", "innovation"), ("gelecek", "مستقبل", "future"), ("enerji", "طاقة", "energy"), ("otomasyon", "أتمتة", "automation"), ("sanal", "افتراضي", "virtual")],
  "l4_7": [("mahkeme", "محكمة", "court"), ("hakim", "قاض", "judge"), ("savcı", "مدع عام", "prosecutor"), ("avukat", "محام", "lawyer"), ("adalet", "عدالة", "justice"), ("suç", "جريمة", "crime"), ("tanık", "شاهد", "witness"), ("dava", "قضية", "case")],
  "l4_8": [("iklim", "مناخ", "climate"), ("kirlilik", "تلوث", "pollution"), ("sürdürülebilirlik", "استدامة", "sustainability"), ("geri dönüşüm", "إعادة تدوير", "recycling"), ("emisyon", "انبعاث", "emission"), ("kuraklık", "جفاف", "drought"), ("orman", "غابة", "forest"), ("çevre", "بيئة", "environment")],
  "l4_9": [("tarih", "تاريخ", "history"), ("miras", "تراث", "heritage"), ("medeniyet", "حضارة", "civilization"), ("imparatorluk", "إمبراطورية", "empire"), ("saray", "قصر", "palace"), ("anıt", "نصب", "monument"), ("belge", "وثيقة", "document"), ("yüzyıl", "قرن", "century")],
  "l4_10": [("deyim", "تعبير اصطلاحي", "idiom"), ("kalıp", "نمط", "phrase pattern"), ("eline sağlık", "سلمت يداك", "bless your hands"), ("kolay gelsin", "سهل الله عملك", "may your work be easy"), ("gözden geçirmek", "يراجع", "to review"), ("aklına gelmek", "يخطر بباله", "to occur to mind"), ("fark etmek", "يلاحظ", "to notice"), ("karar vermek", "يقرر", "to decide")],
  "l5_3": [("atasözü", "مثل", "proverb"), ("mecaz", "مجاز", "metaphor"), ("kinaye", "تورية", "allusion"), ("nüans", "فارق دقيق", "nuance"), ("bağlam", "سياق", "context"), ("üslup", "أسلوب", "style"), ("simgesel", "رمزي", "symbolic"), ("kültürel kod", "رمز ثقافي", "cultural code")],
  "l5_4": [("tez", "أطروحة", "thesis"), ("argüman", "حجة", "argument"), ("alıntı", "اقتباس", "quotation"), ("kaynak", "مصدر", "source"), ("literatür", "أدبيات", "literature"), ("dipnot", "حاشية", "footnote"), ("akademik dil", "لغة أكاديمية", "academic language"), ("sonuç bölümü", "خاتمة", "conclusion section")],
  "l5_5": [("varoluşçuluk", "وجودية", "existentialism"), ("metafizik", "ما وراء الطبيعة", "metaphysics"), ("epistemoloji", "نظرية المعرفة", "epistemology"), ("ontoloji", "علم الوجود", "ontology"), ("determinizm", "حتمية", "determinism"), ("idealizm", "مثالية", "idealism"), ("ampirizm", "تجريبية", "empiricism"), ("rasyonalizm", "عقلانية", "rationalism")],
  "l5_6": [("diplomasi", "دبلوماسية", "diplomacy"), ("egemenlik", "سيادة", "sovereignty"), ("ittifak", "تحالف", "alliance"), ("yaptırım", "عقوبة", "sanction"), ("müzakere", "تفاوض", "negotiation"), ("antlaşma", "معاهدة", "treaty"), ("küreselleşme", "عولمة", "globalization"), ("jeopolitik", "جيوسياسة", "geopolitics")],
  "l5_7": [("edebiyat", "أدب", "literature"), ("şiir", "شعر", "poetry"), ("roman", "رواية", "novel"), ("öykü", "قصة", "story"), ("imge", "صورة شعرية", "image"), ("kafiye", "قافية", "rhyme"), ("anlatıcı", "راوي", "narrator"), ("tema", "موضوع", "theme")],
  "l5_8": [("eleştiri", "نقد", "criticism"), ("estetik", "جماليات", "aesthetics"), ("kompozisyon", "تكوين", "composition"), ("perspektif", "منظور", "perspective"), ("galeri", "معرض", "gallery"), ("performans", "أداء", "performance"), ("akım", "تيار", "movement"), ("yorum", "تفسير", "interpretation")],
  "l5_9": [("metodoloji", "منهجية", "methodology"), ("hipotez", "فرضية", "hypothesis"), ("veri analizi", "تحليل بيانات", "data analysis"), ("örneklem", "عينة", "sample"), ("anket", "استبيان", "survey"), ("deney", "تجربة", "experiment"), ("bulgu", "نتيجة", "finding"), ("kaynakça", "مراجع", "bibliography")],
  "l5_10": [("ince eleyip sık dokumak", "يدقق كثيراً", "to be meticulous"), ("taşları yerine oturtmak", "يوضح الصورة", "to put pieces together"), ("nabza göre şerbet vermek", "يجاري الموقف", "to adapt to the audience"), ("lafı dolandırmak", "يلف ويدور", "to beat around the bush"), ("göz ardı etmek", "يتجاهل", "to ignore"), ("ipin ucunu kaçırmak", "يفقد السيطرة", "to lose control"), ("elini taşın altına koymak", "يتحمل المسؤولية", "to take responsibility"), ("ufuk açmak", "يوسع الأفق", "to broaden horizons")]
}

for lesson_id, rows in supplemental_by_lesson.items():
  lvl = int(lesson_id[1])
  lesson_vocab_map[lesson_id] = [supplemental(*row, lvl, lesson_id) for row in rows]

# Programmatic lesson metadata for the 50 lessons (10 per level)
level_lessons_meta = {
  1: [
    {"title": "Selamlaşma ve Tanışma", "arabic": "التحية والتعارف", "english": "Greetings & Introductions", "summary": "Saying hello, basic pronouns, and polite expressions."},
    {"title": "1-20 Arası Sayılar", "arabic": "الأرقام من 1 إلى 20", "english": "Numbers 1-20", "summary": "Learning first numbers and basic arithmetic."},
    {"title": "Renkler ve Uyum", "arabic": "الألوان والتناسق", "english": "Colors & Harmony", "summary": "Common colors and basic descriptive usage."},
    {"title": "Aile Bireyleri", "arabic": "أفراد العائلة", "english": "Family Members", "summary": "Father, mother, sibling, and relatives."},
    {"title": "Vücudumuz", "arabic": "أعضاء الجسم", "english": "Body Parts", "summary": "Parts of the human body and descriptive adjectives."},
    {"title": "Sayılar 20-100 ve Zaman", "arabic": "الأرقام 20-100 والوقت", "english": "Numbers 20-100 & Time", "summary": "Higher numbers, days, months, and years."},
    {"title": "Evimiz ve Mobilyalar", "arabic": "المنزل والأثاث", "english": "Home & Furnishing", "summary": "Rooms of the house and common furniture items."},
    {"title": "Yiyecek ve İçecekler", "arabic": "الأطعمة والأشربة", "english": "Food & Beverages", "summary": "Fruit, vegetables, meals, and common drinks."},
    {"title": "Giyim ve Alışveriş", "arabic": "الملابس والتسوق", "english": "Clothing & Shopping", "summary": "Clothes, colors, and purchasing basics."},
    {"title": "Ulaşım ve Mekanlar", "arabic": "المواصلات والأماكن", "english": "Transport & Destinations", "summary": "Vehicles, city places, and directional basics."}
  ],
  2: [
    {"title": "A2 Temel Fiiller", "arabic": "الأفعال الأساسية A2", "english": "Everyday Verbs", "summary": "Common actions and present/past expressions."},
    {"title": "Günlük Rutinler", "arabic": "الروتين اليومي", "english": "Daily Routines", "summary": "Waking up, brushing teeth, eating, and sleeping."},
    {"title": "Hava Durumu ve Mevsimler", "arabic": "الطقس والفصول", "english": "Weather & Seasons", "summary": "Describing weather, summer, winter, autumn, spring."},
    {"title": "Okul ve Eğitim", "arabic": "المدرسة والتعليم", "english": "School & Education", "summary": "Classrooms, lessons, subjects, and study habits."},
    {"title": "Meslekler", "arabic": "المهن والوظائف", "english": "Professions", "summary": "Jobs, workplaces, and professional vocabulary."},
    {"title": "Sağlık ve Hastane", "arabic": "الصحة والمستشفى", "english": "Health & Medicine", "summary": "Common illnesses, body parts, and visiting a doctor."},
    {"title": "Doğa ve Çevre", "arabic": "الطبيعة والبيئة", "english": "Nature & Environment", "summary": "Plants, geographical elements, and weather."},
    {"title": "Hayvanlar Alemi", "arabic": "عالم الحيوان", "english": "Animals", "summary": "Pets, wild animals, birds, and insects."},
    {"title": "Duygular ve Ruh Hali", "arabic": "المشاعر والحالة النفسية", "english": "Feelings & Emotions", "summary": "Happy, sad, angry, surprised, and tired."},
    {"title": "Şehir ve Yol Tarifi", "arabic": "المدينة ووصف الطريق", "english": "City & Directions", "summary": "Streets, signs, navigating the city, and giving directions."}
  ],
  3: [
    {"title": "İletişim ve Medya", "arabic": "التواصل ووسائل الإعلام", "english": "Communication & Media", "summary": "News, television, internet, and messaging."},
    {"title": "B1 Temel Fiiller", "arabic": "الأفعال الأساسية B1", "english": "B1 Action Verbs", "summary": "More advanced verbs for daily expression."},
    {"title": "Toplum ve Kurallar", "arabic": "المجتمع والقوانين", "english": "Society & Rules", "summary": "Citizenship, social norms, and basic laws."},
    {"title": "Teknoloji ve Bilgisayar", "arabic": "التكنولوجيا والكمبيوتر", "english": "Technology & Computing", "summary": "Computers, programming, software, and hardware."},
    {"title": "İş Hayatı ve Ekonomi", "arabic": "حياة العمل والاقتصاد", "english": "Business & Finance", "summary": "Jobs, offices, money, currency, and trade."},
    {"title": "Soyut Kavramlar", "arabic": "المفاهيم المجردة", "english": "Abstract Concepts", "summary": "Time, truth, beauty, freedom, and ideas."},
    {"title": "Seyahat ve Macera", "arabic": "السفر والمغامرة", "english": "Travel & Adventure", "summary": "Luggage, tickets, passports, hiking, and exploring."},
    {"title": "Kültür ve Sanat", "arabic": "الثقافة والفن", "english": "Culture & Art", "summary": "Music, theater, paintings, and heritage."},
    {"title": "Hobiler ve Eğlence", "arabic": "الهوايات والتسلية", "english": "Hobbies & Leisure", "summary": "Sports, reading, gaming, and relaxing."},
    {"title": "Alışveriş ve Hizmetler", "arabic": "التسوق والخدمات", "english": "Services & Commerce", "summary": "Post offices, banks, dry cleaners, and salons."}
  ],
  4: [
    {"title": "B2 Gelişmiş Fiiller", "arabic": "أفعال متقدمة B2", "english": "Advanced Verbs", "summary": "Formal and complex actions for expression."},
    {"title": "Akademik Sıfatlar", "arabic": "الصفات الأكاديمية", "english": "Academic Adjectives", "summary": "Describing formal, scientific, and technical ideas."},
    {"title": "Felsefe ve Etik", "arabic": "الفلسفة والأخلاق", "english": "Philosophy & Ethics", "summary": "Right and wrong, thoughts, and philosophical terms."},
    {"title": "Resmi ve Edebi Dil", "arabic": "اللغة الرسمية والأدبية", "english": "Formal & Literary", "summary": "Reading novels, high-level essays, and official documents."},
    {"title": "İleri Bilim ve Araştırma", "arabic": "العلوم المتقدمة والبحث", "english": "Advanced Science", "summary": "Physics, chemistry, biology, and research terms."},
    {"title": "Gelecek ve Teknoloji", "arabic": "المستقبل والتكنولوجيا", "english": "Future & Innovation", "summary": "AI, space travel, renewable energy, and future concepts."},
    {"title": "Hukuk ve Adalet", "arabic": "القانون والعدالة", "english": "Law & Justice", "summary": "Courts, trials, rights, and legality."},
    {"title": "Çevre ve Küresel Sorunlar", "arabic": "البيئة والمشاكل العالمية", "english": "Global Issues", "summary": "Climate change, pollution, and sustainability."},
    {"title": "Tarih ve Miras", "arabic": "التاريخ والتراث", "english": "History & Heritage", "summary": "Civilizations, historical events, and cultural legacy."},
    {"title": "Deyimler ve Kalıplar", "arabic": "التعبيرات الاصطلاحية", "english": "Idioms & Phrases", "summary": "Common idiomatic expressions and cultural phrases."}
  ],
  5: [
    {"title": "Profesyonel Fiiller", "arabic": "الأفعال المهنية والأكاديمية", "english": "Professional Verbs", "summary": "Verbs used in professional writing and speeches."},
    {"title": "Üst Düzey Nitelemeler", "arabic": "توصيفات عالية المستوى", "english": "High-Level Adjectives", "summary": "Sophisticated descriptive terms for academic contexts."},
    {"title": "Kültürel ve Deyimsel İfadeler", "arabic": "التعبيرات الثقافية والاصطلاحية", "english": "Cultural & Idiomatic Expressions", "summary": "Deep cultural references and complex idioms."},
    {"title": "Akademik Söylem", "arabic": "الخطاب الأكاديمي", "english": "Academic Discourse", "summary": "Structuring arguments and writing papers."},
    {"title": "Soyut Felsefi Akımlar", "arabic": "التيارات الفلسفية المجردة", "english": "Abstract Philosophy", "summary": "Existentialism, moral theory, and metaphysical concepts."},
    {"title": "Küresel Politika", "arabic": "السياسة العالمية", "english": "Global Politics", "summary": "International relations, diplomacy, and global affairs."},
    {"title": "Edebiyat ve Şiir", "arabic": "الأدب والشعر", "english": "Literature & Poetry", "summary": "Literary analysis, metaphors, and poetry."},
    {"title": "Sanat Eleştirisi", "arabic": "النقد الفني", "english": "Art Criticism", "summary": "Analyzing paintings, theater, and modern art."},
    {"title": "Bilimsel Araştırma Metotları", "arabic": "مناهج البحث العلمي", "english": "Research Methods", "summary": "Methodology, data analysis, and scientific inquiry."},
    {"title": "İleri Düzey Deyimler", "arabic": "التعبيرات الاصطلاحية المتقدمة", "english": "Advanced Idioms", "summary": "Complex metaphorical expressions for near-native fluency."}
  ]
}

# Specific grammar overlays to inject into specific lessons
grammar_overlays = {
  "l1_1": {
    "pronunciationTips": [
      { "letter": "Ç / ç", "sound": "ch as in chair", "arEq": "تـش", "zhEq": "吃 (chī)", "ex": "Çay (Tea - شاي / 茶)" },
      { "letter": "Ğ / ğ", "sound": "silent, elongates vowel", "arEq": "حرف صامت", "zhEq": "不发音", "ex": "Dağ (jabal - جبل / 山)" },
      { "letter": "Ş / ş", "sound": "sh as in shoe", "arEq": "ش", "zhEq": "是 (shì)", "ex": "Şeker (Sugar - سكر / 糖)" },
      { "letter": "I / ı", "sound": "uh sound", "arEq": "كسرة مضخمة", "zhEq": "了 (le)", "ex": "Sıcak (Hot - حarr - حار / 热)" },
      { "letter": "Ö / ö", "sound": "like French eu", "arEq": "لا يوجد", "zhEq": "女 (nǚ) / 约", "ex": "Göz (Eye - عين / 眼睛)" },
      { "letter": "Ü / ü", "sound": "like French u", "arEq": "لا يوجد", "zhEq": "鱼 (yú)", "ex": "Güzel (Beautiful - جميل / 美丽)" }
    ]
  },
  "l1_2": {
    "grammar": {
      "title": "Çoğul Eki ve Ünlü Uyumu",
      "arExplanation": "قاعدة الجمع: الحروف الثقيلة (A, I, O, U) تاخذ -lar، والخفيفة (E, İ, Ö, Ü) تأخذ -ler.",
      "enExplanation": "Plural suffix: back vowels take '-lar', front vowels take '-ler'.",
      "zhExplanation": "复数后缀：后元音加 '-lar'，前元音加 '-ler'。例如：kitaplar, evler。",
      "examples": [
        { "root": "Kitap", "suffix": "-lar", "result": "Kitaplar", "meaning": "Books (كتب / 书 [复数])" },
        { "root": "Ev", "suffix": "-ler", "result": "Evler", "meaning": "Houses (بيوت / 房子 [复数])" },
        { "root": "Göz", "suffix": "-ler", "result": "Gözler", "meaning": "Eyes (عيون / 眼睛 [复数])" }
      ]
    },
    "suffixBuilder": {
      "root": ["Kitap", "Ev", "Göz"],
      "suffixes": ["-lar", "-ler"],
      "correctAnswers": {
        "Kitap": "Kitaplar",
        "Ev": "Evler",
        "Göz": "Gözler"
      }
    },
    "quiz": [
      {
        "question": "Select the correct plural form of 'Çocuk' (Child):",
        "options": ["Çocukler", "Çocuklar", "Çocuki", "Çocukdan"],
        "answer": "Çocuklar",
        "hint": "Çocuk ends in back vowel 'u', so it takes '-lar'."
      }
    ]
  },
  "l1_3": {
    "grammar": {
      "title": "Kişi Zamirleri (Personal Pronouns)",
      "arExplanation": "ضمائر الفاعل لا تميز بين المذكر والمؤنث: O تعني هو وهي.",
      "enExplanation": "Pronouns carry no gender distinctions. 'O' corresponds to He, She, and It.",
      "zhExplanation": "人称代词无性别之分。'O'代表他、她、它，如同中文的'他'一样。",
      "table": [
        { "tr": "Ben", "ar": "أنا", "en": "I", "zh": "我" },
        { "tr": "Sen", "ar": "أنت / أنتِ", "en": "You", "zh": "你" },
        { "tr": "O", "ar": "هو / هي / هو لغير العاقل", "en": "He / She / It", "zh": "他 / 她 / 它" },
        { "tr": "Biz", "ar": "نحن", "en": "We", "zh": "我们" },
        { "tr": "Siz", "ar": "أنتم / حضرتكم", "en": "You (pl/formal)", "zh": "你们 / 您" },
        { "tr": "Onlar", "ar": "هم / هن", "en": "They", "zh": "他们" }
      ]
    }
  },
  "l2_2": {
    "grammar": {
      "title": "İsmin Hâlleri (Noun Cases)",
      "arExplanation": "حالات الاسم: الموقعية (-de = في)، الانتقالية (-den = من)، والتوجيهية (-e = إلى).",
      "enExplanation": "Noun cases: Locative (-de/-da = in/at), Ablative (-den/-dan = from), Dative (-e/-a = to).",
      "zhExplanation": "名词格：在 (-de/da)，从 (-den/dan)，到 (-e/a)。",
      "cases": [
        { "name": "Locative (Bulunma)", "suffix": "-de / -da", "exTr": "Evde", "exAr": "في البيت", "exEn": "At home" },
        { "name": "Ablative (Ayrılma)", "suffix": "-den / -dan", "exTr": "Evden", "exAr": "من البيت", "exEn": "From home" },
        { "name": "Dative (Yönelme)", "suffix": "-e / -a", "exTr": "Eve", "exAr": "إلى البيت", "exEn": "To home" }
      ]
    },
    "suffixBuilder": {
      "root": ["Ev (Locative)", "Okul (Ablative)", "Ev (Dative)"],
      "suffixes": ["-de", "-den", "-dan", "-e", "-a"],
      "correctAnswers": { "Ev (Locative)": "Evde", "Okul (Ablative)": "Okuldan", "Ev (Dative)": "Eve" }
    },
    "quiz": [
      {
        "question": "How do you say 'from the school' (Okul)?",
        "options": ["Okulda", "Okuldan", "Okula", "Okulde"],
        "answer": "Okuldan",
        "hint": "Okul ends in back vowel 'u', so it takes Ablative '-dan' (from)."
      }
    ]
  },
  "l2_3": {
    "grammar": {
      "title": "Şimdiki Zaman (-yor)",
      "arExplanation": "صياغة المضارع المستمر: جذر الفعل + حرف حركي مساعد + yor + ملحق الضمير.",
      "enExplanation": "Present continuous: verb stem + harmony vowel + yor + personal suffix.",
      "zhExplanation": "现在进行时：词干 + 元音 + yor + 人称。",
      "examples": [
        { "root": "Gel-", "suffix": "-iyor-um", "result": "Geliyorum", "meaning": "I am coming (أنا قادم)" }
      ]
    }
  },
  "l3_1": {
    "grammar": {
      "title": "Geçmiş Zaman (-dı / -di / -du / -dü)",
      "arExplanation": "الزمن الماضي: جذر الفعل + dı/di/du/dü + ملحق الفاعل.",
      "enExplanation": "Past tense: verb stem + dı/di/du/dü + personal suffix.",
      "zhExplanation": "过去时：词干 + dı/di/du/dü + 人称。",
      "examples": [
        { "root": "Gel-", "suffix": "-di-m", "result": "Geldim", "meaning": "I came (جئتُ)" }
      ]
    }
  },
  "l4_1": {
    "grammar": {
      "title": "Yeterlilik Fiili (-ebil / -abil)",
      "arExplanation": "فعل الاستطاعة: جذر الفعل + ebil/abil + الزمن + الملحق الشخصي.",
      "enExplanation": "Ability: verb stem + ebil/abil + tense + personal suffix."
    }
  },
  "l5_1": {
    "grammar": {
      "title": "Edilgen Çatı (-ıl / -il / -ul / -ül)",
      "arExplanation": "المبني للمجهول: جذر الفعل + ıl/il/ul/ül + ملحق الزمن.",
      "enExplanation": "Passive voice: verb stem + ıl/il/ul/ül + tense suffix."
    }
  },
  "l5_3": {
    "idioms": [
      { "tr": "Eline sağlık", "ar": "سلمت يداك", "en": "Bless your hands" },
      { "tr": "Başüstüne", "ar": "على راسي", "en": "At your command" }
    ]
  }
}

levels_meta = [
  {"id": 1, "title": "Level A1: Başlangıç ve Tanışma", "subtitle": "Selamlaşma, Kişi Zamirleri", "arabicTitle": "المستوى A1: التعارف والأساسيات الأولى", "description": "Temel selamlaşmalar, kişi zamirleri, sayılar, renkler, aile bireyleri.", "color": "#FFC300"},
  {"id": 2, "title": "Level A2: Günlük Yaşam", "subtitle": "Yiyecekler, Alışveriş, Ulaşım", "arabicTitle": "المستوى A2: الحياة اليومية والتسوق", "description": "Yiyecek ve içecekler, alışveriş terimleri, ulaşım araçları.", "color": "#F2BB05"},
  {"id": 3, "title": "Level B1: Zamanlar ve Bağlam", "subtitle": "Geçmiş Zaman, Gelecek Zaman", "arabicTitle": "المستوى B1: الأزمنة والمهن والتواصل", "description": "Geçmiş zaman, gelecek zaman, meslekler, sağlık.", "color": "#D4AC0D"},
  {"id": 4, "title": "Level B2: Akıcı İfade", "subtitle": "Toplum, Medya, Yeterlilik Fiili", "arabicTitle": "المستوى B2: التعبير بطلاقة", "description": "Devlet, medya, yeterlilik fiili, şart kipi.", "color": "#B7950B"},
  {"id": 5, "title": "Level C1: Akademik Akıcılık", "subtitle": "Kültür, Felsefe, Edilgen Çatı", "arabicTitle": "المستوى C1: الاحتراف اللغوي", "description": "Devlet düzeni, ahlak felsefesi, edilgen fiiller, ortak deyimler.", "color": "#9A7D0A"}
]

levels_definition = []
for lm in levels_meta:
  lvl_id = lm["id"]
  lessons_list = []
  for i in range(10):
    les_id = f"l{lvl_id}_{i+1}"
    meta = level_lessons_meta[lvl_id][i]
    lesson_obj = {
      "id": les_id,
      "title": f"{i+1}. {meta['title']}",
      "arabicTitle": meta["arabic"],
      "englishTitle": meta["english"],
      "summary": meta["summary"],
      "intro": f"Bu derste '{meta['title']}' konusundaki temel kavramları ve cümle yapılarını öğreneceksiniz.",
      "vocabulary": lesson_vocab_map[les_id],
      "quiz": []
    }
    if les_id in grammar_overlays:
      overlay = grammar_overlays[les_id]
      for key in ["pronunciationTips", "grammar", "suffixBuilder", "quiz", "idioms"]:
        if key in overlay:
          lesson_obj[key] = overlay[key]
    lessons_list.append(lesson_obj)
    
  levels_definition.append({
    "id": lvl_id,
    "title": lm["title"],
    "subtitle": lm["subtitle"],
    "arabicTitle": lm["arabicTitle"],
    "description": lm["description"],
    "color": lm["color"],
    "lessons": lessons_list
  })

yusuf_feedback = {
  "welcome": "Hoş geldin Suzi! 🌼 欢迎你！Seninle Türkçe çalışmak çok keyifli olacak. Çince ve Arapça bildiğin için şimdiden çok şanslısın! Tüm kilitleri sırayla açarak B2/C1 düzeyine çıkacağız! 🚀",
  "correct": [
    "Aferin Suzi! Harika bir cevap! 🌟 太棒了！",
    "Süper gidiyorsun Suzi! Papatyalar seninle çiçek açıyor! 🌼",
    "Tam isabet! Yusuf'tan yıldızlı pekiyi aldın! ⭐ 满分！",
    "Aferin Suzi! Çince ve Arapça bilgini çok iyi harmanlıyorsun! 🎯",
    "Mükemmel Suzi! Bir adım daha Türkçe'ye yaklaştın! 🌸"
  ],
  "wrong": [
    "Hiç sorun değil Suzi, tekrar deneyelim! 没关系，我们再试一次！🌼",
    "Küçük bir hata, ama öğrenmenin en iyi yolu bu. Hadi bir daha dene! 🌸",
    "Yusuf diyor ki: 'Papatyalar da hemen açmaz, sabırla büyür.' 🌱",
    "Her hata bir öğrenme fırsatı! Tekrar bakalım. 每个错误都是学习的机会！💪"
  ],
  "lessonCompleted": "Tebrikler Suzi! 🏆 Bir dersi başarıyla tamamladın! Yusuf seninle gurur duyuyor!",
  "levelCompleted": "Muhteşem bir başarı! 🎉 Seviye tamamlandı! Bir sonraki seviyenin kilidi açıldı! 🌼🥳"
}

# ═══════════════════════════════════════════════════════════════
# WRITE DATABASE FILE
# ═══════════════════════════════════════════════════════════════

output_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "database.js")
with open(output_path, "w", encoding="utf-8") as f:
  f.write("// Suzi'nin Papatya Bahçesi - Learning Database (CEFR-Aligned)\n")
  f.write(f"// Contains {len(unique_vocab)} authentic Turkish vocabulary items\n\n")

  f.write("const learningDatabase = {\n")

  # Levels
  f.write("  levels: ")
  json.dump(levels_definition, f, ensure_ascii=False, indent=2)
  f.write(",\n\n")

  # Vocabulary Bank
  f.write("  vocabularyBank: ")
  json.dump(unique_vocab, f, ensure_ascii=False, indent=2)
  f.write(",\n\n")

  # Yusuf Feedback
  f.write("  yusufFeedback: ")
  json.dump(yusuf_feedback, f, ensure_ascii=False, indent=2)
  f.write("\n")

  f.write("};\n")

print(f"Database written successfully to {output_path}.")
print(f"Total unique vocabulary items: {len(unique_vocab)}")
print(f"Level distribution:")
for lvl in range(1, 6):
  count = len([w for w in unique_vocab if w["level"] == lvl])
  print(f"  Level {lvl}: {count} words")
