import React, { useEffect, useMemo, useRef, useState } from "react";

/* ===== SVGs nítidos ===== */
const SvgX = () => (
  <svg viewBox="0 0 120 120" aria-label="X" role="img">
    <defs>
      <linearGradient id="gx" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#ff6b6b" />
        <stop offset="100%" stopColor="#f43f5e" />
      </linearGradient>
      <filter id="sx" x="-30%" y="-30%" width="160%" height="160%">
        <feDropShadow
          dx="0"
          dy="2"
          stdDeviation="2"
          floodColor="#f43f5e"
          floodOpacity="0.45"
        />
      </filter>
    </defs>
    <path
      d="M25 25 L95 95 M95 25 L25 95"
      stroke="url(#gx)"
      strokeWidth="14"
      strokeLinecap="round"
      filter="url(#sx)"
    />
  </svg>
);

const SvgO = () => (
  <svg viewBox="0 0 120 120" aria-label="O" role="img">
    <defs>
      <linearGradient id="go" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#60a5fa" />
        <stop offset="100%" stopColor="#22d3ee" />
      </linearGradient>
      <filter id="so" x="-30%" y="-30%" width="160%" height="160%">
        <feDropShadow
          dx="0"
          dy="2"
          stdDeviation="2"
          floodColor="#60a5fa"
          floodOpacity="0.45"
        />
      </filter>
    </defs>
    <circle
      cx="60"
      cy="60"
      r="36"
      fill="none"
      stroke="url(#go)"
      strokeWidth="14"
      filter="url(#so)"
    />
  </svg>
);

/* ===== Lógica 3×3 ===== */
const LINES = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
];

function calculateWinner(sq) {
  for (const line of LINES) {
    const [a, b, c] = line;
    if (sq[a] && sq[a] === sq[b] && sq[a] === sq[c]) return { player: sq[a], line };
  }
  return null;
}

/* ===== Confetti ===== */
function Confetti({ fire, onDone }) {
  const ref = useRef(null);

  useEffect(() => {
    if (!fire) return;
    const root = ref.current;
    if (!root) return;

    const COLORS = ["#60a5fa", "#22d3ee", "#f472b6", "#f59e0b", "#22c55e", "#ef4444"];
    const COUNT = 120;

    for (let i = 0; i < COUNT; i++) {
      const p = document.createElement("div");
      p.className = "p";
      p.style.left = Math.random() * 100 + "vw";
      p.style.background = COLORS[Math.floor(Math.random() * COLORS.length)];
      p.style.animationDuration = 1.7 + Math.random() * 1.5 + "s";
      p.style.animationDelay = Math.random() * 0.35 + "s";
      p.style.transform = `translateY(-10px) rotate(${Math.random() * 360}deg)`;
      root.appendChild(p);
    }

    const t = setTimeout(() => {
      root.innerHTML = "";
      onDone?.();
    }, 3000);

    return () => {
      clearTimeout(t);
      if (root) root.innerHTML = "";
    };
  }, [fire, onDone]);

  return <div className="confetti" ref={ref} aria-hidden="true" />;
}

/* ===== Modal Modo Alan ===== */
function AlanModal({ open, onClose }) {
  if (!open) return null;
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h2>🎉 Modo Alan</h2>
        <p><strong>Nombre:</strong> Alan Flores Denegri</p>
        <p><strong>Matrícula:</strong> 67108</p>
        <p className="tip">Tip: usa las flechas (↑ ↑ ↓ ↓ ← → ← →)</p>

        <div className="actions">
          <button onClick={onClose}>Cerrar</button>
        </div>
      </div>
    </div>
  );
}

/* ===== Casilla ===== */
function Square({ value, onClick, highlight, renderMode }) {
  const base = import.meta.env.BASE_URL || "/";
  const xSrc = `${base}x.png`;
  const oSrc = `${base}o.png`;

  return (
    <button
      className={`square ${highlight ? "win" : ""}`}
      onClick={onClick}
      aria-label="square"
    >
      {value === "X" ? (
        renderMode === "img" ? (
          <img src={xSrc} alt="X" />
        ) : renderMode === "emoji" ? (
          "❌"
        ) : (
          <SvgX />
        )
      ) : value === "O" ? (
        renderMode === "img" ? (
          <img src={oSrc} alt="O" />
        ) : renderMode === "emoji" ? (
          "⭕️"
        ) : (
          <SvgO />
        )
      ) : null}
    </button>
  );
}

