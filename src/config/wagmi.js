import { createPublicClient, http } from 'viem'
import { linea } from 'wagmi/chains'
import { createWalletClient, custom } from 'viem'

// Public client for reading from the blockchain
export const publicClient = createPublicClient({
  chain: linea,
  transport: http()
})

// Wallet client for writing to the blockchain
export const walletClient = createWalletClient({
  chain: linea,
  transport: custom(window.ethereum)
}) 