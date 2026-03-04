"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// --- Types ---
interface Candle {
  open: number;
  close: number;
  high: number;
  low: number;
}

interface Post {
  id: number;
  author: string;
  text: string;
  sentiment: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
  time: string;
  isNew: boolean;
}

interface TokenData {
  token: string;
  initialPrice: number;
  initialChange: number;
  volume: string;
  alert?: string;
}

// --- Utilities ---
const rand = (min: number, max: number) => Math.random() * (max - min) + min;
const randInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1) + min);

// --- Hooks ---

// Flash effect hook
function useFlash(value: number, duration = 500) {
  const [flashClass, setFlashClass] = useState('');
  const prevValue = useRef(value);

  useEffect(() => {
    if (value !== prevValue.current) {
      const isUp = value > prevValue.current;
      // Defer state update to avoid cascading renders from synchronous setState in effect
      const timeoutId = setTimeout(() => {
        setFlashClass(isUp ? 'flash-green' : 'flash-red');
      }, 0);
      prevValue.current = value;
      const clearTimer = setTimeout(() => setFlashClass(''), duration);
      return () => {
        clearTimeout(timeoutId);
        clearTimeout(clearTimer);
      };
    }
  }, [value, duration]);

  return flashClass;
}

// --- Components ---

const Header = () => {
  const [solPrice, setSolPrice] = useState(165.23);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setSolPrice(prev => +(prev + rand(-0.5, 0.5)).toFixed(2));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const priceFlash = useFlash(solPrice);
  const priceChange = ((solPrice - 165) / 165 * 100).toFixed(2);
  const isPositive = solPrice > 165;

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
          <span>[ALPHA TERMINAL] — SOLANA MEMECOINS — LIVE DATA — <span className="text-emerald-400 animate-pulse">CONNECTED</span></span>
        </div>
        <div className="flex items-center space-x-2 text-zinc-500">
          <button className="hover:text-zinc-300 px-2 transition-colors">−</button>
          <button className="hover:text-zinc-300 px-2 transition-colors">□</button>
          <button className="hover:text-zinc-300 px-2 transition-colors">×</button>
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
        <span className={`transition-colors duration-300 px-1 rounded ${priceFlash}`}>
          SOL PRICE: <span className="font-mono text-zinc-100">${solPrice}</span> 
          <span className={`ml-1 ${isPositive ? 'text-emerald-400' : 'text-red-400'}`}>
            ({isPositive ? '+' : ''}{priceChange}%)
          </span>
        </span>
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

const MapWidget = () => {
  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center space-x-2 text-zinc-400 text-xs pb-2 mb-2">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#22d3ee" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="2" y1="12" x2="22" y2="12"></line>
          <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
        </svg>
        <span className="font-bold tracking-wider">GLOBAL MACRO INTELLIGENCE</span>
      </div>
      <div className="flex-1 relative bg-zinc-950 rounded overflow-hidden flex">
        <div className="w-2/3 relative" style={{ backgroundImage: 'radial-gradient(#3f3f46 1px, transparent 1px)', backgroundSize: '20px 20px' }}>
          <motion.div 
            className="absolute top-[30%] left-[40%] flex items-center justify-center"
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <div className="absolute w-4 h-4 bg-red-500 rounded-full opacity-75 animate-ping"></div>
            <div className="relative w-2 h-2 bg-red-500 rounded-full"></div>
            <span className="absolute top-2 left-4 text-[10px] text-red-400 whitespace-nowrap">Sanction Zones</span>
          </motion.div>
          
          <motion.div 
            className="absolute top-[60%] left-[20%] flex items-center justify-center"
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
          >
            <div className="absolute w-3 h-3 bg-cyan-500 rounded-full opacity-75 animate-ping"></div>
            <div className="relative w-1.5 h-1.5 bg-cyan-500 rounded-full"></div>
            <span className="absolute top-2 left-3 text-[10px] text-cyan-400 whitespace-nowrap">Economic Data</span>
          </motion.div>

          <motion.div 
            className="absolute top-[45%] left-[70%] flex items-center justify-center"
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity, delay: 1 }}
          >
             <div className="absolute w-5 h-5 bg-orange-500 rounded-full opacity-75 animate-ping"></div>
            <div className="relative w-2 h-2 bg-orange-500 rounded-full"></div>
            <span className="absolute top-2 left-4 text-[10px] text-orange-400 whitespace-nowrap">Flashpoint</span>
          </motion.div>
        </div>
        
        <div className="w-1/3 p-3 text-[10px] flex flex-col justify-center space-y-3">
          <div>
            <div className="text-zinc-500 mb-1">CURRENT TREND:</div>
            <div className="text-zinc-300">Regional instability increases risk appetite for speculative SOL assets.</div>
          </div>
          <div>
            <div className="text-zinc-500 mb-1">MARKET IMPACT:</div>
            <div className="text-zinc-300">High volume detected on decentralized exchanges.</div>
          </div>
          <div>
             <div className="text-zinc-500 mb-1">SENTIMENT:</div>
             <div className="text-emerald-400 font-bold animate-pulse">BULLISH</div>
          </div>
        </div>
      </div>
    </div>
  );
};

