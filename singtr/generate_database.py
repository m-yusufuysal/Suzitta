# -*- coding: utf-8 -*-
# generate_database.py
# Compiles a CEFR-aligned Turkish learning database from Level A1 to C1.
# Contains authentic Turkish roots, Arabic cognates, trilingual sentences (TR/EN/AR),
# and 50 structured lessons across 5 CEFR levels (A1, A2, B1, B2, C1).

import json
import os

print("Generating A1-C1 Turkish learning database with authentic words & Arabic cognates...")

# ═══════════════════════════════════════════════════════════════
# ARABIC COGNATES DATASET (Ortak Kelimeler)
# ═══════════════════════════════════════════════════════════════

cognates_dataset = [
    ("kitap", "كِتَاب", "book", "كتب", "Ortak Kelimeler", 1, "Suzim kütüphaneden harika bir kitap aldı.", "Suzim got a great book from the library.", "أخذت سوزي كتاباً رائعاً من المكتبة."),
    ("kalem", "قَلَم", "pen / pencil", "قلم", "Ortak Kelimeler", 1, "Masadaki kırmızı kalemi bana verir misin?", "Could you give me the red pen on the table?", "هل يمكنك إعطائي القلم الأحمر على الطاولة؟"),
    ("defter", "دَفْتَر", "notebook", "دفتر", "Ortak Kelimeler", 1, "Yeni ders notlarımı bu deftere yazıyorum.", "I write my new lesson notes in this notebook.", "أكتب ملاحظات درسي الجديدة في هذا الدفتر."),
    ("saat", "سَاعَة", "hour / clock / watch", "سوع", "Ortak Kelimeler", 1, "Şu an saat tam dokuz.", "It is exactly nine o'clock right now.", "الساعة الآن التاسعة تماماً."),
    ("dünya", "دُنْيَا", "world", "دنو", "Ortak Kelimeler", 1, "Dünya üzerindeki tüm kültürler saygıya değerdir.", "All cultures in the world are worthy of respect.", "جميع الثقافات في العالم تستحق الاحترام."),
    ("insan", "إِنْسَان", "human / person", "أنس", "Ortak Kelimeler", 1, "Her insan mutlu ve huzurlu bir yaşam ister.", "Every human wants a happy and peaceful life.", "كل إنسان يرغب في حياة سعيدة ومطمئنة."),
    ("hayat", "حَيَاة", "life", "حيي", "Ortak Kelimeler", 1, "Hayat yeni şeyler öğrendikçe daha güzel olur.", "Life becomes more beautiful as we learn new things.", "تصبح الحياة أجمل كلما تعلمنا أشياء جديدة."),
    ("fikir", "فِكْر", "idea / thought", "فكر", "Ortak Kelimeler", 1, "Bu konu hakkında çok güzel bir fikrim var.", "I have a very good idea about this topic.", "لدي فكرة رائعة جداً حول هذا الموضوع."),
    ("akıl", "عَقْل", "mind / intellect", "عقل", "Ortak Kelimeler", 1, "Akıl ve mantık her zaman en doğru rehberdir.", "Mind and logic are always the true guide.", "العقل والمنطق هما دائماً الهادي الأصح."),
    ("zaman", "زَمَان", "time", "زمن", "Ortak Kelimeler", 1, "Zamanı verimli kullanmak büyük bir sanattır.", "Using time efficiently is a great art.", "استخدام الوقت بفعالية هو فن كبير."),
    ("sabır", "صَبْر", "patience", "صبر", "Ortak Kelimeler", 1, "Sabır her zorluğun anahtarıdır.", "Patience is the key to every hardship.", "الصبر مفتاح كل صعوبة."),
    ("şükür", "شُكْر", "gratitude / thanks", "شكر", "Ortak Kelimeler", 1, "Sağlığımız için her gün şükretmeliyiz.", "We should give thanks every day for our health.", "يجب أن نشكر الله كل يوم على صحتنا."),
    ("selam", "سَلَام", "peace / greeting", "سلم", "Ortak Kelimeler", 1, "Arkadaşlarıma içten bir selam verdim.", "I gave a warm greeting to my friends.", "ألقيت سلاماً حاراً على أصدقائي."),
    ("haber", "خَبَر", "news", "خبر", "Ortak Kelimeler", 1, "Sabah gazetesinde sevindirici bir haber okudum.", "I read good news in the morning newspaper.", "قرأت خبراً ساراً في صحيفة الصباح."),
    ("cevap", "جَوَاب", "answer / reply", "جوب", "Ortak Kelimeler", 1, "Öğretmenin sorusuna doğru cevap verdi.", "She answered the teacher's question correctly.", "أجابت على سؤال المعلم بإجابة صحيحة."),
    ("soru", "سُؤَال", "question", "سأل", "Ortak Kelimeler", 1, "Kafasındaki tüm soruları tek tek sordu.", "He asked all the questions in his mind one by one.", "طرح جميع الأسئلة التي في ذهنه واحداً تلو الآخر."),
    ("resim", "رَسْم", "picture / painting", "رسم", "Ortak Kelimeler", 1, "Müzideki tarihi resimler bizi büyüledi.", "The historical paintings in the museum fascinated us.", "بهرتنا اللوحات التاريخية في المتحف."),
    ("harita", "خَرِيطَة", "map", "خرط", "Ortak Kelimeler", 1, "Türkiye haritası üzerinde İstanbul'u bulduk.", "We found Istanbul on the map of Turkey.", "وجدنا إسطنبول على خريطة تركيا."),
    ("şair", "شَاعِر", "poet", "شعر", "Ortak Kelimeler", 1, "Şair duygularını şiirle ifade eder.", "The poet expresses feelings through poetry.", "يعبر الشاعر عن مشاعره بالشعر."),
    ("şiir", "شِعْر", "poem / poetry", "شعر", "Ortak Kelimeler", 1, "Bu güzel şiiri ezberlemek istiyorum.", "I want to memorize this beautiful poem.", "أريد حفظ هذا الشعر الجميل."),
    ("kalp", "قَلْب", "heart", "قلب", "Ortak Kelimeler", 1, "Sevgi dolu bir kalp her zaman huzur verir.", "A loving heart always gives peace.", "القلب المليء بالحب يمنح الطمأنينة دائماً."),
    ("ruh", "رُوح", "spirit / soul", "روح", "Ortak Kelimeler", 1, "Müzik ruhun gıdasıdır.", "Music is the food of the soul.", "الموسيقى غذاء الروح."),
    ("vatan", "وَطَن", "homeland", "وطن", "Ortak Kelimeler", 1, "Vatan sevgisi insanın içindeki en derin duygudur.", "Love of homeland is the deepest feeling inside a human.", "حب الوطن هو أعمق شعور داخل الإنسان."),
    ("millet", "أُمَّة / مِلَّة", "nation / people", "ملل", "Ortak Kelimeler", 1, "Milletimiz tarih boyunca büyük başarılara imza atmıştır.", "Our nation has achieved great successes throughout history.", "حققت أمتنا نجاحات عظيمة عبر التاريخ."),
    ("devlet", "دَوْلَة", "state / government", "دول", "Ortak Kelimeler", 1, "Devlet vatandaşlarının refahı için çalışır.", "The state works for the welfare of its citizens.", "تعمل الدولة من أجل رفاهية مواطنيها."),
    ("hukuk", "حُقُوق", "law / rights", "حقق", "Ortak Kelimeler", 2, "Adalet ve hukuk toplumun temelidir.", "Justice and law are the foundation of society.", "العدل والقانون هما أساس المجتمع."),
    ("adalet", "عَدَالَة", "justice", "عدل", "Ortak Kelimeler", 2, "Mahkemede adalet tecelli etti.", "Justice was served in the court.", "تحققت العدالة في المحكمة."),
    ("hakk", "حَقّ", "right / truth", "حقق", "Ortak Kelimeler", 2, "Her insanın eğitim alma hakkı vardır.", "Every human has the right to receive an education.", "لكل إنسان الحق في الحصول على التعليم."),
    ("hürriyet", "حُرِّيَّة", "freedom / liberty", "حرر", "Ortak Kelimeler", 2, "Düşünce hürriyeti demokratik toplumların esasıdır.", "Freedom of thought is the basis of democratic societies.", "حرية الفكر هي أساس المجتمعات الديمقراطية."),
    ("medeniyet", "مَدَنِيَّة", "civilization", "مدن", "Ortak Kelimeler", 2, "Anadolu birçok büyük medeniyete ev sahipliği yapmıştır.", "Anatolia has hosted many great civilizations.", "استضافت الأناضول العديد من الحضارات العظيمة."),
    ("tarih", "تَارِيخ", "history / date", "أرخ", "Ortak Kelimeler", 1, "Tarih dersinde Osmanlı dönemini inceledik.", "We studied the Ottoman period in the history class.", "درسنا الحقبة العثمانية في درس التاريخ."),
    ("ilim", "عِلْم", "science / knowledge", "علم", "Ortak Kelimeler", 2, "İlim öğrenmek her yaştaki insan için faydalıdır.", "Learning knowledge is beneficial for people of all ages.", "تعلم العلم مفيد للناس من جميع الأعمار."),
    ("alim", "عَالِم", "scholar / scientist", "علم", "Ortak Kelimeler", 2, "Ünlü alim yeni buluşunu açıkladı.", "The famous scholar announced his new discovery.", "أعلن العالم الشهير عن اكتشافه الجديد."),
    ("felsefe", "فَلْسَفَة", "philosophy", "فلسف", "Ortak Kelimeler", 3, "Felsefe evreni ve insanı anlamaya çalışır.", "Philosophy tries to understand the universe and humans.", "تسعى الفلسفة إلى فهم الكون والإنسان."),
    ("mantık", "مَنْطِق", "logic", "نطق", "Ortak Kelimeler", 2, "Konuşmasında mantık kurallarına sadık kaldı.", "He remained faithful to the rules of logic in his speech.", "التزم بقواعد المنطق في حديثه."),
    ("hikmet", "حِكْمَة", "wisdom", "حكم", "Ortak Kelimeler", 3, "Atasözlerimiz derin bir hikmet barındırır.", "Our proverbs contain deep wisdom.", "تحتوي أمثالنا الشعبية على حكمة عميقة."),
    ("kısmet", "قِسْمَة", "fate / destiny / luck", "قسم", "Ortak Kelimeler", 2, "Çabaladıktan sonra gerisini kısmete bıraktık.", "After striving, we left the rest to fate.", "بعد السعي تركونا الباقي للقسمة والنصيب."),
    ("kader", "قَدَر", "destiny / fate", "قدر", "Ortak Kelimeler", 2, "İnsan kendi kaderini gayretiyle biçimlendirir.", "A person shapes their own destiny through effort.", "يشكل الإنسان قدره باجتهاده."),
    ("şeref", "شَرَف", "honor", "شرف", "Ortak Kelimeler", 2, "Mesleğini büyük bir şerifle icra etti.", "He performed his profession with great honor.", "مارس مهنته بشرف كبير."),
    ("izzet", "عِزَّة", "might / glory", "عزز", "Ortak Kelimeler", 3, "İzzet ve itibar dürüstlükle kazanılır.", "Glory and reputation are earned through honesty.", "تُكتسب العزة والسمعة بالصدق."),
    ("edebiyat", "أَدَبِيَّات", "literature", "أدب", "Ortak Kelimeler", 2, "Klasik Türk edebiyatı zengin eserlerle doludur.", "Classical Turkish literature is full of rich works.", "الأدب التركي الكلاسيكي مليء بالأعمال الغنية."),
    ("sanat", "صَنَعَة / فَنّ", "art", "صنع", "Ortak Kelimeler", 1, "Sanat toplumun ruhunu yansıtan bir aynadır.", "Art is a mirror reflecting the soul of society.", "الفن ممتلئ بمرآة تعكس روح المجتمع."),
    ("siyaset", "سِيَاسَة", "politics", "سوس", "Ortak Kelimeler", 3, "Uluslararası siyaset dengeleri sürekli değişmektedir.", "International politics balances are constantly changing.", "تتغير موازين السياسة الدولية باستمرار."),
    ("iktisat", "إِقْتِصَاد", "economics", "قصد", "Ortak Kelimeler", 3, "İktisat alanında yeni reformlar açıklandı.", "New reforms were announced in the field of economics.", "تم الإعلان عن إصلاحات جديدة في مجال الاقتصاد."),
    ("ticaret", "تِجَارَة", "trade / commerce", "تجر", "Ortak Kelimeler", 2, "İpek Yolu tarihi boyunca ticaretin merkezi olmuştur.", "The Silk Road was the center of trade throughout history.", "كان طريق الحرير مركزاً للتجارة عبر التاريخ."),
    ("bereket", "بَرَكَة", "abundance / blessing", "برك", "Ortak Kelimeler", 1, "Yağan yağmur toprağa bereket getirdi.", "The falling rain brought abundance to the soil.", "أحضار المطر الهاطل البركة للأرض."),
    ("rahmet", "رَحْمَة", "mercy", "رحم", "Ortak Kelimeler", 1, "İnsanlara karşı her zaman rahmetle yaklaşmalıdır.", "One should always approach people with mercy.", "يجب دائماً التعامل مع الناس برحمة."),
    ("şefkat", "شَفَقَة", "compassion", "شفق", "Ortak Kelimeler", 2, "Annenin çocuğuna gösterdiği şefkat eşsizdir.", "The tenderness a mother shows her child is unique.", "شفقة الأم على طفلها لا مثيل لها."),
    ("muhabbet", "مَحَبَّة", "affection", "حبب", "Ortak Kelimeler", 2, "Dostlarla yapılan muhabbet insanın içini ısıtır.", "Conversation with friends warms one's heart.", "المحبة والأحاديث مع الأصدقاء تثلج الصدر."),
    ("hürmet", "حُرْمَة", "respect", "حرم", "Ortak Kelimeler", 2, "Büyüklerimize hürmet göstermek kültürümüzün gereğidir.", "Showing respect to our elders is a requirement of our culture.", "إبداء الاحترام لكبارنا هو من متطلبات ثقافتنا."),
    ("fayda", "فَائِدَة", "benefit", "فيد", "Ortak Kelimeler", 1, "Kitap okumanın zihne büyük faydası vardır.", "Reading books has great benefits for the mind.", "لقراءة الكتب فائدة عظيمة للعقل."),
    ("kâr", "رِبْح", "profit", "كسب", "Ortak Kelimeler", 2, "Şirket bu yıl yüksek kâr elde etti.", "The company achieved high profits this year.", "حققت الشركة أرباحاً عالية هذا العام."),
    ("servet", "ثَرْوَة", "wealth", "ثرى", "Ortak Kelimeler", 2, "En büyük servet sağlık ve huzurdur.", "The greatest wealth is health and peace.", "أعظم ثروة هي الصحة والاطمئنان."),
    ("kudret", "قُدْرَة", "power", "قدر", "Ortak Kelimeler", 3, "Doğanın muazzam bir kudreti vardır.", "Nature has an immense power.", "الطبيعة تمتلك قدرة هائلة."),
    ("kuvvet", "قُوَّة", "strength", "قوو", "Ortak Kelimeler", 2, "Birlik ve beraberlik bize kuvvet verir.", "Unity and togetherness give us strength.", "الوحدة والتكاتف يمنحاننا القوة."),
    ("zafer", "ظَفَر", "victory", "ظفر", "Ortak Kelimeler", 2, "Takım büyük bir gayretle zafer kazandı.", "The team won victory through great effort.", "حقق الفريق النصر باجتهاد كبير."),
    ("bayrak", "بَيْرَق", "flag", "برق", "Ortak Kelimeler", 1, "Şanlı bayrağımız göklerde dalgalanıyor.", "Our glorious flag is waving in the skies.", "علمنا المجيد يرفرف في السماء."),
    ("vakit", "وَقْت", "time", "وقت", "Ortak Kelimeler", 1, "Akşam vakti ailece çay içtik.", "We drank tea with the family in the evening time.", "شربنا الشاي مع العائلة في وقت المساء."),
    ("sabah", "صَبَاح", "morning", "صبح", "Ortak Kelimeler", 1, "Sabah erkenden yürüyüşe çıktım.", "I went for a walk early in the morning.", "خرجت للمشي في الصباح الباكر."),
    ("akşam", "مَسَاء", "evening", "مسو", "Ortak Kelimeler", 1, "Akşam yemeğini hep birlikte yedik.", "We ate dinner all together in the evening.", "تناولنا طعام العشاء جميعاً في المساء."),
    ("gece", "لَيْل", "night", "ليل", "Ortak Kelimeler", 1, "Gece gökyüzünde yıldızlar parlıyordu.", "Stars were shining in the night sky.", "كانت النجوم تتلألأ في السماء ليلاً."),
]

