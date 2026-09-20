const common = {
  publisher: "İzmir Büyükşehir Belediyesi",
  portal: "https://acikveri.bizizmir.com",
  license: "CC BY 4.0",
  licenseUrl: "https://creativecommons.org/licenses/by/4.0/deed.tr",
  attribution: "İzmir Büyükşehir Belediyesi Açık Veri Portalı"
};

export const sources = {
  duty_pharmacy: {
    ...common,
    label: "Nöbetçi eczaneler",
    category: "Sağlık",
    endpoint: "https://openapi.izmir.bel.tr/api/ibb/nobetcieczaneler",
    dataset: "https://acikveri.bizizmir.com/dataset/nobetci-eczaneler-ve-eczane-listesi",
    refreshNote: "Portal günlük güncelleme bildiriyor; nöbet verisi tarih kapsamlıdır.",
    publicStatus: "PUBLIC-BETA"
  },
  pharmacy: {
    ...common,
    label: "Tüm eczaneler",
    category: "Sağlık",
    endpoint: "https://openapi.izmir.bel.tr/api/ibb/eczaneler",
    dataset: "https://acikveri.bizizmir.com/dataset/nobetci-eczaneler-ve-eczane-listesi",
    refreshNote: "Kalıcı eczane listesi; koordinatsız kayıtlar haritada gösterilmez.",
    publicStatus: "PUBLIC-BETA"
  },
  hospital: {
    ...common,
    label: "Hastaneler",
    category: "Sağlık",
    endpoint: "https://openapi.izmir.bel.tr/api/ibb/cbs/hastaneler",
    dataset: "https://acikveri.bizizmir.com/dataset/saglik-kurumlari",
    refreshNote: "Portal güncelleme sıklığını düzensiz bildiriyor; kaynak tarihi görünür tutulur.",
    publicStatus: "PUBLIC-BETA"
  },
  market: {
    ...common,
    label: "Semt pazarları",
    category: "Günlük yaşam",
    endpoint: "https://openapi.izmir.bel.tr/api/ibb/cbs/pazaryerleri",
    dataset: "https://acikveri.bizizmir.com/dataset/semt-pazar-yerleri",
    refreshNote: "Pazar gün/saat açıklamaları kaynak metninden gösterilir.",
    publicStatus: "PUBLIC-BETA"
  },
  assembly: {
    ...common,
    label: "Afet toplanma alanları",
    category: "Afet",
    endpoint: "https://openapi.izmir.bel.tr/api/ibb/cbs/afetaciltoplanmaalani",
    fallback: "https://openfiles.izmir.bel.tr/100104/docs/izbb-afet-ve-acil-durum-toplanma-alanlari.csv",
    dataset: "https://acikveri.bizizmir.com/dataset/afet-ve-acil-durum-toplanma-alanlari",
    refreshNote: "API yavaşsa aynı lisanslı İzBB CSV kaynağı kullanılır.",
    publicStatus: "PUBLIC-BETA"
  }
};

export default function handler(req, res) {
  res.setHeader("Cache-Control", "public, s-maxage=3600, stale-while-revalidate=86400");
  res.status(200).json({
    project: "15 Dakika İzmir",
    mode: "PUBLIC-BETA",
    generatedAt: new Date().toISOString(),
    privacy: "Kullanıcı konumu API'ye gönderilmez; mesafe hesabı tarayıcıda yapılır.",
    ranking: "Mahalle sıralaması veya composite skor bu sürümde yayımlanmaz.",
    sources
  });
}