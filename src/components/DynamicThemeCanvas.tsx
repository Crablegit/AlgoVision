import React, { useEffect, useRef } from 'react';
import { ThemeId, THEMES_LIST } from '../types/themes';

interface DynamicThemeCanvasProps {
  themeId: ThemeId;
}

export const DynamicThemeCanvas: React.FC<DynamicThemeCanvasProps> = ({ themeId }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const onResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', onResize);

    // ================== STATE FOR THEMES ==================

    // 1. Anime Sky: multi-layer clouds
    const clouds = Array.from({ length: 9 }, (_, i) => ({
      x: (i * width) / 5 + (Math.random() - 0.5) * 120,
      y: 40 + (i % 3) * 65 + Math.random() * 40,
      layer: (i % 3) + 1, // 1: far (slow, small), 2: mid, 3: near (faster, larger)
      speed: 0.15 + (i % 3) * 0.18,
      width: 140 + (i % 3) * 60,
      height: 45 + (i % 3) * 20
    }));

    // 2. Summer Hill & Autumn Hill & Sakura Hill: Leaves & wind cycle
    let lastWindTime = performance.now();
    let isWindGust = false;
    let windDirection = 1; // 1: left to right, -1: right to left
    const foliageParticles = Array.from({ length: 45 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.2) * 1.5,
      vy: Math.random() * 1.5 + 0.8,
      size: Math.floor(Math.random() * 4) + 4,
      rot: Math.random() * Math.PI * 2,
      rotSpeed: (Math.random() - 0.5) * 0.08,
      colorIndex: Math.floor(Math.random() * 4)
    }));

    // 4. Winter Hill: Snowflakes
    const snowflakes = Array.from({ length: 65 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      size: Math.random() < 0.6 ? 3 : Math.random() < 0.9 ? 4 : 6,
      speedY: Math.random() * 1.2 + 0.6,
      swayFreq: Math.random() * 0.02 + 0.01,
      swayAmp: Math.random() * 1.5 + 0.5,
      seed: Math.random() * 100
    }));

    // 6. Cyberpunk Rain & Rain Cafe: Rain drops & Splashes
    const raindrops = Array.from({ length: 110 }, () => ({
      x: Math.random() * (width + 200),
      y: Math.random() * height,
      len: Math.floor(Math.random() * 18) + 12,
      speed: Math.random() * 12 + 18
    }));
    const splashes: Array<{ x: number; y: number; age: number; maxAge: number }> = [];

    // 7. Synthwave Sunset: Grid waves & sun rays
    let synthwaveTick = 0;

    // 8. Enchanted Forest: Fireflies
    const fireflies = Array.from({ length: 32 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      size: Math.random() < 0.5 ? 3 : 4,
      phase: Math.random() * Math.PI * 2,
      baseSpeedX: (Math.random() - 0.5) * 0.6,
      baseSpeedY: (Math.random() - 0.5) * 0.5
    }));

    // 9. Desert Oasis: Shooting stars
    let lastMeteorTime = performance.now();
    let activeMeteor: { x: number; y: number; vx: number; vy: number; len: number; life: number } | null = null;

    // 10. Cosmic Nebula: Space dust & Console LED blinks
    const stardust = Array.from({ length: 45 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      size: Math.random() < 0.7 ? 2 : 3,
      speedX: (Math.random() - 0.5) * 0.4,
      speedY: (Math.random() - 0.5) * 0.4,
      brightness: Math.random() * 0.8 + 0.2
    }));

    // 11. Cozy Library: Fire embers & smoke
    const embers = Array.from({ length: 25 }, () => ({
      x: 90 + Math.random() * 40,
      y: height - 60 - Math.random() * 20,
      vx: (Math.random() - 0.5) * 0.8,
      vy: -(Math.random() * 1.5 + 0.8),
      life: 0,
      maxLife: Math.random() * 40 + 30,
      size: Math.random() < 0.6 ? 2 : 3
    }));

    // 12. Mystic Swamp: Mist & bubbles
    const swampBubbles = Array.from({ length: 12 }, () => ({
      x: Math.random() * width,
      y: height - 10 - Math.random() * 80,
      vy: -(Math.random() * 0.6 + 0.3),
      size: Math.floor(Math.random() * 4) + 3,
      popped: false
    }));

    // 13. Rainy Cafe: Coffee steam
    const steamParticles = Array.from({ length: 18 }, () => ({
      x: 120 + (Math.random() - 0.5) * 16,
      y: height - 85 - Math.random() * 30,
      vy: -(Math.random() * 0.7 + 0.4),
      alpha: Math.random() * 0.5 + 0.2,
      size: Math.random() * 3 + 3
    }));

    // 14. Mountain Peak: Eagle position
    let eagleX = -60;
    let eagleY = 160;

    // ================== RENDER LOOP ==================
    let frameCount = 0;

    const render = (time: number) => {
      frameCount++;
      ctx.imageSmoothingEnabled = false;

      // 1. Clear and Draw Base Sky Gradient
      drawSkyBackground(ctx, themeId, width, height, time);

      // Check Wind Gust Cycle (Every ~20s)
      if (time - lastWindTime > 20000) {
        lastWindTime = time;
        isWindGust = true;
        windDirection = Math.random() > 0.5 ? 1 : -1;
      }
      if (isWindGust && time - lastWindTime > 5000) {
        isWindGust = false;
      }

      // Check Shooting Star Cycle (Every ~25s)
      if (themeId === 'desert-oasis' && !activeMeteor && time - lastMeteorTime > 25000) {
        lastMeteorTime = time;
        activeMeteor = {
          x: Math.random() * (width * 0.7),
          y: Math.random() * 120,
          vx: 14 + Math.random() * 6,
          vy: 6 + Math.random() * 4,
          len: 80,
          life: 30
        };
      }

      // 2. Render Theme Scenery & Dynamics
      switch (themeId) {
        case 'anime-sky':
          renderAnimeSky(ctx, width, height, clouds, time);
          break;
        case 'summer-hill':
          renderSummerHill(ctx, width, height, foliageParticles, isWindGust, windDirection);
          break;
        case 'autumn-hill':
          renderAutumnHill(ctx, width, height, foliageParticles, isWindGust, windDirection);
          break;
        case 'winter-hill':
          renderWinterHill(ctx, width, height, snowflakes, time);
          break;
        case 'sakura-hill':
          renderSakuraHill(ctx, width, height, foliageParticles, isWindGust, windDirection);
          break;
        case 'cyberpunk-rain':
          renderCyberpunkRain(ctx, width, height, raindrops, splashes, time);
          break;
        case 'synthwave-sunset':
          synthwaveTick += 0.03;
          renderSynthwaveSunset(ctx, width, height, synthwaveTick);
          break;
        case 'enchanted-forest':
          renderEnchantedForest(ctx, width, height, fireflies, time);
          break;
        case 'desert-oasis':
          renderDesertOasis(ctx, width, height, activeMeteor, time);
          if (activeMeteor) {
            activeMeteor.x += activeMeteor.vx;
            activeMeteor.y += activeMeteor.vy;
            activeMeteor.life--;
            if (activeMeteor.life <= 0) activeMeteor = null;
          }
          break;
        case 'cosmic-nebula':
          renderCosmicNebula(ctx, width, height, stardust, time);
          break;
        case 'cozy-library':
          renderCozyLibrary(ctx, width, height, embers, time);
          break;
        case 'mystic-swamp':
          renderMysticSwamp(ctx, width, height, swampBubbles, time);
          break;
        case 'rainy-cafe':
          renderRainyCafe(ctx, width, height, raindrops, steamParticles, time);
          break;
        case 'mountain-peak':
          eagleX += 1.2;
          if (eagleX > width + 80) eagleX = -60;
          eagleY = 140 + Math.sin(eagleX * 0.008) * 35;
          renderMountainPeak(ctx, width, height, eagleX, eagleY, time);
          break;
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', onResize);
    };
  }, [themeId]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      style={{ display: 'block', width: '100%', height: '100%' }}
    />
  );
};