# ═══════════════════════════════════════════════════════════════
# EXPANDED AUTHENTIC TURKISH ROOT WORDS (A1 TO C1)
# ═══════════════════════════════════════════════════════════════

real_roots_pool = [
    # A1 Roots
    ("merhaba", "مرحباً", "hello", 1, "Tanışma & Selamlaşma", "Merhaba Suzim, hoş geldin!", "Hello Suzim, welcome!", "مرحباً سوزي، أهلاً بكِ!"),
    ("günaydın", "صباح الخير", "good morning", 1, "Tanışma & Selamlaşma", "Günaydın! Bugün hava çok güzel.", "Good morning! The weather is very nice today.", "صباح الخير! الطقس جميل جداً اليوم."),
    ("lütfen", "رجاءً", "please", 1, "Tanışma & Selamlaşma", "Lütfen bana bir bardak su verin.", "Please give me a glass of water.", "رجاءً أعطني كوباً من الماء."),
    ("teşekkürler", "شكراً", "thanks", 1, "Tanışma & Selamlaşma", "Yardımınız için çok teşekkürler.", "Thank you very much for your help.", "شكراً جزيلاً لك على مساعدتك."),
    ("evet", "نعم", "yes", 1, "Tanışma & Selamlaşma", "Evet, Türkçe öğrenmeyi çok seviyorum.", "Yes, I love learning Turkish very much.", "نعم، أحب تعلم اللغة التركية كثيراً."),
    ("anne", "أم", "mother", 1, "Günlük Yaşam", "Annem lezzetli bir çorba pişirdi.", "My mother cooked a delicious soup.", "طبخت أمي شوربة لديدة."),
    ("baba", "أب", "father", 1, "Günlük Yaşam", "Babam akşam eve erkenden geldi.", "My father came home early in the evening.", "عاد أبي إلى البيت مبكراً في المساء."),
    ("çocuk", "طفل", "child", 1, "Günlük Yaşam", "Parkta neşeyle oynayan bir çocuk var.", "There is a child playing joyfully in the park.", "هناك طفل يلعب بمرح في الحديقة."),
    ("ev", "بيت", "house", 1, "Günlük Yaşam", "Bizim evimiz bahçeli ve çok geniş.", "Our house has a garden and is very spacious.", "بيتنا يحتوي على حديقة وفسيح جداً."),
    ("su", "ماء", "water", 1, "Günlük Yaşam", "Günde en az iki litre su içmeliyiz.", "We should drink at least two liters of water a day.", "يجب أن نشرب ليترين من الماء على الأقل يومياً."),
    ("bahçe", "حديقة", "garden", 1, "Doğa & Çevre", "Suzim'in bahçesinde rengarenk papatyalar var.", "There are colorful daisies in Suzim's garden.", "هناك زهور أقحوان ملونة في حديقة سوزي."),
    ("çiçek", "زهرة", "flower", 1, "Doğa & Çevre", "Balkondaki saksıda güzel bir çiçek açtı.", "A beautiful flower bloomed in the pot on the balcony.", "تفتحت زهرة جميلة في الأصيص على الشرفة."),
    ("yaprak", "بتلة / ورقة", "petal / leaf", 1, "Doğa & Çevre", "Sonbaharda ağaçların yaprakları sararır.", "In autumn, the leaves of the trees turn yellow.", "في الخريف، تصفر أوراق الأشجار."),
    ("güneş", "شمس", "sun", 1, "Doğa & Çevre", "Sabah güneşi odayı aydınlattı.", "The morning sun illuminated the room.", "أضاءت شمس الصباح الغرفة."),

    # A2 Roots
    ("okul", "مدرسة", "school", 2, "Eğitim & Okul", "Öğrenciler neşeyle okula gittiler.", "Students went to school joyfully.", "ذهب الطلاب إلى المدرسة بمرح."),
    ("öğretmen", "معلم", "teacher", 2, "Eğitim & Okul", "Öğretmenimiz konuyu çok güzel anlattı.", "Our teacher explained the topic very well.", "شرح معلمنا الموضوع بشكل جميل جداً."),
    ("öğrenci", "طالب", "student", 2, "Eğitim & Okul", "Çalışkan öğrenci sınavdan yüksek not aldı.", "The hardworking student got a high score on the exam.", "حصل الطالب المجتهد على درجة عالية في الامتحان."),
    ("şehir", "مدينة", "city", 2, "Ulaşım & Şehir", "İstanbul tarihi yapılarıyla ünlü bir şehirdir.", "Istanbul is a city famous for its historical buildings.", "إسطنبول مدينة شهيرة بمبانيها التاريخية."),
    ("otobüs", "حافلة", "bus", 2, "Ulaşım & Şehir", "Otobüs durağında bekledim.", "I waited at the bus stop.", "انتظرت في موقف الحافلات."),
    ("elma", "تفاح", "apple", 2, "Yiyecek & İçecek", "Kırmızı elma çok suluydu.", "The red apple was very juicy.", "كانت التفاحة الحمراء لديدة جداً."),
    ("peynir", "جبن", "cheese", 2, "Yiyecek & İçecek", "Kahvaltıda taze peynir yedik.", "We ate fresh cheese at breakfast.", "أكلنا جبناً طازجاً في الفطور."),
    ("alışveriş", "تسوق", "shopping", 2, "Alışveriş & Ticaret", "Hafta sonu pazardan taze sebze alışverişi yaptık.", "We shopped for fresh vegetables over the weekend.", "تسوقنا الخضار الطازجة في نهاية الأسبوع."),

    # B1 Roots
    ("meslek", "مهنة", "profession", 3, "Meslekler & İş", "Gelecekte mühendislik mesleğini seçmek istiyor.", "He wants to choose engineering in the future.", "يرغب في اختيار مهنة الهندسة في المستقبل."),
    ("doktor", "طبيب", "doctor", 3, "Sağlık & Vücut", "Doktor hastasına tavsiyeler verdi.", "The doctor gave advice to his patient.", "أعطى الطبيب نصائح لمريضه."),
    ("doğa", "طبيعة", "nature", 3, "Doğa & Çevre", "Doğayı korumak her insanın görevidir.", "Protecting nature is everyone's duty.", "حماية الطبيعة هي واجب على الجميع."),
    ("orman", "غابة", "forest", 3, "Doğa & Çevre", "Ormanda kuş sesleri dinleyerek yürüdük.", "We walked in the forest listening to birdsong.", "مشين في الغابة مستمعين إلى أصوات الطيور."),
    ("mutluluk", "سعادة", "happiness", 3, "Duygular & İnsan", "Gerçek mutluluk paylaştıkça çoğalır.", "True happiness multiplies as it is shared.", "السعادة الحقيقية تتضاعف كلما شاركناها."),
    ("cesaret", "شجاعة", "courage", 3, "Duygular & İnsan", "Engelleri aşmak için büyük bir cesaret gösterdi.", "He showed great courage to overcome obstacles.", "أبدى شجاعة كبيرة لتجاوز العقبات."),

    # B2 Roots
    ("toplum", "مجتمع", "society", 4, "Toplum & Medya", "Sağlıklı bir toplum dayanışma üzerine kurulur.", "A healthy society is built on solidarity.", "المجتمع الصحي يُبنى على التضامن."),
    ("kültür", "ثقافة", "culture", 4, "Sanat & Kültür", "Türk kültürü zengin gelenekleriyle öne çıkar.", "Turkish culture stands out with its rich traditions.", "تتميز الثقافة التركية بتقاليدها الغنية."),
    ("yasa", "قانون", "law / statute", 4, "Devlet & Hukuk", "Mecliste yeni çevre yasası kabul edildi.", "The new environmental law was passed in parliament.", "تمت المصادقة على قانون البيئة الجديد."),
    ("özgürlük", "حرية", "freedom", 4, "Devlet & Hukuk", "Düşünce özgürlüğü bireyin gelişimi için şarttır.", "Freedom of thought is essential for individual development.", "حرية الفكر ضرورية لتطور الفرد."),
    ("tiyatro", "مسرح", "theater", 4, "Sanat & Kültür", "Tiyatro sahnesindeki oyuncular harikaydı.", "The actors on the theater stage were great.", "أدى الممثلون على المسرح أداءً رائعاً."),

    # C1 Advanced Academic & Literary Roots
    ("akademik", "أكاديمي", "academic", 5, "Akademik & Felsefe", "Akademik araştırmalarda metodoloji çok önemlidir.", "Methodology is very important in academic research.", "المنهجية مهمة جداً في البحوث الأكاديمية."),
    ("çağdaş", "معاصر", "contemporary", 5, "Akademik & Felsefe", "Çağdaş medeniyet seviyesine ulaşmak ana hedeftir.", "Reaching contemporary civilization level is the goal.", "الوصول إلى مستوى الحضارة المعاصرة هو الهدف."),
    ("soyut", "مجرد", "abstract", 5, "Akademik & Felsefe", "Matematik soyut kavramları açıklar.", "Mathematics explains abstract concepts.", "يشرح الرياضيات المفاهيم المجردة."),
    ("somut", "ملموس", "concrete", 5, "Akademik & Felsefe", "Tezini somut kanıtlarla destekledi.", "He supported his thesis with concrete evidence.", "دعم أطروحته بأدلة ملموسة."),
    ("deste", "باقة", "bouquet / bunch", 5, "Akademik & Felsefe", "Papatya destesinden bir yaprak seçti.", "She picked a petal from the daisy bouquet.", "اختارت بتلة من باقة الأقحوان."),
    ("papatya", "أقحوان", "daisy", 1, "Doğa & Çevre", "Suzim'in bahçesinde sapsarı göbekli beyaz papatyalar açtı.", "White daisies with yellow centers bloomed in Suzim's garden.", "تفتحت زهور الأقحوان في حديقة سوزي."),
    ("metodoloji", "منهجية", "methodology", 5, "Akademik & Felsefe", "Bilimsel araştırmalarda metodoloji esastır.", "Methodology is essential in scientific research.", "المنهجية أساسية في البحوث العلمية."),
    ("kavramsal", "مفاهيمي", "conceptual", 5, "Akademik & Felsefe", "Tezinde kavramsal çerçeveyi netleştirdi.", "He clarified the conceptual framework in his thesis.", "أوضح الإطار المفاهيمي في أطروحته."),
    ("analitik", "تحليلي", "analytical", 5, "Akademik & Felsefe", "Analitik düşünme yeteneği başarının anahtarıdır.", "Analytical thinking ability is the key to success.", "قدرة التفكير التحليلي هي مفتاح النجاح."),
    ("sentezlemek", "تجميع / تركيب", "to synthesize", 5, "Akademik & Felsefe", "Farklı görüşleri sentezleyerek yeni bir teori geliştirdi.", "He developed a new theory by synthesizing different views.", "طور نظرية جديدة من خلال تجميع الآراء المختلفة."),
]

