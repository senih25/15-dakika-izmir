# Veri güncelliği, kaynak atfı ve yayın sınırı — GH-OPT-GPT2 G-09

**Kapsam:** `15-dakika-izmir` kod/CI kaydı, mevcut `kaggle/validation_report.json` ve `api/meta.js` içindeki resmi kaynak kayıtları. Bu değişiklik canlı belediye servislerini çağırmaz, veri kümesini yeniden indirmez ve üretime dağıtım yapmaz.

## Kanıt ve lisans ayrımı

- **Veri yayıncısı:** İzmir Büyükşehir Belediyesi Açık Veri Portalı (`https://acikveri.bizizmir.com/`). Uygulamanın `api/meta.js` kataloğunda beş hizmet katmanının kaynak sayfaları, atıfları ve **CC BY 4.0** bilgileri listeleniyor.
- **Uygulama kodu:** Bu deponun kendi `LICENSE` dosyası **MIT**. Bu lisans belediyeye ait veri kaynaklarının lisansını değiştirmez.
- **Snapshot tarihi:** `kaggle/validation_report.json` içindeki `generated_at` ve katman başına `retrieved_at` alanları, **geçmiş veri derlemesinin** zaman damgalarıdır. Bu tarihler canlı İzBB API'sinin o anda yanıt verdiğini göstermez.
- **Nöbetçi eczane uyarısı:** Tarihsel/snapshot nöbet verisi, bugün nöbetçi olan eczanenin kanıtı değildir. Canlı uygulama kullanıcıya kaynak/yenileme bilgisini sunmalı, veriyi güncel nöbet teyidi olarak tanıtmamalıdır.

## CI kalite kapısı

`test/freshness.mjs` şu kontrolleri **ağ isteği yapmadan** yürütür:

1. Beş resmi hizmet katmanı hem uygulama kaynak kataloğunda hem doğrulama raporunda mevcut.
2. Kaynak adı, veri atfı, lisans ve veri kümesi URL'leri boş veya farklı bir sağlayıcıya yönlendirilmiş değil.
3. Snapshot tarihleri geçerli ve gelecekte değil; aylık güncelliğin otomatik kontrolü için **45 gün** üst sınırı kullanılır. Bu bir ürün bakım eşiğidir, kaynağın günlük olarak güncel olduğunu kanıtlamaz.
4. Kaydedilmiş veri kalite bayrakları (lisans, koordinat, benzersiz ID) doğrulama raporunda `true` olarak durur.

`npm run check`, `npm test` ve `node test/freshness.mjs` ayrı Github Actions adımlarıdır. Eşik aşılırsa önce resmi kaynakları ve erişimi doğrulayıp yeni snapshot üretmek, ardından kaynağın lisans/atfını kontrol etmek gerekir. **Testi susturmak için tarihi elle güncelleme.**

## Sınırlar ve rollback

- Konum verisi tarayıcıda işlenir; bu PR konum gönderimini, analitik toplanmasını veya API isteklerini değiştirmez.
- Nöbetçi eczane, hastane, pazar veya afet verileri hakkında resmi doğruluk/güncellik garantisi verilmez.
- Yapılan değişiklikler yalnız dokümantasyon, ağsız test ve CI tanımından ibarettir.
- Rollback: PR'ı kapat veya CI/test/dokümantasyon commitini incelemeli PR ile geri al.
