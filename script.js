const canvas = document.getElementById('canvas');
const thumbnailsDiv = document.getElementById('thumbnails');
const addedPartsMap = new Map();

// 優先順位：数字が大きいほど上に重なる
const categoryZIndex = {
  occiput: 1,
  hair: 2,
  face: 3,
  back: 4,
  socks: 5,
  shoes: 6,
  inner: 7,
  bottoms: 8,
  tops: 9,
  dress: 9.5,
  outer: 10,
  accessories: 11,
  sidehair: 12,
  headwear: 13,
  item: 14,
  others: 15
};

// カウント管理にも追加
let layerCounters = {
  occiput: 0,
  hair: 0,
  face: 0,
  back: 0,
  inner: 0,
  tops: 0,
  bottoms: 0,
  socks: 0,
  shoes: 0,
  outer: 0,
  accessories: 0,
  sidehair: 0,
  headwear: 0,
  item: 0,
  others: 0
};

layerCounters.dress = 0;

// パーツ定義にもbackカテゴリを追加
const parts = {
  occiput: ['博麗のリボン.png','厄神様のリボン.png'],
  hair: ['霊夢の髪.png','魔理沙の髪.png','レミリアの髪.png','雛の髪.png','早苗の髪.png','早苗の髪（短）.png','さとりの髪.png','こいしの髪.png','こいしの髪（智）.png','ナズーリンの髪.png','小傘の髪.png','董子の髪.png','隠岐奈の髪.png','ちやりの髪.png','ユイマンの髪.png'],
  face: ['霊夢の顔.png','魔理沙の顔.png','レミリアの顔.png','雛の顔.png','早苗の顔.png','さとりの顔.png','こいしの顔.png','ナズーリンの顔.png','小傘の顔.png','董子の顔.png','隠岐奈の顔.png','ちやりの顔.png','ユイマンの顔.png'],
  back: ['レミリアの羽.png','ナズーリンの尾.png','ちやりの尾.png','オカルトチックなマント（後）.png'],
  inner: ['インナー（白）.png','Yシャツ（白）.png','パフスリーブブラウス（長袖）.png'],
  tops: ['博麗のトップス.png','魔法使いのベスト（黒）.png','魔法使いのベスト（茶）.png','魔法使いのベスト（青）.png','令嬢のトップス.png','厄神様のトップス.png','風祝のトップス.png','覚妖怪のトップス.png','無意識のトップス（黒）.png','無意識のトップス（茶）.png','丸襟ベスト（黒）.png','忘れ傘のベスト.png','東深見高校のベスト.png','チュパカブラのTシャツ.png'],
  bottoms: ['博麗のスカート.png','エプロンスカート（黒）.png','エプロンスカート（茶）.png','エプロンスカート（青）.png','令嬢のスカート.png','厄神様のスカート.png','風祝のスカート.png','覚妖怪のスカート.png','無意識のスカート.png','ロングタイトスカート（茶）.png','ダウザーのスカート.png','忘れ傘のスカート.png','東深見高校のスカート.png','秘神のスカート.png','チュパカブラのショートパンツ.png'],
  dress: ['王女のワンピース.png'],
  socks: ['令嬢のくつした.png','折り曲げくつした（白）.png','フリルくつした（白）.png','長くつした（白）.png'],
  shoes: ['靴（茶）.png','靴（青）.png','靴（黒）.png','ブーツ（黒）.png','スリッパ（ピンク）.png','下駄.png','無意識のブーツ（黒）.png','無意識のブーツ（茶）.png','厄神様のブーツ.png'],
  outer: ['魔法使いのポンチョ.png','ダウザーのポンチョ.png','オカルトチックなマント（前）.png','秘神の上衣.png'],
  accessories: ['メガネ（赤）.png','マフラー（ピンク）.png','マフラー（赤）.png','ペンデュラム.png','博麗の袖.png','風祝の袖.png','厄神様のリボン（腕）.png','冬用手袋（ピンク）.png'],
  sidehair: ['霊夢の髪（前）.png','魔理沙の三つ編み.png','雛の髪（前）.png','早苗の髪（前）.png','早苗の髪（短、前）.png','雛の髪（前）.png','こいしの髪（前）.png','董子のおさげ.png'],
  headwear: ['魔法使いの帽子（黒）.png','魔法使いの帽子（紫）.png','魔法使いの帽子（茶）.png','魔法使いの帽子（青）.png','令嬢の帽子.png','厄神様のリボン（小）.png','蛙の髪飾り.png','覚妖怪のカチューシャ.png','無意識の帽子（黒）.png','無意識の帽子（茶）.png','オカルトチックな帽子.png','秘神の帽子.png'],
  item: ['博麗のお祓い棒.png','風祝のお祓い棒.png','箒.png','ダウジングロッド.png'],
  others: ['第三の目.png','閉じた第三の目.png','唐傘お化け.png','パイソン.png']
 };