vocab_list = []
id_counter = 1
existing_words = set()

# Add Cognates first
for tr, ar, en, ar_root, cat, lvl, s_tr, s_en, s_ar in cognates_dataset:
    if tr not in existing_words:
        vocab_list.append({
            "id": f"v_{id_counter:04d}",
            "word": tr,
            "tr": tr,
            "ar": ar,
            "en": en,
            "level": lvl,
            "category": cat,
            "sentence_tr": s_tr,
            "sentence_en": s_en,
            "sentence_ar": s_ar,
            "pronunciation": f"[{tr}]",
            "is_cognate": True,
            "cognate_info": {
                "ar_root": ar_root,
                "note_tr": f"Arapça kökenli ortak kelime: {ar} (Kök: {ar_root})",
                "note_en": f"Shared Arabic cognate: {ar} (Root: {ar_root})",
                "note_ar": f"كلمة مشتركة مع العربية: {ar} (جذر: {ar_root})"
            }
        })
        existing_words.add(tr)
        id_counter += 1

# Add Real Base Roots
for tr, ar, en, lvl, cat, s_tr, s_en, s_ar in real_roots_pool:
    if tr not in existing_words:
        vocab_list.append({
            "id": f"v_{id_counter:04d}",
            "word": tr,
            "tr": tr,
            "ar": ar,
            "en": en,
            "level": lvl,
            "category": cat,
            "sentence_tr": s_tr,
            "sentence_en": s_en,
            "sentence_ar": s_ar,
            "pronunciation": f"[{tr}]",
            "is_cognate": False,
            "cognate_info": None
        })
        existing_words.add(tr)
        id_counter += 1

