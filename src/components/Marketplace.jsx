import React, { useState, useEffect } from 'react';
import { useAccount } from "wagmi";

const Marketplace = () => {
  const { address } = useAccount();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('newest');

  // Mock products data - replace with actual data from your smart contract
  const [products] = useState([
    {
      id: 1,
      name: "iPhone 15 Pro",
      description: "Latest iPhone with advanced camera system and A17 Pro chip",
      image: "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=400&h=300&fit=crop",
      category: "electronics",
      price: "999",
      currency: "USDC",
      seller: "0x1234...5678",
      chain: "Linea"
    },
    {
      id: 2,
      name: "Organic Coffee Beans",
      description: "Premium organic coffee beans from Colombia",
      image: "https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=400&h=300&fit=crop",
      category: "grocery",
      price: "25",
      currency: "USDC",
      seller: "0x8765...4321",
      chain: "Base"
    },
    {
      id: 3,
      name: "Designer T-Shirt",
      description: "Comfortable cotton t-shirt with unique design",
      image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=300&fit=crop",
      category: "clothing",
      price: "45",
      currency: "USDC",
      seller: "0x9876...5432",
      chain: "Arbitrum"
    },
    {
      id: 4,
      name: "Wireless Headphones",
      description: "High-quality wireless headphones with noise cancellation",
      image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=300&fit=crop",
      category: "electronics",
      price: "199",
      currency: "USDC",
      seller: "0x5432...1098",
      chain: "Linea"
    },
    {
      id: 5,
      name: "Fresh Vegetables Bundle",
      description: "Organic vegetables bundle including carrots, broccoli, and spinach",
      image: "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=400&h=300&fit=crop",
      category: "grocery",
      price: "35",
      currency: "USDC",
      seller: "0x2109...8765",
      chain: "Base"
    },
    {
      id: 6,
      name: "Denim Jacket",
      description: "Classic denim jacket perfect for any occasion",
      image: "https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=400&h=300&fit=crop",
      category: "clothing",
      price: "89",
      currency: "USDC",
      seller: "0x6543...2109",
      chain: "Arbitrum"
    }
  ]);

  const [filteredProducts, setFilteredProducts] = useState(products);

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
        filtered = [...filtered].sort((a, b) => b.id - a.id);
        break;
      default:
        break;
    }

    setFilteredProducts(filtered);
  }, [searchTerm, selectedCategory, sortBy, products]);

  const handlePurchase = (product) => {
    if (!address) {
      alert("Please connect your wallet to purchase products");
      return;
    }
    alert(`Purchase initiated for ${product.name} for ${product.price} ${product.currency}`);
  };

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
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-xl font-bold text-white">{product.name}</h3>
                  <span className="text-2xl font-bold text-blue-400">
                    {product.price} {product.currency}
                  </span>
                </div>

                <p className="text-gray-300 text-sm mb-4 line-clamp-2">
                  {product.description}
                </p>

                <div className="flex items-center justify-between mb-4">
                  <span className="text-blue-400 text-xs bg-blue-600/20 px-2 py-1 rounded">
                    {product.category}
                  </span>
                  <span className="text-gray-400 text-xs">
                    Seller: {product.seller}
                  </span>
                </div>

                {/* Purchase Button */}
                <button
                  onClick={() => handlePurchase(product)}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition-colors duration-200"
                >
                  Purchase Now
                </button>
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