// ======================================================================
// HELPER: BACKGROUND SKY GRADIENTS
// ======================================================================
function drawSkyBackground(
  ctx: CanvasRenderingContext2D,
  themeId: ThemeId,
  w: number,
  h: number,
  time: number
) {
  const theme = THEMES_LIST.find((t) => t.id === themeId) || THEMES_LIST[0];
  const grad = ctx.createLinearGradient(0, 0, 0, h);

  switch (themeId) {
    case 'anime-sky':
      grad.addColorStop(0, '#1d4ed8');
      grad.addColorStop(0.35, '#3b82f6');
      grad.addColorStop(0.7, '#60a5fa');
      grad.addColorStop(1, '#bae6fd');
      break;
    case 'summer-hill':
      grad.addColorStop(0, '#0284c7');
      grad.addColorStop(0.5, '#38bdf8');
      grad.addColorStop(0.8, '#7dd3fc');
      grad.addColorStop(1, '#bae6fd');
      break;
    case 'autumn-hill':
      grad.addColorStop(0, '#3b0764');
      grad.addColorStop(0.35, '#7c2d12');
      grad.addColorStop(0.7, '#ea580c');
      grad.addColorStop(1, '#facc15');
      break;
    case 'winter-hill':
      grad.addColorStop(0, '#0f172a');
      grad.addColorStop(0.4, '#1e293b');
      grad.addColorStop(0.75, '#475569');
      grad.addColorStop(1, '#cbd5e1');
      break;
    case 'sakura-hill':
      grad.addColorStop(0, '#1f1224');
      grad.addColorStop(0.4, '#4a044e');
      grad.addColorStop(0.75, '#831843');
      grad.addColorStop(1, '#fbcfe8');
      break;
    case 'cyberpunk-rain':
      grad.addColorStop(0, '#080112');
      grad.addColorStop(0.5, '#130424');
      grad.addColorStop(1, '#250847');
      break;
    case 'synthwave-sunset':
      grad.addColorStop(0, '#130026');
      grad.addColorStop(0.35, '#2e0854');
      grad.addColorStop(0.65, '#701a75');
      grad.addColorStop(0.85, '#be185d');
      grad.addColorStop(1, '#f97316');
      break;
    case 'enchanted-forest':
      grad.addColorStop(0, '#02150e');
      grad.addColorStop(0.5, '#052e16');
      grad.addColorStop(1, '#064e3b');
      break;
    case 'desert-oasis':
      grad.addColorStop(0, '#020617');
      grad.addColorStop(0.45, '#09152b');
      grad.addColorStop(0.8, '#1e3a5f');
      grad.addColorStop(1, '#78350f');
      break;
    case 'cosmic-nebula':
      grad.addColorStop(0, '#010206');
      grad.addColorStop(0.4, '#170629');
      grad.addColorStop(0.8, '#3b0764');
      grad.addColorStop(1, '#0c0a1a');
      break;
    case 'cozy-library':
      grad.addColorStop(0, '#140704');
      grad.addColorStop(0.5, '#2c1209');
      grad.addColorStop(1, '#451a03');
      break;
    case 'mystic-swamp':
      grad.addColorStop(0, '#08100c');
      grad.addColorStop(0.5, '#13231a');
      grad.addColorStop(1, '#27202c');
      break;
    case 'rainy-cafe':
      grad.addColorStop(0, '#120f0e');
      grad.addColorStop(0.45, '#1e1c22');
      grad.addColorStop(0.8, '#2e2c34');
      grad.addColorStop(1, '#47434c');
      break;
    case 'mountain-peak':
      grad.addColorStop(0, '#0b0f2a');
      grad.addColorStop(0.35, '#1e1b4b');
      grad.addColorStop(0.65, '#3730a3');
      grad.addColorStop(0.85, '#ea580c');
      grad.addColorStop(1, '#fde047');
      break;
    default:
      grad.addColorStop(0, '#070b14');
      grad.addColorStop(1, '#0f172a');
  }

  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h);
}

