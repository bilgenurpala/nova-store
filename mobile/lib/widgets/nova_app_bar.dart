import 'package:flutter/material.dart';
import '../theme/app_theme.dart';
import '../providers/cart_provider.dart';
import 'package:provider/provider.dart';

class NovaAppBar extends StatelessWidget implements PreferredSizeWidget {
  final List<Widget>? actions;
  final bool showSearch;
  final bool showCart;

  const NovaAppBar({
    super.key,
    this.actions,
    this.showSearch = true,
    this.showCart = true,
  });

  @override
  Size get preferredSize => const Size.fromHeight(56);

  @override
  Widget build(BuildContext context) {
    return AppBar(
      backgroundColor: kDark,
      titleSpacing: 16,
      title: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Text('Nova',
              style: TextStyle(
                  color: kPrimary,
                  fontWeight: FontWeight.w700,
                  fontSize: 20)),
          const Text('Store',
              style: TextStyle(
                  color: kWhite,
                  fontWeight: FontWeight.w700,
                  fontSize: 20)),
        ],
      ),
      centerTitle: false,
      actions: [
        if (showSearch)
          IconButton(
            icon: const Icon(Icons.search, color: kWhite, size: 22),
            onPressed: () {},
          ),
        if (showCart)
          Consumer<CartProvider>(
            builder: (_, cart, __) => Stack(
              children: [
                IconButton(
                  icon: const Icon(Icons.shopping_bag_outlined,
                      color: kWhite, size: 22),
                  onPressed: () {
                    // Navigate to cart tab
                  },
                ),
                if (cart.count > 0)
                  Positioned(
                    right: 6,
                    top: 6,
                    child: Container(
                      width: 16,
                      height: 16,
                      decoration: const BoxDecoration(
                        color: kRed,
                        shape: BoxShape.circle,
                      ),
                      child: Center(
                        child: Text(
                          '${cart.count}',
                          style: const TextStyle(
                              color: kWhite,
                              fontSize: 10,
                              fontWeight: FontWeight.w700),
                        ),
                      ),
                    ),
                  ),
              ],
            ),
          ),
        if (actions != null) ...actions!,
      ],
    );
  }
}
