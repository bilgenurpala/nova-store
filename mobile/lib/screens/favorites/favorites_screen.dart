import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../providers/favorites_provider.dart';
import '../../providers/cart_provider.dart';
import '../../theme/app_theme.dart';
import '../../models/product.dart';
import '../product/product_detail_screen.dart';

class FavoritesScreen extends StatefulWidget {
  const FavoritesScreen({super.key});

  @override
  State<FavoritesScreen> createState() => _FavoritesScreenState();
}

class _FavoritesScreenState extends State<FavoritesScreen> {
  String _filter = 'All';

  @override
  Widget build(BuildContext context) {
    return Consumer<FavoritesProvider>(
      builder: (_, favs, __) {
        final all = favs.items;
        final filtered = _filter == 'In Stock'
            ? all.where((p) => p.inStock).toList()
            : _filter == 'On Sale'
                ? all.where((p) => p.isOnSale).toList()
                : all;

        return Scaffold(
          backgroundColor: kBackground,
          appBar: AppBar(
            backgroundColor: kDark,
            titleSpacing: 16,
            title: Row(
              children: [
                RichText(
                  text: const TextSpan(children: [
                    TextSpan(text: 'Nova',
                        style: TextStyle(color: kPrimary,
                            fontWeight: FontWeight.w700, fontSize: 20)),
                    TextSpan(text: 'Store',
                        style: TextStyle(color: kWhite,
                            fontWeight: FontWeight.w700, fontSize: 20)),
                  ]),
                ),
                const SizedBox(width: 10),
                const Text('Wishlist',
                    style: TextStyle(color: kWhite, fontSize: 16,
                        fontWeight: FontWeight.w400)),
              ],
            ),
            centerTitle: false,
            actions: [
              IconButton(
                icon: const Icon(Icons.grid_view_rounded,
                    color: kWhite, size: 20),
                onPressed: () {},
              ),
            ],
          ),
          body: Column(
            children: [
              // Filter tabs — Figma: white bg
              Container(
                color: kWhite,
                padding: const EdgeInsets.symmetric(
                    horizontal: 16, vertical: 10),
                child: Row(
                  children: [
                    _Tab('All (${all.length})', 'All'),
                    const SizedBox(width: 8),
                    _Tab('In Stock', 'In Stock'),
                    const SizedBox(width: 8),
                    _Tab('On Sale', 'On Sale'),
                  ],
                ),
              ),
              // AI banner — Figma: light blue bg
              Padding(
                padding: const EdgeInsets.fromLTRB(16, 12, 16, 0),
                child: Container(
                  padding: const EdgeInsets.symmetric(
                      horizontal: 14, vertical: 10),
                  decoration: BoxDecoration(
                    color: const Color(0xFFEEF3FF),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Row(
                    children: [
                      Container(
                        width: 30, height: 30,
                        decoration: const BoxDecoration(
                            color: kPrimary, shape: BoxShape.circle),
                        child: const Icon(Icons.auto_awesome,
                            color: kWhite, size: 15),
                      ),
                      const SizedBox(width: 10),
                      const Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text('AI noticed you like Apple products',
                                style: TextStyle(color: kPrimary,
                                    fontSize: 12,
                                    fontWeight: FontWeight.w600)),
                            Text('Check out the new iPhone 15 Pro Max →',
                                style: TextStyle(
                                    color: kTextSecondary, fontSize: 11),
                                overflow: TextOverflow.ellipsis),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
              ),
              const SizedBox(height: 12),
              // Grid
              Expanded(
                child: all.isEmpty
                    ? const Center(
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Icon(Icons.favorite_outline,
                                size: 64, color: kTextSecondary),
                            SizedBox(height: 16),
                            Text('No favourites yet',
                                style: TextStyle(fontSize: 18,
                                    fontWeight: FontWeight.w600,
                                    color: kTextDark)),
                            SizedBox(height: 8),
                            Text('Tap ♥ on any product to save it here',
                                style: TextStyle(color: kTextSecondary,
                                    fontSize: 13)),
                          ],
                        ),
                      )
                    : GridView.builder(
                        padding: const EdgeInsets.fromLTRB(16, 0, 16, 16),
                        gridDelegate:
                            const SliverGridDelegateWithFixedCrossAxisCount(
                          crossAxisCount: 2,
                          crossAxisSpacing: 12,
                          mainAxisSpacing: 12,
                          childAspectRatio: 0.65,
                        ),
                        itemCount: filtered.length,
                        itemBuilder: (_, i) => GestureDetector(
                          onTap: () => Navigator.push(context,
                            MaterialPageRoute(builder: (_) =>
                                ProductDetailScreen(product: filtered[i]))),
                          child: _FavCard(product: filtered[i]),
                        ),
                      ),
              ),
            ],
          ),
        );
      },
    );
  }

  Widget _Tab(String label, String value) {
    final active = _filter == value;
    return GestureDetector(
      onTap: () => setState(() => _filter = value),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
        decoration: BoxDecoration(
          color: active ? kPrimary : kWhite,
          borderRadius: BorderRadius.circular(20),
          border: Border.all(color: active ? kPrimary : kBorder),
        ),
        child: Text(label,
            style: TextStyle(
                fontSize: 12,
                fontWeight: FontWeight.w500,
                color: active ? kWhite : kTextSecondary)),
      ),
    );
  }
}

class _FavCard extends StatelessWidget {
  final Product product;
  const _FavCard({required this.product});

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        color: kWhite,
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(color: Colors.black.withOpacity(0.05),
              blurRadius: 8, offset: const Offset(0, 2)),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisSize: MainAxisSize.min,
        children: [
          Stack(
            children: [
              ClipRRect(
                borderRadius: const BorderRadius.vertical(
                    top: Radius.circular(16)),
                child: AspectRatio(
                  aspectRatio: 1.1,
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
                            color: Color(0xFFCCCCCC))),
                  ),
                ),
              ),
              // Badge
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
              // Heart
              Positioned(
                top: 8, right: 8,
                child: Consumer<FavoritesProvider>(
                  builder: (_, favs, __) => GestureDetector(
                    onTap: () => favs.toggle(product),
                    child: Container(
                      width: 30, height: 30,
                      decoration: const BoxDecoration(
                          color: kWhite, shape: BoxShape.circle),
                      child: Icon(
                        favs.isFavorite(product.id)
                            ? Icons.favorite : Icons.favorite_border,
                        size: 15,
                        color: favs.isFavorite(product.id)
                            ? kRed : kTextSecondary,
                      ),
                    ),
                  ),
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
                        onTap: () => cart.addProduct(product),
                        child: Container(
                          width: 28, height: 28,
                          decoration: BoxDecoration(
                            color: kPrimary,
                            borderRadius: BorderRadius.circular(8),
                          ),
                          child: const Icon(Icons.add,
                              color: kWhite, size: 16),
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
    );
  }
}
