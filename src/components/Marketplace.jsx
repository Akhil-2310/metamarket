import React, { useState, useEffect } from 'react';
import { useAccount } from "wagmi";
import { useWeb3ModalProvider } from "@web3modal/ethers/react";
import { BrowserProvider, Contract, ethers } from "ethers";
import commerceABI from '../contracts/Commerce.json';
import { getProductImage } from '../utils/productImages';

const commerceContractAddress = "0x6A464b31b714ad57D7713ED3684A9441d44b473f";

const Marketplace = () => {
  const { address } = useAccount();
  const { walletProvider } = useWeb3ModalProvider();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filteredProducts, setFilteredProducts] = useState([]);

  // Fetch products from smart contract
  const fetchProducts = async () => {
    if (!walletProvider) return;

    const ethersProvider = new BrowserProvider(walletProvider);
    const signer = await ethersProvider.getSigner();
    const commerceContract = new Contract(
      commerceContractAddress,
      commerceABI,
      signer
    );

    try {
      const productCount = await commerceContract.getProductCount();
      const fetchedProducts = [];

      for (let i = 1; i <= productCount; i++) {
        const product = await commerceContract.getProduct(i);
        const chainName = await commerceContract.getChainFromCurrency(product.currency);
        
        // Only add unpurchased products to the marketplace
        if (!product.purchased) {
          fetchedProducts.push({
            id: product.id.toString(),
            name: product.name,
            description: product.description,
            category: product.category,
            price: ethers.formatUnits(product.price, 6), // USDC has 6 decimals
            currency: product.currency,
            chain: chainName,
            seller: product.seller,
            purchased: product.purchased,
            image: getProductImage(product.id.toString(), product.category) // Get image based on category
          });
        }
      }

      setProducts(fetchedProducts);
      setFilteredProducts(fetchedProducts);
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [walletProvider]);

  useEffect(() => {
    let filtered = products;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(product => product.category === selectedCategory);
    }

    // Sort products
    switch (sortBy) {
      case 'price-low':
        filtered = [...filtered].sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
        break;
      case 'price-high':
        filtered = [...filtered].sort((a, b) => parseFloat(b.price) - parseFloat(a.price));
        break;
      case 'newest':
        filtered = [...filtered].sort((a, b) => parseInt(b.id) - parseInt(a.id));
        break;
      default:
        break;
    }

    setFilteredProducts(filtered);
  }, [searchTerm, selectedCategory, sortBy, products]);

  const handlePurchase = async (product) => {
    if (!walletProvider) {
      alert("Please connect your wallet first");
      return;
    }

    const ethersProvider = new BrowserProvider(walletProvider);
    const signer = await ethersProvider.getSigner();
    const commerceContract = new Contract(
      commerceContractAddress,
      commerceABI,
      signer
    );

    try {
      // First, approve USDC spending
      const usdcToken = new Contract(
        product.currency,
        [
          "function approve(address spender, uint256 amount) external returns (bool)",
          "function allowance(address owner, address spender) external view returns (uint256)"
        ],
        signer
      );

      const priceInWei = ethers.parseUnits(product.price, 6);
      const currentAllowance = await usdcToken.allowance(await signer.getAddress(), commerceContractAddress);

      if (currentAllowance < priceInWei) {
        console.log("Approving USDC spending...");
        const approveTx = await usdcToken.approve(commerceContractAddress, priceInWei);
        await approveTx.wait();
        console.log("USDC approved");
      }

      // Now buy the product
      console.log("Purchasing product...");
      const buyTx = await commerceContract.buyProduct(product.id);
      await buyTx.wait();
      
      alert("Product purchased successfully!");
      
      // Refresh the products list
      fetchProducts();
    } catch (error) {
      console.error("Error purchasing product:", error);
      alert("Failed to purchase product. Please check your USDC balance and try again.");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-white">Loading products...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Header Section */}
      <div className="bg-black">
        <div className="max-w-7xl mx-auto px-4 py-8 text-center">
          <h1 className="text-4xl font-bold text-white mb-4">Marketplace</h1>
          <p className="text-gray-300 text-lg">
            Discover and purchase products across multiple blockchains
          </p>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex flex-col lg:flex-row gap-4 mb-8">
          {/* Search */}
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-3 bg-gray-900 border border-blue-600/50 rounded-lg focus:outline-none focus:border-blue-500 text-white placeholder-gray-400"
            />
          </div>

          {/* Category Filter */}
          <div className="lg:w-48">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-4 py-3 bg-gray-900 border border-blue-600/50 rounded-lg focus:outline-none focus:border-blue-500 text-white"
            >
              <option value="all">All Categories</option>
              <option value="electronics">Electronics</option>
              <option value="grocery">Grocery</option>
              <option value="clothing">Clothing</option>
            </select>
          </div>

          {/* Sort */}
          <div className="lg:w-48">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full px-4 py-3 bg-gray-900 border border-blue-600/50 rounded-lg focus:outline-none focus:border-blue-500 text-white"
            >
              <option value="newest">Newest First</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
            </select>
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-gray-300">
            Showing {filteredProducts.length} of {products.length} products
          </p>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((product) => (
            <div key={product.id} className="bg-gray-900 rounded-lg shadow-xl border border-blue-600/30 hover:shadow-2xl transition-shadow overflow-hidden">
              {/* Product Image */}
              <div className="relative h-48 overflow-hidden">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-2 right-2">
                  <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded-full">
                    {product.chain}
                  </span>
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
                    <p className="text-sm text-gray-400">Seller: {product.seller.slice(0, 6)}...{product.seller.slice(-4)}</p>
                  </div>
                  <button
                    onClick={() => handlePurchase(product)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    Buy Now
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* No Results */}
        {filteredProducts.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold text-white mb-2">No products found</h3>
            <p className="text-gray-300">
              Try adjusting your search terms or filters
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Marketplace;