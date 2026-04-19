import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../providers/auth_provider.dart';
import '../../providers/cart_provider.dart';
import '../../theme/app_theme.dart';
import '../auth/login_screen.dart';
import '../admin/admin_screen.dart';

class ProfileScreen extends StatelessWidget {
  const ProfileScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Consumer<AuthProvider>(
      builder: (_, auth, __) {
        if (!auth.isLoggedIn) return _NotLoggedIn(context);
        return _ProfileBody(auth: auth);
      },
    );
  }

  Widget _NotLoggedIn(BuildContext context) {
    return Scaffold(
      backgroundColor: kBackground,
      appBar: AppBar(
        backgroundColor: kDark,
        centerTitle: true,
        title: const Text('My Profile',
            style: TextStyle(color: kWhite, fontWeight: FontWeight.w700)),
        actions: [
          IconButton(
            icon: const Icon(Icons.notifications_outlined, color: kWhite, size: 22),
            onPressed: () {},
          ),
        ],
      ),
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(Icons.person_outline, size: 64, color: kTextSecondary),
            const SizedBox(height: 16),
            const Text('Sign in to view your profile',
                style: TextStyle(fontSize: 16, color: kTextDark,
                    fontWeight: FontWeight.w600)),
            const SizedBox(height: 8),
            const Text('Access orders, wishlist and more',
                style: TextStyle(fontSize: 13, color: kTextSecondary)),
            const SizedBox(height: 24),
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 48),
              child: ElevatedButton(
                onPressed: () => Navigator.push(context,
                    MaterialPageRoute(builder: (_) => const LoginScreen())),
                style: ElevatedButton.styleFrom(
                  minimumSize: const Size.fromHeight(50),
                  shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(12)),
                ),
                child: const Text('Sign In',
                    style: TextStyle(fontSize: 15, fontWeight: FontWeight.w600)),
              ),
            ),
            const SizedBox(height: 12),
            TextButton(
              onPressed: () => Navigator.push(context,
                  MaterialPageRoute(builder: (_) => const LoginScreen())),
              child: const Text('Create an account →',
                  style: TextStyle(color: kPrimary, fontSize: 13,
                      fontWeight: FontWeight.w500)),
            ),
          ],
        ),
      ),
    );
  }
}

class _ProfileBody extends StatefulWidget {
  final AuthProvider auth;
  const _ProfileBody({required this.auth});

  @override
  State<_ProfileBody> createState() => _ProfileBodyState();
}

class _ProfileBodyState extends State<_ProfileBody> {
  bool _darkMode = false;

