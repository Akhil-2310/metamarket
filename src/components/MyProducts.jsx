import React, { useState, useEffect } from 'react'
import { useAccount, usePublicClient } from 'wagmi'
import { formatUnits } from 'viem'
import commerceABI from '../contracts/Commerce.js'

import { getProductImage } from '../utils/productImages'
import { useNavigate } from 'react-router-dom'

const COMMERCE_ADDRESS = '0x4309Eb90A37cfD0ecE450305B24a2DE68b73f312'

export default function MyProducts() {
  const { address }       = useAccount()
  const client            = usePublicClient()
  const navigate          = useNavigate()
  const [myProducts, setMyProducts] = useState([])
  const [loading, setLoading]       = useState(true)

  useEffect(() => {
    if (!address) {
      setMyProducts([])
      setLoading(false)
      return
    }

    async function fetchMyProducts() {
      setLoading(true)
      try {
        // 1) get your listed IDs
        const productIds = await client.readContract({
          address:      COMMERCE_ADDRESS,
          abi:          commerceABI,
          functionName: 'getProductsBySeller',
          args:         [address],
        })

        // 2) for each ID, fetch the tuple then the chain name
        const products = await Promise.all(
          productIds.map(async (id) => {
            // raw is [id, seller, name, description, category, price, currency, purchased, buyer]
            const raw = await client.readContract({
              address:      COMMERCE_ADDRESS,
              abi:          commerceABI,
              functionName: 'getProduct',
              args:         [id],
            })

            const [
              pid,
              seller,
              name,
              description,
              category,
              price,
              currency,
              purchased,
              buyer
            ] = raw

            // now currency is defined
            const chainName = await client.readContract({
              address:      COMMERCE_ADDRESS,
              abi:          commerceABI,
              functionName: 'getChainFromCurrency',
              args:         [currency],
            })

            return {
              id:          pid.toString(),
              seller,
              name,
              description,
              category,
              price:       formatUnits(price, 6),
              currency,
              chain:       chainName,
              purchased,
              buyer,
              image:       getProductImage(pid.toString(), category),
            }
          })
        )

        setMyProducts(products)
      } catch (e) {
        console.error('Error fetching my products:', e)
        setMyProducts([])
      } finally {
        setLoading(false)
      }
    }

    fetchMyProducts()
  }, [address, client])

  if (!address) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-4">
            Connect Your Wallet
          </h2>
          <p className="text-gray-300">
            Please connect your wallet to view your products.
          </p>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-300">Loading your products...</p>
        </div>
      </div>
    )
  }

  const available = myProducts.filter(p => !p.purchased)
  const sold      = myProducts.filter(p => p.purchased)

  return (
    <div className="min-h-screen bg-black py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header & Stats */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-4">📦 My Products</h1>
          <p className="text-gray-300 text-lg mb-6">
            Manage your marketplace listings
          </p>
          <div className="flex justify-center gap-6">
            <StatCard label="Total Listed" value={myProducts.length} />
            <StatCard label="Sold"         value={sold.length} />
            <StatCard label="Available"    value={available.length} />
          </div>
        </div>

        {/* Products Grid or Empty */}
        {myProducts.length === 0 ? (
          <EmptyState navigate={navigate} />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {myProducts.map(p => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// Reusable components...

function StatCard({ label, value }) {
  return (
    <div className="bg-gray-900 rounded-lg p-6 border border-blue-600/30 w-40">
      <p className="text-sm font-medium text-gray-400">{label}</p>
      <p className="text-2xl font-bold text-white">{value}</p>
    </div>
  )
}

function EmptyState({ navigate }) {
  return (
    <div className="text-center py-12">
      <div className="text-6xl mb-4">📦</div>
      <h3 className="text-xl font-bold text-white mb-2">No Products Listed</h3>
      <p className="text-gray-300 mb-6">
        You haven't listed any products yet.
      </p>
      <button
        onClick={() => navigate('/list')}
        className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
      >
        List Your First Product
      </button>
    </div>
  )
}

function ProductCard({ product }) {
  return (
    <div className="bg-gray-900 rounded-lg shadow-2xl border border-blue-600/30 overflow-hidden">
      <div className="h-48 bg-gray-800 relative">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute top-3 right-3">
          {product.purchased
            ? <Badge color="green">Sold</Badge>
            : <Badge color="blue">Available</Badge>}
        </div>
      </div>
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-xl font-bold text-white">{product.name}</h3>
          <span className="bg-blue-600 text-white px-2 py-1 rounded text-xs font-medium">
            {product.chain}
          </span>
        </div>
        <p className="text-gray-300 mb-4 line-clamp-2">
          {product.description}
        </p>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-2xl font-bold text-blue-400">
              {product.price} USDC
            </p>
            {product.purchased && (
              <p className="text-sm text-gray-400">
                Sold to: {product.buyer.slice(0,6)}…
                {product.buyer.slice(-4)}
              </p>
            )}
          </div>
          {!product.purchased && (
            <button
              className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg"
              onClick={() => {/* edit handler */}}
            >
              Edit
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

function Badge({ color, children }) {
  const bg = color === 'green' ? 'bg-green-600' : 'bg-blue-600'
  return (
    <span className={`${bg} text-white px-2 py-1 rounded text-xs font-medium`}>
      {children}
    </span>
  )
}