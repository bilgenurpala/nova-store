import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../models/product.dart';
import '../../services/api_service.dart';
import '../../theme/app_theme.dart';
import '../../providers/cart_provider.dart';
import '../../providers/favorites_provider.dart';
import '../product/product_detail_screen.dart';

class ShopScreen extends StatefulWidget {
  const ShopScreen({super.key});

  @override
  State<ShopScreen> createState() => _ShopScreenState();
}

class _ShopScreenState extends State<ShopScreen> {
  List<Product> _products = [];
  bool _loading = true;
  String _selectedCategory = 'All';
  String _sortBy = 'Popular';
  bool _showFilters = false;
  double _maxPrice = 2000;
  final List<String> _selectedBrands = [];
  final _searchCtrl = TextEditingController();

  final List<String> _categories = ['All', 'Phones', 'Laptops', 'Audio', 'Watches'];
  final List<String> _brands = ['Apple', 'Samsung', 'Sony', 'Logitech'];
  final List<String> _sortOptions = [
    'Popular', 'Price: Low to High', 'Price: High to Low', 'Newest'
  ];

  @override
  void initState() {
    super.initState();
    _load();
  }

  @override
  void dispose() {
    _searchCtrl.dispose();
    super.dispose();
  }

  Future<void> _load() async {
    setState(() => _loading = true);
    final products = await ApiService().getProducts(
      category: _selectedCategory == 'All' ? null : _selectedCategory,
      search: _searchCtrl.text,
      limit: 20,
    );
    if (mounted) setState(() { _products = products; _loading = false; });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: kBackground,
      appBar: _buildAppBar(),
      body: Column(
        children: [
          // Count + Sort row
          Container(
            color: kWhite,
            padding: const EdgeInsets.fromLTRB(16, 10, 16, 10),
            child: Row(
              children: [
                Text('${_products.length} products',
                    style: const TextStyle(fontSize: 13,
                        color: kTextSecondary)),
                const Spacer(),
                GestureDetector(
                  onTap: _showSortSheet,
                  child: Row(
                    children: [
                      Text('Sort: $_sortBy',
                          style: const TextStyle(fontSize: 13,
                              color: kTextDark,
                              fontWeight: FontWeight.w500)),
                      const Icon(Icons.keyboard_arrow_down,
                          size: 16, color: kTextDark),
                    ],
                  ),
                ),
              ],
            ),
          ),
          // Category chips
          Container(
            color: kWhite,
            padding: const EdgeInsets.only(bottom: 10),
            child: SizedBox(
              height: 36,
              child: ListView.builder(
                scrollDirection: Axis.horizontal,
                padding: const EdgeInsets.symmetric(horizontal: 16),
                itemCount: _categories.length,
                itemBuilder: (_, i) {
                  final cat = _categories[i];
                  final active = _selectedCategory == cat;
                  return Padding(
                    padding: const EdgeInsets.only(right: 8),
                    child: GestureDetector(
                      onTap: () {
                        setState(() => _selectedCategory = cat);
                        _load();
                      },
                      child: Container(
                        padding: const EdgeInsets.symmetric(
                            horizontal: 16, vertical: 8),
                        decoration: BoxDecoration(
                          color: active ? kPrimary : kWhite,
                          borderRadius: BorderRadius.circular(20),
                          border: Border.all(
                              color: active ? kPrimary : kBorder),
                        ),
                        child: Text(cat,
                            style: TextStyle(
                                fontSize: 13,
                                fontWeight: FontWeight.w500,
                                color: active ? kWhite : kTextDark)),
                      ),
                    ),
                  );
                },
              ),
            ),
          ),
          // Filter panel
          if (_showFilters) _buildFilterPanel(),
          // Grid
          Expanded(
            child: _loading
                ? const Center(
                    child: CircularProgressIndicator(color: kPrimary))
                : _products.isEmpty
                    ? const Center(
                        child: Text('No products found',
                            style: TextStyle(color: kTextSecondary,
                                fontSize: 15)))
                    : GridView.builder(
                        padding: const EdgeInsets.all(16),
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
                          child: _ShopProductCard(product: _products[i]),
                        ),
                      ),
          ),
        ],
      ),
    );
  }

  PreferredSizeWidget _buildAppBar() {
    return AppBar(
      backgroundColor: kDark,
      titleSpacing: 16,
      title: RichText(
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
      ),
      centerTitle: false,
      actions: [
        Consumer<CartProvider>(
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
                          style: const TextStyle(color: kWhite,
                              fontSize: 9, fontWeight: FontWeight.w700)),
                    ),
                  ),
                ),
            ],
          ),
        ),
      ],
      bottom: PreferredSize(
        preferredSize: const Size.fromHeight(56),
        child: Container(
          color: kDark,
          padding: const EdgeInsets.fromLTRB(16, 0, 16, 12),
          child: Row(
            children: [
              // Search input — Figma: white/light inside dark bar
              Expanded(
                child: Container(
                  height: 40,
                  decoration: BoxDecoration(
                    color: const Color(0xFFF5F5F7),
                    borderRadius: BorderRadius.circular(10),
                  ),
                  child: TextField(
                    controller: _searchCtrl,
                    style: const TextStyle(color: kTextDark, fontSize: 13),
                    onSubmitted: (_) => _load(),
                    decoration: const InputDecoration(
                      hintText: 'Search products...',
                      hintStyle: TextStyle(color: kTextSecondary, fontSize: 13),
                      prefixIcon: Icon(Icons.search,
                          color: kTextSecondary, size: 18),
                      border: InputBorder.none,
                      contentPadding: EdgeInsets.symmetric(vertical: 10),
                    ),
                  ),
                ),
              ),
              const SizedBox(width: 8),
              // Filter icon button
              GestureDetector(
                onTap: () => setState(() => _showFilters = !_showFilters),
                child: Container(
                  width: 40, height: 40,
                  decoration: BoxDecoration(
                    color: _showFilters
                        ? kPrimary
                        : const Color(0xFF2A2A2A),
                    borderRadius: BorderRadius.circular(10),
                  ),
                  child: Icon(Icons.tune,
                      color: _showFilters ? kWhite : kTextSecondary,
                      size: 18),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildFilterPanel() {
    return Container(
      color: kWhite,
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text('Filters',
                  style: TextStyle(fontSize: 16, fontWeight: FontWeight.w700,
                      color: kTextDark)),
              TextButton(
                onPressed: () {
                  setState(() {
                    _maxPrice = 2000;
                    _selectedBrands.clear();
                  });
                },
                child: const Text('Reset all',
                    style: TextStyle(color: kPrimary, fontSize: 13,
                        fontWeight: FontWeight.w500)),
              ),
            ],
          ),
          const Text('Price Range',
              style: TextStyle(fontSize: 14, fontWeight: FontWeight.w600,
                  color: kTextDark)),
          Slider(
            value: _maxPrice, min: 0, max: 2000,
            activeColor: kPrimary,
            inactiveColor: const Color(0xFFE0E7FF),
            onChanged: (v) => setState(() => _maxPrice = v),
          ),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text('\$0',
                  style: TextStyle(fontSize: 12, color: kTextSecondary)),
              Text('\$${_maxPrice.toStringAsFixed(0)}',
                  style: const TextStyle(fontSize: 12, color: kPrimary,
                      fontWeight: FontWeight.w600)),
            ],
          ),
          const SizedBox(height: 12),
          const Text('Brand',
              style: TextStyle(fontSize: 14, fontWeight: FontWeight.w600,
                  color: kTextDark)),
          const SizedBox(height: 8),
          ..._brands.map((b) => CheckboxListTile(
                dense: true,
                contentPadding: EdgeInsets.zero,
                value: _selectedBrands.contains(b),
                activeColor: kPrimary,
                title: Text(b,
                    style: const TextStyle(fontSize: 14, color: kTextDark)),
                onChanged: (v) {
                  setState(() {
                    v == true
                        ? _selectedBrands.add(b)
                        : _selectedBrands.remove(b);
                  });
                },
              )),
        ],
      ),
    );
  }

  void _showSortSheet() {
    showModalBottomSheet(
      context: context,
      shape: const RoundedRectangleBorder(
          borderRadius: BorderRadius.vertical(top: Radius.circular(20))),
      builder: (_) => Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          const SizedBox(height: 12),
          Container(width: 36, height: 4,
              decoration: BoxDecoration(color: kBorder,
                  borderRadius: BorderRadius.circular(2))),
          const SizedBox(height: 16),
          const Text('Sort by',
              style: TextStyle(fontSize: 16, fontWeight: FontWeight.w700)),
          const SizedBox(height: 8),
          ..._sortOptions.map((s) => ListTile(
                title: Text(s),
                trailing: _sortBy == s
                    ? const Icon(Icons.check, color: kPrimary) : null,
                onTap: () {
                  setState(() => _sortBy = s);
                  Navigator.pop(context);
                  _load();
                },
              )),
          const SizedBox(height: 12),
        ],
      ),
    );
  }
}

// ── Shop product card (no shadow, Figma style) ───────────────────────────
class _ShopProductCard extends StatelessWidget {
  final Product product;
  const _ShopProductCard({required this.product});

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
                            color: Color(0xFFCCCCCC), size: 32)),
                  ),
                ),
              ),
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
                            ? Icons.favorite
                            : Icons.favorite_border,
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
