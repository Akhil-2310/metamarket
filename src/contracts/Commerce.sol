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
        bool purchased;
    }

    mapping(uint256 => Product) public products;
     mapping(address => uint256[]) public purchasedProducts;

    event ProductListed(
        uint256 id,
        address seller,
        string name,
        string description,
        string image,
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

 
    address constant USDT_ADDRESS = 0x1abFB5a6B1c8AA5eB928f2447ED2b22d471b38A3; // USDT on Linea
    address constant DAI_ADDRESS = 0xC817c2C63178877069107873489ea69819f1A537; // DAI on Linea

    // Function to list a product
    function listProduct(
        string memory _name,
        string memory _description,
        string memory _image,
        string memory _category,
        uint256 _price,
        address _currency
    ) public {
        require(bytes(_name).length > 0, "Product name is required");
        require(bytes(_description).length > 0, "Product description is required");
        require(bytes(_image).length > 0, "Product image is required");
        require(bytes(_category).length > 0, "Product category is required");
        require(_price > 0, "Product price must be greater than zero");
        // require(bytes(_currency).length > 0, "Product currency is required");
       // require(_currency != address(0), "Invalid currency address");
         require(
             _currency == USDT_ADDRESS || _currency == DAI_ADDRESS,
            "Unsupported currency"
        );

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
            false
        );

        emit ProductListed(productCount, msg.sender, _name, _description, _image, _category, _price, _currency);
    }

    // Function to purchase a product
    function purchaseProduct(uint256 _id) public payable {
        Product storage _product = products[_id];
        require(_product.id > 0 && _product.id <= productCount, "Product does not exist");
        require(!_product.purchased, "Product already purchased");
        require(_product.seller != msg.sender, "Seller cannot buy their own product");

       // _product.seller.transfer(msg.value);
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

    function getPurchasedProducts() public view returns (uint256[] memory) {
        return purchasedProducts[msg.sender];
    }
}
