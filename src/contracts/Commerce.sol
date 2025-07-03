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
        address buyer;
    }

    mapping(uint256 => Product) public products;
    
    // Track user purchases for leaderboard
    mapping(address => uint256) public userPurchaseCount;
    mapping(address => uint256) public userTotalSpent;

    event ProductListed(
        uint256 id,
        address seller,
        string name,
        string description,
        string category,
        uint256 price,
        address currency
    );

    event ProductPurchased(
        uint256 id,
        address seller,
        address buyer,
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
            false,
            address(0)
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

    // Function to buy a product
    function buyProduct(uint256 _productId) public {
        require(_productId > 0 && _productId <= productCount, "Invalid product ID");
        Product storage product = products[_productId];
        require(!product.purchased, "Product already purchased");
        require(msg.sender != product.seller, "Cannot buy your own product");

        // Transfer USDC from buyer to seller
        IERC20 usdcToken = IERC20(product.currency);
        require(
            usdcToken.transferFrom(msg.sender, product.seller, product.price),
            "USDC transfer failed"
        );

        // Mark product as purchased
        product.purchased = true;
        product.buyer = msg.sender;

        // Update leaderboard stats
        userPurchaseCount[msg.sender]++;
        userTotalSpent[msg.sender] += product.price;

        emit ProductPurchased(
            _productId,
            product.seller,
            msg.sender,
            product.price,
            product.currency
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
            bool purchased,
            address buyer
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
            _product.purchased,
            _product.buyer
        );
    }

    // Function to get products by seller address
    function getProductsBySeller(address _seller) public view returns (uint256[] memory) {
        uint256[] memory sellerProducts = new uint256[](productCount);
        uint256 count = 0;
        
        for (uint256 i = 1; i <= productCount; i++) {
            if (products[i].seller == _seller) {
                sellerProducts[count] = i;
                count++;
            }
        }
        
        // Resize array to actual count
        uint256[] memory result = new uint256[](count);
        for (uint256 i = 0; i < count; i++) {
            result[i] = sellerProducts[i];
        }
        
        return result;
    }

    // Function to get products by buyer address
    function getProductsByBuyer(address _buyer) public view returns (uint256[] memory) {
        uint256[] memory buyerProducts = new uint256[](productCount);
        uint256 count = 0;
        
        for (uint256 i = 1; i <= productCount; i++) {
            if (products[i].buyer == _buyer) {
                buyerProducts[count] = i;
                count++;
            }
        }
        
        // Resize array to actual count
        uint256[] memory result = new uint256[](count);
        for (uint256 i = 0; i < count; i++) {
            result[i] = buyerProducts[i];
        }
        
        return result;
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

    // Function to get user stats for leaderboard
    function getUserStats(address _user) public view returns (uint256 purchaseCount, uint256 totalSpent) {
        return (userPurchaseCount[_user], userTotalSpent[_user]);
    }

    // Function to get all product IDs
    function getAllProducts() public view returns (uint256[] memory) {
        uint256[] memory allProducts = new uint256[](productCount);
        for (uint256 i = 0; i < productCount; i++) {
            allProducts[i] = i + 1;
        }
        return allProducts;
    }
}
