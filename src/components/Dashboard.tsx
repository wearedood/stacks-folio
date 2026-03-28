import React, { useState } from 'react';
import { PortfolioData } from '../services/stacksService';
import { computeScore, computeBadges } from '../services/scoreService';
import ScoreCard from './ScoreCard';
import WalletPixelPlanet from './WalletPixelPlanet';
import AISummary from './AISummary';
import PriceChart from './PriceChart';
import TokenBalances from './TokenBalances';
import Leaderboard from './Leaderboard';

interface Props { portfolio: PortfolioData; address: string; onReset: () => void; refreshing?: boolean; }
type Tab = 'overview' | 'score' | 'tokens' | 'transactions' | 'nfts' | 'leaderboard';

const fmt = (n: number, d = 2) => n.toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d });
const fmtDate = (ts: number) => !ts ? '—' : new Date(ts * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
const shortAddr = (addr: string) => addr ? `${addr.slice(0, 6)}...${addr.slice(-4)}` : '—';
const txTypeLabel = (type: string) => ({ token_transfer: 'Transfer', contract_call: 'Contract', smart_contract: 'Deploy', coinbase: 'Coinbase' }[type] ?? type);

const Dashboard: React.FC<Props> = ({ portfolio, address, onReset, refreshing }) => {
  const [tab, setTab] = useState<Tab>('overview');
  const score = computeScore(portfolio);
  const badges = computeBadges(portfolio);
  const earnedBadges = badges.filter(b => b.earned);

  const shareText = encodeURIComponent(
    `My @Stacks wallet score: ${score.total}/100 · ${score.tier} ⚡\n\nJust explored my on-chain portfolio with StacksFolio — built on Bitcoin L2.\n\nCheck yours 👇\nhttps://stacks-folio.vercel.app\n\n@talentprotocol #Stacks #Bitcoin #BuildOnStacks\n\nby @ddtrvlr`
  );
  const xUrl = `https://twitter.com/intent/tweet?text=${shareText}`;
  const castUrl = `https://warpcast.com/~/compose?text=${shareText}`;

  const tabs: { id: Tab; label: string }[] = [
    { id: 'overview', label: 'Overview' },
    { id: 'score', label: `Score · ${score.total}` },
    { id: 'tokens', label: 'Tokens' },
    { id: 'transactions', label: 'Txns' },
    { id: 'nfts', label: `NFTs${portfolio.nfts.length ? ` · ${portfolio.nfts.length}` : ''}` },
    { id: 'leaderboard', label: 'Leaderboard' },
  ];

  return (
    <div className="min-h-screen bg-[#F7F7F5] font-sans">
      <header className="bg-white border-b border-black/8 px-6 py-4 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 bg-black rounded-sm flex items-center justify-center">
            <span className="text-white font-black text-xs">SF</span>
          </div>
          <span className="font-bold text-lg tracking-tight">Stacks<span className="font-light">Folio</span></span>
        </div>
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-2 bg-black/5 px-3 py-1.5 rounded-full">
            {portfolio.bnsName && <span className="text-xs font-bold">{portfolio.bnsName}</span>}
            <span className="text-xs font-mono text-black/40">{shortAddr(address)}</span>
          </div>
          <div className="flex items-center gap-3">
          {refreshing && <span className="text-[10px] font-mono text-black/30 uppercase tracking-widest animate-pulse">Refreshing...</span>}
          <button onClick={onReset} className="text-xs font-mono text-black/30 uppercase tracking-widest hover:text-black transition-colors">Disconnect</button>
        </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8 space-y-6">

        {/* Balance card */}
        <div className="bg-black text-white p-8">
          <p className="text-white/40 text-xs font-mono uppercase tracking-widest mb-2">Total Balance</p>
          <div className="flex items-end gap-3 mb-1">
            <h2 className="text-5xl font-black tracking-tighter">{fmt(portfolio.stxBalance)}</h2>
            <span className="text-white/50 text-xl font-light mb-1">STX</span>
          </div>
          <p className="text-white/40 text-lg">${fmt(portfolio.stxBalanceUsd)} <span className="text-sm">USD</span></p>
          <div className="mt-4 inline-flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-full">
            <span className="text-xs font-mono text-white/50 uppercase tracking-wider">Score</span>
            <span className="text-sm font-black" style={{ color: score.tierColor }}>{score.total}</span>
            <span className="text-xs text-white/30">/100</span>
            <span className="text-xs font-bold" style={{ color: score.tierColor }}>{score.tier}</span>
          </div>
          {earnedBadges.length > 0 && (
            <div className="mt-3 flex gap-1 flex-wrap">
              {earnedBadges.map(b => <span key={b.id} title={b.label} className="text-base">{b.emoji}</span>)}
            </div>
          )}
          <div className="mt-6 pt-6 border-t border-white/10 grid grid-cols-3 gap-4">
            <div>
              <p className="text-white/30 text-xs font-mono uppercase tracking-wider mb-1">Received</p>
              <p className="font-bold text-sm">{fmt(portfolio.totalReceived)} STX</p>
            </div>
            <div>
              <p className="text-white/30 text-xs font-mono uppercase tracking-wider mb-1">Sent</p>
              <p className="font-bold text-sm">{fmt(portfolio.totalSent)} STX</p>
            </div>
            <div>
              <p className="text-white/30 text-xs font-mono uppercase tracking-wider mb-1">STX Price</p>
              <p className="font-bold text-sm">${fmt(portfolio.stxPrice, 4)}</p>
            </div>
          </div>
        </div>

        {/* Stacking */}
        {portfolio.stacking.stacked && (
          <div className="bg-white border border-black/8 p-6">
            <div className="flex items-center justify-between mb-4">
              <p className="text-xs font-mono uppercase tracking-widest text-black/30">Stacking</p>
              <span className="bg-green-50 text-green-700 text-xs font-bold px-2 py-0.5 border border-green-200">ACTIVE</span>
            </div>
            <div className="flex items-end gap-2">
              <span className="text-3xl font-black tracking-tighter">{fmt(portfolio.stacking.amountStacked)}</span>
              <span className="text-black/40 mb-1">STX locked</span>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="flex border-b border-black/10 overflow-x-auto">
          {tabs.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`px-4 py-3 text-xs font-mono uppercase tracking-widest transition-colors border-b-2 -mb-px whitespace-nowrap ${tab === t.id ? 'border-black text-black' : 'border-transparent text-black/30 hover:text-black/60'}`}>
              {t.label}
            </button>
          ))}
        </div>

        {/* Overview */}
        {tab === 'overview' && (
          <div className="space-y-4">
            <PriceChart />
            <div className="bg-white border border-black/8 divide-y divide-black/5">
              {[
                { label: 'Wallet Address', value: shortAddr(address) },
                { label: 'BNS Name', value: portfolio.bnsName ?? '—' },
                { label: 'STX Balance', value: `${fmt(portfolio.stxBalance)} STX` },
                { label: 'USD Value', value: `$${fmt(portfolio.stxBalanceUsd)}` },
                { label: 'Locked', value: portfolio.stacking.stacked ? `${fmt(portfolio.stacking.amountStacked)} STX` : 'Not stacking' },
                { label: 'Total Received', value: `${fmt(portfolio.totalReceived)} STX` },
                { label: 'Total Sent', value: `${fmt(portfolio.totalSent)} STX` },
                { label: 'NFTs', value: portfolio.nfts.length > 0 ? `${portfolio.nfts.length} tokens` : '—' },
              ].map(({ label, value }) => (
                <div key={label} className="flex items-center justify-between px-5 py-3.5">
                  <span className="text-xs font-mono uppercase tracking-widest text-black/30">{label}</span>
                  <span className="text-sm font-medium">{value}</span>
                </div>
              ))}
            </div>
            <AISummary portfolio={portfolio} />
            <WalletPixelPlanet portfolio={portfolio} score={score} address={address} />
            <div className="flex gap-2">
              <a href={xUrl} target="_blank" rel="noreferrer"
                className="flex-1 bg-black text-white text-center py-3 text-xs font-bold uppercase tracking-widest hover:bg-black/80 transition-colors">
                Post on X
              </a>
              <a href={castUrl} target="_blank" rel="noreferrer"
                className="flex-1 bg-[#8A63D2] text-white text-center py-3 text-xs font-bold uppercase tracking-widest hover:bg-[#7952c4] transition-colors">
                Cast
              </a>
            </div>
            <p className="text-center text-[10px] font-mono text-black/20">
              Built by <a href="https://x.com/ddtrvlr" target="_blank" rel="noreferrer" className="hover:text-black/40 transition-colors">@ddtrvlr</a>
            </p>
          </div>
        )}

        {/* Score */}
        {tab === 'score' && <ScoreCard score={score} badges={badges} />}

        {/* Tokens */}
        {tab === 'tokens' && <TokenBalances address={address} />}

        {/* Transactions */}
        {tab === 'transactions' && (
          <div className="bg-white border border-black/8 divide-y divide-black/5">
            {portfolio.transactions.length === 0
              ? <p className="px-5 py-8 text-center text-black/30 text-sm">No transactions found</p>
              : portfolio.transactions.map(tx => (
                <a key={tx.txid} href={`https://explorer.hiro.so/txid/${tx.txid}?chain=mainnet`}
                  target="_blank" rel="noreferrer"
                  className="flex items-center justify-between px-5 py-4 hover:bg-black/2 transition-colors group">
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full flex-shrink-0 ${tx.status === 'success' ? 'bg-green-400' : tx.status === 'pending' ? 'bg-yellow-400' : 'bg-red-400'}`}></div>
                    <div>
                      <p className="text-sm font-medium">{txTypeLabel(tx.type)}</p>
                      <p className="text-xs text-black/30 font-mono">{fmtDate(tx.timestamp)}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    {tx.amount !== undefined && <p className="text-sm font-bold">{fmt(tx.amount)} STX</p>}
                    {tx.contractName && <p className="text-xs text-black/30 font-mono truncate max-w-[120px]">{tx.contractName.split('.')[1] ?? tx.contractName}</p>}
                    <span className="text-xs text-black/20 group-hover:text-black/40">↗</span>
                  </div>
                </a>
              ))}
          </div>
        )}

        {/* NFTs */}
        {tab === 'nfts' && (
          portfolio.nfts.length === 0
            ? <div className="bg-white border border-black/8 px-5 py-12 text-center text-black/30 text-sm">No NFTs found</div>
            : <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {portfolio.nfts.map((nft, i) => (
                  <div key={i} className="bg-white border border-black/8 overflow-hidden">
                    <div className="aspect-square bg-black/5 relative">
                      {nft.cachedImageUrl || nft.imageUrl ? (
                        <img
                          src={nft.cachedImageUrl ?? nft.imageUrl}
                          alt={nft.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            // fallback to imageUrl if cached fails
                            const img = e.currentTarget;
                            if (nft.imageUrl && img.src !== nft.imageUrl) {
                              img.src = nft.imageUrl;
                            } else {
                              img.style.display = 'none';
                            }
                          }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <span className="text-2xl font-black text-black/10">#{nft.tokenId}</span>
                        </div>
                      )}
                    </div>
                    <div className="p-3">
                      <p className="text-xs font-bold truncate">{nft.name}</p>
                      <p className="text-xs text-black/30 font-mono">#{nft.tokenId}</p>
                    </div>
                  </div>
                ))}
              </div>
        )}

        {/* Leaderboard */}
        {tab === 'leaderboard' && (
          <Leaderboard
            currentAddress={address}
            currentScore={score}
            currentBadges={earnedBadges.length}
          />
        )}

        <div className="text-center pb-4">
          <a href={`https://explorer.hiro.so/address/${address}?chain=mainnet`}
            target="_blank" rel="noreferrer"
            className="text-xs font-mono uppercase tracking-widest text-black/25 hover:text-black/60 transition-colors">
            View full history on Hiro Explorer ↗
          </a>
        </div>
      </main>

      <footer className="border-t border-black/8 px-6 py-5 flex items-center justify-between text-xs text-black/25 font-mono">
        <span>StacksFolio · Bitcoin L2</span>
        <a href="https://x.com/ddtrvlr" target="_blank" rel="noreferrer" className="hover:text-black/50 transition-colors">@ddtrvlr</a>
      </footer>
    </div>
  );
};

export default Dashboard;
