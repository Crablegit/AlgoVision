import React, { useEffect, useRef } from 'react';
import { ThemeId, THEMES_LIST } from '../types/themes';

interface DynamicThemeCanvasProps {
  themeId: ThemeId;
}

export const DynamicThemeCanvas: React.FC<DynamicThemeCanvasProps> = ({
  themeId
}) => {
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

    // Midnight Campfire Embers
    const campEmbers = Array.from({ length: 22 }, () => ({
      x: width * 0.62 + (Math.random() - 0.5) * 25,
      y: height - 70 - Math.random() * 20,
      vx: (Math.random() - 0.5) * 1.2,
      vy: -(Math.random() * 2.0 + 1.2),
      life: 0,
      maxLife: Math.random() * 45 + 35,
      size: Math.random() < 0.6 ? 2 : 3
    }));

    // Zen Bamboo Pond Ripples
    const pondRipples: Array<{ x: number; y: number; radius: number; maxRadius: number; alpha: number }> = [];

    // Atlantis Fish Schools
    const fishes = Array.from({ length: 12 }, (_, i) => ({
      x: Math.random() * width,
      y: height * 0.45 + Math.random() * (height * 0.4),
      speed: Math.random() * 1.2 + 0.8,
      size: Math.random() < 0.5 ? 6 : 8,
      color: i % 2 === 0 ? '#ffb703' : '#00f5d4'
    }));

    // ================== RENDER ANIMATION LOOP (60 FPS NATIVE) ==================
    const render = (time: number) => {
      ctx.imageSmoothingEnabled = false;

      // 1. Base Procedural Sky Gradient
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
        // ===== ICONIC JAPANESE MASTERPIECE THEMES =====
        case 'yourname-stairs':
          renderYourNameStairs(ctx, width, height, foliageParticles, isWindGust, windDirection, time);
          break;
        case 'fushimi-torii':
          renderFushimiTorii(ctx, width, height, time);
          break;
        case 'chureito-fuji':
          renderChureitoFuji(ctx, width, height, foliageParticles, isWindGust, windDirection, time);
          break;
        case 'miyajima-torii':
          renderMiyajimaTorii(ctx, width, height, time);
          break;
        case 'gion-night':
          renderGionNight(ctx, width, height, raindrops, splashes, time);
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
        // ===== 6 GENTLE & RELAXING PIXEL THEMES =====
        case 'lofi-bedroom':
          renderLofiBedroom(ctx, width, height, time);
          break;
        case 'sunset-train':
          renderSunsetTrain(ctx, width, height, time);
          break;
        case 'zen-bamboo':
          renderZenBamboo(ctx, width, height, pondRipples, time);
          break;
        case 'midnight-camp':
          renderMidnightCamp(ctx, width, height, campEmbers, time);
          break;
        case 'pastel-sunset':
          renderPastelSunset(ctx, width, height, time);
          break;
        case 'rainy-busstop':
          renderRainyBusstop(ctx, width, height, raindrops, splashes, time);
          break;
        // ===== 6 CREATIVE NEW THEMES =====
        case 'cyber-ramen':
          renderCyberRamen(ctx, width, height, raindrops, time);
          break;
        case 'floating-islands':
          renderFloatingIslands(ctx, width, height, foliageParticles, isWindGust, windDirection, time);
          break;
        case 'retro-arcade':
          renderRetroArcade(ctx, width, height, time);
          break;
        case 'shrine-waterfall':
          renderShrineWaterfall(ctx, width, height, foliageParticles, time);
          break;
        case 'space-station':
          renderSpaceStation(ctx, width, height, stardust, time);
          break;
        case 'deep-aquarium':
          renderDeepAquarium(ctx, width, height, fishes, time);
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
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      <canvas
        ref={canvasRef}
        className="absolute inset-0 pointer-events-none z-0 opacity-100"
        style={{ display: 'block', width: '100%', height: '100%' }}
      />
    </div>
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
    // ===== ICONIC JAPANESE MASTERPIECE THEMES =====
    case 'yourname-stairs':
      grad.addColorStop(0, '#1e0b24');
      grad.addColorStop(0.3, '#5c133a');
      grad.addColorStop(0.6, '#c2410c');
      grad.addColorStop(0.85, '#f97316');
      grad.addColorStop(1, '#fde047');
      break;
    case 'fushimi-torii':
      grad.addColorStop(0, '#022c22');
      grad.addColorStop(0.35, '#064e3b');
      grad.addColorStop(0.7, '#047857');
      grad.addColorStop(1, '#c2410c');
      break;
    case 'chureito-fuji':
      grad.addColorStop(0, '#0f172a');
      grad.addColorStop(0.3, '#1e1b4b');
      grad.addColorStop(0.6, '#4338ca');
      grad.addColorStop(0.85, '#db2777');
      grad.addColorStop(1, '#f43f5e');
      break;
    case 'miyajima-torii':
      grad.addColorStop(0, '#082f49');
      grad.addColorStop(0.35, '#0369a1');
      grad.addColorStop(0.7, '#0284c7');
      grad.addColorStop(1, '#f59e0b');
      break;
    case 'gion-night':
      grad.addColorStop(0, '#09050d');
      grad.addColorStop(0.35, '#180d1e');
      grad.addColorStop(0.7, '#2d131f');
      grad.addColorStop(1, '#451a03');
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
    case 'lofi-bedroom':
      grad.addColorStop(0, '#120b18');
      grad.addColorStop(0.45, '#231530');
      grad.addColorStop(0.8, '#3c2045');
      grad.addColorStop(1, '#53294c');
      break;
    case 'sunset-train':
      grad.addColorStop(0, '#1d1326');
      grad.addColorStop(0.35, '#4a2034');
      grad.addColorStop(0.7, '#934241');
      grad.addColorStop(1, '#df7a4d');
      break;
    case 'zen-bamboo':
      grad.addColorStop(0, '#03120d');
      grad.addColorStop(0.45, '#0b261c');
      grad.addColorStop(0.8, '#174130');
      grad.addColorStop(1, '#276249');
      break;
    case 'midnight-camp':
      grad.addColorStop(0, '#030712');
      grad.addColorStop(0.4, '#091326');
      grad.addColorStop(0.75, '#132347');
      grad.addColorStop(1, '#1e345f');
      break;
    case 'pastel-sunset':
      grad.addColorStop(0, '#1a1027');
      grad.addColorStop(0.35, '#3b224e');
      grad.addColorStop(0.65, '#723e74');
      grad.addColorStop(0.88, '#ab5e85');
      grad.addColorStop(1, '#f7cad0');
      break;
    case 'rainy-busstop':
      grad.addColorStop(0, '#090d18');
      grad.addColorStop(0.45, '#141d2f');
      grad.addColorStop(0.8, '#1e2b42');
      grad.addColorStop(1, '#2d3e5c');
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
    // ===== 6 CREATIVE NEW THEMES =====
    case 'cyber-ramen':
      grad.addColorStop(0, '#090112');
      grad.addColorStop(0.4, '#19062b');
      grad.addColorStop(0.75, '#2e0842');
      grad.addColorStop(1, '#450a36');
      break;
    case 'floating-islands':
      grad.addColorStop(0, '#0369a1');
      grad.addColorStop(0.4, '#0284c7');
      grad.addColorStop(0.7, '#38bdf8');
      grad.addColorStop(1, '#bae6fd');
      break;
    case 'retro-arcade':
      grad.addColorStop(0, '#090112');
      grad.addColorStop(0.5, '#1e0735');
      grad.addColorStop(1, '#380a59');
      break;
    case 'shrine-waterfall':
      grad.addColorStop(0, '#021a24');
      grad.addColorStop(0.45, '#063945');
      grad.addColorStop(0.8, '#08616d');
      grad.addColorStop(1, '#0e7490');
      break;
    case 'space-station':
      grad.addColorStop(0, '#02040d');
      grad.addColorStop(0.4, '#090e24');
      grad.addColorStop(0.75, '#1b1640');
      grad.addColorStop(1, '#31144f');
      break;
    case 'deep-aquarium':
      grad.addColorStop(0, '#010b1a');
      grad.addColorStop(0.45, '#03203c');
      grad.addColorStop(0.8, '#053b66');
      grad.addColorStop(1, '#0c568f');
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
// 1. CẦU THANG YOUR NAME (Suga Shrine Yotsuya, Tokyo Sunset)
// ======================================================================
function renderYourNameStairs(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  leaves: any[],
  isWind: boolean,
  dir: number,
  time: number
) {
  // Distant Tokyo Sunset Skyline
  ctx.fillStyle = '#2a1128';
  for (let bx = 0; bx < w; bx += 55) {
    const bh = 90 + ((bx * 37) % 70);
    ctx.fillRect(bx, h * 0.45 - bh, 48, bh + h * 0.2);
    if ((bx / 55) % 2 === 0) {
      ctx.fillStyle = '#fbbf24';
      ctx.fillRect(bx + 12, h * 0.45 - bh + 20, 6, 8);
      ctx.fillRect(bx + 26, h * 0.45 - bh + 20, 6, 8);
      ctx.fillStyle = '#2a1128';
    }
  }

  // Blinking red aviation beacon on tallest radio tower
  const towerX = w * 0.28;
  const towerTopY = h * 0.25;
  ctx.strokeStyle = '#1e0b24';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(towerX, h * 0.45);
  ctx.lineTo(towerX, towerTopY);
  ctx.stroke();
  const blink = Math.sin(time * 0.005) > 0;
  if (blink) {
    ctx.fillStyle = '#ef4444';
    ctx.shadowColor = '#ef4444';
    ctx.shadowBlur = 10;
    ctx.fillRect(towerX - 3, towerTopY - 3, 6, 6);
    ctx.shadowBlur = 0;
  }

  // Overhead Tokyo Anime Power Cables & Utility Pole
  const poleX = w * 0.88;
  ctx.fillStyle = '#180d1e';
  ctx.fillRect(poleX, h * 0.12, 16, h * 0.88);
  ctx.fillRect(poleX - 35, h * 0.18, 85, 8);
  ctx.fillRect(poleX - 25, h * 0.24, 65, 6);
  ctx.fillStyle = '#2b1b33';
  ctx.fillRect(poleX - 10, h * 0.26, 36, 48);

  ctx.strokeStyle = '#120716';
  ctx.lineWidth = 1.8;
  for (let c = 0; c < 4; c++) {
    const startY = h * 0.16 + c * 22;
    const endY = h * 0.22 + c * 24;
    ctx.beginPath();
    ctx.moveTo(0, startY);
    ctx.quadraticCurveTo(w * 0.45, startY + 38 + c * 8, poleX, endY);
    ctx.stroke();
  }

  // The Grand Iconic Staircase of Suga Shrine
  const stairTopY = h * 0.38;
  const stairBottomY = h;
  const stairTopW = w * 0.32;
  const stairBottomW = w * 0.75;
  const stairCenterX = w * 0.48;

  // Stone retaining walls flanking both sides
  ctx.fillStyle = '#1a1020';
  ctx.beginPath();
  ctx.moveTo(0, stairTopY);
  ctx.lineTo(stairCenterX - stairTopW / 2, stairTopY);
  ctx.lineTo(stairCenterX - stairBottomW / 2, stairBottomY);
  ctx.lineTo(0, stairBottomY);
  ctx.closePath();
  ctx.fill();

  ctx.beginPath();
  ctx.moveTo(w, stairTopY);
  ctx.lineTo(stairCenterX + stairTopW / 2, stairTopY);
  ctx.lineTo(stairCenterX + stairBottomW / 2, stairBottomY);
  ctx.lineTo(w, stairBottomY);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = '#2d1b35';
  for (let wy = stairTopY + 20; wy < stairBottomY; wy += 35) {
    ctx.fillRect(10, wy, 60, 4);
    ctx.fillRect(w - 70, wy, 60, 4);
  }

  // Stone Steps
  const numSteps = 16;
  for (let s = 0; s < numSteps; s++) {
    const t0 = s / numSteps;
    const t1 = (s + 1) / numSteps;
    const y0 = stairTopY + t0 * (stairBottomY - stairTopY);
    const y1 = stairTopY + t1 * (stairBottomY - stairTopY);
    const w0 = stairTopW + t0 * (stairBottomW - stairTopW);
    const w1 = stairTopW + t1 * (stairBottomW - stairTopW);

    ctx.fillStyle = s % 2 === 0 ? '#475569' : '#3e4a5d';
    ctx.beginPath();
    ctx.moveTo(stairCenterX - w0 / 2, y0);
    ctx.lineTo(stairCenterX + w0 / 2, y0);
    ctx.lineTo(stairCenterX + w1 / 2, y1 - 4);
    ctx.lineTo(stairCenterX - w1 / 2, y1 - 4);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = '#1e293b';
    ctx.fillRect(stairCenterX - w1 / 2, y1 - 4, w1, 4);
  }

  // Iconic Red Handrails
  const railPositions = [-0.48, 0, 0.48];
  railPositions.forEach((posFrac) => {
    ctx.strokeStyle = '#dc2626';
    ctx.lineWidth = 7;
    ctx.shadowColor = '#f87171';
    ctx.shadowBlur = 6;
    ctx.beginPath();
    const topX = stairCenterX + (stairTopW / 2) * posFrac;
    const botX = stairCenterX + (stairBottomW / 2) * posFrac;
    ctx.moveTo(topX, stairTopY - 26);
    ctx.lineTo(botX, stairBottomY - 45);
    ctx.stroke();
    ctx.shadowBlur = 0;

    ctx.strokeStyle = '#f87171';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(topX, stairTopY - 28);
    ctx.lineTo(botX, stairBottomY - 47);
    ctx.stroke();

    ctx.fillStyle = '#991b1b';
    for (let p = 1; p < numSteps; p += 2) {
      const tp = p / numSteps;
      const py = stairTopY + tp * (stairBottomY - stairTopY);
      const pw = stairTopW + tp * (stairBottomW - stairTopW);
      const px = stairCenterX + (pw / 2) * posFrac;
      ctx.fillRect(px - 3, py - 30, 6, 30);
    }
  });

  // Warm Japanese Streetlamp
  const lampX = stairCenterX - stairBottomW / 2 - 25;
  const lampY = stairBottomY - 180;
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(lampX, lampY, 8, 180);
  ctx.fillRect(lampX - 12, lampY - 14, 32, 14);
  ctx.fillStyle = '#fef08a';
  ctx.shadowColor = '#facc15';
  ctx.shadowBlur = 25;
  ctx.fillRect(lampX - 8, lampY - 10, 24, 16);
  ctx.shadowBlur = 0;

  // Swirling Sakura & Twilight Leaves
  const leafColors = ['#f43f5e', '#fb7185', '#fda4af', '#facc15'];
  leaves.forEach((p) => {
    const extraSpeedX = isWind ? dir * 6.0 : dir * 1.2;
    p.x += p.vx + extraSpeedX;
    p.y += p.vy * 0.9;
    p.rot += p.rotSpeed * 2.2;
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
// 2. ĐỀN NGHÌN CỔNG TORII FUSHIMI INARI TAISHA KYOTO
// ======================================================================
function renderFushimiTorii(ctx: CanvasRenderingContext2D, w: number, h: number, time: number) {
  // Ancient Kyoto Cedar & Pine Forest Background
  ctx.fillStyle = '#021f18';
  for (let tx = 20; tx < w; tx += 80) {
    const tw = 24 + ((tx * 13) % 20);
    ctx.fillRect(tx, 0, tw, h);
    ctx.fillStyle = '#064e3b';
    ctx.fillRect(tx - 30, 20 + ((tx * 7) % 100), tw + 60, 45);
    ctx.fillStyle = '#021f18';
  }

  const pathTopY = h * 0.28;
  const pathBotY = h;
  const pathTopW = 70;
  const pathBotW = Math.min(w * 0.65, 520);
  const pathCenterX = w * 0.5;

  ctx.fillStyle = '#334155';
  ctx.beginPath();
  ctx.moveTo(pathCenterX - pathTopW / 2, pathTopY);
  ctx.lineTo(pathCenterX + pathTopW / 2, pathTopY);
  ctx.lineTo(pathCenterX + pathBotW / 2, pathBotY);
  ctx.lineTo(pathCenterX - pathBotW / 2, pathBotY);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = '#475569';
  for (let y = pathTopY + 15; y < pathBotY; y += 22) {
    const t = (y - pathTopY) / (pathBotY - pathTopY);
    const pw = pathTopW + t * (pathBotW - pathTopW);
    ctx.fillRect(pathCenterX - pw / 2 + 6, y, pw - 12, 3);
  }

  // The Iconic Senbon Torii Tunnel
  const numGates = 8;
  for (let g = 0; g < numGates; g++) {
    const t = g / (numGates - 1);
    const gy = pathTopY + t * (pathBotY - pathTopY - 40);
    const gw = 120 + t * (Math.min(w * 0.75, 580) - 120);
    const gh = 90 + t * 240;
    const pillarW = 8 + t * 24;

    const leftX = pathCenterX - gw / 2;
    const rightX = pathCenterX + gw / 2 - pillarW;
    const topY = gy - gh;

    ctx.fillStyle = '#ea580c';
    ctx.fillRect(leftX, topY, pillarW, gh);
    ctx.fillRect(rightX, topY, pillarW, gh);

    ctx.fillStyle = '#9a3412';
    ctx.fillRect(leftX + pillarW - 4, topY, 4, gh);
    ctx.fillRect(rightX, topY, 4, gh);

    ctx.fillStyle = '#09090b';
    ctx.fillRect(leftX - 2, gy - gh * 0.14, pillarW + 4, gh * 0.14);
    ctx.fillRect(rightX - 2, gy - gh * 0.14, pillarW + 4, gh * 0.14);

    ctx.fillStyle = '#ea580c';
    const beamOverhang = pillarW * 1.6;
    ctx.fillRect(leftX - beamOverhang, topY, gw + beamOverhang * 2, pillarW * 1.1);

    ctx.fillStyle = '#09090b';
    ctx.fillRect(leftX - beamOverhang - 4, topY - 5, gw + beamOverhang * 2 + 8, 6);
    ctx.fillStyle = '#facc15';
    ctx.fillRect(leftX - beamOverhang - 4, topY - 5, 8, 6);
    ctx.fillRect(leftX - beamOverhang + gw + beamOverhang * 2, topY - 5, 8, 6);

    ctx.fillStyle = '#c2410c';
    ctx.fillRect(leftX - 6, topY + gh * 0.22, gw + 12, pillarW * 0.85);

    ctx.fillStyle = '#09090b';
    ctx.fillRect(pathCenterX - 8, topY + 4, 16, gh * 0.22 - 4);
    ctx.fillStyle = '#facc15';
    ctx.fillRect(pathCenterX - 5, topY + 8, 10, gh * 0.18 - 8);

    if (g >= 5) {
      ctx.fillStyle = '#18181b';
      for (let k = 0; k < 4; k++) {
        ctx.fillRect(leftX + 4, topY + gh * 0.35 + k * (gh * 0.12), pillarW - 8, 3);
        ctx.fillRect(rightX + 4, topY + gh * 0.35 + k * (gh * 0.12), pillarW - 8, 3);
      }
    }
  }

  // Sacred Kitsune Statue on Left
  const foxPedX = pathCenterX - pathBotW / 2 - 75;
  const foxPedY = pathBotY - 140;
  if (foxPedX > 10) {
    ctx.fillStyle = '#334155';
    ctx.fillRect(foxPedX, foxPedY + 60, 60, 80);
    ctx.fillStyle = '#475569';
    ctx.fillRect(foxPedX - 4, foxPedY + 54, 68, 8);

    ctx.fillStyle = '#64748b';
    ctx.fillRect(foxPedX + 15, foxPedY + 15, 30, 42);
    ctx.fillRect(foxPedX + 35, foxPedY - 10, 18, 28);
    ctx.fillRect(foxPedX + 45, foxPedY - 22, 6, 12);
    ctx.fillRect(foxPedX + 37, foxPedY - 22, 6, 12);
    ctx.fillRect(foxPedX + 5, foxPedY + 8, 14, 38);

    ctx.fillStyle = '#dc2626';
    ctx.fillRect(foxPedX + 28, foxPedY + 14, 24, 18);
  }

  // Mossy Stone Lantern on Right
  const lanternX = pathCenterX + pathBotW / 2 + 25;
  const lanternY = pathBotY - 150;
  if (lanternX < w - 60) {
    ctx.fillStyle = '#334155';
    ctx.fillRect(lanternX + 18, lanternY + 50, 16, 100);
    ctx.fillRect(lanternX + 6, lanternY + 130, 40, 20);
    ctx.fillRect(lanternX + 6, lanternY + 36, 40, 14);

    ctx.fillStyle = '#fef08a';
    ctx.shadowColor = '#facc15';
    ctx.shadowBlur = 18;
    ctx.fillRect(lanternX + 12, lanternY + 10, 28, 26);
    ctx.shadowBlur = 0;
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(lanternX + 24, lanternY + 10, 4, 26);
    ctx.fillRect(lanternX + 12, lanternY + 22, 28, 3);

    ctx.fillStyle = '#1e293b';
    ctx.fillRect(lanternX - 4, lanternY, 60, 12);
    ctx.fillStyle = '#15803d';
    ctx.fillRect(lanternX, lanternY - 4, 52, 4);
  }

  // Floating spiritual motes
  ctx.fillStyle = 'rgba(253, 224, 71, 0.75)';
  for (let i = 0; i < 18; i++) {
    const mx = (w * 0.2 + (i * 97) % (w * 0.6) + Math.sin(time * 0.002 + i) * 20);
    const my = (h * 0.2 + (i * 53) % (h * 0.7) + Math.cos(time * 0.003 + i) * 15);
    ctx.fillRect(mx, my, 3, 3);
  }
}

// ======================================================================
// 3. CHÙA NĂM TẦNG CHUREITO & NÚI PHÚ SĨ (Chureito Pagoda & Mt. Fuji)
// ======================================================================
function renderChureitoFuji(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  leaves: any[],
  isWind: boolean,
  dir: number,
  time: number
) {
  // Majestic Mount Fuji
  const fujiCenterX = w * 0.38;
  const fujiBaseY = h * 0.75;
  const fujiPeakY = h * 0.22;
  const fujiWidth = Math.min(w * 0.72, 650);

  ctx.save();
  ctx.fillStyle = '#1e1b4b';
  ctx.beginPath();
  ctx.moveTo(fujiCenterX - fujiWidth / 2, fujiBaseY);
  ctx.quadraticCurveTo(fujiCenterX - fujiWidth * 0.18, fujiPeakY + 40, fujiCenterX - 35, fujiPeakY);
  ctx.lineTo(fujiCenterX + 35, fujiPeakY);
  ctx.quadraticCurveTo(fujiCenterX + fujiWidth * 0.18, fujiPeakY + 40, fujiCenterX + fujiWidth / 2, fujiBaseY);
  ctx.closePath();
  ctx.fill();

  const snowLineY = fujiPeakY + (fujiBaseY - fujiPeakY) * 0.38;
  ctx.fillStyle = '#f8fafc';
  ctx.beginPath();
  ctx.moveTo(fujiCenterX - 35, fujiPeakY);
  ctx.lineTo(fujiCenterX + 35, fujiPeakY);
  ctx.quadraticCurveTo(fujiCenterX + fujiWidth * 0.14, fujiPeakY + 30, fujiCenterX + fujiWidth * 0.22, snowLineY);
  for (let sx = fujiCenterX + fujiWidth * 0.22; sx >= fujiCenterX - fujiWidth * 0.22; sx -= 25) {
    const jaggedY = snowLineY + Math.sin(sx * 0.08) * 14;
    ctx.lineTo(sx, jaggedY);
  }
  ctx.quadraticCurveTo(fujiCenterX - fujiWidth * 0.14, fujiPeakY + 30, fujiCenterX - 35, fujiPeakY);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = 'rgba(244, 63, 94, 0.25)';
  ctx.beginPath();
  ctx.moveTo(fujiCenterX - 35, fujiPeakY);
  ctx.lineTo(fujiCenterX + 35, fujiPeakY);
  ctx.lineTo(fujiCenterX + 60, fujiPeakY + 40);
  ctx.lineTo(fujiCenterX - 60, fujiPeakY + 40);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = 'rgba(252, 231, 243, 0.22)';
  ctx.fillRect(0, fujiBaseY - 40, w, 60);
  ctx.restore();

  // Foreground Forest Hill slope on the right
  ctx.fillStyle = '#0f172a';
  ctx.beginPath();
  ctx.moveTo(w * 0.45, h);
  ctx.lineTo(w, h * 0.52);
  ctx.lineTo(w, h);
  ctx.closePath();
  ctx.fill();

  // 5-Tier Chureito Pagoda
  const pagodaX = w * 0.78;
  const pagodaBaseY = h * 0.88;
  const pagodaW = Math.min(w * 0.22, 160);
  const totalPagodaH = Math.min(h * 0.62, 380);

  ctx.fillStyle = '#334155';
  ctx.fillRect(pagodaX - pagodaW * 0.55, pagodaBaseY - 18, pagodaW * 1.1, 18);

  for (let tier = 0; tier < 5; tier++) {
    const scale = 1.0 - tier * 0.13;
    const tierH = totalPagodaH * 0.16;
    const tierY = pagodaBaseY - 18 - (tier + 1) * tierH * 1.08;
    const currentW = pagodaW * scale;

    ctx.fillStyle = '#dc2626';
    ctx.fillRect(pagodaX - currentW * 0.35, tierY, currentW * 0.7, tierH);

    ctx.fillStyle = '#facc15';
    ctx.fillRect(pagodaX - 8 * scale, tierY + tierH * 0.25, 16 * scale, tierH * 0.5);

    ctx.fillStyle = '#09090b';
    const eaveW = currentW * 1.35;
    const eaveY = tierY - 8;
    ctx.beginPath();
    ctx.moveTo(pagodaX - eaveW / 2 - 8, eaveY + 6);
    ctx.quadraticCurveTo(pagodaX, eaveY - 4, pagodaX + eaveW / 2 + 8, eaveY + 6);
    ctx.lineTo(pagodaX + eaveW / 2, eaveY + 12);
    ctx.lineTo(pagodaX - eaveW / 2, eaveY + 12);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = '#b91c1c';
    ctx.fillRect(pagodaX - eaveW / 2 + 4, eaveY + 8, eaveW - 8, 4);

    ctx.fillStyle = '#fbbf24';
    ctx.fillRect(pagodaX - eaveW / 2 - 6, eaveY + 8, 3, 6);
    ctx.fillRect(pagodaX + eaveW / 2 + 3, eaveY + 8, 3, 6);
  }

  // Golden Spire on top (Sorin)
  const topTierY = pagodaBaseY - 18 - 5 * (totalPagodaH * 0.16) * 1.08 - 8;
  ctx.fillStyle = '#facc15';
  ctx.fillRect(pagodaX - 3, topTierY - 55, 6, 55);
  for (let r = 0; r < 9; r++) {
    ctx.fillRect(pagodaX - 9, topTierY - 48 + r * 4.5, 18, 2.5);
  }
  ctx.fillStyle = '#fef08a';
  ctx.fillRect(pagodaX - 5, topTierY - 60, 10, 6);

  // Framing Sakura Branches
  ctx.fillStyle = '#271206';
  ctx.fillRect(0, 0, 160, 18);
  ctx.fillRect(0, 18, 120, 14);
  ctx.fillRect(w - 180, 0, 180, 20);

  const sakuraPinks = ['#f472b6', '#fbcfe8', '#db2777', '#fda4af'];
  for (let i = 0; i < 40; i++) {
    ctx.fillStyle = sakuraPinks[i % sakuraPinks.length];
    const bx = (i * 37) % 240;
    const by = 8 + (i * 19) % 65;
    ctx.fillRect(bx, by, 10, 8);
    const rx = w - 240 + ((i * 41) % 240);
    const ry = 8 + ((i * 23) % 70);
    ctx.fillRect(rx, ry, 10, 8);
  }

  // Floating Sakura Petals
  leaves.forEach((p) => {
    const extraSpeedX = isWind ? dir * 6.5 : dir * 1.5;
    p.x += p.vx + extraSpeedX;
    p.y += p.vy;
    p.rot += p.rotSpeed * 2.5;

    if (p.y > h + 10) {
      p.y = -10;
      p.x = Math.random() * w;
    }
    if (p.x > w + 20) p.x = -20;
    if (p.x < -20) p.x = w + 20;

    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(p.rot);
    ctx.fillStyle = sakuraPinks[p.colorIndex % sakuraPinks.length];
    ctx.fillRect(-p.size, -p.size / 2, p.size * 2, p.size);
    ctx.restore();
  });
}

// ======================================================================
// 4. CỔNG TORII NỔI BIỂN ITSUKUSHIMA (Miyajima Floating Torii)
// ======================================================================
function renderMiyajimaTorii(ctx: CanvasRenderingContext2D, w: number, h: number, time: number) {
  // Distant islands
  ctx.fillStyle = '#072e4a';
  ctx.beginPath();
  ctx.moveTo(0, h * 0.58);
  ctx.quadraticCurveTo(w * 0.25, h * 0.5, w * 0.45, h * 0.58);
  ctx.quadraticCurveTo(w * 0.75, h * 0.48, w, h * 0.58);
  ctx.lineTo(w, h * 0.65);
  ctx.lineTo(0, h * 0.65);
  ctx.closePath();
  ctx.fill();

  // Floating Seagulls
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 1.5;
  for (let b = 0; b < 4; b++) {
    const bx = ((w * 0.15 + b * 110 + time * 0.03) % (w + 60)) - 30;
    const by = h * 0.32 + Math.sin(time * 0.003 + b) * 12;
    ctx.beginPath();
    ctx.moveTo(bx - 10, by + 4);
    ctx.quadraticCurveTo(bx - 5, by - 4, bx, by);
    ctx.quadraticCurveTo(bx + 5, by - 4, bx + 10, by + 4);
    ctx.stroke();
  }

  // Giant Floating Vermilion Torii Gate
  const toriiCenterX = w * 0.5;
  const toriiBaseY = h * 0.74;
  const toriiW = Math.min(w * 0.62, 540);
  const toriiH = Math.min(h * 0.42, 280);
  const pillarW = 26;

  const leftX = toriiCenterX - toriiW * 0.35;
  const rightX = toriiCenterX + toriiW * 0.35 - pillarW;
  const topY = toriiBaseY - toriiH;

  // Auxiliary front/back support pillars
  ctx.fillStyle = '#991b1b';
  ctx.fillRect(leftX - 16, toriiBaseY - toriiH * 0.45, 14, toriiH * 0.45);
  ctx.fillRect(leftX + pillarW + 2, toriiBaseY - toriiH * 0.45, 14, toriiH * 0.45);
  ctx.fillRect(rightX - 16, toriiBaseY - toriiH * 0.45, 14, toriiH * 0.45);
  ctx.fillRect(rightX + pillarW + 2, toriiBaseY - toriiH * 0.45, 14, toriiH * 0.45);

  // Main Vermilion Pillars
  ctx.fillStyle = '#dc2626';
  ctx.fillRect(leftX, topY, pillarW, toriiH);
  ctx.fillRect(rightX, topY, pillarW, toriiH);

  ctx.fillStyle = '#b91c1c';
  ctx.fillRect(leftX + pillarW - 6, topY, 6, toriiH);
  ctx.fillRect(rightX + pillarW - 6, topY, 6, toriiH);

  ctx.fillStyle = '#b91c1c';
  ctx.fillRect(leftX - 20, topY + toriiH * 0.26, toriiW * 0.7 + 40, 18);

  ctx.fillStyle = '#dc2626';
  ctx.fillRect(toriiCenterX - toriiW / 2, topY, toriiW, 28);
  ctx.fillStyle = '#09090b';
  ctx.beginPath();
  ctx.moveTo(toriiCenterX - toriiW / 2 - 12, topY);
  ctx.lineTo(toriiCenterX + toriiW / 2 + 12, topY);
  ctx.lineTo(toriiCenterX + toriiW / 2, topY - 14);
  ctx.lineTo(toriiCenterX - toriiW / 2, topY - 14);
  ctx.closePath();
  ctx.fill();

  // Central Gold Framed Shrine Plaque
  ctx.fillStyle = '#facc15';
  ctx.fillRect(toriiCenterX - 18, topY + 12, 36, toriiH * 0.22);
  ctx.fillStyle = '#09090b';
  ctx.fillRect(toriiCenterX - 14, topY + 16, 28, toriiH * 0.22 - 8);

  // Shimmering Red Reflection in water
  ctx.save();
  ctx.fillStyle = 'rgba(220, 38, 38, 0.35)';
  for (let ry = 0; ry < 80; ry += 6) {
    const waveDistort = Math.sin(ry * 0.15 + time * 0.004) * (14 + ry * 0.3);
    ctx.fillRect(leftX + waveDistort, toriiBaseY + ry, pillarW * 1.2, 4);
    ctx.fillRect(rightX + waveDistort, toriiBaseY + ry, pillarW * 1.2, 4);
    ctx.fillRect(toriiCenterX - toriiW * 0.25 + waveDistort, toriiBaseY + ry, toriiW * 0.5, 3);
  }
  ctx.restore();

  // Seto Inland Sea Multilayer Tidal Waves
  const waterLevels = [
    { y: toriiBaseY - 10, col: '#0284c7', amp: 4, speed: 0.003 },
    { y: toriiBaseY + 15, col: '#0369a1', amp: 6, speed: 0.004 },
    { y: toriiBaseY + 45, col: '#075985', amp: 8, speed: 0.005 },
    { y: toriiBaseY + 80, col: '#082f49', amp: 10, speed: 0.006 }
  ];

  waterLevels.forEach((wl, idx) => {
    ctx.fillStyle = wl.col;
    ctx.beginPath();
    ctx.moveTo(0, wl.y);
    for (let x = 0; x <= w + 40; x += 30) {
      const wy = wl.y + Math.sin(x * 0.015 + time * wl.speed + idx) * wl.amp;
      ctx.lineTo(x, wy);
    }
    ctx.lineTo(w, h);
    ctx.lineTo(0, h);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = 'rgba(253, 224, 71, 0.4)';
    for (let gx = 40; gx < w; gx += 95) {
      const crestY = wl.y + Math.sin(gx * 0.015 + time * wl.speed + idx) * wl.amp;
      ctx.fillRect(gx, crestY - 1, 35, 3);
    }
  });

  // Submerged Stone Lantern in the water
  const lantX = w * 0.18;
  const lantY = toriiBaseY + 30;
  ctx.fillStyle = '#1e293b';
  ctx.fillRect(lantX, lantY - 60, 24, 60);
  ctx.fillRect(lantX - 8, lantY - 70, 40, 10);
  ctx.fillStyle = '#fbbf24';
  ctx.fillRect(lantX + 4, lantY - 55, 16, 14);
}

// ======================================================================
// 5. PHỐ CỔ GION KYOTO VỀ ĐÊM (Gion Kyoto Night Alley)
// ======================================================================
function renderGionNight(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  rain: any[],
  splashes: any[],
  time: number
) {
  const groundY = h - 60;
  const houseW = Math.min(w * 0.32, 280);

  // Left House
  ctx.fillStyle = '#1b120c';
  ctx.fillRect(0, h * 0.28, houseW, groundY - h * 0.28);
  ctx.fillStyle = '#fef08a';
  ctx.shadowColor = '#facc15';
  ctx.shadowBlur = 15;
  ctx.fillRect(35, h * 0.38, houseW - 70, 65);
  ctx.shadowBlur = 0;
  ctx.fillStyle = '#1b120c';
  for (let kx = 42; kx < houseW - 40; kx += 12) {
    ctx.fillRect(kx, h * 0.38, 3, 65);
  }
  ctx.fillRect(35, h * 0.38 + 30, houseW - 70, 4);

  ctx.fillStyle = '#09090b';
  ctx.fillRect(0, h * 0.28 - 14, houseW + 25, 16);
  ctx.fillRect(0, h * 0.55 - 10, houseW + 20, 12);

  // Right House
  const rightHouseX = w - houseW;
  ctx.fillStyle = '#1b120c';
  ctx.fillRect(rightHouseX, h * 0.28, houseW, groundY - h * 0.28);
  ctx.fillStyle = '#fde047';
  ctx.shadowColor = '#facc15';
  ctx.shadowBlur = 15;
  ctx.fillRect(rightHouseX + 35, h * 0.38, houseW - 70, 65);
  ctx.shadowBlur = 0;
  ctx.fillStyle = '#1b120c';
  for (let kx = rightHouseX + 42; kx < w - 40; kx += 12) {
    ctx.fillRect(kx, h * 0.38, 3, 65);
  }
  ctx.fillRect(rightHouseX + 35, h * 0.38 + 30, houseW - 70, 4);

  ctx.fillStyle = '#09090b';
  ctx.fillRect(rightHouseX - 25, h * 0.28 - 14, houseW + 25, 16);
  ctx.fillRect(rightHouseX - 20, h * 0.55 - 10, houseW + 20, 12);

  // Glowing Paper Lanterns
  const lanterns = [
    { x: houseW - 15, y: h * 0.58, col: '#ef4444', text: '祇園' },
    { x: houseW + 45, y: h * 0.52, col: '#f97316', text: '茶屋' },
    { x: rightHouseX - 35, y: h * 0.54, col: '#ef4444', text: '京都' }
  ];

  lanterns.forEach((l) => {
    ctx.strokeStyle = '#18181b';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(l.x, l.y - 22);
    ctx.lineTo(l.x, l.y);
    ctx.stroke();

    ctx.save();
    ctx.fillStyle = l.col;
    ctx.shadowColor = l.col;
    ctx.shadowBlur = 22;
    ctx.fillRect(l.x - 14, l.y, 28, 36);
    ctx.shadowBlur = 0;

    ctx.fillStyle = '#09090b';
    ctx.fillRect(l.x - 16, l.y - 4, 32, 5);
    ctx.fillRect(l.x - 16, l.y + 35, 32, 5);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 9px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(l.text, l.x, l.y + 22);
    ctx.restore();
  });

  // Wet Slate Pavement
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(0, groundY, w, 60);

  for (let px = 20; px < w; px += 45) {
    const pw = 38;
    const ph = 24;
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(px, groundY + 8, pw, ph);
    ctx.fillStyle = '#334155';
    ctx.fillRect(px, groundY + 8, pw, 3);
  }

  // Reflections on wet ground
  ctx.save();
  lanterns.forEach((l) => {
    ctx.fillStyle = l.col === '#ef4444' ? 'rgba(239, 68, 68, 0.45)' : 'rgba(249, 115, 22, 0.45)';
    ctx.shadowColor = l.col;
    ctx.shadowBlur = 18;
    for (let r = 0; r < 5; r++) {
      const ry = groundY + 12 + r * 8;
      const rippleW = 40 + Math.sin(time * 0.005 + r) * 15;
      ctx.fillRect(l.x - rippleW / 2, ry, rippleW, 4);
    }
    ctx.shadowBlur = 0;
  });
  ctx.restore();

  // Weeping Willow
  ctx.strokeStyle = '#064e3b';
  ctx.lineWidth = 2;
  for (let wb = 0; wb < 8; wb++) {
    const wx = w * 0.42 + wb * 18;
    const sway = Math.sin(time * 0.003 + wb) * 12;
    ctx.beginPath();
    ctx.moveTo(wx, 0);
    ctx.quadraticCurveTo(wx + sway, h * 0.2, wx + sway * 1.5, h * 0.38 + wb * 10);
    ctx.stroke();

    ctx.fillStyle = '#10b981';
    for (let l = 10; l < h * 0.38; l += 18) {
      ctx.fillRect(wx + (sway * l) / (h * 0.38), l, 4, 6);
    }
  }

  // Soft Rain
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  rain.forEach((r) => {
    r.y += r.speed * 0.8;
    if (r.y > groundY + 30) {
      r.y = -10;
      r.x = Math.random() * w;
      if (splashes.length < 25) {
        splashes.push({ x: r.x, y: groundY + 10 + Math.random() * 30, age: 0, maxAge: 12 });
      }
    }
    ctx.moveTo(r.x, r.y);
    ctx.lineTo(r.x, r.y + r.len * 0.7);
  });
  ctx.stroke();

  splashes.forEach((sp, idx) => {
    sp.age++;
    const rad = sp.age * 1.5;
    ctx.strokeStyle = `rgba(255, 255, 255, ${1 - sp.age / sp.maxAge})`;
    ctx.beginPath();
    ctx.ellipse(sp.x, sp.y, rad * 1.8, rad * 0.6, 0, 0, Math.PI * 2);
    ctx.stroke();
    if (sp.age >= sp.maxAge) splashes.splice(idx, 1);
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
// 20. CỔNG PARABOL ĐẠI HỌC BÁCH KHOA HÀ NỘI (HUST Parabol Gate - Kỳ Vĩ)
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
  const gateCenterX = w / 2;
  const gateBaseY = h - 65;
  // ENLARGED ARCH DIMENSIONS
  const archWidth = Math.min(w * 0.74, 720);
  const archHeight = Math.min(h * 0.52, 360);

  // 1. Historic C1 Building (Tòa nhà C1 Bách Khoa) in background
  const c1W = archWidth * 0.72;
  const c1H = archHeight * 0.74;
  const c1X = gateCenterX - c1W / 2;
  const c1Y = gateBaseY - c1H;

  // C1 Main Brick Structure
  ctx.fillStyle = '#450a0a';
  ctx.fillRect(c1X, c1Y, c1W, c1H);
  ctx.fillStyle = '#7f1d1d';
  ctx.fillRect(c1X + 8, c1Y + 14, c1W - 16, c1H - 14);

  // Central Clock Tower of C1
  const towerW = 60;
  const towerH = 45;
  const towerX = gateCenterX - towerW / 2;
  const towerY = c1Y - towerH;
  ctx.fillStyle = '#7f1d1d';
  ctx.fillRect(towerX, towerY, towerW, towerH);
  ctx.fillStyle = '#991b1b';
  ctx.fillRect(towerX + 4, towerY + 4, towerW - 8, towerH - 4);
  // Illuminated Clock Face
  ctx.fillStyle = '#f8fafc';
  ctx.beginPath();
  ctx.arc(gateCenterX, towerY + towerH / 2, 12, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#09090b';
  ctx.fillRect(gateCenterX - 1, towerY + towerH / 2 - 8, 2, 8); // Hour hand
  ctx.fillRect(gateCenterX - 1, towerY + towerH / 2, 6, 2);     // Minute hand

  // C1 Windows with warm lecture hall lights
  for (let floor = 0; floor < 3; floor++) {
    const wy = c1Y + 24 + floor * (c1H * 0.26);
    for (let wx = c1X + 22; wx < c1X + c1W - 30; wx += 28) {
      if (Math.abs(wx - gateCenterX) > 35) {
        ctx.fillStyle = (wx * 11 + floor) % 5 === 0 ? '#1c1917' : '#fef08a';
        ctx.fillRect(wx, wy, 16, 22);
        // Window muntin grid
        ctx.fillStyle = '#450a0a';
        ctx.fillRect(wx + 7, wy, 2, 22);
        ctx.fillRect(wx, wy + 10, 16, 2);
      }
    }
  }

  // C1 Grand Pillars / Entrance Portico
  ctx.fillStyle = '#f8fafc';
  for (let px = gateCenterX - 30; px <= gateCenterX + 30; px += 15) {
    ctx.fillRect(px, gateBaseY - 45, 8, 45);
  }

  // 2. Roadway & Campus Avenue Pavement (Đường Giải Phóng / Đại Cồ Việt)
  ctx.fillStyle = '#1c1917';
  ctx.fillRect(0, gateBaseY, w, h - gateBaseY);
  // Curbs and crosswalk markings
  ctx.fillStyle = '#facc15';
  for (let px = 0; px < w; px += 55) {
    ctx.fillRect(px, gateBaseY, 30, 4);
  }

  // 3. Ancient Mahogany Trees (Cây xà cừ cổ thụ Bách Khoa)
  const tree1X = Math.max(30, gateCenterX - archWidth / 2 - 130);
  const tree2X = Math.min(w - 140, gateCenterX + archWidth / 2 + 30);
  drawPixelTree(ctx, tree1X, gateBaseY, 190, '#14532d', '#166534', '#22c55e', '#1c1917');
  drawPixelTree(ctx, tree2X, gateBaseY, 190, '#14532d', '#166534', '#22c55e', '#1c1917');

  // 4. Vintage Campus Streetlamps
  const lampLeftX = gateCenterX - archWidth / 2 - 40;
  const lampRightX = gateCenterX + archWidth / 2 + 35;
  [lampLeftX, lampRightX].forEach((lx) => {
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(lx, gateBaseY - 140, 8, 140);
    ctx.fillRect(lx - 12, gateBaseY - 144, 32, 6);
    // Glowing lamp globes
    ctx.fillStyle = '#fef08a';
    ctx.shadowColor = '#facc15';
    ctx.shadowBlur = 24;
    ctx.fillRect(lx - 10, gateBaseY - 160, 14, 16);
    ctx.fillRect(lx + 4, gateBaseY - 160, 14, 16);
    ctx.shadowBlur = 0;
  });

  // 5. THE LEGENDARY HUST PARABOL ARCH (Kỳ Vĩ & Uy Nghiêm)
  ctx.save();
  const leftFootX = gateCenterX - archWidth / 2;
  const rightFootX = gateCenterX + archWidth / 2;
  const apexY = gateBaseY - archHeight;

  // Internal Vertical Steel Tension Cables
  ctx.strokeStyle = 'rgba(241, 245, 249, 0.45)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  for (let step = 1; step <= 16; step++) {
    const frac = step / 17;
    const cx = leftFootX + frac * archWidth;
    // Parabolic curve: y = apexY + 4 * archHeight * (frac - 0.5)^2
    const cy = apexY + 4 * archHeight * Math.pow(frac - 0.5, 2);
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx, gateBaseY);
  }
  ctx.stroke();

  // Layer 1: Outer 3D Bevel Shadow (Deep Concrete Tone)
  ctx.strokeStyle = '#64748b';
  ctx.lineWidth = 26;
  ctx.beginPath();
  ctx.moveTo(leftFootX, gateBaseY);
  ctx.quadraticCurveTo(gateCenterX, apexY - archHeight * 0.95, rightFootX, gateBaseY);
  ctx.stroke();

  // Layer 2: Main Pure White Concrete Parabolic Arch
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 18;
  ctx.shadowColor = '#ffffff';
  ctx.shadowBlur = 14;
  ctx.beginPath();
  ctx.moveTo(leftFootX, gateBaseY);
  ctx.quadraticCurveTo(gateCenterX, apexY - archHeight * 0.95, rightFootX, gateBaseY);
  ctx.stroke();
  ctx.shadowBlur = 0;

  // Layer 3: Inner Arch Top Highlight
  ctx.strokeStyle = '#f8fafc';
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.moveTo(leftFootX, gateBaseY);
  ctx.quadraticCurveTo(gateCenterX, apexY - archHeight * 0.95, rightFootX, gateBaseY);
  ctx.stroke();

  // Massive Granite Base Pedestals supporting Arch Legs
  ctx.fillStyle = '#334155';
  ctx.fillRect(leftFootX - 22, gateBaseY - 45, 44, 45);
  ctx.fillRect(rightFootX - 22, gateBaseY - 45, 44, 45);
  ctx.fillStyle = '#1e293b';
  ctx.fillRect(leftFootX - 26, gateBaseY - 12, 52, 12);
  ctx.fillRect(rightFootX - 26, gateBaseY - 12, 52, 12);
  ctx.fillStyle = '#64748b';
  ctx.fillRect(leftFootX - 24, gateBaseY - 48, 48, 6);
  ctx.fillRect(rightFootX - 24, gateBaseY - 48, 48, 6);

  // Grand Crimson & Gold HUST Banner across Arch Apex
  const bannerW = Math.min(archWidth * 0.46, 260);
  const bannerH = 34;
  const bannerX = gateCenterX - bannerW / 2;
  const bannerY = apexY - 16;

  ctx.fillStyle = '#991b1b';
  ctx.fillRect(bannerX, bannerY, bannerW, bannerH);
  // Gold decorative border
  ctx.strokeStyle = '#facc15';
  ctx.lineWidth = 2.5;
  ctx.strokeRect(bannerX + 2, bannerY + 2, bannerW - 4, bannerH - 4);

  // Gold Typography: "ĐẠI HỌC BÁCH KHOA HÀ NỘI"
  ctx.fillStyle = '#facc15';
  ctx.font = 'bold 11px monospace';
  ctx.textAlign = 'center';
  ctx.fillText('ĐẠI HỌC BÁCH KHOA HÀ NỘI', gateCenterX, bannerY + 16);

  // Central Gold Cogwheel Emblem
  ctx.font = 'bold 10px monospace';
  ctx.fillStyle = '#ffffff';
  ctx.fillText('• HUST •', gateCenterX, bannerY + 28);
  ctx.restore();

  // 6. Swirling Golden Mahogany Leaves (Lá xà cừ chao nghiêng)
  const leafColors = ['#facc15', '#eab308', '#ca8a04', '#d97706', '#b45309'];
  leaves.forEach((p) => {
    const extraSpeedX = isWind ? dir * 7.5 : dir * 1.5;
    p.x += p.vx + extraSpeedX;
    p.y += p.vy;
    p.rot += p.rotSpeed * 2.4;

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
// 22. AURORA BOREALIS (Cực quang uốn lượn, Rừng thông tuyết, Sao băng)
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

// ======================================================================
// 23. COZY LOFI BEDROOM (Cửa sổ ngắm trăng, Mèo lười thở đều, Đèn bàn ấm)
// ======================================================================
function renderLofiBedroom(ctx: CanvasRenderingContext2D, w: number, h: number, time: number) {
  const winW = Math.min(w * 0.46, 420);
  const winH = Math.min(h * 0.58, 360);
  const winX = w * 0.12;
  const winY = h * 0.16;

  ctx.save();
  // Cutout window area showing night sky
  ctx.fillStyle = '#140c1e';
  ctx.fillRect(winX, winY, winW, winH);

  // Distant rooftop skyline silhouette through window
  ctx.fillStyle = '#0c0714';
  for (let bx = 0; bx < winW; bx += 28) {
    const bh = 50 + ((bx * 7) % 70);
    ctx.fillRect(winX + bx, winY + winH - bh, 24, bh);
  }
  // Distant warm city lights
  ctx.fillStyle = '#ffcf77';
  for (let bx = 6; bx < winW; bx += 32) {
    const bh = 30 + ((bx * 7) % 50);
    if ((bx * 3) % 5 > 1) {
      ctx.fillRect(winX + bx, winY + winH - bh + 12, 4, 4);
    }
  }

  // Glowing Crescent Moon
  ctx.fillStyle = '#fff4cc';
  ctx.shadowColor = 'rgba(255, 244, 204, 0.6)';
  ctx.shadowBlur = 15;
  ctx.beginPath();
  ctx.arc(winX + winW - 65, winY + 65, 22, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;
  // Moon shadow to sculpt crescent
  ctx.fillStyle = '#140c1e';
  ctx.beginPath();
  ctx.arc(winX + winW - 55, winY + 60, 20, 0, Math.PI * 2);
  ctx.fill();

  // Twinkling pixel stars
  for (let i = 0; i < 14; i++) {
    const sx = winX + 20 + ((i * 59) % (winW - 40));
    const sy = winY + 15 + ((i * 37) % (winH - 120));
    const twinkle = Math.sin(time * 0.003 + i) > 0.3 ? 1 : 0.4;
    ctx.fillStyle = `rgba(255, 255, 255, ${twinkle})`;
    ctx.fillRect(sx, sy, 2, 2);
  }

  // Window wooden cross-pane dividers
  ctx.fillStyle = '#3a2046';
  ctx.fillRect(winX + winW / 2 - 3, winY, 6, winH);
  ctx.fillRect(winX, winY + winH * 0.42 - 3, winW, 6);

  // Outer thick window frame
  ctx.strokeStyle = '#271430';
  ctx.lineWidth = 10;
  ctx.strokeRect(winX - 5, winY - 5, winW + 10, winH + 10);
  ctx.restore();

  // Wide Wooden Windowsill
  const sillY = winY + winH;
  ctx.fillStyle = '#4a2840';
  ctx.fillRect(winX - 16, sillY, winW + 32, 18);
  ctx.fillStyle = '#2f172a';
  ctx.fillRect(winX - 16, sillY + 18, winW + 32, 6);

  // Sleeping pixel cat curled up on windowsill
  const catX = winX + winW * 0.28;
  const catY = sillY - 8;
  const catBreathe = Math.sin(time * 0.0025) * 2;

  // Cat body (curled)
  ctx.fillStyle = '#f4a261'; // Calico ginger
  ctx.beginPath();
  ctx.ellipse(catX, catY - 8, 22, 14 + catBreathe, 0, 0, Math.PI * 2);
  ctx.fill();
  // White chest patch
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.ellipse(catX - 6, catY - 5, 9, 8 + catBreathe * 0.5, 0, 0, Math.PI * 2);
  ctx.fill();
  // Orange fur markings
  ctx.fillStyle = '#e76f51';
  ctx.fillRect(catX + 4, catY - 18, 6, 8);
  ctx.fillRect(catX - 14, catY - 14, 5, 6);
  // Cat head
  ctx.fillStyle = '#f4a261';
  ctx.beginPath();
  ctx.arc(catX - 15, catY - 8, 10, 0, Math.PI * 2);
  ctx.fill();
  // Cat ears
  ctx.fillStyle = '#e76f51';
  ctx.beginPath();
  ctx.moveTo(catX - 22, catY - 16);
  ctx.lineTo(catX - 17, catY - 24);
  ctx.lineTo(catX - 12, catY - 16);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(catX - 13, catY - 16);
  ctx.lineTo(catX - 8, catY - 23);
  ctx.lineTo(catX - 3, catY - 16);
  ctx.fill();
  // Sleeping closed eye curve
  ctx.strokeStyle = '#5a2d0c';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(catX - 18, catY - 8, 3, 0.1, Math.PI * 0.9);
  ctx.stroke();
  // Cat curled tail twitching gently
  const tailTwitch = Math.sin(time * 0.0018) * 3;
  ctx.strokeStyle = '#e76f51';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.arc(catX + 22, catY - 7 + tailTwitch, 9, 0, Math.PI);
  ctx.stroke();

  // Potted indoor hanging vine plant
  ctx.fillStyle = '#b56576';
  ctx.fillRect(winX + 24, winY + 8, 20, 15);
  ctx.fillStyle = '#52b788';
  for (let v = 0; v < 4; v++) {
    const vineLen = 30 + v * 12 + Math.sin(time * 0.002 + v) * 3;
    ctx.fillRect(winX + 26 + v * 4, winY + 23, 2, vineLen);
    ctx.fillRect(winX + 24 + v * 4, winY + 23 + vineLen, 6, 4);
  }

  // Warm Wooden Desk on the right
  const deskX = w * 0.54;
  const deskY = h * 0.52;
  const deskW = Math.min(w * 0.42, 380);
  const deskH = h - deskY;

  ctx.fillStyle = '#2d182b';
  ctx.fillRect(deskX, deskY, deskW, deskH);
  ctx.fillStyle = '#3e223c';
  ctx.fillRect(deskX - 10, deskY - 14, deskW + 20, 14);

  // Warm Desk Lamp
  const lampX = deskX + 50;
  const lampY = deskY - 14;

  ctx.fillStyle = '#eaac8b';
  ctx.fillRect(lampX - 14, lampY - 4, 28, 4);
  ctx.strokeStyle = '#eaac8b';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(lampX, lampY - 4);
  ctx.quadraticCurveTo(lampX + 5, lampY - 70, lampX + 35, lampY - 60);
  ctx.stroke();

  ctx.fillStyle = '#e56b6f';
  ctx.beginPath();
  ctx.moveTo(lampX + 22, lampY - 62);
  ctx.lineTo(lampX + 50, lampY - 50);
  ctx.lineTo(lampX + 30, lampY - 40);
  ctx.closePath();
  ctx.fill();

  // Amber glow cone from lamp
  ctx.save();
  const lampGlow = ctx.createRadialGradient(lampX + 35, lampY - 48, 10, lampX + 35, lampY - 48, 160);
  lampGlow.addColorStop(0, 'rgba(234, 172, 139, 0.55)');
  lampGlow.addColorStop(0.5, 'rgba(234, 172, 139, 0.2)');
  lampGlow.addColorStop(1, 'rgba(234, 172, 139, 0)');
  ctx.fillStyle = lampGlow;
  ctx.beginPath();
  ctx.moveTo(lampX + 35, lampY - 48);
  ctx.lineTo(lampX - 40, deskY + 60);
  ctx.lineTo(lampX + 160, deskY + 60);
  ctx.closePath();
  ctx.fill();
  ctx.restore();

  // Steaming Mug of Cocoa
  const mugX = deskX + 130;
  const mugY = deskY - 14;
  ctx.fillStyle = '#f7cad0';
  ctx.fillRect(mugX - 8, mugY - 18, 16, 18);
  ctx.fillStyle = '#b56576';
  ctx.fillRect(mugX + 8, mugY - 14, 4, 10);

  // Rising pixel steam
  ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
  for (let s = 0; s < 5; s++) {
    const sy = mugY - 24 - ((time * 0.03 + s * 9) % 36);
    const sx = mugX + Math.sin(time * 0.005 + s * 1.8) * 6;
    ctx.fillRect(sx, sy, 3, 3);
  }

  // Stack of pastel books
  const bookX = deskX + 180;
  ctx.fillStyle = '#6d597a';
  ctx.fillRect(bookX, deskY - 10, 52, 10);
  ctx.fillStyle = '#b56576';
  ctx.fillRect(bookX + 4, deskY - 20, 46, 10);
  ctx.fillStyle = '#eaac8b';
  ctx.fillRect(bookX + 8, deskY - 28, 38, 8);
}

// ======================================================================
// 24. SUNSET TRAIN JOURNEY (Khung cửa sổ toa tàu ngắm hoàng hôn đồng quê)
// ======================================================================
function renderSunsetTrain(ctx: CanvasRenderingContext2D, w: number, h: number, time: number) {
  const winMarginX = Math.max(w * 0.08, 40);
  const winMarginY = Math.max(h * 0.08, 40);
  const winW = w - winMarginX * 2;
  const winH = h - winMarginY * 2;
  const winX = winMarginX;
  const winY = winMarginY;

  ctx.save();
  ctx.beginPath();
  ctx.rect(winX, winY, winW, winH);
  ctx.clip();

  // Sunset sky gradient
  const skyGrad = ctx.createLinearGradient(winX, winY, winX, winY + winH);
  skyGrad.addColorStop(0, '#2d1537');
  skyGrad.addColorStop(0.35, '#6a2c4e');
  skyGrad.addColorStop(0.7, '#c85a44');
  skyGrad.addColorStop(1, '#f4a261');
  ctx.fillStyle = skyGrad;
  ctx.fillRect(winX, winY, winW, winH);

  // Big Glowing Setting Sun
  const sunX = winX + winW * 0.68;
  const sunY = winY + winH * 0.52;
  ctx.fillStyle = '#ffeedd';
  ctx.shadowColor = '#f4a261';
  ctx.shadowBlur = 24;
  ctx.beginPath();
  ctx.arc(sunX, sunY, 44, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;

  // Layer 1: Distant Mountain Range (slow scrolling)
  ctx.fillStyle = '#48203b';
  const mountScroll = (time * 0.012) % (winW * 1.5);
  ctx.beginPath();
  ctx.moveTo(winX, winY + winH * 0.65);
  for (let mx = 0; mx <= winW + 40; mx += 30) {
    const worldX = mx + mountScroll;
    const my = winY + winH * 0.55 + Math.sin(worldX * 0.008) * 32 + Math.cos(worldX * 0.015) * 16;
    ctx.lineTo(winX + mx, my);
  }
  ctx.lineTo(winX + winW, winY + winH);
  ctx.lineTo(winX, winY + winH);
  ctx.closePath();
  ctx.fill();

  // Layer 2: Rolling Golden Wheat/Grass Plains (medium scrolling)
  ctx.fillStyle = '#b2533e';
  const hillScroll = (time * 0.045) % (winW * 1.2);
  ctx.beginPath();
  ctx.moveTo(winX, winY + winH * 0.76);
  for (let hx = 0; hx <= winW + 40; hx += 25) {
    const worldHx = hx + hillScroll;
    const hy = winY + winH * 0.72 + Math.sin(worldHx * 0.012) * 18;
    ctx.lineTo(winX + hx, hy);
  }
  ctx.lineTo(winX + winW, winY + winH);
  ctx.lineTo(winX, winY + winH);
  ctx.closePath();
  ctx.fill();

  // Layer 3: Foreground Wheat Field (fast scrolling)
  ctx.fillStyle = '#d47a4c';
  ctx.fillRect(winX, winY + winH * 0.82, winW, winH * 0.18);
  ctx.fillStyle = '#e9c46a';
  for (let fx = 0; fx < winW; fx += 14) {
    const fScroll = (fx - time * 0.14) % winW;
    const drawFx = winX + (fScroll < 0 ? fScroll + winW : fScroll);
    ctx.fillRect(drawFx, winY + winH * 0.81, 4, 18);
  }

  // Fast-passing Telephone Poles & Cables
  const poleSpacing = 320;
  const poleSpeed = 0.38;
  const poleOffset = (time * poleSpeed) % poleSpacing;

  for (let px = -poleSpacing; px < winW + poleSpacing; px += poleSpacing) {
    const poleX = winX + winW - (px + poleOffset);
    if (poleX >= winX - 40 && poleX <= winX + winW + 40) {
      ctx.fillStyle = '#26121e';
      ctx.fillRect(poleX, winY + winH * 0.35, 10, winH * 0.65);
      ctx.fillRect(poleX - 22, winY + winH * 0.42, 54, 5);
      ctx.fillRect(poleX - 16, winY + winH * 0.48, 42, 4);

      ctx.strokeStyle = '#26121e';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(poleX - 22, winY + winH * 0.42);
      ctx.quadraticCurveTo(poleX - poleSpacing / 2, winY + winH * 0.46, poleX - poleSpacing + 22, winY + winH * 0.42);
      ctx.stroke();
    }
  }

  // Warm slanted golden sunbeam rays
  ctx.fillStyle = 'rgba(244, 162, 97, 0.14)';
  ctx.beginPath();
  ctx.moveTo(winX + winW * 0.6, winY);
  ctx.lineTo(winX + winW * 0.8, winY);
  ctx.lineTo(winX + winW * 0.4, winY + winH);
  ctx.lineTo(winX + winW * 0.1, winY + winH);
  ctx.closePath();
  ctx.fill();

  ctx.restore();

  // Train Carriage Interior Frame
  ctx.fillStyle = '#1b121c';
  ctx.fillRect(0, 0, w, winY);
  ctx.fillRect(0, winY + winH, w, h - (winY + winH));
  ctx.fillRect(0, 0, winX, h);
  ctx.fillRect(winX + winW, 0, w - (winX + winW), h);

  // Metallic / wooden window rim
  ctx.strokeStyle = '#3e2434';
  ctx.lineWidth = 14;
  ctx.strokeRect(winX - 7, winY - 7, winW + 14, winH + 14);
  ctx.strokeStyle = '#e9c46a';
  ctx.lineWidth = 2;
  ctx.strokeRect(winX, winY, winW, winH);

  // Swaying Curtains on both sides
  const swayLeft = Math.sin(time * 0.003) * 8;
  const swayRight = Math.cos(time * 0.003) * 8;

  ctx.fillStyle = '#eaac8b';
  ctx.beginPath();
  ctx.moveTo(winX - 10, winY);
  ctx.lineTo(winX + 45 + swayLeft, winY);
  ctx.lineTo(winX + 28 + swayLeft * 1.5, winY + winH);
  ctx.lineTo(winX - 10, winY + winH);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = '#eaac8b';
  ctx.beginPath();
  ctx.moveTo(winX + winW + 10, winY);
  ctx.lineTo(winX + winW - 45 + swayRight, winY);
  ctx.lineTo(winX + winW - 28 + swayRight * 1.5, winY + winH);
  ctx.lineTo(winX + winW + 10, winY + winH);
  ctx.closePath();
  ctx.fill();

  // Wooden window table ledge
  ctx.fillStyle = '#4c2635';
  ctx.fillRect(winX - 25, winY + winH, winW + 50, 22);
}

// ======================================================================
// 25. ZEN BAMBOO GARDEN (Vòi nước tre Shishi-odoshi, Rừng trúc, Hồ sen)
// ======================================================================
function renderZenBamboo(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  ripples: Array<{ x: number; y: number; radius: number; maxRadius: number; alpha: number }>,
  time: number
) {
  const fountainBaseX = w * 0.52;
  const fountainBaseY = h * 0.72;

  // Lotus Pond Water
  const pondY = h * 0.75;
  ctx.fillStyle = '#061d15';
  ctx.fillRect(0, pondY, w, h - pondY);

  // Background Bamboo Grove
  const stalkPositions = [
    { x: w * 0.06, width: 22 },
    { x: w * 0.14, width: 16 },
    { x: w * 0.22, width: 24 },
    { x: w * 0.31, width: 14 },
    { x: w * 0.76, width: 20 },
    { x: w * 0.84, width: 26 },
    { x: w * 0.92, width: 15 }
  ];

  stalkPositions.forEach((b, idx) => {
    ctx.fillStyle = idx % 2 === 0 ? '#1b4332' : '#2d6a4f';
    ctx.fillRect(b.x, 0, b.width, h);

    for (let ny = 35; ny < h; ny += 65 + ((idx * 7) % 25)) {
      ctx.fillStyle = '#52b788';
      ctx.fillRect(b.x - 2, ny, b.width + 4, 4);
      ctx.fillStyle = '#0d281e';
      ctx.fillRect(b.x - 1, ny + 4, b.width + 2, 2);

      if (ny < h * 0.65 && (ny + idx) % 2 === 0) {
        const leafDir = idx % 2 === 0 ? 1 : -1;
        const sway = Math.sin(time * 0.002 + ny * 0.1) * 4;
        ctx.fillStyle = '#52b788';
        ctx.beginPath();
        ctx.moveTo(b.x + (leafDir === 1 ? b.width : 0), ny + 2);
        ctx.quadraticCurveTo(
          b.x + b.width / 2 + leafDir * 35,
          ny - 12 + sway,
          b.x + b.width / 2 + leafDir * 55,
          ny + 8 + sway
        );
        ctx.lineTo(b.x + (leafDir === 1 ? b.width : 0), ny + 6);
        ctx.closePath();
        ctx.fill();
      }
    }
  });

  // Moss-covered Stone Basin (Tsukubai)
  const basinX = fountainBaseX - 35;
  const basinY = fountainBaseY + 30;
  ctx.fillStyle = '#1e3328';
  ctx.beginPath();
  ctx.ellipse(basinX, basinY, 44, 24, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#2d6a4f';
  ctx.beginPath();
  ctx.ellipse(basinX, basinY - 2, 34, 16, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#74c69d';
  ctx.beginPath();
  ctx.ellipse(basinX, basinY - 2, 28, 12, 0, 0, Math.PI * 2);
  ctx.fill();

  // SHISHI-ODOSHI ROCKER MECHANISM
  const cycleTime = 4500;
  const cyclePhase = (time % cycleTime) / cycleTime;

  let tiltAngle = -0.22;
  let isDumping = false;

  if (cyclePhase > 0.75 && cyclePhase < 0.88) {
    const dumpPhase = (cyclePhase - 0.75) / 0.13;
    tiltAngle = -0.22 + Math.sin(dumpPhase * Math.PI) * 0.75;
    isDumping = true;
  } else if (cyclePhase >= 0.88 && cyclePhase < 0.94) {
    const bouncePhase = (cyclePhase - 0.88) / 0.06;
    tiltAngle = -0.22 + Math.sin(bouncePhase * Math.PI) * 0.12;
  }

  if (isDumping && Math.random() < 0.25) {
    ripples.push({
      x: basinX + (Math.random() - 0.5) * 10,
      y: basinY,
      radius: 4,
      maxRadius: 36,
      alpha: 0.8
    });
  }

  // Supply Bamboo Spout
  const spoutX = fountainBaseX + 60;
  const spoutY = fountainBaseY - 50;
  ctx.fillStyle = '#40916c';
  ctx.fillRect(spoutX, spoutY, 14, 60);
  ctx.fillStyle = '#52b788';
  ctx.fillRect(spoutX - 45, spoutY, 55, 12);
  ctx.fillStyle = '#95d5b2';
  ctx.fillRect(spoutX - 44, spoutY + 12, 3, 32);

  // Rocker Fulcrum
  ctx.fillStyle = '#2d1810';
  ctx.fillRect(fountainBaseX - 5, fountainBaseY - 10, 12, 45);

  // Pivoting Bamboo Pipe
  ctx.save();
  ctx.translate(fountainBaseX, fountainBaseY);
  ctx.rotate(tiltAngle);
  ctx.fillStyle = '#74c69d';
  ctx.fillRect(-75, -8, 105, 16);
  ctx.fillStyle = '#1b4332';
  ctx.fillRect(-78, -8, 5, 16);
  ctx.fillStyle = '#d8f3dc';
  ctx.fillRect(-15, -9, 4, 18);
  ctx.restore();

  if (isDumping) {
    ctx.fillStyle = '#b7e4c7';
    ctx.fillRect(fountainBaseX - 65, fountainBaseY + 8, 8, 30);
  }

  // Lily Pads in Lotus Pond
  const padPositions = [
    { x: w * 0.25, y: pondY + 35, r: 20 },
    { x: w * 0.38, y: pondY + 55, r: 28 },
    { x: w * 0.72, y: pondY + 40, r: 24 }
  ];
  padPositions.forEach((pad) => {
    ctx.fillStyle = '#2d6a4f';
    ctx.beginPath();
    ctx.arc(pad.x, pad.y, pad.r, 0.2, Math.PI * 1.85);
    ctx.lineTo(pad.x, pad.y);
    ctx.closePath();
    ctx.fill();

    if (pad.r > 25) {
      ctx.fillStyle = '#ffb3c6';
      ctx.beginPath();
      ctx.arc(pad.x, pad.y - 6, 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#fff0f3';
      ctx.beginPath();
      ctx.arc(pad.x, pad.y - 7, 4, 0, Math.PI * 2);
      ctx.fill();
    }
  });

  // Expand and render water ripples
  for (let r = ripples.length - 1; r >= 0; r--) {
    const rip = ripples[r];
    rip.radius += 0.8;
    rip.alpha -= 0.02;
    if (rip.alpha <= 0 || rip.radius > rip.maxRadius) {
      ripples.splice(r, 1);
      continue;
    }
    ctx.strokeStyle = `rgba(149, 213, 178, ${rip.alpha})`;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.ellipse(rip.x, rip.y, rip.radius * 1.8, rip.radius * 0.6, 0, 0, Math.PI * 2);
    ctx.stroke();
  }
}

// ======================================================================
// 26. MIDNIGHT CAMPFIRE (Lều vải nhỏ, Lửa trại bập bùng, Ngàn sao đêm)
// ======================================================================
function renderMidnightCamp(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  embers: Array<{ x: number; y: number; vx: number; vy: number; life: number; maxLife: number; size: number }>,
  time: number
) {
  // Starry Sky
  ctx.fillStyle = '#ffffff';
  for (let i = 0; i < 65; i++) {
    const sx = (i * 137) % w;
    const sy = (i * 73) % (h * 0.6);
    const twinkle = Math.sin(time * 0.003 + i) > 0 ? 1 : 0.35;
    ctx.fillStyle = `rgba(255, 255, 255, ${twinkle})`;
    ctx.fillRect(sx, sy, 2, 2);
  }

  // Milky Way Band
  ctx.save();
  ctx.fillStyle = 'rgba(125, 211, 252, 0.06)';
  ctx.beginPath();
  ctx.moveTo(w * 0.2, 0);
  ctx.lineTo(w * 0.5, 0);
  ctx.lineTo(w * 0.8, h * 0.7);
  ctx.lineTo(w * 0.5, h * 0.7);
  ctx.closePath();
  ctx.fill();
  ctx.restore();

  // Distant Mountain Ridges
  ctx.fillStyle = '#0b1329';
  ctx.beginPath();
  ctx.moveTo(0, h * 0.62);
  ctx.lineTo(w * 0.25, h * 0.48);
  ctx.lineTo(w * 0.5, h * 0.58);
  ctx.lineTo(w * 0.78, h * 0.45);
  ctx.lineTo(w, h * 0.6);
  ctx.lineTo(w, h);
  ctx.lineTo(0, h);
  ctx.closePath();
  ctx.fill();

  // Grassy Ground
  ctx.fillStyle = '#060a14';
  ctx.fillRect(0, h - 70, w, 70);

  // Majestic Pine Trees on left and right borders
  for (let px = 20; px < w * 0.24; px += 45) {
    drawPineTree(ctx, px, h - 70, 130 + (px % 40));
  }
  for (let px = w * 0.82; px < w; px += 45) {
    drawPineTree(ctx, px, h - 70, 140 + (px % 35));
  }

  // A-Frame Canvas Camping Tent
  const tentX = w * 0.28;
  const tentY = h - 70;
  const tentW = 120;
  const tentH = 95;

  ctx.fillStyle = '#c2410c';
  ctx.beginPath();
  ctx.moveTo(tentX, tentY);
  ctx.lineTo(tentX + tentW / 2, tentY - tentH);
  ctx.lineTo(tentX + tentW, tentY);
  ctx.closePath();
  ctx.fill();

  // Glowing Tent Entrance
  ctx.fillStyle = '#f59e0b';
  ctx.shadowColor = '#f59e0b';
  ctx.shadowBlur = 20;
  ctx.beginPath();
  ctx.moveTo(tentX + 25, tentY);
  ctx.lineTo(tentX + tentW / 2, tentY - tentH + 15);
  ctx.lineTo(tentX + tentW - 25, tentY);
  ctx.closePath();
  ctx.fill();
  ctx.shadowBlur = 0;

  // Tent Guyline strings
  ctx.strokeStyle = '#78350f';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(tentX + tentW / 2, tentY - tentH);
  ctx.lineTo(tentX - 25, tentY);
  ctx.moveTo(tentX + tentW / 2, tentY - tentH);
  ctx.lineTo(tentX + tentW + 25, tentY);
  ctx.stroke();

  // CAMPFIRE with Stones & Animated Flames
  const fireX = w * 0.62;
  const fireY = h - 70;

  // Ring of Campfire Stones
  ctx.fillStyle = '#475569';
  for (let i = -4; i <= 4; i++) {
    ctx.beginPath();
    ctx.arc(fireX + i * 11, fireY + 4, 7, 0, Math.PI * 2);
    ctx.fill();
  }

  // Wooden Logs crossing
  ctx.fillStyle = '#78350f';
  ctx.save();
  ctx.translate(fireX, fireY);
  ctx.rotate(0.35);
  ctx.fillRect(-28, -5, 56, 10);
  ctx.rotate(-0.7);
  ctx.fillRect(-28, -5, 56, 10);
  ctx.restore();

  // Multi-tier Animated Flickering Flames
  const flameFlicker1 = Math.sin(time * 0.02) * 5;
  const flameFlicker2 = Math.cos(time * 0.025) * 6;

  ctx.fillStyle = '#ef4444';
  ctx.shadowColor = '#f59e0b';
  ctx.shadowBlur = 25;
  ctx.beginPath();
  ctx.moveTo(fireX - 20, fireY);
  ctx.quadraticCurveTo(fireX - 10 + flameFlicker1, fireY - 45, fireX, fireY - 55 + flameFlicker2);
  ctx.quadraticCurveTo(fireX + 10 - flameFlicker2, fireY - 45, fireX + 20, fireY);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = '#f97316';
  ctx.beginPath();
  ctx.moveTo(fireX - 14, fireY);
  ctx.quadraticCurveTo(fireX - 5 - flameFlicker2, fireY - 35, fireX, fireY - 44 + flameFlicker1);
  ctx.quadraticCurveTo(fireX + 5 + flameFlicker1, fireY - 35, fireX + 14, fireY);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = '#fef08a';
  ctx.beginPath();
  ctx.moveTo(fireX - 8, fireY);
  ctx.quadraticCurveTo(fireX, fireY - 25, fireX, fireY - 30);
  ctx.quadraticCurveTo(fireX, fireY - 25, fireX + 8, fireY);
  ctx.closePath();
  ctx.fill();
  ctx.shadowBlur = 0;

  // Floating Campfire Embers
  embers.forEach((em) => {
    em.x += em.vx;
    em.y += em.vy;
    em.life++;

    if (em.life > em.maxLife || em.y < 0) {
      em.x = fireX + (Math.random() - 0.5) * 20;
      em.y = fireY - 10;
      em.vx = (Math.random() - 0.5) * 1.5;
      em.vy = -(Math.random() * 2.2 + 1.2);
      em.life = 0;
    }

    const alpha = 1 - em.life / em.maxLife;
    ctx.fillStyle = em.life % 2 === 0 ? `rgba(245, 158, 11, ${alpha})` : `rgba(239, 68, 68, ${alpha})`;
    ctx.fillRect(em.x, em.y, em.size, em.size);
  });
}

// ======================================================================
// 27. PASTEL TWILIGHT SUNSET (Hoàng hôn kẹo ngọt pastel, Mây hồng trôi nhẹ)
// ======================================================================
function renderPastelSunset(ctx: CanvasRenderingContext2D, w: number, h: number, time: number) {
  const sunX = w * 0.5;
  const sunY = h * 0.54;

  ctx.fillStyle = '#fff5ea';
  ctx.shadowColor = '#f7cad0';
  ctx.shadowBlur = 35;
  ctx.beginPath();
  ctx.arc(sunX, sunY, 52, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;

  // Fluffy Multi-Layered Drifting Pastel Pixel Clouds
  const cloudLayers = [
    { speed: 0.12, yRatio: 0.18, color: 'rgba(200, 182, 255, 0.45)', scale: 1.2 },
    { speed: 0.22, yRatio: 0.32, color: 'rgba(247, 202, 208, 0.6)', scale: 1.0 },
    { speed: 0.35, yRatio: 0.45, color: 'rgba(255, 214, 165, 0.75)', scale: 1.4 }
  ];

  cloudLayers.forEach((layer, lIdx) => {
    ctx.fillStyle = layer.color;
    for (let c = 0; c < 5; c++) {
      const cx = ((c * (w / 4) + time * layer.speed) % (w + 240)) - 120;
      const cy = h * layer.yRatio + Math.sin(c * 2 + lIdx) * 18;
      drawFluffyPixelCloud(ctx, cx, cy, 70 * layer.scale, 28 * layer.scale);
    }
  });

  // Calm Pastel Water Body
  const waterY = h * 0.64;
  const waterGrad = ctx.createLinearGradient(0, waterY, 0, h);
  waterGrad.addColorStop(0, '#592e59');
  waterGrad.addColorStop(0.5, '#3b1c43');
  waterGrad.addColorStop(1, '#200f28');
  ctx.fillStyle = waterGrad;
  ctx.fillRect(0, waterY, w, h - waterY);

  // Shimmering Golden-Pink Water Reflections
  for (let ry = waterY + 4; ry < h; ry += 7) {
    const waveProgress = (ry - waterY) / (h - waterY);
    const waveWidth = 80 + waveProgress * 180 + Math.sin(ry * 0.2 + time * 0.004) * 25;
    const waveAlpha = (1 - waveProgress * 0.7) * 0.45;
    ctx.fillStyle = `rgba(255, 214, 165, ${waveAlpha})`;
    ctx.fillRect(sunX - waveWidth / 2, ry, waveWidth, 3);
  }

  // Gentle flock of birds gliding into the sunset
  ctx.fillStyle = '#3a1937';
  for (let b = 0; b < 5; b++) {
    const bx = (w * 0.3 + b * 22 - time * 0.04) % (w + 100);
    const by = h * 0.26 + b * 9 + Math.sin(time * 0.005 + b) * 4;
    ctx.fillRect(bx, by, 3, 2);
    ctx.fillRect(bx - 3, by - 2, 3, 2);
    ctx.fillRect(bx + 3, by - 2, 3, 2);
  }
}

// ======================================================================
// 28. RAINY COUNTRYSIDE BUS STOP (Trạm xe buýt chiều mưa, Đèn đường ấm áp)
// ======================================================================
function renderRainyBusstop(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  raindrops: any[],
  splashes: any[],
  time: number
) {
  const groundY = h - 65;

  // Wet Roadway & Pavement
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(0, groundY, w, 65);
  ctx.fillStyle = 'rgba(56, 189, 248, 0.15)';
  ctx.fillRect(w * 0.1, groundY + 15, w * 0.35, 12);
  ctx.fillRect(w * 0.55, groundY + 25, w * 0.4, 16);

  // Background rainy silhouettes of distant trees
  ctx.fillStyle = '#111b2e';
  for (let tx = 30; tx < w; tx += 65) {
    const tH = 90 + ((tx * 11) % 60);
    ctx.fillRect(tx, groundY - tH, 35, tH);
  }

  // Countryside Wooden Bus Stop Shelter
  const shelterX = w * 0.58;
  const shelterW = Math.min(w * 0.32, 260);
  const shelterH = 155;
  const shelterY = groundY - shelterH;

  // Slanted Roof
  ctx.fillStyle = '#334155';
  ctx.beginPath();
  ctx.moveTo(shelterX - 25, shelterY);
  ctx.lineTo(shelterX + shelterW + 20, shelterY + 20);
  ctx.lineTo(shelterX + shelterW + 15, shelterY + 30);
  ctx.lineTo(shelterX - 30, shelterY + 10);
  ctx.closePath();
  ctx.fill();

  // Support Posts
  ctx.fillStyle = '#1e293b';
  ctx.fillRect(shelterX, shelterY + 10, 12, shelterH);
  ctx.fillRect(shelterX + shelterW - 12, shelterY + 25, 12, shelterH - 15);
  ctx.fillRect(shelterX + shelterW / 2 - 6, shelterY + 18, 12, shelterH - 8);

  // Back Wall Lattice
  ctx.fillStyle = 'rgba(30, 41, 59, 0.6)';
  ctx.fillRect(shelterX + 12, shelterY + 35, shelterW - 24, shelterH - 35);

  // Wooden Waiting Bench
  ctx.fillStyle = '#475569';
  ctx.fillRect(shelterX + 25, groundY - 36, shelterW - 50, 10);
  ctx.fillRect(shelterX + 35, groundY - 26, 8, 26);
  ctx.fillRect(shelterX + shelterW - 43, groundY - 26, 8, 26);

  // Vintage Street Lamp Beside Bus Stop
  const lampX = shelterX - 55;
  const lampY = groundY - 185;

  ctx.fillStyle = '#1e293b';
  ctx.fillRect(lampX - 4, lampY + 35, 8, 150);
  ctx.beginPath();
  ctx.arc(lampX + 16, lampY + 45, 20, Math.PI, Math.PI * 1.5);
  ctx.lineWidth = 6;
  ctx.strokeStyle = '#1e293b';
  ctx.stroke();

  // Glass Lantern Body & Warm Glow
  ctx.fillStyle = '#fbbf24';
  ctx.shadowColor = '#fbbf24';
  ctx.shadowBlur = 25;
  ctx.fillRect(lampX + 10, lampY + 25, 16, 18);
  ctx.shadowBlur = 0;

  // Warm Conic Light Beam
  ctx.save();
  const lightBeam = ctx.createRadialGradient(lampX + 18, lampY + 35, 10, lampX + 18, groundY, 220);
  lightBeam.addColorStop(0, 'rgba(251, 191, 36, 0.35)');
  lightBeam.addColorStop(0.6, 'rgba(251, 191, 36, 0.12)');
  lightBeam.addColorStop(1, 'rgba(251, 191, 36, 0)');
  ctx.fillStyle = lightBeam;
  ctx.beginPath();
  ctx.moveTo(lampX + 18, lampY + 35);
  ctx.lineTo(lampX - 110, groundY);
  ctx.lineTo(lampX + 140, groundY);
  ctx.closePath();
  ctx.fill();
  ctx.restore();

  // Bus Stop Signpost
  const signX = shelterX - 110;
  ctx.fillStyle = '#334155';
  ctx.fillRect(signX, groundY - 90, 6, 90);
  ctx.fillStyle = '#0284c7';
  ctx.beginPath();
  ctx.arc(signX + 3, groundY - 105, 18, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 9px monospace';
  ctx.textAlign = 'center';
  ctx.fillText('BUS', signX + 3, groundY - 102);

  // Gentle Falling Rain Streaks
  raindrops.forEach((drop) => {
    drop.y += drop.speed * 0.75;
    drop.x -= 1.8;

    if (drop.y > groundY + 10) {
      drop.y = -drop.len;
      drop.x = Math.random() * (w + 100);
      if (Math.random() < 0.2) {
        splashes.push({ x: drop.x, y: groundY + Math.random() * 20, age: 0, maxAge: 8 });
      }
    }

    const distToLamp = Math.hypot(drop.x - (lampX + 18), drop.y - (lampY + 80));
    ctx.strokeStyle = distToLamp < 130 ? 'rgba(251, 191, 36, 0.7)' : 'rgba(148, 163, 184, 0.35)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(drop.x, drop.y);
    ctx.lineTo(drop.x - 2, drop.y + drop.len * 0.8);
    ctx.stroke();
  });

  // Rain Splashes on ground
  for (let i = splashes.length - 1; i >= 0; i--) {
    const s = splashes[i];
    s.age++;
    if (s.age > s.maxAge) {
      splashes.splice(i, 1);
      continue;
    }
    ctx.strokeStyle = `rgba(148, 163, 184, ${1 - s.age / s.maxAge})`;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(s.x, s.y, s.age * 0.8, 0, Math.PI * 2);
    ctx.stroke();
  }
}

// ======================================================================
// HELPER DRAWING FUNCTIONS
// ======================================================================
function drawPineTree(ctx: CanvasRenderingContext2D, x: number, y: number, height: number = 130) {
  ctx.fillStyle = '#1e110a';
  ctx.fillRect(x + 16, y - height * 0.3, 10, height * 0.3);

  ctx.fillStyle = '#061a14';
  ctx.beginPath();
  ctx.moveTo(x - 18, y - height * 0.25);
  ctx.lineTo(x + 21, y - height * 0.65);
  ctx.lineTo(x + 60, y - height * 0.25);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = '#0a2e22';
  ctx.beginPath();
  ctx.moveTo(x - 12, y - height * 0.55);
  ctx.lineTo(x + 21, y - height * 0.88);
  ctx.lineTo(x + 54, y - height * 0.55);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = '#0f3d2e';
  ctx.beginPath();
  ctx.moveTo(x - 4, y - height * 0.78);
  ctx.lineTo(x + 21, y - height);
  ctx.lineTo(x + 46, y - height * 0.78);
  ctx.closePath();
  ctx.fill();
}

function drawFluffyPixelCloud(ctx: CanvasRenderingContext2D, cx: number, cy: number, w: number, h: number) {
  ctx.beginPath();
  ctx.arc(cx, cy, h * 0.9, 0, Math.PI * 2);
  ctx.arc(cx + w * 0.35, cy - h * 0.3, h * 1.1, 0, Math.PI * 2);
  ctx.arc(cx + w * 0.7, cy, h * 0.85, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillRect(cx, cy, w * 0.7, h * 0.9);
}

// ======================================================================
// 29. CYBERPUNK RAMEN BAR (Quán mì Ramen tương lai, Hologram bốc khói, Xe bay)
// ======================================================================
function renderCyberRamen(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  raindrops: any[],
  time: number
) {
  const streetY = h - 60;

  // Wet pavement with neon color reflections
  ctx.fillStyle = '#080210';
  ctx.fillRect(0, streetY, w, 60);
  ctx.fillStyle = 'rgba(244, 63, 94, 0.2)';
  ctx.fillRect(w * 0.2, streetY + 12, 140, 16);
  ctx.fillStyle = 'rgba(0, 240, 255, 0.22)';
  ctx.fillRect(w * 0.55, streetY + 18, 160, 14);

  // Futuristic Flying Hovercar cruising across upper skyline
  const carX = ((time * 0.18) % (w + 260)) - 130;
  const carY = h * 0.22 + Math.sin(time * 0.003) * 12;
  ctx.fillStyle = '#1e1b4b';
  ctx.fillRect(carX, carY, 68, 14);
  ctx.fillStyle = '#00f0ff'; // Cyan headlight
  ctx.fillRect(carX + 60, carY + 3, 8, 8);
  ctx.fillStyle = '#f43f5e'; // Red taillight
  ctx.fillRect(carX, carY + 3, 6, 8);
  // Plasma engine trail
  ctx.fillStyle = 'rgba(0, 240, 255, 0.45)';
  ctx.fillRect(carX - 35, carY + 4, 35, 6);

  // Traditional yet Cyberpunk Ramen Food Stall (Center/Right)
  const stallX = w * 0.46;
  const stallW = Math.min(w * 0.44, 380);
  const stallH = 175;
  const stallY = streetY - stallH;

  // Dark timber stall frame & overhang roof
  ctx.fillStyle = '#1f132b';
  ctx.fillRect(stallX, stallY, stallW, stallH);
  ctx.fillStyle = '#3b123d';
  ctx.fillRect(stallX - 20, stallY - 14, stallW + 40, 16); // Roof awning

  // Glowing Noren fabric curtains (Noren rèm vải treo cửa)
  const norenColors = ['#f43f5e', '#be123c', '#9f1239'];
  for (let nx = 0; nx < 4; nx++) {
    const curW = (stallW - 20) / 4;
    const curX = stallX + 10 + nx * curW;
    const curSway = Math.sin(time * 0.003 + nx) * 3;
    ctx.fillStyle = norenColors[nx % norenColors.length];
    ctx.fillRect(curX + curSway, stallY + 2, curW - 6, 42);
    // White pixel kanji mark on curtain
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(curX + curSway + curW / 2 - 4, stallY + 16, 6, 12);
  }

  // Wooden Dining Counter Bar
  const counterY = streetY - 55;
  ctx.fillStyle = '#4a1e35';
  ctx.fillRect(stallX - 10, counterY, stallW + 20, 14);
  ctx.fillStyle = '#652345';
  ctx.fillRect(stallX - 10, counterY - 4, stallW + 20, 4);

  // Steaming Ceramic Ramen Bowls on counter
  for (let b = 0; b < 2; b++) {
    const bx = stallX + 50 + b * 110;
    const by = counterY - 12;
    // Bowl
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(bx - 12, by, 24, 12);
    // Yellow noodles & nori seaweed
    ctx.fillStyle = '#facc15';
    ctx.fillRect(bx - 8, by - 2, 16, 4);
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(bx + 2, by - 6, 4, 8); // nori

    // Whimsical Rising Ramen Steam Curls
    ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
    for (let s = 0; s < 4; s++) {
      const sy = by - 10 - ((time * 0.03 + s * 9) % 32);
      const sx = bx + Math.sin(time * 0.005 + s * 1.5) * 5;
      ctx.fillRect(sx, sy, 3, 3);
    }
  }

  // Hanging Red Chochin Silk Lanterns
  for (let l = 0; l < 2; l++) {
    const lx = stallX + 25 + l * (stallW - 50);
    const ly = stallY + 14;
    const sway = Math.sin(time * 0.003 + l) * 4;

    ctx.save();
    ctx.fillStyle = '#f43f5e';
    ctx.shadowColor = '#f43f5e';
    ctx.shadowBlur = 18;
    ctx.fillRect(lx + sway - 8, ly, 16, 24);
    ctx.shadowBlur = 0;
    ctx.fillStyle = '#fbbf24';
    ctx.fillRect(lx + sway - 3, ly + 24, 6, 6); // Tassel
    ctx.restore();
  }

  // OVERHEAD NEON HOLOGRAPHIC RAMEN SIGN
  const signX = stallX + stallW * 0.5;
  const signY = stallY - 55;

  ctx.save();
  // Glowing Neon Hologram Ramen Bowl
  const holoGlow = Math.sin(time * 0.006) > 0 ? '#00f0ff' : '#38bdf8';
  ctx.fillStyle = holoGlow;
  ctx.shadowColor = holoGlow;
  ctx.shadowBlur = 20;

  // Hologram bowl outline
  ctx.fillRect(signX - 25, signY, 50, 16);
  ctx.fillRect(signX - 16, signY + 16, 32, 6);
  // Chopsticks picking up noodles
  ctx.fillRect(signX - 10, signY - 24, 28, 4);
  ctx.fillRect(signX + 2, signY - 20, 4, 18);

  // Neon text "RAMEN"
  ctx.font = 'bold 11px monospace';
  ctx.textAlign = 'center';
  ctx.fillStyle = '#fbbf24';
  ctx.fillText('RAMEN ラーメン', signX, signY - 32);
  ctx.restore();

  // Cyber Slanted High-Speed Rain
  raindrops.forEach((r) => {
    r.x -= 3.5;
    r.y += r.speed;
    if (r.y > streetY + 10) {
      r.y = -r.len;
      r.x = Math.random() * (w + 200);
    }
    ctx.strokeStyle = Math.random() < 0.2 ? '#00f0ff' : 'rgba(244, 63, 94, 0.4)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(r.x, r.y);
    ctx.lineTo(r.x - 4, r.y + r.len);
    ctx.stroke();
  });
}

// ======================================================================
// 30. SKY CASTLE LAPUTA RUINS (Lâu đài bay, Thác mây, Khinh khí cầu)
// ======================================================================
function renderFloatingIslands(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  leaves: any[],
  isWind: boolean,
  dir: number,
  time: number
) {
  // Immense Fluffy Clouds billowing in background
  ctx.fillStyle = 'rgba(255, 255, 255, 0.65)';
  for (let i = 0; i < 6; i++) {
    const cx = ((i * (w / 3) + time * 0.08) % (w + 300)) - 150;
    const cy = h * 0.45 + Math.sin(i * 1.5) * 45;
    drawFluffyPixelCloud(ctx, cx, cy, 140, 55);
  }

  // Giant Steampunk Sky Airship cruising across horizon
  const airshipX = ((time * 0.05) % (w + 350)) - 200;
  const airshipY = h * 0.24 + Math.sin(time * 0.002) * 14;

  ctx.fillStyle = '#451a03'; // Airship hull
  ctx.beginPath();
  ctx.ellipse(airshipX, airshipY, 70, 22, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#b45309';
  ctx.fillRect(airshipX - 30, airshipY + 18, 55, 12); // Passenger cabin
  // Rotating propeller
  const propPhase = Math.sin(time * 0.04) * 16;
  ctx.fillStyle = '#f8fafc';
  ctx.fillRect(airshipX - 74, airshipY - propPhase / 2, 4, propPhase);

  // MAIN FLOATING ISLAND (Laputa Crag on Center-Right)
  const islX = w * 0.58;
  const islY = h * 0.56 + Math.sin(time * 0.0018) * 10;
  const islW = Math.min(w * 0.46, 420);

  // Inverted Rocky Crag Root (đáy đảo đá nhọn chúc xuống mây)
  ctx.fillStyle = '#291b12';
  ctx.beginPath();
  ctx.moveTo(islX - islW * 0.5, islY);
  ctx.lineTo(islX, islY + 160); // Deep rock spike
  ctx.lineTo(islX + islW * 0.5, islY);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = '#452a1a';
  ctx.beginPath();
  ctx.moveTo(islX - islW * 0.4, islY);
  ctx.lineTo(islX - 15, islY + 120);
  ctx.lineTo(islX + islW * 0.35, islY);
  ctx.closePath();
  ctx.fill();

  // Lush Ancient Moss & Grass Platform
  ctx.fillStyle = '#15803d';
  ctx.fillRect(islX - islW * 0.52, islY - 14, islW * 1.04, 18);
  ctx.fillStyle = '#22c55e';
  ctx.fillRect(islX - islW * 0.5, islY - 20, islW, 8);

  // Ancient Ruined Marble Columns (Cột đá cổ Hy Lạp / Laputa)
  ctx.fillStyle = '#e2e8f0';
  for (let c = 0; c < 3; c++) {
    const colX = islX - 90 + c * 80;
    const colH = 65 + (c % 2) * 25;
    ctx.fillRect(colX, islY - 20 - colH, 14, colH);
    ctx.fillRect(colX - 4, islY - 24 - colH, 22, 6); // Column capital
  }

  // Cascading Waterfall tumbling off island edge into clouds!
  const wfX = islX + islW * 0.28;
  ctx.fillStyle = '#38bdf8';
  ctx.fillRect(wfX, islY - 10, 18, 140);
  ctx.fillStyle = '#bae6fd';
  ctx.fillRect(wfX + 3, islY - 8, 12, 135);

  // Waterfall splash mist at base
  ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
  for (let m = 0; m < 5; m++) {
    const mx = wfX - 10 + m * 8;
    const my = islY + 125 + Math.sin(time * 0.005 + m) * 8;
    ctx.fillRect(mx, my, 12, 10);
  }

  // SECONDARY MINI FLOATING ISLAND (Upper Left)
  const sIslX = w * 0.2;
  const sIslY = h * 0.38 + Math.cos(time * 0.002) * 8;
  ctx.fillStyle = '#291b12';
  ctx.beginPath();
  ctx.moveTo(sIslX - 60, sIslY);
  ctx.lineTo(sIslX, sIslY + 70);
  ctx.lineTo(sIslX + 60, sIslY);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#22c55e';
  ctx.fillRect(sIslX - 65, sIslY - 10, 130, 12);
  // Solitary pine on mini island
  drawPineTree(ctx, sIslX - 15, sIslY - 10, 85);

  // Blowing Green Foliage & Dandelion Particles
  leaves.forEach((p) => {
    p.x += (isWind ? dir * 5 : dir * 1.5);
    p.y += p.vy * 0.7;
    p.rot += p.rotSpeed;

    if (p.y > h + 10) {
      p.y = -10;
      p.x = Math.random() * w;
    }
    if (p.x > w + 20) p.x = -20;
    if (p.x < -20) p.x = w + 20;

    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(p.rot);
    ctx.fillStyle = '#4ade80';
    ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
    ctx.restore();
  });
}

// ======================================================================
// 31. RETRO 80s ARCADE ROOM (Máy thùng Arcade phát sáng, Sàn 3D Neon)
// ======================================================================
function renderRetroArcade(ctx: CanvasRenderingContext2D, w: number, h: number, time: number) {
  const floorY = h * 0.58;

  // Giant Neon Retro Sun on Back Wall
  const sunX = w * 0.5;
  const sunY = floorY - 30;
  ctx.fillStyle = '#ec4899';
  ctx.shadowColor = '#ec4899';
  ctx.shadowBlur = 30;
  ctx.beginPath();
  ctx.arc(sunX, sunY, 75, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;

  // 3D Perspective Synthwave Neon Grid Floor
  ctx.fillStyle = '#0a0214';
  ctx.fillRect(0, floorY, w, h - floorY);

  ctx.strokeStyle = '#8b5cf6';
  ctx.lineWidth = 1.5;

  // Vanishing point perspective lines
  const vpX = w * 0.5;
  const vpY = floorY;
  for (let x = -w * 0.5; x <= w * 1.5; x += 75) {
    ctx.beginPath();
    ctx.moveTo(vpX, vpY);
    ctx.lineTo(x, h);
    ctx.stroke();
  }

  // Horizontal moving grid lines
  const gridOffset = (time * 0.05) % 35;
  for (let gy = floorY; gy < h; gy += 25) {
    const animGy = gy + gridOffset;
    if (animGy < h) {
      ctx.beginPath();
      ctx.moveTo(0, animGy);
      ctx.lineTo(w, animGy);
      ctx.stroke();
    }
  }

  // TWO RETRO ARCADE CABINETS
  const cab1X = w * 0.22;
  const cab2X = w * 0.68;
  const cabW = 95;
  const cabH = 190;
  const cabY = h - cabH - 30;

  [
    { x: cab1X, name: 'ALGO FIGHTER', screenCol: '#00f0ff', marqueeCol: '#f43f5e' },
    { x: cab2X, name: 'PIXEL MAGE', screenCol: '#a855f7', marqueeCol: '#facc15' }
  ].forEach((cab) => {
    // Cabinet Body
    ctx.fillStyle = '#1e1035';
    ctx.fillRect(cab.x, cabY, cabW, cabH);
    ctx.fillStyle = '#2e1550';
    ctx.fillRect(cab.x + 8, cabY + 8, cabW - 16, cabH - 16);

    // Glowing Top Marquee Sign
    ctx.fillStyle = cab.marqueeCol;
    ctx.shadowColor = cab.marqueeCol;
    ctx.shadowBlur = 15;
    ctx.fillRect(cab.x + 12, cabY + 12, cabW - 24, 26);
    ctx.shadowBlur = 0;
    ctx.fillStyle = '#000000';
    ctx.font = 'bold 8px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(cab.name, cab.x + cabW / 2, cabY + 28);

    // CRT Arcade Screen with Animated Game Action
    const scrX = cab.x + 16;
    const scrY = cabY + 48;
    const scrW = cabW - 32;
    const scrH = 55;

    ctx.fillStyle = '#060212';
    ctx.fillRect(scrX, scrY, scrW, scrH);
    ctx.fillStyle = cab.screenCol;
    // Animated sprite shapes on screen
    const spriteHop = Math.sin(time * 0.01) * 8;
    ctx.fillRect(scrX + 10, scrY + 30 + spriteHop, 12, 12);
    ctx.fillRect(scrX + 38, scrY + 32, 10, 10);

    // Scanlines over CRT screen
    ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
    for (let sl = scrY; sl < scrY + scrH; sl += 4) {
      ctx.fillRect(scrX, sl, scrW, 2);
    }

    // Control Deck (Joystick & Buttons)
    const ctrlY = scrY + scrH + 10;
    ctx.fillStyle = '#0f0520';
    ctx.fillRect(cab.x + 10, ctrlY, cabW - 20, 24);
    // Red ball joystick
    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.arc(cab.x + 28, ctrlY + 8, 5, 0, Math.PI * 2);
    ctx.fill();
    // Colorful buttons
    ctx.fillStyle = '#38bdf8';
    ctx.fillRect(cab.x + 48, ctrlY + 8, 6, 6);
    ctx.fillStyle = '#facc15';
    ctx.fillRect(cab.x + 60, ctrlY + 8, 6, 6);
    ctx.fillStyle = '#4ade80';
    ctx.fillRect(cab.x + 72, ctrlY + 8, 6, 6);

    // Coin Door with blinking "INSERT COIN"
    const coinY = ctrlY + 35;
    ctx.fillStyle = '#120824';
    ctx.fillRect(cab.x + 20, coinY, cabW - 40, 42);
    const coinBlink = Math.sin(time * 0.005) > 0;
    ctx.fillStyle = coinBlink ? '#facc15' : '#713f12';
    ctx.font = 'bold 7px monospace';
    ctx.fillText('INSERT COIN', cab.x + cabW / 2, coinY + 24);
  });
}

// ======================================================================
// 32. SACRED TORII WATERFALL (Đại thác nước, Cổng Torii, Hoa anh đào)
// ======================================================================
function renderShrineWaterfall(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  petals: any[],
  time: number
) {
  const poolY = h * 0.72;

  // Dark Mountain Granite Cliffs flanking waterfall
  ctx.fillStyle = '#041620';
  ctx.fillRect(0, 0, w * 0.3, poolY);
  ctx.fillRect(w * 0.7, 0, w * 0.3, poolY);

  // MASSIVE ROARING WATERFALL (Center 40% of screen)
  const wfX = w * 0.32;
  const wfW = w * 0.36;

  // Deep crystal turquoise waterfall backdrop
  ctx.fillStyle = '#0284c7';
  ctx.fillRect(wfX, 0, wfW, poolY);

  // Animated Crystalline Cascading Water Streams
  ctx.fillStyle = '#bae6fd';
  for (let s = 0; s < 12; s++) {
    const streamX = wfX + (s * (wfW / 12));
    const streamSpeed = 12 + ((s * 7) % 8);
    const streamOffset = (time * streamSpeed * 0.08) % poolY;

    for (let y = -40; y < poolY; y += 45) {
      ctx.fillRect(streamX, y + streamOffset, 5, 25);
    }
  }

  // Waterfall Crash Foam & Rising Mist at pool surface
  ctx.fillStyle = '#ffffff';
  for (let f = 0; f < 16; f++) {
    const fx = wfX - 10 + f * (wfW / 14);
    const fy = poolY - 14 + Math.sin(time * 0.01 + f) * 8;
    ctx.fillRect(fx, fy, 16, 14);
  }

  // Turquoise Sacred Water Pool (Hồ nước ngọc bích linh thiêng)
  ctx.fillStyle = '#083344';
  ctx.fillRect(0, poolY, w, h - poolY);

  // Rippling water highlights
  ctx.fillStyle = 'rgba(6, 182, 212, 0.35)';
  for (let ry = poolY + 10; ry < h; ry += 12) {
    const rOffset = Math.sin(ry * 0.2 + time * 0.004) * 20;
    ctx.fillRect(w * 0.2 + rOffset, ry, w * 0.6, 3);
  }

  // GRAND JAPANESE VERMILION TORII GATE (Cổng Torii đỏ rực trước thác)
  const toriiX = w * 0.5;
  const toriiBaseY = poolY + 30;
  const toriiW = Math.min(w * 0.38, 320);
  const toriiH = 175;

  ctx.save();
  // Two Main Pillars (Chân cột Torii)
  ctx.fillStyle = '#dc2626';
  ctx.shadowColor = 'rgba(239, 68, 68, 0.4)';
  ctx.shadowBlur = 14;
  ctx.fillRect(toriiX - toriiW * 0.4, toriiBaseY - toriiH, 18, toriiH);
  ctx.fillRect(toriiX + toriiW * 0.4 - 18, toriiBaseY - toriiH, 18, toriiH);

  // Black stone bases (Kamebara)
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(toriiX - toriiW * 0.4 - 4, toriiBaseY - 18, 26, 18);
  ctx.fillRect(toriiX + toriiW * 0.4 - 22, toriiBaseY - 18, 26, 18);

  // Lower Crossbar (Nuki)
  ctx.fillStyle = '#b91c1c';
  ctx.fillRect(toriiX - toriiW * 0.46, toriiBaseY - toriiH + 40, toriiW * 0.92, 14);

  // Top Curved Beam (Kasagi) with black capping
  ctx.fillStyle = '#ef4444';
  ctx.fillRect(toriiX - toriiW * 0.52, toriiBaseY - toriiH, toriiW * 1.04, 18);
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(toriiX - toriiW * 0.54, toriiBaseY - toriiH - 6, toriiW * 1.08, 6);

  // Sacred Shimenawa Braided Straw Rope & Hanging White Shide
  ctx.fillStyle = '#fde047';
  ctx.fillRect(toriiX - toriiW * 0.35, toriiBaseY - toriiH + 52, toriiW * 0.7, 8);
  ctx.fillStyle = '#ffffff';
  for (let sh = 0; sh < 5; sh++) {
    const shX = toriiX - toriiW * 0.28 + sh * (toriiW * 0.14);
    ctx.fillRect(shX, toriiBaseY - toriiH + 60, 8, 18);
    ctx.fillRect(shX + 4, toriiBaseY - toriiH + 72, 8, 14);
  }
  ctx.restore();

  // Stone Toro Lanterns with warm flame on sides
  [toriiX - toriiW * 0.58, toriiX + toriiW * 0.58].forEach((lx) => {
    ctx.fillStyle = '#334155';
    ctx.fillRect(lx - 8, toriiBaseY - 50, 16, 50); // Post
    ctx.fillStyle = '#facc15'; // Candle glow
    ctx.shadowColor = '#facc15';
    ctx.shadowBlur = 16;
    ctx.fillRect(lx - 6, toriiBaseY - 65, 12, 15);
    ctx.shadowBlur = 0;
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(lx - 12, toriiBaseY - 72, 24, 7); // Roof
  });

  // Swirling Pink Cherry Blossom Petals
  petals.forEach((p) => {
    p.x += Math.sin(p.y * 0.02 + time * 0.003) * 2 - 1.2;
    p.y += 1.2;
    p.rot += 0.04;

    if (p.y > h + 10) {
      p.y = -10;
      p.x = Math.random() * w;
    }
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(p.rot);
    ctx.fillStyle = '#f472b6';
    ctx.fillRect(-p.size, -p.size / 2, p.size * 2, p.size);
    ctx.restore();
  });
}

// ======================================================================
// 33. ORBITAL SPACEPORT OVERLOOK (Khoang trạm vũ trụ, Tinh vân, Hành tinh vành đai)
// ======================================================================
function renderSpaceStation(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  stardust: any[],
  time: number
) {
  // Deep Space Starfield
  ctx.fillStyle = '#ffffff';
  for (let i = 0; i < 50; i++) {
    const sx = (i * 127) % w;
    const sy = (i * 83) % h;
    const twinkle = Math.sin(time * 0.003 + i) > 0 ? 1 : 0.4;
    ctx.fillStyle = `rgba(255, 255, 255, ${twinkle})`;
    ctx.fillRect(sx, sy, 2, 2);
  }

  // Giant Swirling Multi-color Cosmic Nebula
  const nebX = w * 0.62;
  const nebY = h * 0.42;

  ctx.save();
  const nebGrad = ctx.createRadialGradient(nebX, nebY, 30, nebX, nebY, 260);
  nebGrad.addColorStop(0, 'rgba(236, 72, 153, 0.4)');
  nebGrad.addColorStop(0.4, 'rgba(139, 92, 246, 0.3)');
  nebGrad.addColorStop(0.8, 'rgba(6, 182, 212, 0.15)');
  nebGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = nebGrad;
  ctx.beginPath();
  ctx.arc(nebX, nebY, 260, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // Majestic Ringed Gas Giant Planet (Hành tinh có vành đai sao)
  const pX = w * 0.28;
  const pY = h * 0.38;
  const pRadius = 48;

  // Planet body
  ctx.fillStyle = '#3b82f6';
  ctx.beginPath();
  ctx.arc(pX, pY, pRadius, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#60a5fa'; // Atmospheric stripe
  ctx.fillRect(pX - pRadius, pY - 8, pRadius * 2, 16);

  // Tilted Planetary Rings (Vành đai sao)
  ctx.save();
  ctx.translate(pX, pY);
  ctx.rotate(-0.4);
  ctx.strokeStyle = 'rgba(254, 240, 138, 0.7)';
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.ellipse(0, 0, 95, 18, 0, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();

  // Passing Exploratory Shuttle Craft
  const sX = ((time * 0.08) % (w + 200)) - 100;
  const sY = h * 0.6 + Math.sin(time * 0.002) * 20;
  ctx.fillStyle = '#f8fafc';
  ctx.beginPath();
  ctx.moveTo(sX + 24, sY);
  ctx.lineTo(sX, sY - 8);
  ctx.lineTo(sX, sY + 8);
  ctx.closePath();
  ctx.fill();
  // Cyan plasma ion thruster engine trail
  ctx.fillStyle = 'rgba(6, 182, 212, 0.6)';
  ctx.fillRect(sX - 35, sY - 2, 35, 4);

  // PANORAMIC SPACE OBSERVATION DECK COCKPIT (Khung kính trạm vũ trụ)
  ctx.fillStyle = '#0f172a';
  // Outer metallic hull borders
  ctx.fillRect(0, 0, w, 28);
  ctx.fillRect(0, h - 75, w, 75);
  ctx.fillRect(0, 0, 35, h);
  ctx.fillRect(w - 35, 0, 35, h);

  // Diagonal support struts
  ctx.strokeStyle = '#334155';
  ctx.lineWidth = 14;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(w * 0.15, 120);
  ctx.lineTo(w * 0.15, h - 75);
  ctx.moveTo(w, 0);
  ctx.lineTo(w * 0.85, 120);
  ctx.lineTo(w * 0.85, h - 75);
  ctx.stroke();

  // Sci-Fi Holographic Orbit Navigation HUD
  const hudX = w * 0.5;
  const hudY = h - 38;
  ctx.save();
  ctx.strokeStyle = '#8b5cf6';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(hudX, hudY, 26, 0, Math.PI * 2);
  ctx.stroke();
  // Spinning radar sweep line
  const sweepAngle = time * 0.003;
  ctx.beginPath();
  ctx.moveTo(hudX, hudY);
  ctx.lineTo(hudX + Math.cos(sweepAngle) * 24, hudY + Math.sin(sweepAngle) * 24);
  ctx.stroke();
  ctx.restore();

  // Control console blinking status LED buttons
  for (let b = 0; b < 10; b++) {
    const bx = w * 0.18 + b * 22;
    const bColor = (b + Math.floor(time * 0.003)) % 3 === 0 ? '#22c55e' : '#f97316';
    ctx.fillStyle = bColor;
    ctx.fillRect(bx, h - 45, 8, 8);
  }
}

// ======================================================================
// 34. BIOLUMINESCENT WHALE DEEP (Thủy cung, Cá voi khổng lồ phát sáng)
// ======================================================================
function renderDeepAquarium(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  fishes: any[],
  time: number
) {
  // Volumetric Sunbeams piercing through ocean depths
  ctx.fillStyle = 'rgba(6, 182, 212, 0.07)';
  for (let r = 0; r < 5; r++) {
    const rx = w * 0.15 + r * (w * 0.18);
    ctx.beginPath();
    ctx.moveTo(rx, 0);
    ctx.lineTo(rx + 80, h);
    ctx.lineTo(rx + 140, h);
    ctx.lineTo(rx + 40, 0);
    ctx.closePath();
    ctx.fill();
  }

  // COLOSSAL CELESTIAL BLUE WHALE (Cá voi khổng lồ phát sáng lướt qua)
  const whaleX = ((time * 0.04) % (w + 500)) - 250;
  const whaleY = h * 0.42 + Math.sin(time * 0.0015) * 25;
  const whaleLen = 220;

  ctx.save();
  // Whale Body (Dark blue silhouette with cyan bioluminescent belly)
  ctx.fillStyle = '#03264c';
  ctx.beginPath();
  ctx.ellipse(whaleX, whaleY, whaleLen * 0.5, 42, 0, 0, Math.PI * 2);
  ctx.fill();

  // Massive Tail Fluke swaying
  const tailSway = Math.sin(time * 0.003) * 16;
  ctx.fillStyle = '#021e3d';
  ctx.beginPath();
  ctx.moveTo(whaleX - whaleLen * 0.48, whaleY);
  ctx.lineTo(whaleX - whaleLen * 0.65, whaleY - 28 + tailSway);
  ctx.lineTo(whaleX - whaleLen * 0.65, whaleY + 28 + tailSway);
  ctx.closePath();
  ctx.fill();

  // Pectoral Fin undulating
  const finSway = Math.cos(time * 0.002) * 14;
  ctx.fillStyle = '#0284c7';
  ctx.beginPath();
  ctx.moveTo(whaleX + 20, whaleY + 10);
  ctx.lineTo(whaleX - 35, whaleY + 55 + finSway);
  ctx.lineTo(whaleX - 10, whaleY + 15);
  ctx.closePath();
  ctx.fill();

  // Glowing Constellation Bioluminescent Star-dots along whale spine
  ctx.fillStyle = '#2dd4bf';
  ctx.shadowColor = '#2dd4bf';
  ctx.shadowBlur = 12;
  for (let s = 0; s < 9; s++) {
    const dotX = whaleX - 70 + s * 22;
    const dotY = whaleY - 14 + Math.sin(s * 0.8) * 8;
    ctx.fillRect(dotX, dotY, 4, 4);
  }
  ctx.restore();

  // Translucent Bioluminescent Jellyfish pulsing upwards
  for (let j = 0; j < 4; j++) {
    const jX = w * 0.18 + j * (w * 0.24);
    const jPulse = Math.sin(time * 0.004 + j) * 8;
    const jY = (h * 0.8 - ((time * 0.03 + j * 120) % (h * 0.85))) + jPulse;

    ctx.save();
    ctx.fillStyle = 'rgba(45, 212, 191, 0.45)';
    ctx.shadowColor = '#2dd4bf';
    ctx.shadowBlur = 14;
    // Jellyfish bell dome
    ctx.beginPath();
    ctx.arc(jX, jY, 18, Math.PI, 0);
    ctx.closePath();
    ctx.fill();
    ctx.shadowBlur = 0;

    // Trailing tentacles
    ctx.strokeStyle = 'rgba(45, 212, 191, 0.35)';
    ctx.lineWidth = 1.5;
    for (let t = -10; t <= 10; t += 5) {
      ctx.beginPath();
      ctx.moveTo(jX + t, jY);
      ctx.quadraticCurveTo(jX + t + Math.sin(time * 0.005 + t) * 6, jY + 15, jX + t, jY + 30);
      ctx.stroke();
    }
    ctx.restore();
  }

  // Sea floor with glowing neon coral fans
  ctx.fillStyle = '#011024';
  ctx.fillRect(0, h - 45, w, 45);

  ctx.fillStyle = '#06b6d4';
  ctx.shadowColor = '#06b6d4';
  ctx.shadowBlur = 14;
  for (let c = 25; c < w; c += 80) {
    ctx.fillRect(c, h - 35, 8, 35);
    ctx.fillRect(c - 10, h - 28, 28, 6);
  }
  ctx.shadowBlur = 0;

  // Swimming schools of fish
  fishes.forEach((f) => {
    f.x += f.speed * 1.2;
    if (f.x > w + 30) f.x = -30;
    ctx.fillStyle = '#38bdf8';
    ctx.fillRect(f.x, f.y, f.size, 3);
  });
}