// ======================================================================
// THEME 1: BẦU TRỜI ANIME (Anime Sky)
// ======================================================================
function renderAnimeSky(ctx: CanvasRenderingContext2D, w: number, h: number, clouds: any[], time: number) {
  // Pixel sun rays
  const sunX = w * 0.85;
  const sunY = h * 0.25;

  ctx.save();
  ctx.fillStyle = 'rgba(255, 245, 157, 0.2)';
  ctx.beginPath();
  ctx.arc(sunX, sunY, 80, 0, Math.PI * 2);
  ctx.fill();

  // Draw multi-layer pixel clouds
  clouds.forEach((c) => {
    c.x += c.speed;
    if (c.x > w + 200) c.x = -250;

    const baseColor = c.layer === 1 ? 'rgba(255, 255, 255, 0.45)' : c.layer === 2 ? 'rgba(255, 255, 255, 0.7)' : 'rgba(255, 255, 255, 0.9)';
    const shadowColor = c.layer === 1 ? 'rgba(186, 230, 253, 0.4)' : c.layer === 2 ? 'rgba(147, 197, 253, 0.55)' : 'rgba(125, 211, 252, 0.7)';

    drawPixelCloud(ctx, c.x, c.y, c.width, c.height, baseColor, shadowColor);
  });
  ctx.restore();
}

function drawPixelCloud(ctx: CanvasRenderingContext2D, x: number, y: number, cw: number, ch: number, col: string, shadow: string) {
  const b = 10;
  ctx.fillStyle = shadow;
  ctx.fillRect(x + b, y + ch * 0.5, cw - b * 2, ch * 0.5);

  ctx.fillStyle = col;
  ctx.fillRect(x + b * 2, y + b, cw - b * 4, ch * 0.7);
  ctx.fillRect(x + cw * 0.25, y, cw * 0.5, ch * 0.8);
  ctx.fillRect(x + cw * 0.4, y - b, cw * 0.3, ch * 0.9);
  ctx.fillRect(x, y + ch * 0.3, cw, ch * 0.5);
}

// ======================================================================
// THEME 2: ĐỒI NÚI TRỜI HÈ (Summer Hill)
// ======================================================================
function renderSummerHill(ctx: CanvasRenderingContext2D, w: number, h: number, leaves: any[], isWind: boolean, dir: number) {
  // 1. Hills
  drawHills(ctx, w, h, ['#22c55e', '#16a34a', '#15803d']);

  // 2. Pixel Oak Trees on Left & Right
  drawPixelOakTree(ctx, 40, h - 30, true);
  drawPixelOakTree(ctx, w - 120, h - 30, false);

  // 3. Falling leaves
  const leafColors = ['#4ade80', '#22c55e', '#16a34a', '#86efac'];
  leaves.forEach((p) => {
    const extraSpeedX = isWind ? dir * 5.5 : dir * 0.8;
    const extraSpeedY = isWind ? -0.2 : 0;
    p.x += p.vx + extraSpeedX;
    p.y += p.vy + extraSpeedY;
    p.rot += p.rotSpeed * (isWind ? 2.5 : 1);

    if (p.y > h + 10) {
      p.y = -10;
      p.x = Math.random() * w;
    }
    if (p.x > w + 20) p.x = -20;
    if (p.x < -20) p.x = w + 20;

    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(p.rot);
    ctx.fillStyle = leafColors[p.colorIndex % leafColors.length];
    ctx.fillRect(-p.size, -p.size / 2, p.size * 2, p.size);
    ctx.restore();
  });
}

function drawHills(ctx: CanvasRenderingContext2D, w: number, h: number, colors: string[]) {
  // Back hill
  ctx.fillStyle = colors[0];
  ctx.beginPath();
  ctx.arc(w * 0.3, h + 140, w * 0.45, 0, Math.PI * 2);
  ctx.fill();

  // Mid hill
  ctx.fillStyle = colors[1];
  ctx.beginPath();
  ctx.arc(w * 0.75, h + 160, w * 0.5, 0, Math.PI * 2);
  ctx.fill();

  // Front hill
  ctx.fillStyle = colors[2];
  ctx.beginPath();
  ctx.arc(w * 0.5, h + 220, w * 0.65, 0, Math.PI * 2);
  ctx.fill();
}

