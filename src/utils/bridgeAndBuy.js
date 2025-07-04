// import { parseUnits, createPublicClient, http } from 'viem';
// import { erc20Abi } from 'viem';
// import { writeContract, switchChain } from '@wagmi/core';
// import { fetchQuote } from '../lifi/fetchQuote';
// import { approveTokenIfNeeded } from '../lifi/approveTokenIfNeeded';
// import { executeSwap } from '../lifi/executeSwap';
// import { USDC_BASE, USDC_LINEA, CHAIN_IDS, COMMERCE_CONTRACTS, RPC_URLS } from '../constants';
// import commerceABI from '../contracts/Commerce';

// export const bridgeAndBuy = async ({ product, userAddress }) => {
//   if (!product || !userAddress) throw new Error("Product or user address is missing");

//   const productChainId =
//     product.currency.toLowerCase() === USDC_LINEA.toLowerCase() ? CHAIN_IDS.linea : CHAIN_IDS.base;

//   const userChainId = productChainId === CHAIN_IDS.linea ? CHAIN_IDS.base : CHAIN_IDS.linea;
//   const fromToken = productChainId === CHAIN_IDS.linea ? USDC_BASE : USDC_LINEA;
//   const toToken = product.currency;

//   const rpc = RPC_URLS[productChainId];
//   if (!rpc) throw new Error(`Missing RPC URL for chain ID: ${productChainId}`);

//   const publicClient = createPublicClient({
//     chain: {
//       id: productChainId,
//       name: '',
//       nativeCurrency: {},
//       rpcUrls: { default: { http: [rpc] } },
//     },
//     transport: http(),
//   });

//   const amount = parseUnits(String(product.price), 6).toString();

//   const balance = await publicClient.readContract({
//     address: toToken,
//     abi: erc20Abi,
//     functionName: 'balanceOf',
//     args: [userAddress],
//   });

//   if (BigInt(balance) < BigInt(amount)) {
//     const route = await fetchQuote({
//       fromChainId: userChainId,
//       toChainId: productChainId,
//       fromTokenAddress: fromToken,
//       toTokenAddress: toToken,
//       amount,
//       address: userAddress,
//     });

//     await approveTokenIfNeeded(route.steps[0]);
//     await executeSwap(route, () => {});
//   }

//   await switchChain({ chainId: productChainId });

//   await writeContract({
//     address: COMMERCE_CONTRACTS[productChainId],
//     abi: commerceABI,
//     functionName: 'purchaseProduct',
//     args: [product.id],
//   });
// };