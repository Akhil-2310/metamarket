// src/pages/Leaderboard.jsx
import React, { useState, useEffect } from 'react'
import { usePublicClient } from 'wagmi'
import { formatUnits } from 'viem'
import commerceABI from '../contracts/Commerce.js'

const COMMERCE_ADDRESS = '0x4309Eb90A37cfD0ecE450305B24a2DE68b73f312'

export default function Leaderboard() {
  const publicClient = usePublicClient()
  const [leaderboard, setLeaderboard] = useState([])
  const [loading, setLoading]         = useState(true)

  useEffect(() => {
    fetchLeaderboard()
  }, [])

  async function fetchLeaderboard() {
    setLoading(true)
    try {
      // 1) How many products have ever been listed?
      const total = await publicClient.readContract({
        address:      COMMERCE_ADDRESS,
        abi:          commerceABI,
        functionName: 'getProductCount',
      })

      const count = Number(total)

      // 2) Fetch all products in parallel
      const rawProducts = await Promise.all(
        Array.from({ length: count }, (_, i) =>
          publicClient.readContract({
            address:      COMMERCE_ADDRESS,
            abi:          commerceABI,
            functionName: 'getProduct',
            args:         [i + 1],
          })
        )
      )

      // 3) Keep only sold items, collect unique buyers
      const buyersSet = new Set(
        rawProducts
          .filter(([, , , , , , , purchased]) => purchased)
          .map(([, , , , , , , , buyer]) => buyer.toLowerCase())
      )

      const buyers = Array.from(buyersSet)

      // 4) Fetch stats for each buyer
      const stats = await Promise.all(
        buyers.map(async (buyer) => {
          const [purchaseCount, totalSpent] = await publicClient.readContract({
            address:      COMMERCE_ADDRESS,
            abi:          commerceABI,
            functionName: 'getUserStats',
            args:         [buyer],
          })
          return {
            address:        buyer,
            productsBought: Number(purchaseCount),
            totalSpent:     formatUnits(totalSpent, 6),
          }
        })
      )

      // 5) Sort descending by totalSpent and assign rank
      stats.sort(
        (a, b) => parseFloat(b.totalSpent) - parseFloat(a.totalSpent)
      )
      const ranked = stats.map((u, i) => ({ ...u, rank: i + 1 }))

      setLeaderboard(ranked)
    } catch (err) {
      console.error('Error building leaderboard:', err)
      setLeaderboard([])
    } finally {
      setLoading(false)
    }
  }

  const formatAddress = (addr) =>
    `${addr.slice(0, 6)}…${addr.slice(-4)}`

  if (loading) {
    return <p className="text-center text-white py-8">Loading leaderboard…</p>
  }

  if (!leaderboard.length) {
    return <p className="text-center text-white py-8">No sales yet.</p>
  }

  return (
    <div className="min-h-screen bg-black py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-white mb-6 text-center">
          🏆 Reputation Leaderboard
        </h1>
        <div className="overflow-x-auto bg-gray-900 rounded-lg shadow border border-blue-600/30">
          <table className="w-full text-left">
            <thead className="bg-blue-600/20">
              <tr>
                <th className="px-6 py-3 text-xs text-blue-300 uppercase">
                  Rank
                </th>
                <th className="px-6 py-3 text-xs text-blue-300 uppercase">
                  Address
                </th>
                <th className="px-6 py-3 text-xs text-blue-300 uppercase">
                  Products Bought
                </th>
                <th className="px-6 py-3 text-xs text-blue-300 uppercase">
                  Total Spent (USDC)
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {leaderboard.map((user) => (
                <tr
                  key={user.address}
                  className="hover:bg-gray-800 transition-colors"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {user.rank === 1 && <span>🥇</span>}
                      {user.rank === 2 && <span>🥈</span>}
                      {user.rank === 3 && <span>🥉</span>}
                      <span className="ml-2 font-bold text-white">
                        #{user.rank}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-white">
                    {formatAddress(user.address)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-white">
                    {user.productsBought}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-blue-400 font-bold">
                    {user.totalSpent}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
