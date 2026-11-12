# Yayın ve doğrulama

1. Son kullanıcının açık canlıya alma talimatını ve çalışma ağacını kontrol et. Başka projelerin değişikliklerini bu depoya ekleme.
2. `corepack pnpm install --frozen-lockfile`, `corepack pnpm test`, `corepack pnpm build` çalıştır.
3. 600 dpi arşivi SHA-256 doğrulamasından geçmelidir. Her iç dosya da bağımsız özetle kontrol edilir. Kaynak renderer özetleri değişirse o aile yeniden üretilir; eski önbellek yeniymiş gibi kullanılmaz.
4. Cloudflare Pages sınırları: 20 dakika build, tek varlıkta 25 MiB, ücretsiz planda 20.000 dosya. Önbellek üretim kalitesini azaltmadan tekrar üretim süresini sınırlar.
5. Ana dalın gerçek Git değişikliğini yayımla. GitHub denetim ve Cloudflare Pages durumlarının ikisinin de başarılı olmasını bekle.
6. Canlı `/release.json` içindeki commit'in gönderilen kaynakla aynı olduğunu doğrula. Kuyruğa alınmış veya yalnız CI'da tamamlanmış iş canlı kabul edilmez.
7. Sade ana URL, gerçek 404, XML, canonical/noindex politikası, OG dosyası, favicon, hava/horoskop API ve farklı dosya ailelerinden gerçek indirmeleri kontrol et.
8. Gizli anahtarları çıktı alma. IndexNow, Search Console ve Bing tarafında kabul yanıtını indekslenmiş olmakla karıştırma.

Bu depo Google/Bing hesap kimliği veya bilinmeyen izleme kodu üretmez. Üretimden hemen sonraki kaynak/metadata/indirme kontrolü ile 7/28/56 günlük gerçek kullanıcı ve arama performansı izlemesi ayrı işlerdir; bunlar zamanlanmış otomasyon gibi sunulmaz.
