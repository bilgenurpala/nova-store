import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/cart_provider.dart';
import '../providers/favorites_provider.dart';
import '../theme/app_theme.dart';
import 'home/home_screen.dart';
import 'shop/shop_screen.dart';
import 'favorites/favorites_screen.dart';
import 'cart/cart_screen.dart';
import 'profile/profile_screen.dart';

class MainShell extends StatefulWidget {
  const MainShell({super.key});

  @override
  State<MainShell> createState() => _MainShellState();
}

class _MainShellState extends State<MainShell> {
  int _currentIndex = 0;

  final List<Widget> _pages = const [
    HomeScreen(),
    ShopScreen(),
    FavoritesScreen(),
    CartScreen(),
    ProfileScreen(),
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: IndexedStack(
        index: _currentIndex,
        children: _pages,
      ),
      bottomNavigationBar: _NovaBottomNav(
        currentIndex: _currentIndex,
        onTap: (i) => setState(() => _currentIndex = i),
      ),
    );
  }
}

class _NovaBottomNav extends StatelessWidget {
  final int currentIndex;
  final ValueChanged<int> onTap;

  const _NovaBottomNav({required this.currentIndex, required this.onTap});

  @override
  Widget build(BuildContext context) {
    final items = [
      _NavItem(icon: Icons.home_outlined, activeIcon: Icons.home, label: 'Home'),
      _NavItem(icon: Icons.shopping_bag_outlined, activeIcon: Icons.shopping_bag, label: 'Shop'),
      _NavItem(icon: Icons.favorite_outline, activeIcon: Icons.favorite, label: 'Favs'),
      _NavItem(icon: Icons.shopping_cart_outlined, activeIcon: Icons.shopping_cart, label: 'Cart'),
      _NavItem(icon: Icons.person_outline, activeIcon: Icons.person, label: 'Profile'),
    ];

    return Container(
      decoration: const BoxDecoration(
        color: kWhite,
        border: Border(top: BorderSide(color: kBorder, width: 1)),
      ),
      child: SafeArea(
        top: false,
        child: SizedBox(
          height: 60,
          child: Row(
            children: List.generate(items.length, (i) {
              final item = items[i];
              final isActive = currentIndex == i;
              Widget iconWidget = Icon(
                isActive ? item.activeIcon : item.icon,
                size: 22,
                color: isActive ? kPrimary : kTextSecondary,
              );

              // Cart badge
              if (i == 3) {
                iconWidget = Consumer<CartProvider>(
                  builder: (_, cart, __) => Stack(
                    clipBehavior: Clip.none,
                    children: [
                      Icon(
                        isActive ? item.activeIcon : item.icon,
                        size: 22,
                        color: isActive ? kPrimary : kTextSecondary,
                      ),
                      if (cart.count > 0)
                        Positioned(
                          right: -4,
                          top: -4,
                          child: Container(
                            width: 14,
                            height: 14,
                            decoration: const BoxDecoration(
                                color: kRed, shape: BoxShape.circle),
                            child: Center(
                              child: Text('${cart.count}',
                                  style: const TextStyle(
                                      color: kWhite,
                                      fontSize: 9,
                                      fontWeight: FontWeight.w700)),
                            ),
                          ),
                        ),
                    ],
                  ),
                );
              }

              // Favs badge
              if (i == 2) {
                iconWidget = Consumer<FavoritesProvider>(
                  builder: (_, favs, __) => Stack(
                    clipBehavior: Clip.none,
                    children: [
                      Icon(
                        isActive ? item.activeIcon : item.icon,
                        size: 22,
                        color: isActive ? kPrimary : kTextSecondary,
                      ),
                      if (favs.count > 0)
                        Positioned(
                          right: -4,
                          top: -4,
                          child: Container(
                            width: 14,
                            height: 14,
                            decoration: const BoxDecoration(
                                color: kPrimary, shape: BoxShape.circle),
                            child: Center(
                              child: Text('${favs.count}',
                                  style: const TextStyle(
                                      color: kWhite,
                                      fontSize: 9,
                                      fontWeight: FontWeight.w700)),
                            ),
                          ),
                        ),
                    ],
                  ),
                );
              }

              return Expanded(
                child: GestureDetector(
                  behavior: HitTestBehavior.opaque,
                  onTap: () => onTap(i),
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      iconWidget,
                      const SizedBox(height: 3),
                      Text(
                        item.label,
                        style: TextStyle(
                          fontSize: 10,
                          fontWeight:
                              isActive ? FontWeight.w600 : FontWeight.w400,
                          color: isActive ? kPrimary : kTextSecondary,
                        ),
                      ),
                      if (isActive)
                        Container(
                          margin: const EdgeInsets.only(top: 3),
                          width: 20,
                          height: 2,
                          decoration: BoxDecoration(
                            color: kPrimary,
                            borderRadius: BorderRadius.circular(1),
                          ),
                        ),
                    ],
                  ),
                ),
              );
            }),
          ),
        ),
      ),
    );
  }
}

class _NavItem {
  final IconData icon;
  final IconData activeIcon;
  final String label;
  const _NavItem(
      {required this.icon, required this.activeIcon, required this.label});
}
