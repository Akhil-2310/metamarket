// src/providers/CustomWagmiProvider.jsx
import { ChainType, EVM, config, createConfig, getChains } from '@lifi/sdk';
import { useSyncWagmiConfig } from '@lifi/wallet-management';
import { useQuery } from '@tanstack/react-query';
import { getWalletClient, switchChain } from '@wagmi/core';
import { createClient, http } from 'viem';
import { base, baseSepolia, linea, lineaSepolia} from 'viem/chains';
import { createConfig as createWagmiConfig, WagmiProvider } from 'wagmi';
import { injected, metaMask } from 'wagmi/connectors';
import React from 'react';

// List of Wagmi connectors
const connectors = [metaMask(), injected()];

// Create Wagmi config
const wagmiConfig = createWagmiConfig({
  chains: [linea, base, lineaSepolia, baseSepolia],
  client({ chain }) {
    return createClient({ chain, transport: http() });
  },
});

// Create LiFi SDK config
createConfig({
  integrator: 'metamarket',
  providers: [
    EVM({
      getWalletClient: () => getWalletClient(wagmiConfig),
      switchChain: async (chainId) => {
        const chain = await switchChain(wagmiConfig, { chainId });
        return getWalletClient(wagmiConfig, { chainId: chain.id });
      },
    }),
  ],
  preloadChains: false,
});

export const CustomWagmiProvider = ({ children }) => {
  const { data: chains } = useQuery({
    queryKey: ['chains'],
    queryFn: async () => {
      const chains = await getChains({ chainTypes: [ChainType.EVM] });
      config.setChains(chains);
      return chains;
    },
  });

  useSyncWagmiConfig(wagmiConfig, connectors, chains);

  return (
    <WagmiProvider config={wagmiConfig} reconnectOnMount={false}>
      {children}
    </WagmiProvider>
  );
};
