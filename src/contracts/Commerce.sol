// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract Commerce is ReentrancyGuard{
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
    mapping(address => uint256[]) public purchasedProducts;
    
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
        address buyer,
        address seller,
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

        emit ProductListed(productCount, msg.sender, _name, _description, _category, _price, _currency);
    }

    // Function to purchase a product
    function purchaseProduct(uint256 _id) public payable nonReentrant {
        Product storage _product = products[_id];
        require(_product.id > 0 && _product.id <= productCount, "Product does not exist");
        require(!_product.purchased, "Product already purchased");
        require(_product.seller != msg.sender, "Seller cannot buy their own product");

        IERC20 token = IERC20(_product.currency);
        require(token.transferFrom(msg.sender, _product.seller, _product.price), "Payment failed");
        
        _product.purchased = true;
        _product.buyer = msg.sender;
        products[_id] = _product;

        purchasedProducts[msg.sender].push(_id);

        // Update leaderboard stats
        userPurchaseCount[msg.sender]++;
        userTotalSpent[msg.sender] += _product.price;

        emit ProductPurchased(_id, msg.sender, _product.seller, _product.price, _product.currency);
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

    // Function to get purchased products for a user
    function getPurchasedProducts(address _user) public view returns (uint256[] memory) {
        return purchasedProducts[_user];
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

    // Function to get token symbol from currency address
    function getTokenSymbol(address _currency) public pure returns (string memory) {
        if (_currency == USDC_LINEA || _currency == USDC_BASE || _currency == USDC_ARBITRUM) return "USDC";
        return "Unknown";
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

    // Function to get user stats for leaderboard
    function getUserStats(address _user) public view returns (uint256 purchaseCount, uint256 totalSpent) {
        return (userPurchaseCount[_user], userTotalSpent[_user]);
    }

    // Function to get all product details as parallel arrays
    function getAllProducts() public view returns (
        uint256[] memory ids,
        address[] memory sellers,
        string[] memory names,
        string[] memory descriptions,
        string[] memory categories,
        uint256[] memory prices,
        address[] memory currencies,
        bool[] memory purchased,
        address[] memory buyers
    ) {
        ids = new uint256[](productCount);
        sellers = new address[](productCount);
        names = new string[](productCount);
        descriptions = new string[](productCount);
        categories = new string[](productCount);
        prices = new uint256[](productCount);
        currencies = new address[](productCount);
        purchased = new bool[](productCount);
        buyers = new address[](productCount);

        for (uint256 i = 0; i < productCount; i++) {
            Product storage p = products[i + 1];
            ids[i] = p.id;
            sellers[i] = p.seller;
            names[i] = p.name;
            descriptions[i] = p.description;
            categories[i] = p.category;
            prices[i] = p.price;
            currencies[i] = p.currency;
            purchased[i] = p.purchased;
            buyers[i] = p.buyer;
        }
    }

    // Helper function to check if a product can be purchased
    function canPurchaseProduct(uint256 _productId, address _buyer) public view returns (bool canPurchase, string memory reason) {
        if (_productId <= 0 || _productId > productCount) {
            return (false, "Invalid product ID");
        }
        
        Product storage product = products[_productId];
        
        if (product.purchased) {
            return (false, "Product already purchased");
        }
        
        if (_buyer == product.seller) {
            return (false, "Cannot buy your own product");
        }
        
        IERC20 token = IERC20(product.currency);
        uint256 balance = token.balanceOf(_buyer);
        
        if (balance < product.price) {
            return (false, "Insufficient token balance");
        }
        
        uint256 allowance = token.allowance(_buyer, address(this));
        if (allowance < product.price) {
            return (false, "Insufficient token allowance");
        }
        
        return (true, "Can purchase");
    }
}