parts.dress = [
  '王女のワンピース.png'
];

const backgrounds = [
  'ローズ.png',
  'レース.png'
];

function loadThumbnails() {
  const cat = document.getElementById('categorySelect').value;
  thumbnailsDiv.innerHTML = '';

  // =========================
  // 背景カテゴリ専用処理
  // =========================
  if (cat === 'background') {

    // 「背景なし」
    const noneImg = document.createElement('img');
    noneImg.src = 'assets/ui/bg_none.png'; // 任意の画像
    noneImg.title = '背景なし';
    noneImg.className = 'thumbnail';
    noneImg.onclick = () => setBackground(null);
    thumbnailsDiv.appendChild(noneImg);

    // 背景一覧
    backgrounds.forEach(filename => {
      const img = document.createElement('img');
      img.src = `assets/background/${filename}`;
      img.title = filename;
      img.className = 'thumbnail';
      img.onclick = () => setBackground(filename);
      thumbnailsDiv.appendChild(img);
    });

    return; // ← 重要！下の通常処理を止める
  }

  // =========================
  // 通常パーツ処理（今まで通り）
  // =========================
  parts[cat].forEach(filename => {
    const img = document.createElement('img');
    img.src = `assets/${cat}/${filename}`;
    img.title = filename;
    img.className = 'thumbnail';
    img.addEventListener('click', () => {
      togglePart(cat, filename);
    });
    thumbnailsDiv.appendChild(img);
  });
}

function removeCategory(category) {
  for (const key of Array.from(addedPartsMap.keys())) {
    if (key.startsWith(`${category}/`)) {
      canvas.removeChild(addedPartsMap.get(key));
      addedPartsMap.delete(key);
      layerCounters[category] = 0;
    }
  }
}

// 画像の追加/削除を切り替え
function togglePart(category, filename) {

  // ★ ドレスを着る場合
  if (category === 'dress') {
    removeCategory('tops');
    removeCategory('bottoms');
  }

  // ★ トップス or ボトムスを着る場合
  if (category === 'tops' || category === 'bottoms') {
    removeCategory('dress');
  }

  const key = `${category}/${filename}`;

  if (addedPartsMap.has(key)) {
    canvas.removeChild(addedPartsMap.get(key));
    addedPartsMap.delete(key);
    return;
  }

  if (category !== 'accessories') {
    for (const existingKey of addedPartsMap.keys()) {
      if (existingKey.startsWith(`${category}/`)) {
        canvas.removeChild(addedPartsMap.get(existingKey));
        addedPartsMap.delete(existingKey);
        layerCounters[category] = 0;
        break;
      }
    }
  }

  const img = document.createElement('img');
  img.src = `assets/${category}/${filename}`;
  img.className = 'layer';
  img.dataset.category = category;

  layerCounters[category]++;
  img.style.zIndex =
    categoryZIndex[category] * 100 + layerCounters[category];

  canvas.appendChild(img);
  addedPartsMap.set(key, img);
}

