import { PortfolioData } from './stacksService';

export interface Badge {
  id: string;
  label: string;
  description: string;
  emoji: string;
  earned: boolean;
}

export interface StacksScore {
  total: number;
  breakdown: {
    balance: number;
    stacking: number;
    activity: number;
    nfts: number;
  };
  tier: 'Newcomer' | 'Builder' | 'Stacker' | 'OG' | 'Legend';
  tierColor: string;
}

export const computeScore = (portfolio: PortfolioData): StacksScore => {
  // Balance score (0–30)
  const balScore = Math.min(30, Math.floor(portfolio.stxBalance / 10));

  // Stacking score (0–25)
  const stackScore = portfolio.stacking.stacked
    ? Math.min(25, 10 + Math.floor(portfolio.stacking.amountStacked / 50))
    : 0;

  // Activity score (0–25): based on tx count
  const actScore = Math.min(25, portfolio.transactionCount * 2);

  // NFT score (0–20)
  const nftScore = Math.min(20, portfolio.nfts.length * 4);

  const total = balScore + stackScore + actScore + nftScore;

  let tier: StacksScore['tier'] = 'Newcomer';
  let tierColor = '#9CA3AF';
  if (total >= 80) { tier = 'Legend'; tierColor = '#F59E0B'; }
  else if (total >= 60) { tier = 'OG'; tierColor = '#8B5CF6'; }
  else if (total >= 40) { tier = 'Stacker'; tierColor = '#3B82F6'; }
  else if (total >= 20) { tier = 'Builder'; tierColor = '#10B981'; }

  return {
    total,
    breakdown: { balance: balScore, stacking: stackScore, activity: actScore, nfts: nftScore },
    tier,
    tierColor,
  };
};

export const computeBadges = (portfolio: PortfolioData): Badge[] => {
  return [
    {
      id: 'stacker',
      label: 'Power Stacker',
      description: 'Stacking STX for Bitcoin yield',
      emoji: '🔒',
      earned: portfolio.stacking.stacked,
    },
    {
      id: 'nft_collector',
      label: 'NFT Collector',
      description: 'Holds 5+ NFTs on Stacks',
      emoji: '🖼️',
      earned: portfolio.nfts.length >= 5,
    },
    {
      id: 'whale',
      label: 'STX Whale',
      description: 'Holds 1,000+ STX',
      emoji: '🐋',
      earned: portfolio.stxBalance >= 1000,
    },
    {
      id: 'active',
      label: 'On-Chain Active',
      description: '10+ transactions on Stacks',
      emoji: '⚡',
      earned: portfolio.transactionCount >= 10,
    },
    {
      id: 'og',
      label: 'OG Holder',
      description: 'Holds 10,000+ STX',
      emoji: '👑',
      earned: portfolio.stxBalance >= 10000,
    },
    {
      id: 'bns',
      label: 'BNS Identity',
      description: 'Owns a .btc name',
      emoji: '🌐',
      earned: !!portfolio.bnsName,
    },
    {
      id: 'defi',
      label: 'DeFi User',
      description: 'Has contract call transactions',
      emoji: '🔄',
      earned: portfolio.transactions.some(tx => tx.type === 'contract_call'),
    },
    {
      id: 'diamond',
      label: 'Diamond Hands',
      description: 'Received more than sent',
      emoji: '💎',
      earned: portfolio.totalReceived > portfolio.totalSent && portfolio.totalReceived > 0,
    },
  ];
};
