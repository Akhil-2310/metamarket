import { executeRoute } from '@lifi/sdk';
import { getWalletClient } from '@wagmi/core';
import { createWalletClient, custom } from 'viem';

export const executeSwap = async (route, onUpdate) => {
  const walletClient = await getWalletClient();
  const signer = createWalletClient({
    account: walletClient.account,
    chain: walletClient.chain,
    transport: custom(window.ethereum),
  });

  await executeRoute({
    signer,
    route,
    updateRoute: onUpdate, // callback to track progress
  });
};
