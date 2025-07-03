import { createPublicClient, createWalletClient, custom, http } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import {   linea} from 'viem/chains';

export const publicClient = createPublicClient({
  chain: linea,
  transport: http()
});

export const walletClient = createWalletClient({
  chain: linea,
  transport: custom(window.ethereum)
}); 