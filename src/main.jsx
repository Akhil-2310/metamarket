import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import Navbar from './components/Navbar.jsx'
import Footer from './components/Footer.jsx'

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { http, WagmiProvider, createConfig } from "wagmi";
import {  linea, base } from "wagmi/chains";
import { metaMask } from "wagmi/connectors";
import { CustomWagmiProvider } from './providers/CustomWagmiProvider.jsx'

const config = createConfig({
  ssr: true, // Make sure to enable this for server-side rendering (SSR) applications.
  chains: [ base, linea],
  connectors: [metaMask({ chains: [base, linea] })],
  transports: {
   [base.id]:  http('https://mainnet.base.org'),
   [linea.id]: http('https://rpc.linea.build'),
  },
});

const client = new QueryClient();

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <WagmiProvider config={config}>
      
      <QueryClientProvider client={client}>
        <CustomWagmiProvider>
        <div className="min-h-screen flex flex-col">
          <Navbar />
          <main className="flex-1">
            <App />
          </main>
          <Footer />
        </div>
        </CustomWagmiProvider>
      </QueryClientProvider>
    </WagmiProvider>
  </StrictMode>,
)
