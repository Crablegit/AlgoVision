import React, { useEffect, useRef } from 'react';

interface Petal {
  x: number;
  y: number;
  size: number;
  speedX: number;
  speedY: number;
  rotation: number;
  rotSpeed: number;
  color: string;
}

export const SakuraCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    // Bảng màu cánh hoa anh đào pixel
    const colors = ['#ffb7c5', '#ff94b1', '#ffa8c0', '#ffd1dc', '#ff7597'];

    // Khởi tạo các cánh hoa pixel
    const petalCount = Math.min(Math.floor(width / 35), 45);
    const petals: Petal[] = Array.from({ length: petalCount }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      size: Math.floor(Math.random() * 4) + 4, // 4px - 7px pixel size
      speedX: (Math.random() - 0.2) * 1.2,
      speedY: Math.random() * 1.2 + 0.8,
      rotation: Math.random() * Math.PI * 2,
      rotSpeed: (Math.random() - 0.5) * 0.03,
      color: colors[Math.floor(Math.random() * colors.length)]
    }));

    // Vòng lặp vẽ pixel sakura
    const render = () => {
      ctx.clearRect(0, 0, width, height);

      for (let i = 0; i < petals.length; i++) {
        const p = petals[i];
        p.x += p.speedX;
        p.y += p.speedY;
        p.rotation += p.rotSpeed;

        // Loop lại khi rơi khỏi màn hình
        if (p.y > height + 10) {
          p.y = -10;
          p.x = Math.random() * width;
        }
        if (p.x > width + 10) {
          p.x = -10;
        } else if (p.x < -10) {
          p.x = width + 10;
        }

        // Vẽ cánh hoa theo phong cách Pixel Art
        ctx.save();
        ctx.translate(Math.floor(p.x), Math.floor(p.y));
        ctx.rotate(p.rotation);
        ctx.fillStyle = p.color;

        const s = p.size;
        // Hình cánh hoa 8-bit dạng pixel blocks
        ctx.fillRect(-s, -s / 2, s * 1.6, s);
        ctx.fillRect(-s / 2, -s, s, s * 1.8);
        ctx.fillStyle = '#ffffff88';
        ctx.fillRect(-s / 4, -s / 4, s / 2, s / 2); // Highlight tâm hoa

        ctx.restore();
      }

      animationId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0 opacity-70"
    />
  );
};