  @override
  Widget build(BuildContext context) {
    final auth = widget.auth;
    return Scaffold(
      backgroundColor: kBackground,
      appBar: AppBar(
        backgroundColor: kDark,
        centerTitle: true,
        title: const Text('My Profile',
            style: TextStyle(color: kWhite, fontWeight: FontWeight.w700,
                fontSize: 17)),
        actions: [
          IconButton(
            icon: const Icon(Icons.notifications_outlined, color: kWhite, size: 22),
            onPressed: () {},
          ),
        ],
      ),
      body: ListView(
        children: [
          // ── Profile Header (white bg, matches Figma) ─────────────────
          Container(
            color: kWhite,
            padding: const EdgeInsets.fromLTRB(20, 24, 20, 20),
            child: Column(
              children: [
                // Avatar circle with blue border
                Container(
                  width: 80, height: 80,
                  decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    border: Border.all(color: kPrimary, width: 3),
                  ),
                  child: CircleAvatar(
                    backgroundColor: const Color(0xFF0D2580),
                    child: Text(auth.userInitial,
                        style: const TextStyle(color: kWhite, fontSize: 30,
                            fontWeight: FontWeight.w700)),
                  ),
                ),
                const SizedBox(height: 12),
                Text(auth.userName,
                    style: const TextStyle(color: kTextDark, fontSize: 20,
                        fontWeight: FontWeight.w700)),
                const SizedBox(height: 4),
                Text(auth.userEmail ?? '',
                    style: const TextStyle(color: kTextSecondary, fontSize: 13)),
                const SizedBox(height: 8),
                GestureDetector(
                  onTap: () {},
                  child: const Text('Edit Profile →',
                      style: TextStyle(color: kPrimary, fontSize: 13,
                          fontWeight: FontWeight.w600)),
                ),
                const SizedBox(height: 20),
                // Stats row — matches Figma exactly
                Container(
                  padding: const EdgeInsets.symmetric(vertical: 16),
                  decoration: BoxDecoration(
                    color: kBackground,
                    borderRadius: BorderRadius.circular(14),
                  ),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                    children: [
                      _Stat('12', 'Orders'),
                      _VertDivider(),
                      _Stat('8', 'Wishlist'),
                      _VertDivider(),
                      _Stat('5', 'Reviews'),
                      _VertDivider(),
                      _Stat('2.4k', 'Points'),
                    ],
                  ),
                ),
              ],
            ),
          ),

          // ── Admin Panel button (only for admin) ──────────────────────
          if (auth.isAdmin) ...[
            const SizedBox(height: 8),
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              child: ElevatedButton.icon(
                onPressed: () => Navigator.push(context,
                    MaterialPageRoute(builder: (_) => const AdminScreen())),
                icon: const Icon(Icons.admin_panel_settings_outlined),
                label: const Text('Admin Panel'),
                style: ElevatedButton.styleFrom(
                  minimumSize: const Size.fromHeight(50),
                  backgroundColor: const Color(0xFF1A2A5E),
                  foregroundColor: kPrimary,
                  shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(12)),
                ),
              ),
            ),
          ],
          const SizedBox(height: 8),

          // ── Recent Order ──────────────────────────────────────────────
          Container(
            color: kWhite,
            padding: const EdgeInsets.all(16),
            child: Column(
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const Text('Recent Order',
                        style: TextStyle(fontSize: 15,
                            fontWeight: FontWeight.w700, color: kTextDark)),
                    TextButton(
                      onPressed: () {},
                      child: const Text('See all →',
                          style: TextStyle(color: kPrimary, fontSize: 12,
                              fontWeight: FontWeight.w500)),
                    ),
                  ],
                ),
                const SizedBox(height: 8),
                Container(
                  padding: const EdgeInsets.all(14),
                  decoration: BoxDecoration(
                    color: kBackground,
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Row(
                    children: [
                      Container(
                        width: 48, height: 48,
                        decoration: BoxDecoration(
                          color: kWhite,
                          borderRadius: BorderRadius.circular(10),
                        ),
                        child: const Icon(Icons.smartphone,
                            color: kTextSecondary, size: 24),
                      ),
                      const SizedBox(width: 12),
                      const Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text('iPhone 15 Pro · 256GB · Black',
                                style: TextStyle(fontSize: 13,
                                    fontWeight: FontWeight.w600,
                                    color: kTextDark)),
                            SizedBox(height: 2),
                            Text('Order #NV-20241201',
                                style: TextStyle(fontSize: 11,
                                    color: kTextSecondary)),
                            SizedBox(height: 4),
                            Row(children: [
                              Icon(Icons.check_circle,
                                  color: kGreen, size: 12),
                              SizedBox(width: 3),
                              Text('Delivered',
                                  style: TextStyle(fontSize: 11,
                                      color: kGreen,
                                      fontWeight: FontWeight.w500)),
                            ]),
                          ],
                        ),
                      ),
                      const Text('\$999',
                          style: TextStyle(fontSize: 15,
                              fontWeight: FontWeight.w700, color: kPrimary)),
                    ],
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 8),

          // ── Account section ───────────────────────────────────────────
          _MenuGroup(title: 'Account', items: const [
            _MenuItem(icon: Icons.person_outline,
                label: 'Personal Information'),
            _MenuItem(icon: Icons.location_on_outlined,
                label: 'Saved Addresses'),
            _MenuItem(icon: Icons.credit_card_outlined,
                label: 'Payment Methods'),
            _MenuItem(icon: Icons.notifications_outlined,
                label: 'Notifications'),
          ]),
          const SizedBox(height: 8),

          // ── Shopping section ──────────────────────────────────────────
          _MenuGroup(title: 'Shopping', items: const [
            _MenuItem(icon: Icons.shopping_bag_outlined, label: 'My Orders'),
            _MenuItem(icon: Icons.favorite_outline, label: 'Wishlist'),
            _MenuItem(icon: Icons.star_outline, label: 'My Reviews'),
            _MenuItem(icon: Icons.card_giftcard_outlined,
                label: 'Loyalty Points  2,400 pts'),
          ]),
          const SizedBox(height: 8),

          // ── Preferences ───────────────────────────────────────────────
          Container(
            color: kWhite,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Padding(
                  padding: EdgeInsets.fromLTRB(16, 14, 16, 8),
                  child: Text('Preferences',
                      style: TextStyle(fontSize: 12,
                          fontWeight: FontWeight.w600,
                          color: kTextSecondary)),
                ),
                const _MenuItem(icon: Icons.lock_outline,
                    label: 'Security & Privacy'),
                Padding(
                  padding: const EdgeInsets.symmetric(
                      horizontal: 16, vertical: 10),
                  child: Row(
                    children: [
                      const Icon(Icons.dark_mode_outlined,
                          size: 20, color: kTextSecondary),
                      const SizedBox(width: 12),
                      const Expanded(child: Text('Dark Mode',
                          style: TextStyle(fontSize: 14, color: kTextDark))),
                      Switch(
                        value: _darkMode,
                        activeColor: kPrimary,
                        onChanged: (v) => setState(() => _darkMode = v),
                      ),
                    ],
                  ),
                ),
                const _MenuItem(icon: Icons.language_outlined,
                    label: 'Language  English'),
              ],
            ),
          ),
          const SizedBox(height: 24),

          // ── Sign Out ──────────────────────────────────────────────────
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16),
            child: OutlinedButton(
              onPressed: () async {
                final cart = context.read<CartProvider>();
                await auth.logout();
                cart.clear();
              },
              style: OutlinedButton.styleFrom(
                minimumSize: const Size.fromHeight(50),
                side: const BorderSide(color: kRed),
                shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12)),
              ),
              child: const Text('← Sign Out',
                  style: TextStyle(color: kRed, fontSize: 14,
                      fontWeight: FontWeight.w600)),
            ),
          ),
          const SizedBox(height: 32),
        ],
      ),
    );
  }
}

