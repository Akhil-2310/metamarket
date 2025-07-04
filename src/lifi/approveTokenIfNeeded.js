import { checkAllowance, approveToken } from '@lifi/sdk';
import { getWalletClient } from '@wagmi/core';
import { custom, createWalletClient } from 'viem';

export const approveTokenIfNeeded = async (step) => {
  const needsApproval = await checkAllowance(step);
  if (!needsApproval) return;

  const walletClient = await getWalletClient();
  const signer = createWalletClient({
    account: walletClient.account,
    chain: walletClient.chain,
    transport: custom(window.ethereum),
  });

  await approveToken({
    signer,
    token: step.action.fromToken,
    amount: step.action.fromAmount,
    approvalAddress: step.estimate.approvalAddress,
  });
};
