// Returns a mock image URL based on productId and category
export function getProductImage(productId, category) {
  const images = {
    electronics: [
      "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=400&h=300&fit=crop",
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=300&fit=crop",
      "https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=400&h=300&fit=crop"
    ],
    grocery: [
      "https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=400&h=300&fit=crop",
      "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=400&h=300&fit=crop",
      "https://images.unsplash.com/photo-1519996529931-28324d5a630e?w=400&h=300&fit=crop"
    ],
    clothing: [
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=300&fit=crop",
      "https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=400&h=300&fit=crop",
      "https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=400&h=300&fit=crop"
    ]
  };

  const categoryImages = images[category] || images.electronics;
  const imageIndex = (parseInt(productId) - 1) % categoryImages.length;
  return categoryImages[imageIndex];
} 