function drawPixelOakTree(ctx: CanvasRenderingContext2D, x: number, y: number, isLeft: boolean) {
  // Trunk
  ctx.fillStyle = '#78350f';
  ctx.fillRect(x + 25, y - 110, 24, 110);
  ctx.fillStyle = '#451a03';
  ctx.fillRect(x + 35, y - 100, 10, 100);

  // Large canopy blocks
  ctx.fillStyle = '#15803d';
  ctx.fillRect(x - 20, y - 180, 110, 90);
  ctx.fillStyle = '#16a34a';
  ctx.fillRect(x - 35, y - 165, 130, 60);
  ctx.fillStyle = '#22c55e';
  ctx.fillRect(x - 10, y - 195, 80, 50);
  ctx.fillStyle = '#86efac';
  ctx.fillRect(x + 10, y - 190, 25, 20);
}

// ======================================================================
// THEME 3: ĐỒI NÚI TRỜI THU (Autumn Hill)
// ======================================================================
function renderAutumnHill(ctx: CanvasRenderingContext2D, w: number, h: number, leaves: any[], isWind: boolean, dir: number) {
  // 1. Autumn golden hills
  drawHills(ctx, w, h, ['#ca8a04', '#a16207', '#713f12']);

  // 2. Pixel Maple Trees
  drawPixelMapleTree(ctx, 40, h - 30);
  drawPixelMapleTree(ctx, w - 120, h - 30);

  // 3. Falling maple leaves (spiral)
  const mapleColors = ['#dc2626', '#ea580c', '#f97316', '#facc15'];
  leaves.forEach((p, idx) => {
    const spiral = Math.sin((p.y * 0.05) + idx) * 2;
    const extraSpeedX = (isWind ? dir * 6.5 : dir * 1.2) + spiral;
    p.x += p.vx + extraSpeedX;
    p.y += p.vy * (isWind ? 1.4 : 1);
    p.rot += p.rotSpeed * (isWind ? 3 : 1.5);

    if (p.y > h + 10) {
      p.y = -10;
      p.x = Math.random() * w;
    }
    if (p.x > w + 20) p.x = -20;
    if (p.x < -20) p.x = w + 20;

    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(p.rot);
    ctx.fillStyle = mapleColors[p.colorIndex % mapleColors.length];
    // Maple leaf shape (star-like pixel block)
    const s = p.size;
    ctx.fillRect(-s, -s, s * 2, s * 2);
    ctx.fillRect(-s * 1.4, -s * 0.4, s * 2.8, s * 0.8);
    ctx.fillRect(-s * 0.4, -s * 1.4, s * 0.8, s * 2.8);
    ctx.restore();
  });
}

function drawPixelMapleTree(ctx: CanvasRenderingContext2D, x: number, y: number) {
  ctx.fillStyle = '#542d17';
  ctx.fillRect(x + 25, y - 110, 20, 110);

  // Fiery canopy
  ctx.fillStyle = '#991b1b';
  ctx.fillRect(x - 25, y - 180, 110, 85);
  ctx.fillStyle = '#dc2626';
  ctx.fillRect(x - 35, y - 165, 130, 60);
  ctx.fillStyle = '#ea580c';
  ctx.fillRect(x - 15, y - 195, 85, 55);
  ctx.fillStyle = '#facc15';
  ctx.fillRect(x + 10, y - 190, 30, 20);
}

// ======================================================================
// THEME 4: ĐỒI NÚI TRỜI ĐÔNG (Winter Hill)
// ======================================================================
function renderWinterHill(ctx: CanvasRenderingContext2D, w: number, h: number, snowflakes: any[], time: number) {
  // Snowy knolls
  drawHills(ctx, w, h, ['#94a3b8', '#cbd5e1', '#f1f5f9']);

  // Snowman on left
  drawPixelSnowman(ctx, 80, h - 70);

  // Christmas pine tree on right
  drawPixelPineTree(ctx, w - 140, h - 50);

  // Falling pixel snowflakes
  ctx.fillStyle = '#ffffff';
  snowflakes.forEach((s) => {
    s.y += s.speedY;
    s.x += Math.sin(time * 0.002 + s.seed) * s.swayAmp;

    if (s.y > h + 10) {
      s.y = -10;
      s.x = Math.random() * w;
    }
    if (s.x > w) s.x = 0;
    if (s.x < 0) s.x = w;

    ctx.fillRect(Math.floor(s.x), Math.floor(s.y), s.size, s.size);
  });
}

function drawPixelSnowman(ctx: CanvasRenderingContext2D, x: number, y: number) {
  // Bottom ball
  ctx.fillStyle = '#f8fafc';
  ctx.fillRect(x, y, 44, 40);
  // Head
  ctx.fillRect(x + 7, y - 28, 30, 28);

  // Red wool beanie
  ctx.fillStyle = '#ef4444';
  ctx.fillRect(x + 5, y - 36, 34, 10);
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(x + 18, y - 43, 8, 8); // Beanie pompom

  // Eyes & Buttons
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(x + 14, y - 20, 4, 4);
  ctx.fillRect(x + 26, y - 20, 4, 4);
  ctx.fillRect(x + 20, y + 10, 4, 4);
  ctx.fillRect(x + 20, y + 22, 4, 4);

  // Carrot nose
  ctx.fillStyle = '#f97316';
  ctx.fillRect(x + 18, y - 14, 10, 4);
}

