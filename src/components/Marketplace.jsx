import React, { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import { formatUnits, parseUnits } from "viem";
import commerceABI from "../contracts/Commerce";
import { getProductImage } from "../utils/productImages";
import { publicClient, walletClient } from "../config/wagmi";
import { useNavigate } from "react-router-dom";
import { getRoutes, executeRoute } from "@lifi/sdk";
import { getWalletClient, switchChain } from "@wagmi/core";
import { writeContract, simulateContract } from "viem/actions";
import {
  COMMERCE_CONTRACTS,
  USDC_BASE,
  USDC_LINEA,
  CHAIN_IDS,
} from "../constants";

const commerceContractAddress = "0x4309Eb90A37cfD0ecE450305B24a2DE68b73f312";

const erc20Abi = [
  // balanceOf
  {
    name: "balanceOf",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "owner", type: "address" }],
    outputs: [{ type: "uint256" }],
  },
  // allowance
  {
    name: "allowance",
    type: "function",
    stateMutability: "view",
    inputs: [
      { name: "owner", type: "address" },
      { name: "spender", type: "address" },
    ],
    outputs: [{ type: "uint256" }],
  },
  // approve
  {
    name: "approve",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "spender", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    outputs: [{ type: "bool" }],
  },
];

const Marketplace = () => {
  const { address } = useAccount();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [bridged, setBridged] = useState({});
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
        functionName: "getAllProducts",
      });

      const [
        ids,
        sellers,
        names,
        descriptions,
        categories,
        prices,
        currencies,
        purchased,
        buyers,
      ] = allProducts;

      const fetchedProducts = [];

      // Process all products
      for (let i = 0; i < ids.length; i++) {
        // Only add unpurchased products to the marketplace
        if (!purchased[i]) {
          const chainName = await publicClient.readContract({
            address: commerceContractAddress,
            abi: commerceABI,
            functionName: "getChainFromCurrency",
            args: [currencies[i]],
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
            image: getProductImage(ids[i].toString(), categories[i]), // Get image based on category
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
      const matchesSearch =
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory =
        selectedCategory === "all" || product.category === selectedCategory;
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

  // const erc20Abi = [
  //   { name: 'allowance', type: 'function', stateMutability: 'view', inputs: [
  //       { name: 'owner',  type: 'address' },
  //       { name: 'spender', type: 'address' },
  //     ], outputs: [{ name: '', type: 'uint256' }] },
  //   { name: 'approve', type: 'function', stateMutability: 'nonpayable', inputs: [
  //       { name: 'spender', type: 'address' },
  //       { name: 'amount',  type: 'uint256' },
  //     ], outputs: [{ name: '', type: 'bool' }] },
  // ];

  async function ensureBaseNetwork() {
    const baseHex = "0x" + CHAIN_IDS.base.toString(16);
    try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: baseHex }],
      });
    } catch (switchError) {
      // 4902 = unrecognized chain
      if (switchError.code === 4902) {
        await window.ethereum.request({
          method: "wallet_addEthereumChain",
          params: [
            {
              chainId: baseHex,
              chainName: "Base Mainnet",
              nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
              rpcUrls: ["https://mainnet.base.org"],
              blockExplorerUrls: ["https://basescan.org"],
            },
          ],
        });
        // now switch
        await window.ethereum.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: baseHex }],
        });
      } else {
        throw switchError;
      }
    }
  }

  async function ensureLineaNetwork() {
    const lineaHex = "0x" + CHAIN_IDS.linea.toString(16);
    try {
      // try to switch
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: lineaHex }],
      });
    } catch (switchError) {
      // if wallet doesn’t know Linea yet
      if (switchError.code === 4902) {
        await window.ethereum.request({
          method: "wallet_addEthereumChain",
          params: [
            {
              chainId: lineaHex,
              chainName: "Linea Mainnet",
              nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
              rpcUrls: ["https://rpc.linea.build"],
              blockExplorerUrls: ["https://explorer.linea.build"],
            },
          ],
        });
        // then switch
        await window.ethereum.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: lineaHex }],
        });
      } else {
        throw switchError;
      }
    }
  }

  // Helper: approve + purchase on Linea
  async function purchaseOnLinea(product, priceWei) {
    try {
      await ensureLineaNetwork();
    } catch (err) {
      console.error("Cannot switch to Linea:", err);
      alert("Please approve network switch to Linea in your wallet");
      return;
    }

    // 1) approve if needed
    const allowance = await publicClient.readContract({
      address: USDC_LINEA,
      abi: erc20Abi,
      functionName: "allowance",
      args: [address, COMMERCE_CONTRACTS[CHAIN_IDS.linea]],
    });
    if (BigInt(allowance) < BigInt(priceWei)) {
      const { request: approveReq } = await simulateContract(publicClient, {
        address: USDC_LINEA,
        abi: erc20Abi,
        functionName: "approve",
        args: [COMMERCE_CONTRACTS[CHAIN_IDS.linea], priceWei],
        account: address,
      });
      const hash = await walletClient.writeContract(approveReq);
      await publicClient.waitForTransactionReceipt({ hash });
      console.log("✅ Approved USDC on Linea");
    }

    // 2) purchaseProduct()
    const { request: purchaseReq } = await simulateContract(publicClient, {
      address: COMMERCE_CONTRACTS[CHAIN_IDS.linea],
      abi: commerceABI,
      functionName: "purchaseProduct",
      args: [product.id],
      account: address,
    });
    const tx = await walletClient.writeContract(purchaseReq);
    await publicClient.waitForTransactionReceipt({ hash: tx });

    alert("🎉 Purchase complete!");
    // clear bridged flag for this product
    setBridged((b) => {
      const c = { ...b };
      delete c[product.id];
      return c;
    });
  }

  async function handlePurchase(product) {
    if (!address) {
      alert("Please connect your wallet first");
      return;
    }
    if (address.toLowerCase() === product.seller.toLowerCase()) {
      alert("You cannot buy your own product");
      return;
    }

    // compute price in USDC's 6 decimals
    const priceWei = parseUnits(product.price.toString(), 6);

    // 1️⃣ Check Linea balance
    const lineaBal = await publicClient.readContract({
      address: USDC_LINEA,
      abi: erc20Abi,
      functionName: "balanceOf",
      args: [address],
    });
    if (BigInt(lineaBal) >= BigInt(priceWei)) {
      // already have enough → skip bridge
      await purchaseOnLinea(product, priceWei);
      return;
    }

    // 2️⃣ Perform bridge once per product
    if (!bridged[product.id]) {
      // ensure on Base
      try {
        await ensureBaseNetwork();
      } catch (err) {
        console.error(err);
        alert("Failed to switch to Base. Make sure your wallet supports Base.");
        return;
      }

      // fetch CCTP v2 route
      const { routes } = await getRoutes({
        fromChainId: CHAIN_IDS.base,
        toChainId: CHAIN_IDS.linea,
        fromTokenAddress: USDC_BASE,
        toTokenAddress: USDC_LINEA,
        fromAmount: priceWei.toString(),
        fromAddress: address,
        toAddress: address,
        allowBridges: ["circle"],
      });
      if (!routes.length) {
        alert("No Circle CCTP route found");
        return;
      }

      // execute bridge; auto‐switch to Linea via raw RPC
      await executeRoute(routes[0], {
        updateRouteHook: (upd) => console.log(`Bridge in progress`),
        acceptExchangeRateUpdateHook: async () => true,
        switchChainHook: async (chainId) => {
          // prompt wallet to switch to Linea
          await window.ethereum.request({
            method: "wallet_switchEthereumChain",
            params: [{ chainId: "0x" + chainId.toString(16) }],
          });
          return walletClient;
        },
      });

      setBridged((b) => ({ ...b, [product.id]: true }));
      alert(
        "✅ Bridged to Linea! Please click “Buy Now” again to finish the purchase."
      );
      return;
    }

    // 3️⃣ After bridge, now purchase
    await purchaseOnLinea(product, priceWei);
  }

  return (
    <div className="min-h-screen bg-black py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header - Always visible */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">🛍️ Marketplace</h1>
          <p className="text-gray-300 text-lg">
            Discover amazing products from our community
          </p>
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
              <h3 className="text-xl font-bold text-white mb-2">
                No Products Available
              </h3>
              <p className="text-gray-300 mb-6">
                {products.length === 0
                  ? "No products have been listed yet. Be the first to list a product!"
                  : "No products match your search criteria."}
              </p>
              {products.length === 0 && (
                <button
                  onClick={() => navigate("/list")}
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
                  Showing {filteredProducts.length} of {products.length}{" "}
                  products
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProducts.map((product) => (
                  <div
                    key={product.id}
                    className="bg-gray-900 rounded-lg shadow-2xl border border-blue-600/30 overflow-hidden"
                  >
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
                        <h3 className="text-xl font-bold text-white mb-2">
                          {product.name}
                        </h3>
                        <span className="bg-blue-600 text-white px-2 py-1 rounded text-xs font-medium">
                          {product.chain}
                        </span>
                      </div>
                      <p className="text-gray-300 mb-4 line-clamp-2">
                        {product.description}
                      </p>
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-blue-400 text-xs bg-blue-600/20 px-2 py-1 rounded">
                          {product.category}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="text-2xl font-bold text-blue-400">
                            {product.price} USDC
                          </p>
                          <p className="text-sm text-gray-400">
                            Seller: {product.seller.slice(0, 6)}...
                            {product.seller.slice(-4)}
                          </p>
                        </div>
                        <button
                          onClick={() => handlePurchase(product)}
                          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                        >
                          {bridged[product.id]
                            ? "Complete Purchase"
                            : "Buy Now"}
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
