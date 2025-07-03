import React, { useEffect, useState } from "react";
import { createWeb3Modal, defaultConfig } from "@web3modal/ethers/react";
import { Link } from "react-router-dom";
import {
  useWeb3ModalProvider,
  useWeb3ModalAccount,
} from "@web3modal/ethers/react";
import { BrowserProvider, Contract, ethers, parseUnits } from "ethers";
import { useNavigate } from "react-router-dom";

const commerceContractAddress = "0x6A464b31b714ad57D7713ED3684A9441d44b473f";
const commerceABI = [
  {
    inputs: [
      {
        internalType: "string",
        name: "_name",
        type: "string",
      },
      {
        internalType: "string",
        name: "_description",
        type: "string",
      },
      {
        internalType: "string",
        name: "_image",
        type: "string",
      },
      {
        internalType: "string",
        name: "_category",
        type: "string",
      },
      {
        internalType: "uint256",
        name: "_price",
        type: "uint256",
      },
      {
        internalType: "address",
        name: "_currency",
        type: "address",
      },
    ],
    name: "listProduct",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "uint256",
        name: "id",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "address",
        name: "seller",
        type: "address",
      },
      {
        indexed: false,
        internalType: "string",
        name: "name",
        type: "string",
      },
      {
        indexed: false,
        internalType: "string",
        name: "description",
        type: "string",
      },
      {
        indexed: false,
        internalType: "string",
        name: "image",
        type: "string",
      },
      {
        indexed: false,
        internalType: "string",
        name: "category",
        type: "string",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "price",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "address",
        name: "currency",
        type: "address",
      },
    ],
    name: "ProductListed",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "uint256",
        name: "id",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "address",
        name: "buyer",
        type: "address",
      },
      {
        indexed: false,
        internalType: "address",
        name: "seller",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "price",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "address",
        name: "currency",
        type: "address",
      },
    ],
    name: "ProductPurchased",
    type: "event",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "_id",
        type: "uint256",
      },
    ],
    name: "purchaseProduct",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "_id",
        type: "uint256",
      },
    ],
    name: "getProduct",
    outputs: [
      {
        internalType: "uint256",
        name: "id",
        type: "uint256",
      },
      {
        internalType: "address",
        name: "seller",
        type: "address",
      },
      {
        internalType: "string",
        name: "name",
        type: "string",
      },
      {
        internalType: "string",
        name: "description",
        type: "string",
      },
      {
        internalType: "string",
        name: "category",
        type: "string",
      },
      {
        internalType: "uint256",
        name: "price",
        type: "uint256",
      },
      {
        internalType: "address",
        name: "currency",
        type: "address",
      },
      {
        internalType: "bool",
        name: "purchased",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getPurchasedProducts",
    outputs: [
      {
        internalType: "uint256[]",
        name: "",
        type: "uint256[]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "productCount",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    name: "products",
    outputs: [
      {
        internalType: "uint256",
        name: "id",
        type: "uint256",
      },
      {
        internalType: "address payable",
        name: "seller",
        type: "address",
      },
      {
        internalType: "string",
        name: "name",
        type: "string",
      },
      {
        internalType: "string",
        name: "description",
        type: "string",
      },
      {
        internalType: "string",
        name: "image",
        type: "string",
      },
      {
        internalType: "string",
        name: "category",
        type: "string",
      },
      {
        internalType: "uint256",
        name: "price",
        type: "uint256",
      },
      {
        internalType: "address",
        name: "currency",
        type: "address",
      },
      {
        internalType: "bool",
        name: "purchased",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    name: "purchasedProducts",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
];


// 1. Get projectId
const projectId = "54c238d52f1218087ae00073282addb8";

// 2. Set chains
const mainnet = {
  chainId: 1,
  name: "Ethereum",
  currency: "ETH",
  explorerUrl: "https://etherscan.io",
  rpcUrl: "https://cloudflare-eth.com",
};
const sepolia = {
  chainId: 11155111,
  name: "Sepolia",
  currency: "ETH",
  explorerUrl: "https://sepolia.etherscan.io",
  rpcUrl:
    "https://eth-sepolia.g.alchemy.com/v2/_O9yEvZei4_BPgQbLawL754cAfubB8jr", // Replace with your Infura project ID
};
const lineasepolia = {
  chainId: 59141,
  name: "LineaSepolia",
  currency: "ETH",
  explorerUrl: "https://sepolia.lineascan.build",
  rpcUrl:
    "https://linea-sepolia.g.alchemy.com/v2/_O9yEvZei4_BPgQbLawL754cAfubB8jr", // Replace with your Infura project ID
};

// 3. Create a metadata object
const metadata = {
  name: "My Website",
  description: "My Website description",
  url: "https://mywebsite.com", // origin must match your domain & subdomain
  icons: ["https://avatars.mywebsite.com/"],
};

// 4. Create Ethers config
const ethersConfig = defaultConfig({
  /*Required*/
  metadata,
 auth: {
      email: true, // default to true
      socials: ['google', 'x', 'github'],
      showWallets: true, // default to true
      walletFeatures: true // default to true
    },
  /*Optional*/
  enableEIP6963: true, // true by default
  enableInjected: true, // true by default
  enableCoinbase: true, // true by default
  rpcUrl: "...", // used for the Coinbase SDK
  defaultChainId: 1, // used for the Coinbase SDK
});

// 5. Create a AppKit instance
createWeb3Modal({
  ethersConfig,
  chains: [mainnet, sepolia, lineasepolia],
  projectId,
  enableAnalytics: true, // Optional - defaults to your Cloud configuration
});


const USDTAddress = "0x1abFB5a6B1c8AA5eB928f2447ED2b22d471b38A3";
const DAIAddress = "0xC817c2C63178877069107873489ea69819f1A537";

const currencyDetails = {
  "0x1abFB5a6B1c8AA5eB928f2447ED2b22d471b38A3": { name: "USDT", decimals: 6 },
  "0xC817c2C63178877069107873489ea69819f1A537": { name: "DAI", decimals: 18 },
};

const ERC20ABI = [
  "function balanceOf(address) view returns (uint256)",
  "function approve(address spender, uint256 amount) returns (bool)",
  "function transfer(address recipient, uint256 amount) returns (bool)",
];


const currencyMapping = {
  [USDTAddress]: "USDT",
  [DAIAddress]: "DAI",
};


const Marketplace = () => {
const { address, chainId, isConnected } = useWeb3ModalAccount();
const { walletProvider } = useWeb3ModalProvider();
const [products, setProducts] = useState([]);
const navigate = useNavigate();

useEffect(() => {
    if (!walletProvider) return;
 const loadProducts = async () => {
   const ethersProvider = new BrowserProvider(walletProvider);
   const signer = await ethersProvider.getSigner();
   const commerceContract = new Contract(
     commerceContractAddress,
     commerceABI,
     signer
   );

   const productCount = await commerceContract.productCount();

   const loadedProducts = [];
   for (let i = 1; i <= productCount; i++) {
     const product = await commerceContract.products(i);
     if (!product.purchased) {
       loadedProducts.push(product);
     }
   }
   setProducts(loadedProducts);
 };

 loadProducts();
}, [walletProvider]);


const formatPrice = (price, curr) => {
  const details = currencyDetails[curr];
  if (!details) return "Unknown Currency";

  const formattedPrice = ethers.formatUnits(price, details.decimals);
  return formattedPrice;
};

 const handlePurchase = async (id, price, currency) => {
   if (!walletProvider) {
     alert("User not connected");
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
         //Handle ERC20 purchase (USDT/DAI)
        let adjustedPrice;
        if (currency === "0x1abFB5a6B1c8AA5eB928f2447ED2b22d471b38A3") {
          // USDT (6 decimals)
          adjustedPrice = ethers.parseUnits(price.toString(), 6);
          const ERC20Contract = new Contract(currency, ERC20ABI, signer);
          const approveTx = await ERC20Contract.approve(
            commerceContractAddress,
            adjustedPrice
          );
          await approveTx.wait();

          const purchaseTx = await commerceContract.purchaseProduct(id);
          await purchaseTx.wait();
        } else {
          // DAI/WETH (18 decimals)
          adjustedPrice = ethers.parseUnits(price.toString(), 18);
          const ERC20Contract = new Contract(currency, ERC20ABI, signer);
          const approveTx = await ERC20Contract.approve(
            commerceContractAddress,
            adjustedPrice
          );
          await approveTx.wait();

          const purchaseTx = await commerceContract.purchaseProduct(id);
          await purchaseTx.wait();
        }        
      }
      catch(error){
        console.log(error);
      };
      alert("Product purchased successfully");
      navigate("/my"); // Navigate to user's purchases page or refresh the marketplace
    } 

  return (
    <>
      <div>
        <div className="navbar bg-base-100">
          <div className="flex-1">
            <a className="btn btn-ghost text-xl">Social</a>
          </div>
          <div className="flex-none">
            <ul className="menu menu-horizontal px-1">
              <li>
                <Link to="/list">List Products</Link>
              </li>
              <li>
                <Link to="/my">My Products</Link>
              </li>
              <w3m-button />
            </ul>
          </div>
        </div>
      </div>

      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
        <h2 className="text-2xl font-bold mb-6">Marketplace</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <div
              key={product.id}
              className="max-w-sm rounded overflow-hidden shadow-lg bg-white"
            >
              <img className="w-full" src={product.image} alt={product.name} />
              <div className="px-6 py-4">
                <div className="font-bold text-xl mb-2">
                  {product.name.toUpperCase()}
                </div>
                <p className="text-gray-700 text-base">{product.description}</p>
                <p className="text-gray-900 font-bold">
                  {formatPrice(product.price, product.currency)}{" "}
                  {currencyMapping[product.currency] || "Unknown Currency"}
                </p>
                <p className="text-gray-900 font-bold">
                  {product.category.toUpperCase()}
                </p>
                <button
                  onClick={() =>
                    handlePurchase(product.id, product.price, product.currency)
                  }
                  className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mt-4"
                >
                  Buy Now
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

export default Marketplace;
