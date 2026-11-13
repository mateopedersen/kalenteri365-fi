# Finlandiya sürümü, 13 Kasım 2026

Bu çalışma, önceki sürümün Letonya ile aynı işlev ve içerik derinliğine ulaşmadığına ilişkin kullanıcı geri bildirimi üzerine yapıldı. Sayfa sayısı tek başına kalite kanıtı olarak kullanılmadı. Letonya sitemapindeki 64 aile eşleştirildi; iki sitede 30 gerçek sayfa örneği, masaüstü ve mobil görüntüler karşılaştırıldı.

## Değişiklikler

- Finlandiya bayrağının 18:11 oranı ve 5:3:10 / 4:3:4 haç ölçüleri uygulandı. Ana kimlik beyaz ve koyu maviye alındı; ana sayfa başlığı yaklaşık 41 pikselden 30 piksele indirildi. Lato Regular ve Bold, iki yazı tipi ağırlığı kullanılır.
- 32 kategori/dosya SVG'si ve 12 ay ikonu yenilendi; dört planlayıcı için ayrı baskı illüstrasyonları eklendi. SVG'ler vektördür; fotogerçekçilik veya gerçek üç boyutlu model dosyası iddiası değildir.
- `/blogi/` altında 20 makale, her biri 769–825 Fince gövde kelimesi; toplam 15.855 kelime. Kategori, arama, içerik gezinmesi, ilgili yazılar ve yazı içi bağlantılar eklendi. Eski `/oppaat/slug/` adresleri HTTP 301 ile korunur; `/oppaat/` ayrı bir kılavuz dizinidir.
- 47 güne 141 özgün paragraf ve konuya özgü resmî kaynak bağlantıları eklendi. 16 temel sayfa için kullanım açıklamaları ve sorular hazırlandı. Metinler bağımsız, ana dili Fince olan editör onayı olarak sunulmaz.
- Okul dizini beş belediye ve 14 üniversiteye ait gerçek fotoğraflı bağlantıları içerir. Yalnız yayımlanmış yerel dönemler gösterilir; gelecekte açıklanmamış tatiller türetilmez. Fotoğraf kayıtları 96'ya ulaştı.
- Araç dizininde kategori, arama ve yerel favoriler bulunur. Aile takviminde kişi, etkinlik, yemek, alışveriş, ayrı hafta kayıtları ve Helsinki saatine göre ICS; hafta planında doğrudan düzenlenebilir çalışma alanı bulunur.
- Yıl ve ay sayfalarının başına 15 farklı baskı tasarımı, yanına kompakt yıl/ay gezintisi yerleştirildi. İlk dört dosya kimliği ve sağlıklı eski adresler korundu.
- 780 normal, 208 Ay ve 16 planlayıcı olmak üzere 1.004 PDF ve 1.004 gerçek 600 dpi görüntü üretilir. Ayrı 1.004 küçük önizleme vardır. Dosyalar Kalenteri365™ markasını taşır. Word ve Excel indirmeleri, yüksek çözünürlüklü kalenter görüntüsünü belgeye gömer; düzenlenebilir hücre kalenteri oldukları ileri sürülmez.
- Şehir kartlarında özgün büyük fotoğraflar korunur; hafif, kaynak özetiyle adlandırılmış AVIF görüntü ve WebP yedeği kullanılır. Kart eskisi görünürken çözülür, hazır olunca değiştirilir. İlk ve soğuk ağ isteği için milisaniye garantisi verilmez.
- Gün uzunluğu grafiği seçilen yer ve yıl için yeniden hesaplanır. Ana sayfadaki Güneş/Ay bileşeni görünür alana yaklaşınca yüklenir; yer değişince güncellenir.
- Görsel sitemapte keyfî sekiz resim sınırı kaldırıldı. Güncel Google şemasına göre kullanımdan kaldırılmış `image:caption` çıkarıldı; açıklayıcı alt metinler HTML'de tutulur. Sayfa başlıkları marka öncesinde `|` kullanır; Fincenin gerektirdiği `YK:n` gibi dilbilgisel işaretler korunur.

## Doğrulama kapsamı

40 Node testi ve 19 IndexNow testi geçti. Tam dosya denetimi 1.234 HTML, 1.004 PDF ve 1.004 tam çözünürlüklü görüntüde hata bulmadı. Her PDF tek sayfa; görüntünün fiziksel kâğıt boyutuna göre 600 dpi değeri ve gerçek dosya metadata'sı denetlenir. Önbellek arşivi yayımlandığı adresten boş bir klasöre tekrar indirilip 3.012 dosyanın SHA-256 değeri karşılaştırıldı.

1.234 sayfa 320 ve 1.366 pikselde otomatik tarandı; iki oluşturucu sayfasının taşması düzeltilip yeniden kontrol edildi. Temsilî işlevler Chrome ve WebKit'te, dört ekran genişliğinde çalıştırıldı. 48 görünümdeki Axe incelemesinde bulunan kontrast, başlık sırası ve klavye erişimi sorunları giderildi. Bu, bağımsız WCAG sertifikası değildir. 2027–2030 yıllık baskılarında ana sayfa ve yıl sayfası ayrı ayrı, 12 ayın tamamıyla tek sayfada doğrulandı.

Canlı yayın ancak GitHub/Cloudflare sonucu ve gerçek alan adındaki `release.json` kaynak sürümü eşleştirildikten sonra tamamlanmış kabul edilir. Ayrıntılı, kaynak sürümüne bağlı yayın sonuçları Türkçe görsel raporda tutulur. Laboratuvar performans skorları ölçüm koşullarıyla birlikte verilir; bütün cihazlar veya arama sıralaması için garanti sayılmaz.
