import { getRoutes } from '@lifi/sdk';

export const fetchQuote = async ({
  fromChainId,
  toChainId,
  fromTokenAddress,
  toTokenAddress,
  amount,
  address,
}) => {
  const routesRequest = {
    fromChainId,
    toChainId,
    fromTokenAddress,
    toTokenAddress,
    fromAmount: amount,
    fromAddress: address,
    toAddress: address,
    allowBridges: ["circle"], // 🔒 Use only Circle CCTP v2
  };

  const result = await getRoutes(routesRequest);

  if (!result.routes.length) throw new Error('No Circle CCTP route found');

  return result.routes[0]; // Return best route
};