function drawPixelPineTree(ctx: CanvasRenderingContext2D, x: number, y: number) {
  // Trunk
  ctx.fillStyle = '#451a03';
  ctx.fillRect(x + 35, y - 30, 16, 30);

  // Pine tiers (bottom to top)
  ctx.fillStyle = '#064e3b';
  ctx.fillRect(x, y - 65, 86, 35);
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(x, y - 68, 86, 6); // Snow layer

  ctx.fillStyle = '#047857';
  ctx.fillRect(x + 12, y - 105, 62, 40);
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(x + 12, y - 108, 62, 6);

  ctx.fillStyle = '#059669';
  ctx.fillRect(x + 24, y - 145, 38, 40);
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(x + 24, y - 148, 38, 6);

  // Star on top
  ctx.fillStyle = '#facc15';
  ctx.fillRect(x + 38, y - 156, 10, 10);
}

// ======================================================================
// THEME 5: ĐỒI HOA ANH ĐÀO (Sakura Hill)
// ======================================================================
function renderSakuraHill(ctx: CanvasRenderingContext2D, w: number, h: number, petals: any[], isWind: boolean, dir: number) {
  drawHills(ctx, w, h, ['#831843', '#be185d', '#f472b6']);

  drawPixelSakuraTree(ctx, 20, h - 30, true);
  drawPixelSakuraTree(ctx, w - 130, h - 30, false);

  const sakuraColors = ['#ffb7c5', '#ff94b1', '#ffa8c0', '#ffd1dc', '#ff7597'];
  petals.forEach((p) => {
    const extraSpeedX = isWind ? dir * 6 : dir * 1.5;
    p.x += p.vx + extraSpeedX;
    p.y += p.vy;
    p.rot += p.rotSpeed * (isWind ? 2.5 : 1);

    if (p.y > h + 10) {
      p.y = -10;
      p.x = Math.random() * w;
    }
    if (p.x > w + 20) p.x = -20;
    if (p.x < -20) p.x = w + 20;

    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(p.rot);
    ctx.fillStyle = sakuraColors[p.colorIndex % sakuraColors.length];
    const s = p.size;
    ctx.fillRect(-s, -s / 2, s * 1.6, s);
    ctx.fillRect(-s / 2, -s, s, s * 1.8);
    ctx.fillStyle = '#ffffffaa';
    ctx.fillRect(-s / 4, -s / 4, s / 2, s / 2);
    ctx.restore();
  });
}

function drawPixelSakuraTree(ctx: CanvasRenderingContext2D, x: number, y: number, isLeft: boolean) {
  ctx.fillStyle = '#3f1a23';
  ctx.fillRect(x + 35, y - 120, 20, 120);

  // Pink flowering canopy
  ctx.fillStyle = '#be185d';
  ctx.fillRect(x - 20, y - 190, 120, 85);
  ctx.fillStyle = '#f472b6';
  ctx.fillRect(x - 30, y - 175, 140, 60);
  ctx.fillStyle = '#fbcfe8';
  ctx.fillRect(x - 5, y - 205, 90, 50);
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(x + 20, y - 195, 30, 20);
}

// ======================================================================
// THEME 6: MƯA NGÕ HẺM CYBERPUNK (Cyberpunk Rain)
// ======================================================================
function renderCyberpunkRain(ctx: CanvasRenderingContext2D, w: number, h: number, rain: any[], splashes: any[], time: number) {
  // 1. City skyline silhouettes
  drawCyberpunkSkyline(ctx, w, h);

  // 2. Entangled power lines
  ctx.strokeStyle = 'rgba(0, 240, 255, 0.3)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(0, 80);
  ctx.quadraticCurveTo(w * 0.4, 150, w, 90);
  ctx.moveTo(0, 120);
  ctx.quadraticCurveTo(w * 0.6, 190, w, 130);
  ctx.stroke();

  // 3. Neon signs blinking
  const blink1 = Math.sin(time * 0.006) > -0.2;
  const blink2 = Math.sin(time * 0.009 + 2) > 0;
  drawNeonSign(ctx, 45, 160, 'CYBER', '#ff007f', blink1);
  drawNeonSign(ctx, w - 120, 180, 'ALGO', '#00f0ff', blink2);

  // 4. Slanted fast rain
  ctx.strokeStyle = 'rgba(0, 240, 255, 0.65)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  rain.forEach((r) => {
    r.x -= 3;
    r.y += r.speed;
    if (r.y > h) {
      r.y = -20;
      r.x = Math.random() * (w + 200);
      if (Math.random() < 0.25) {
        splashes.push({ x: r.x, y: h - 5, age: 0, maxAge: 6 });
      }
    }
    ctx.moveTo(r.x, r.y);
    ctx.lineTo(r.x - 4, r.y + r.len);
  });
  ctx.stroke();

  // Draw puddle splash droplets
  ctx.fillStyle = 'rgba(0, 240, 255, 0.7)';
  for (let i = splashes.length - 1; i >= 0; i--) {
    const s = splashes[i];
    s.age++;
    ctx.fillRect(s.x - s.age * 2, s.y - s.age * 1.5, 2, 2);
    ctx.fillRect(s.x + s.age * 2, s.y - s.age * 1.5, 2, 2);
    if (s.age > s.maxAge) splashes.splice(i, 1);
  }
}

function drawCyberpunkSkyline(ctx: CanvasRenderingContext2D, w: number, h: number) {
  ctx.fillStyle = '#0d021a';
  // Buildings
  ctx.fillRect(0, h - 220, 110, 220);
  ctx.fillRect(120, h - 180, 90, 180);
  ctx.fillRect(w - 230, h - 250, 100, 250);
  ctx.fillRect(w - 110, h - 200, 110, 200);

  // Tiny illuminated windows
  ctx.fillStyle = '#ffe600';
  for (let i = 0; i < 5; i++) {
    ctx.fillRect(20, h - 200 + i * 35, 8, 12);
    ctx.fillRect(55, h - 200 + i * 35, 8, 12);
    ctx.fillRect(w - 80, h - 180 + i * 35, 8, 12);
  }
}

