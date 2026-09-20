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

## Yayın kapısı
PUBLIC-STABLE için freshness, license, schema/spatial QA, coverage, accessibility, correction/redress, reproducibility ve release-manifest kontrollerinin tamamı PASS olmalıdır.
