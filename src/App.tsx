import React, { useState } from 'react';
import { connectWallet } from './services/web3Service';
import { fetchPortfolio, PortfolioData } from './services/stacksService';
import Dashboard from './components/Dashboard';

type AppState = 'idle' | 'loading' | 'success' | 'error';

const App: React.FC = () => {
  const [state, setState] = useState<AppState>('idle');
  const [address, setAddress] = useState<string | null>(null);
  const [portfolio, setPortfolio] = useState<PortfolioData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleConnect = async () => {
    try {
      setState('loading');
      setError(null);
      const addr = await connectWallet();
      setAddress(addr);
      const data = await fetchPortfolio(addr);
      setPortfolio(data);
      setState('success');
    } catch (e: any) {
      setError(e.message || 'Something went wrong');
      setState('error');
    }
  };

  const handleReset = () => {
    setState('idle');
    setAddress(null);
    setPortfolio(null);
    setError(null);
  };

  if (state === 'success' && portfolio && address) {
    return <Dashboard portfolio={portfolio} address={address} onReset={handleReset} />;
  }

  return (
    <div className="min-h-screen bg-white flex flex-col font-sans">
      <header className="px-8 py-6 flex items-center justify-between border-b border-black/8">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 bg-black rounded-sm flex items-center justify-center">
            <span className="text-white font-black text-xs">SF</span>
          </div>
          <span className="font-bold text-lg tracking-tight">Stacks<span className="font-light">Folio</span></span>
        </div>
        <span className="text-xs font-mono text-black/30 uppercase tracking-widest">Bitcoin Layer</span>
      </header>

      <main className="flex-grow flex flex-col items-center justify-center px-6 text-center">
        <div className="max-w-lg space-y-10">
          <div className="space-y-4">
            <p className="text-xs font-mono uppercase tracking-[0.3em] text-black/30">Your on-chain portfolio</p>
            <h1 className="text-6xl md:text-7xl font-black tracking-tighter leading-[0.9]">
              Know your<br/>
              <span className="relative inline-block">
                Stacks.
                <span className="absolute bottom-1 left-0 w-full h-[3px] bg-black"></span>
              </span>
            </h1>
            <p className="text-black/50 text-lg leading-relaxed max-w-sm mx-auto">
              Connect your Leather wallet to see your STX balance, stacking rewards, NFTs, and full transaction history.
            </p>
          </div>

          <div className="space-y-4">
            <button
              onClick={handleConnect}
              disabled={state === 'loading'}
              className="group w-full max-w-xs mx-auto flex items-center justify-center gap-3 bg-black text-white px-8 py-4 font-bold text-sm uppercase tracking-widest hover:bg-black/80 transition-colors disabled:opacity-40"
            >
              {state === 'loading' ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                  Loading...
                </>
              ) : (
                <>
                  Connect Leather
                  <span className="group-hover:translate-x-1 transition-transform">→</span>
                </>
              )}
            </button>

            {state === 'error' && (
              <div className="border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 max-w-xs mx-auto text-left">
                <span className="font-bold">Error:</span> {error}
                <button onClick={() => setState('idle')} className="block mt-1 text-xs underline">Try again</button>
              </div>
            )}
          </div>

          <div className="flex items-center justify-center gap-8 text-xs font-mono text-black/20 uppercase tracking-widest">
            <span>Balance</span>
            <span>·</span>
            <span>Stacking</span>
            <span>·</span>
            <span>NFTs</span>
            <span>·</span>
            <span>Transactions</span>
          </div>
        </div>
      </main>

      <footer className="px-8 py-5 border-t border-black/8 flex items-center justify-between text-xs text-black/25 font-mono">
        <span>Built on Stacks · Bitcoin L2</span>
        <a href="https://x.com/ddtrvlr" target="_blank" rel="noreferrer" className="hover:text-black/50 transition-colors">@ddtrvlr</a>
      </footer>
    </div>
  );
};

export default App;
