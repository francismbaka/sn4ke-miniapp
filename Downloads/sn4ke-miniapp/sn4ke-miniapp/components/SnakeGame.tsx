"use client";

import { useEffect, useRef, useCallback } from "react";

const COLS = 19;
const ROWS = 19;

type Pos = { x: number; y: number };
type Dir = { x: number; y: number };
type Particle = { x: number; y: number; vx: number; vy: number; life: number; color: string; sz: number };

interface SnakeGameProps {
  onGameOver: (score: number) => void;
  onScoreUpdate: (score: number, level: number) => void;
  running: boolean;
}

export function SnakeGame({ onGameOver, onScoreUpdate, running }: SnakeGameProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stateRef = useRef({
    snake: [{ x: 9, y: 9 }, { x: 8, y: 9 }, { x: 7, y: 9 }] as Pos[],
    dir: { x: 1, y: 0 } as Dir,
    nextDir: { x: 1, y: 0 } as Dir,
    food: { x: 14, y: 9 } as Pos,
    score: 0,
    level: 1,
    particles: [] as Particle[],
    loop: null as ReturnType<typeof setInterval> | null,
    alive: true,
  });

  const getCtx = () => canvasRef.current?.getContext("2d") ?? null;

  const drawGrid = useCallback((ctx: CanvasRenderingContext2D, W: number, H: number) => {
    const CELL = W / COLS;
    ctx.fillStyle = "#060610";
    ctx.fillRect(0, 0, W, H);
    ctx.strokeStyle = "#0c0c1e";
    ctx.lineWidth = 0.5;
    for (let x = 0; x <= COLS; x++) { ctx.beginPath(); ctx.moveTo(x * CELL, 0); ctx.lineTo(x * CELL, H); ctx.stroke(); }
    for (let y = 0; y <= ROWS; y++) { ctx.beginPath(); ctx.moveTo(0, y * CELL); ctx.lineTo(W, y * CELL); ctx.stroke(); }
  }, []);

  const drawSnake = useCallback((ctx: CanvasRenderingContext2D, CELL: number) => {
    const { snake, dir } = stateRef.current;
    snake.forEach((seg, i) => {
      const x = seg.x * CELL, y = seg.y * CELL, sz = CELL - 2;
      if (i === 0) {
        ctx.shadowColor = "#00ff41"; ctx.shadowBlur = 14;
        ctx.fillStyle = "#00ff41"; ctx.fillRect(x + 1, y + 1, sz, sz);
        ctx.shadowBlur = 0; ctx.fillStyle = "#060610";
        const e = 3;
        if (dir.x === 1)       { ctx.fillRect(x+sz-4, y+4, e, e); ctx.fillRect(x+sz-4, y+sz-7, e, e); }
        else if (dir.x === -1) { ctx.fillRect(x+2, y+4, e, e);    ctx.fillRect(x+2, y+sz-7, e, e); }
        else if (dir.y === -1) { ctx.fillRect(x+4, y+2, e, e);    ctx.fillRect(x+sz-7, y+2, e, e); }
        else                   { ctx.fillRect(x+4, y+sz-4, e, e); ctx.fillRect(x+sz-7, y+sz-4, e, e); }
      } else {
        const g = Math.floor(140 + (1 - i / snake.length) * 115);
        ctx.shadowColor = `rgb(0,${g},45)`; ctx.shadowBlur = 4;
        ctx.fillStyle = `rgb(0,${g},45)`; ctx.fillRect(x + 2, y + 2, sz - 2, sz - 2);
        if (i % 2 === 0) { ctx.shadowBlur = 0; ctx.fillStyle = "rgba(0,0,0,0.18)"; ctx.fillRect(x + 4, y + 4, sz - 6, sz - 6); }
      }
      ctx.shadowBlur = 0;
    });
  }, []);

  const drawFood = useCallback((ctx: CanvasRenderingContext2D, CELL: number) => {
    const { food } = stateRef.current;
    const x = food.x * CELL + CELL / 2, y = food.y * CELL + CELL / 2;
    const pulse = 1 + Math.sin(Date.now() / 360) * 0.18;
    ctx.shadowColor = "rgba(255,45,85,0.5)"; ctx.shadowBlur = 18;
    ctx.fillStyle = "#ff2d55"; ctx.beginPath();
    ctx.arc(x, y, (CELL / 2 - 3) * pulse, 0, Math.PI * 2); ctx.fill();
    ctx.shadowBlur = 0; ctx.fillStyle = "rgba(255,255,255,0.5)";
    ctx.fillRect(x - 2, y - 5, 4, 4); ctx.fillRect(x + 2, y - 2, 2, 2);
  }, []);

  const updateParticles = useCallback((ctx: CanvasRenderingContext2D) => {
    const s = stateRef.current;
    s.particles = s.particles.filter(p => p.life > 0);
    s.particles.forEach(p => {
      p.x += p.vx; p.y += p.vy; p.vy += 0.12; p.life -= 0.05;
      ctx.globalAlpha = p.life; ctx.fillStyle = p.color;
      ctx.shadowColor = p.color; ctx.shadowBlur = 6;
      ctx.fillRect(p.x, p.y, p.sz, p.sz);
    });
    ctx.globalAlpha = 1; ctx.shadowBlur = 0;
  }, []);

  const render = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = getCtx();
    if (!ctx) return;
    const CELL = canvas.width / COLS;
    drawGrid(ctx, canvas.width, canvas.height);
    drawFood(ctx, CELL);
    drawSnake(ctx, CELL);
    updateParticles(ctx);
  }, [drawGrid, drawFood, drawSnake, updateParticles]);

  const placeFood = useCallback(() => {
    const s = stateRef.current;
    let pos: Pos;
    do { pos = { x: Math.floor(Math.random() * COLS), y: Math.floor(Math.random() * ROWS) }; }
    while (s.snake.some(seg => seg.x === pos.x && seg.y === pos.y));
    s.food = pos;
  }, []);

  const spawnParticles = useCallback((fx: number, fy: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const CELL = canvas.width / COLS;
    const s = stateRef.current;
    for (let i = 0; i < 12; i++) {
      const a = Math.random() * Math.PI * 2, sp = 1.5 + Math.random() * 3.5;
      s.particles.push({
        x: fx * CELL + CELL / 2, y: fy * CELL + CELL / 2,
        vx: Math.cos(a) * sp, vy: Math.sin(a) * sp,
        life: 1, color: Math.random() > 0.5 ? "#ff2d55" : "#ffd700",
        sz: 2 + Math.random() * 3,
      });
    }
  }, []);

  const getSpeed = (level: number) => Math.max(75, 200 - (level - 1) * 15);

  const doGameOver = useCallback(() => {
    const s = stateRef.current;
    if (!s.alive) return;
    s.alive = false;
    if (s.loop) clearInterval(s.loop);

    // flash
    const ctx = getCtx();
    let f = 0;
    const fl = setInterval(() => {
      const canvas = canvasRef.current;
      if (ctx && canvas) {
        ctx.fillStyle = `rgba(255,45,85,${f % 2 === 0 ? 0.25 : 0})`;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
      if (++f >= 6) { clearInterval(fl); onGameOver(s.score); }
    }, 80);
  }, [onGameOver]);

  const tick = useCallback(() => {
    const s = stateRef.current;
    if (!s.alive) return;
    s.dir = s.nextDir;
    const head: Pos = { x: s.snake[0].x + s.dir.x, y: s.snake[0].y + s.dir.y };

    if (head.x < 0 || head.x >= COLS || head.y < 0 || head.y >= ROWS) return doGameOver();
    if (s.snake.some(seg => seg.x === head.x && seg.y === head.y)) return doGameOver();

    s.snake.unshift(head);
    if (head.x === s.food.x && head.y === s.food.y) {
      s.score += 10 * s.level;
      spawnParticles(s.food.x, s.food.y);
      placeFood();

      const newLevel = Math.floor(s.score / 100) + 1;
      if (newLevel > s.level) {
        s.level = newLevel;
        if (s.loop) clearInterval(s.loop);
        s.loop = setInterval(tick, getSpeed(s.level));
      }
      onScoreUpdate(s.score, s.level);
    } else {
      s.snake.pop();
    }
    render();
  }, [doGameOver, spawnParticles, placeFood, onScoreUpdate, render]);

  // Start / restart
  useEffect(() => {
    if (!running) return;
    const s = stateRef.current;
    s.snake = [{ x: 9, y: 9 }, { x: 8, y: 9 }, { x: 7, y: 9 }];
    s.dir = { x: 1, y: 0 }; s.nextDir = { x: 1, y: 0 };
    s.score = 0; s.level = 1; s.particles = []; s.alive = true;
    placeFood();
    if (s.loop) clearInterval(s.loop);
    s.loop = setInterval(tick, getSpeed(1));
    return () => { if (s.loop) clearInterval(s.loop); };
  }, [running, placeFood, tick]);

  // Idle food pulse when not running
  useEffect(() => {
    if (running) return;
    const id = setInterval(() => {
      const canvas = canvasRef.current;
      const ctx = getCtx();
      if (!ctx || !canvas) return;
      const CELL = canvas.width / COLS;
      drawGrid(ctx, canvas.width, canvas.height);
      drawFood(ctx, CELL);
    }, 50);
    return () => clearInterval(id);
  }, [running, drawGrid, drawFood]);

  // Keyboard controls — attached to window, relayed via ref
  useEffect(() => {
    const dirs: Record<string, Dir> = {
      ArrowUp: {x:0,y:-1}, ArrowDown: {x:0,y:1}, ArrowLeft: {x:-1,y:0}, ArrowRight: {x:1,y:0},
      w:{x:0,y:-1}, s:{x:0,y:1}, a:{x:-1,y:0}, d:{x:1,y:0},
      W:{x:0,y:-1}, S:{x:0,y:1}, A:{x:-1,y:0}, D:{x:1,y:0},
    };
    const handler = (e: KeyboardEvent) => {
      const nd = dirs[e.key];
      if (nd) {
        const s = stateRef.current;
        if (nd.x !== -s.dir.x || nd.y !== -s.dir.y) s.nextDir = nd;
        e.preventDefault();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  return (
    <canvas
      ref={canvasRef}
      width={380}
      height={380}
      style={{ display: "block", imageRendering: "pixelated", touchAction: "none" }}
    />
  );
}