// ── Shared widgets ────────────────────────────────────────────────────────
class _Stat extends StatelessWidget {
  final String value;
  final String label;
  const _Stat(this.value, this.label);

  @override
  Widget build(BuildContext context) => Column(
        children: [
          Text(value,
              style: const TextStyle(color: kPrimary, fontSize: 20,
                  fontWeight: FontWeight.w800)),
          const SizedBox(height: 2),
          Text(label,
              style: const TextStyle(color: kTextSecondary, fontSize: 11)),
        ],
      );
}

class _VertDivider extends StatelessWidget {
  const _VertDivider();

  @override
  Widget build(BuildContext context) =>
      Container(width: 1, height: 32, color: kBorder);
}

class _MenuGroup extends StatelessWidget {
  final String title;
  final List<Widget> items;
  const _MenuGroup({required this.title, required this.items});

  @override
  Widget build(BuildContext context) => Container(
        color: kWhite,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Padding(
              padding: const EdgeInsets.fromLTRB(16, 14, 16, 8),
              child: Text(title,
                  style: const TextStyle(fontSize: 12,
                      fontWeight: FontWeight.w600, color: kTextSecondary)),
            ),
            ...items,
          ],
        ),
      );
}

class _MenuItem extends StatelessWidget {
  final IconData icon;
  final String label;
  const _MenuItem({required this.icon, required this.label});

  @override
  Widget build(BuildContext context) => InkWell(
        onTap: () {},
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
          child: Row(
            children: [
              Icon(icon, size: 20, color: kTextSecondary),
              const SizedBox(width: 12),
              Expanded(child: Text(label,
                  style: const TextStyle(fontSize: 14, color: kTextDark))),
              const Icon(Icons.chevron_right,
                  size: 18, color: kTextSecondary),
            ],
          ),
        ),
      );
}
