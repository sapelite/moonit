"use client";

import { motion } from "framer-motion";
import AlphaTerminal from "./AlphaTerminal";

export default function MonitorDisplay() {
  return (
    <div className="min-h-screen bg-black flex flex-col overflow-y-auto w-full">
      {/* Navbar */}
      <nav className="flex items-center justify-between px-6 py-4 border-b border-zinc-900 sticky top-0 z-50 bg-black w-full">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <span className="text-xl font-bold tracking-tight">
            <span className="text-[#14f195]">monitor</span>
            <span className="text-white">.memes</span>
          </span>
        </div>

        {/* Social Links */}
        <div className="flex items-center gap-6">
          <a 
            href="https://x.com/monitormemes" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-zinc-500 hover:text-[#14f195] transition-colors text-sm font-mono"
          >
            @monitormemes
          </a>
          <a 
            href="https://t.me/monitormemes" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-zinc-500 hover:text-[#14f195] transition-colors text-sm font-mono"
          >
            Telegram
          </a>
        </div>
      </nav>

      {/* Main Content - Alpha Terminal */}
      <main className="flex-1 p-0">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full h-full"
        >
          <AlphaTerminal />
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="flex items-center justify-between px-6 py-4 border-t border-zinc-900 w-full">
        <span className="text-xs text-zinc-600 font-mono">
          © 2025 monitor.memes
        </span>
        <span className="text-xs font-mono text-zinc-600">
          The trenches finally have a monitor.
        </span>
      </footer>
    </div>
  );
}
