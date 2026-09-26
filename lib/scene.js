// 木を叩く場面・タイトル画面で共通の、背景（空・山・地面）のドット絵
export const SCENE_COLS = 96;
export const SCENE_ROWS = 60;
export const SCENE_DOT = 6;

export const DEFAULT_SCENE = {
  sky: '#8fd0ec',
  sky2: '#a5dcf2',
  hill: '#7fb069',
  ground: '#5c8a4a',
  ground2: '#4d7a3d',
  sun: '#f6e27a',
};

export function fill(ctx, x, y, w, h, color) {
  ctx.fillStyle = color;
  ctx.fillRect(x * SCENE_DOT, y * SCENE_DOT, w * SCENE_DOT, h * SCENE_DOT);
}

export function drawBackground(ctx, scene = DEFAULT_SCENE) {
  fill(ctx, 0, 0, SCENE_COLS, 46, scene.sky);
  for (const y of [6, 14, 22, 30]) fill(ctx, 0, y, SCENE_COLS, 2, scene.sky2);
  // 星（夜の場面）
  if (scene.stars) {
    for (let i = 0; i < 34; i++) {
      const x = (i * 29 + 7) % SCENE_COLS;
      const y = (i * 13 + 3) % 32;
      fill(ctx, x, y, 1, 1, i % 4 === 0 ? '#ffe9a8' : '#ffffff');
    }
  }
  // 太陽（月の場面では、地球）
  fill(ctx, 8, 5, 6, 6, scene.sun);
  if (scene.stars) {
    fill(ctx, 9, 6, 2, 2, '#5fb56a');
    fill(ctx, 11, 8, 2, 2, '#5fb56a');
  }
  // 遠くの山
  for (let x = 0; x < SCENE_COLS; x++) {
    const h = 8 + Math.round(5 * Math.sin(x / 9) + 3 * Math.sin(x / 4));
    fill(ctx, x, 44 - h, 1, h + 2, scene.hill);
  }
  // 地面
  fill(ctx, 0, 46, SCENE_COLS, 14, scene.ground);
  for (let i = 0; i < 40; i++) {
    const x = (i * 37) % SCENE_COLS;
    const y = 47 + ((i * 11) % 12);
    fill(ctx, x, y, 3, 1, scene.ground2);
  }
}