/* ===== APP PRINCIPAL ===== */
export default function App() {
  const [history, setHistory] = useState([Array(9).fill(null)]);
  const [step, setStep] = useState(0);
  const [renderMode, setRenderMode] = useState("svg");
  const [alanMode, setAlanMode] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [fireConfetti, setFireConfetti] = useState(false);

  const xIsNext = step % 2 === 0;
  const squares = history[step];
  const winnerInfo = useMemo(() => calculateWinner(squares), [squares]);
  const winner = winnerInfo?.player ?? null;
  const highlightSet = new Set(winnerInfo?.line ?? []);

  const status = winner
    ? `Ganó ${winner === "X" ? "❌" : "⭕️"}`
    : squares.every(Boolean)
    ? "Empate 🤝"
    : `Turno: ${xIsNext ? "❌" : "⭕️"}`;

  function handlePlay(nextSquares) {
    const next = history.slice(0, step + 1).concat([nextSquares]);
    setHistory(next);
    setStep(next.length - 1);
  }

  function handleClick(i) {
    if (squares[i] || winner) return;
    const next = squares.slice();
    next[i] = xIsNext ? "X" : "O";
    handlePlay(next);
  }

  function jumpTo(move) {
    setStep(move);
  }

  function reset() {
    setHistory([Array(9).fill(null)]);
    setStep(0);
  }

  /* === Konami solo flechas === */
  useEffect(() => {
    const seq = [
      "ArrowUp", "ArrowUp",
      "ArrowDown", "ArrowDown",
      "ArrowLeft", "ArrowRight",
      "ArrowLeft", "ArrowRight"
    ];

    let idx = 0;

    const onKey = (e) => {
      if (e.key === seq[idx]) {
        idx++;
        if (idx === seq.length) {
          setAlanMode(true);
          setShowModal(true);
          idx = 0;
        }
      } else {
        idx = 0;
      }
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (alanMode && winner) setFireConfetti(true);
  }, [alanMode, winner]);

  useEffect(() => {
    if (!showModal) return;
    const t = setTimeout(() => setShowModal(false), 2200);
    return () => clearTimeout(t);
  }, [showModal]);

  return (
    <div className={`app ${alanMode ? "alan-mode" : ""}`}>
      {alanMode && (
        <Confetti fire={fireConfetti} onDone={() => setFireConfetti(false)} />
      )}
      <AlanModal open={showModal} onClose={() => setShowModal(false)} />

      <div className="layout">
        {/* Panel tablero */}
        <section className="panel">
          {alanMode && <div className="alan-banner">🎉 Modo Alan</div>}

          <h1 className="title">Tic-Tac-Toe</h1>
          <div className="status">{status}</div>

          <div className="board">
            {squares.map((val, i) => (
              <Square
                key={i}
                value={val}
                onClick={() => handleClick(i)}
                highlight={highlightSet.has(i)}
                renderMode={renderMode}
              />
            ))}
          </div>
        </section>

        {/* Sidebar */}
        <aside className="sidebar">
          <h2>Opciones</h2>

          <div className="row">
            <button onClick={reset}>Reiniciar</button>
          </div>

          <div>
            <h3>Cómo mostrar X/O</h3>
            <div className="row">
              <button onClick={() => setRenderMode("svg")}>SVG</button>
              <button onClick={() => setRenderMode("img")}>Imágenes</button>
              <button onClick={() => setRenderMode("emoji")}>Emojis</button>
            </div>
          </div>

          <div>
            <h3>Modo Alan</h3>
            <p className="tip">Tip: usa las flechas (↑ ↑ ↓ ↓ ← → ← →)</p>
            {alanMode && (
              <button onClick={() => setAlanMode(false)}>Desactivar</button>
            )}
          </div>

          <div>
            <h3>Historial</h3>
            <div className="history">
              {history.map((_, move) => (
                <button key={move} onClick={() => jumpTo(move)}>
                  {move === 0 ? "Inicio" : `Paso ${move}`}
                </button>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