const presets = {
  博麗霊夢: {
    face: '霊夢の顔.png',
    hair: '霊夢の髪.png',
    sidehair: '霊夢の髪（前）.png',
    tops: '博麗のトップス.png',
    bottoms: '博麗のスカート.png',
    socks: '折り曲げくつした（白）.png',
    shoes: '靴（茶）.png',
    accessories: '博麗の袖.png',
    occiput: '博麗のリボン.png',
    item: '博麗のお祓い棒.png'
  },
  霧雨魔理沙: {
    face: '魔理沙の顔.png',
    hair: '魔理沙の髪.png',
    sidehair: '魔理沙の三つ編み.png',
    inner: 'インナー（白）.png',
    tops: '魔法使いのベスト（黒）.png',
    bottoms: 'エプロンスカート（黒）.png',
    headwear: '魔法使いの帽子（黒）.png',
    socks: '折り曲げくつした（白）.png',
    shoes: '靴（黒）.png',
    item: '箒.png'
  },
  レミリア・スカーレット: {
    face: 'レミリアの顔.png',
    hair: 'レミリアの髪.png',
    back: 'レミリアの羽.png',
    tops: '令嬢のトップス.png',
    bottoms: '令嬢のスカート.png',
    headwear: '令嬢の帽子.png',
    socks: '令嬢のくつした.png'
  },
  鍵山雛: {
    face: '雛の顔.png',
    hair: '雛の髪.png',
    sidehair: '雛の髪（前）.png',
    tops: '厄神様のトップス.png',
    bottoms: '厄神様のスカート.png',
    headwear: '厄神様のリボン（小）.png',
    shoes: '厄神様のブーツ.png',
    accessories: '厄神様のリボン（腕）.png',
    occiput: '厄神様のリボン.png'
  },
  東風谷早苗: {
    face: '早苗の顔.png',
    hair: '早苗の髪.png',
    sidehair: '早苗の髪（前）.png',
    tops: '風祝のトップス.png',
    bottoms: '風祝のスカート.png',
    headwear: '蛙の髪飾り.png',
    socks: '折り曲げくつした（白）.png',
    shoes: '靴（青）.png',
    accessories: '風祝の袖.png',
    item: '風祝のお祓い棒.png'
  },
  古明地さとり: {
    face: 'さとりの顔.png',
    hair: 'さとりの髪.png',
    tops: '覚妖怪のトップス.png',
    bottoms: '覚妖怪のスカート.png',
    headwear: '覚妖怪のカチューシャ.png',
    socks: 'フリルくつした（白）.png',
    shoes: 'スリッパ（ピンク）.png',
    others: '第三の目.png'
  },
  古明地こいし: {
    face: 'こいしの顔.png',
    hair: 'こいしの髪.png',
    tops: '無意識のトップス（黒）.png',
    bottoms: '無意識のスカート.png',
    headwear: '無意識の帽子（黒）.png',
    shoes: '無意識のブーツ（黒）.png',
    others: '閉じた第三の目.png'
  },
  古明地こいし・智: {
    face: 'こいしの顔.png',
    hair: 'こいしの髪（智）.png',
    sidehair: 'こいしの髪（前）.png',
    tops: '無意識のトップス（茶）.png',
    bottoms: 'ロングタイトスカート（茶）.png',
    headwear: '無意識の帽子（茶）.png',
    shoes: '無意識のブーツ（茶）.png',
    others: '閉じた第三の目.png'
  },
  ナズーリン: {
　　face: 'ナズーリンの顔.png',
　　hair: 'ナズーリンの髪.png',
　　back: 'ナズーリンの尾.png',
　　inner: 'Yシャツ（白）.png',
　　tops: '丸襟ベスト（黒）.png',
　　bottoms: 'ダウザーのスカート.png',
　　outer: 'ダウザーのポンチョ.png',
　　socks: '折り曲げくつした（白）.png',
　　shoes: '靴（黒）.png',
　　accessories: 'ペンデュラム.png',
　　item: 'ダウジングロッド.png'
　},
  多々良小傘: {
    face: '小傘の顔.png',
    hair: '小傘の髪.png',
    inner: 'パフスリーブブラウス（長袖）.png',
    tops: '忘れ傘のベスト.png',
    bottoms: '忘れ傘のスカート.png',
    shoes: '下駄.png',
    others: '唐傘お化け.png'
  },
  宇佐見菫子: {
    face: '董子の顔.png',
    hair: '董子の髪.png',
    sidehair: '董子のおさげ.png',
    back: 'オカルトチックなマント（後）.png',
    inner: 'Yシャツ（白）.png',
    tops: '東深見高校のベスト.png',
    bottoms: '東深見高校のスカート.png',
    outer: 'オカルトチックなマント（前）.png',
    headwear: 'オカルトチックな帽子.png',
    socks: '長くつした（白）.png',
    shoes: '靴（茶）.png',
    accessories: 'メガネ（赤）.png'
  },
  摩多羅隠岐奈: {
    face: '隠岐奈の顔.png',
    hair: '隠岐奈の髪.png',
    inner: 'Yシャツ（白）.png',
    bottoms: '秘神のスカート.png',
    outer: '秘神の上衣.png',
    headwear: '秘神の帽子.png',
    shoes: 'ブーツ（黒）.png'
  },
　天火人ちやり: {
    face: 'ちやりの顔.png',
    hair: 'ちやりの髪.png',
    back: 'ちやりの尾.png',
    tops: 'チュパカブラのTシャツ.png',
    bottoms: 'チュパカブラのショートパンツ.png'
　},
  ユイマン・浅間: {
    face: 'ユイマンの顔.png',
    hair: 'ユイマンの髪.png',
    dress: '王女のワンピース.png',
    others: 'パイソン.png'
  }
};

