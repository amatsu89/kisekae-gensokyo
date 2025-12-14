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

// パーツ定義にもbackカテゴリを追加
const parts = {
  occiput: ['博麗のリボン.png','厄神様のリボン.png'],
  hair: ['霊夢の髪.png','魔理沙の髪.png','レミリアの髪.png','雛の髪.png','早苗の髪.png','早苗の髪（短）.png','さとりの髪.png','ナズーリンの髪.png','董子の髪.png','隠岐奈の髪.png','ちやりの髪.png'],
  face: ['霊夢の顔.png','魔理沙の顔.png','レミリアの顔.png','雛の顔.png','早苗の顔.png','さとりの顔.png','ナズーリンの顔.png','董子の顔.png','隠岐奈の顔.png','ちやりの顔.png'],
  back: ['レミリアの羽.png','ナズーリンの尾.png','ちやりの尾.png','オカルトチックなマント（後）.png'],
  inner: ['インナー（白）.png','Yシャツ（白）.png'],
  tops: ['博麗のトップス.png','魔法使いのベスト（黒）.png','魔法使いのベスト（茶）.png','魔法使いのベスト（青）.png','令嬢のトップス.png','厄神様のトップス.png','風祝のトップス.png','覚妖怪のトップス.png','東深見高校のベスト.png','チュパカブラのTシャツ.png'],
  bottoms: ['博麗のスカート.png','エプロンスカート（黒）.png','エプロンスカート（茶）.png','エプロンスカート（青）.png','令嬢のスカート.png','厄神様のスカート.png','風祝のスカート.png','覚妖怪のスカート.png','ダウザーのスカート.png','東深見高校のスカート.png','秘神のスカート.png','チュパカブラのショートパンツ.png'],
  socks: ['令嬢のくつした.png','折り曲げくつした（白）.png','フリルくつした（白）.png','長くつした（白）.png'],
  shoes: ['靴（茶）.png','靴（青）.png','靴（黒）.png','ブーツ（黒）.png','スリッパ（ピンク）.png','厄神様のブーツ.png'],
  outer: ['魔法使いのポンチョ.png','オカルトチックなマント（前）.png','秘神の上衣.png'],
  accessories: ['メガネ（赤）.png','マフラー（ピンク）.png','マフラー（赤）.png','博麗の袖.png','風祝の袖.png','厄神様のリボン（腕）.png','冬用手袋（ピンク）.png'],
  sidehair: ['霊夢の髪（前）.png','魔理沙の三つ編み.png','雛の髪（前）.png','早苗の髪（前）.png','早苗の髪（短、前）.png','雛の髪（前）.png','董子のおさげ.png'],
  headwear: ['魔法使いの帽子（黒）.png','魔法使いの帽子（紫）.png','魔法使いの帽子（茶）.png','魔法使いの帽子（青）.png','令嬢の帽子.png','厄神様のリボン（小）.png','蛙の髪飾り.png','覚妖怪のカチューシャ.png','オカルトチックな帽子.png','秘神の帽子.png'],
  item: ['博麗のお祓い棒.png','風祝のお祓い棒.png','箒.png'],
  others: ['第三の目.png']
 };
function loadThumbnails() {
  const cat = document.getElementById('categorySelect').value;
  thumbnailsDiv.innerHTML = '';
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

// 画像の追加/削除を切り替え
function togglePart(category, filename) {
  const key = `${category}/${filename}`;

  if (addedPartsMap.has(key)) {
    // すでに追加済み → 削除
    canvas.removeChild(addedPartsMap.get(key));
    addedPartsMap.delete(key);
  } else {
    // accessories 以外はそのカテゴリにすでにパーツがあるなら削除
    if (category !== 'accessories') {
      // 追加済みのキーを調べて同じカテゴリのものを削除
      for (const existingKey of addedPartsMap.keys()) {
        if (existingKey.startsWith(`${category}/`)) {
          canvas.removeChild(addedPartsMap.get(existingKey));
          addedPartsMap.delete(existingKey);
          break; // 1カテゴリ1パーツなので1つでOK
        }
      }
      // カウンターもリセット（任意）
      layerCounters[category] = 0;
    }

    // 新しいパーツを追加
    const img = document.createElement('img');
    img.src = `assets/${category}/${filename}`;
    img.className = 'layer';
    img.title = filename;
    layerCounters[category]++;
    img.style.zIndex = categoryZIndex[category] * 100 + layerCounters[category];

    img.addEventListener('click', () => {
      canvas.removeChild(img);
      addedPartsMap.delete(key);
      loadThumbnails(); // 選択状態更新
    });

    canvas.appendChild(img);
    addedPartsMap.set(key, img);
  }

  // サムネイルの選択状態を更新
  loadThumbnails();
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

const presetIcons = {
  博麗霊夢: 'assets/preset/アイコン霊夢.png',
  霧雨魔理沙: 'assets/preset/アイコン魔理沙.png',
  レミリア・スカーレット: 'assets/preset/アイコンレミリア.png',
  鍵山雛: 'assets/preset/アイコン雛.png',
  東風谷早苗: 'assets/preset/アイコン早苗.png',
  古明地さとり: 'assets/preset/アイコンさとり.png',
  宇佐見菫子: 'assets/preset/アイコン董子.png',
  摩多羅隠岐奈: 'assets/preset/アイコン隠岐奈.png'
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

function saveCanvasImage() {
  const exportWidth = 800;
  const exportHeight = 1000;

  // 保存用キャンバス（非表示）
  const exportCanvas = document.createElement('canvas');
  exportCanvas.width = exportWidth;
  exportCanvas.height = exportHeight;
  const ctx = exportCanvas.getContext('2d');

  // 背景は透明のまま（←重要）
  ctx.clearRect(0, 0, exportWidth, exportHeight);

  // 今表示されているレイヤーを「順番通り」に描画
  const layers = document.querySelectorAll('.layer');

  layers.forEach(layer => {
    if (!layer.src) return;

    const img = new Image();
    img.src = layer.src;

    img.onload = () => {
      ctx.drawImage(img, 0, 0, exportWidth, exportHeight);

      // 最後の1枚が描画されたら保存
      if (img === layers[layers.length - 1]) {
        downloadImage(exportCanvas);
      }
    };
  });
}
  // ユーザーにファイル名を入力してもらう（デフォルト名付き）
  const filename = prompt('保存するファイル名を入力してください（拡張子不要）', '着せ替え幻想郷');

  if (filename === null) {
    return; // キャンセルされた場合
  }

  // PNGとしてダウンロード
  const link = document.createElement('a');
  link.download = `${filename.trim() || '画像'}.png`; // 空ならデフォルト名
  link.href = exportCanvas.toDataURL('image/png');
  link.click();
}