function drawNeonSign(ctx: CanvasRenderingContext2D, x: number, y: number, text: string, color: string, on: boolean) {
  if (!on) return;
  ctx.save();
  ctx.font = 'bold 16px monospace';
  ctx.fillStyle = color;
  ctx.shadowColor = color;
  ctx.shadowBlur = 15;
  ctx.fillText(text, x, y);
  ctx.restore();
}

// ======================================================================
// THEME 7: HOÀNG HÔN SYNTHWAVE (Retro Coast)
// ======================================================================
function renderSynthwaveSunset(ctx: CanvasRenderingContext2D, w: number, h: number, tick: number) {
  const horizon = h * 0.72;

  // Giant striped retro sun
  const sunR = Math.min(w * 0.18, 130);
  const sunX = w / 2;
  const sunY = horizon - 20;

  ctx.save();
  for (let i = -sunR; i <= sunR; i += 8) {
    const ypos = sunY + i;
    if (ypos > horizon) continue;
    const bandWidth = Math.sqrt(Math.max(0, sunR * sunR - i * i)) * 2;
    const gap = Math.max(1, ((i + sunR) / (sunR * 2)) * 5);
    const grad = (i + sunR) / (sunR * 2);

    ctx.fillStyle = grad < 0.5 ? '#f43f5e' : '#facc15';
    ctx.fillRect(sunX - bandWidth / 2, ypos, bandWidth, 8 - gap);
  }
  ctx.restore();

  // Ocean surface
  ctx.fillStyle = '#0f021f';
  ctx.fillRect(0, horizon, w, h - horizon);

  // Synthwave Grid Perspective Lines
  ctx.strokeStyle = 'rgba(236, 72, 153, 0.45)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  for (let x = -w * 0.5; x <= w * 1.5; x += 60) {
    ctx.moveTo(w / 2, horizon);
    ctx.lineTo(x, h);
  }
  // Horizontal grid lines moving forward
  for (let y = horizon; y < h; y += 16) {
    const offset = (y - horizon + (tick * 20) % 16);
    ctx.moveTo(0, horizon + offset);
    ctx.lineTo(w, horizon + offset);
  }
  ctx.stroke();

  // Palm silhouettes on margins
  drawPixelPalm(ctx, 30, horizon + 30);
  drawPixelPalm(ctx, w - 80, horizon + 30);
}

function drawPixelPalm(ctx: CanvasRenderingContext2D, x: number, y: number) {
  ctx.fillStyle = '#07000f';
  // Trunk
  ctx.fillRect(x + 20, y - 130, 14, 130);
  // Palm fronds
  ctx.fillRect(x - 30, y - 145, 50, 12);
  ctx.fillRect(x + 30, y - 145, 50, 12);
  ctx.fillRect(x - 20, y - 160, 40, 10);
  ctx.fillRect(x + 25, y - 160, 40, 10);
}

// ======================================================================
// THEME 8: RỪNG SÂU ĐOM ĐÓM (Enchanted Forest)
// ======================================================================
function renderEnchantedForest(ctx: CanvasRenderingContext2D, w: number, h: number, fireflies: any[], time: number) {
  // Ancient trees framing sides
  ctx.fillStyle = '#021a10';
  ctx.fillRect(0, 0, 75, h);
  ctx.fillRect(w - 75, 0, 75, h);

  // Glowing mushrooms on forest floor
  drawGlowingMushroom(ctx, 25, h - 30, '#00e676');
  drawGlowingMushroom(ctx, 50, h - 25, '#ccff00');
  drawGlowingMushroom(ctx, w - 55, h - 35, '#00e676');

  // Fireflies floating & pulsing
  fireflies.forEach((f) => {
    f.x += f.baseSpeedX + Math.sin(time * 0.002 + f.phase) * 0.5;
    f.y += f.baseSpeedY + Math.cos(time * 0.002 + f.phase) * 0.5;

    if (f.x > w) f.x = 0;
    if (f.x < 0) f.x = w;
    if (f.y > h) f.y = 0;
    if (f.y < 0) f.y = h;

    const pulse = (Math.sin(time * 0.004 + f.phase) + 1) / 2; // 0..1
    ctx.save();
    ctx.fillStyle = `rgba(204, 255, 0, ${pulse * 0.85 + 0.15})`;
    ctx.shadowColor = '#ccff00';
    ctx.shadowBlur = pulse * 12 + 4;
    ctx.fillRect(Math.floor(f.x), Math.floor(f.y), f.size, f.size);
    ctx.restore();
  });
}

function drawGlowingMushroom(ctx: CanvasRenderingContext2D, x: number, y: number, color: string) {
  ctx.fillStyle = '#ffffffaa';
  ctx.fillRect(x + 4, y + 6, 4, 12);
  ctx.fillStyle = color;
  ctx.shadowColor = color;
  ctx.shadowBlur = 10;
  ctx.fillRect(x, y, 14, 8);
  ctx.shadowBlur = 0;
}

