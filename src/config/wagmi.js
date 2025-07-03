import { createPublicClient, http } from 'viem'
import { lineaSepolia } from 'wagmi/chains'
import { createWalletClient, custom } from 'viem'

// Public client for reading from the blockchain
export const publicClient = createPublicClient({
  chain: lineaSepolia,
  transport: http()
})

// Wallet client for writing to the blockchain
export const walletClient = createWalletClient({
  chain: lineaSepolia,
  transport: custom(window.ethereum)
}) 