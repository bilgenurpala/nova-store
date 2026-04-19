// Shared product card widget — used across screens
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../models/product.dart';
import '../providers/cart_provider.dart';
import '../providers/favorites_provider.dart';
import '../theme/app_theme.dart';

class ProductCard extends StatelessWidget {
  final Product product;
  final VoidCallback? onTap;

  const ProductCard({super.key, required this.product, this.onTap});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        decoration: BoxDecoration(
          color: kWhite,
          borderRadius: BorderRadius.circular(16),
          boxShadow: [
            BoxShadow(color: Colors.black.withOpacity(0.06),
                blurRadius: 12, offset: const Offset(0, 4)),
          ],
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Stack(
              children: [
                ClipRRect(
                  borderRadius: const BorderRadius.vertical(
                      top: Radius.circular(16)),
                  child: AspectRatio(
                    aspectRatio: 1,
                    child: Image.network(
                      product.imageUrl,
                      fit: BoxFit.cover,
                      loadingBuilder: (_, child, progress) =>
                          progress == null
                              ? child
                              : Container(color: const Color(0xFFF5F5F5)),
                      errorBuilder: (_, __, ___) => Container(
                        color: const Color(0xFFF5F5F5),
                        child: const Icon(Icons.image_outlined,
                            color: Color(0xFFCCCCCC), size: 32),
                      ),
                    ),
                  ),
                ),
                Positioned(
                  top: 8, right: 8,
                  child: Consumer<FavoritesProvider>(
                    builder: (_, favs, __) {
                      final isFav = favs.isFavorite(product.id);
                      return GestureDetector(
                        onTap: () => favs.toggle(product),
                        child: Container(
                          width: 30, height: 30,
                          decoration: const BoxDecoration(
                              color: kWhite, shape: BoxShape.circle),
                          child: Icon(
                            isFav ? Icons.favorite : Icons.favorite_border,
                            size: 15,
                            color: isFav ? kRed : kTextSecondary,
                          ),
                        ),
                      );
                    },
                  ),
                ),
                if (product.badge != null)
                  Positioned(
                    top: 8, left: 8,
                    child: Container(
                      padding: const EdgeInsets.symmetric(
                          horizontal: 7, vertical: 3),
                      decoration: BoxDecoration(
                        color: product.badge == 'SALE' ? kRed : kOrange,
                        borderRadius: BorderRadius.circular(6),
                      ),
                      child: Text(product.badge!,
                          style: const TextStyle(color: kWhite,
                              fontSize: 9, fontWeight: FontWeight.w700)),
                    ),
                  ),
              ],
            ),
            Padding(
              padding: const EdgeInsets.fromLTRB(10, 8, 10, 10),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(product.category,
                      style: const TextStyle(fontSize: 10,
                          color: kTextSecondary)),
                  const SizedBox(height: 2),
                  Text(product.name,
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                      style: const TextStyle(fontSize: 13,
                          fontWeight: FontWeight.w600, color: kTextDark)),
                  const SizedBox(height: 6),
                  Row(
                    children: [
                      Text('\$${product.price.toStringAsFixed(0)}',
                          style: const TextStyle(fontSize: 14,
                              color: kPrimary, fontWeight: FontWeight.w700)),
                      const Spacer(),
                      Consumer<CartProvider>(
                        builder: (_, cart, __) => GestureDetector(
                          onTap: () {
                            cart.addProduct(product);
                            ScaffoldMessenger.of(context).showSnackBar(
                              SnackBar(
                                content: Text('${product.name} added'),
                                duration: const Duration(seconds: 1),
                                backgroundColor: kPrimary,
                              ),
                            );
                          },
                          child: Container(
                            width: 30, height: 30,
                            decoration: BoxDecoration(
                              color: kPrimary,
                              borderRadius: BorderRadius.circular(8),
                            ),
                            child: const Icon(Icons.add,
                                color: kWhite, size: 18),
                          ),
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
