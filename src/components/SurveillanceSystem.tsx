"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import styles from "./SurveillanceSystem.module.css";

// Video sources for camera feeds (placeholder - can be replaced with actual feeds)
const videoSources = [
  "https://mattcannon.games/codepen/glitches/cam1.mp4",
  "https://mattcannon.games/codepen/glitches/cam2.mp4",
  "https://mattcannon.games/codepen/glitches/cam3.mp4",
  "https://mattcannon.games/codepen/glitches/cam4.mp4",
  "https://mattcannon.games/codepen/glitches/cam5.mp4",
  "https://mattcannon.games/codepen/glitches/cam6.mp4",
];

// Memecoin-themed camera locations
const cameras = [
  { id: "SOL_01", name: "TELEGRAM ALERTS", status: "LIVE", offline: false },
  { id: "SOL_02", name: "DEX SCREENER", status: "LIVE", offline: false },
  { id: "SOL_03", name: "TWITTER/X FEED", status: "OFFLINE", offline: true },
  { id: "SOL_04", name: "RAYDIUM POOLS", status: "LIVE", offline: false },
  { id: "SOL_05", name: "WHALE WALLETS", status: "OFFLINE", offline: true },
  { id: "SOL_06", name: "MEME ORACLE", status: "LIVE", offline: false },
];

// Memecoin-themed log messages
const startupMessages = [
  "CONNECTING TO SOLANA RPC...",
  "INITIALIZING MEME SCANNER v1.0",
  "LOADING WHALE TRACKING MODULE...",
  "BONDING CURVE MONITOR: ACTIVE",
  "TELEGRAM SENTINEL: ONLINE",
  "WARNING: $PEPE ACTIVITY DETECTED",
  "SYSTEM INTEGRITY: 73%",
  "APPLYING TRADING PROTOCOLS...",
];

const glitchMessages = [
  "BONDING CURVE DEVIATION",
  "WHALE ACCUMULATION DETECTED",
  "SOLANA GAS SPIKE",
  "NEW TOKEN LAUNCH ALERT",
  "KOL TWITTER ACTIVITY",
  "LIQUIDITY DRAIN DETECTED",
  "RUG PULL SIGNATURE",
  "SNIPE BOT ACTIVITY",
  "INSIDER WALLET MOVEMENT",
  "SENTIMENT SHIFT DETECTED",
];

// Glitch effect types
type GlitchEffect = "slice" | "rgb-split" | "pixel" | "flicker" | "neon" | "distort" | "invert" | "vhs" | "matrix" | "xray";

// Log entry type
interface LogEntry {
  id: number;
  message: string;
  timestamp: string;
}

