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

    // ================== SHARED PARTICLES & STATE ==================

    // 1. Anime Sky: multi-layer clouds
    const clouds = Array.from({ length: 9 }, (_, i) => ({
      x: (i * width) / 5 + (Math.random() - 0.5) * 120,
      y: 40 + (i % 3) * 65 + Math.random() * 40,
      layer: (i % 3) + 1,
      speed: 0.15 + (i % 3) * 0.18,
      width: 140 + (i % 3) * 60,
      height: 45 + (i % 3) * 20
    }));

    // Wind Gust Cycle (Every ~20s)
    let lastWindTime = performance.now();
    let isWindGust = false;
    let windDirection = 1;

    // Foliage particles (Summer oak leaves, Autumn maple leaves, Sakura petals, HUST mahogany leaves)
    const foliageParticles = Array.from({ length: 55 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.2) * 1.5,
      vy: Math.random() * 1.5 + 0.8,
      size: Math.floor(Math.random() * 4) + 4,
      rot: Math.random() * Math.PI * 2,
      rotSpeed: (Math.random() - 0.5) * 0.08,
      colorIndex: Math.floor(Math.random() * 4)
    }));

    // Winter Snowflakes
    const snowflakes = Array.from({ length: 75 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      size: Math.random() < 0.5 ? 3 : Math.random() < 0.85 ? 4 : 6,
      speedY: Math.random() * 1.2 + 0.6,
      swayFreq: Math.random() * 0.02 + 0.01,
      swayAmp: Math.random() * 1.5 + 0.5,
      seed: Math.random() * 100
    }));

    // Cyberpunk & Rainy Cafe raindrops
    const raindrops = Array.from({ length: 120 }, () => ({
      x: Math.random() * (width + 200),
      y: Math.random() * height,
      len: Math.floor(Math.random() * 18) + 12,
      speed: Math.random() * 12 + 18
    }));
    const splashes: Array<{ x: number; y: number; age: number; maxAge: number }> = [];

    // Synthwave Sunset tick
    let synthwaveTick = 0;

    // Enchanted Forest: Fireflies
    const fireflies = Array.from({ length: 35 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      size: Math.random() < 0.5 ? 3 : 4,
      phase: Math.random() * Math.PI * 2,
      baseSpeedX: (Math.random() - 0.5) * 0.6,
      baseSpeedY: (Math.random() - 0.5) * 0.5
    }));

    // Desert Oasis & Aurora: Meteors
    let lastMeteorTime = performance.now();
    let activeMeteor: { x: number; y: number; vx: number; vy: number; len: number; life: number } | null = null;

    // Cosmic Nebula: Stardust
    const stardust = Array.from({ length: 45 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      size: Math.random() < 0.7 ? 2 : 3,
      speedX: (Math.random() - 0.5) * 0.4,
      speedY: (Math.random() - 0.5) * 0.4,
      brightness: Math.random() * 0.8 + 0.2
    }));

    // Cozy Library: Embers
    const embers = Array.from({ length: 25 }, () => ({
      x: 90 + Math.random() * 40,
      y: height - 60 - Math.random() * 20,
      vx: (Math.random() - 0.5) * 0.8,
      vy: -(Math.random() * 1.5 + 0.8),
      life: 0,
      maxLife: Math.random() * 40 + 30,
      size: Math.random() < 0.6 ? 2 : 3
    }));

    // Mystic Swamp: Bubbles
    const swampBubbles = Array.from({ length: 14 }, () => ({
      x: Math.random() * width,
      y: height - 10 - Math.random() * 80,
      vy: -(Math.random() * 0.6 + 0.3),
      size: Math.floor(Math.random() * 4) + 3
    }));

    // Rainy Cafe: Coffee steam
    const steamParticles = Array.from({ length: 18 }, () => ({
      x: 120 + (Math.random() - 0.5) * 16,
      y: height - 85 - Math.random() * 30,
      vy: -(Math.random() * 0.7 + 0.4),
      alpha: Math.random() * 0.5 + 0.2,
      size: Math.random() * 3 + 3
    }));

    // Mountain Peak Eagle
    let eagleX = -60;
    let eagleY = 160;

    // Tokyo Train Position
    let trainX = -180;

    // Ha Long Bay boat position
    let boatX = width * 0.2;
    let boatDirection = 0.35;

    // Atlantis Fish Schools
    const fishes = Array.from({ length: 12 }, (_, i) => ({
      x: Math.random() * width,
      y: height * 0.45 + Math.random() * (height * 0.4),
      speed: Math.random() * 1.2 + 0.8,
      size: Math.random() < 0.5 ? 6 : 8,
      color: i % 2 === 0 ? '#ffb703' : '#00f5d4'
    }));

    // ================== RENDER ANIMATION LOOP ==================
    const render = (time: number) => {
      ctx.imageSmoothingEnabled = false;

      // 1. Base Sky Gradient
      drawSkyBackground(ctx, themeId, width, height, time);

      // Check Wind Gust Cycle (~20s)
      if (time - lastWindTime > 20000) {
        lastWindTime = time;
        isWindGust = true;
        windDirection = Math.random() > 0.5 ? 1 : -1;
      }
      if (isWindGust && time - lastWindTime > 5000) {
        isWindGust = false;
      }

      // Check Shooting Star Cycle (~25s)
      if ((themeId === 'desert-oasis' || themeId === 'aurora-borealis') && !activeMeteor && time - lastMeteorTime > 25000) {
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

      // 2. Render Corresponding Theme
      switch (themeId) {
        case 'anime-sky':
          renderAnimeSky(ctx, width, height, clouds);
          break;
        case 'summer-hill':
          renderSummerMeadow(ctx, width, height, foliageParticles, isWindGust, windDirection, time);
          break;
        case 'autumn-hill':
          renderAutumnMeadow(ctx, width, height, foliageParticles, isWindGust, windDirection, time);
          break;
        case 'winter-hill':
          renderWinterSnowscape(ctx, width, height, snowflakes, time);
          break;
        case 'sakura-hill':
          renderSakuraGrandBloom(ctx, width, height, foliageParticles, isWindGust, windDirection, time);
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
          renderDesertOasis(ctx, width, height, activeMeteor);
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
        // ===== 10 NEW THEMES =====
        case 'tropical-ocean':
          renderTropicalOcean(ctx, width, height, time);
          break;
        case 'sunset-coast':
          renderSunsetCoast(ctx, width, height, time);
          break;
        case 'tokyo-night':
          trainX += 3.5;
          if (trainX > width + 250) trainX = -220;
          renderTokyoNight(ctx, width, height, trainX, time);
          break;
        case 'shanghai-bund':
          renderShanghaiBund(ctx, width, height, time);
          break;
        case 'seoul-city':
          renderSeoulCity(ctx, width, height, time);
          break;
        case 'hust-parabol':
          renderHustParabol(ctx, width, height, foliageParticles, isWindGust, windDirection, time);
          break;
        case 'halong-bay':
          boatX += boatDirection;
          if (boatX > width * 0.85 || boatX < width * 0.15) boatDirection *= -1;
          renderHaLongBay(ctx, width, height, boatX, time);
          break;
        case 'hoian-lantern':
          renderHoiAnLantern(ctx, width, height, time);
          break;
        case 'atlantis-deep':
          renderAtlantisDeep(ctx, width, height, fishes, time);
          break;
        case 'aurora-borealis':
          renderAuroraBorealis(ctx, width, height, activeMeteor, time);
          if (activeMeteor) {
            activeMeteor.x += activeMeteor.vx;
            activeMeteor.y += activeMeteor.vy;
            activeMeteor.life--;
            if (activeMeteor.life <= 0) activeMeteor = null;
          }
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
// SKY GRADIENTS FOR ALL 24 THEMES
// ======================================================================
function drawSkyBackground(
  ctx: CanvasRenderingContext2D,
  themeId: ThemeId,
  w: number,
  h: number,
  time: number
) {
  const grad = ctx.createLinearGradient(0, 0, 0, h);

  switch (themeId) {
    case 'anime-sky':
      grad.addColorStop(0, '#1d4ed8');
      grad.addColorStop(0.4, '#3b82f6');
      grad.addColorStop(0.75, '#60a5fa');
      grad.addColorStop(1, '#bae6fd');
      break;
    case 'summer-hill':
      grad.addColorStop(0, '#0284c7');
      grad.addColorStop(0.45, '#38bdf8');
      grad.addColorStop(0.8, '#7dd3fc');
      grad.addColorStop(1, '#e0f2fe');
      break;
    case 'autumn-hill':
      grad.addColorStop(0, '#3b0764');
      grad.addColorStop(0.35, '#7c2d12');
      grad.addColorStop(0.7, '#ea580c');
      grad.addColorStop(1, '#fde047');
      break;
    case 'winter-hill':
      grad.addColorStop(0, '#0f172a');
      grad.addColorStop(0.45, '#1e293b');
      grad.addColorStop(0.8, '#475569');
      grad.addColorStop(1, '#e2e8f0');
      break;
    case 'sakura-hill':
      grad.addColorStop(0, '#1a0d18');
      grad.addColorStop(0.4, '#4a044e');
      grad.addColorStop(0.75, '#831843');
      grad.addColorStop(1, '#fce7f3');
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
    case 'tropical-ocean':
      grad.addColorStop(0, '#0284c7');
      grad.addColorStop(0.4, '#38bdf8');
      grad.addColorStop(0.7, '#00b4d8');
      grad.addColorStop(1, '#90e0ef');
      break;
    case 'sunset-coast':
      grad.addColorStop(0, '#2b0914');
      grad.addColorStop(0.35, '#6a040f');
      grad.addColorStop(0.7, '#d00000');
      grad.addColorStop(1, '#ffba08');
      break;
    case 'tokyo-night':
      grad.addColorStop(0, '#05060f');
      grad.addColorStop(0.5, '#0f1224');
      grad.addColorStop(1, '#20132b');
      break;
    case 'shanghai-bund':
      grad.addColorStop(0, '#0a0214');
      grad.addColorStop(0.45, '#1f0538');
      grad.addColorStop(0.8, '#3d0859');
      grad.addColorStop(1, '#6b114d');
      break;
    case 'seoul-city':
      grad.addColorStop(0, '#070410');
      grad.addColorStop(0.5, '#150e28');
      grad.addColorStop(1, '#28143a');
      break;
    case 'hust-parabol':
      grad.addColorStop(0, '#1c060b');
      grad.addColorStop(0.45, '#3e0c15');
      grad.addColorStop(0.8, '#681523');
      grad.addColorStop(1, '#9e1d30');
      break;
    case 'halong-bay':
      grad.addColorStop(0, '#02201d');
      grad.addColorStop(0.45, '#004d40');
      grad.addColorStop(0.8, '#00796b');
      grad.addColorStop(1, '#4db6ac');
      break;
    case 'hoian-lantern':
      grad.addColorStop(0, '#1f1401');
      grad.addColorStop(0.45, '#422800');
      grad.addColorStop(0.8, '#7a4600');
      grad.addColorStop(1, '#b45309');
      break;
    case 'atlantis-deep':
      grad.addColorStop(0, '#000913');
      grad.addColorStop(0.4, '#001e3d');
      grad.addColorStop(0.8, '#003566');
      grad.addColorStop(1, '#001220');
      break;
    case 'aurora-borealis':
      grad.addColorStop(0, '#02040a');
      grad.addColorStop(0.45, '#05131f');
      grad.addColorStop(0.8, '#0a252f');
      grad.addColorStop(1, '#03080e');
      break;
    default:
      grad.addColorStop(0, '#070b14');
      grad.addColorStop(1, '#0f172a');
  }

  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h);
}

// ======================================================================
// REFINED PIXEL GRASS & SOIL
// ======================================================================
function drawPixelGrassFloor(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  baseColor: string,
  darkColor: string,
  bladeColor: string,
  flowerColor?: string
) {
  const floorY = h - 45;

  // Dark soil base
  ctx.fillStyle = darkColor;
  ctx.fillRect(0, floorY + 12, w, 45);

  // Grass bed
  ctx.fillStyle = baseColor;
  ctx.fillRect(0, floorY, w, 20);

  // Individual pixel grass blades along the crest
  ctx.fillStyle = bladeColor;
  for (let x = 0; x < w; x += 4) {
    const bladeH = 6 + ((x * 7) % 10);
    ctx.fillRect(x, floorY - bladeH, 2, bladeH);
    if (x % 12 === 0) {
      ctx.fillRect(x + 1, floorY - bladeH - 3, 2, 4);
    }
  }

  // Tiny wildflowers
  if (flowerColor) {
    ctx.fillStyle = flowerColor;
    for (let x = 16; x < w; x += 42) {
      const fy = floorY - 8 - ((x * 3) % 8);
      ctx.fillRect(x, fy, 3, 3);
      ctx.fillRect(x - 2, fy + 1, 7, 2);
    }
  }
}

// ======================================================================
// 1. ANIME SKY
// ======================================================================
function renderAnimeSky(ctx: CanvasRenderingContext2D, w: number, h: number, clouds: any[]) {
  const sunX = w * 0.85;
  const sunY = h * 0.22;

  ctx.save();
  ctx.fillStyle = 'rgba(255, 245, 157, 0.25)';
  ctx.beginPath();
  ctx.arc(sunX, sunY, 85, 0, Math.PI * 2);
  ctx.fill();

  clouds.forEach((c) => {
    c.x += c.speed;
    if (c.x > w + 200) c.x = -250;

    const baseCol = c.layer === 1 ? 'rgba(255, 255, 255, 0.5)' : c.layer === 2 ? 'rgba(255, 255, 255, 0.75)' : 'rgba(255, 255, 255, 0.95)';
    const shadowCol = c.layer === 1 ? 'rgba(186, 230, 253, 0.4)' : c.layer === 2 ? 'rgba(147, 197, 253, 0.6)' : 'rgba(125, 211, 252, 0.75)';

    const b = 10;
    ctx.fillStyle = shadowCol;
    ctx.fillRect(c.x + b, c.y + c.height * 0.5, c.width - b * 2, c.height * 0.5);

    ctx.fillStyle = baseCol;
    ctx.fillRect(c.x + b * 2, c.y + b, c.width - b * 4, c.height * 0.7);
    ctx.fillRect(c.x + c.width * 0.25, c.y, c.width * 0.5, c.height * 0.8);
    ctx.fillRect(c.x + c.width * 0.4, c.y - b, c.width * 0.3, c.height * 0.9);
    ctx.fillRect(c.x, c.y + c.height * 0.3, c.width, c.height * 0.5);
  });
  ctx.restore();
}

// ======================================================================
// 2. SUMMER MEADOW (Detailed Grand Oak Tree & Lush Grass)
// ======================================================================
function renderSummerMeadow(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  leaves: any[],
  isWind: boolean,
  dir: number,
  time: number
) {
  // Ground
  drawPixelGrassFloor(ctx, w, h, '#15803d', '#052e16', '#22c55e', '#facc15');

  // Grand Majestic Oak Tree on the Right
  drawGrandOakTree(ctx, w - 240, h - 45);

  // Secondary oak sapling on the Left
  drawPixelTree(ctx, 40, h - 45, 120, '#16a34a', '#22c55e', '#86efac', '#78350f');

  // Blowing Green Leaves
  const leafColors = ['#4ade80', '#22c55e', '#16a34a', '#86efac'];
  leaves.forEach((p) => {
    const extraSpeedX = isWind ? dir * 6.5 : dir * 1.0;
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
    ctx.fillStyle = leafColors[p.colorIndex % leafColors.length];
    ctx.fillRect(-p.size, -p.size / 2, p.size * 2, p.size);
    ctx.restore();
  });
}

function drawGrandOakTree(ctx: CanvasRenderingContext2D, x: number, y: number) {
  // Massive gnarled trunk with roots
  ctx.fillStyle = '#451a03';
  ctx.fillRect(x + 70, y - 180, 50, 180);
  // Roots
  ctx.fillRect(x + 40, y - 40, 40, 40);
  ctx.fillRect(x + 110, y - 30, 40, 30);
  // Bark highlights
  ctx.fillStyle = '#78350f';
  ctx.fillRect(x + 85, y - 170, 18, 170);
  ctx.fillRect(x + 75, y - 110, 8, 40);

  // Large canopy boughs (multi-layer pixel blocks)
  ctx.fillStyle = '#14532d'; // Deep shadow
  ctx.fillRect(x - 40, y - 290, 260, 150);
  ctx.fillRect(x - 20, y - 320, 220, 60);

  ctx.fillStyle = '#15803d'; // Mid dark
  ctx.fillRect(x - 60, y - 270, 290, 110);
  ctx.fillRect(x - 10, y - 340, 190, 70);

  ctx.fillStyle = '#16a34a'; // Mid tone
  ctx.fillRect(x - 30, y - 290, 240, 100);
  ctx.fillRect(x + 20, y - 355, 140, 60);

  ctx.fillStyle = '#22c55e'; // Bright highlight
  ctx.fillRect(x + 10, y - 310, 120, 65);
  ctx.fillRect(x + 40, y - 365, 80, 40);

  ctx.fillStyle = '#86efac'; // Top leaf tips
  ctx.fillRect(x + 55, y - 355, 45, 20);
  ctx.fillRect(x + 120, y - 300, 35, 20);
}

// ======================================================================
// 3. AUTUMN MEADOW (Grand Japanese Maple Tree & Swirling Leaves)
// ======================================================================
function renderAutumnMeadow(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  leaves: any[],
  isWind: boolean,
  dir: number,
  time: number
) {
  drawPixelGrassFloor(ctx, w, h, '#a16207', '#451a03', '#ca8a04', '#ea580c');

  // Grand Autumn Maple on Right
  drawGrandMapleTree(ctx, w - 240, h - 45);
  // Secondary tree on Left
  drawPixelTree(ctx, 40, h - 45, 130, '#b91c1c', '#ea580c', '#facc15', '#451a03');

  const mapleColors = ['#dc2626', '#ea580c', '#f97316', '#facc15'];
  leaves.forEach((p, idx) => {
    const spiral = Math.sin(p.y * 0.05 + idx) * 2.5;
    const extraSpeedX = (isWind ? dir * 7.5 : dir * 1.5) + spiral;
    p.x += p.vx + extraSpeedX;
    p.y += p.vy * (isWind ? 1.4 : 1);
    p.rot += p.rotSpeed * (isWind ? 3.5 : 1.8);

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
    const s = p.size;
    ctx.fillRect(-s, -s, s * 2, s * 2);
    ctx.fillRect(-s * 1.4, -s * 0.4, s * 2.8, s * 0.8);
    ctx.fillRect(-s * 0.4, -s * 1.4, s * 0.8, s * 2.8);
    ctx.restore();
  });
}

function drawGrandMapleTree(ctx: CanvasRenderingContext2D, x: number, y: number) {
  // Twisted trunk
  ctx.fillStyle = '#261005';
  ctx.fillRect(x + 70, y - 180, 45, 180);
  ctx.fillRect(x + 40, y - 40, 35, 40);
  ctx.fillRect(x + 105, y - 30, 35, 30);
  ctx.fillStyle = '#542d17';
  ctx.fillRect(x + 85, y - 170, 16, 170);

  // Fiery crimson & orange canopy
  ctx.fillStyle = '#7f1d1d';
  ctx.fillRect(x - 40, y - 290, 250, 150);
  ctx.fillStyle = '#991b1b';
  ctx.fillRect(x - 60, y - 270, 280, 110);
  ctx.fillRect(x - 10, y - 330, 190, 70);

  ctx.fillStyle = '#dc2626';
  ctx.fillRect(x - 30, y - 290, 230, 100);
  ctx.fillRect(x + 10, y - 350, 140, 60);

  ctx.fillStyle = '#ea580c';
  ctx.fillRect(x + 20, y - 310, 110, 65);
  ctx.fillRect(x + 40, y - 360, 75, 40);

  ctx.fillStyle = '#facc15';
  ctx.fillRect(x + 55, y - 350, 40, 20);
  ctx.fillRect(x + 115, y - 295, 30, 18);
}

// ======================================================================
// 4. WINTER SNOWSCAPE (Snow Pine & Snowman)
// ======================================================================
function renderWinterSnowscape(ctx: CanvasRenderingContext2D, w: number, h: number, snowflakes: any[], time: number) {
  // Snow covered floor
  drawPixelGrassFloor(ctx, w, h, '#e2e8f0', '#94a3b8', '#ffffff');

  // Snowman on left
  drawDetailedSnowman(ctx, 90, h - 80);

  // Grand Snow-Laden Pine Tree on right
  drawGrandSnowPine(ctx, w - 200, h - 45);

  // Multi-sized falling snowflakes
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

function drawDetailedSnowman(ctx: CanvasRenderingContext2D, x: number, y: number) {
  ctx.fillStyle = '#f8fafc';
  ctx.fillRect(x, y, 48, 44);
  ctx.fillRect(x + 7, y - 32, 34, 32);

  // Beanie
  ctx.fillStyle = '#ef4444';
  ctx.fillRect(x + 5, y - 42, 38, 12);
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(x + 19, y - 50, 10, 10);

  // Scarf
  ctx.fillStyle = '#dc2626';
  ctx.fillRect(x + 3, y - 4, 42, 10);
  ctx.fillRect(x + 28, y + 6, 10, 22);

  // Eyes & Buttons
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(x + 14, y - 22, 4, 4);
  ctx.fillRect(x + 28, y - 22, 4, 4);
  ctx.fillRect(x + 22, y + 16, 4, 4);
  ctx.fillRect(x + 22, y + 28, 4, 4);

  // Carrot nose
  ctx.fillStyle = '#f97316';
  ctx.fillRect(x + 20, y - 15, 12, 5);
}

function drawGrandSnowPine(ctx: CanvasRenderingContext2D, x: number, y: number) {
  ctx.fillStyle = '#3e1a06';
  ctx.fillRect(x + 50, y - 70, 24, 70);

  // Tier 1 (bottom)
  ctx.fillStyle = '#064e3b';
  ctx.fillRect(x, y - 115, 125, 50);
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(x - 4, y - 120, 133, 12);

  // Tier 2
  ctx.fillStyle = '#047857';
  ctx.fillRect(x + 15, y - 165, 95, 52);
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(x + 12, y - 170, 101, 10);

  // Tier 3
  ctx.fillStyle = '#059669';
  ctx.fillRect(x + 30, y - 215, 65, 52);
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(x + 28, y - 220, 69, 10);

  // Top Spire with Star
  ctx.fillStyle = '#10b981';
  ctx.fillRect(x + 45, y - 255, 35, 42);
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(x + 43, y - 260, 39, 8);
  ctx.fillStyle = '#facc15';
  ctx.fillRect(x + 56, y - 274, 14, 14);
}

// ======================================================================
// 5. SAKURA GRAND BLOOM (Magnificent Giant Corner Cherry Tree)
// ======================================================================
function renderSakuraGrandBloom(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  petals: any[],
  isWind: boolean,
  dir: number,
  time: number
) {
  // Spring Grass floor
  drawPixelGrassFloor(ctx, w, h, '#831843', '#3b0764', '#f472b6', '#fbcfe8');

  // GORGEOUS GIANT CORNER SAKURA TREE (Occupying top-right to bottom-right corner)
  drawGiantCornerSakura(ctx, w, h, time);

  // Trailing pink sakura petals raining down
  const sakuraColors = ['#ffb7c5', '#ff94b1', '#ffa8c0', '#ffd1dc', '#ff7597'];
  petals.forEach((p) => {
    const extraSpeedX = isWind ? dir * 7.5 : -2.2;
    p.x += p.vx + extraSpeedX;
    p.y += p.vy * (isWind ? 1.3 : 1.1);
    p.rot += p.rotSpeed * (isWind ? 2.5 : 1.2);

    if (p.y > h + 10) {
      p.y = -10;
      p.x = Math.random() * w;
    }
    if (p.x < -20) p.x = w + 40;
    if (p.x > w + 40) p.x = -20;

    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(p.rot);
    ctx.fillStyle = sakuraColors[p.colorIndex % sakuraColors.length];
    const s = p.size;
    ctx.fillRect(-s, -s / 2, s * 1.6, s);
    ctx.fillRect(-s / 2, -s, s, s * 1.8);
    ctx.fillStyle = '#ffffffbb';
    ctx.fillRect(-s / 4, -s / 4, s / 2, s / 2);
    ctx.restore();
  });
}

function drawGiantCornerSakura(ctx: CanvasRenderingContext2D, w: number, h: number, time: number) {
  const originX = w; // Anchored at right edge
  const originY = 0; // Sweeps down from top-right corner

  ctx.save();
  // 1. Heavy dark branches reaching outward and down from top right
  ctx.fillStyle = '#260b18';
  ctx.fillRect(originX - 110, 0, 110, 180);
  // Main arching bough
  ctx.fillRect(originX - 250, 40, 180, 55);
  ctx.fillRect(originX - 380, 70, 160, 45);
  ctx.fillRect(originX - 480, 110, 130, 35);
  ctx.fillRect(originX - 560, 150, 95, 25);

  // Bark light grain
  ctx.fillStyle = '#4c1d33';
  ctx.fillRect(originX - 240, 50, 160, 18);
  ctx.fillRect(originX - 370, 78, 140, 15);
  ctx.fillRect(originX - 470, 116, 110, 12);

  // 2. Thick, layered clouds of cherry blossoms draping downward
  // Deep magenta underlayer
  ctx.fillStyle = '#831843';
  ctx.fillRect(originX - 320, 0, 320, 160);
  ctx.fillRect(originX - 450, 40, 240, 150);
  ctx.fillRect(originX - 580, 90, 220, 160);
  ctx.fillRect(originX - 640, 140, 160, 140);

  // Mid vibrant pink
  ctx.fillStyle = '#db2777';
  ctx.fillRect(originX - 290, 10, 280, 140);
  ctx.fillRect(originX - 430, 50, 220, 130);
  ctx.fillRect(originX - 550, 100, 200, 140);
  ctx.fillRect(originX - 610, 150, 140, 120);

  // Soft sakura petal pink
  ctx.fillStyle = '#f472b6';
  ctx.fillRect(originX - 260, 20, 240, 120);
  ctx.fillRect(originX - 400, 65, 190, 110);
  ctx.fillRect(originX - 520, 115, 170, 120);
  ctx.fillRect(originX - 580, 165, 110, 100);

  // Bright highlight blossoms
  ctx.fillStyle = '#fbcfe8';
  ctx.fillRect(originX - 220, 35, 180, 90);
  ctx.fillRect(originX - 360, 80, 140, 80);
  ctx.fillRect(originX - 480, 130, 120, 85);
  ctx.fillRect(originX - 540, 180, 80, 70);

  // Pure white petal tips
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(originX - 310, 95, 45, 30);
  ctx.fillRect(originX - 440, 145, 45, 30);
  ctx.fillRect(originX - 520, 195, 35, 25);
  ctx.restore();
}

function drawPixelTree(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  heightPx: number,
  c1: string,
  c2: string,
  c3: string,
  trunkCol: string
) {
  ctx.fillStyle = trunkCol;
  ctx.fillRect(x + 18, y - heightPx * 0.6, 16, heightPx * 0.6);

  ctx.fillStyle = c1;
  ctx.fillRect(x - 20, y - heightPx, 90, heightPx * 0.6);
  ctx.fillStyle = c2;
  ctx.fillRect(x - 10, y - heightPx * 1.1, 70, heightPx * 0.5);
  ctx.fillStyle = c3;
  ctx.fillRect(x + 5, y - heightPx * 1.15, 40, heightPx * 0.3);
}

// ======================================================================
// 6. CYBERPUNK RAIN
// ======================================================================
function renderCyberpunkRain(ctx: CanvasRenderingContext2D, w: number, h: number, rain: any[], splashes: any[], time: number) {
  // Buildings
  ctx.fillStyle = '#0d021a';
  ctx.fillRect(0, h - 240, 120, 240);
  ctx.fillRect(130, h - 190, 95, 190);
  ctx.fillRect(w - 240, h - 270, 110, 270);
  ctx.fillRect(w - 120, h - 210, 120, 210);

  // Tiny illuminated windows
  ctx.fillStyle = '#ffe600';
  for (let i = 0; i < 5; i++) {
    ctx.fillRect(25, h - 210 + i * 35, 8, 12);
    ctx.fillRect(65, h - 210 + i * 35, 8, 12);
    ctx.fillRect(w - 85, h - 190 + i * 35, 8, 12);
  }

  // Neon signs
  const blink1 = Math.sin(time * 0.006) > -0.2;
  const blink2 = Math.sin(time * 0.009 + 2) > 0;
  drawNeon(ctx, 40, 160, 'CYBER', '#ff007f', blink1);
  drawNeon(ctx, w - 120, 175, 'ALGO', '#00f0ff', blink2);

  // Slanted rain
  ctx.strokeStyle = 'rgba(0, 240, 255, 0.65)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  rain.forEach((r) => {
    r.x -= 3;
    r.y += r.speed;
    if (r.y > h) {
      r.y = -20;
      r.x = Math.random() * (w + 200);
      if (Math.random() < 0.25) splashes.push({ x: r.x, y: h - 5, age: 0, maxAge: 6 });
    }
    ctx.moveTo(r.x, r.y);
    ctx.lineTo(r.x - 4, r.y + r.len);
  });
  ctx.stroke();

  // Splashes
  ctx.fillStyle = 'rgba(0, 240, 255, 0.7)';
  for (let i = splashes.length - 1; i >= 0; i--) {
    const s = splashes[i];
    s.age++;
    ctx.fillRect(s.x - s.age * 2, s.y - s.age * 1.5, 2, 2);
    ctx.fillRect(s.x + s.age * 2, s.y - s.age * 1.5, 2, 2);
    if (s.age > s.maxAge) splashes.splice(i, 1);
  }
}

function drawNeon(ctx: CanvasRenderingContext2D, x: number, y: number, text: string, col: string, on: boolean) {
  if (!on) return;
  ctx.save();
  ctx.font = 'bold 16px monospace';
  ctx.fillStyle = col;
  ctx.shadowColor = col;
  ctx.shadowBlur = 14;
  ctx.fillText(text, x, y);
  ctx.restore();
}

// ======================================================================
// 7. SYNTHWAVE SUNSET
// ======================================================================
function renderSynthwaveSunset(ctx: CanvasRenderingContext2D, w: number, h: number, tick: number) {
  const horizon = h * 0.72;
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

  ctx.fillStyle = '#0f021f';
  ctx.fillRect(0, horizon, w, h - horizon);

  ctx.strokeStyle = 'rgba(236, 72, 153, 0.45)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  for (let x = -w * 0.5; x <= w * 1.5; x += 60) {
    ctx.moveTo(w / 2, horizon);
    ctx.lineTo(x, h);
  }
  for (let y = horizon; y < h; y += 16) {
    const offset = (y - horizon + (tick * 20) % 16);
    ctx.moveTo(0, horizon + offset);
    ctx.lineTo(w, horizon + offset);
  }
  ctx.stroke();

  drawPixelPalm(ctx, 35, horizon + 30);
  drawPixelPalm(ctx, w - 85, horizon + 30);
}

