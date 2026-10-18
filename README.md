# 15 Dakika İzmir — İzmir Erişim Haritası

İzmir'de yaşayanların nöbetçi eczane, hastane, afet toplanma alanı, semt pazarı ve eczane gibi kamusal hizmet noktalarını açık veri üzerinden bulabilmesi için hazırlanmış bağımsız kamu yararı web uygulaması.

## İlkeler
- Yalnız whitelist edilmiş İzmir Büyükşehir Belediyesi Açık Veri kaynakları.
- Veri lisansı ve resmî kaynak bağlantısı kullanıcıya görünür.
- Kullanıcı konumu uygulama API'sine gönderilmez; mesafe hesabı tarayıcıda yapılır.
- Hesap, reklam, davranış analitiği ve konum geçmişi yoktur.
- “Veri yok” hiçbir zaman “hizmet yok” olarak yorumlanmaz.
- Mahalleleri tek composite skorla sıralama bu PUBLIC-BETA sürümünde kapalıdır.

## Kaynaklar
- Nöbetçi eczaneler / eczane listesi
- Hastaneler
- Semt pazar yerleri
- Afet ve acil durum toplanma alanları

Tüm hizmet verileri İzmir Büyükşehir Belediyesi Açık Veri Portalı üzerinden sağlanır ve aksi belirtilmedikçe CC BY 4.0 lisanslıdır.

## Doğrulama
```powershell
npm run check
npm test
vercel dev
```

## CI ve veri güncelliği sınırı

GitHub Actions `g09-offline-ci.yml`, **Node 24 ile yalnız sentetik ve ağsız** `npm run check`, `node test/proximity.mjs` ve `node test/metadata-contract.mjs` testlerini çalıştırır. Gerçek konum, eczane/sağlık kayıtları, kullanıcı oturumu veya canlı İzBB API çağrısı yapılmaz.

`kaggle/validation_report.json` dosyasındaki `generated_at` bir **geçmiş Kaggle veri anlık görüntüsünü** tarihlendirir. Bu tarih uygulamanın canlı API'den aldığı her kaydın güncel olduğunu kanıtlamaz. Test anlık görüntünün yaşını `RECENT / AGING / STALE` olarak sınıflandırır; iki günden eski kayıt için özellikle nöbetçi eczane güncelliği uyarısı verir. Güncel nöbet, hastane, pazar ve afet bilgileri için her zaman kaynak portal ve gerçek veri çekim tarihi ayrıca kontrol edilmelidir. Uygulama bağımsız bir kamu yararı prototipidir; İzBB adına resmî hizmet sunmaz.

Atıf ve lisans metni `api/meta.js`, `kaggle/sources.csv` ve ilgili [İzBB Açık Veri Portalı](https://acikveri.bizizmir.com/) veri kümesi sayfalarına dayanır. Kaynak sayfasında güncel lisans koşulu değişirse bu README tek başına yeniden kullanım hakkı sağlamaz.

## Yayın kapısı
PUBLIC-STABLE için freshness, license, schema/spatial QA, coverage, accessibility, correction/redress, reproducibility ve release-manifest kontrollerinin tamamı PASS olmalıdır.

## İzmir Yakınımda — v0.2.0

`İzmir 1 km Yaşam Kartım` kullanıcı konumunu sunucuya göndermeden 500 m, 1 km veya 2 km çevresindeki hizmetleri özetler.

- 4 resmî veri setinden 5 katman: nöbetçi eczane, eczane, hastane, semt pazarı, afet toplanma alanı.
- Haversine kuş-uçuşu mesafe; seyahat süresi veya rota iddiası yok.
- Kişisel koordinat API isteklerine eklenmez.
- Paylaşılabilir metin ve 1200×630 PNG kart koordinat/açık adres içermez.
- Sosyal paylaşım önizlemesi için Open Graph kartı mevcuttur.
- Kompakt `/api/proximity` uç noktası yalnız İzmir geneli açık veri noktalarını döndürür ve `locationReceived=false` sözleşmesi taşır.

Canlı sürüm: https://15-dakika-izmir.vercel.app

## Başarı Örneği başvurusu

Portal incelemesi için hazırlanmış başvuru özeti: `docs/SHOWCASE_SUBMISSION.md`.
