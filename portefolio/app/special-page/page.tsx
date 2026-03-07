"use client"

import { useState, useEffect, useRef } from "react"

type FloatingEmoji = {
  id: number
  x: number
  size: number
  duration: number
  emoji: string
  drift: number
}

const CELEBRATION_EMOJIS = ["❤️", "🌹", "💕", "🌸", "🎉", "💖", "🌷", "✨", "💗", "🎊", "🩷", "💝", "🌺", "🥂", "💫"]

let emojiCounter = 0

export default function SpecialPage() {
  const [floatingEmojis, setFloatingEmojis] = useState<FloatingEmoji[]>([])
  const [showInvalid, setShowInvalid] = useState(false)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const isRunning = useRef(false)

  const spawnEmoji = () => {
    emojiCounter += 1
    const id = emojiCounter
    const duration = Math.random() * 2.5 + 3
    const newEmoji: FloatingEmoji = {
      id,
      x: Math.random() * 85 + 5,
      size: Math.random() * 24 + 20,
      duration,
      emoji: CELEBRATION_EMOJIS[Math.floor(Math.random() * CELEBRATION_EMOJIS.length)],
      drift: (Math.random() - 0.5) * 100,
    }
    setFloatingEmojis(prev => [...prev, newEmoji])
    setTimeout(() => {
      setFloatingEmojis(prev => prev.filter(e => e.id !== id))
    }, (duration + 0.5) * 1000)
  }

  const handleYes = () => {
    if (isRunning.current) return
    isRunning.current = true
    for (let i = 0; i < 20; i++) {
      setTimeout(() => spawnEmoji(), i * 60)
    }
    intervalRef.current = setInterval(() => {
      spawnEmoji()
      if (Math.random() > 0.5) spawnEmoji()
    }, 280)
  }

  const handleNo = () => {
    setShowInvalid(true)
    setTimeout(() => setShowInvalid(false), 2500)
  }

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [])

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bodoni+Moda:ital,opsz,wght@1,6..96,900&family=Cormorant:ital,wght@0,300;1,300;1,400&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        html, body { height: 100%; overflow: hidden; }

        .sp-page {
          position: fixed;
          inset: 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: flex-start;
          padding-top: clamp(3rem, 10vh, 6rem);
          padding-left: 1.5rem;
          padding-right: 1.5rem;
          overflow: hidden;
          background-color: #060203;
          background-image:
            radial-gradient(ellipse 80% 40% at 50% 0%, rgba(160,15,35,0.22) 0%, transparent 70%),
            radial-gradient(ellipse 50% 30% at 20% 90%, rgba(100,8,20,0.14) 0%, transparent 60%);
        }

        .sp-glow {
          position: absolute;
          inset: 0;
          background: radial-gradient(ellipse 60% 50% at 50% 25%, rgba(180,20,40,0.1), transparent 70%);
          pointer-events: none;
          animation: glowBreath 4s ease-in-out infinite alternate;
        }

        @keyframes glowBreath {
          from { opacity: 0.6; }
          to { opacity: 1; }
        }

        .sp-title-block {
          position: relative;
          z-index: 2;
          text-align: center;
          margin-bottom: clamp(2rem, 6vh, 4rem);
        }

        .sp-title {
          font-family: 'Bodoni Moda', serif;
          font-size: clamp(3rem, 12vw, 6.5rem);
          font-weight: 900;
          font-style: italic;
          line-height: 1.06;
          color: transparent;
          background: linear-gradient(
            158deg,
            #fff0f0 0%,
            #ffc8c8 15%,
            #ff6060 35%,
            #e02040 55%,
            #a80d22 75%,
            #650410 100%
          );
          -webkit-background-clip: text;
          background-clip: text;
          filter:
            drop-shadow(0 1px 0 rgba(160,10,30,0.95))
            drop-shadow(0 2px 0 rgba(120,5,20,0.85))
            drop-shadow(0 3px 0 rgba(90,0,15,0.75))
            drop-shadow(0 4px 0 rgba(65,0,10,0.6))
            drop-shadow(0 5px 0 rgba(45,0,8,0.45))
            drop-shadow(0 12px 35px rgba(180,20,40,0.35))
            drop-shadow(0 28px 70px rgba(160,15,35,0.18));
          display: block;
          animation: titleReveal 1.2s cubic-bezier(0.16,1,0.3,1) both;
        }

        @keyframes titleReveal {
          from { opacity: 0; transform: translateY(-20px) scale(0.97); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }

        .sp-divider {
          width: 48px;
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(220,50,70,0.5), transparent);
          margin: 1.2rem auto 0;
          animation: fadeIn 1.6s ease 0.4s both;
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        .sp-buttons {
          position: relative;
          z-index: 2;
          display: flex;
          gap: clamp(1rem, 5vw, 2rem);
          align-items: center;
          justify-content: center;
          animation: fadeIn 1.8s ease 0.7s both;
        }

        .sp-btn-yes {
          font-family: 'Cormorant', serif;
          font-size: clamp(1rem, 4vw, 1.2rem);
          font-weight: 300;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          padding: clamp(0.75rem, 2.5vw, 0.95rem) clamp(2rem, 7vw, 3.4rem);
          border-radius: 100px;
          border: none;
          cursor: pointer;
          position: relative;
          overflow: hidden;
          color: #ffe0e0;
          background: linear-gradient(140deg, #c01030 0%, #830a1e 55%, #500510 100%);
          box-shadow:
            0 2px 0 rgba(70,0,12,0.9),
            0 4px 0 rgba(50,0,8,0.7),
            0 6px 0 rgba(35,0,5,0.5),
            0 10px 35px rgba(170,15,35,0.45),
            0 2px 10px rgba(0,0,0,0.6),
            inset 0 1px 0 rgba(255,160,160,0.18);
          transition: transform 0.15s ease, box-shadow 0.15s ease;
          -webkit-tap-highlight-color: transparent;
          touch-action: manipulation;
        }

        .sp-btn-yes::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 50%;
          background: linear-gradient(180deg, rgba(255,255,255,0.1), transparent);
          border-radius: inherit;
          pointer-events: none;
        }

        .sp-btn-yes:active {
          transform: translateY(3px);
          box-shadow:
            0 0 0 rgba(70,0,12,0.9),
            0 3px 15px rgba(170,15,35,0.3),
            inset 0 1px 0 rgba(255,160,160,0.1);
        }

        @media (hover: hover) {
          .sp-btn-yes:hover {
            transform: translateY(-3px);
            box-shadow:
              0 5px 0 rgba(70,0,12,0.9),
              0 7px 0 rgba(50,0,8,0.6),
              0 9px 0 rgba(35,0,5,0.4),
              0 18px 45px rgba(170,15,35,0.5),
              0 5px 15px rgba(0,0,0,0.5),
              inset 0 1px 0 rgba(255,160,160,0.22);
          }
        }

        .sp-btn-no {
          font-family: 'Cormorant', serif;
          font-size: clamp(0.85rem, 3.5vw, 1rem);
          font-weight: 300;
          font-style: italic;
          letter-spacing: 0.08em;
          padding: clamp(0.6rem, 2vw, 0.75rem) clamp(1.2rem, 4vw, 1.8rem);
          border-radius: 100px;
          border: 1px solid rgba(180,50,70,0.15);
          cursor: pointer;
          background: transparent;
          color: rgba(180,70,70,0.32);
          transition: all 0.3s ease;
          -webkit-tap-highlight-color: transparent;
          touch-action: manipulation;
        }

        .sp-btn-no:active,
        .sp-btn-no:hover {
          color: rgba(200,70,70,0.5);
          border-color: rgba(200,70,70,0.22);
          background: rgba(180,20,40,0.05);
        }

        .sp-emojis {
          position: fixed;
          inset: 0;
          pointer-events: none;
          z-index: 50;
          overflow: hidden;
        }

        .sp-emoji {
          position: absolute;
          bottom: -60px;
          animation: riseEmoji linear forwards;
          will-change: transform, opacity;
          user-select: none;
          line-height: 1;
        }

        @keyframes riseEmoji {
          0%   { transform: translateY(0)      translateX(0)                    scale(0.5) rotate(-8deg);  opacity: 0; }
          8%   { transform: translateY(-8vh)   translateX(calc(var(--dr) * 0.08)) scale(1.1) rotate(5deg);  opacity: 0.95; }
          50%  { transform: translateY(-55vh)  translateX(calc(var(--dr) * 0.55)) scale(1)   rotate(-5deg); opacity: 0.8; }
          85%  { opacity: 0.35; }
          100% { transform: translateY(-115vh) translateX(var(--dr))            scale(0.8) rotate(12deg); opacity: 0; }
        }

        .sp-invalid {
          position: fixed;
          top: clamp(1.2rem, 4vw, 2rem);
          left: 50%;
          transform: translateX(-50%);
          z-index: 100;
          animation: popDown 0.45s cubic-bezier(0.34,1.56,0.64,1) both;
          white-space: nowrap;
        }

        .sp-invalid-inner {
          font-family: 'Cormorant', serif;
          font-size: clamp(0.85rem, 3.5vw, 1rem);
          font-style: italic;
          letter-spacing: 0.1em;
          color: rgba(255,190,190,0.9);
          background: rgba(10,2,4,0.94);
          border: 1px solid rgba(200,30,50,0.28);
          padding: 0.6rem 1.8rem;
          border-radius: 100px;
          backdrop-filter: blur(16px);
          box-shadow: 0 4px 28px rgba(180,20,40,0.22);
        }

        @keyframes popDown {
          from { opacity: 0; transform: translateX(-50%) translateY(-12px); }
          to   { opacity: 1; transform: translateX(-50%) translateY(0); }
        }
      `}</style>

      <div className="sp-page">
        <div className="sp-glow" />

        <div className="sp-title-block">
          <span className="sp-title">
            Aceitas namorar<br />comigo?
          </span>
          <div className="sp-divider" />
        </div>

        <div className="sp-buttons">
          <button className="sp-btn-yes" onClick={handleYes}>
            Sim ❤️
          </button>
          <button className="sp-btn-no" onClick={handleNo}>
            não
          </button>
        </div>

        <div className="sp-emojis">
          {floatingEmojis.map(e => (
            <span
              key={e.id}
              className="sp-emoji"
              style={{
                left: `${e.x}%`,
                fontSize: `${e.size}px`,
                animationDuration: `${e.duration}s`,
                ['--dr' as string]: `${e.drift}px`,
              }}
            >
              {e.emoji}
            </span>
          ))}
        </div>

        {showInvalid && (
          <div className="sp-invalid">
            <div className="sp-invalid-inner">Opção inválida ✦</div>
          </div>
        )}
      </div>
    </>
  )
}