function drawPixelPalm(ctx: CanvasRenderingContext2D, x: number, y: number) {
  ctx.fillStyle = '#07000f';
  ctx.fillRect(x + 20, y - 130, 14, 130);
  ctx.fillRect(x - 30, y - 145, 50, 12);
  ctx.fillRect(x + 30, y - 145, 50, 12);
  ctx.fillRect(x - 20, y - 160, 40, 10);
  ctx.fillRect(x + 25, y - 160, 40, 10);
}

// ======================================================================
// 8. ENCHANTED FOREST
// ======================================================================
function renderEnchantedForest(ctx: CanvasRenderingContext2D, w: number, h: number, fireflies: any[], time: number) {
  ctx.fillStyle = '#021a10';
  ctx.fillRect(0, 0, 75, h);
  ctx.fillRect(w - 75, 0, 75, h);

  drawGlowingMushroom(ctx, 25, h - 30, '#00e676');
  drawGlowingMushroom(ctx, 50, h - 25, '#ccff00');
  drawGlowingMushroom(ctx, w - 55, h - 35, '#00e676');

  fireflies.forEach((f) => {
    f.x += f.baseSpeedX + Math.sin(time * 0.002 + f.phase) * 0.5;
    f.y += f.baseSpeedY + Math.cos(time * 0.002 + f.phase) * 0.5;

    if (f.x > w) f.x = 0;
    if (f.x < 0) f.x = w;
    if (f.y > h) f.y = 0;
    if (f.y < 0) f.y = h;

    const pulse = (Math.sin(time * 0.004 + f.phase) + 1) / 2;
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
// 9. DESERT OASIS
// ======================================================================
function renderDesertOasis(ctx: CanvasRenderingContext2D, w: number, h: number, meteor: any) {
  ctx.fillStyle = '#ffffff';
  for (let i = 0; i < 40; i++) {
    const sx = (i * 97) % w;
    const sy = (i * 53) % (h * 0.6);
    ctx.fillRect(sx, sy, 2, 2);
  }

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

  // Dunes
  ctx.fillStyle = '#d97706';
  ctx.beginPath();
  ctx.arc(w * 0.3, h + 150, w * 0.45, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#f59e0b';
  ctx.beginPath();
  ctx.arc(w * 0.75, h + 170, w * 0.5, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#06b6d4';
  ctx.fillRect(w - 180, h - 45, 120, 25);
  drawPixelPalm(ctx, w - 190, h - 30);
}

// ======================================================================
// 10. COSMIC NEBULA
// ======================================================================
function renderCosmicNebula(ctx: CanvasRenderingContext2D, w: number, h: number, dust: any[], time: number) {
  ctx.save();
  const radGrad = ctx.createRadialGradient(w * 0.5, h * 0.4, 50, w * 0.5, h * 0.4, w * 0.5);
  radGrad.addColorStop(0, 'rgba(192, 132, 252, 0.4)');
  radGrad.addColorStop(0.5, 'rgba(126, 34, 206, 0.25)');
  radGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = radGrad;
  ctx.fillRect(0, 0, w, h);
  ctx.restore();

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

  // Cockpit dome frame
  ctx.fillStyle = '#090a10';
  ctx.fillRect(0, 0, 24, h);
  ctx.fillRect(w - 24, 0, 24, h);
  ctx.fillRect(0, 0, w, 24);
  ctx.fillRect(0, h - 35, w, 35);

  const ledColors = ['#10b981', '#06b6d4', '#f59e0b', '#ef4444'];
  for (let i = 0; i < 8; i++) {
    const isBlink = Math.sin(time * 0.005 + i * 1.5) > 0;
    ctx.fillStyle = isBlink ? ledColors[i % ledColors.length] : '#1e293b';
    ctx.fillRect(40 + i * 28, h - 22, 10, 8);
  }
}

// ======================================================================
// 11. COZY LIBRARY
// ======================================================================
function renderCozyLibrary(ctx: CanvasRenderingContext2D, w: number, h: number, embers: any[], time: number) {
  drawBookshelf(ctx, 0, 0, 85, h);
  drawBookshelf(ctx, w - 85, 0, 85, h);

  const fireX = 110;
  const fireY = h - 60;
  ctx.fillStyle = '#334155';
  ctx.fillRect(fireX - 30, fireY - 30, 80, 70);
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(fireX - 15, fireY - 15, 50, 50);

  const flameH = 25 + Math.sin(time * 0.015) * 8 + Math.cos(time * 0.02) * 5;
  ctx.fillStyle = '#ff5722';
  ctx.fillRect(fireX - 10, fireY + 30 - flameH, 40, flameH);
  ctx.fillStyle = '#ffb300';
  ctx.fillRect(fireX - 4, fireY + 30 - flameH * 0.7, 28, flameH * 0.7);

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

function drawBookshelf(ctx: CanvasRenderingContext2D, x: number, y: number, bw: number, bh: number) {
  ctx.fillStyle = '#271206';
  ctx.fillRect(x, y, bw, bh);

  const cols = ['#991b1b', '#065f46', '#1e40af', '#854d0e', '#701a75'];
  for (let row = 40; row < bh; row += 60) {
    ctx.fillStyle = '#451a03';
    ctx.fillRect(x, row + 45, bw, 8);

    for (let bx = x + 8; bx < x + bw - 12; bx += 10) {
      const col = cols[(bx * 7) % cols.length];
      const h = 30 + ((bx * 3) % 15);
      ctx.fillStyle = col;
      ctx.fillRect(bx, row + 45 - h, 7, h);
    }
  }
}

// ======================================================================
// 12. MYSTIC SWAMP
// ======================================================================
function renderMysticSwamp(ctx: CanvasRenderingContext2D, w: number, h: number, bubbles: any[], time: number) {
  ctx.fillStyle = '#06110b';
  ctx.fillRect(0, h - 90, w, 90);

  // Runestone
  ctx.fillStyle = '#1e293b';
  ctx.fillRect(w * 0.15, h - 130, 45, 90);
  ctx.fillStyle = '#00e676';
  ctx.shadowColor = '#00e676';
  ctx.shadowBlur = 12;
  ctx.fillRect(w * 0.15 + 18, h - 110, 8, 30);
  ctx.fillRect(w * 0.15 + 12, h - 95, 20, 6);
  ctx.shadowBlur = 0;

  // Mist
  ctx.fillStyle = 'rgba(74, 222, 128, 0.08)';
  ctx.fillRect(0, h - 70, w, 35);
  ctx.fillRect(0, h - 45, w, 25);

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
// 13. RAINY CAFE
// ======================================================================
function renderRainyCafe(ctx: CanvasRenderingContext2D, w: number, h: number, rain: any[], steam: any[], time: number) {
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

  ctx.fillStyle = '#271815';
  ctx.fillRect(0, h - 60, w, 60);

  const mugX = 110;
  const mugY = h - 65;
  ctx.fillStyle = '#f8fafc';
  ctx.fillRect(mugX, mugY - 25, 28, 26);
  ctx.fillRect(mugX + 28, mugY - 20, 8, 15);

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
// 14. MOUNTAIN PEAK
// ======================================================================
function renderMountainPeak(ctx: CanvasRenderingContext2D, w: number, h: number, eagleX: number, eagleY: number, time: number) {
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

  ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
  ctx.beginPath();
  ctx.arc(w * 0.3, h + 40, w * 0.45, 0, Math.PI * 2);
  ctx.arc(w * 0.75, h + 50, w * 0.5, 0, Math.PI * 2);
  ctx.fill();

  // Soaring eagle
  ctx.fillStyle = '#0f172a';
  const wingY = Math.sin((time * 0.008) % (Math.PI * 2)) * 6;
  ctx.fillRect(eagleX, eagleY, 14, 6);
  ctx.fillRect(eagleX - 14, eagleY - wingY, 14, 4);
  ctx.fillRect(eagleX + 14, eagleY - wingY, 14, 4);
  ctx.fillStyle = '#f8fafc';
  ctx.fillRect(eagleX + 12, eagleY - 2, 5, 4);
}

// ======================================================================
// 15. TROPICAL OCEAN (Cát trắng, Sóng biển, Rạn san hô, Rùa biển)
// ======================================================================
function renderTropicalOcean(ctx: CanvasRenderingContext2D, w: number, h: number, time: number) {
  const waterY = h * 0.55;

  // Sea depth gradient
  const seaGrad = ctx.createLinearGradient(0, waterY, 0, h);
  seaGrad.addColorStop(0, '#0077b6');
  seaGrad.addColorStop(0.5, '#00b4d8');
  seaGrad.addColorStop(0.85, '#90e0ef');
  seaGrad.addColorStop(1, '#fff8e7');
  ctx.fillStyle = seaGrad;
  ctx.fillRect(0, waterY, w, h - waterY);

  // Animated wave crests
  ctx.fillStyle = '#ffffff';
  for (let row = 0; row < 3; row++) {
    const wy = waterY + 30 + row * 40;
    const waveOffset = Math.sin(time * 0.003 + row * 1.5) * 12;
    for (let x = 0; x < w; x += 30) {
      ctx.fillRect(x + waveOffset, wy, 16, 4);
    }
  }

  // White sand beach at bottom
  ctx.fillStyle = '#fff8e7';
  ctx.fillRect(0, h - 45, w, 45);
  ctx.fillStyle = '#e9d8a6';
  ctx.fillRect(0, h - 48, w, 3);

  // Pixel Sea Turtle swimming
  const turtleX = (time * 0.035) % (w + 100) - 50;
  const turtleY = waterY + 60 + Math.sin(time * 0.002) * 15;
  ctx.fillStyle = '#0a9396';
  ctx.fillRect(turtleX, turtleY, 20, 14); // Shell
  ctx.fillStyle = '#94d2bd';
  ctx.fillRect(turtleX + 18, turtleY + 3, 7, 8); // Head
  ctx.fillRect(turtleX + 4, turtleY - 5, 8, 5); // Flippers
  ctx.fillRect(turtleX + 4, turtleY + 14, 8, 5);
}

// ======================================================================
// 16. SUNSET COAST & LIGHTHOUSE (Vách đá, Ngọn hải đăng quét sáng, Sóng đập)
// ======================================================================
function renderSunsetCoast(ctx: CanvasRenderingContext2D, w: number, h: number, time: number) {
  const seaY = h * 0.65;

  // Dark ocean
  ctx.fillStyle = '#1f030a';
  ctx.fillRect(0, seaY, w, h - seaY);

  // Rocky cliffs on left
  ctx.fillStyle = '#370617';
  ctx.beginPath();
  ctx.moveTo(0, h);
  ctx.lineTo(0, seaY - 90);
  ctx.lineTo(160, seaY - 60);
  ctx.lineTo(210, seaY + 40);
  ctx.lineTo(190, h);
  ctx.fill();

  // Lighthouse on the cliff
  const lhX = 90;
  const lhY = seaY - 90;
  ctx.fillStyle = '#f8fafc';
  ctx.fillRect(lhX, lhY - 95, 26, 95); // White tower
  ctx.fillStyle = '#d00000';
  ctx.fillRect(lhX, lhY - 70, 26, 20); // Red stripe
  ctx.fillStyle = '#d00000';
  ctx.fillRect(lhX, lhY - 25, 26, 20);

  // Lantern room & cupola
  ctx.fillStyle = '#ffba08';
  ctx.fillRect(lhX + 3, lhY - 110, 20, 15);
  ctx.fillStyle = '#370617';
  ctx.fillRect(lhX - 2, lhY - 114, 30, 4);

  // Rotating 360-degree light beam
  const beamAngle = time * 0.0015;
  const beamLen = Math.max(w, h);
  ctx.save();
  ctx.translate(lhX + 13, lhY - 102);
  ctx.rotate(beamAngle);
  ctx.fillStyle = 'rgba(255, 234, 0, 0.25)';
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(beamLen, -60);
  ctx.lineTo(beamLen, 60);
  ctx.closePath();
  ctx.fill();
  ctx.restore();

  // Crashing waves at base of cliff
  ctx.fillStyle = '#ffffff';
  for (let i = 0; i < 6; i++) {
    const splashY = seaY + 30 + Math.sin(time * 0.005 + i) * 6;
    ctx.fillRect(180 + i * 15, splashY, 8, 4);
  }
}

// ======================================================================
// 17. TOKYO NEON NIGHT (Tokyo Tower, Shinkansen lướt qua, Shinjuku)
// ======================================================================
function renderTokyoNight(ctx: CanvasRenderingContext2D, w: number, h: number, trainX: number, time: number) {
  // Skyline silhouette
  ctx.fillStyle = '#090b16';
  for (let x = 0; x < w; x += 40) {
    const bH = 120 + ((x * 13) % 140);
    ctx.fillRect(x, h - bH, 36, bH);
  }

  // Iconic Red & White Tokyo Tower in center/right
  const ttX = w * 0.65;
  const ttY = h - 60;
  ctx.fillStyle = '#ff3366';
  ctx.beginPath();
  ctx.moveTo(ttX, ttY - 260); // Spire
  ctx.lineTo(ttX - 35, ttY);
  ctx.lineTo(ttX + 35, ttY);
  ctx.closePath();
  ctx.fill();
  // White lattice bands
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(ttX - 16, ttY - 170, 32, 10);
  ctx.fillRect(ttX - 26, ttY - 95, 52, 12);
  // Red beacon light on spire tip
  ctx.fillStyle = '#ff3366';
  ctx.shadowColor = '#ff3366';
  ctx.shadowBlur = 15;
  ctx.fillRect(ttX - 3, ttY - 265, 6, 6);
  ctx.shadowBlur = 0;

  // Elevated train bridge
  ctx.fillStyle = '#1e2238';
  ctx.fillRect(0, h - 85, w, 14);
  for (let px = 30; px < w; px += 90) {
    ctx.fillRect(px, h - 71, 12, 71); // Bridge pillars
  }

  // Shinkansen Train speeding across bridge
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(trainX, h - 105, 170, 18);
  ctx.fillStyle = '#00f5d4'; // Glowing blue windows
  for (let wx = trainX + 15; wx < trainX + 155; wx += 20) {
    ctx.fillRect(wx, h - 101, 12, 7);
  }
}

// ======================================================================
// 18. SHANGHAI BUND & PEARL (Tháp Minh Châu Phương Đông & Sông Hoàng Phố)
// ======================================================================
function renderShanghaiBund(ctx: CanvasRenderingContext2D, w: number, h: number, time: number) {
  const riverY = h * 0.75;

  // Oriental Pearl Tower
  const pX = w * 0.72;
  const pY = riverY;

  ctx.fillStyle = '#1e0836';
  ctx.fillRect(pX - 4, pY - 280, 8, 280); // Central spire shaft
  ctx.fillRect(pX - 25, pY - 140, 6, 140); // Diagonal tripod legs
  ctx.fillRect(pX + 19, pY - 140, 6, 140);

  // Lower giant glowing sphere
  const sphereColor = Math.sin(time * 0.003) > 0 ? '#ff007f' : '#7928ca';
  ctx.fillStyle = sphereColor;
  ctx.shadowColor = sphereColor;
  ctx.shadowBlur = 20;
  ctx.beginPath();
  ctx.arc(pX, pY - 130, 28, 0, Math.PI * 2);
  ctx.fill();

  // Upper sphere
  ctx.beginPath();
  ctx.arc(pX, pY - 210, 18, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;

  // Spire needle top
  ctx.fillStyle = '#ffd700';
  ctx.fillRect(pX - 1.5, pY - 320, 3, 40);

  // Bund European-style heritage waterfront buildings on left
  ctx.fillStyle = '#260c3b';
  ctx.fillRect(30, riverY - 90, 80, 90);
  ctx.fillRect(120, riverY - 120, 70, 120);
  ctx.fillRect(200, riverY - 75, 90, 75);

  // Huangpu River water & reflections
  ctx.fillStyle = '#0c0218';
  ctx.fillRect(0, riverY, w, h - riverY);

  // Shimmering reflection of Pearl Tower
  ctx.fillStyle = 'rgba(255, 0, 127, 0.4)';
  for (let ry = riverY; ry < h; ry += 8) {
    const wave = Math.sin(ry * 0.1 + time * 0.005) * 14;
    ctx.fillRect(pX - 15 + wave, ry, 30, 3);
  }
}

// ======================================================================
// 19. SEOUL NAMSAN NIGHT (Tháp Namsan, Mái ngói Hanok, Ánh đèn)
// ======================================================================
function renderSeoulCity(ctx: CanvasRenderingContext2D, w: number, h: number, time: number) {
  // Namsan Mountain knoll in background
  ctx.fillStyle = '#0f0a1c';
  ctx.beginPath();
  ctx.arc(w * 0.5, h - 40, w * 0.45, 0, Math.PI * 2);
  ctx.fill();

  // N Seoul Tower on summit
  const nX = w * 0.5;
  const nY = h - 230;

  ctx.fillStyle = '#4c1d95';
  ctx.fillRect(nX - 4, nY - 80, 8, 80);
  // Color-shifting beacon observatory
  const towerLight = Math.sin(time * 0.002) > 0 ? '#06d6a0' : '#38bdf8';
  ctx.fillStyle = towerLight;
  ctx.shadowColor = towerLight;
  ctx.shadowBlur = 18;
  ctx.fillRect(nX - 12, nY - 70, 24, 16);
  ctx.shadowBlur = 0;

  // Traditional Hanok tiled roofs in the foreground
  ctx.fillStyle = '#26122b';
  ctx.fillRect(0, h - 85, w, 85);

  // Hanok curved tiled eaves
  ctx.fillStyle = '#7c2d12';
  for (let hx = 20; hx < w; hx += 160) {
    ctx.beginPath();
    ctx.moveTo(hx, h - 85);
    ctx.quadraticCurveTo(hx + 70, h - 110, hx + 140, h - 85);
    ctx.lineTo(hx + 130, h - 75);
    ctx.lineTo(hx + 10, h - 75);
    ctx.closePath();
    ctx.fill();
  }

  // Pulsing city street light traces
  ctx.fillStyle = '#ffb703';
  for (let x = 0; x < w; x += 45) {
    ctx.fillRect(x, h - 25, 14, 3);
  }
}

// ======================================================================
// 20. CỔNG PARABOL ĐẠI HỌC BÁCH KHOA HÀ NỘI (HUST Parabol Gate)
// ======================================================================
function renderHustParabol(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  leaves: any[],
  isWind: boolean,
  dir: number,
  time: number
) {
  // Roadway & pavement (Đường Giải Phóng / Đại Cồ Việt)
  ctx.fillStyle = '#1c1917';
  ctx.fillRect(0, h - 55, w, 55);
  // Yellow curb marking
  ctx.fillStyle = '#facc15';
  for (let px = 0; px < w; px += 50) {
    ctx.fillRect(px, h - 55, 25, 4);
  }

  // Ancient Mahogany Trees (Cây xà cừ cổ thụ Bách Khoa) flanking both sides
  drawPixelTree(ctx, 30, h - 55, 160, '#1b4332', '#2d6a4f', '#52b788', '#2d1810');
  drawPixelTree(ctx, w - 120, h - 55, 160, '#1b4332', '#2d6a4f', '#52b788', '#2d1810');

  // LEGENDARY HUST PARABOL ARCH (Cổng Parabol ĐHBK Hà Nội)
  const gateCenterX = w / 2;
  const gateBaseY = h - 55;
  const archWidth = Math.min(w * 0.42, 380);
  const archHeight = 185;

  ctx.save();
  // White concrete Parabolic Arch
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 14;
  ctx.shadowColor = '#ffffff';
  ctx.shadowBlur = 10;
  ctx.beginPath();
  // Parabola formula curve: y = 4 * H / W^2 * (x - W/2)^2
  ctx.moveTo(gateCenterX - archWidth / 2, gateBaseY);
  ctx.quadraticCurveTo(gateCenterX, gateBaseY - archHeight * 2, gateCenterX + archWidth / 2, gateBaseY);
  ctx.stroke();
  ctx.shadowBlur = 0;

  // Support pillars at arch base
  ctx.fillStyle = '#f8fafc';
  ctx.fillRect(gateCenterX - archWidth / 2 - 12, gateBaseY - 30, 24, 30);
  ctx.fillRect(gateCenterX + archWidth / 2 - 12, gateBaseY - 30, 24, 30);

  // Red HUST Crest / Emblem Box in the center of arch top
  ctx.fillStyle = '#c62828';
  ctx.fillRect(gateCenterX - 32, gateBaseY - archHeight - 5, 64, 24);
  ctx.fillStyle = '#facc15';
  ctx.font = 'bold 12px monospace';
  ctx.textAlign = 'center';
  ctx.fillText('HUST', gateCenterX, gateBaseY - archHeight + 12);
  ctx.restore();

  // Swirling Golden Mahogany Leaves (Lá xà cừ rơi)
  const leafColors = ['#facc15', '#eab308', '#ca8a04', '#d97706'];
  leaves.forEach((p) => {
    const extraSpeedX = isWind ? dir * 6.5 : dir * 1.0;
    p.x += p.vx + extraSpeedX;
    p.y += p.vy;
    p.rot += p.rotSpeed * 2;

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

// ======================================================================
// 21. HA LONG BAY (Đảo đá vôi, Thuyền buồm cánh dơi, Sương mờ)
// ======================================================================
function renderHaLongBay(ctx: CanvasRenderingContext2D, w: number, h: number, boatX: number, time: number) {
  const waterY = h * 0.65;

  // Limestone Karst Peaks (Đảo đá vôi nhấp nhô)
  ctx.fillStyle = '#064e3b';
  ctx.beginPath();
  ctx.moveTo(w * 0.15, waterY);
  ctx.lineTo(w * 0.22, waterY - 140);
  ctx.lineTo(w * 0.32, waterY);
  ctx.fill();

  ctx.fillStyle = '#047857';
  ctx.beginPath();
  ctx.moveTo(w * 0.55, waterY);
  ctx.lineTo(w * 0.68, waterY - 180);
  ctx.lineTo(w * 0.82, waterY);
  ctx.fill();

  ctx.fillStyle = '#022c22';
  ctx.beginPath();
  ctx.moveTo(w * 0.78, waterY);
  ctx.lineTo(w * 0.88, waterY - 120);
  ctx.lineTo(w, waterY);
  ctx.fill();

  // Emerald green bay water
  ctx.fillStyle = '#004d40';
  ctx.fillRect(0, waterY, w, h - waterY);

  // Traditional Brown-Sailed Junk Boat
  const boatY = waterY + 20 + Math.sin(time * 0.003) * 4;
  ctx.fillStyle = '#542d17';
  ctx.fillRect(boatX, boatY, 50, 14); // Hull
  ctx.fillRect(boatX + 22, boatY - 45, 4, 45); // Mast
  // Bat-wing brown sail
  ctx.fillStyle = '#b45309';
  ctx.beginPath();
  ctx.moveTo(boatX + 24, boatY - 42);
  ctx.lineTo(boatX - 10, boatY - 15);
  ctx.lineTo(boatX + 24, boatY - 10);
  ctx.closePath();
  ctx.fill();

  // Gentle morning mist
  ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
  ctx.fillRect(0, waterY - 20, w, 30);
}

// ======================================================================
// 22. HOI AN LANTERN TOWN (Nhà cổ tường vàng, Đèn lồng ngũ sắc lung linh)
// ======================================================================
function renderHoiAnLantern(ctx: CanvasRenderingContext2D, w: number, h: number, time: number) {
  // Heritage yellow merchant facades
  ctx.fillStyle = '#b45309';
  ctx.fillRect(0, h - 160, w, 160);
  ctx.fillStyle = '#f59e0b';
  ctx.fillRect(0, h - 145, w, 145);

  // Terracotta tile roof eaves
  ctx.fillStyle = '#331900';
  ctx.fillRect(0, h - 165, w, 20);

  // Windows and doorways
  ctx.fillStyle = '#451a03';
  for (let x = 40; x < w; x += 110) {
    ctx.fillRect(x, h - 110, 35, 55); // Door
    ctx.fillRect(x + 50, h - 125, 30, 30); // Window
  }

  // Hanging Strings of Multicolored Silk Lanterns (Đèn lồng ngũ sắc)
  const lanternColors = ['#ef4444', '#facc15', '#3b82f6', '#10b981', '#ec4899'];
  ctx.strokeStyle = '#261400';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, h - 155);
  ctx.quadraticCurveTo(w * 0.5, h - 130, w, h - 155);
  ctx.stroke();

  for (let i = 0; i < 9; i++) {
    const lx = (i * w) / 8;
    const ly = h - 145 + Math.sin(i * 0.8) * 8;
    const sway = Math.sin(time * 0.003 + i) * 3;
    const col = lanternColors[i % lanternColors.length];

    ctx.save();
    ctx.fillStyle = col;
    ctx.shadowColor = col;
    ctx.shadowBlur = 12;
    ctx.fillRect(lx + sway - 6, ly, 12, 16); // Lantern body
    ctx.fillStyle = '#facc15';
    ctx.fillRect(lx + sway - 2, ly + 16, 4, 8); // Tassel
    ctx.restore();
  }
}

// ======================================================================
// 23. ATLANTIS DEEP SEA (Tàn tích cột đá, San hô phát sáng, Đàn cá)
// ======================================================================
function renderAtlantisDeep(ctx: CanvasRenderingContext2D, w: number, h: number, fishes: any[], time: number) {
  // Ancient marble pillars rising from seafloor
  ctx.fillStyle = '#0f2942';
  for (let px = 60; px < w; px += 180) {
    ctx.fillRect(px, h - 220, 30, 220); // Column
    ctx.fillRect(px - 6, h - 230, 42, 10); // Capital
    ctx.fillRect(px - 4, h - 20, 38, 20); // Base
  }

  // Sun rays refracting through deep water (Caustics)
  ctx.fillStyle = 'rgba(0, 229, 255, 0.08)';
  for (let rx = 0; rx < w; rx += 140) {
    ctx.beginPath();
    ctx.moveTo(rx, 0);
    ctx.lineTo(rx + 80, h);
    ctx.lineTo(rx + 130, h);
    ctx.lineTo(rx + 50, 0);
    ctx.fill();
  }

  // Bioluminescent coral on sea floor
  ctx.fillStyle = '#00e5ff';
  ctx.shadowColor = '#00e5ff';
  ctx.shadowBlur = 12;
  for (let cx = 20; cx < w; cx += 70) {
    ctx.fillRect(cx, h - 25, 14, 18);
  }
  ctx.shadowBlur = 0;

  // Schools of swimming pixel fish
  fishes.forEach((f) => {
    f.x += f.speed;
    if (f.x > w + 20) f.x = -20;
    ctx.fillStyle = f.color;
    ctx.fillRect(f.x, f.y, f.size, 4);
    ctx.fillRect(f.x - 3, f.y - 1, 3, 6); // Tail fin
  });
}

// ======================================================================
// 24. AURORA BOREALIS (Cực quang uốn lượn, Rừng thông tuyết, Sao băng)
// ======================================================================
function renderAuroraBorealis(ctx: CanvasRenderingContext2D, w: number, h: number, meteor: any, time: number) {
  // Starry sky
  ctx.fillStyle = '#ffffff';
  for (let i = 0; i < 45; i++) {
    const sx = (i * 103) % w;
    const sy = (i * 47) % (h * 0.55);
    ctx.fillRect(sx, sy, 2, 2);
  }

  // Ethereal Waving Aurora Curtains
  for (let layer = 0; layer < 3; layer++) {
    const alpha = 0.15 + layer * 0.08;
    ctx.fillStyle = layer === 1 ? `rgba(96, 239, 255, ${alpha})` : `rgba(0, 255, 135, ${alpha})`;
    ctx.beginPath();
    ctx.moveTo(0, h * 0.2);
    for (let x = 0; x <= w; x += 40) {
      const ay = h * 0.22 + Math.sin(x * 0.005 + time * 0.001 + layer) * 55 + Math.cos(time * 0.002 + layer) * 20;
      ctx.lineTo(x, ay);
    }
    ctx.lineTo(w, h * 0.45);
    ctx.lineTo(0, h * 0.45);
    ctx.closePath();
    ctx.fill();
  }

  // Shooting star
  if (meteor) {
    ctx.save();
    ctx.strokeStyle = '#60efff';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(meteor.x, meteor.y);
    ctx.lineTo(meteor.x - meteor.vx * 3, meteor.y - meteor.vy * 3);
    ctx.stroke();
    ctx.restore();
  }

  // Snowy evergreen pine silhouettes on horizon
  ctx.fillStyle = '#05131f';
  for (let px = 0; px < w; px += 28) {
    const pH = 70 + ((px * 9) % 45);
    ctx.fillRect(px, h - pH, 18, pH);
  }

  // Frozen lake reflection
  ctx.fillStyle = '#0a252f';
  ctx.fillRect(0, h - 35, w, 35);
  ctx.fillStyle = 'rgba(0, 255, 135, 0.2)';
  ctx.fillRect(0, h - 35, w, 6);
}
