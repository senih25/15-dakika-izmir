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

**GitHub CI (ağ erişimi gerektirmeyen testler):**

```powershell
npm run check
node test/proximity.mjs
node test/public-metadata.mjs
```

Bu testler İzBB API'sine, kullanıcı konumuna veya harici modele istek göndermez. `test/public-metadata.mjs` beş resmî veri kaynağının CC BY 4.0 atfını, `PUBLIC-BETA` sınırlarını ve **arşiv Kaggle snapshot'ının 45 günlük güncellik kapısını** kontrol eder. Snapshot doğrulaması, canlı nöbetçi eczane veya gerçek zamanlı kaynak güncelliğini kanıtlamaz.

**Canlı kaynaklara erişen manuel smoke** (dış bağlantı gerektirir; CI'da otomatik çalışmaz):

```powershell
npm test
vercel dev
```

Kaynak erişilemezse bunu hizmetin bulunmadığı şeklinde yorumlama; `api/meta` kaynağını ve atıf bilgisini kullanıcıya göster.

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