const FeedWidget = () => {
  const [posts, setPosts] = useState<Post[]>([
    { id: 1, author: '@CryptoKOL1', text: 'Just bought $PEPECOIN SOL! Ready. 🚀', sentiment: 'BULLISH', time: 'Just now', isNew: false },
    { id: 2, author: '@AlphaTraders', text: 'BONK volume spike detected. High conviction.', sentiment: 'BULLISH', time: '1m ago', isNew: false },
    { id: 3, author: '@WhaleAlert', text: 'Large transfer of $WIF to unknown wallet.', sentiment: 'NEUTRAL', time: '3m ago', isNew: false },
    { id: 4, author: '@SolanaMev', text: 'Network congestion slightly up, adjusting slippage.', sentiment: 'BEARISH', time: '5m ago', isNew: false },
  ]);

  useEffect(() => {
    const interval = setInterval(() => {
      const newPost: Post = {
        id: Date.now(),
        author: `@User${randInt(100, 999)}`,
        text: ['LFG 🚀', 'Dip buying on $BONK', 'Market looks frothy...', 'New gem on Raydium'][randInt(0, 3)],
        sentiment: ['BULLISH', 'BEARISH', 'NEUTRAL'][randInt(0, 2)] as 'BULLISH' | 'BEARISH' | 'NEUTRAL',
        time: 'Just now',
        isNew: true
      };
      
      setPosts(prev => [newPost, ...prev.map(p => ({...p, isNew: false}))].slice(0, 10));
    }, randInt(3000, 8000));
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center space-x-2 text-zinc-400 text-xs pb-2 mb-2">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
        </svg>
        <span className="font-bold tracking-wider">KOL SENTIMENT FEED</span>
      </div>
      <div className="flex-1 overflow-hidden relative">
        <div className="absolute inset-0 overflow-y-auto space-y-2 pr-1">
          <AnimatePresence>
            {posts.map(post => (
              <motion.div
                key={post.id}
                initial={post.isNew ? { opacity: 0, x: -20 } : false}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0 }}
                className={`flex space-x-2 text-[10px] sm:text-xs p-2 rounded transition-all ${post.isNew ? 'bg-cyan-900/20 border border-cyan-500/30' : 'bg-transparent hover:bg-zinc-800/50'}`}
              >
                <div className="mt-1 flex-shrink-0">
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-cyan-400 to-purple-500 flex items-center justify-center text-[8px] text-white font-bold">
                    {post.author.substring(1,3)}
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between">
                    <span className="text-cyan-400 font-bold truncate">{post.author}</span>
                    <span className="text-zinc-600 text-[9px] flex-shrink-0">{post.time}</span>
                  </div>
                  <div className="text-zinc-300 mt-1 truncate">{post.text}</div>
                  <div className="mt-1 flex items-center space-x-1">
                    <span className="text-zinc-500">(</span>
                    <span className={post.sentiment === 'BULLISH' ? 'text-emerald-400' : post.sentiment === 'BEARISH' ? 'text-red-400' : 'text-zinc-400'}>
                      {post.sentiment}
                    </span>
                    <span className="text-zinc-500">)</span>
                    {post.sentiment === 'BULLISH' && (
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2" className="ml-1">
                        <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline>
                        <polyline points="17 6 23 6 23 12"></polyline>
                      </svg>
                    )}
                    {post.sentiment === 'BEARISH' && (
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" className="ml-1">
                        <polyline points="23 18 13.5 8.5 8.5 13.5 1 6"></polyline>
                        <polyline points="17 18 23 18 23 12"></polyline>
                      </svg>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

const ChartWidget = () => {
  // Initialize candles directly to avoid setState in useEffect
  const [candles] = useState<Candle[]>(() => {
    let currentPrice = 0.0028000;
    return Array.from({ length: 40 }, () => {
      const open = currentPrice;
      const close = currentPrice + rand(-0.00005, 0.00005);
      const high = Math.max(open, close) + rand(0, 0.00003);
      const low = Math.min(open, close) - rand(0, 0.00003);
      currentPrice = close;
      return { open, close, high, low };
    });
  });

  const currentPrice = candles.length > 0 ? candles[candles.length - 1].close.toFixed(7) : "0.0000000";

  return (
    <div className="flex flex-col h-full">
      <div className="flex justify-between items-center text-zinc-400 text-xs pb-2 mb-2">
        <div className="flex items-center space-x-2">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#22d3ee" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="20" x2="18" y2="10"></line>
            <line x1="12" y1="20" x2="12" y2="4"></line>
            <line x1="6" y1="20" x2="6" y2="14"></line>
          </svg>
          <span className="font-bold tracking-wider">WIF/SOL — 1m</span>
        </div>
        <div className="text-emerald-400 bg-emerald-900/20 px-2 py-0.5 rounded animate-pulse text-xs">{currentPrice}</div>
      </div>
      <div className="flex-1 relative bg-zinc-950 rounded p-2 flex flex-col">
         <div className="absolute top-2 left-2 text-[10px] text-zinc-500 z-10">
           <span className="text-cyan-400 font-bold">WIF/SOL</span> 1m <span className="text-emerald-400">+3.47%</span><br/>
           <span className="text-cyan-500 animate-pulse">● Live</span>
         </div>
         
         <div className="flex-1 flex items-end space-x-0.5 pb-4 px-2">
            {candles.map((c, i) => {
              const isUp = c.close >= c.open;
              const color = isUp ? 'bg-emerald-500' : 'bg-red-500';
              const minLog = 0.0027000;
              const maxLog = 0.0030000;
              const range = maxLog - minLog;
              
              const hPct = ((c.high - minLog) / range) * 100;
              const lPct = ((c.low - minLog) / range) * 100;
              const oPct = ((c.open - minLog) / range) * 100;
              const cPct = ((c.close - minLog) / range) * 100;
              
              const top = Math.max(oPct, cPct);
              const bottom = Math.min(oPct, cPct);
              const height = Math.max(0.5, top - bottom);

              return (
                <div key={i} className="relative flex-1 flex justify-center items-end h-full">
                  <div className={`absolute w-px ${color} opacity-70`} style={{ bottom: `${lPct}%`, height: `${hPct - lPct}%` }} />
                  <div className={`absolute w-full max-w-[3px] ${color}`} style={{ bottom: `${bottom}%`, height: `${height}%` }} />
                </div>
              );
            })}
         </div>
         
         <div className="h-4 border-t border-zinc-800 flex justify-between text-[8px] text-zinc-600 pt-1">
           <span>13:00</span>
           <span>13:30</span>
           <span>13:50</span>
           <span>14:10</span>
         </div>
      </div>
    </div>
  );
};

const OrderRow = ({ price, amount, type }: { price: number; amount: number; type: 'Ask' | 'Bid' }) => {
  const [val, setVal] = useState(amount);
  const flash = useFlash(val, 300);

  useEffect(() => {
    const int = setInterval(() => {
      if (Math.random() > 0.7) setVal(prev => prev + randInt(-5, 5));
    }, randInt(500, 2000));
    return () => clearInterval(int);
  }, []);

  return (
    <div className={`flex justify-between text-[10px] font-mono px-1 py-0.5 ${flash}`}>
      <span className="text-zinc-500">{type}</span>
      <span className={type === 'Ask' ? 'text-red-400' : 'text-emerald-400'}>{price.toFixed(5)}</span>
      <span className="text-zinc-300">{Math.max(1, val)}</span>
    </div>
  );
}

const OrderBookWidget = () => {
  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center space-x-2 text-zinc-400 text-xs pb-2 mb-2">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#a855f7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="8" y1="6" x2="21" y2="6"></line>
          <line x1="8" y1="12" x2="21" y2="12"></line>
          <line x1="8" y1="18" x2="21" y2="18"></line>
          <line x1="3" y1="6" x2="3.01" y2="6"></line>
          <line x1="3" y1="12" x2="3.01" y2="12"></line>
          <line x1="3" y1="18" x2="3.01" y2="18"></line>
        </svg>
        <span className="font-bold tracking-wider">ORDER BOOK</span>
      </div>
      <div className="flex flex-col flex-1 bg-zinc-950 rounded p-1">
        <div className="flex justify-between text-[9px] text-zinc-600 px-1 mb-1">
          <span>TYPE</span><span>PRICE</span><span>SIZE</span>
        </div>
        
        <div className="flex-1 flex flex-col justify-end space-y-[1px]">
          <OrderRow type="Ask" price={0.09950} amount={190} />
          <OrderRow type="Ask" price={0.07350} amount={84} />
          <OrderRow type="Ask" price={0.07570} amount={120} />
          <OrderRow type="Ask" price={0.07280} amount={189} />
          <OrderRow type="Ask" price={0.07510} amount={189} />
        </div>
        
        <div className="my-1 py-1 text-center font-bold text-emerald-400 text-xs bg-zinc-900/50">
          2.9750 <span className="text-[9px] text-zinc-400">SOL</span>
        </div>
        
        <div className="flex-1 flex flex-col space-y-[1px]">
          <OrderRow type="Bid" price={0.15550} amount={177} />
          <OrderRow type="Bid" price={0.10020} amount={120} />
          <OrderRow type="Bid" price={0.09350} amount={75} />
          <OrderRow type="Bid" price={0.03820} amount={75} />
          <OrderRow type="Bid" price={0.02350} amount={109} />
        </div>
      </div>
    </div>
  );
};

const TopMoversRow = ({ token, initialPrice, initialChange, volume, alert }: TokenData) => {
  const [price, setPrice] = useState(initialPrice);
  const [change, setChange] = useState(initialChange);
  const flash = useFlash(price, 800);

  useEffect(() => {
    const int = setInterval(() => {
      if (Math.random() > 0.5) {
        setPrice((p: number) => +(p + rand(-0.01, 0.01)).toFixed(3));
        setChange((c: number) => +(c + rand(-0.2, 0.2)).toFixed(1));
      }
    }, randInt(2000, 5000));
    return () => clearInterval(int);
  }, []);

  return (
    <div className={`grid grid-cols-4 gap-2 text-[10px] items-center py-1.5 transition-colors duration-300 ${flash}`}>
      <div className="flex items-center space-x-1 font-bold text-zinc-200">
        <div className="w-3 h-3 rounded-full bg-orange-500/80"></div>
        <span>${token}</span>
      </div>
      <div className="text-right font-mono text-zinc-300">${price.toFixed(3)}</div>
      <div className={`text-right ${change >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
        {change > 0 ? '+' : ''}{change}%
      </div>
      <div className="text-right flex flex-col items-end">
        <span className="text-zinc-400">{volume}</span>
        {alert && (
          <span className="text-[8px] text-amber-400 flex items-center mt-0.5">
            <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="mr-0.5">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
              <line x1="12" y1="9" x2="12" y2="13"></line>
              <line x1="12" y1="17" x2="12.01" y2="17"></line>
            </svg>
            {alert}
          </span>
        )}
      </div>
    </div>
  );
}

const TopMoversWidget = () => {
  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center space-x-2 text-zinc-400 text-xs pb-2 mb-2">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#eab308" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
        </svg>
        <span className="font-bold tracking-wider">TOP MOVERS</span>
      </div>
      <div className="flex-1 overflow-hidden flex flex-col">
        <div className="grid grid-cols-4 gap-2 text-[9px] text-zinc-600 mb-1 px-1">
          <div>TOKEN</div>
          <div className="text-right">PRICE</div>
          <div className="text-right">24H %</div>
          <div className="text-right">VOL</div>
        </div>
        <div className="flex-1 overflow-y-auto">
          <TopMoversRow token="BONK" initialPrice={0.095} initialChange={2.4} volume="360 SOL" alert="WHALE" />
          <TopMoversRow token="MYRO" initialPrice={0.150} initialChange={-1.5} volume="5.8 SOL" alert="Wallet" />
          <TopMoversRow token="WIF" initialPrice={0.170} initialChange={-1.1} volume="25 SOL" alert="1M Acc" />
          <TopMoversRow token="PEPECOIN" initialPrice={0.010} initialChange={1.4} volume="4.1 SOL" />
          <TopMoversRow token="SAMO" initialPrice={0.042} initialChange={5.2} volume="12 SOL" />
          <TopMoversRow token="DUST" initialPrice={0.890} initialChange={-0.5} volume="1.2 SOL" />
        </div>
      </div>
    </div>
  );
};

const AnalyticsWidget = () => {
  const [liquidity, setLiquidity] = useState(80124);
  const flash = useFlash(liquidity, 400);

  useEffect(() => {
    const int = setInterval(() => {
      setLiquidity(prev => prev + randInt(-100, 100));
    }, 2500);
    return () => clearInterval(int);
  }, []);

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center space-x-2 text-zinc-400 text-xs pb-2 mb-2">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#22d3ee" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
        </svg>
        <span className="font-bold tracking-wider">ON-CHAIN ANALYTICS</span>
      </div>
      <div className="flex-1 flex flex-col space-y-4 text-[10px]">
        
        <div>
          <div className="text-zinc-500 font-bold mb-1">LIQUIDITY DEPTH</div>
          <div className={`font-mono text-zinc-200 transition-colors ${flash}`}>
            ${liquidity.toLocaleString()}
          </div>
          <div className="w-full bg-zinc-800 h-1.5 mt-1 rounded overflow-hidden">
            <motion.div 
              className="bg-cyan-500 h-full"
              initial={{ width: 0 }}
              animate={{ width: '65%' }}
              transition={{ duration: 1, delay: 0.5 }}
            />
          </div>
        </div>

        <div>
          <div className="text-zinc-500 font-bold mb-1">HOLDER CONCENTRATION</div>
          <div className="grid grid-cols-2 gap-1 text-zinc-300">
            <div>78.7% <span className="text-zinc-500">Top 100</span></div>
            <div>1.00% <span className="text-zinc-500">Holders</span></div>
            <div className="col-span-2 text-amber-400 flex items-center">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="mr-1">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                <line x1="12" y1="9" x2="12" y2="13"></line>
                <line x1="12" y1="17" x2="12.01" y2="17"></line>
              </svg>
              High Concentration Warning
            </div>
          </div>
        </div>

        <div>
          <div className="text-zinc-500 font-bold mb-1">TOKEN METADATA</div>
          <div className="text-zinc-300 bg-zinc-950 p-2 rounded font-mono text-[9px] break-all">
            [Project XYZ] Launch<br/>
            <span className="text-cyan-400">So11111111111111111111111111111111111111112</span>
          </div>
        </div>

      </div>
    </div>
  );
};

const FooterTicker = () => {
  const messages = [
    { text: '₿ BTC HITS NEW HIGH', color: 'text-orange-500' },
    { text: 'UKRAINE CONFLICT ESCALATES', color: '' },
    { text: 'SEC APPROVES ETH ETF', color: '' },
    { text: '$WIF LAUNCHED', color: 'text-emerald-400' },
    { text: 'NEW SANCTIONS ON RUSSIA', color: '' },
    { text: '⚠️ WHALE ACTIVITY DETECTED', color: 'text-red-400' },
  ];

  return (
    <div className="mt-2 bg-zinc-950 overflow-hidden relative h-6 flex items-center">
      <motion.div 
        className="absolute whitespace-nowrap flex items-center"
        animate={{ x: ['100vw', '-100%'] }}
        transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
      >
        {messages.map((msg, i) => (
          <span key={i} className={`${msg.color} font-bold text-[10px] mx-8`}>{msg.text}</span>
        ))}
        {messages.map((msg, i) => (
          <span key={`dup-${i}`} className={`${msg.color} font-bold text-[10px] mx-8`}>{msg.text}</span>
        ))}
      </motion.div>
    </div>
  );
};

// --- Main Component ---
export default function AlphaTerminal() {
  return (
    <div className="bg-zinc-950 text-zinc-300 font-sans w-full flex flex-col">
      <div className="w-full flex flex-col">
        <Header />
        
        <div className="grid grid-cols-12 grid-rows-2 gap-2 w-full">
          {/* Top Row */}
          <motion.div 
            className="col-span-7 row-span-1 bg-zinc-900 p-3 rounded-lg overflow-hidden flex flex-col"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <MapWidget />
          </motion.div>
          <motion.div 
            className="col-span-5 row-span-1 bg-zinc-900 p-3 rounded-lg overflow-hidden flex flex-col"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <FeedWidget />
          </motion.div>

          {/* Bottom Row */}
          <motion.div 
            className="col-span-3 row-span-1 bg-zinc-900 p-3 rounded-lg overflow-hidden flex flex-col"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <ChartWidget />
          </motion.div>
          <motion.div 
            className="col-span-2 row-span-1 bg-zinc-900 p-3 rounded-lg overflow-hidden flex flex-col"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <OrderBookWidget />
          </motion.div>
          <motion.div 
            className="col-span-4 row-span-1 bg-zinc-900 p-3 rounded-lg overflow-hidden flex flex-col"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <TopMoversWidget />
          </motion.div>
          <motion.div 
            className="col-span-3 row-span-1 bg-zinc-900 p-3 rounded-lg overflow-hidden flex flex-col"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            <AnalyticsWidget />
          </motion.div>
        </div>

        <FooterTicker />
      </div>
    </div>
  );
}