export default function SurveillanceSystem() {
  // State
  const [timeDisplay, setTimeDisplay] = useState("00:00:00");
  const [uptimeDisplay, setUptimeDisplay] = useState("00:00:00");
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [gridState, setGridState] = useState<"three-per-row" | "two-per-row" | "single-column">("three-per-row");
  const [isColorMode, setIsColorMode] = useState(true);
  const [fullscreenCamera, setFullscreenCamera] = useState<number | null>(null);
  const [systemStatus, setSystemStatus] = useState("UNDER ATTACK");
  const [securityLevel, setSecurityLevel] = useState(73);
  
  const logIdRef = useRef(0);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);
  const prefersReducedMotion = useRef(false);
  const startupComplete = useRef(false);

  // Initialize
  useEffect(() => {
    prefersReducedMotion.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    
    // Set initial time
    updateTime();
    const timeInterval = setInterval(updateTime, 1000);
    
    // Initialize system with narrative
    addLog("MONITOR.MEMES v1.0 INITIALIZED");
    addLog("CONNECTING TO SOLANA MAINNET...");
    
    // Sequential startup messages
    let delay = 500;
    startupMessages.forEach((msg, i) => {
      setTimeout(() => {
        addLog(msg);
        if (i === startupMessages.length - 1) {
          startupComplete.current = true;
          // Start glitch effects after startup
          if (!prefersReducedMotion.current) {
            setupGlitchEffects();
          }
        }
      }, delay);
      delay += 800 + Math.random() * 400;
    });

    return () => clearInterval(timeInterval);
  }, []);

  // Update time display
  const updateTime = () => {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");
    const seconds = String(now.getSeconds()).padStart(2, "0");
    setTimeDisplay(`${hours}:${minutes}:${seconds}`);
    
    // Update uptime (simulated - starts from market open)
    const uptimeSeconds = Math.floor((now.getTime() - new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()) / 1000);
    const uptimeHours = String(Math.floor(uptimeSeconds / 3600)).padStart(2, "0");
    const uptimeMins = String(Math.floor((uptimeSeconds % 3600) / 60)).padStart(2, "0");
    const uptimeSecs = String(uptimeSeconds % 60).padStart(2, "0");
    setUptimeDisplay(`${uptimeHours}:${uptimeMins}:${uptimeSecs}`);
  };

  // Add log entry
  const addLog = useCallback((message: string) => {
    const timestamp = timeDisplay || "00:00:00";
    logIdRef.current += 1;
    setLogs(prev => [{
      id: logIdRef.current,
      message,
      timestamp
    }, ...prev].slice(0, 50));
  }, [timeDisplay]);

  // Toggle grid view
  const toggleGrid = () => {
    setGridState(prev => {
      let newState: "three-per-row" | "two-per-row" | "single-column";
      switch (prev) {
        case "three-per-row":
          newState = "two-per-row";
          addLog("GRID LAYOUT: 2x3");
          break;
        case "two-per-row":
          newState = "single-column";
          addLog("GRID LAYOUT: SINGLE");
          break;
        case "single-column":
          newState = "three-per-row";
          addLog("GRID LAYOUT: 3x2");
          break;
      }
      return newState;
    });
  };

  // Toggle color/BW filter
  const toggleFilter = () => {
    setIsColorMode(prev => {
      const newMode = !prev;
      addLog(`VIEW MODE: ${newMode ? "COLOR" : "MONOCHROME"}`);
      return newMode;
    });
  };

  // Reset system - memecoin themed
  const resetSystem = () => {
    setSystemStatus("REBOOTING");
    addLog("FLUSHING MEMORY BUFFERS...");
    
    // Apply visual reboot effect
    videoRefs.current.forEach(video => {
      if (video) {
        video.style.opacity = "0.1";
      }
    });
    
    setTimeout(() => {
      addLog("REINITIALIZING RPC CONNECTIONS...");
      setTimeout(() => {
        addLog("RESUMING TOKEN SCANNING...");
        setTimeout(() => {
          // Restore camera feeds
          videoRefs.current.forEach(video => {
            if (video) {
              video.style.opacity = "1";
              video.currentTime = 0;
              video.play().catch(console.error);
            }
          });
          
          setSecurityLevel(100);
          setSystemStatus("SECURE");
          addLog("SYSTEM RESTORED - ALL PROTOCOLS ACTIVE");
          
          // Randomly decrease security again
          setTimeout(() => {
            if (Math.random() > 0.5) {
              setSecurityLevel(Math.floor(Math.random() * 30) + 50);
              setSystemStatus("UNDER ATTACK");
            }
          }, 5000 + Math.random() * 10000);
        }, 1200);
      }, 1000);
    }, 800);
  };

  // Force glitch - crypto themed
  const triggerGlitch = () => {
    addLog("⚠️ MANUAL SIGNAL INTERFERENCE DETECTED");
    
    if (prefersReducedMotion.current) {
      return;
    }
    
    videoRefs.current.forEach((video, index) => {
      if (!video) return;
      
      // Apply immediate glitch
      video.style.transform = `translate(${Math.random() * 10 - 5}px, ${Math.random() * 10 - 5}px)`;
      video.style.boxShadow = `${Math.random() * 8 - 4}px 0 0 rgba(255,0,0,0.5), ${Math.random() * -8 + 4}px 0 0 rgba(0,255,255,0.5)`;
      
      setTimeout(() => {
        video.style.transform = "none";
        video.style.boxShadow = "none";
      }, 800);
    });
    
    setTimeout(() => {
      addLog("STABILIZING SIGNAL FEED...");
    }, 1200);
  };

  // Toggle fullscreen
  const toggleFullscreen = (index: number) => {
    setFullscreenCamera(prev => prev === index ? null : index);
    addLog(`EXPANDING FEED: ${cameras[index].id}`);
  };

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setFullscreenCamera(null);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Setup glitch effects
  const setupGlitchEffects = () => {
    cameras.forEach((camera, index) => {
      if (camera.offline) return;
      
      const minInterval = 3000 + index * 1000;
      const maxInterval = 10000 + index * 2000;
      
      const scheduleNextGlitch = () => {
        const delay = Math.random() * (maxInterval - minInterval) + minInterval;
        
        setTimeout(() => {
          if (Math.random() < 0.7) { // 70% chance
            applyGlitch(index);
            // Decrease security level on glitch
            setSecurityLevel(prev => Math.max(0, prev - Math.floor(Math.random() * 5)));
          }
          scheduleNextGlitch();
        }, delay);
      };
      
      // Start with random delay
      setTimeout(() => scheduleNextGlitch(), 5000 + Math.random() * 5000);
    });
  };

  // Apply glitch effect to a camera
  const applyGlitch = (cameraIndex: number) => {
    const video = videoRefs.current[cameraIndex];
    if (!video) return;
    
    const effects: GlitchEffect[] = ["slice", "rgb-split", "pixel", "flicker", "neon", "distort", "invert", "vhs", "matrix", "xray"];
    const numEffects = Math.floor(Math.random() * 3) + 1;
    const selectedEffects: GlitchEffect[] = [];
    
    while (selectedEffects.length < numEffects) {
      const effect = effects[Math.floor(Math.random() * effects.length)];
      if (!selectedEffects.includes(effect)) {
        selectedEffects.push(effect);
      }
    }
    
    const glitchDuration = Math.random() * 1000 + 300;
    
    selectedEffects.forEach(effect => {
      switch (effect) {
        case "rgb-split":
          const rgbAmount = Math.random() * 20 + 10;
          video.style.boxShadow = `${rgbAmount}px 0 0 rgba(255, 0, 0, 0.8), ${-rgbAmount}px 0 0 rgba(0, 255, 255, 0.8), 0 ${rgbAmount / 2}px 0 rgba(0, 255, 0, 0.8)`;
          setTimeout(() => {
            video.style.boxShadow = "none";
          }, glitchDuration);
          break;
          
        case "pixel":
          video.style.filter = "blur(1px) contrast(1.5)";
          setTimeout(() => {
            video.style.filter = "";
          }, glitchDuration);
          break;
          
        case "flicker":
          const flickerCount = Math.floor(Math.random() * 10) + 5;
          for (let i = 0; i < flickerCount; i++) {
            setTimeout(() => {
              video.parentElement!.style.opacity = String(Math.random() * 0.6 + 0.4);
              if (i === flickerCount - 1) {
                video.parentElement!.style.opacity = "1";
              }
            }, (glitchDuration / flickerCount) * i);
          }
          break;
          
        case "neon":
          video.style.filter = "saturate(300%) brightness(1.2) contrast(1.5)";
          setTimeout(() => {
            video.style.filter = "";
          }, glitchDuration);
          break;
          
        case "distort":
          const skewX = Math.random() * 40 - 20;
          const skewY = Math.random() * 40 - 20;
          const rotate = Math.random() * 10 - 5;
          const scale = 0.8 + Math.random() * 0.4;
          video.style.transform = `skew(${skewX}deg, ${skewY}deg) rotate(${rotate}deg) scale(${scale})`;
          setTimeout(() => {
            video.style.transform = "none";
          }, glitchDuration);
          break;
          
        case "invert":
          video.style.filter = "invert(100%) hue-rotate(180deg)";
          setTimeout(() => {
            video.style.filter = "";
          }, glitchDuration);
          break;
          
        case "vhs":
          video.style.transform = `translateX(${Math.random() * 30 - 15}px)`;
          setTimeout(() => {
            video.style.transform = "none";
          }, glitchDuration);
          break;
          
        case "xray":
          video.style.filter = "invert(85%) contrast(2) brightness(1.5) saturate(0.2)";
          setTimeout(() => {
            video.style.filter = "";
          }, glitchDuration);
          break;
          
        default:
          break;
      }
    });
    
    // Log glitch with crypto message
    if (Math.random() < 0.5) {
      const message = glitchMessages[Math.floor(Math.random() * glitchMessages.length)];
      addLog(`⚠️ ${message}: ${cameras[cameraIndex].id}`);
    }
  };

  return (
    <div className={styles["surveillance-container"]}>
      {/* Header - Memecoin themed */}
      <header className={styles["system-header"]}>
        <div className={styles["system-title"]}>
          <h1>
            <span className={styles["glitch-text"]}>MEME SENTINEL</span>
          </h1>
          <div className={styles["subtitle"]}>
            SOLANA MEMECOIN INTELLIGENCE / SECURITY: <span className={styles["status-alert"]}>{securityLevel}% {systemStatus}</span>
          </div>
        </div>
        <div className={styles["status-panel"]}>
          <div className={styles["status-item"]}>
            <span className={styles["status-label"]}>UPTIME:</span>
            <span className={styles["status-value"]} id="uptime-display">{uptimeDisplay}</span>
          </div>
          <div className={styles["status-item"]}>
            <span className={styles["status-label"]}>TIME:</span>
            <span className={styles["status-value"]} id="time-display">{timeDisplay}</span>
          </div>
        </div>
      </header>

      {/* Camera Grid */}
      <div className={`${styles["camera-grid"]} ${styles[gridState]}`}>
        {cameras.map((camera, index) => (
          <div
            key={camera.id}
            className={`${styles["camera-feed"]} ${fullscreenCamera === index ? styles["fullscreen"] : ""}`}
            onClick={() => toggleFullscreen(index)}
          >
            <div className={styles["camera-header"]}>
              <span className={styles["camera-id"]}>{camera.id}</span>
              <span className={`${styles["camera-status"]} ${camera.offline ? styles["offline"] : ""}`}>
                {camera.status}
              </span>
            </div>
            <div className={styles["camera-content"]}>
              <video
                ref={el => { videoRefs.current[index] = el; }}
                muted
                loop
                playsInline
                className={`${styles["camera-video"]} ${isColorMode ? styles["color-mode"] : ""}`}
                src={videoSources[index]}
                style={{ opacity: camera.offline ? 0.3 : 1 }}
              />
              <div className={styles["scan-line"]} />
              <div className={styles["noise-overlay"]} style={{ opacity: camera.offline ? 0.2 : 0.03 }} />
              <div className={styles["glitch-overlay"]} />
              <div className={styles["color-distortion"]} />
            </div>
            <div className={styles["camera-footer"]}>{camera.name}</div>
          </div>
        ))}
      </div>

      {/* Control Panel */}
      <div className={styles["control-panel"]}>
        <div className={styles["log-terminal"]}>
          <div className={styles["terminal-header"]}>LIVE FEED</div>
          <div className={styles["terminal-content"]} id="log-content">
            {logs.slice(0, 12).map(log => (
              <div key={log.id}>
                {'>'} [{log.timestamp}] {log.message}
              </div>
            ))}
          </div>
        </div>
        <div className={styles["controls"]}>
          <button className={styles["control-btn"]} onClick={toggleGrid}>
            {gridState === "three-per-row" ? "2x GRID" : gridState === "two-per-row" ? "1x GRID" : "3x GRID"}
          </button>
          <button className={styles["control-btn"]} onClick={resetSystem}>
            REFRESH
          </button>
          <button className={styles["control-btn"]} onClick={triggerGlitch}>
            SCAN SIG
          </button>
          <button className={styles["control-btn"]} onClick={toggleFilter}>
            {isColorMode ? "BW MODE" : "COLOR"}
          </button>
        </div>
      </div>
    </div>
  );
}
