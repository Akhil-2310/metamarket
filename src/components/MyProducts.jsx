import React, {useState, useEffect} from "react";
import { useWeb3ModalProvider } from "@web3modal/ethers/react";
import { BrowserProvider, Contract, ethers } from "ethers";
import { Link } from "react-router-dom";

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


const currencyDetails = {
  "0x1abFB5a6B1c8AA5eB928f2447ED2b22d471b38A3": { name: "USDT", decimals: 6 },
  "0xC817c2C63178877069107873489ea69819f1A537": { name: "DAI", decimals: 18 },
};


const USDTAddress = "0x1abFB5a6B1c8AA5eB928f2447ED2b22d471b38A3";
const DAIAddress = "0xC817c2C63178877069107873489ea69819f1A537";


const MyProducts = () => {

  const currencyMapping = {
    [USDTAddress]: "USDT",
    [DAIAddress]: "DAI",
  };

   const { walletProvider } = useWeb3ModalProvider();
   const [purchasedProducts, setPurchasedProducts] = useState([]);

   useEffect(() => {
     if (!walletProvider) return;

     const loadPurchasedProducts = async () => {
       const ethersProvider = new BrowserProvider(walletProvider);
       const signer = await ethersProvider.getSigner();
       const commerceContract = new Contract(
         commerceContractAddress,
         commerceABI,
         signer
       );

       const productIds = await commerceContract.getPurchasedProducts();
       const loadedProducts = [];

       for (let id of productIds) {
         const product = await commerceContract.getProduct(id);
         loadedProducts.push(product);
       }
       setPurchasedProducts(loadedProducts);
     };

     loadPurchasedProducts();
   }, [walletProvider]);


   const formatPrice = (price, curr) => {
     const details = currencyDetails[curr];
     if (!details) return "Unknown Currency";

     const formattedPrice = ethers.formatUnits(price, details.decimals);
     return formattedPrice;
   };


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
                <Link to="/">Marketplace</Link>
              </li>
              <w3m-button />
            </ul>
          </div>
        </div>
      </div>

      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
        <h2 className="text-2xl font-bold mb-6">My Products</h2>
        {purchasedProducts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {purchasedProducts.map((product) => (
              <div
                key={product.id}
                className="max-w-sm rounded overflow-hidden shadow-lg bg-white"
              >
                <img
                  className="w-full"
                  src="https://bafybeidhzytaqzf7rbqwhzkg5sdc3suel7ehiknvm73bhskptz3kzrqqxi.ipfs.w3s.link/APPLE.png"
                  alt={product.name}
                />
                <div className="px-6 py-4">
                  <div className="font-bold text-xl mb-2">{product.name}</div>
                  <p className="text-gray-700 text-base">
                    {product.description}
                  </p>
                  <p className="text-gray-900 font-bold">
                    {formatPrice(product.price, product.currency)}{" "}
                    {currencyMapping[product.currency] || "Unknown Currency"}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p>No products purchased yet.</p>
        )}
      </div>
    </>
  );
};

export default MyProducts;
