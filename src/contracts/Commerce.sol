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
        string image;
        string category;
        uint256 price;
        address currency;
        string receiveCurrency; // New field for cross-chain support
        bool purchased;
    }

    mapping(uint256 => Product) public products;
    mapping(address => uint256[]) public purchasedProducts;
    mapping(address => uint256[]) public sellerProducts; // Track products by seller

    event ProductListed(
        uint256 id,
        address seller,
        string name,
        string description,
        string image,
        string category,
        uint256 price,
        address currency,
        string receiveCurrency
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
        string memory _image,
        string memory _category,
        uint256 _price,
        address _currency,
        string memory _receiveCurrency
    ) public {
        require(bytes(_name).length > 0, "Product name is required");
        require(bytes(_description).length > 0, "Product description is required");
        require(bytes(_image).length > 0, "Product image is required");
        require(bytes(_category).length > 0, "Product category is required");
        require(_price > 0, "Product price must be greater than zero");
        require(
            _currency == USDC_LINEA || _currency == USDC_BASE || _currency == USDC_ARBITRUM,
            "Unsupported currency"
        );
        require(bytes(_receiveCurrency).length > 0, "Receive currency is required");

        productCount++;
        products[productCount] = Product(
            productCount,
            payable(msg.sender),
            _name,
            _description,
            _image,
            _category,
            _price,
            _currency,
            _receiveCurrency,
            false
        );

        // Track product by seller
        sellerProducts[msg.sender].push(productCount);

        emit ProductListed(
            productCount, 
            msg.sender, 
            _name, 
            _description, 
            _image, 
            _category, 
            _price, 
            _currency,
            _receiveCurrency
        );
    }

    // Function to purchase a product
    function purchaseProduct(uint256 _id) public payable {
        Product storage _product = products[_id];
        require(_product.id > 0 && _product.id <= productCount, "Product does not exist");
        require(!_product.purchased, "Product already purchased");
        require(_product.seller != msg.sender, "Seller cannot buy their own product");

        IERC20 token = IERC20(_product.currency);
        require(token.transferFrom(msg.sender, _product.seller, _product.price), "Payment failed");
        
        _product.purchased = true;
        products[_id] = _product;

        purchasedProducts[msg.sender].push(_id);

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
            string memory image,
            string memory category,
            uint256 price,
            address currency,
            string memory receiveCurrency,
            bool purchased
        )
    {
        Product memory _product = products[_id];
        return (
            _product.id,
            _product.seller,
            _product.name,
            _product.description,
            _product.image,
            _product.category,
            _product.price,
            _product.currency,
            _product.receiveCurrency,
            _product.purchased
        );
    }

    // Function to get all products (for marketplace)
    function getAllProducts() public view returns (uint256[] memory) {
        uint256[] memory allProducts = new uint256[](productCount);
        for (uint256 i = 1; i <= productCount; i++) {
            allProducts[i - 1] = i;
        }
        return allProducts;
    }

    // Function to get available products (not purchased)
    function getAvailableProducts() public view returns (uint256[] memory) {
        uint256 availableCount = 0;
        
        // First, count available products
        for (uint256 i = 1; i <= productCount; i++) {
            if (!products[i].purchased) {
                availableCount++;
            }
        }
        
        // Then, create array with available products
        uint256[] memory availableProducts = new uint256[](availableCount);
        uint256 index = 0;
        
        for (uint256 i = 1; i <= productCount; i++) {
            if (!products[i].purchased) {
                availableProducts[index] = i;
                index++;
            }
        }
        
        return availableProducts;
    }

    // Function to get products by category
    function getProductsByCategory(string memory _category) public view returns (uint256[] memory) {
        uint256 categoryCount = 0;
        
        // First, count products in category
        for (uint256 i = 1; i <= productCount; i++) {
            if (keccak256(bytes(products[i].category)) == keccak256(bytes(_category)) && !products[i].purchased) {
                categoryCount++;
            }
        }
        
        // Then, create array with products in category
        uint256[] memory categoryProducts = new uint256[](categoryCount);
        uint256 index = 0;
        
        for (uint256 i = 1; i <= productCount; i++) {
            if (keccak256(bytes(products[i].category)) == keccak256(bytes(_category)) && !products[i].purchased) {
                categoryProducts[index] = i;
                index++;
            }
        }
        
        return categoryProducts;
    }

    // Function to get products by seller
    function getProductsBySeller(address _seller) public view returns (uint256[] memory) {
        return sellerProducts[_seller];
    }

    // Function to get purchased products
    function getPurchasedProducts() public view returns (uint256[] memory) {
        return purchasedProducts[msg.sender];
    }

    // Function to get product count
    function getProductCount() public view returns (uint256) {
        return productCount;
    }

    // Function to check if product exists
    function productExists(uint256 _id) public view returns (bool) {
        return _id > 0 && _id <= productCount;
    }
}
