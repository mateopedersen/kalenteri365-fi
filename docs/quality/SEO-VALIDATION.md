# Yeniden çalıştırılabilir doğrulama

- `corepack pnpm test`: takvim/ISO/Paskalya, Helsinki saat dilimi ve eski saniyeli ofsetler, boş/tekrarlı DST saatleri, yükselen açı referansları, API hata/önbellek, vardiya hesapları, içerik araması ve üniversite kayıtları. Son ölçüm: 32 geçti, 0 kaldı.
- `corepack pnpm build`: yazı tipi özetleri, kaynakla bağlı dosya önbelleği, HTML/OG/görseller ve paketleme; ardından tam denetim.
- `corepack pnpm check`: 1.233 HTML ve 432 dosya çifti; yerel yollar, metadata, canonical, Fince dil, JSON-LD, OG, alt ve indirme gerçek boyutları.
- `corepack pnpm start`: yalnız 127.0.0.1:4173. Gerçek sıkıştırma, ETag ve dosya türleriyle yerel prova.

Kaynaklar, anahtarlar veya kişisel kullanıcı verileri rapor dosyalarına aktarılmadı. JSON-LD'nin yerel ayrıştırılması Google'ın canlı zengin sonuç onayı olarak sunulmaz. Axe ve klavye/uygulama kontrolleri bağımsız erişilebilirlik sertifikası değildir.

Ayrıntılı tarayıcı kanıtları ana çalışma alanının `work/reports/finland-2026-11-12` klasöründedir. 600 dpi PDF ve yüksek çözünürlüklü görüntülerle küçük web önizlemeleri ayrı tutulur. Yeni dosya veya içerik değişikliği yapıldığında ilgili hesap ve indirme kontrolleri yeniden çalıştırılmalıdır.
