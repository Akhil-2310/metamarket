import React, { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { formatUnits, parseUnits } from 'viem';
import commerceABI from '../contracts/Commerce.json';
import { getProductImage } from '../utils/productImages';
import { publicClient } from '../config/wagmi';
import { useNavigate } from 'react-router-dom';

const commerceContractAddress = "0x4309Eb90A37cfD0ecE450305B24a2DE68b73f312";

const Marketplace = () => {
  const { address } = useAccount();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
   const navigate = useNavigate();

  // Fetch products from smart contract using wagmi
  const fetchProducts = async () => {
    if (!address) {
      setProducts([]);
      setFilteredProducts([]);
      return;
    }

    setLoading(true);
    
    try {
      // Get all products at once using the getAllProducts function
      const allProducts = await publicClient.readContract({
        address: commerceContractAddress,
        abi: commerceABI,
        functionName: "getAllProducts"
      });

      const [ids, sellers, names, descriptions, categories, prices, currencies, purchased, buyers] = allProducts;
      
      const fetchedProducts = [];

      // Process all products
      for (let i = 0; i < ids.length; i++) {
        // Only add unpurchased products to the marketplace
        if (!purchased[i]) {
          const chainName = await publicClient.readContract({
            address: commerceContractAddress,
            abi: commerceABI,
            functionName: "getChainFromCurrency",
            args: [currencies[i]]
          });

          fetchedProducts.push({
            id: ids[i].toString(),
            name: names[i],
            description: descriptions[i],
            category: categories[i],
            price: formatUnits(prices[i], 6), // USDC has 6 decimals
            currency: currencies[i],
            chain: chainName,
            seller: sellers[i],
            purchased: purchased[i],
            buyer: buyers[i],
            image: getProductImage(ids[i].toString(), categories[i]) // Get image based on category
          });
        }
      }

      setProducts(fetchedProducts);
      setFilteredProducts(fetchedProducts);
    } catch (error) {
      console.error("Error fetching products:", error);
      setProducts([]);
      setFilteredProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [address]);

  // Filter and sort products
  useEffect(() => {
    let filtered = products.filter((product) => {
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           product.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === "all" || product.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });

    // Sort products
    switch (sortBy) {
      case "price-low":
        filtered.sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
        break;
      case "price-high":
        filtered.sort((a, b) => parseFloat(b.price) - parseFloat(a.price));
        break;
      case "newest":
        filtered.sort((a, b) => parseInt(b.id) - parseInt(a.id));
        break;
      case "oldest":
        filtered.sort((a, b) => parseInt(a.id) - parseInt(b.id));
        break;
      default:
        break;
    }

    setFilteredProducts(filtered);
  }, [products, searchTerm, selectedCategory, sortBy]);

  const handlePurchase = async (product) => {
    if (!address) {
      alert("Please connect your wallet first");
      return;
    }

    // Check if user is trying to buy their own product
    if (address && address.toLowerCase() === product.seller.toLowerCase()) {
      alert("You cannot buy your own product. Please use a different wallet to test purchases.");
      return;
    }

    try {
      // Pre-check if purchase is possible
      const [canPurchase, reason] = await publicClient.readContract({
        address: commerceContractAddress,
        abi: commerceABI,
        functionName: "canPurchaseProduct",
        args: [product.id, address]
      });
      
      if (!canPurchase) {
        alert(`Cannot purchase: ${reason}`);
        return;
      }

      // First, approve USDC spending
      const usdcToken = {
        address: product.currency,
        abi: [
          "function approve(address spender, uint256 amount) external returns (bool)",
          "function allowance(address owner, address spender) external view returns (uint256)",
          "function balanceOf(address owner) external view returns (uint256)"
        ]
      };

      const priceInWei = parseUnits(product.price, 6);
      
      // Check USDC balance
      const balance = await publicClient.readContract({
        ...usdcToken,
        functionName: "balanceOf",
        args: [address]
      });

      if (balance < priceInWei) {
        alert(`Insufficient USDC balance. You need ${product.price} USDC but have ${formatUnits(balance, 6)} USDC.`);
        return;
      }

      // Check current allowance
      const currentAllowance = await publicClient.readContract({
        ...usdcToken,
        functionName: "allowance",
        args: [address, commerceContractAddress]
      });

      console.log("Current allowance:", formatUnits(currentAllowance, 6), "USDC");
      console.log("Required amount:", product.price, "USDC");

      if (currentAllowance < priceInWei) {
        console.log("Approving USDC spending...");
        // Note: For write operations, you would need to use walletClient and writeContract
        // This is a simplified version - in practice you'd need to implement the approval flow
        alert("USDC approval required. Please approve USDC spending in your wallet.");
        return;
      }

      // Now buy the product
      console.log("Purchasing product...");
      // Note: For write operations, you would need to use walletClient and writeContract
      // This is a simplified version - in practice you'd need to implement the purchase flow
      alert("Purchase transaction initiated. Please confirm in your wallet.");
      
      // Refresh the products list after a delay
      setTimeout(() => {
        fetchProducts();
      }, 5000);
    } catch (error) {
      console.error("Error purchasing product:", error);
      
      // Provide specific error messages based on the error
      if (error.message.includes("Cannot buy your own product")) {
        alert("You cannot buy your own product. Please use a different wallet to test purchases.");
      } else if (error.message.includes("Product already purchased")) {
        alert("This product has already been purchased by someone else.");
      } else if (error.message.includes("Insufficient USDC allowance")) {
        alert("USDC approval failed. Please try approving USDC spending again.");
      } else if (error.message.includes("Insufficient USDC balance")) {
        alert("Insufficient USDC balance. Please add more USDC to your wallet.");
      } else if (error.message.includes("USDC transfer failed")) {
        alert("USDC transfer failed. Please check your balance and try again.");
      } else if (error.message.includes("revert")) {
        alert("Transaction failed. Please check your USDC balance and approval status.");
      } else {
        alert("Failed to purchase product. Please check your USDC balance and try again.");
      }
    }
  };

  return (
    <div className="min-h-screen bg-black py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header - Always visible */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">🛍️ Marketplace</h1>
          <p className="text-gray-300 text-lg">Discover amazing products from our community</p>
        </div>

        {/* Search and Filter Controls - Always visible */}
        <div className="mb-8 space-y-4">
          {/* Search Bar */}
          <div className="flex flex-col md:flex-row gap-4">
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
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-3 bg-gray-900 border border-blue-600/50 rounded-lg focus:outline-none focus:border-blue-500 text-white"
            >
              <option value="all">All Categories</option>
              <option value="electronics">Electronics</option>
              <option value="grocery">Grocery</option>
              <option value="clothing">Clothing</option>
            </select>

            {/* Sort Options */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-3 bg-gray-900 border border-blue-600/50 rounded-lg focus:outline-none focus:border-blue-500 text-white"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
            </select>
          </div>
        </div>

        {/* Products Section */}
        <div className="mb-8">
          {/* Loading State */}
          {loading && (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-300">Loading products...</p>
            </div>
          )}

          {/* No Products State */}
          {!loading && filteredProducts.length === 0 && (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📦</div>
              <h3 className="text-xl font-bold text-white mb-2">No Products Available</h3>
              <p className="text-gray-300 mb-6">
                {products.length === 0 
                  ? "No products have been listed yet. Be the first to list a product!"
                  : "No products match your search criteria."
                }
              </p>
              {products.length === 0 && (
                <button 
                  onClick={() => navigate('/list')}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
                >
                  List Your First Product
                </button>
              )}
            </div>
          )}

          {/* Products Grid */}
          {!loading && filteredProducts.length > 0 && (
            <>
              <div className="mb-4">
                <p className="text-gray-300">
                  Showing {filteredProducts.length} of {products.length} products
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProducts.map((product) => (
                  <div key={product.id} className="bg-gray-900 rounded-lg shadow-2xl border border-blue-600/30 overflow-hidden">
                    {/* Product Image */}
                    <div className="h-48 bg-gray-800 relative">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
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
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Marketplace;