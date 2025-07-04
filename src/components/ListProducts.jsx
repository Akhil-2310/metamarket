import React, { useState } from "react";
import { useAccount } from "wagmi";
import { publicClient, walletClient } from "../config/wagmi";
import commerceABI from "../contracts/Commerce";
import { useNavigate } from "react-router-dom";
import {
  simulateContract,
  writeContract,
  waitForTransactionReceipt,
} from "viem/actions";

const usdc_arbitrum = "0xaf88d065e77c8cC2239327C5EDb3A432268e5831";
const usdc_base = "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913";
const usdc_linea = "0x176211869cA2b568f2A7D4EE941E073a821EE1ff";

const commerceContractAddress = "0x4309Eb90A37cfD0ecE450305B24a2DE68b73f312";

const ListProducts = () => {
  const { address } = useAccount();
  const navigate = useNavigate();

  // State to handle form inputs
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "",
    price: "",
    currency: usdc_linea,
  });

  // State to handle loading and error messages
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Function to handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  // Function to handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    if (!address) {
      setError("Please connect your wallet first");
      setLoading(false);
      return;
    }

    try {
      // Prepare contract call arguments
      const { name, description, category, price, currency } = formData;

      // Convert price to wei (USDC has 6 decimals)
      const priceInWei = BigInt(parseFloat(price) * 1000000);

      console.log("Listing product:", {
        name,
        description,
        category,
        price,
        currency,
        priceInWei,
      });

      // Simulate the contract call to list the product
      // Simulate the call
      const { request } = await simulateContract(publicClient, {
        address: commerceContractAddress,
        abi: commerceABI,
        functionName: "listProduct",
        args: [name, description, category, priceInWei, currency],
        account: address,
      });

      // Execute the transaction
      const hash = await writeContract(walletClient, request);

      // Wait for confirmation
      await waitForTransactionReceipt(publicClient, { hash });
      setSuccess("Product listed successfully!");

      // Navigate to marketplace after successful listing
      setTimeout(() => {
        navigate("/marketplace");
      }, 2000);
    } catch (err) {
      console.error("Error listing product:", err);
      setError("Failed to list the product. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-lg p-8 bg-gray-900 rounded-lg shadow-2xl border border-blue-600/30 mt-[50px] mb-[50px]"
      >
        <h2 className="text-3xl font-bold mb-8 text-white text-center">
          List Your Product
        </h2>

        {error && <p className="text-red-500 mb-4 text-center">{error}</p>}
        {success && (
          <p className="text-green-500 mb-4 text-center">{success}</p>
        )}

        <div className="mb-6">
          <label className="block text-white text-sm font-bold mb-2">
            Product Name
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            className="w-full px-4 py-3 bg-black border border-blue-600/50 rounded-lg focus:outline-none focus:border-blue-500 text-white placeholder-gray-400"
            placeholder="Enter product name"
          />
        </div>

        <div className="mb-6">
          <label className="block text-white text-sm font-bold mb-2">
            Description
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            required
            rows="4"
            className="w-full px-4 py-3 bg-black border border-blue-600/50 rounded-lg focus:outline-none focus:border-blue-500 text-white placeholder-gray-400 resize-none"
            placeholder="Enter product description"
          ></textarea>
        </div>

        <div className="mb-6">
          <label className="block text-white text-sm font-bold mb-2">
            Category
          </label>
          <select
            name="category"
            value={formData.category}
            onChange={handleChange}
            required
            className="w-full px-4 py-3 bg-black border border-blue-600/50 rounded-lg focus:outline-none focus:border-blue-500 text-white"
          >
            <option value="" disabled>
              Select Category
            </option>
            <option value="grocery">Grocery</option>
            <option value="electronics">Electronics</option>
            <option value="clothing">Clothing</option>
          </select>
        </div>

        <div className="mb-6">
          <label className="block text-white text-sm font-bold mb-2">
            Price
          </label>
          <input
            type="text"
            name="price"
            value={formData.price}
            onChange={handleChange}
            required
            className="w-full px-4 py-3 bg-black border border-blue-600/50 rounded-lg focus:outline-none focus:border-blue-500 text-white placeholder-gray-400"
            placeholder="Enter price"
          />
        </div>

        <div className="mb-8">
          <label className="block text-white text-sm font-bold mb-2">
            Currency
          </label>
          <select
            name="currency"
            value={formData.currency}
            onChange={handleChange}
            required
            className="w-full px-4 py-3 bg-black border border-blue-600/50 rounded-lg focus:outline-none focus:border-blue-500 text-white"
          >
            <option value={usdc_linea}>USDC on Linea</option>
            <option value={usdc_base}>USDC on Base</option>
            <option value={usdc_arbitrum}>USDC on Arbitrum</option>
          </select>
        </div>

        <div className="flex items-center justify-center">
          <button
            type="submit"
            disabled={loading}
            className={`w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-6 rounded-lg focus:outline-none transition-colors duration-200 text-lg ${
              loading ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            {loading ? "Listing Product..." : "List Product"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ListProducts;
