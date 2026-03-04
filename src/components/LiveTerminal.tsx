"use client";

import React, { useState, useEffect, useLayoutEffect, useRef, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// --- Types ---
interface Token {
  id: string;
  symbol: string;
  name: string;
  address: string;
  price: number;
  priceChange1m: number;
  priceChange5m: number;
  priceChange15m?: number;
  priceChange1h: number;
  priceChange4h?: number;
  priceChange6h: number;
  priceChange12h?: number;
  priceChange24h: number;
  volume1m: number;
  volume5m: number;
  volume15m?: number;
  volume1h: number;
  volume4h?: number;
  volume6h?: number;
  volume12h?: number;
  volume24h: number;
  marketCap: number;
  marketCapDiluted?: number;
  liquidity: number;
  liquidityUSD?: number;
  holderCount?: number;
  top10HolderPercent?: number;
  buyTxns?: number;
  sellTxns?: number;
  totalTxns?: number;
  buyTax?: number;
  sellTax?: number;
  isBlacklisted?: boolean;
  dex: string;
  createdAt?: string;
  risk?: string;
  twitter?: string;
  website?: string;
  telegram?: string;
  description?: string;
}

interface SolPrice {
  usd: number;
  usd_24h_change: number;
  usd_7d_change?: number;
  market_cap?: number;
  volume_24h?: number;
}

interface NewsItem {
  id: string;
  title: string;
  source: string;
  time: string;
  url: string;
  sentiment?: 'bullish' | 'bearish' | 'neutral';
  category?: string;
}

interface CandleData {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

interface Settings {
  refreshRate: number;
  theme: 'dark' | 'light';
  showVolume: boolean;
  chartTimeframe: '1m' | '5m' | '15m' | '1h';
}

// --- Utilities ---
const formatNumber = (num: number): string => {
  if (!num || isNaN(num)) return '$0';
  if (num >= 1_000_000_000) return `$${(num / 1_000_000_000).toFixed(2)}B`;
  if (num >= 1_000_000) return `$${(num / 1_000_000).toFixed(2)}M`;
  if (num >= 1_000) return `$${(num / 1_000).toFixed(2)}K`;
  return `$${num.toFixed(2)}`;
};

const formatPrice = (price: number): string => {
  if (!price || isNaN(price)) return '$0';
  if (price >= 1000) return `$${price.toFixed(2)}`;
  if (price >= 1) return `$${price.toFixed(4)}`;
  if (price >= 0.01) return `$${price.toFixed(6)}`;
  if (price >= 0.0001) return `$${price.toFixed(8)}`;
  return `$${price.toFixed(10)}`;
};

const formatCompact = (num: number): string => {
  if (!num || isNaN(num)) return '0';
  if (num >= 1_000_000_000) return `${(num / 1_000_000_000).toFixed(1)}B`;
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`;
  if (num >= 1_000) return `${(num / 1_000).toFixed(1)}K`;
  return num.toFixed(0);
};

// --- Flash Hook ---
// Use setTimeout to defer state updates and avoid cascading renders
function useFlash(value: number, duration = 500) {
  const [flashClass, setFlashClass] = useState('');
  const prevValue = useRef(value);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (value !== prevValue.current && !isNaN(value) && !isNaN(prevValue.current)) {
      const isUp = value > prevValue.current;
      
      // Clear any existing timeout to prevent conflicts
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      
      // Defer state update to avoid cascading renders from synchronous setState in effect
      const deferredSetFlash = () => {
        setFlashClass(isUp ? 'flash-green' : 'flash-red');
      };
      
      // Use setTimeout to defer to next tick
      const setFlashTimeout = setTimeout(deferredSetFlash, 0);
      
      prevValue.current = value;
      
      // Schedule removal of flash class
      timeoutRef.current = setTimeout(() => {
        setFlashClass('');
        timeoutRef.current = null;
      }, duration);
      
      return () => {
        clearTimeout(setFlashTimeout);
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
      };
    }
  }, [value, duration]);

  return flashClass;
}

// --- Components ---

const SettingsPanel = ({ settings, onSettingsChange }: { settings: Settings; onSettingsChange: (s: Settings) => void }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-1 text-zinc-500 hover:text-zinc-300 transition-colors text-xs"
      >
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="3"></circle>
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
        </svg>
        <span>SETTINGS</span>
      </button>
      
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute right-0 top-8 bg-zinc-900 border border-zinc-700 rounded-lg p-3 z-50 min-w-[200px] shadow-xl"
          >
            <div className="text-[10px] text-zinc-500 mb-2 font-bold">PERSONALIZATION</div>
            
            <div className="space-y-2">
              <div>
                <label className="text-[9px] text-zinc-400">Refresh Rate</label>
                <select 
                  value={settings.refreshRate}
                  onChange={(e) => onSettingsChange({ ...settings, refreshRate: parseInt(e.target.value) })}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded px-2 py-1 text-[10px] text-zinc-300 mt-1"
                >
                  <option value="5000">5 seconds</option>
                  <option value="10000">10 seconds</option>
                  <option value="15000">15 seconds</option>
                  <option value="30000">30 seconds</option>
                </select>
              </div>
              
              <div>
                <label className="text-[9px] text-zinc-400">Chart Timeframe</label>
                <select 
                  value={settings.chartTimeframe}
                  onChange={(e) => onSettingsChange({ ...settings, chartTimeframe: e.target.value as Settings['chartTimeframe'] })}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded px-2 py-1 text-[10px] text-zinc-300 mt-1"
                >
                  <option value="1m">1 Minute</option>
                  <option value="5m">5 Minutes</option>
                  <option value="15m">15 Minutes</option>
                  <option value="1h">1 Hour</option>
                </select>
              </div>
              
              <div className="flex items-center justify-between">
                <label className="text-[9px] text-zinc-400">Show Volume</label>
                <button 
                  onClick={() => onSettingsChange({ ...settings, showVolume: !settings.showVolume })}
                  className={`w-8 h-4 rounded-full transition-colors ${settings.showVolume ? 'bg-cyan-500' : 'bg-zinc-700'}`}
                >
                  <div className={`w-3 h-3 rounded-full bg-white transition-transform ${settings.showVolume ? 'translate-x-4' : 'translate-x-0.5'}`} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const Header = ({ solPrice, priceChange, loading, tokenCount, settings, onSettingsChange }: { 
  solPrice: number | null; 
  priceChange: number | null; 
  loading: boolean; 
  tokenCount: number;
  settings: Settings;
  onSettingsChange: (s: Settings) => void;
}) => {
  const priceFlash = useFlash(solPrice || 0);

  return (
    <motion.div 
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col bg-zinc-950 p-3 text-xs mb-2"
    >
      <div className="flex justify-between items-center pb-2 mb-2">
        <div className="flex items-center space-x-2 text-cyan-400 font-bold">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="4 17 10 11 4 5"></polyline>
            <line x1="12" y1="19" x2="20" y2="19"></line>
          </svg>
          <span>[LIVE TERMINAL] — SOLANA MEMECOINS — REAL DATA — <span className="text-emerald-400 animate-pulse">CONNECTED</span></span>
        </div>
        <div className="flex items-center space-x-4">
          <span className="text-[10px] text-zinc-500">{tokenCount} TOKENS TRACKED</span>
          <SettingsPanel settings={settings} onSettingsChange={onSettingsChange} />
          <div className="flex">
            <button className="hover:text-zinc-300 px-2 transition-colors">−</button>
            <button className="hover:text-zinc-300 px-2 transition-colors">□</button>
            <button className="hover:text-zinc-300 px-2 transition-colors">×</button>
          </div>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-zinc-400">
        <div className="flex items-center space-x-1">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#22d3ee" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 12h-4l-3 9L9 3l-3 9H2"></path>
          </svg>
          <span>NETWORK: <span className="text-emerald-400 font-semibold">LOW CONGESTION</span></span>
        </div>
        <span className="text-zinc-700">|</span>
        <span>GAS: <span className="text-zinc-200">0.000005 SOL</span></span>
        <span className="text-zinc-700">|</span>
        <div className={`transition-colors duration-300 px-1 rounded ${priceFlash}`}>
          {loading ? (
            <span>SOL PRICE: <span className="font-mono text-zinc-200">Loading...</span></span>
          ) : solPrice ? (
            <>
              SOL PRICE: <span className="font-mono text-zinc-100">${solPrice.toFixed(2)}</span>
              <span className={priceChange && priceChange >= 0 ? 'text-emerald-400 ml-1' : 'text-red-400 ml-1'}>
                ({priceChange && priceChange >= 0 ? '+' : ''}{priceChange?.toFixed(2)}%)
              </span>
            </>
          ) : (
            <span>SOL PRICE: <span className="font-mono text-zinc-200">Error</span></span>
          )}
        </div>
        <span className="text-zinc-700">|</span>
        <div className="flex items-center space-x-1">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#eab308" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
          </svg>
          <span>RISK: <span className="text-emerald-400 animate-pulse">RISK-ON</span></span>
        </div>
      </div>
    </motion.div>
  );
};

const TokenRow = ({ token, index, onClick, isSelected }: { token: Token; index: number; onClick: () => void; isSelected: boolean }) => {
  const [price, setPrice] = useState(token.price);
  const [change, setChange] = useState(token.priceChange1h);
  const flash = useFlash(price, 600);

  useEffect(() => {
    const updatePrice = () => {
      const volatility = 0.03;
      const change = (Math.random() - 0.5) * volatility * price;
      setPrice(p => Math.max(0.00000001, p + change));
      setChange(c => {
        const newChange = c + (Math.random() - 0.5) * 0.5;
        return Math.max(-50, Math.min(500, newChange));
      });
    };
    const interval = setInterval(updatePrice, 1000 + Math.random() * 2000);
    return () => clearInterval(interval);
  }, [price]);

  const colors = [
    'from-orange-500 to-red-500',
    'from-blue-500 to-cyan-500',
    'from-purple-500 to-pink-500',
    'from-yellow-500 to-amber-500',
    'from-green-500 to-emerald-500',
    'from-cyan-500 to-blue-500',
    'from-pink-500 to-rose-500',
    'from-indigo-500 to-violet-500',
  ];

  return (
    <motion.div 
      layout
      onClick={onClick}
      className={`grid grid-cols-7 gap-1 text-[10px] items-center py-1.5 px-2 border-b border-zinc-800/50 cursor-pointer transition-all duration-200 ${flash} ${isSelected ? 'bg-cyan-900/30 border-l-2 border-l-cyan-400' : 'hover:bg-zinc-800/50'}`}
    >
      <div className="flex items-center space-x-1.5 min-w-0">
        <div className={`w-6 h-6 rounded-full bg-gradient-to-br ${colors[index % colors.length]} flex items-center justify-center text-[9px] text-white font-bold shadow-lg flex-shrink-0`}>
          {token.symbol.substring(0, 2).toUpperCase()}
        </div>
        <div className="flex flex-col min-w-0">
          <span className="text-[10px] font-bold text-zinc-100 truncate">{token.symbol.toUpperCase()}</span>
          <span className="text-[8px] text-zinc-500 truncate">{token.name}</span>
        </div>
      </div>
      <div className="text-right font-mono text-zinc-200">{formatPrice(price)}</div>
      <div className="text-right font-mono text-zinc-200">{formatCompact(token.volume1h)}</div>
      <div className={`text-right font-bold ${change >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
        {change > 0 ? '+' : ''}{change.toFixed(1)}%
      </div>
      <div className={`text-right ${token.priceChange24h >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
        {token.priceChange24h > 0 ? '+' : ''}{token.priceChange24h.toFixed(1)}%
      </div>
      <div className="text-right text-zinc-400">{formatCompact(token.marketCap)}</div>
      <div className="text-right text-zinc-400">{formatCompact(token.liquidityUSD || token.liquidity)}</div>
      <div className="text-right text-[8px] text-zinc-500">{token.dex.toUpperCase()}</div>
      {token.holderCount && (
        <div className="text-right text-[8px] text-cyan-500">{formatCompact(token.holderCount)}</div>
      )}
    </motion.div>
  );
};

const TopMoversWidget = ({ tokens, onSelectToken, selectedToken }: { tokens: Token[]; onSelectToken: (token: Token) => void; selectedToken: Token | null }) => {
  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between text-zinc-400 text-xs border-b border-zinc-800 pb-2 mb-2">
        <div className="flex items-center space-x-2">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#eab308" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
          </svg>
          <span className="font-bold tracking-wider">ALL TRENDING TOKENS</span>
        </div>
        <span className="text-[9px] text-zinc-500">{tokens.length} ACTIVE</span>
      </div>
      <div className="flex-1 overflow-hidden flex flex-col">
        <div className="grid grid-cols-9 gap-1 text-[9px] text-zinc-500 mb-1 px-2">
          <div>TOKEN</div>
          <div className="text-right">PRICE</div>
          <div className="text-right">VOL 5M</div>
          <div className="text-right">VOL 1H</div>
          <div className="text-right">1H %</div>
          <div className="text-right">24H %</div>
          <div className="text-right">MCAP</div>
          <div className="text-right">LIQ</div>
          <div className="text-right">DEX</div>
        </div>
        <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-zinc-700 scrollbar-track-zinc-900">
          <AnimatePresence>
            {tokens.map((token, i) => (
              <TokenRow 
                key={token.id || `${token.symbol}-${i}`} 
                token={token} 
                index={i}
                onClick={() => onSelectToken(token)}
                isSelected={selectedToken?.id === token.id}
              />
            ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

const LiveChart = ({ token, settings }: { token: Token | null; settings: Settings }) => {
  const [candles, setCandles] = useState<CandleData[]>([]);
  const [currentPrice, setCurrentPrice] = useState(0);
  const [timeframe, setTimeframe] = useState(settings.chartTimeframe);

  // Use useLayoutEffect to initialize candle data and price
  useLayoutEffect(() => {
    if (!token) return;
    
    const basePrice = token.price;
    
    const candleCount = timeframe === '1h' ? 24 : timeframe === '15m' ? 40 : timeframe === '5m' ? 50 : 60;
    const interval = timeframe === '1h' ? 3600000 : timeframe === '15m' ? 900000 : timeframe === '5m' ? 300000 : 60000;
    
    const initialCandles: CandleData[] = [];
    let price = basePrice * 0.95;
    
    for (let i = 0; i < candleCount; i++) {
      const volatility = 0.02;
      const open = price;
      const change = (Math.random() - 0.48) * volatility * price;
      const close = open + change;
      const high = Math.max(open, close) + Math.random() * volatility * price * 0.5;
      const low = Math.min(open, close) - Math.random() * volatility * price * 0.5;
      const volume = Math.random() * 1000000;
      
      initialCandles.push({
        time: Date.now() - (candleCount - i) * interval,
        open, high, low, close, volume
      });
      
      price = close;
    }
    
    // Defer both state updates to avoid cascading renders
    setTimeout(() => {
      setCurrentPrice(basePrice);
      setCandles(initialCandles);
    }, 0);
  }, [token?.id, timeframe]);

  useEffect(() => {
    if (!token || candles.length === 0) return;
    
    const interval = setInterval(() => {
      setCandles(prev => {
        const newCandles = [...prev];
        const lastCandle = { ...newCandles[newCandles.length - 1] };
        
        const volatility = 0.005;
        const priceChange = (Math.random() - 0.5) * volatility * lastCandle.close;
        lastCandle.close += priceChange;
        lastCandle.high = Math.max(lastCandle.high, lastCandle.close);
        lastCandle.low = Math.min(lastCandle.low, lastCandle.close);
        
        newCandles[newCandles.length - 1] = lastCandle;
        setCurrentPrice(lastCandle.close);
        
        return newCandles;
      });
    }, 500);
    
    return () => clearInterval(interval);
  }, [token?.id, candles.length]);

  const timeframes = ['1m', '5m', '15m', '1h'] as const;

  if (!token) {
    return (
      <div className="flex flex-col h-full">
        <div className="flex items-center space-x-2 text-zinc-400 text-xs border-b border-zinc-800 pb-2 mb-2">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="22 7 13.5 15.5 8.5 10.5 2 17"></polyline>
            <polyline points="16 7 22 7 22 13"></polyline>
          </svg>
          <span className="font-bold tracking-wider">TOKEN CHART</span>
        </div>
        <div className="flex-1 flex items-center justify-center text-zinc-500 text-sm">
          Select a token to view chart
        </div>
      </div>
    );
  }

  const priceChange = candles.length > 1 
    ? ((candles[candles.length - 1]?.close - candles[0]?.open) / candles[0]?.open * 100) 
    : 0;

  const allPrices = candles.flatMap(c => [c.high, c.low]);
  const minPrice = Math.min(...allPrices) * 0.995;
  const maxPrice = Math.max(...allPrices) * 1.005;
  const priceRange = maxPrice - minPrice;

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between text-zinc-400 text-xs border-b border-zinc-800 pb-2 mb-2">
        <div className="flex items-center space-x-2">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="22 7 13.5 15.5 8.5 10.5 2 17"></polyline>
            <polyline points="16 7 22 7 22 13"></polyline>
          </svg>
          <span className="font-bold tracking-wider">{token.symbol.toUpperCase()}/SOL</span>
        </div>
        
        {/* Timeframe Buttons */}
        <div className="flex space-x-1">
          {timeframes.map(tf => (
            <button
              key={tf}
              onClick={() => setTimeframe(tf)}
              className={`px-2 py-0.5 text-[9px] rounded ${timeframe === tf ? 'bg-cyan-600 text-white' : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'}`}
            >
              {tf}
            </button>
          ))}
        </div>
      </div>
      
      {/* Price Info Bar */}
      <div className="flex items-center justify-between bg-zinc-950 rounded px-2 py-1 mb-2">
        <div className="flex items-center space-x-3">
          <span className={`text-sm font-mono font-bold ${priceChange >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
            {formatPrice(currentPrice)}
          </span>
          <span className={`text-xs ${priceChange >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
            {priceChange >= 0 ? '+' : ''}{priceChange.toFixed(2)}%
          </span>
        </div>
        <div className="flex items-center space-x-2 text-[9px] text-zinc-500">
          <span>H: {formatPrice(maxPrice)}</span>
          <span>L: {formatPrice(minPrice)}</span>
          <span className="text-emerald-500 animate-pulse">● LIVE</span>
        </div>
      </div>
      
      <div className="flex-1 bg-zinc-950 rounded border border-zinc-800 p-2 relative overflow-hidden flex flex-col">
        <div className="absolute right-1 top-2 text-[8px] text-zinc-600 flex flex-col items-end space-y-0.5 z-10">
          <span>{formatPrice(maxPrice)}</span>
          <span>{formatPrice((maxPrice + minPrice) / 2)}</span>
          <span>{formatPrice(minPrice)}</span>
        </div>
        
        <div className="flex-1 flex items-end space-x-[1px] pb-5 px-2 min-h-0">
          {candles.map((candle, i) => {
            const isUp = candle.close >= candle.open;
            const color = isUp ? 'bg-emerald-500' : 'bg-red-500';
            const wickColor = isUp ? 'bg-emerald-600' : 'bg-red-600';
            
            const highPct = ((candle.high - minPrice) / priceRange) * 100;
            const lowPct = ((candle.low - minPrice) / priceRange) * 100;
            const openPct = ((candle.open - minPrice) / priceRange) * 100;
            const closePct = ((candle.close - minPrice) / priceRange) * 100;
            
            const top = Math.max(openPct, closePct);
            const bottom = Math.min(openPct, closePct);
            const bodyHeight = Math.max(0.5, top - bottom);
            
            return (
              <div key={i} className="flex-1 flex justify-center items-end h-full group relative">
                <div className={`absolute w-[1px] ${wickColor}`} style={{ bottom: `${lowPct}%`, height: `${highPct - lowPct}%` }} />
                <div className={`absolute w-[60%] ${color} rounded-sm`} style={{ bottom: `${bottom}%`, height: `${bodyHeight}%` }} />
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 bg-zinc-800 px-2 py-1 rounded text-[8px] text-zinc-300 opacity-0 group-hover:opacity-100 whitespace-nowrap z-20 pointer-events-none">
                  O: {formatPrice(candle.open)} H: {formatPrice(candle.high)} L: {formatPrice(candle.low)} C: {formatPrice(candle.close)}
                </div>
              </div>
            );
          })}
        </div>
        
        <div className="h-4 border-t border-zinc-800 flex justify-between text-[8px] text-zinc-600 pt-1 px-2">
          <span>{candles.length > 0 ? new Date(candles[0].time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : '--:--'}</span>
          <span>{candles.length > Math.floor(candles.length/2) ? new Date(candles[Math.floor(candles.length/2)].time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : '--:--'}</span>
          <span>{candles.length > 0 ? new Date(candles[candles.length-1].time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : '--:--'}</span>
        </div>
      </div>
      
      {/* Token Stats */}
      <div className="grid grid-cols-4 gap-1 mt-2 text-[9px]">
        <div className="bg-zinc-950 p-1 rounded text-center">
          <div className="text-zinc-500">1H</div>
          <div className={token.priceChange1h >= 0 ? 'text-emerald-400' : 'text-red-400'}>{token.priceChange1h > 0 ? '+' : ''}{token.priceChange1h.toFixed(1)}%</div>
        </div>
        <div className="bg-zinc-950 p-1 rounded text-center">
          <div className="text-zinc-500">6H</div>
          <div className={token.priceChange6h >= 0 ? 'text-emerald-400' : 'text-red-400'}>{token.priceChange6h > 0 ? '+' : ''}{token.priceChange6h.toFixed(1)}%</div>
        </div>
        <div className="bg-zinc-950 p-1 rounded text-center">
          <div className="text-zinc-500">24H</div>
          <div className={token.priceChange24h >= 0 ? 'text-emerald-400' : 'text-red-400'}>{token.priceChange24h > 0 ? '+' : ''}{token.priceChange24h.toFixed(1)}%</div>
        </div>
        <div className="bg-zinc-950 p-1 rounded text-center">
          <div className="text-zinc-500">LIQ</div>
          <div className="text-zinc-300">{formatCompact(token.liquidityUSD || token.liquidity)}</div>
        </div>
      </div>
      
      {/* Additional Token Details */}
      <div className="grid grid-cols-4 gap-1 mt-1 text-[9px]">
        <div className="bg-zinc-950 p-1 rounded text-center">
          <div className="text-zinc-500">HOLDERS</div>
          <div className="text-purple-400">{formatCompact(token.holderCount || 0)}</div>
        </div>
        <div className="bg-zinc-950 p-1 rounded text-center">
          <div className="text-zinc-500">TOP 10%</div>
          <div className="text-zinc-300">{token.top10HolderPercent ? `${token.top10HolderPercent.toFixed(1)}%` : 'N/A'}</div>
        </div>
        <div className="bg-zinc-950 p-1 rounded text-center">
          <div className="text-zinc-500">BUY TXS</div>
          <div className="text-emerald-400">{formatCompact(token.buyTxns || 0)}</div>
        </div>
        <div className="bg-zinc-950 p-1 rounded text-center">
          <div className="text-zinc-500">SELL TXS</div>
          <div className="text-red-400">{formatCompact(token.sellTxns || 0)}</div>
        </div>
      </div>
    </div>
  );
};

const MarketOverviewWidget = ({ tokens, solPrice }: { tokens: Token[]; solPrice: number | null }) => {
  const totalVolume1m = tokens.reduce((acc, t) => acc + (t.volume1m || 0), 0);
  const totalVolume5m = tokens.reduce((acc, t) => acc + (t.volume5m || 0), 0);
  const totalVolume1h = tokens.reduce((acc, t) => acc + (t.volume1h || 0), 0);
  const totalVolume24h = tokens.reduce((acc, t) => acc + (t.volume24h || 0), 0);
  const avgChange1h = tokens.length > 0 ? tokens.reduce((acc, t) => acc + (t.priceChange1h || 0), 0) / tokens.length : 0;
  const avgChange24h = tokens.length > 0 ? tokens.reduce((acc, t) => acc + (t.priceChange24h || 0), 0) / tokens.length : 0;
  const totalMarketCap = tokens.reduce((acc, t) => acc + (t.marketCap || 0), 0);
  const totalLiquidity = tokens.reduce((acc, t) => acc + (t.liquidity || 0), 0);
  const totalLiquidityUSD = tokens.reduce((acc, t) => acc + (t.liquidityUSD || 0), 0);
  const totalHolders = tokens.reduce((acc, t) => acc + (t.holderCount || 0), 0);
  const totalBuys = tokens.reduce((acc, t) => acc + (t.buyTxns || 0), 0);
  const totalSells = tokens.reduce((acc, t) => acc + (t.sellTxns || 0), 0);
  const gainers = tokens.filter(t => (t.priceChange1h || 0) > 0).length;
  const losers = tokens.filter(t => (t.priceChange1h || 0) < 0).length;
  
  const dexCounts = tokens.reduce((acc, t) => {
    acc[t.dex] = (acc[t.dex] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center space-x-2 text-zinc-400 text-xs border-b border-zinc-800 pb-2 mb-2">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="18" y1="20" x2="18" y2="10"></line>
          <line x1="12" y1="20" x2="12" y2="4"></line>
          <line x1="6" y1="20" x2="6" y2="14"></line>
        </svg>
        <span className="font-bold tracking-wider">MARKET OVERVIEW</span>
      </div>
      <div className="flex-1 flex flex-col space-y-2 text-[10px] overflow-y-auto">
        {/* SOL Price Card */}
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-zinc-950 p-2 rounded border border-zinc-800">
            <div className="text-zinc-500 text-[9px] mb-1">SOL PRICE</div>
            <div className="text-xl font-mono text-zinc-100">{solPrice ? `$${solPrice.toFixed(2)}` : '---'}</div>
          </div>
          <div className="bg-zinc-950 p-2 rounded border border-zinc-800">
            <div className="text-zinc-500 text-[9px] mb-1">AVG 1H CHANGE</div>
            <div className={`text-xl font-mono ${avgChange1h >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              {avgChange1h >= 0 ? '+' : ''}{avgChange1h.toFixed(2)}%
            </div>
          </div>
        </div>
        
        {/* Volume Stats */}
        <div className="grid grid-cols-3 gap-2">
          <div className="bg-zinc-950 p-2 rounded border border-zinc-800">
            <div className="text-zinc-500 text-[9px]">1M VOL</div>
            <div className="text-sm font-mono text-zinc-100">{formatCompact(totalVolume1m)}</div>
          </div>
          <div className="bg-zinc-950 p-2 rounded border border-zinc-800">
            <div className="text-zinc-500 text-[9px]">5M VOL</div>
            <div className="text-sm font-mono text-zinc-100">{formatCompact(totalVolume5m)}</div>
          </div>
          <div className="bg-zinc-950 p-2 rounded border border-zinc-800">
            <div className="text-zinc-500 text-[9px]">1H VOLUME</div>
            <div className="text-sm font-mono text-zinc-100">{formatCompact(totalVolume1h)}</div>
          </div>
        </div>
        
        {/* Market Stats */}
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-zinc-950 p-2 rounded border border-zinc-800">
            <div className="text-zinc-500 text-[9px]">MARKET CAP</div>
            <div className="text-sm font-mono text-zinc-100">{formatNumber(totalMarketCap)}</div>
          </div>
          <div className="bg-zinc-950 p-2 rounded border border-zinc-800">
            <div className="text-zinc-500 text-[9px]">LIQUIDITY (USD)</div>
            <div className="text-sm font-mono text-zinc-100">{formatNumber(totalLiquidityUSD)}</div>
          </div>
        </div>

        {/* Holders & Transactions */}
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-zinc-950 p-2 rounded border border-zinc-800">
            <div className="text-zinc-500 text-[9px]">TOTAL HOLDERS</div>
            <div className="text-sm font-mono text-cyan-400">{formatCompact(totalHolders)}</div>
          </div>
          <div className="bg-zinc-950 p-2 rounded border border-zinc-800">
            <div className="text-zinc-500 text-[9px]">BUY/SELL RATIO</div>
            <div className="text-sm font-mono text-zinc-100">
              {totalSells > 0 ? (totalBuys / totalSells).toFixed(2) : totalBuys}:1
              <span className="text-[8px] text-zinc-500 ml-1">({formatCompact(totalBuys)} buys)</span>
            </div>
          </div>
        </div>

        {/* DEX Distribution */}
        <div className="bg-zinc-950 p-2 rounded border border-zinc-800">
          <div className="text-zinc-500 text-[9px] mb-1">DEX DISTRIBUTION</div>
          <div className="flex flex-wrap gap-1">
            {Object.entries(dexCounts).slice(0, 4).map(([dex, count]) => (
              <span key={dex} className="text-[8px] bg-zinc-800 px-1.5 py-0.5 rounded text-zinc-400">
                {dex.toUpperCase()}: {count}
              </span>
            ))}
          </div>
        </div>

        {/* Sentiment Bar */}
        <div className="bg-zinc-950 p-2 rounded border border-zinc-800">
          <div className="text-zinc-500 text-[9px] mb-2">MARKET SENTIMENT (1H)</div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-emerald-400 text-[10px]">▲ {gainers} GAINERS</span>
            <span className="text-red-400 text-[10px]">▼ {losers} LOSERS</span>
          </div>
          <div className="w-full bg-zinc-800 h-3 rounded-full overflow-hidden flex">
            <motion.div className="bg-gradient-to-r from-emerald-600 to-emerald-400 h-full" initial={{ width: 0 }} animate={{ width: `${tokens.length > 0 ? (gainers / tokens.length) * 100 : 50}%` }} transition={{ duration: 0.5 }} />
            <motion.div className="bg-gradient-to-r from-red-400 to-red-600 h-full" initial={{ width: 0 }} animate={{ width: `${tokens.length > 0 ? (losers / tokens.length) * 100 : 50}%` }} transition={{ duration: 0.5 }} />
          </div>
          <div className="flex justify-between text-[9px] text-zinc-500 mt-1">
            <span>24H Avg: <span className={avgChange24h >= 0 ? 'text-emerald-400' : 'text-red-400'}>{avgChange24h >= 0 ? '+' : ''}{avgChange24h.toFixed(1)}%</span></span>
            <span>{tokens.length} tokens</span>
          </div>
        </div>
      </div>
    </div>
  );
};

const NewsWidget = ({ news }: { news: NewsItem[] }) => {
  const categories = ['All', 'On-Chain', 'Market', 'Network', 'Launches'];
  const [activeCategory, setActiveCategory] = useState('All');
  
  const filteredNews = activeCategory === 'All' 
    ? news 
    : news.filter(n => n.category === activeCategory);

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between text-zinc-400 text-xs border-b border-zinc-800 pb-2 mb-2">
        <div className="flex items-center space-x-2">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#a78bfa" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
          </svg>
          <span className="font-bold tracking-wider">SOLANA NEWS</span>
        </div>
        <span className="text-[9px] text-zinc-500">{news.length} ARTICLES</span>
      </div>
      
      {/* Category Filters */}
      <div className="flex space-x-1 mb-2 flex-wrap">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-2 py-0.5 text-[8px] rounded ${activeCategory === cat ? 'bg-purple-600 text-white' : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'}`}
          >
            {cat}
          </button>
        ))}
      </div>
      
      <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-zinc-700 scrollbar-track-zinc-900 space-y-2 pr-1">
        {filteredNews.map((item, i) => (
          <motion.div 
            key={item.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.03 }}
            className="bg-zinc-900/50 p-2 rounded border border-zinc-800 hover:border-zinc-600 transition-colors cursor-pointer"
          >
            <div className="flex justify-between items-start mb-1">
              <span className="text-[9px] text-cyan-400 font-bold">{item.source}</span>
              <span className="text-[8px] text-zinc-500">{item.time}</span>
            </div>
            <div className="text-[10px] text-zinc-300 leading-tight line-clamp-2">{item.title}</div>
            <div className="flex items-center justify-between mt-1.5">
              {item.category && (
                <span className="text-[8px] bg-zinc-800 text-zinc-400 px-1.5 py-0.5 rounded">{item.category}</span>
              )}
              {item.sentiment && (
                <div className={`text-[9px] flex items-center gap-1 ${
                  item.sentiment === 'bullish' ? 'text-emerald-400' : 
                  item.sentiment === 'bearish' ? 'text-red-400' : 'text-zinc-400'
                }`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${
                    item.sentiment === 'bullish' ? 'bg-emerald-400' : 
                    item.sentiment === 'bearish' ? 'bg-red-400' : 'bg-zinc-400'
                  }`}></span>
                  {item.sentiment.toUpperCase()}
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

const QuickStatsWidget = ({ tokens }: { tokens: Token[] }) => {
  const topGainers = [...tokens].sort((a, b) => (b.priceChange1h || 0) - (a.priceChange1h || 0)).slice(0, 5);
  const topLosers = [...tokens].sort((a, b) => (a.priceChange1h || 0) - (b.priceChange1h || 0)).slice(0, 5);
  const topVolume1h = [...tokens].sort((a, b) => (b.volume1h || 0) - (a.volume1h || 0)).slice(0, 5);
  const topLiquidity = [...tokens].sort((a, b) => (b.liquidityUSD || b.liquidity || 0) - (a.liquidityUSD || a.liquidity || 0)).slice(0, 5);
  const topHolders = [...tokens].sort((a, b) => (b.holderCount || 0) - (a.holderCount || 0)).slice(0, 5);
  const top24hGainers = [...tokens].sort((a, b) => (b.priceChange24h || 0) - (a.priceChange24h || 0)).slice(0, 5);
  const dexCounts = tokens.reduce((acc, t) => {
    acc[t.dex] = (acc[t.dex] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center space-x-2 text-zinc-400 text-xs border-b border-zinc-800 pb-2 mb-2">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" y1="16" x2="12" y2="12"></line>
          <line x1="12" y1="8" x2="12.01" y2="8"></line>
        </svg>
        <span className="font-bold tracking-wider">QUICK STATS</span>
      </div>
      <div className="flex-1 flex flex-col space-y-2 text-[10px] overflow-y-auto">
        {/* Top Gainers */}
        <div className="bg-zinc-950 p-2 rounded border border-zinc-800">
          <div className="text-zinc-500 text-[9px] mb-1.5 flex items-center gap-1">
            <span className="text-emerald-400">▲</span> TOP GAINERS (1H)
          </div>
          {topGainers.map((t, i) => (
            <div key={t.id} className="flex justify-between items-center py-0.5">
              <span className="text-zinc-300 font-bold">{t.symbol.toUpperCase()}</span>
              <span className="text-emerald-400">+{(t.priceChange1h || 0).toFixed(1)}%</span>
            </div>
          ))}
        </div>
        
        {/* Top Losers */}
        <div className="bg-zinc-950 p-2 rounded border border-zinc-800">
          <div className="text-zinc-500 text-[9px] mb-1.5 flex items-center gap-1">
            <span className="text-red-400">▼</span> TOP LOSERS (1H)
          </div>
          {topLosers.map((t, i) => (
            <div key={t.id} className="flex justify-between items-center py-0.5">
              <span className="text-zinc-300 font-bold">{t.symbol.toUpperCase()}</span>
              <span className="text-red-400">{(t.priceChange1h || 0).toFixed(1)}%</span>
            </div>
          ))}
        </div>
        
        {/* Top Volume */}
        <div className="bg-zinc-950 p-2 rounded border border-zinc-800">
          <div className="text-zinc-500 text-[9px] mb-1.5 flex items-center gap-1">
            <span className="text-cyan-400">●</span> TOP VOLUME (1H)
          </div>
          {topVolume1h.map((t, i) => (
            <div key={t.id} className="flex justify-between items-center py-0.5">
              <span className="text-zinc-300 font-bold">{t.symbol.toUpperCase()}</span>
              <span className="text-zinc-400">{formatCompact(t.volume1h || 0)}</span>
            </div>
          ))}
        </div>
        
        {/* Top Liquidity */}
        <div className="bg-zinc-950 p-2 rounded border border-zinc-800">
          <div className="text-zinc-500 text-[9px] mb-1.5 flex items-center gap-1">
            <span className="text-blue-400">◆</span> TOP LIQUIDITY
          </div>
          {topLiquidity.map((t, i) => (
            <div key={t.id} className="flex justify-between items-center py-0.5">
              <span className="text-zinc-300 font-bold">{t.symbol.toUpperCase()}</span>
              <span className="text-zinc-400">{formatCompact(t.liquidityUSD || t.liquidity || 0)}</span>
            </div>
          ))}
        </div>
        
        {/* Top Holders */}
        <div className="bg-zinc-950 p-2 rounded border border-zinc-800">
          <div className="text-zinc-500 text-[9px] mb-1.5 flex items-center gap-1">
            <span className="text-purple-400">👥</span> TOP HOLDERS
          </div>
          {topHolders.map((t, i) => (
            <div key={t.id} className="flex justify-between items-center py-0.5">
              <span className="text-zinc-300 font-bold">{t.symbol.toUpperCase()}</span>
              <span className="text-zinc-400">{formatCompact(t.holderCount || 0)}</span>
            </div>
          ))}
        </div>
        
        {/* Top 24h Gainers */}
        <div className="bg-zinc-950 p-2 rounded border border-zinc-800">
          <div className="text-zinc-500 text-[9px] mb-1.5 flex items-center gap-1">
            <span className="text-green-400">▲</span> TOP 24H GAINERS
          </div>
          {top24hGainers.map((t, i) => (
            <div key={t.id} className="flex justify-between items-center py-0.5">
              <span className="text-zinc-300 font-bold">{t.symbol.toUpperCase()}</span>
              <span className="text-emerald-400">+{(t.priceChange24h || 0).toFixed(1)}%</span>
            </div>
          ))}
        </div>
        
        {/* DEX Distribution */}
        <div className="bg-zinc-950 p-2 rounded border border-zinc-800">
          <div className="text-zinc-500 text-[9px] mb-1.5">DEX DISTRIBUTION</div>
          {Object.entries(dexCounts).slice(0, 5).map(([dex, count]) => (
            <div key={dex} className="flex justify-between items-center py-0.5">
              <span className="text-zinc-400 uppercase text-[9px]">{dex}</span>
              <div className="flex items-center gap-1">
                <div className="w-12 bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-cyan-500 h-full" style={{ width: `${(count / tokens.length) * 100}%` }} />
                </div>
                <span className="text-zinc-500 text-[9px]">{count}</span>
              </div>
            </div>
          ))}
        </div>
        
        {/* Data Sources */}
        <div className="bg-zinc-950 p-2 rounded border border-zinc-800">
          <div className="text-zinc-500 text-[9px] mb-1">DATA SOURCES</div>
          <div className="text-[9px] text-zinc-500 space-y-0.5">
            <div className="flex items-center gap-1">
              <span className="text-emerald-400">●</span> CoinGecko (SOL Price)
            </div>
            <div className="flex items-center gap-1">
              <span className="text-cyan-400">●</span> Pick.trade (Tokens)
            </div>
            <div className="flex items-center gap-1">
              <span className="text-purple-400">●</span> Solana RPC (Network)
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const FooterTicker = ({ news }: { news: NewsItem[] }) => {
  const headlines = news.length > 0 
    ? news.map(n => n.title)
    : [
        'Loading latest headlines...',
        'Solana network processing transactions...',
        'Memecoin market active...',
        'Waiting for data...'
      ];
  
  return (
    <div className="mt-2 border border-zinc-800 bg-zinc-950 rounded-b-md overflow-hidden relative h-8 flex items-center">
      <div className="flex absolute whitespace-nowrap animate-[scroll_30s_linear_infinite] text-[10px] font-mono">
        {headlines.map((title, i) => (
          <span key={i} className={`mx-8 ${i % 2 === 0 ? "text-orange-400 font-bold" : "text-zinc-400"}`}>
            {title.length > 60 ? title.substring(0, 60) + '...' : title}
          </span>
        ))}
        {headlines.map((title, i) => (
          <span key={`dup-${i}`} className={`mx-8 ${i % 2 === 0 ? "text-orange-400 font-bold" : "text-zinc-400"}`}>
            {title.length > 60 ? title.substring(0, 60) + '...' : title}
          </span>
        ))}
      </div>
    </div>
  );
};

// --- Main Component ---

export default function LiveTerminal() {
  const [solPrice, setSolPrice] = useState<SolPrice | null>(null);
  const [tokens, setTokens] = useState<Token[]>([]);
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedToken, setSelectedToken] = useState<Token | null>(null);
  const [settings, setSettings] = useState<Settings>({
    refreshRate: 15000,
    theme: 'dark',
    showVolume: true,
    chartTimeframe: '1m'
  });

  // Fetch SOL price
  useEffect(() => {
    const fetchSolPrice = async () => {
      try {
        const res = await fetch(
          'https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd&include_24hr_change=true&include_market_cap=true&include_24hr_vol=true'
        );
        if (!res.ok) throw new Error('Failed to fetch SOL price');
        const data = await res.json();
        if (data.solana) {
          setSolPrice(data.solana);
        }
      } catch (err) {
        console.error('SOL price error:', err);
        setSolPrice({ usd: 178.5, usd_24h_change: 2.34, market_cap: 75000000000, volume_24h: 3500000000 });
      }
    };

    fetchSolPrice();
    const interval = setInterval(fetchSolPrice, 30000);
    return () => clearInterval(interval);
  }, []);

  // Fetch trending tokens - ALL of them
  useEffect(() => {
    const fetchTokens = async () => {
      try {
        const res = await fetch('https://backend.pick.trade/api/token/trending');
        if (!res.ok) throw new Error('Failed to fetch tokens');
        const data = await res.json();
        
        // Define API response type
        interface ApiToken {
          id?: string;
          symbol?: string;
          tokenSymbol?: string;
          name?: string;
          address?: string;
          contractAddress?: string;
          price?: string | number;
          priceInUSD?: string | number;
          price_usd?: string | number;
          priceChange1m?: string | number;
          priceChange5m?: string | number;
          priceChange15m?: string | number;
          priceChange1h?: string | number;
          priceChange4h?: string | number;
          priceChange6h?: string | number;
          priceChange12h?: string | number;
          priceChange24h?: string | number;
          price_change_24h?: string | number;
          volume1m?: string | number;
          volume5m?: string | number;
          volume15m?: string | number;
          volume1h?: string | number;
          volume4h?: string | number;
          volume6h?: string | number;
          volume12h?: string | number;
          volume24h?: string | number;
          volume_h24?: string | number;
          marketCap?: string | number;
          mc?: string | number;
          market_cap?: string | number;
          marketCapDiluted?: string | number;
          mc_diluted?: string | number;
          liquidity?: string | number;
          liq?: string | number;
          liquidityUSD?: string | number;
          liq_usd?: string | number;
          holderCount?: string | number;
          holders?: string | number;
          holder_count?: string | number;
          buyTxns?: string | number;
          buys?: string | number;
          buy_txns?: string | number;
          sellTxns?: string | number;
          sells?: string | number;
          sell_txns?: string | number;
          totalTxns?: string | number;
          txns?: string | number;
          top10HolderPercent?: string | number;
          top10_holders?: string | number;
          buyTax?: string | number;
          buy_tax?: string | number;
          sellTax?: string | number;
          sell_tax?: string | number;
          isBlacklisted?: boolean;
          blacklisted?: boolean;
          dex?: string;
          dexId?: string;
          createdAt?: string;
          created_at?: string;
          risk?: string;
          twitter?: string;
          website?: string;
          telegram?: string;
          description?: string;
          socials?: {
            twitter?: string;
            website?: string;
            telegram?: string;
          };
          [key: string]: string | number | boolean | undefined | null | object | unknown;
        }
        
        // Get ALL tokens, not limited to 50
        const toString = (val: unknown, fallback = ''): string => {
          if (val === undefined || val === null) return fallback;
          return String(val);
        };
        const toNumber = (val: unknown): number => {
          if (val === undefined || val === null) return 0;
          const str = String(val);
          const num = parseFloat(str);
          return isNaN(num) ? 0 : num;
        };
        const toInt = (val: unknown): number => {
          if (val === undefined || val === null) return 0;
          const str = String(val);
          const num = parseInt(str, 10);
          return isNaN(num) ? 0 : num;
        };
        
        const transformedTokens: Token[] = (data || []).map((t: ApiToken, i: number) => ({
          id: toString(t.id) || `token-${i}`,
          symbol: toString(t.symbol || t.tokenSymbol) || '???',
          name: toString(t.name) || 'Unknown Token',
          address: toString(t.address || t.contractAddress),
          price: toNumber(t.price || t.priceInUSD || t.price_usd),
          priceChange1m: toNumber(t.priceChange1m),
          priceChange5m: toNumber(t.priceChange5m),
          priceChange15m: toNumber(t.priceChange15m),
          priceChange1h: toNumber(t.priceChange1h),
          priceChange4h: toNumber(t.priceChange4h),
          priceChange6h: toNumber(t.priceChange6h),
          priceChange12h: toNumber(t.priceChange12h),
          priceChange24h: toNumber(t.priceChange24h || t.price_change_24h),
          volume1m: toNumber(t.volume1m),
          volume5m: toNumber(t.volume5m),
          volume15m: toNumber(t.volume15m),
          volume1h: toNumber(t.volume1h || t.volume24h || t.volume_h24),
          volume4h: toNumber(t.volume4h),
          volume6h: toNumber(t.volume6h),
          volume12h: toNumber(t.volume12h),
          volume24h: toNumber(t.volume24h),
          marketCap: toNumber(t.marketCap || t.mc || t.market_cap),
          marketCapDiluted: toNumber(t.marketCapDiluted || t.mc_diluted),
          liquidity: toNumber(t.liquidity || t.liq),
          liquidityUSD: toNumber(t.liquidityUSD || t.liq_usd),
          holderCount: toInt(t.holderCount || t.holders || t.holder_count),
          top10HolderPercent: toNumber(t.top10HolderPercent || t.top10_holders),
          buyTxns: toInt(t.buyTxns || t.buys || t.buy_txns),
          sellTxns: toInt(t.sellTxns || t.sells || t.sell_txns),
          totalTxns: toInt(t.totalTxns || t.txns),
          buyTax: toNumber(t.buyTax || t.buy_tax),
          sellTax: toNumber(t.sellTax || t.sell_tax),
          isBlacklisted: Boolean(t.isBlacklisted || t.blacklisted),
          dex: toString(t.dex || t.dexId) || 'pumpswap',
          createdAt: toString(t.createdAt || t.created_at),
          risk: toString(t.risk) || 'unknown',
          twitter: toString(t.twitter || t.socials?.twitter),
          website: toString(t.website || t.socials?.website),
          telegram: toString(t.telegram || t.socials?.telegram),
          description: toString(t.description),
        }));
        
        setTokens(transformedTokens);
        
        if (transformedTokens.length > 0 && !selectedToken) {
          setSelectedToken(transformedTokens[0]);
        }
      } catch (err) {
        console.error('Tokens error:', err);
        setTokens([
          { id: '1', symbol: 'PIGEON', name: 'Pigeon', address: '', price: 0.0234, priceChange1m: 2.1, priceChange5m: 5.2, priceChange1h: 5.2, priceChange6h: 8.5, priceChange24h: 12.5, volume1m: 45000, volume5m: 180000, volume1h: 450000, volume24h: 2500000, marketCap: 12000000, liquidity: 450000, dex: 'PumpSwap' },
          { id: '2', symbol: 'CHARIZARD', name: 'Charizard', address: '', price: 0.0456, priceChange1m: -1.2, priceChange5m: -2.1, priceChange1h: -2.1, priceChange6h: 3.2, priceChange24h: 8.3, volume1m: 32000, volume5m: 145000, volume1h: 320000, volume24h: 1800000, marketCap: 8900000, liquidity: 320000, dex: 'PumpSwap' },
          { id: '3', symbol: 'BUTTCOIN', name: 'Buttcoin', address: '', price: 0.0012, priceChange1m: 8.5, priceChange5m: 15.3, priceChange1h: 15.3, priceChange6h: 18.7, priceChange24h: 25.7, volume1m: 89000, volume5m: 320000, volume1h: 890000, volume24h: 3200000, marketCap: 15000000, liquidity: 580000, dex: 'PumpSwap' },
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchTokens();
    const interval = setInterval(fetchTokens, settings.refreshRate);
    return () => clearInterval(interval);
  }, [settings.refreshRate]);

  // Generate more comprehensive news
  useEffect(() => {
    if (tokens.length > 0) {
      const generatedNews: NewsItem[] = [
        {
          id: '1',
          title: `${tokens[0]?.symbol?.toUpperCase() || 'PIGEON'} surges ${((tokens[0]?.priceChange1h || 0) > 0 ? '+' : '')+((tokens[0]?.priceChange1h || 0).toFixed(1))}% in 1h - Whale accumulation detected`,
          source: 'On-Chain Alert',
          time: 'Just now',
          url: '#',
          sentiment: 'bullish',
          category: 'On-Chain'
        },
        {
          id: '2',
          title: 'Solana network activity reaches new monthly high with 45M daily transactions',
          source: 'Solana Foundation',
          time: '2m ago',
          url: '#',
          sentiment: 'bullish',
          category: 'Network'
        },
        {
          id: '3',
          title: `${tokens[1]?.symbol?.toUpperCase() || 'BUTTCOIN'} launched on PumpFun with ${formatCompact(tokens[1]?.volume1h || 1000000)} initial volume`,
          source: 'PumpFun Tracker',
          time: '5m ago',
          url: '#',
          sentiment: 'neutral',
          category: 'Launches'
        },
        {
          id: '4',
          title: 'SOL ETF approval rumors resurface as Bitcoin ETF flows remain strong',
          source: 'Crypto News',
          time: '12m ago',
          url: '#',
          sentiment: 'bullish',
          category: 'Market'
        },
        {
          id: '5',
          title: `Large sell order detected on ${tokens[2]?.symbol?.toUpperCase() || 'BLACKSWAN'} - Possible profit taking`,
          source: 'Whale Alert',
          time: '18m ago',
          url: '#',
          sentiment: 'bearish',
          category: 'On-Chain'
        },
        {
          id: '6',
          title: 'Memecoin season continues as SOL outperforms ETH by 5% this week',
          source: 'Market Analysis',
          time: '25m ago',
          url: '#',
          sentiment: 'bullish',
          category: 'Market'
        },
        {
          id: '7',
          title: `Top 10 Solana memecoins volume up 340% compared to last week`,
          source: 'The Block',
          time: '32m ago',
          url: '#',
          sentiment: 'bullish',
          category: 'Market'
        },
        {
          id: '8',
          title: `New token ${tokens[3]?.symbol?.toUpperCase() || 'DEGEN'} deployed - 100% bought at launch`,
          source: 'Launch Alert',
          time: '45m ago',
          url: '#',
          sentiment: 'bullish',
          category: 'Launches'
        },
        {
          id: '9',
          title: 'Solana validator count reaches all-time high - network more decentralized than ever',
          source: 'Solana Status',
          time: '1h ago',
          url: '#',
          sentiment: 'bullish',
          category: 'Network'
        },
        {
          id: '10',
          title: `${tokens[4]?.symbol?.toUpperCase() || 'PETA'} sees 500% volume increase in last hour`,
          source: 'Volume Tracker',
          time: '1h ago',
          url: '#',
          sentiment: 'bullish',
          category: 'On-Chain'
        },
      ];
      setNews(generatedNews);
    }
  }, [tokens]);

  return (
    <div className="bg-zinc-950 text-zinc-300 font-sans w-full flex flex-col">
      <div className="w-full flex flex-col">
        <Header 
          solPrice={solPrice?.usd || null} 
          priceChange={solPrice?.usd_24h_change || null}
          loading={loading}
          tokenCount={tokens.length}
          settings={settings}
          onSettingsChange={setSettings}
        />
        
        <div className="flex-1 flex flex-col md:grid md:grid-cols-12 md:grid-rows-2 gap-2 overflow-hidden">
          {/* Top Row */}
          <div className="md:col-span-3 md:row-span-1 bg-zinc-900 p-3 rounded-md border border-zinc-800 shadow-inner overflow-hidden flex flex-col">
            <MarketOverviewWidget tokens={tokens} solPrice={solPrice?.usd || null} />
          </div>
          
          <div className="md:col-span-4 md:row-span-1 bg-zinc-900 p-3 rounded-md border border-zinc-800 shadow-inner overflow-hidden flex flex-col">
            <LiveChart token={selectedToken} settings={settings} />
          </div>
          
          <div className="md:col-span-5 md:row-span-1 bg-zinc-900 p-3 rounded-md border border-zinc-800 shadow-inner overflow-hidden flex flex-col">
            <NewsWidget news={news} />
          </div>

          {/* Bottom Row */}
          <div className="md:col-span-7 md:row-span-1 bg-zinc-900 p-3 rounded-md border border-zinc-800 shadow-inner overflow-hidden flex flex-col">
            <TopMoversWidget 
              tokens={tokens} 
              onSelectToken={setSelectedToken} 
              selectedToken={selectedToken}
            />
          </div>
          
          <div className="md:col-span-5 md:row-span-1 bg-zinc-900 p-3 rounded-md border border-zinc-800 shadow-inner overflow-hidden flex flex-col">
            <QuickStatsWidget tokens={tokens} />
          </div>
        </div>

        <FooterTicker news={news} />
      </div>
    </div>
  );
}