// ======================================================================
// THEME 9: SA MẠC ỐC ĐẢO (Desert Oasis & Stars)
// ======================================================================
function renderDesertOasis(ctx: CanvasRenderingContext2D, w: number, h: number, meteor: any, time: number) {
  // Stars background
  ctx.fillStyle = '#ffffff';
  for (let i = 0; i < 40; i++) {
    const sx = (i * 97) % w;
    const sy = (i * 53) % (h * 0.6);
    ctx.fillRect(sx, sy, 2, 2);
  }

  // Shooting star
  if (meteor) {
    ctx.save();
    ctx.strokeStyle = '#fff176';
    ctx.lineWidth = 2.5;
    ctx.shadowColor = '#fff176';
    ctx.shadowBlur = 15;
    ctx.beginPath();
    ctx.moveTo(meteor.x, meteor.y);
    ctx.lineTo(meteor.x - meteor.vx * 3, meteor.y - meteor.vy * 3);
    ctx.stroke();
    ctx.restore();
  }

  // Rolling sand dunes
  drawHills(ctx, w, h, ['#b45309', '#d97706', '#f59e0b']);

  // Oasis pool & palms bottom right
  ctx.fillStyle = '#06b6d4';
  ctx.shadowColor = '#06b6d4';
  ctx.shadowBlur = 12;
  ctx.fillRect(w - 180, h - 45, 120, 25);
  ctx.shadowBlur = 0;

  drawPixelPalm(ctx, w - 190, h - 30);
}

// ======================================================================
// THEME 10: TRẠM VŨ TRỤ (Cosmic Nebula)
// ======================================================================
function renderCosmicNebula(ctx: CanvasRenderingContext2D, w: number, h: number, dust: any[], time: number) {
  // Nebula Swirl glow
  ctx.save();
  const radGrad = ctx.createRadialGradient(w * 0.5, h * 0.4, 50, w * 0.5, h * 0.4, w * 0.5);
  radGrad.addColorStop(0, 'rgba(192, 132, 252, 0.4)');
  radGrad.addColorStop(0.5, 'rgba(126, 34, 206, 0.25)');
  radGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = radGrad;
  ctx.fillRect(0, 0, w, h);
  ctx.restore();

  // Drifting stardust
  dust.forEach((d) => {
    d.x += d.speedX;
    d.y += d.speedY;
    if (d.x > w) d.x = 0;
    if (d.x < 0) d.x = w;
    if (d.y > h) d.y = 0;
    if (d.y < 0) d.y = h;

    ctx.fillStyle = `rgba(102, 252, 241, ${d.brightness})`;
    ctx.fillRect(d.x, d.y, d.size, d.size);
  });

  // Dome viewport interior frame with rivets
  ctx.fillStyle = '#090a10';
  ctx.fillRect(0, 0, 24, h);
  ctx.fillRect(w - 24, 0, 24, h);
  ctx.fillRect(0, 0, w, 24);
  ctx.fillRect(0, h - 35, w, 35);

  // Blinking console LED lights at bottom
  const ledColors = ['#10b981', '#06b6d4', '#f59e0b', '#ef4444'];
  for (let i = 0; i < 8; i++) {
    const isBlink = Math.sin(time * 0.005 + i * 1.5) > 0;
    ctx.fillStyle = isBlink ? ledColors[i % ledColors.length] : '#1e293b';
    ctx.fillRect(40 + i * 28, h - 22, 10, 8);
  }
}

// ======================================================================
// THEME 11: THƯ VIỆN CỔ BÊN LÒ SƯỞI (Cozy Library)
// ======================================================================
function renderCozyLibrary(ctx: CanvasRenderingContext2D, w: number, h: number, embers: any[], time: number) {
  // Bookshelves on left and right
  drawPixelBookshelf(ctx, 0, 0, 80, h);
  drawPixelBookshelf(ctx, w - 80, 0, 80, h);

  // Fireplace on bottom left
  const fireX = 110;
  const fireY = h - 60;

  // Stone hearth
  ctx.fillStyle = '#334155';
  ctx.fillRect(fireX - 30, fireY - 30, 80, 70);
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(fireX - 15, fireY - 15, 50, 50);

  // Pixel dancing flames
  const flameHeight = 25 + Math.sin(time * 0.015) * 8 + Math.cos(time * 0.02) * 5;
  ctx.fillStyle = '#ff5722';
  ctx.fillRect(fireX - 10, fireY + 30 - flameHeight, 40, flameHeight);
  ctx.fillStyle = '#ffb300';
  ctx.fillRect(fireX - 4, fireY + 30 - flameHeight * 0.7, 28, flameHeight * 0.7);

  // Cozy Embers floating
  embers.forEach((e) => {
    e.x += e.vx;
    e.y += e.vy;
    e.life++;
    if (e.life > e.maxLife) {
      e.life = 0;
      e.x = fireX + (Math.random() - 0.5) * 30;
      e.y = fireY + 20;
    }
    ctx.fillStyle = '#ff8a65';
    ctx.fillRect(e.x, e.y, e.size, e.size);
  });
}

function drawPixelBookshelf(ctx: CanvasRenderingContext2D, x: number, y: number, bw: number, bh: number) {
  ctx.fillStyle = '#271206';
  ctx.fillRect(x, y, bw, bh);

  const bookColors = ['#991b1b', '#065f46', '#1e40af', '#854d0e', '#701a75'];
  for (let row = 40; row < bh; row += 60) {
    ctx.fillStyle = '#451a03';
    ctx.fillRect(x, row + 45, bw, 8); // Shelf plank

    for (let bx = x + 8; bx < x + bw - 12; bx += 10) {
      const col = bookColors[(bx * 7) % bookColors.length];
      const bookH = 30 + ((bx * 3) % 15);
      ctx.fillStyle = col;
      ctx.fillRect(bx, row + 45 - bookH, 7, bookH);
    }
  }
}

