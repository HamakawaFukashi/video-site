const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

const cols = 5;
const rows = 4;
const titleHeight = 270;

// 背景画像
const bgImage = new Image();
bgImage.src = "title_bg.jpg";

// 動画サイズと位置計算
const videoHeight = (canvas.height - titleHeight - 30) / rows;
const videoWidth = videoHeight * (16 / 9);
const marginX = (canvas.width - (cols * videoWidth)) / (cols + 1);
const marginY = 10;

// 各動画の表示位置
const positions = [];
for (let row = 0; row < rows; row++) {
  for (let col = 0; col < cols; col++) {
    const x = marginX + col * (videoWidth + marginX);
    const y = titleHeight + row * (videoHeight + marginY);
    positions.push({ x, y });
  }
}

// 動画読み込み
const videos = [];
for (let i = 0; i < 20; i++) {
  const video = document.createElement("video");
  video.src = `video/video${String(i + 1).padStart(2, "0")}.mp4`;
  video.autoplay = true;
  video.muted = true;
  video.loop = true;
  video.playsInline = true;
  video.style.display = "none";
  video.load();
  videos.push(video);
}

// 拡大中の動画インデックス（クリックで指定、ESCで解除）
let activeIndex = null;

// 拡大解除（ESCキー）
window.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    if (activeIndex !== null) {
      videos[activeIndex].muted = true;
      activeIndex = null;
    }
  }
});
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    if (activeIndex !== null) {
      videos[activeIndex].muted = true;
      activeIndex = null;
    }
  }
});


// クリックで拡大対象を設定
canvas.addEventListener("click", (event) => {
  const rect = canvas.getBoundingClientRect();
  const clickX = event.clientX - rect.left;
  const clickY = event.clientY - rect.top;

  // ① 拡大中 → 拡大領域（中央）クリックで解除
  if (activeIndex !== null) {
    const enlargedW = 800;
    const enlargedH = 450;
    const drawX = (canvas.width - enlargedW) / 2;
    const drawY = (canvas.height - enlargedH) / 2;

    if (
      clickX >= drawX && clickX <= drawX + enlargedW &&
      clickY >= drawY && clickY <= drawY + enlargedH
    ) {
      videos[activeIndex].muted = true;
      activeIndex = null;
      return; // 👈 拡大動画をクリックしたので他の判定は無視
    }
  }

  // ② 拡大していない or 他の動画クリック → 拡大切り替え
  for (let i = 0; i < positions.length; i++) {
    const pos = positions[i];
    if (
      clickX >= pos.x && clickX <= pos.x + videoWidth &&
      clickY >= pos.y && clickY <= pos.y + videoHeight
    ) {
      if (activeIndex === i) {
        videos[i].muted = true;
        activeIndex = null;
      } else {
        activeIndex = i;
        videos.forEach((v, idx) => v.muted = (idx !== i));
        videos[i].volume = 1.0;
        videos[i].play().catch(() => {});
      }
      break;
    }
  }
});


// 描画ループ
function draw() {
  ctx.fillStyle = "#4D7BC9";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // タイトル背景画像
  if (bgImage.complete) {
    const iw = bgImage.width;
    const ih = bgImage.height;
    const scale = Math.min(canvas.width / iw, titleHeight / ih);
    const drawW = iw * scale;
    const drawH = ih * scale;
    const dx = (canvas.width - drawW) / 2;
    const dy = (titleHeight - drawH) / 2;
    ctx.drawImage(bgImage, dx, dy, drawW, drawH);
  }

  // タイトル文字
  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 32px sans-serif";
  ctx.fillText("20個の動画配列", 30, 60);

  // 通常の動画描画（全て小さく整列）
  videos.forEach((video, index) => {
    if (video.readyState >= 2) {
      const pos = positions[index];
      ctx.drawImage(video, pos.x, pos.y, videoWidth, videoHeight);
    }
  });

  // 拡大描画（中央800×450）＋番号
  if (activeIndex !== null && videos[activeIndex].readyState >= 2) {
    const video = videos[activeIndex];
    const enlargedW = 800;
    const enlargedH = 450;
    const drawX = (canvas.width - enlargedW) / 2;
    const drawY = (canvas.height - enlargedH) / 2;

    ctx.strokeStyle = "#fff";
    ctx.lineWidth = 4;
    ctx.strokeRect(drawX - 2, drawY - 2, enlargedW + 4, enlargedH + 4);

    ctx.drawImage(
      video,
      0, 0,
      video.videoWidth, video.videoHeight,
      drawX, drawY,
      enlargedW, enlargedH
    );

    // 拡大動画番号表示
    ctx.fillStyle = "rgba(0, 0, 0, 0.6)";
    ctx.fillRect(drawX, drawY, 60, 30);
    ctx.fillStyle = "#fff";
    ctx.font = "bold 20px sans-serif";
    ctx.fillText(`No.${String(activeIndex + 1).padStart(2, "0")}`, drawX + 1, drawY + 22);
  }

  requestAnimationFrame(draw);
}

// 全ての動画準備ができたら描画スタート
Promise.all(
  videos.map(video => new Promise(resolve => {
    video.addEventListener("canplay", resolve, { once: true });
  }))
).then(() => {
  videos.forEach(v => v.play().catch(() => {}));
  requestAnimationFrame(draw);
});









