// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract Commerce {
    uint256 public productCount = 0;

    struct Product {
        uint256 id;
        address payable seller;
        string name;
        string description;
        string category;
        uint256 price;
        address currency;
        bool purchased;
    }

    mapping(uint256 => Product) public products;

    event ProductListed(
        uint256 id,
        address seller,
        string name,
        string description,
        string category,
        uint256 price,
        address currency
    );

    // USDC addresses for different chains
    address constant USDC_LINEA = 0x176211869cA2b568f2A7D4EE941E073a821EE1ff; // USDC on Linea
    address constant USDC_BASE = 0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913; // USDC on Base
    address constant USDC_ARBITRUM = 0xaf88d065e77c8cC2239327C5EDb3A432268e5831; // USDC on Arbitrum

    // Function to list a product
    function listProduct(
        string memory _name,
        string memory _description,
        string memory _category,
        uint256 _price,
        address _currency
    ) public {
        require(bytes(_name).length > 0, "Product name is required");
        require(bytes(_description).length > 0, "Product description is required");
        require(bytes(_category).length > 0, "Product category is required");
        require(_price > 0, "Product price must be greater than zero");
        require(
            _currency == USDC_LINEA || _currency == USDC_BASE || _currency == USDC_ARBITRUM,
            "Only USDC on supported chains is allowed"
        );

        productCount++;
        products[productCount] = Product(
            productCount,
            payable(msg.sender),
            _name,
            _description,
            _category,
            _price,
            _currency,
            false
        );

        emit ProductListed(
            productCount, 
            msg.sender, 
            _name, 
            _description, 
            _category, 
            _price, 
            _currency
        );
    }

    // Function to get product details
    function getProduct(uint256 _id)
        public
        view
        returns (
            uint256 id,
            address seller,
            string memory name,
            string memory description,
            string memory category,
            uint256 price,
            address currency,
            bool purchased
        )
    {
        Product memory _product = products[_id];
        return (
            _product.id,
            _product.seller,
            _product.name,
            _product.description,
            _product.category,
            _product.price,
            _product.currency,
            _product.purchased
        );
    }

    // Function to get product count
    function getProductCount() public view returns (uint256) {
        return productCount;
    }

    // Function to get chain name from currency address
    function getChainFromCurrency(address _currency) public pure returns (string memory) {
        if (_currency == USDC_LINEA) return "Linea";
        if (_currency == USDC_BASE) return "Base";
        if (_currency == USDC_ARBITRUM) return "Arbitrum";
        return "Unknown";
    }
}