// ======================================================================
// THEME 12: ĐẦM LẦY HUYỀN BÍ (Mystic Swamp)
// ======================================================================
function renderMysticSwamp(ctx: CanvasRenderingContext2D, w: number, h: number, bubbles: any[], time: number) {
  // Eerie dark water surface
  ctx.fillStyle = '#06110b';
  ctx.fillRect(0, h - 90, w, 90);

  // Glowing Runestone
  ctx.fillStyle = '#1e293b';
  ctx.fillRect(w * 0.15, h - 130, 45, 90);
  ctx.fillStyle = '#00e676';
  ctx.shadowColor = '#00e676';
  ctx.shadowBlur = 12;
  ctx.fillRect(w * 0.15 + 18, h - 110, 8, 30);
  ctx.fillRect(w * 0.15 + 12, h - 95, 20, 6);
  ctx.shadowBlur = 0;

  // Crawling mist layers
  const mistOffset = (time * 0.04) % w;
  ctx.fillStyle = 'rgba(74, 222, 128, 0.08)';
  ctx.fillRect(0, h - 70, w, 35);
  ctx.fillRect(0, h - 45, w, 25);

  // Rising swamp bubbles
  ctx.fillStyle = 'rgba(24, 255, 255, 0.6)';
  bubbles.forEach((b) => {
    b.y += b.vy;
    if (b.y < h - 90) {
      b.y = h - 10;
      b.x = Math.random() * w;
    }
    ctx.fillRect(b.x, b.y, b.size, b.size);
  });
}

// ======================================================================
// THEME 13: QUÁN CÀ PHÊ CHIỀU MƯA (Rainy Cafe)
// ======================================================================
function renderRainyCafe(ctx: CanvasRenderingContext2D, w: number, h: number, rain: any[], steam: any[], time: number) {
  // Rain on window
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.35)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  rain.forEach((r) => {
    r.y += r.speed * 0.6;
    if (r.y > h) {
      r.y = -10;
      r.x = Math.random() * w;
    }
    ctx.moveTo(r.x, r.y);
    ctx.lineTo(r.x, r.y + r.len);
  });
  ctx.stroke();

  // Wooden window table in foreground
  ctx.fillStyle = '#271815';
  ctx.fillRect(0, h - 60, w, 60);

  // Coffee mug & notebook
  const mugX = 110;
  const mugY = h - 65;
  ctx.fillStyle = '#f8fafc';
  ctx.fillRect(mugX, mugY - 25, 28, 26); // Mug
  ctx.fillRect(mugX + 28, mugY - 20, 8, 15); // Handle

  // Steam rising from cup
  steam.forEach((s) => {
    s.y += s.vy;
    s.x += Math.sin(s.y * 0.05 + time * 0.003) * 0.6;
    if (s.y < mugY - 80) {
      s.y = mugY - 25;
      s.x = mugX + 12 + (Math.random() - 0.5) * 8;
    }
    ctx.fillStyle = `rgba(255, 255, 255, ${s.alpha})`;
    ctx.fillRect(s.x, s.y, s.size, s.size);
  });
}

// ======================================================================
// THEME 14: ĐỈNH NÚI MÂY NGÀN (Mountain Peak)
// ======================================================================
function renderMountainPeak(ctx: CanvasRenderingContext2D, w: number, h: number, eagleX: number, eagleY: number, time: number) {
  // Sharp jagged alpine peaks in background
  ctx.fillStyle = '#1e1b4b';
  ctx.beginPath();
  ctx.moveTo(0, h);
  ctx.lineTo(w * 0.2, h - 180);
  ctx.lineTo(w * 0.45, h);
  ctx.fill();

  ctx.beginPath();
  ctx.moveTo(w * 0.4, h);
  ctx.lineTo(w * 0.7, h - 220);
  ctx.lineTo(w, h);
  ctx.fill();

  // Snow caps on peaks
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.moveTo(w * 0.17, h - 155);
  ctx.lineTo(w * 0.2, h - 180);
  ctx.lineTo(w * 0.24, h - 155);
  ctx.fill();

  ctx.beginPath();
  ctx.moveTo(w * 0.66, h - 190);
  ctx.lineTo(w * 0.7, h - 220);
  ctx.lineTo(w * 0.74, h - 190);
  ctx.fill();

  // Rolling sea of clouds below
  ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
  ctx.beginPath();
  ctx.arc(w * 0.3, h + 40, w * 0.45, 0, Math.PI * 2);
  ctx.arc(w * 0.75, h + 50, w * 0.5, 0, Math.PI * 2);
  ctx.fill();

  // Soaring Eagle pixel silhouette
  drawPixelEagle(ctx, eagleX, eagleY, (time * 0.008) % (Math.PI * 2));
}

function drawPixelEagle(ctx: CanvasRenderingContext2D, x: number, y: number, wingPhase: number) {
  ctx.fillStyle = '#0f172a';
  const wingY = Math.sin(wingPhase) * 6;

  // Body
  ctx.fillRect(x, y, 14, 6);
  // Wings
  ctx.fillRect(x - 14, y - wingY, 14, 4);
  ctx.fillRect(x + 14, y - wingY, 14, 4);
  // Head
  ctx.fillStyle = '#f8fafc';
  ctx.fillRect(x + 12, y - 2, 5, 4);
}
