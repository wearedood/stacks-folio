import { request } from '@stacks/connect';

export const connectWallet = async (): Promise<string> => {
  const response = await request('getAddresses');
  const addresses = response?.addresses;
  if (!addresses || addresses.length === 0) throw new Error('No wallet address found');
  const mainnet = addresses.find((a: any) => a.address?.startsWith('SP') || a.address?.startsWith('SM'));
  if (!mainnet) throw new Error('No mainnet address found. Please switch to mainnet in Leather.');
  return mainnet.address;
};