function applyPreset(presetName) {
  const preset = presets[presetName];
  if (!preset) return;

  // キャンバスをクリア
  for (const key of addedPartsMap.keys()) {
    canvas.removeChild(addedPartsMap.get(key));
  }
  addedPartsMap.clear();

  // レイヤーカウンターもリセット
  for (const key in layerCounters) {
    layerCounters[key] = 0;
  }

  // プリセットのパーツを一括追加
  for (const category in preset) {
    const filename = preset[category];
    togglePart(category, filename);
  }

  // サムネイル再描画で選択状態を更新
  loadThumbnails();
}

function togglePresetList() {
  const list = document.getElementById('presetList');
  list.classList.toggle('hidden');
}

document.addEventListener('click', function(event) {
  const presetWrapper = document.querySelector('.preset-select-wrapper');
  const presetList = document.getElementById('presetList');
  const toggleBtn = document.querySelector('.preset-toggle-btn');

  // toggle ボタン or リスト内をクリックした場合は閉じない
  if (presetWrapper.contains(event.target)) {
    return;
  }

  // それ以外の外部クリック時に閉じる
  presetList.classList.add('hidden');
});

function setCategoryHue(category, value) {
  categoryHue[category] = value;

  document
    .querySelectorAll(
      `#canvas .layer[data-category="${category}"]`
    )
    .forEach(img => {
      img.style.filter = `hue-rotate(${value}deg)`;
    });
}

function setBackgroundHue(value) {
  const bg = document.getElementById('backgroundLayer');
  if (!bg) return;
  bg.style.filter = `hue-rotate(${value}deg)`;
}

