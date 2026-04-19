class Product {
  final int id;
  final String name;
  final String category;
  final double price;
  final double? originalPrice;
  final String imageUrl;
  final double rating;
  final int reviewCount;
  final bool inStock;
  final String? badge; // 'SALE', 'LOW STOCK', 'NEW'
  final String? description;

  const Product({
    required this.id,
    required this.name,
    required this.category,
    required this.price,
    this.originalPrice,
    required this.imageUrl,
    this.rating = 0,
    this.reviewCount = 0,
    this.inStock = true,
    this.badge,
    this.description,
  });

  factory Product.fromJson(Map<String, dynamic> json) {
    return Product(
      id: json['id'],
      name: json['name'],
      category: json['category'] ?? '',
      price: (json['price'] as num).toDouble(),
      originalPrice: json['original_price'] != null
          ? (json['original_price'] as num).toDouble()
          : null,
      imageUrl: json['image_url'] ?? '',
      rating: (json['rating'] as num?)?.toDouble() ?? 0,
      reviewCount: json['review_count'] ?? 0,
      inStock: json['in_stock'] ?? true,
      badge: json['badge'],
      description: json['description'] as String?,
    );
  }

  bool get isOnSale => originalPrice != null && originalPrice! > price;
}