# Valid Real Suffix Variations
real_derived_stems = [
    ("göz", "عين", "eye", 1, "Sağlık", [("lük", "نظارات", "glasses"), ("cü", "fenni gözlükçü", "optician")]),
    ("bilgi", "معلومة", "info", 2, "Eğitim", [("li", "ذو معرفة", "informed"), ("sayar", "حاسوب", "computer")]),
    ("sevgi", "محبة", "love", 2, "Duygular", [("li", "محبوب", "loving"), ("siz", "خالي من الحب", "loveless")]),
    ("saygı", "احترام", "respect", 2, "Duygular", [("lı", "محترم", "respectful"), ("sız", "غير محترم", "disrespectful")]),
    ("güven", "ثقة", "trust", 3, "Duygular", [("li", "آمن", "safe"), ("siz", "غير آمن", "unsafe")]),
    ("başarı", "نجاح", "success", 2, "Eğitim", [("lı", "ناجح", "successful"), ("sız", "فاشل", "unsuccessful")]),
    ("sağlık", "صحة", "health", 1, "Sağlık", [("lı", "صحي", "healthy"), ("sız", "غير صحي", "unhealthy")]),
    ("dost", "صديق", "friend", 1, "Duygular", [("luk", "صداقة", "friendship"), ("ça", "بشكل ودي", "friendly")]),
    ("bilim", "علم", "science", 2, "Eğitim", [("sel", "علمي", "scientific"), ("insanı", "عالم", "scientist")]),
    ("toplum", "مجتمع", "society", 4, "Toplum", [("sal", "مجتمعي", "social"), ("cu", "اجتماعي", "societal")]),
    ("akıl", "عقل", "mind", 1, "Ortak Kelimeler", [("lı", "عاقل", "smart"), ("sız", "عديم العقل", "foolish")]),
    ("şeker", "سكر", "sugar", 1, "Yiyecek", [("li", "محلى", "sweet"), ("siz", "بدون سكر", "sugarfree")]),
    ("tuz", "ملح", "salt", 1, "Yiyecek", [("lu", "مالح", "salty"), ("suz", "بدون ملح", "saltfree")]),
    ("ev", "بيت", "house", 1, "Günlük", [("li", "متزوج", "married"), ("siz", "أعزب", "homeless")]),
    ("iş", "عمل", "work", 2, "Meslekler", [("çi", "عامل", "worker"), ("siz", "عاطل عن العمل", "unemployed")]),
]

