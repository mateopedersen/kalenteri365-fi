# Ana sayfa ve gün / gece fotoğrafları

13 Kasım 2026. Sahip son talimatında Finlandiya ve diğer üç takvim sitesinin yayımlanmasına açık yetki verdi. Bu değişiklik Finlandiya deposuna aittir.

Ana sayfa, yaklaşan Finlandiya günlerini, altı takvim katmanını, kişisel günlük notları, görev ilerlemesini, ICS alışverişini ve JSON yedeklerini aynı çalışma alanında toplar. Pyhäpäivä, aatto, liputuspäivä ve merkkipäivä ayrı gösterilir. Alt bölümde altı konu grubu, farklı kapaklı dört yıllık baskı koleksiyonu, üç araç ve üç blog rehberi bulunur. Büyük gerçek şehir fotoğrafı korunmuştur.

25 seçilebilir yerin her birinde ayrı, kaynak ve lisansı belirlenmiş gece fotoğrafı vardır. Gündüzleri yanlışlıkla gece fotoğrafı gösteren Tampere, Joensuu ve Salo için üç gerçek gündüz fotoğrafı seçilmiştir. İndirilen gerçek pikseller inceleme sayfalarında görüntülenmiş; kararlar ve SHA-256 özetleri `data/city-night-review.json`, `data/city-day-corrections.json` ve `data/photo-credits.json` dosyalarına kaydedilmiştir. Utsjoki fotoğrafı belediye sınırları içindeki Nuorgam'dandır; Hämeenlinna fotoğrafının kaynak koordinatları da belediye içinde doğrulanmıştır. Fotoğraflar gerçek zamanlı hava kamerası değildir; kaynak tarihlerindeki mevsim/hava korunmuştur.

Fotoğraf seçimi `src/solar-day.mjs` ile aynı kesin gün doğumu ve batımı olaylarını kullanır. Güneş doğduğu anda gündüz, battığı anda gece görseli seçilir. Yerel gün sınırları, yaz saati, yalnız doğuş/batış olan kutup geçişleri, kaamos ve yötön yö işlenir. Geçiş zamanına kurulan zamanlayıcıya ek olarak görünürlük dönüşü ve periyodik kontrol vardır. Gece/gündüz ayrı önbelleğe alınır; yeni fotoğraf tamamen çözümlenmeden önceki net kare kaldırılmaz. Eski bir şehrin gecikmiş isteği son seçimi ezemez.

IP seçimi Finlandiya içinde eşleşen/en yakın desteklenen yeri, Finlandiya dışındaysa Helsinki'yi kullanır. Yerel makinede gerçek Cloudflare IP alanları bulunmadığı için bu kural kontrollü istek verileriyle test edilmiştir. MET Norway sıcaklık, rüzgâr ve bir saatlik yağış verisi korunur; hareket azaltma ve görünür alan dışında durma uygulanır.

Doğrulama: 50 Node testi, 19 IndexNow testi, 1234 HTML ve mevcut 1004 PDF + 1004 Image dosyası üzerinde kaynak denetimi geçti. Chrome ve WebKit'te 320/390/768/1440 genişliklerinde sekiz ana sayfa erişilebilirlik kontrolünde sıfır Axe ihlali, iki tam not/görev/ICS/yedek/filtre akışı doğrulandı. Ayrı gece testi iki tarayıcı × iki genişlik × iki dönem için 200 şehir seçimi, kutup koşulları, hızlı seçim yarışı ve iki gerçek otomatik güneş geçişini doğrular. Ana sayfa baskısı tek sayfada yalnız takvimi içerir.

Yerel kanıtlar çalışma alanındaki `work/reports/finland-home-dashboard-2026-11-13` klasöründedir. Yayın, gerçek alan adında kaynak commit ve dosya doğrulaması tamamlanmadan bitmiş sayılmaz.
