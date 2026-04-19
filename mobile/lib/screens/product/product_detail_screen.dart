import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../models/product.dart';
import '../../providers/cart_provider.dart';
import '../../providers/favorites_provider.dart';
import '../../theme/app_theme.dart';

class ProductDetailScreen extends StatefulWidget {
  final Product product;
  const ProductDetailScreen({super.key, required this.product});

  @override
  State<ProductDetailScreen> createState() => _ProductDetailScreenState();
}

class _ProductDetailScreenState extends State<ProductDetailScreen>
    with SingleTickerProviderStateMixin {
  int _selectedColor = 0;
  int _selectedStorage = 1;
  int _qty = 1;
  late TabController _tabCtrl;

  final List<String> _colors = ['Natural Ti', 'Blue Ti', 'White Ti', 'Black Ti'];
  final List<String> _storages = ['128GB', '256GB', '512GB', '1TB'];
  final List<String> _colorHex = ['#C0B8A8', '#4A90D9', '#E8E8E8', '#1A1A1A'];

  @override
  void initState() {
    super.initState();
    _tabCtrl = TabController(length: 3, vsync: this);
  }

  @override
  void dispose() {
    _tabCtrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final p = widget.product;
    return Scaffold(
      backgroundColor: kBackground,
      body: CustomScrollView(
        slivers: [
          // ── App Bar ────────────────────────────────────────────────────
          SliverAppBar(
            backgroundColor: kDark,
            expandedHeight: 320,
            pinned: true,
            leading: IconButton(
              icon: const Icon(Icons.arrow_back_ios, color: kWhite, size: 18),
              onPressed: () => Navigator.pop(context),
            ),
            actions: [
              Consumer<FavoritesProvider>(
                builder: (_, favs, __) => IconButton(
                  icon: Icon(
                    favs.isFavorite(p.id)
                        ? Icons.favorite
                        : Icons.favorite_border,
                    color: favs.isFavorite(p.id) ? kRed : kWhite,
                    size: 22,
                  ),
                  onPressed: () => favs.toggle(p),
                ),
              ),
              IconButton(
                icon: const Icon(Icons.share_outlined, color: kWhite, size: 22),
                onPressed: () {},
              ),
            ],
            flexibleSpace: FlexibleSpaceBar(
              background: Container(
                color: const Color(0xFFF5F5F7),
                child: Image.network(
                  p.imageUrl,
                  fit: BoxFit.contain,
                  errorBuilder: (_, __, ___) => Container(
                    color: const Color(0xFFF5F5F7),
                    child: const Icon(Icons.image_outlined,
                        color: Color(0xFFCCCCCC), size: 64),
                  ),
                ),
              ),
            ),
          ),

          // ── Detail content ────────────────────────────────────────────
          SliverToBoxAdapter(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // ── Info card ──────────────────────────────────────────
                Container(
                  color: kWhite,
                  padding: const EdgeInsets.fromLTRB(20, 20, 20, 0),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      // Category chip
                      Container(
                        padding: const EdgeInsets.symmetric(
                            horizontal: 10, vertical: 4),
                        decoration: BoxDecoration(
                          color: kPrimary.withOpacity(0.1),
                          borderRadius: BorderRadius.circular(6),
                        ),
                        child: Text(p.category.toUpperCase(),
                            style: const TextStyle(
                                color: kPrimary,
                                fontSize: 10,
                                fontWeight: FontWeight.w700,
                                letterSpacing: 0.5)),
                      ),
                      const SizedBox(height: 10),
                      // Product name
                      Text(p.name,
                          style: const TextStyle(
                              fontSize: 24,
                              fontWeight: FontWeight.w800,
                              color: kTextDark,
                              height: 1.2)),
                      const SizedBox(height: 10),
                      // Rating row
                      if (p.rating > 0) ...[
                        Row(
                          children: [
                            ...List.generate(5, (i) => Icon(
                              i < p.rating.floor()
                                  ? Icons.star_rounded
                                  : (i < p.rating
                                      ? Icons.star_half_rounded
                                      : Icons.star_outline_rounded),
                              color: const Color(0xFFFBBF24),
                              size: 16,
                            )),
                            const SizedBox(width: 6),
                            Text('${p.rating}',
                                style: const TextStyle(
                                    fontSize: 13,
                                    fontWeight: FontWeight.w600,
                                    color: kTextDark)),
                            Text(' (${p.reviewCount} reviews)',
                                style: const TextStyle(
                                    fontSize: 13,
                                    color: kTextSecondary)),
                          ],
                        ),
                        const SizedBox(height: 12),
                      ],
                      // Price row
                      Row(
                        crossAxisAlignment: CrossAxisAlignment.center,
                        children: [
                          Text('\$${p.price.toStringAsFixed(0)}',
                              style: const TextStyle(
                                  fontSize: 28,
                                  fontWeight: FontWeight.w800,
                                  color: kTextDark)),
                          if (p.originalPrice != null) ...[
                            const SizedBox(width: 10),
                            Text(
                              '\$${p.originalPrice!.toStringAsFixed(0)}',
                              style: const TextStyle(
                                  fontSize: 16,
                                  color: kTextSecondary,
                                  decoration: TextDecoration.lineThrough),
                            ),
                            const SizedBox(width: 8),
                            Container(
                              padding: const EdgeInsets.symmetric(
                                  horizontal: 7, vertical: 3),
                              decoration: BoxDecoration(
                                color: kRed,
                                borderRadius: BorderRadius.circular(6),
                              ),
                              child: Text(
                                '-${((1 - p.price / p.originalPrice!) * 100).toStringAsFixed(0)}%',
                                style: const TextStyle(
                                    color: kWhite,
                                    fontSize: 11,
                                    fontWeight: FontWeight.w700),
                              ),
                            ),
                          ],
                        ],
                      ),
                      const SizedBox(height: 16),
                      // Description
                      if (p.description != null)
                        Text(
                          p.description!,
                          style: const TextStyle(
                              fontSize: 13,
                              color: kTextSecondary,
                              height: 1.5),
                        ),
                      const SizedBox(height: 20),
                    ],
                  ),
                ),
                const SizedBox(height: 8),

                // ── Color selector ─────────────────────────────────────
                Container(
                  color: kWhite,
                  padding: const EdgeInsets.fromLTRB(20, 16, 20, 16),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text('Color',
                          style: TextStyle(
                              fontSize: 15,
                              fontWeight: FontWeight.w700,
                              color: kTextDark)),
                      const SizedBox(height: 12),
                      Wrap(
                        spacing: 8,
                        children: List.generate(_colors.length, (i) {
                          final active = _selectedColor == i;
                          return GestureDetector(
                            onTap: () => setState(() => _selectedColor = i),
                            child: Container(
                              padding: const EdgeInsets.symmetric(
                                  horizontal: 14, vertical: 8),
                              decoration: BoxDecoration(
                                border: Border.all(
                                  color: active ? kPrimary : kBorder,
                                  width: active ? 2 : 1,
                                ),
                                borderRadius: BorderRadius.circular(8),
                                color: active
                                    ? kPrimary.withOpacity(0.05)
                                    : kWhite,
                              ),
                              child: Text(_colors[i],
                                  style: TextStyle(
                                      fontSize: 13,
                                      color:
                                          active ? kPrimary : kTextDark,
                                      fontWeight: active
                                          ? FontWeight.w600
                                          : FontWeight.w400)),
                            ),
                          );
                        }),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 8),

                // ── Storage selector ───────────────────────────────────
                Container(
                  color: kWhite,
                  padding: const EdgeInsets.fromLTRB(20, 16, 20, 16),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text('Storage',
                          style: TextStyle(
                              fontSize: 15,
                              fontWeight: FontWeight.w700,
                              color: kTextDark)),
                      const SizedBox(height: 12),
                      Wrap(
                        spacing: 8,
                        children: List.generate(_storages.length, (i) {
                          final active = _selectedStorage == i;
                          return GestureDetector(
                            onTap: () =>
                                setState(() => _selectedStorage = i),
                            child: Container(
                              padding: const EdgeInsets.symmetric(
                                  horizontal: 18, vertical: 9),
                              decoration: BoxDecoration(
                                border: Border.all(
                                  color: active ? kPrimary : kBorder,
                                  width: active ? 2 : 1,
                                ),
                                borderRadius: BorderRadius.circular(8),
                                color: active
                                    ? kPrimary.withOpacity(0.05)
                                    : kWhite,
                              ),
                              child: Text(_storages[i],
                                  style: TextStyle(
                                      fontSize: 13,
                                      color:
                                          active ? kPrimary : kTextDark,
                                      fontWeight: active
                                          ? FontWeight.w600
                                          : FontWeight.w400)),
                            ),
                          );
                        }),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 8),

                // ── Quantity ───────────────────────────────────────────
                Container(
                  color: kWhite,
                  padding:
                      const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
                  child: Row(
                    children: [
                      const Text('Quantity',
                          style: TextStyle(
                              fontSize: 15,
                              fontWeight: FontWeight.w700,
                              color: kTextDark)),
                      const Spacer(),
                      _QtyBtn(
                        icon: Icons.remove,
                        onTap: _qty > 1
                            ? () => setState(() => _qty--)
                            : null,
                      ),
                      Padding(
                        padding:
                            const EdgeInsets.symmetric(horizontal: 16),
                        child: Text('$_qty',
                            style: const TextStyle(
                                fontSize: 16,
                                fontWeight: FontWeight.w700,
                                color: kTextDark)),
                      ),
                      _QtyBtn(
                        icon: Icons.add,
                        onTap: () => setState(() => _qty++),
                        filled: true,
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 8),

                // ── Delivery info ──────────────────────────────────────
                Container(
                  color: kWhite,
                  padding: const EdgeInsets.all(20),
                  child: Column(
                    children: [
                      _DeliveryRow(
                        icon: Icons.local_shipping_outlined,
                        title: 'Free Delivery',
                        subtitle: 'Arrives in 2–3 business days',
                      ),
                      const Divider(height: 20, color: kBorder),
                      _DeliveryRow(
                        icon: Icons.refresh_outlined,
                        title: 'Easy Returns',
                        subtitle: '30-day hassle-free returns',
                      ),
                      const Divider(height: 20, color: kBorder),
                      _DeliveryRow(
                        icon: Icons.lock_outline,
                        title: 'Secure Payment',
                        subtitle: '256-bit SSL encryption',
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 8),

                // ── Tabs: Description / Specs / Reviews ────────────────
                Container(
                  color: kWhite,
                  child: TabBar(
                    controller: _tabCtrl,
                    indicatorColor: kPrimary,
                    labelColor: kPrimary,
                    unselectedLabelColor: kTextSecondary,
                    labelStyle: const TextStyle(
                        fontSize: 14, fontWeight: FontWeight.w600),
                    tabs: const [
                      Tab(text: 'Description'),
                      Tab(text: 'Specifications'),
                      Tab(text: 'Reviews'),
                    ],
                  ),
                ),
                SizedBox(
                  height: 280,
                  child: TabBarView(
                    controller: _tabCtrl,
                    children: [
                      // Description
                      Padding(
                        padding: const EdgeInsets.all(20),
                        child: Text(
                          p.description ??
                              '${p.name} — premium quality, cutting-edge technology, '
                              'and exceptional performance in one device.',
                          style: const TextStyle(
                              fontSize: 13,
                              color: kTextSecondary,
                              height: 1.6),
                        ),
                      ),
                      // Specifications
                      ListView(
                        padding: const EdgeInsets.all(20),
                        children: [
                          _SpecRow('Display', '6.1-inch Super Retina XDR, ProMotion'),
                          _SpecRow('Chip', 'A17 Pro — 6-core CPU, 6-core GPU'),
                          _SpecRow('Camera', '48MP Main · 12MP Ultrawide · 12MP Telephoto'),
                          _SpecRow('Battery', 'Up to 23-hour video playback'),
                          _SpecRow('Storage', '128GB / 256GB / 512GB / 1TB'),
                          _SpecRow('Connectivity', '5G, Wi-Fi 6E, Bluetooth 5.3, UWB'),
                        ],
                      ),
                      // Reviews
                      ListView(
                        padding: const EdgeInsets.all(20),
                        children: [
                          _ReviewTile('Sarah M.', 5,
                              'Absolutely love it! The camera quality is incredible.'),
                          _ReviewTile('James K.', 4,
                              'Great performance, battery could be a bit better.'),
                          _ReviewTile('Aisha R.', 5,
                              'Best phone I\'ve ever owned. Worth every penny!'),
                        ],
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 120), // space for bottom bar
              ],
            ),
          ),
        ],
      ),
      // ── Sticky bottom bar ────────────────────────────────────────────
      bottomNavigationBar: Container(
        padding: const EdgeInsets.fromLTRB(16, 12, 16, 24),
        decoration: const BoxDecoration(
          color: kWhite,
          border: Border(top: BorderSide(color: kBorder)),
        ),
        child: Consumer<CartProvider>(
          builder: (_, cart, __) => Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              ElevatedButton(
                onPressed: () {
                  for (int i = 0; i < _qty; i++) {
                    cart.addProduct(widget.product);
                  }
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(
                      content: Text('${widget.product.name} added to cart'),
                      backgroundColor: kPrimary,
                      duration: const Duration(seconds: 1),
                    ),
                  );
                },
                style: ElevatedButton.styleFrom(
                  minimumSize: const Size(double.infinity, 50),
                  backgroundColor: kPrimary,
                  shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(14)),
                ),
                child: const Text('Add to Cart',
                    style: TextStyle(
                        fontSize: 15,
                        fontWeight: FontWeight.w700,
                        color: kWhite)),
              ),
              const SizedBox(height: 8),
              Consumer<FavoritesProvider>(
                builder: (_, favs, __) => OutlinedButton(
                  onPressed: () => favs.toggle(widget.product),
                  style: OutlinedButton.styleFrom(
                    minimumSize: const Size(double.infinity, 46),
                    side: const BorderSide(color: kPrimary),
                    shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(14)),
                  ),
                  child: Text(
                    favs.isFavorite(widget.product.id)
                        ? '♥ Saved to Wishlist'
                        : 'Add to Wishlist',
                    style: const TextStyle(
                        fontSize: 14,
                        fontWeight: FontWeight.w600,
                        color: kPrimary),
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

// ── Helpers ───────────────────────────────────────────────────────────────

class _QtyBtn extends StatelessWidget {
  final IconData icon;
  final VoidCallback? onTap;
  final bool filled;

  const _QtyBtn({required this.icon, this.onTap, this.filled = false});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        width: 32,
        height: 32,
        decoration: BoxDecoration(
          color: filled ? kPrimary : (onTap == null ? kBorder : kBackground),
          borderRadius: BorderRadius.circular(8),
        ),
        child: Icon(icon,
            size: 16,
            color: filled
                ? kWhite
                : (onTap == null ? kTextSecondary : kTextDark)),
      ),
    );
  }
}

class _DeliveryRow extends StatelessWidget {
  final IconData icon;
  final String title;
  final String subtitle;

  const _DeliveryRow({
    required this.icon,
    required this.title,
    required this.subtitle,
  });

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Container(
          width: 36,
          height: 36,
          decoration: BoxDecoration(
            color: kBackground,
            borderRadius: BorderRadius.circular(10),
          ),
          child: Icon(icon, size: 18, color: kPrimary),
        ),
        const SizedBox(width: 12),
        Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(title,
                style: const TextStyle(
                    fontSize: 13,
                    fontWeight: FontWeight.w600,
                    color: kTextDark)),
            Text(subtitle,
                style: const TextStyle(
                    fontSize: 11, color: kTextSecondary)),
          ],
        ),
      ],
    );
  }
}

class _SpecRow extends StatelessWidget {
  final String label;
  final String value;
  const _SpecRow(this.label, this.value);

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 8),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SizedBox(
            width: 110,
            child: Text(label,
                style: const TextStyle(
                    fontSize: 12,
                    color: kTextSecondary,
                    fontWeight: FontWeight.w500)),
          ),
          Expanded(
            child: Text(value,
                style: const TextStyle(fontSize: 12, color: kTextDark)),
          ),
        ],
      ),
    );
  }
}

class _ReviewTile extends StatelessWidget {
  final String name;
  final int rating;
  final String text;
  const _ReviewTile(this.name, this.rating, this.text);

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              CircleAvatar(
                radius: 16,
                backgroundColor: kPrimary.withOpacity(0.1),
                child: Text(name[0],
                    style: const TextStyle(
                        color: kPrimary,
                        fontSize: 13,
                        fontWeight: FontWeight.w700)),
              ),
              const SizedBox(width: 10),
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(name,
                      style: const TextStyle(
                          fontSize: 13,
                          fontWeight: FontWeight.w600,
                          color: kTextDark)),
                  Row(
                    children: List.generate(
                        5,
                        (i) => Icon(
                              i < rating
                                  ? Icons.star_rounded
                                  : Icons.star_outline_rounded,
                              size: 12,
                              color: const Color(0xFFFBBF24),
                            )),
                  ),
                ],
              ),
            ],
          ),
          const SizedBox(height: 8),
          Text(text,
              style: const TextStyle(
                  fontSize: 13,
                  color: kTextSecondary,
                  height: 1.4)),
          const Divider(height: 20),
        ],
      ),
    );
  }
}
