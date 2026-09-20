# İzmir Açık Veri Portalı — Başarı Örneği Başvuru Paketi

## Proje
**İzmir Yakınımda — 1 km Yaşam Kartım**

Canlı site: https://15-dakika-izmir.vercel.app  
GitHub: https://github.com/senih25/15-dakika-izmir

## Kısa tanım
İzmir'de yaşayanların 500 m, 1 km veya 2 km çevresindeki kamusal hizmetleri tek kartta görmesini sağlayan gizlilik dostu açık veri uygulaması. Kullanıcı konumu yalnız tarayıcıda kullanılır; sunucuya koordinat gönderilmez. Sonuçlar paylaşılabilir bir görsel karta dönüştürülebilir.

## Özgün değer
- Genel şehir rehberi yerine kişiye göre çevre özeti.
- Beş hizmet katmanını aynı mesafe sözleşmesi altında karşılaştırır.
- Puan/ranking yerine kaynak-verili sayım ve en yakın mesafe gösterir.
- Paylaşım kartı koordinat veya açık adres içermez.
- Veri çekim zamanı, lisans, kapsam ve metodoloji kullanıcıya görünür.
## Kullanılan İzBB Açık Veri setleri
1. Nöbetçi Eczaneler ve Eczane Listesi  
   https://acikveri.bizizmir.com/dataset/nobetci-eczaneler-ve-eczane-listesi
2. Sağlık Kurumları  
   https://acikveri.bizizmir.com/dataset/saglik-kurumlari
3. Semt Pazar Yerleri  
   https://acikveri.bizizmir.com/dataset/semt-pazar-yerleri
4. Afet ve Acil Durum Toplanma Alanları  
   https://acikveri.bizizmir.com/dataset/afet-ve-acil-durum-toplanma-alanlari

## Önerilen etiketler
`acikveri`, `sağlık`, `afet`, `harita`, `günlük yaşam`, `erişim`, `gizlilik`

## Teknik ve etik sınırlar
- Veri lisansı: İzBB Açık Veri Lisansı / CC BY 4.0.
- İzBB resmî uygulaması değildir; bağımsız kamu yararı uygulamasıdır.
- Haversine kuş-uçuşu mesafe kullanılır.
- Sonuçlar yürüme/araç seyahat süresi değildir.
- Mahalle veya kişi puanlaması yapılmaz.
- Kaynakta veri bulunmaması “hizmet yok” şeklinde yorumlanmaz.
## Doğrulama kanıtı
- `npm run check` PASS.
- `npm test` PASS.
- Beş kaynak için canlı smoke test PASS.
- Bilinmeyen veri türü 400 ile fail-closed.
- `/api/proximity` konum parametresi almaz ve `locationReceived=false` döndürür.
- Paylaşım metni/PNG üretimi kişisel koordinat içermez.
- Production HTTPS ve Vercel Hobby deployment kullanılır.
- Uygulama kodunda secret exposure taraması 0 bulgu.

## Portal incelemesi için önerilen açıklama
“İzmir Yakınımda, İzmir Büyükşehir Belediyesi Açık Veri Portalı'ndaki sağlık, eczane, semt pazarı ve afet toplanma alanı verilerini birleştirerek vatandaşın 500 m, 1 km veya 2 km çevresindeki hizmetleri tek kişisel kartta görmesini sağlar. Konum cihazdan çıkmaz; hesap tarayıcıda yapılır. Kullanıcı sonucu koordinat veya açık adres içermeyen bir görsel kart olarak paylaşabilir. Tüm kaynaklar, veri çekim zamanı, CC BY 4.0 atfı ve metodoloji uygulama içinde açıkça gösterilir.”

## Başvuru kanalı
Portal SSS'ye göre geliştirilen uygulamanın GitHub bağlantısı https://acikveri.bizizmir.com/contact adresinden gönderilir. İncelemeden geçen uygulamalar “Başarı Örnekleri” bölümünde yayımlanır.
