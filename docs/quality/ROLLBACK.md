# Geri dönüş

Finlandiya yenilemesinden önceki kaynak: `003b757`. Native Cloudflare Pages'te daha önce doğrulanmış dağıtım: `d3be1867-2fe6-49fd-9d67-568dc2684684`.

Bir yayın geri alınacaksa önce gerçekten sorunlu kaynak değişikliğini belirle. Cloudflare'ın önceki dağıtımına dönmek veya ayrı, gözden geçirilmiş bir geri dönüş commit'i kullanmak mümkündür. Başka kullanıcının yerel değişikliklerini `reset --hard` ya da `clean` ile silme. Yayın commit'ini ve geri dönüş sonucunu canlı release manifesti üzerinden doğrula.

Tarayıcıdaki kişisel kayıtlar sunucuda tutulmaz. Eski sürüme dönüş yeni saklama anahtarını silmemeli; kişisel notların veya etkinliklerin silinmesi geri dönüş adımı değildir. Gerekiyorsa uyumlu bir okuma katmanı ekle ve kullanıcı verisini koru. Kaynakla bağlı 600 dpi dosya arşivinin özetini değiştirme; gerçekten yeni bir çıktı için yeni sürüm yayımla.