const presetIcons = {
  博麗霊夢: 'assets/preset/アイコン霊夢.png',
  霧雨魔理沙: 'assets/preset/アイコン魔理沙.png',
  レミリア・スカーレット: 'assets/preset/アイコンレミリア.png',
  鍵山雛: 'assets/preset/アイコン雛.png',
  東風谷早苗: 'assets/preset/アイコン早苗.png',
  古明地さとり: 'assets/preset/アイコンさとり.png',
  古明地こいし: 'assets/preset/アイコンこいし.png',
  古明地こいし・智: 'assets/preset/アイコンこいし（智）.png',
  ナズーリン: 'assets/preset/アイコンナズーリン.png',
  多々良小傘: 'assets/preset/アイコン小傘.png',
  宇佐見菫子: 'assets/preset/アイコン董子.png',
  摩多羅隠岐奈: 'assets/preset/アイコン隠岐奈.png',
　天火人ちやり: 'assets/preset/アイコンちやり.png',
　ユイマン・浅間: 'assets/preset/アイコンユイマン.png'
};

let currentPresetPage = 0;
const presetsPerPage = 6;

function renderPresetPage() {
  const list = document.getElementById('presetList');
  list.innerHTML = ''; // 中身をクリア

  const keys = Object.keys(presets);
  const start = currentPresetPage * presetsPerPage;
  const end = start + presetsPerPage;

  keys.slice(start, end).forEach(name => {
    const item = document.createElement('div');
    item.className = 'preset-item';
    item.onclick = () => applyPreset(name);

    const img = document.createElement('img');
    img.src = presetIcons[name];
    img.alt = name;

    const span = document.createElement('span');
    span.textContent = name;

    item.appendChild(img);
    item.appendChild(span);
    list.appendChild(item);
  });

  // ページ送りボタン
  const nav = document.createElement('div');
  nav.className = 'preset-nav';

if (start > 0) {
  const prevBtn = document.createElement('button');
  prevBtn.textContent = '← 前へ';
  prevBtn.onclick = (event) => {
    event.stopPropagation(); // 追加
    currentPresetPage--;
    renderPresetPage();
  };
  nav.appendChild(prevBtn);
}

if (end < keys.length) {
  const nextBtn = document.createElement('button');
  nextBtn.textContent = '次へ →';
  nextBtn.onclick = (event) => {
    event.stopPropagation(); // 追加
    currentPresetPage++;
    renderPresetPage();
  };
  nav.appendChild(nextBtn);
}

  list.appendChild(nav);
}

function togglePresetList() {
  const list = document.getElementById('presetList');
  list.classList.toggle('hidden');
  if (!list.classList.contains('hidden')) {
    renderPresetPage(); // 開いたとき初回描画
  }
}

function setBackground(filename) {
  const bg = document.getElementById('backgroundLayer');

  if (!filename) {
    bg.classList.add('hidden');
    bg.src = '';
    return;
  }

  bg.src = `assets/background/${filename}`;
  bg.classList.remove('hidden');
}

function saveCanvasImage() {
  const exportWidth = 800;
  const exportHeight = 1000;

  const filename = prompt(
    '保存するファイル名を入力してください（拡張子不要）',
    '着せ替え幻想郷'
  );
  if (filename === null) return;

  const exportCanvas = document.createElement('canvas');
  exportCanvas.width = exportWidth;
  exportCanvas.height = exportHeight;
  const ctx = exportCanvas.getContext('2d');

  ctx.clearRect(0, 0, exportWidth, exportHeight);

  const layers = Array.from(document.querySelectorAll('.layer'))
    .sort((a, b) => Number(a.style.zIndex) - Number(b.style.zIndex));

  let loadedCount = 0;

  layers.forEach(layer => {
    const img = new Image();
    img.src = layer.src;

    img.onload = () => {
      // ★ ここが最重要
      ctx.filter = layer.style.filter || 'none';

      ctx.drawImage(img, 0, 0, exportWidth, exportHeight);

      ctx.filter = 'none';
      loadedCount++;

      if (loadedCount === layers.length) {
        const link = document.createElement('a');
        link.download = `${filename.trim() || '画像'}.png`;
        link.href = exportCanvas.toDataURL('image/png');
        link.click();
      }
    };
  });
}
