import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../models/product.dart';
import '../../services/api_service.dart';
import '../../theme/app_theme.dart';
import '../../providers/cart_provider.dart';
import '../../providers/favorites_provider.dart';
import '../product/product_detail_screen.dart';
import '../ai_chat/ai_chat_screen.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  List<Product> _products = [];
  bool _loading = true;

  // Figma: each category chip has its own color
  final List<_CatData> _categories = const [
    _CatData('Phones',    Icons.smartphone_outlined,        Color(0xFF1754F5), Color(0xFFEEF3FF)),
    _CatData('Laptops',   Icons.laptop_outlined,             Color(0xFFF97316), Color(0xFFFFF7ED)),
    _CatData('Audio',     Icons.headphones_outlined,         Color(0xFF22C55E), Color(0xFFF0FDF4)),
    _CatData('Watches',   Icons.watch_outlined,              Color(0xFFA855F7), Color(0xFFFAF5FF)),
  ];

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    final products = await ApiService().getProducts(limit: 4);
    if (mounted) setState(() { _products = products; _loading = false; });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: kBackground,
      appBar: _buildAppBar(),
      body: RefreshIndicator(
        color: kPrimary,
        onRefresh: _load,
        child: ListView(
          padding: EdgeInsets.zero,
          children: [
            _buildHero(),
            _buildAiBanner(),
            const SizedBox(height: 16),
            _buildCategories(),
            const SizedBox(height: 16),
            _buildFeatured(),
            const SizedBox(height: 24),
          ],
        ),
      ),
    );
  }

  PreferredSizeWidget _buildAppBar() {
    return AppBar(
      backgroundColor: kDark,
      titleSpacing: 20,
      title: _NovaLogo(),
      centerTitle: false,
      actions: [
        // AI Chat butonu — robot ikonu
        IconButton(
          icon: const Icon(Icons.smart_toy_outlined, color: kWhite, size: 22),
          tooltip: 'Nova AI',
          onPressed: () => Navigator.push(context,
              MaterialPageRoute(builder: (_) => const AiChatScreen())),
        ),
        IconButton(
          icon: const Icon(Icons.search, color: kWhite, size: 22),
          onPressed: () {},
        ),
        Padding(
          padding: const EdgeInsets.only(right: 8),
          child: Consumer<CartProvider>(
            builder: (_, cart, __) => Stack(
              children: [
                IconButton(
                  icon: const Icon(Icons.shopping_bag_outlined,
                      color: kWhite, size: 22),
                  onPressed: () {},
                ),
                if (cart.count > 0)
                  Positioned(
                    right: 6, top: 6,
                    child: Container(
                      width: 16, height: 16,
                      decoration: const BoxDecoration(
                          color: kRed, shape: BoxShape.circle),
                      child: Center(
                        child: Text('${cart.count}',
                            style: const TextStyle(
                                color: kWhite, fontSize: 9,
                                fontWeight: FontWeight.w700)),
                      ),
                    ),
                  ),
              ],
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildHero() {
    return Container(
      color: kDark,
      padding: const EdgeInsets.fromLTRB(20, 24, 20, 28),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text('Shop Smarter.',
                    style: TextStyle(color: kWhite, fontSize: 26,
                        fontWeight: FontWeight.w700, height: 1.2)),
                const SizedBox(height: 2),
                const Text('AI-powered',
                    style: TextStyle(color: kPrimary, fontSize: 26,
                        fontWeight: FontWeight.w700, height: 1.2)),
                const Text('recommendations.',
                    style: TextStyle(color: kWhite, fontSize: 26,
                        fontWeight: FontWeight.w700, height: 1.2)),
                const SizedBox(height: 8),
                const Text('Discover products tailored for you.',
                    style: TextStyle(color: kTextSecondary, fontSize: 12)),
                const SizedBox(height: 20),
                ElevatedButton(
                  onPressed: () {},
                  style: ElevatedButton.styleFrom(
                    backgroundColor: kPrimary,
                    padding: const EdgeInsets.symmetric(
                        horizontal: 20, vertical: 12),
                    shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(10)),
                  ),
                  child: const Text('Shop Now →',
                      style: TextStyle(fontSize: 13,
                          fontWeight: FontWeight.w600)),
                ),
              ],
            ),
          ),
          const SizedBox(width: 16),
          // Rocket icon box — Figma: dark card, blue rocket
          Container(
            width: 80, height: 80,
            decoration: BoxDecoration(
              color: const Color(0xFF1A1A2E),
              borderRadius: BorderRadius.circular(18),
            ),
            child: const Center(
              child: Icon(Icons.rocket_launch_rounded,
                  color: kPrimary, size: 38),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildAiBanner() {
    return Container(
      color: kWhite,
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
        decoration: BoxDecoration(
          color: const Color(0xFFEEF3FF),
          borderRadius: BorderRadius.circular(12),
        ),
        child: Row(
          children: [
            Container(
              width: 34, height: 34,
              decoration: const BoxDecoration(
                  color: kPrimary, shape: BoxShape.circle),
              child: const Icon(Icons.auto_awesome,
                  color: kWhite, size: 17),
            ),
            const SizedBox(width: 10),
            const Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text('AI Shopping Assistant',
                      style: TextStyle(color: kPrimary, fontSize: 13,
                          fontWeight: FontWeight.w600)),
                  Text('Get personalized picks →',
                      style: TextStyle(color: kTextSecondary, fontSize: 11)),
                ],
              ),
            ),
            ElevatedButton(
              onPressed: () => Navigator.push(context,
                  MaterialPageRoute(builder: (_) => const AiChatScreen())),
              style: ElevatedButton.styleFrom(
                backgroundColor: kPrimary,
                minimumSize: const Size(48, 30),
                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
                shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(8)),
                textStyle: const TextStyle(
                    fontSize: 12, fontWeight: FontWeight.w600),
              ),
              child: const Text('Try'),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildCategories() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Padding(
          padding: EdgeInsets.symmetric(horizontal: 16),
          child: Text('Categories',
              style: TextStyle(fontSize: 16, fontWeight: FontWeight.w700,
                  color: kTextDark)),
        ),
        const SizedBox(height: 10),
        SizedBox(
          height: 38,
          child: ListView.builder(
            scrollDirection: Axis.horizontal,
            padding: const EdgeInsets.symmetric(horizontal: 16),
            itemCount: _categories.length,
            itemBuilder: (_, i) {
              final c = _categories[i];
              return Padding(
                padding: const EdgeInsets.only(right: 8),
                child: Container(
                  padding: const EdgeInsets.symmetric(
                      horizontal: 14, vertical: 8),
                  decoration: BoxDecoration(
                    color: c.bgColor,
                    borderRadius: BorderRadius.circular(20),
                    border: Border.all(color: c.color.withOpacity(0.3)),
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Icon(c.icon, size: 15, color: c.color),
                      const SizedBox(width: 6),
                      Text(c.label,
                          style: TextStyle(fontSize: 13,
                              color: c.color,
                              fontWeight: FontWeight.w500)),
                    ],
                  ),
                ),
              );
            },
          ),
        ),
      ],
    );
  }

  Widget _buildFeatured() {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text('Featured Products',
                  style: TextStyle(fontSize: 16, fontWeight: FontWeight.w700,
                      color: kTextDark)),
              TextButton(
                onPressed: () {},
                child: const Text('See all',
                    style: TextStyle(color: kPrimary, fontSize: 13,
                        fontWeight: FontWeight.w500)),
              ),
            ],
          ),
          const SizedBox(height: 8),
          _loading
              ? GridView.count(
                  crossAxisCount: 2,
                  shrinkWrap: true,
                  physics: const NeverScrollableScrollPhysics(),
                  crossAxisSpacing: 12,
                  mainAxisSpacing: 12,
                  childAspectRatio: 0.65,
                  children: List.generate(4, (_) => Container(
                      decoration: BoxDecoration(
                          color: kWhite,
                          borderRadius: BorderRadius.circular(16)))),
                )
              : GridView.builder(
                  shrinkWrap: true,
                  physics: const NeverScrollableScrollPhysics(),
                  gridDelegate:
                      const SliverGridDelegateWithFixedCrossAxisCount(
                    crossAxisCount: 2,
                    crossAxisSpacing: 12,
                    mainAxisSpacing: 12,
                    childAspectRatio: 0.65,
                  ),
                  itemCount: _products.length,
                  itemBuilder: (_, i) => GestureDetector(
                    onTap: () => Navigator.push(context,
                      MaterialPageRoute(builder: (_) =>
                          ProductDetailScreen(product: _products[i]))),
                    child: _ProductCard(product: _products[i]),
                  ),
                ),
          const SizedBox(height: 16),
          Container(
            width: double.infinity,
            height: 48,
            decoration: BoxDecoration(
              color: kWhite,
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: kBorder),
            ),
            child: const Center(
              child: Text('View All Products',
                  style: TextStyle(color: kTextSecondary, fontSize: 14,
                      fontWeight: FontWeight.w500)),
            ),
          ),
        ],
      ),
    );
  }
}

// ── Small data class for category ─────────────────────────────────────────
class _CatData {
  final String label;
  final IconData icon;
  final Color color;
  final Color bgColor;
  const _CatData(this.label, this.icon, this.color, this.bgColor);
}

// ── NovaStore logo ────────────────────────────────────────────────────────
class _NovaLogo extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return RichText(
      text: const TextSpan(
        children: [
          TextSpan(text: 'Nova',
              style: TextStyle(color: kPrimary, fontWeight: FontWeight.w700,
                  fontSize: 20)),
          TextSpan(text: 'Store',
              style: TextStyle(color: kWhite, fontWeight: FontWeight.w700,
                  fontSize: 20)),
        ],
      ),
    );
  }
}

// ── Product card ──────────────────────────────────────────────────────────
class _ProductCard extends StatelessWidget {
  final Product product;
  const _ProductCard({required this.product});

  @override
  Widget build(BuildContext context) {
    return Container(
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
                          color: Color(0xFFCCCCCC), size: 32),
                    ),
                  ),
                ),
              ),
              // Heart
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
                              content: Text('${product.name} added to cart'),
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
    );
  }
}
