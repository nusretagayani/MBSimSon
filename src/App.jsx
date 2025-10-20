import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, TrendingDown, PlayCircle, RotateCcw } from 'lucide-react';

export default function MerkezBankasiSimulator() {
  // Ekonomik göstergeler
  const [enflasyon, setEnflasyon] = useState(45);
  const [issizlik, setIssizlik] = useState(13);
  const [mbRezervi, setMbRezervi] = useState(80);
  const [gsyhBuyume, setGsyhBuyume] = useState(3);
  const [dolarKuru, setDolarKuru] = useState(35);
  
  // Politika araçları
  const [faizOrani, setFaizOrani] = useState(25);
  const [kurMudahalesi, setKurMudahalesi] = useState(0);
  
  // Oyun durumu
  const [gameOver, setGameOver] = useState(false);
  const [gameOverReason, setGameOverReason] = useState('');
  
  // Tarihçe
  const [history, setHistory] = useState([{
    ay: 0,
    enflasyon: 45,
    issizlik: 13,
    mbRezervi: 80,
    gsyhBuyume: 3,
    dolarKuru: 35
  }]);

  // Başlangıç değerleri
  const resetSimulation = () => {
    setEnflasyon(45);
    setIssizlik(13);
    setMbRezervi(80);
    setGsyhBuyume(3);
    setDolarKuru(35);
    setFaizOrani(25);
    setKurMudahalesi(0);
    setGameOver(false);
    setGameOverReason('');
    setHistory([{
      ay: 0,
      enflasyon: 45,
      issizlik: 13,
      mbRezervi: 80,
      gsyhBuyume: 3,
      dolarKuru: 35
    }]);
  };

  // Bir ay ilerlet
  const advanceMonth = () => {
    if (gameOver) return;
    
    // Faiz politikasının etkisi (Daha net reel faiz etkisi)
    const faizFarki = faizOrani - enflasyon;
    
    // Yeni enflasyon hesapla (reel faiz odaklı - daha dengeli)
    let yeniEnflasyon = enflasyon;
    
    // Pozitif reel faiz: Faiz enflasyonun üzerindeyse enflasyon düşer
    if (faizOrani > enflasyon + 10) {
      // Çok güçlü pozitif reel faiz
      yeniEnflasyon = Math.max(2, enflasyon - (Math.random() * 3 + 2));
    } else if (faizOrani > enflasyon + 5) {
      // Güçlü pozitif reel faiz
      yeniEnflasyon = Math.max(2, enflasyon - (Math.random() * 2.5 + 1.5));
    } else if (faizOrani > enflasyon + 2) {
      // Orta pozitif reel faiz
      yeniEnflasyon = Math.max(2, enflasyon - (Math.random() * 2 + 1));
    } else if (faizOrani > enflasyon) {
      // Hafif pozitif reel faiz
      yeniEnflasyon = Math.max(2, enflasyon - (Math.random() * 1.2 + 0.5));
    } else if (faizOrani < enflasyon - 10) {
      // Çok negatif reel faiz
      yeniEnflasyon = Math.min(120, enflasyon + (Math.random() * 3 + 1.5));
    } else if (faizOrani < enflasyon - 5) {
      // Negatif reel faiz
      yeniEnflasyon = Math.min(120, enflasyon + (Math.random() * 2 + 1));
    } else if (faizOrani < enflasyon) {
      // Hafif negatif reel faiz
      yeniEnflasyon = Math.min(120, enflasyon + (Math.random() * 1.5 + 0.5));
    } else {
      // Nötr - minimal artış
      yeniEnflasyon = enflasyon + (Math.random() * 0.5 - 0.2);
    }

    // Kur müdahalesi etkisi
    let yeniRezerv = mbRezervi;
    let yeniKur = dolarKuru;
    
    if (kurMudahalesi > 0) {
      // Döviz alımı
      yeniRezerv = Math.min(200, mbRezervi + kurMudahalesi * 0.12);
      yeniKur = dolarKuru + kurMudahalesi * 0.015;
      yeniEnflasyon += kurMudahalesi * 0.025;
    } else if (kurMudahalesi < 0) {
      // Döviz satışı
      yeniRezerv = Math.max(0, mbRezervi + kurMudahalesi * 0.12);
      yeniKur = Math.max(10, dolarKuru + kurMudahalesi * 0.015);
      yeniEnflasyon += kurMudahalesi * 0.025;
    } else {
      // Serbest piyasa hareketi (daha volatil)
      yeniKur = dolarKuru + (Math.random() - 0.35) * (enflasyon * 0.08);
    }

    // Kur ve enflasyon ilişkisi (güçlendirildi)
    const kurDegisim = ((yeniKur - dolarKuru) / dolarKuru) * 100;
    if (kurDegisim > 2) {
      yeniEnflasyon += kurDegisim * 0.5;
    }

    // İşsizlik hesapla (Phillips Eğrisi - güçlendirildi)
    let yeniIssizlik = issizlik;
    if (faizOrani > 35) {
      // Çok yüksek faiz -> Ekonomi donuyor
      yeniIssizlik = Math.min(35, issizlik + (Math.random() * 2 + 1.2));
    } else if (faizOrani > 25) {
      // Yüksek faiz -> İşsizlik artıyor
      yeniIssizlik = Math.min(35, issizlik + (Math.random() * 1.5 + 0.8));
    } else if (faizOrani < 15) {
      // Düşük faiz -> İşsizlik azalıyor
      yeniIssizlik = Math.max(3, issizlik - (Math.random() * 1.2 + 0.5));
    } else {
      yeniIssizlik = issizlik + (Math.random() - 0.5) * 1.2;
    }

    // Yüksek enflasyon işsizliği artırır
    if (yeniEnflasyon > 60) {
      yeniIssizlik += 1;
    }

    // GSYİH büyümesi hesapla (faiz-enflasyon ilişkisi odaklı - daha dengeli)
    let yeniBuyume = gsyhBuyume;
    const faizEnflasyonFarki = faizOrani - enflasyon;
    
    if (faizEnflasyonFarki > 20) {
      // Çok yüksek reel faiz -> Ekonomi yavaşlıyor
      yeniBuyume = Math.max(-8, gsyhBuyume - (Math.random() * 1.2 + 0.6));
    } else if (faizEnflasyonFarki > 15) {
      // Yüksek reel faiz -> Büyüme hafif yavaşlıyor
      yeniBuyume = Math.max(-8, gsyhBuyume - (Math.random() * 0.9 + 0.4));
    } else if (faizEnflasyonFarki > 10) {
      // Orta-yüksek reel faiz -> Hafif yavaşlama
      yeniBuyume = gsyhBuyume - (Math.random() * 0.6 + 0.2);
    } else if (faizEnflasyonFarki >= -3 && faizEnflasyonFarki <= 5) {
      // Dengeli bölge -> Büyüme stabil (minimal hareket)
      yeniBuyume = gsyhBuyume + (Math.random() - 0.5) * 0.4;
    } else if (faizEnflasyonFarki < -10) {
      // Çok düşük faiz (enflasyon çok üstte) -> Büyüme artıyor
      yeniBuyume = Math.min(10, gsyhBuyume + (Math.random() * 1 + 0.5));
    } else if (faizEnflasyonFarki < -5) {
      // Düşük faiz -> Büyüme hafif artıyor
      yeniBuyume = Math.min(10, gsyhBuyume + (Math.random() * 0.8 + 0.4));
    } else if (faizEnflasyonFarki < 0) {
      // Hafif negatif reel faiz -> Küçük artış
      yeniBuyume = Math.min(10, gsyhBuyume + (Math.random() * 0.5 + 0.2));
    } else {
      // Diğer durumlar -> Minimal değişim
      yeniBuyume = gsyhBuyume + (Math.random() - 0.5) * 0.5;
    }

    // Yüksek enflasyon büyümeyi yavaşlatır (ama daha az agresif)
    if (yeniEnflasyon > 70) {
      yeniBuyume -= 1.2;
    } else if (yeniEnflasyon > 60) {
      yeniBuyume -= 0.8;
    }

    // Rezerv sürdürülebilirliği (daha kritik)
    if (yeniRezerv < 30) {
      yeniEnflasyon += 8;
      yeniBuyume -= 3;
      yeniKur += 8;
    }

    // Değerleri güncelle
    const finalEnflasyon = Math.max(0, Math.min(120, yeniEnflasyon));
    const finalIssizlik = Math.max(0, Math.min(35, yeniIssizlik));
    const finalRezerv = Math.max(0, Math.min(200, yeniRezerv));
    const finalBuyume = Math.max(-10, Math.min(15, yeniBuyume));
    const finalKur = Math.max(10, Math.min(150, yeniKur));

    setEnflasyon(finalEnflasyon);
    setIssizlik(finalIssizlik);
    setMbRezervi(finalRezerv);
    setGsyhBuyume(finalBuyume);
    setDolarKuru(finalKur);

    // Oyun sonu kontrolü
    let oyunBitti = false;
    let sebep = '';

    if (finalEnflasyon > 80) {
      oyunBitti = true;
      sebep = 'Hiperenflasyon! Enflasyon %80\'i aştı. Ekonomi çöktü! 📉';
    } else if (finalIssizlik > 35) {
      oyunBitti = true;
      sebep = 'İşsizlik Krizi! İşsizlik %35\'i aştı. Sosyal kriz! 👥';
    } else if (finalRezerv < 10) {
      oyunBitti = true;
      sebep = 'Rezerv Krizi! MB rezervleri tükendi. Ekonomik bağımsızlık sona erdi! 💰';
    } else if (finalBuyume < -10) {
      oyunBitti = true;
      sebep = 'Ekonomik Çöküş! GSYİH büyümesi %-10\'un altında. Derin resesyon! 📊';
    } else if (finalKur > 100) {
      oyunBitti = true;
      sebep = 'Kur Krizi! Dolar kuru 100 TL\'yi aştı. Para birimi değersizleşti! 💵';
    }

    if (oyunBitti) {
      setGameOver(true);
      setGameOverReason(sebep);
      // 3 saniye sonra otomatik sıfırla
      setTimeout(() => {
        resetSimulation();
      }, 3000);
    }

    // Tarihçeye ekle
    setHistory(prev => {
      const newHistory = [...prev, {
        ay: prev.length,
        enflasyon: finalEnflasyon,
        issizlik: finalIssizlik,
        mbRezervi: finalRezerv,
        gsyhBuyume: finalBuyume,
        dolarKuru: finalKur
      }];
      if (newHistory.length > 24) {
        return newHistory.slice(-24);
      }
      return newHistory;
    });
  };

  return (
    <div className="p-4 max-w-7xl mx-auto bg-gray-50">
      <div className="mb-4">
        <h1 className="text-3xl font-bold mb-1 text-gray-800">Merkez Bankası Simülatörü</h1>
        <p className="text-sm text-gray-600">Para politikası araçlarını kullanarak ekonomiyi yönetin</p>
      </div>

      {/* Game Over Ekranı */}
      {gameOver && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 max-w-md mx-4 shadow-2xl">
            <div className="text-center">
              <div className="text-6xl mb-4">😢</div>
              <h2 className="text-3xl font-bold text-red-600 mb-4">OYUN BİTTİ!</h2>
              <p className="text-lg text-gray-700 mb-6">{gameOverReason}</p>
              <div className="bg-gray-100 rounded-lg p-4 mb-6 text-sm text-left">
                <p className="font-semibold mb-2">Son Durum:</p>
                <p>• Enflasyon: %{enflasyon.toFixed(1)}</p>
                <p>• İşsizlik: %{issizlik.toFixed(1)}</p>
                <p>• MB Rezervi: ${mbRezervi.toFixed(1)}M</p>
                <p>• GSYİH Büyüme: %{gsyhBuyume.toFixed(1)}</p>
                <p>• Dolar Kuru: ₺{dolarKuru.toFixed(2)}</p>
                <p className="mt-2 font-semibold">Toplam Süre: {history.length} ay</p>
              </div>
              <p className="text-sm text-gray-600 mb-4">Oyun 3 saniye içinde yeniden başlayacak...</p>
              <button
                onClick={resetSimulation}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
              >
                Hemen Yeniden Başla
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Sol Panel - Göstergeler ve Araçlar */}
        <div className="lg:col-span-1 space-y-4">
          {/* Ekonomik Göstergeler */}
          <div className="bg-white p-4 rounded-lg shadow">
           <div className="bg-white p-4 rounded-lg shadow">
  <h2 className="text-lg font-semibold mb-3 text-gray-700">Ekonomik Göstergeler</h2>

  {/* Enflasyon – Rose */}
  <div className="p-3 rounded-lg mb-2 bg-gradient-to-r from-rose-50 to-rose-100 border border-rose-200">
    <div className="flex justify-between items-center">
      <span className="text-sm font-medium text-rose-800">Enflasyon</span>
      <span className="text-xl font-bold text-rose-700">%{enflasyon.toFixed(1)}</span>
    </div>
  </div>

  {/* İşsizlik – Amber */}
  <div className="p-3 rounded-lg mb-2 bg-gradient-to-r from-amber-50 to-amber-100 border border-amber-200">
    <div className="flex justify-between items-center">
      <span className="text-sm font-medium text-amber-800">İşsizlik</span>
      <span className="text-xl font-bold text-amber-700">%{issizlik.toFixed(1)}</span>
    </div>
  </div>

  {/* MB Rezervi – Sky */}
  <div className="p-3 rounded-lg mb-2 bg-gradient-to-r from-sky-50 to-sky-100 border border-sky-200">
    <div className="flex justify-between items-center">
      <span className="text-sm font-medium text-sky-800">MB Rezervi</span>
      <span className="text-xl font-bold text-sky-700">${mbRezervi.toFixed(1)}M</span>
    </div>
  </div>

  {/* GSYİH Büyüme – Emerald */}
  <div className="p-3 rounded-lg mb-2 bg-gradient-to-r from-emerald-50 to-emerald-100 border border-emerald-200">
    <div className="flex justify-between items-center">
      <span className="text-sm font-medium text-emerald-800">GSYİH Büyüme</span>
      <span className="text-xl font-bold text-emerald-700">%{gsyhBuyume.toFixed(1)}</span>
    </div>
  </div>

  {/* Dolar Kuru – Indigo */}
  <div className="p-3 rounded-lg bg-gradient-to-r from-indigo-50 to-indigo-100 border border-indigo-200">
    <div className="flex justify-between items-center">
      <span className="text-sm font-medium text-indigo-800">Dolar Kuru</span>
      <span className="text-xl font-bold text-indigo-700">₺{dolarKuru.toFixed(2)}</span>
    </div>
  </div>
</div>
          </div>

          {/* Para Politikası Araçları */}
          <div className="bg-white p-4 rounded-lg shadow">
            <h2 className="text-lg font-semibold mb-3 text-gray-700">Para Politikası</h2>
            
            <div className="mb-4">
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-medium text-gray-700">Politika Faizi</label>
                <span className="text-lg font-bold text-blue-600">%{faizOrani}</span>
              </div>
              <input
                type="range"
                min="5"
                max="50"
                step="0.5"
                value={faizOrani}
                onChange={(e) => setFaizOrani(parseFloat(e.target.value))}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>%5</span>
                <span>%50</span>
              </div>
              <div className="mt-2 text-xs bg-blue-50 p-2 rounded">
                Reel Faiz: {(faizOrani - enflasyon) > 0 ? '+' : ''}{(faizOrani - enflasyon).toFixed(1)} puan
                {faizOrani > enflasyon && <span className="text-green-600 font-semibold ml-2">✓ Enflasyon düşüyor</span>}
                {faizOrani <= enflasyon && <span className="text-red-600 font-semibold ml-2">⚠ Enflasyon yükseliyor</span>}
              </div>
            </div>

            <div className="mb-4">
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-medium text-gray-700">Kur Müdahalesi</label>
                <span className="text-lg font-bold text-purple-600">
                  {kurMudahalesi === 0 ? '0' : kurMudahalesi > 0 ? `+${kurMudahalesi}` : kurMudahalesi}
                </span>
              </div>
              <input
                type="range"
                min="-100"
                max="100"
                step="10"
                value={kurMudahalesi}
                onChange={(e) => setKurMudahalesi(parseInt(e.target.value))}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>Döviz Sat</span>
                <span>Döviz Al</span>
              </div>
            </div>
          </div>

          {/* Aksiyon Butonları */}
          <div className="space-y-2">
            <button
              onClick={advanceMonth}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg shadow-lg flex items-center justify-center gap-2 transition-colors"
            >
              <PlayCircle size={20} />
              1 Ay İlerlet
            </button>
            <button
              onClick={resetSimulation}
              className="w-full bg-gray-600 hover:bg-gray-700 text-white font-semibold py-3 px-4 rounded-lg shadow-lg flex items-center justify-center gap-2 transition-colors"
            >
              <RotateCcw size={20} />
              Sıfırla
            </button>
          </div>
        </div>

        {/* Sağ Panel - Grafikler */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-3 text-gray-700">Enflasyon ve İşsizlik</h3>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={history}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="ay" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="enflasyon" stroke="#ef4444" strokeWidth={2} name="Enflasyon (%)" />
                <Line type="monotone" dataKey="issizlik" stroke="#f59e0b" strokeWidth={2} name="İşsizlik (%)" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-3 text-gray-700">Dolar Kuru</h3>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={history}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="ay" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="dolarKuru" stroke="#3b82f6" strokeWidth={2} name="USD/TRY" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-3 text-gray-700">Rezerv ve GSYİH Büyümesi</h3>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={history}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="ay" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="mbRezervi" stroke="#8b5cf6" strokeWidth={2} name="Rezerv ($M)" />
                <Line type="monotone" dataKey="gsyhBuyume" stroke="#10b981" strokeWidth={2} name="GSYİH Büyüme (%)" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Bilgi Kutusu */}
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <h3 className="font-semibold text-gray-800 mb-2 text-sm">💡 Nasıl Oynanır</h3>
            <div className="text-xs text-gray-700 space-y-1">
              <p>• <strong>Faiz ↑:</strong> Enflasyon düşer, büyüme yavaşlar, işsizlik artar</p>
              <p>• <strong>Faiz ↓:</strong> Büyüme hızlanır, enflasyon yükselir</p>
              <p>• <strong>Döviz Al (+):</strong> Rezerv artar, kur yükselir</p>
              <p>• <strong>Döviz Sat (-):</strong> Rezerv azalır, kura baskı</p>
              <div className="bg-red-100 border border-red-300 rounded p-2 mt-2">
                <p className="font-bold text-red-700">⚠️ OYUN BİTİŞ KOŞULLARI:</p>
                <p className="text-red-600">• Enflasyon {'>'} %80</p>
                <p className="text-red-600">• İşsizlik {'>'} %35</p>
                <p className="text-red-600">• Rezerv {'<'} $10M</p>
                <p className="text-red-600">• GSYİH Büyüme {'<'} %-10</p>
                <p className="text-red-600">• Dolar Kuru {'>'} ₺100</p>
              </div>
              <p className="text-blue-700 font-semibold mt-2">🎯 Hedef: Ekonomiyi dengede tutun!</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