for stem, stem_ar, stem_en, lvl, cat, deriv_list in real_derived_stems:
    for suf, d_ar, d_en in deriv_list:
        w_comb = f"{stem}{suf}"
        if w_comb not in existing_words:
            vocab_list.append({
                "id": f"v_{id_counter:04d}",
                "word": w_comb,
                "tr": w_comb,
                "ar": d_ar,
                "en": d_en,
                "level": lvl,
                "category": cat,
                "sentence_tr": f"Suzim {w_comb} kavramını öğrendi.",
                "sentence_en": f"Suzim learned the word {w_comb}.",
                "sentence_ar": f"تعلمت سوزي كلمة {d_ar}.",
                "pronunciation": f"[{w_comb}]",
                "is_cognate": False,
                "cognate_info": None
            })
            existing_words.add(w_comb)
            id_counter += 1

print(f"Total authentic real vocabulary items: {len(vocab_list)}")

# ═══════════════════════════════════════════════════════════════
# LESSON DEFINITIONS (EXPLICIT CEFR NAMES: A1, A2, B1, B2, C1)
# ═══════════════════════════════════════════════════════════════

level_lessons_meta = {
    1: [
        {"title": "Selamlaşma ve Tanışma", "arabic": "التعارف والتحيات", "english": "Greetings & Introductions", "summary": "Temel selamlaşma ifadeleri ve tanışma kalıpları."},
        {"title": "Kişi Zamirleri ve Var/Yok", "arabic": "الضمائر الشخصية و يوجد/لا يوجد", "english": "Pronouns & There is/isn't", "summary": "Ben, sen, o zamirleri ve var/yok kullanımı."},
        {"title": "Sayılar ve Sayma", "arabic": "الأرقام والعد", "english": "Numbers & Counting", "summary": "1'den 100'e kadar sayılar ve miktar ifadeleri."},
        {"title": "Renkler ve Şekiller", "arabic": "الألوان والأشكال", "english": "Colors & Shapes", "summary": "Temel renk tanımları ve basit sıfatlar."},
        {"title": "Aile Bireyleri", "arabic": "أفراد العائلة", "english": "Family Members", "summary": "Anne, baba, kardeş ve akraba isimleri."},
        {"title": "Vücudumuz", "arabic": "أعضاء الجسد", "english": "Our Body Parts", "summary": "Baş, göz, el, ayak ve organ isimleri."},
        {"title": "Evimiz ve Eşyalar", "arabic": "البيت والأثاث", "english": "House & Furniture", "summary": "Masa, sandalye, kapı ve ev eşyaları."},
        {"title": "Temel Fiiller", "arabic": "الأفعال الأساسية", "english": "Basic Verbs", "summary": "Gelmek, gitmek, yapmak, yemek, içmek fiilleri."},
        {"title": "Zaman ve Günler", "arabic": "الوقت والأيام", "english": "Time & Days", "summary": "Saatler, günler, aylar ve mevsimler."},
        {"title": "Ortak Kelimeler I (Arapça Kökenliler)", "arabic": "الكلمات المشتركة 1", "english": "Arabic Cognates I", "summary": "Kitap, kalem, defter, saat, dünya ortak kelimeleri."}
    ],
    2: [
        {"title": "Yiyecek ve İçecekler", "arabic": "الطعام والشراب", "english": "Food & Drinks", "summary": "Kahvaltılıklar, yemekler ve içecek isimleri."},
        {"title": "Alışveriş ve Pazar", "arabic": "التسوق والسوق", "english": "Shopping & Market", "summary": "Fiyat sorma, pazarlık ve alışveriş cümleleri."},
        {"title": "Şehir ve Ulaşım", "arabic": "المدينة والمواصلات", "english": "City & Transport", "summary": "Otobüs, tren, sokak ve adres tarifleri."},
        {"title": "Eğitim ve Okul", "arabic": "التعليم والمدرسة", "english": "Education & School", "summary": "Sınıf eşyaları, dersler ve okul hayatı."},
        {"title": "Hava Durumu ve Mevsimler", "arabic": "الطقس والفصول", "english": "Weather & Seasons", "summary": "Sıcak, soğuk, yağmurlu ve rüzgarlı hava ifadeleri."},
        {"title": "Giyim ve Aksesuar", "arabic": "الملابس والإكسسوارات", "english": "Clothes & Accessories", "summary": "Elbise, ayakkabı, şapka ve giyim terimleri."},
        {"title": "Hobiler ve Serbest Zaman", "arabic": "الهوايات وأوقات الفراغ", "english": "Hobbies & Free Time", "summary": "Müzik, spor, kitap okuma ve hobiler."},
        {"title": "Duygular ve Hisler", "arabic": "المشاعر والأحاسيس", "english": "Emotions & Feelings", "summary": "Mutlu, üzgün, heyecanlı ve yorgun durumları."},
        {"title": "Sağlık ve Randevu", "arabic": "الصحة والمواعيد", "english": "Health & Appointments", "summary": "Hasta olma, doktor muayenesi ve eczane ifadeleri."},
        {"title": "Ortak Kelimeler II (Adalet & Hukuk)", "arabic": "الكلمات المشتركة 2", "english": "Arabic Cognates II", "summary": "Adalet, hukuk, hakk, hürriyet, medeniyet terimleri."}
    ],
    3: [
        {"title": "Meslekler ve İş Dünyası", "arabic": "المهن وعالم الأعمال", "english": "Professions & Business", "summary": "Doktor, mühendis, öğretmen ve iş yeri terimleri."},
        {"title": "Geçmiş Zaman (-dı / -di)", "arabic": "الزمن الماضي", "english": "Past Tense (-dı / -di)", "summary": "Geçmişte yaşanan olayları anlatma yapısı."},
        {"title": "Gelecek Zaman (-acak / -ecek)", "arabic": "الزمن المستقبل", "english": "Future Tense (-acak / -ecek)", "summary": "Gelecek planları ve vaatler."},
        {"title": "Geniş Zaman (-ar / -er / -ır)", "arabic": "الزمن الواسع", "english": "Aorist / Present Simple", "summary": "Genel doğrular ve alışkanlıklar."},
        {"title": "Doğa ve Çevre Koruma", "arabic": "الطبيعة وحماية البيئة", "english": "Nature & Environment", "summary": "Orman, deniz, iklim ve çevre bilinci."},
        {"title": "Teknoloji ve İletişim", "arabic": "التكنولوجيا والتواصل", "english": "Technology & Communication", "summary": "İnternet, bilgisayar, telefon ve dijital dünya."},
        {"title": "Tatil ve Seyahat", "arabic": "العطلة والسفر", "english": "Vacation & Travel", "summary": "Otel, bilet, müze ve gezi rotaları."},
        {"title": "Gelenek ve Görenekler", "arabic": "العادات والتقاليد", "english": "Traditions & Customs", "summary": "Bayramlar, düğünler ve Türk konukseverliği."},
        {"title": "Sağlıklı Yaşam ve Spor", "arabic": "الحياة الصحية والرياضة", "english": "Healthy Living & Sports", "summary": "Egzersiz, beslenme ve zindelik kavramları."},
        {"title": "Ortak Kelimeler III (Felsefe & Hikmet)", "arabic": "الكلمات المشتركة 3", "english": "Arabic Cognates III", "summary": "Felsefe, hikmet, mantık, kader, izzet kavramları."}
    ],
    4: [
        {"title": "Toplum ve Sosyal Yapı", "arabic": "المجتمع والبنية الاجتماعية", "english": "Society & Social Structure", "summary": "Dayanışma, kamu, vatandaşlık ve toplumsal kurallar."},
        {"title": "Devlet ve Yönetim", "arabic": "الدولة والإدارة", "english": "State & Governance", "summary": "Anayasa, meclis, bakanlık ve devlet organları."},
        {"title": "Medya ve Basın", "arabic": "الإعلام والصحافة", "english": "Media & Press", "summary": "Gazete, haber, yayıncılık ve eleştirel medya."},
        {"title": "Sanat ve Edebiyat", "arabic": "الفن والأدب", "english": "Art & Literature", "summary": "Tiyatro, sinema, roman ve edebiyat eleştirisi."},
        {"title": "Ekonomi ve Ticaret", "arabic": "الاقتصاد والتجارة", "english": "Economy & Trade", "summary": "İktisat, kâr, bütçe, yatırım ve piyasa terimleri."},
        {"title": "Yeterlilik Fiili (-ebil / -abil)", "arabic": "فعل الاستطاعة", "english": "Ability Verb (-ebil)", "summary": "Yapabilmek, gelebilmek, başarabilmek ifadeleri."},
        {"title": "Şart Kipi (-sa / -se)", "arabic": "صيغة الشرط", "english": "Conditional Mood (-sa)", "summary": "Varsayımlar, dilekler ve şart cümleleri."},
        {"title": "İlim ve İnovasyon", "arabic": "العلم والابتكار", "english": "Science & Innovation", "summary": "Bilimsel yöntem, araştırma ve inovasyon kavramları."},
        {"title": "Çevre ve İklim Değişikliği", "arabic": "البيئة والتغير المناخي", "english": "Environment & Climate", "summary": "Küresel ısınma, geri dönüşüm ve ekoloji."},
        {"title": "Ortak Kelimeler IV (Siyaset & İktisat)", "arabic": "الكلمات المشتركة 4", "english": "Arabic Cognates IV", "summary": "Siyaset, iktisat, ticaret, hürriyet terimleri."}
    ],
    5: [
        {"title": "Akademik Yazım ve Metodoloji", "arabic": "الكتابة الأكاديمية والمنهجية", "english": "Academic Writing & Methodology", "summary": "Tez yazımı, kaynak gösterme ve akademik usul."},
        {"title": "Felsefe ve Etik Düşünce", "arabic": "الفلسفة والفكر الأخلاقي", "english": "Philosophy & Ethics", "summary": "Ahlak felsefesi, varlık bilimi ve mantık yürütme."},
        {"title": "Çağdaş Dünya ve Sosyoloji", "arabic": "العالم المعاصر وعلم الاجتماع", "english": "Contemporary World & Sociology", "summary": "Küreselleşme, sosyo-kültürel değişimler."},
        {"title": "Edilgen Çatı ve Ettirgenlik", "arabic": "المبني للمجهول والتعدية", "english": "Passive Voice & Causatives", "summary": "Yapılmak, edilmek, yaptırmak edilgen çatı yapısı."},
        {"title": "Osmanlı Edebi Mirası ve Dil", "arabic": "الإرث الأدبي العثماني واللغة", "english": "Ottoman Literary Heritage", "summary": "Klasik metinler, beyitler ve edebi sanatlar."},
        {"title": "Türkçe Deyimler ve Atasözleri", "arabic": "الأمثال والحكم التركية", "english": "Proverbs & Idioms", "summary": "İpin ucunu kaçırmak, eline sağlık, başüstüne."},
        {"title": "Diplomasi ve Uluslararası İlişkiler", "arabic": "الدبلوماسية والعلاقات الدولية", "english": "Diplomacy & Int. Relations", "summary": "Müzakere, antlaşma, büyükelçilik terimleri."},
        {"title": "Hukuk Felsefesi ve İnsan Hakları", "arabic": "فلسفة القانون وحقوق الإنسان", "english": "Legal Philosophy & Human Rights", "summary": "Evrensel hukuk ilkeleri ve adalet kuramı."},
        {"title": "Ebedî ve Ezelî Kavramlar", "arabic": "المفاهيم الأبدية والأزلية", "english": "Eternal & Timeless Concepts", "summary": "Ebedi, ezeli, hakikat ve varlık kavramları."},
        {"title": "Ortak Kelimeler V (Kudret & Şeref)", "arabic": "الكلمات المشتركة 5", "english": "Arabic Cognates V", "summary": "Kudret, kuvvet, zafer, şeref, izzet kavramları."}
    ]
}

