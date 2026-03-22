const HIRO_API = 'https://api.hiro.so';

export interface Transaction {
  txid: string;
  type: string;
  status: string;
  timestamp: number;
  amount?: number;
  sender?: string;
  recipient?: string;
  contractName?: string;
  fee: number;
}

export interface NFT {
  contractId: string;
  tokenId: string;
  name: string;
}

export interface StackingInfo {
  stacked: boolean;
  amountStacked: number;
}

export interface PortfolioData {
  address: string;
  stxBalance: number;
  stxBalanceUsd: number;
  stxPrice: number;
  lockedBalance: number;
  totalReceived: number;
  totalSent: number;
  transactionCount: number;
  transactions: Transaction[];
  nfts: NFT[];
  stacking: StackingInfo;
  bnsName?: string;
}

const fetchJson = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
};

export const fetchPortfolio = async (address: string): Promise<PortfolioData> => {
  const [balanceData, txData, nftData, priceData, bnsData] = await Promise.allSettled([
    fetchJson(`${HIRO_API}/extended/v1/address/${address}/stx`),
    fetchJson(`${HIRO_API}/extended/v1/address/${address}/transactions?limit=20`),
    fetchJson(`${HIRO_API}/extended/v1/tokens/nft/holdings?principal=${address}&limit=20`),
    fetchJson(`https://api.coingecko.com/api/v3/simple/price?ids=blockstack&vs_currencies=usd`),
    fetchJson(`${HIRO_API}/v1/addresses/stacks/${address}`),
  ]);

  // STX price
  const stxPrice = priceData.status === 'fulfilled'
    ? (priceData.value?.blockstack?.usd ?? 1.5)
    : 1.5;

  // Balance — using /extended/v1/address/{address}/stx
  const bal = balanceData.status === 'fulfilled' ? balanceData.value : null;
  const stxBalance = bal ? parseInt(bal.balance ?? '0') / 1_000_000 : 0;
  const lockedBalance = bal ? parseInt(bal.locked ?? '0') / 1_000_000 : 0;
  const totalReceived = bal ? parseInt(bal.total_received ?? '0') / 1_000_000 : 0;
  const totalSent = bal ? parseInt(bal.total_sent ?? '0') / 1_000_000 : 0;

  // Transactions
  const txRaw = txData.status === 'fulfilled' ? txData.value?.results ?? [] : [];
  const transactions: Transaction[] = txRaw.map((tx: any) => ({
    txid: tx.tx_id,
    type: tx.tx_type,
    status: tx.tx_status,
    timestamp: tx.burn_block_time ?? 0,
    amount: tx.token_transfer?.amount ? parseInt(tx.token_transfer.amount) / 1_000_000 : undefined,
    sender: tx.sender_address,
    recipient: tx.token_transfer?.recipient_address,
    contractName: tx.contract_call?.contract_id,
    fee: parseInt(tx.fee_rate ?? '0') / 1_000_000,
  }));

  // NFTs
  const nftRaw = nftData.status === 'fulfilled' ? nftData.value?.results ?? [] : [];
  const nfts: NFT[] = nftRaw.map((nft: any) => ({
    contractId: nft.asset_identifier?.split('::')[0] ?? '',
    tokenId: nft.value?.repr?.replace('u', '') ?? '',
    name: nft.asset_identifier?.split('.')[1]?.split('::')[0] ?? 'NFT',
  }));

  // Stacking
  const stacking: StackingInfo = {
    stacked: lockedBalance > 0,
    amountStacked: lockedBalance,
  };

  // BNS name
  const bnsRaw = bnsData.status === 'fulfilled' ? bnsData.value : null;
  const bnsName = bnsRaw?.names?.[0] ?? undefined;

  return {
    address,
    stxBalance,
    stxBalanceUsd: stxBalance * stxPrice,
    stxPrice,
    lockedBalance,
    totalReceived,
    totalSent,
    transactionCount: transactions.length,
    transactions,
    nfts,
    stacking,
    bnsName,
  };
};
