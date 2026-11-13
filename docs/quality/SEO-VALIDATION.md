# Yeniden çalıştırılabilir doğrulama

- `corepack pnpm test`: takvim/ISO/Paskalya, Helsinki saat dilimi ve eski saniyeli ofsetler, boş/tekrarlı DST saatleri, yükselen açı referansları, API hata/önbellek, vardiya hesapları, aile kalenteri ICS ve veri doğrulaması, içerik araması ve üniversite kayıtları. 13 Kasım 2026 ölçümü: 40 geçti, 0 kaldı. IndexNow güvenlik ve URL testleri ayrıca 19 geçti.
- `corepack pnpm build`: yazı tipi özetleri, kaynakla bağlı dosya önbelleği, HTML/OG/görseller ve paketleme; ardından tam denetim.
- `corepack pnpm check`: 1.234 HTML ve 1.004 PDF/600 dpi görüntü çifti; yerel yollar, metadata, canonical, Fince dil, JSON-LD, OG, alt ve indirme gerçek boyutları. Son tam dosya denetiminde hata bulunmadı.
- `corepack pnpm start`: yalnız 127.0.0.1:4173. Gerçek sıkıştırma, ETag ve dosya türleriyle yerel prova.

Kaynaklar, anahtarlar veya kişisel kullanıcı verileri rapor dosyalarına aktarılmadı. JSON-LD'nin yerel ayrıştırılması Google'ın canlı zengin sonuç onayı olarak sunulmaz. Axe ve klavye/uygulama kontrolleri bağımsız erişilebilirlik sertifikası değildir.

Ayrıntılı yeni tarayıcı kanıtları ana çalışma alanının `work/reports/finland-redesign-2026-11-13` klasöründedir. Önceki kanıtlar ayrı tarihte korunmuştur. 600 dpi PDF ve yüksek çözünürlüklü görüntülerle küçük web önizlemeleri ayrı tutulur. Yeni dosya veya içerik değişikliği yapıldığında ilgili hesap ve indirme kontrolleri yeniden çalıştırılmalıdır.