cefr_titles = ["Level A1", "Level A2", "Level B1", "Level B2", "Level C1"]
cefr_desc = [
    "Başlangıç (A1)",
    "Temel Türkçe (A2)",
    "Orta Seviye (B1)",
    "Akıcı Türkçe (B2)",
    "Akademik Akıcılık (C1)"
]

levels_definition = []
for lvl in range(1, 6):
    lessons_list = []
    lvl_vocab = [w for w in vocab_list if w["level"] == lvl]
    if not lvl_vocab:
        lvl_vocab = vocab_list[:20]

    for i in range(10):
        les_id = f"l{lvl}_{i+1}"
        meta = level_lessons_meta[lvl][i]
        
        start_idx = (i * 8) % len(lvl_vocab)
        les_vocab = lvl_vocab[start_idx : start_idx + 10]
        if len(les_vocab) < 6:
            les_vocab = lvl_vocab[:10]

        lesson_obj = {
            "id": les_id,
            "title": f"{i+1}. {meta['title']}",
            "arabicTitle": meta["arabic"],
            "englishTitle": meta["english"],
            "summary": meta["summary"],
            "intro_tr": f"Bu derste '{meta['title']}' konusunu öğreneceksiniz.",
            "intro_en": f"In this lesson, you will learn '{meta['english']}'.",
            "intro_ar": f"في هذا الدرس ستتعلم موضوع '{meta['arabic']}'.",
            "vocabulary": les_vocab
        }
        lessons_list.append(lesson_obj)

    levels_definition.append({
        "id": lvl,
        "cefrCode": ["A1", "A2", "B1", "B2", "C1"][lvl-1],
        "title": f"{cefr_titles[lvl-1]}: {cefr_desc[lvl-1]}",
        "arabicTitle": f"المستوى {['A1', 'A2', 'B1', 'B2', 'C1'][lvl-1]}",
        "englishTitle": f"{cefr_titles[lvl-1]}",
        "lessons": lessons_list
    })

output_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "database.js")
with open(output_path, "w", encoding="utf-8") as f:
    f.write("// Suzim'in Türkçe Bahçesi - Authentic CEFR Learning Database (A1 to C1)\n")
    f.write(f"// Contains {len(vocab_list)} authentic real Turkish vocabulary items\n\n")
    f.write("const learningDatabase = {\n")
    f.write("  levels: ")
    json.dump(levels_definition, f, ensure_ascii=False, indent=2)
    f.write(",\n\n")
    f.write("  vocabularyBank: ")
    json.dump(vocab_list, f, ensure_ascii=False, indent=2)
    f.write("\n};\n")

print(f"Database generated successfully for Levels A1, A2, B1, B2, C1!")
