import React, { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { formatUnits } from 'viem';
import { publicClient } from '../config/wagmi';
import commerceABI from '../contracts/Commerce.json';
import { getProductImage } from '../utils/productImages';
import { useNavigate } from 'react-router-dom';

const commerceContractAddress = "0x4309Eb90A37cfD0ecE450305B24a2DE68b73f312";

const MyProducts = () => {
  const { address } = useAccount();
  const [myProducts, setMyProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchMyProducts = async () => {
    if (!address) {
      setMyProducts([]);
      setLoading(false);
      return;
    }

    try {
      // Get product IDs for the current seller
      const productIds = await publicClient.readContract({
        address: commerceContractAddress,
        abi: commerceABI,
        functionName: "getProductsBySeller",
        args: [address]
      });

      const fetchedProducts = [];

      // Fetch each product's details
      for (let i = 0; i < productIds.length; i++) {
        const product = await publicClient.readContract({
          address: commerceContractAddress,
          abi: commerceABI,
          functionName: "getProduct",
          args: [productIds[i]]
        });

        const chainName = await publicClient.readContract({
          address: commerceContractAddress,
          abi: commerceABI,
          functionName: "getChainFromCurrency",
          args: [product.currency]
        });
        
        fetchedProducts.push({
          id: product.id.toString(),
          name: product.name,
          description: product.description,
          category: product.category,
          price: formatUnits(product.price, 6), // USDC has 6 decimals
          currency: product.currency,
          chain: chainName,
          purchased: product.purchased,
          buyer: product.buyer,
          image: getProductImage(product.id.toString(), product.category)
        });
      }

      setMyProducts(fetchedProducts);
    } catch (error) {
      console.error("Error fetching my products:", error);
      setMyProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (address) {
      fetchMyProducts();
    } else {
      setMyProducts([]);
      setLoading(false);
    }
  }, [address]);

  const getStatusBadge = (purchased) => {
    if (purchased) {
      return (
        <span className="bg-green-600 text-white px-2 py-1 rounded text-xs font-medium">
          Sold
        </span>
      );
    } else {
      return (
        <span className="bg-blue-600 text-white px-2 py-1 rounded text-xs font-medium">
          Available
        </span>
      );
    }
  };

  if (!address) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Connect Your Wallet</h2>
          <p className="text-gray-300">Please connect your wallet to view your products.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-300">Loading your products...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-4">📦 My Products</h1>
          <p className="text-gray-300 text-lg">Manage your marketplace listings</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gray-900 rounded-lg p-6 border border-blue-600/30">
            <div className="flex items-center">
              <div className="p-2 bg-blue-600 rounded-lg">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-400">Total Listed</p>
                <p className="text-2xl font-bold text-white">{myProducts.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-gray-900 rounded-lg p-6 border border-blue-600/30">
            <div className="flex items-center">
              <div className="p-2 bg-green-600 rounded-lg">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-400">Sold</p>
                <p className="text-2xl font-bold text-white">
                  {myProducts.filter(p => p.purchased).length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gray-900 rounded-lg p-6 border border-blue-600/30">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-600 rounded-lg">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-400">Available</p>
                <p className="text-2xl font-bold text-white">
                  {myProducts.filter(p => !p.purchased).length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Products Grid */}
        {myProducts.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📦</div>
            <h3 className="text-xl font-bold text-white mb-2">No Products Listed</h3>
            <p className="text-gray-300 mb-6">You haven't listed any products yet.</p>
            <button 
              onClick={() => navigate('/list')}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
            >
              List Your First Product
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {myProducts.map((product) => (
              <div key={product.id} className="bg-gray-900 rounded-lg shadow-2xl border border-blue-600/30 overflow-hidden">
                {/* Product Image */}
                <div className="h-48 bg-gray-800 relative">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-3 right-3">
                    {getStatusBadge(product.purchased)}
                  </div>
                </div>

                {/* Product Info */}
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-xl font-bold text-white mb-2">{product.name}</h3>
                    <span className="bg-blue-600 text-white px-2 py-1 rounded text-xs font-medium">
                      {product.chain}
                    </span>
                  </div>
                  <p className="text-gray-300 mb-4 line-clamp-2">{product.description}</p>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-blue-400 text-xs bg-blue-600/20 px-2 py-1 rounded">
                      {product.category}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-2xl font-bold text-blue-400">{product.price} USDC</p>
                      {product.purchased && (
                        <p className="text-sm text-gray-400">
                          Sold to: {product.buyer.slice(0, 6)}...{product.buyer.slice(-4)}
                        </p>
                      )}
                    </div>
                    {!product.purchased && (
                      <button className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors">
                        Edit
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyProducts;