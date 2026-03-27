import React, { useEffect, useRef } from "react";

export default function PCBBackground() {
  const canvasRef = useRef(null);
  const wrapRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    const ctx = canvas.getContext("2d");

    let W, H, cx, cy;
    let rafId;
    const GRID = 28;

    function resize() {
      W = canvas.width = wrap.clientWidth;
      H = canvas.height = wrap.clientHeight;
      cx = W / 2;
      cy = H / 2;
      buildTraces();
      buildVias();
      buildBGA();
    }

    /* ── Traces ── */
    let traces = [];
    function buildTraces() {
      traces = [];
      const dirs = [[1,0],[0,1],[-1,0],[0,-1]];
      for (let i = 0; i < 220; i++) {
        const angle = Math.random() * Math.PI * 2;
        const sx = cx + Math.cos(angle) * (30 + Math.random() * 60);
        const sy = cy + Math.sin(angle) * (30 + Math.random() * 60);
        const segs = [];
        let x = Math.round(sx / GRID) * GRID;
        let y = Math.round(sy / GRID) * GRID;
        segs.push({ x, y });
        const steps = 2 + Math.floor(Math.random() * 5);
        for (let s = 0; s < steps; s++) {
          const d = dirs[Math.floor(Math.random() * 4)];
          const len = (1 + Math.floor(Math.random() * 6)) * GRID;
          x += d[0] * len;
          y += d[1] * len;
          segs.push({ x, y });
        }
        traces.push({
          segs,
          phase: Math.random() * Math.PI * 2,
          speed: 0.3 + Math.random() * 1.2,
          bright: 0.15 + Math.random() * 0.45,
          width: 0.8 + Math.random() * 1.2,
          isGold: Math.random() < 0.04,
        });
      }
    }

    /* ── Vias ── */
    let vias = [];
    function buildVias() {
      vias = [];
      for (let i = 0; i < 80; i++) {
        const angle = Math.random() * Math.PI * 2;
        const r = 60 + Math.random() * Math.max(W, H) * 0.5;
        vias.push({
          x: cx + Math.cos(angle) * r,
          y: cy + Math.sin(angle) * r,
          phase: Math.random() * Math.PI * 2,
          speed: 0.5 + Math.random() * 1.5,
        });
      }
    }

    /* ── BGA solder balls ── */
    let bgaBalls = [];
    function buildBGA() {
      bgaBalls = [];
      const cols = 14, rows = 14, spacing = 18;
      const startX = cx - ((cols - 1) * spacing) / 2;
      const startY = cy - ((rows - 1) * spacing) / 2;
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const dx = c - (cols - 1) / 2;
          const dy = r - (rows - 1) / 2;
          const d = Math.sqrt(dx * dx + dy * dy);
          bgaBalls.push({
            x: startX + c * spacing,
            y: startY + r * spacing,
            phase: Math.random() * Math.PI * 2,
            speed: 0.8 + Math.random() * 1.6,
            isCPU: d < 2.5,
          });
        }
      }
    }

    /* ── roundRect helper ── */
    function roundRect(x, y, w, h, r) {
      ctx.beginPath();
      ctx.moveTo(x + r, y);
      ctx.lineTo(x + w - r, y);
      ctx.quadraticCurveTo(x + w, y, x + w, y + r);
      ctx.lineTo(x + w, y + h - r);
      ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
      ctx.lineTo(x + r, y + h);
      ctx.quadraticCurveTo(x, y + h, x, y + h - r);
      ctx.lineTo(x, y + r);
      ctx.quadraticCurveTo(x, y, x + r, y);
      ctx.closePath();
    }

    /* ── Draw fns ── */
    function drawBackground() {
      ctx.fillStyle = "#020713";
      ctx.fillRect(0, 0, W, H);
      const grd = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.max(W, H) * 0.7);
      grd.addColorStop(0, "rgba(15,32,68,0.85)");
      grd.addColorStop(0.4, "rgba(8,18,40,0.6)");
      grd.addColorStop(1, "rgba(2,7,19,0)");
      ctx.fillStyle = grd;
      ctx.fillRect(0, 0, W, H);
    }

    function drawTraces(now) {
      traces.forEach((tr) => {
        const pulse = 0.5 + 0.5 * Math.sin(now * tr.speed + tr.phase);
        const alpha = tr.bright * (0.4 + 0.8 * pulse);
        const baseColor = tr.isGold ? "rgba(245,197,24," : "rgba(59,139,212,";
        const glowColor = tr.isGold ? "rgba(245,197,24," : "rgba(96,168,232,";

        ctx.beginPath();
        ctx.moveTo(tr.segs[0].x, tr.segs[0].y);
        for (let i = 1; i < tr.segs.length; i++) ctx.lineTo(tr.segs[i].x, tr.segs[i].y);
        ctx.strokeStyle = `${baseColor}${alpha.toFixed(3)})`;
        ctx.lineWidth = tr.width;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        ctx.stroke();

        if (pulse > 0.6) {
          ctx.beginPath();
          ctx.moveTo(tr.segs[0].x, tr.segs[0].y);
          for (let i = 1; i < tr.segs.length; i++) ctx.lineTo(tr.segs[i].x, tr.segs[i].y);
          ctx.strokeStyle = `${glowColor}${(alpha * 0.25).toFixed(3)})`;
          ctx.lineWidth = tr.width + 4;
          ctx.stroke();
        }

        tr.segs.forEach((pt) => {
          ctx.beginPath();
          ctx.arc(pt.x, pt.y, 2.5, 0, Math.PI * 2);
          ctx.fillStyle = `${baseColor}${(alpha * 0.9).toFixed(3)})`;
          ctx.fill();
        });
      });
    }

    function drawVias(now) {
      vias.forEach((v) => {
        const p = 0.5 + 0.5 * Math.sin(now * v.speed + v.phase);
        const a = 0.12 + 0.5 * p;
        ctx.beginPath();
        ctx.arc(v.x, v.y, 4, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(100,180,255,${a.toFixed(3)})`;
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(v.x, v.y, 1.5, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(100,180,255,${(a * 1.5).toFixed(3)})`;
        ctx.fill();
      });
    }

    function drawCPUPackage(now) {
      const size = 252, hs = size / 2;
      const glowPulse = 0.5 + 0.5 * Math.sin(now * 0.6);

      /* Ambient bloom */
      const bloom = ctx.createRadialGradient(cx, cy, 20, cx, cy, hs * 1.4);
      bloom.addColorStop(0, `rgba(59,139,212,${(0.08 + 0.06 * glowPulse).toFixed(3)})`);
      bloom.addColorStop(0.5, `rgba(30,80,160,${(0.05 + 0.04 * glowPulse).toFixed(3)})`);
      bloom.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = bloom;
      ctx.beginPath();
      ctx.arc(cx, cy, hs * 1.6, 0, Math.PI * 2);
      ctx.fill();

      /* Package body */
      ctx.fillStyle = "#060E20";
      ctx.strokeStyle = `rgba(59,139,212,${(0.35 + 0.2 * glowPulse).toFixed(3)})`;
      ctx.lineWidth = 1.5;
      roundRect(cx - hs, cy - hs, size, size, 6);
      ctx.fill();
      ctx.stroke();

      /* Inner border */
      ctx.strokeStyle = `rgba(59,139,212,${(0.12 + 0.08 * glowPulse).toFixed(3)})`;
      ctx.lineWidth = 0.5;
      roundRect(cx - hs + 6, cy - hs + 6, size - 12, size - 12, 4);
      ctx.stroke();

      /* BGA balls */
      bgaBalls.forEach((b) => {
        if (b.isCPU) return;
        const p = 0.5 + 0.5 * Math.sin(now * b.speed + b.phase);
        const a = 0.35 + 0.55 * p;
        ctx.beginPath();
        ctx.arc(b.x, b.y, 3.8, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(59,139,212,${(a * 0.25).toFixed(3)})`;
        ctx.fill();
        ctx.strokeStyle = `rgba(96,168,232,${a.toFixed(3)})`;
        ctx.lineWidth = 0.8;
        ctx.stroke();
        if (p > 0.65) {
          ctx.beginPath();
          ctx.arc(b.x, b.y, 6.8, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(96,168,232,${((p - 0.65) * 0.5).toFixed(3)})`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      });

      /* Silicon die */
      const dieW = 88, dieH = 60;
      ctx.fillStyle = "#0A0F1E";
      ctx.strokeStyle = "rgba(40,100,180,0.5)";
      ctx.lineWidth = 1;
      roundRect(cx - dieW / 2, cy - dieH / 2, dieW, dieH, 3);
      ctx.fill();
      ctx.stroke();

      /* Die grid */
      const dieGrid = 8;
      ctx.strokeStyle = "rgba(59,139,212,0.08)";
      ctx.lineWidth = 0.4;
      for (let dx = -dieW / 2; dx < dieW / 2; dx += dieGrid) {
        ctx.beginPath();
        ctx.moveTo(cx + dx, cy - dieH / 2);
        ctx.lineTo(cx + dx, cy + dieH / 2);
        ctx.stroke();
      }
      for (let dy = -dieH / 2; dy < dieH / 2; dy += dieGrid) {
        ctx.beginPath();
        ctx.moveTo(cx - dieW / 2, cy + dy);
        ctx.lineTo(cx + dieW / 2, cy + dy);
        ctx.stroke();
      }

      /* Die contact bumps */
      for (let dc = -3; dc <= 3; dc++) {
        for (let dr = -2; dr <= 2; dr++) {
          const p = 0.5 + 0.5 * Math.sin(now * 1.2 + dc * 0.7 + dr * 0.9);
          ctx.beginPath();
          ctx.arc(cx + dc * 11, cy + dr * 11, 2, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(59,139,212,${(0.2 + 0.5 * p).toFixed(3)})`;
          ctx.fill();
        }
      }

      /* Gold corner alignment marks */
      [
        [cx - hs + 12, cy - hs + 12],
        [cx + hs - 12, cy - hs + 12],
        [cx + hs - 12, cy + hs - 12],
        [cx - hs + 12, cy + hs - 12],
      ].forEach(([x, y]) => {
        const cp = 0.5 + 0.5 * Math.sin(now * 0.9 + x * 0.01);
        ctx.beginPath();
        ctx.arc(x, y, 5, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(245,197,24,${(0.3 + 0.5 * cp).toFixed(3)})`;
        ctx.fill();
        ctx.beginPath();
        ctx.arc(x, y, 8, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(245,197,24,${(0.1 + 0.2 * cp).toFixed(3)})`;
        ctx.lineWidth = 0.8;
        ctx.stroke();
      });
    }

    function drawScanLine(now) {
      const scanY = cy - 160 + ((now * 40) % 320);
      const grad = ctx.createLinearGradient(0, scanY - 6, 0, scanY + 6);
      grad.addColorStop(0, "rgba(59,139,212,0)");
      grad.addColorStop(0.5, "rgba(59,139,212,0.06)");
      grad.addColorStop(1, "rgba(59,139,212,0)");
      ctx.fillStyle = grad;
      ctx.fillRect(cx - 126, scanY - 6, 252, 12);
    }

    function drawVignette() {
      const grd = ctx.createRadialGradient(cx, cy, 80, cx, cy, Math.max(W, H) * 0.7);
      grd.addColorStop(0, "rgba(2,7,19,0)");
      grd.addColorStop(0.6, "rgba(2,7,19,0.2)");
      grd.addColorStop(1, "rgba(2,7,19,0.85)");
      ctx.fillStyle = grd;
      ctx.fillRect(0, 0, W, H);
    }

    function frame(ts) {
      const now = ts / 1000;
      drawBackground();
      drawTraces(now);
      drawVias(now);
      drawCPUPackage(now);
      drawScanLine(now);
      drawVignette();
      rafId = requestAnimationFrame(frame);
    }

    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(wrap);
    rafId = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(rafId);
      ro.disconnect();
    };
  }, []);

  return (
    <div
      ref={wrapRef}
      style={{
        position: "absolute",
        inset: 0,
        pointerEvents: "none",
        zIndex: 0,
        opacity: 0.35, // lower this more if still bright (ex: 0.25)
      }}
    >
      <canvas ref={canvasRef} style={{ width: "100%", height: "100%", display: "block" }} />
    </div>
  );
}
