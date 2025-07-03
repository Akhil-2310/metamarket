import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import './index.css'

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { http, WagmiProvider, createConfig } from "wagmi";
import { mainnet, linea, lineaSepolia } from "wagmi/chains";
import { metaMask } from "wagmi/connectors";

const config = createConfig({
  ssr: true, // Make sure to enable this for server-side rendering (SSR) applications.
  chains: [ linea],
  connectors: [metaMask()],
  transports: {
    [linea.id]: http(),
 
  },
});

const client = new QueryClient();

createRoot(document.getElementById('root')).render(

  <StrictMode>
      <WagmiProvider config={config}>
      <QueryClientProvider client={client}></QueryClientProvider>
    <App />
    </QueryClientProvider>
    </WagmiProvider>
  </StrictMode>,
)
