# Kanıtlanan sorunlar ve düzeltmeler

| Sorun | Uygulanan düzeltme | Kontrol |
| --- | --- | --- |
| Ana sayfa eski sorgulu adrese yönleniyordu | Yerel görünüm durumu korunarak ana URL sadeleştirildi | Gerçek tarayıcı yenilemesi ve göç testleri |
| Sayfa içindeki yıl aramada bulunmuyordu | Başlık, açıklama ve içerik sözcükleri birlikte taranır; Fince soru/şehir ekleri ele alınır | Kısa sorgu, uzun soru, juhannus 2028, Helsingin talviloma testleri |
| İlk yüklemede ağır ortak kod/gizli menü görselleri | Sürüm özetli küçük giriş paketi, ihtiyaca göre modüller, küçük türevler, görünmeyen kuvitusta lazy loading | Lighthouse ve gerçek işlev regresyonları |
| Kaynak değişikliğinden sonra eski iç Studio dosyası | Tüm modül zinciri içerik özetli paketlere bağlandı | PDF/Word/Excel/JPG/PNG gerçek 600 dpi indirmeleri |
| Bazı PDF Ay ve planlayıcı rasterleri 600 ppi altındaydı | Raster boyutları yeniden hesaplandı; dosyalar tekrar üretildi | 432 PDF'de Poppler görüntü listesi |
| Okul/iş vardiyası çıktıları fazladan sayfa oluşturuyordu | Özel baskı düzeni ve doldurulan alanların baskı karşılıkları | Gerçek doldurulmuş birer A4 PDF |
| Aylık takvim baskısına açıklamalar karışıyordu | Baskı yalnız seçili takvim, ay/yıl başlığı ve marka satırını içerir | Ana sayfa ve Şubat 2028 tek sayfa PDF |
| Sosyal görsellerde farklı SVG ölçüleri kırpılabiliyordu | Özgün viewBox korunarak contain rasterleştirme; konuya uygun fotoğraf ve lisans kredisi | 1200×630 ölçü ve görsel inceleme |
| Güneş kontrolü kaynakta derlenemiyordu | Sözdizimi/gölgeleme düzeltildi; gerçek transit saati ve görünür sahneye kaydırma eklendi | Chrome ve WebKit gerçek oynat/duraklat/pik seçimleri |
| Mobil saat ve sıra numarası kutuları taşıyordu | Min-width, esnek kolonlar, sabit kare rozet ve dokunma alanları | 320/390/768/1366 genişliklerinde iki motor |
| Okul/üniversite görünümü sınırlıydı | Kaynağa bağlı 14 kurum ve 31 kayıt, 9 ek kampüs fotoğrafı | Tarih sırası testleri, kaynak ve görsel inceleme |
| Sınav sayfasında yalnız dış bağlantı vardı | 18 resmî 2027 koepäivät, ders araması ve iki ICS koleksiyonu | Matematiikka filtresi iki sonuç ve gerçek ICS indirmesi |
