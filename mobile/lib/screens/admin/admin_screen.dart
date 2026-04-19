import 'package:flutter/material.dart';
import '../../services/api_service.dart';
import '../../theme/app_theme.dart';

class AdminScreen extends StatefulWidget {
  const AdminScreen({super.key});

  @override
  State<AdminScreen> createState() => _AdminScreenState();
}

class _AdminScreenState extends State<AdminScreen> {
  int _currentIndex = 0;

  final List<_AdminNavItem> _navItems = const [
    _AdminNavItem(icon: Icons.grid_view_rounded,      label: 'Dashboard'),
    _AdminNavItem(icon: Icons.inventory_2_outlined,   label: 'Products'),
    _AdminNavItem(icon: Icons.receipt_long_outlined,  label: 'Orders'),
    _AdminNavItem(icon: Icons.people_outline,         label: 'Users'),
    _AdminNavItem(icon: Icons.settings_outlined,      label: 'Settings'),
  ];

  @override
  Widget build(BuildContext context) {
    final pages = [
      const _DashboardTab(),
      const _ProductsTab(),
      const _OrdersTab(),
      const _UsersTab(),
      const _SettingsTab(),
    ];

    return Scaffold(
      backgroundColor: kBackground,
      appBar: AppBar(
        backgroundColor: kDark,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios, color: kWhite, size: 18),
          onPressed: () => Navigator.pop(context),
        ),
        centerTitle: true,
        title: const Text('Admin Dashboard',
            style: TextStyle(color: kWhite, fontSize: 16,
                fontWeight: FontWeight.w700)),
        actions: [
          IconButton(
            icon: const Icon(Icons.notifications_outlined,
                color: kWhite, size: 22),
            onPressed: () {},
          ),
        ],
      ),
      body: IndexedStack(index: _currentIndex, children: pages),
      bottomNavigationBar: Container(
        decoration: const BoxDecoration(
          color: kDark,
          border: Border(top: BorderSide(color: Color(0xFF222222))),
        ),
        child: SafeArea(
          top: false,
          child: SizedBox(
            height: 60,
            child: Row(
              children: List.generate(_navItems.length, (i) {
                final item   = _navItems[i];
                final active = _currentIndex == i;
                return Expanded(
                  child: GestureDetector(
                    behavior: HitTestBehavior.opaque,
                    onTap: () => setState(() => _currentIndex = i),
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(item.icon, size: 22,
                            color: active ? kPrimary : kTextSecondary),
                        const SizedBox(height: 3),
                        Text(item.label,
                            style: TextStyle(
                                fontSize: 10,
                                fontWeight: active
                                    ? FontWeight.w600
                                    : FontWeight.w400,
                                color: active ? kPrimary : kTextSecondary)),
                        if (active)
                          Container(
                            margin: const EdgeInsets.only(top: 3),
                            width: 20, height: 2,
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
      ),
    );
  }
}

class _AdminNavItem {
  final IconData icon;
  final String label;
  const _AdminNavItem({required this.icon, required this.label});
}

// ═══════════════════════════════════════════════════════════════
// DASHBOARD TAB
// ═══════════════════════════════════════════════════════════════
class _DashboardTab extends StatefulWidget {
  const _DashboardTab();
  @override
  State<_DashboardTab> createState() => _DashboardTabState();
}

class _DashboardTabState extends State<_DashboardTab> {
  Map<String, dynamic> _stats = {};
  List<dynamic> _recentOrders = [];
  bool _loading = true;

  final Map<String, Color> _statusColors = {
    'pending':   kOrange,
    'paid':      kPrimary,
    'shipped':   const Color(0xFFA855F7),
    'delivered': kGreen,
    'cancelled': kRed,
  };

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    final stats  = await ApiService().getAdminDashboard();
    final orders = await ApiService().getAdminOrders();
    if (mounted) {
      setState(() {
        _stats        = stats;
        _recentOrders = orders.take(5).toList();
        _loading      = false;
      });
    }
  }

  String _fmt(dynamic val) {
    final n = (val as num).toDouble();
    if (n >= 1000) return '\$${(n / 1000).toStringAsFixed(1)}k';
    return '\$$n';
  }

  String _todayDate() {
    final now = DateTime.now();
    const months = ['Jan','Feb','Mar','Apr','May','Jun',
                    'Jul','Aug','Sep','Oct','Nov','Dec'];
    return '${months[now.month - 1]} ${now.day}, ${now.year}';
  }

  String _capitalize(String s) =>
      s.isEmpty ? s : s[0].toUpperCase() + s.substring(1);

  @override
  Widget build(BuildContext context) {
    if (_loading) {
      return const Center(child: CircularProgressIndicator(color: kPrimary));
    }
    return RefreshIndicator(
      onRefresh: _load,
      color: kPrimary,
      child: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          // ── Welcome banner ──────────────────────────────────────────
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
            decoration: BoxDecoration(
              color: kDark,
              borderRadius: BorderRadius.circular(14),
            ),
            child: Row(
              children: [
                const Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text('Welcome, Admin',
                          style: TextStyle(color: kWhite, fontSize: 16,
                              fontWeight: FontWeight.w700)),
                      SizedBox(height: 2),
                      Text('NovaStore Control Center',
                          style: TextStyle(color: kTextSecondary,
                              fontSize: 12)),
                    ],
                  ),
                ),
                Container(
                  padding: const EdgeInsets.symmetric(
                      horizontal: 12, vertical: 6),
                  decoration: BoxDecoration(
                    color: kPrimary.withOpacity(0.15),
                    borderRadius: BorderRadius.circular(20),
                  ),
                  child: Text(_todayDate(),
                      style: const TextStyle(color: kPrimary, fontSize: 11,
                          fontWeight: FontWeight.w600)),
                ),
              ],
            ),
          ),
          const SizedBox(height: 16),

          // ── 4 stat cards ────────────────────────────────────────────
          const Text("Today's Overview",
              style: TextStyle(fontSize: 15, fontWeight: FontWeight.w700,
                  color: kTextDark)),
          const SizedBox(height: 10),
          GridView.count(
            crossAxisCount: 2,
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            crossAxisSpacing: 10,
            mainAxisSpacing: 10,
            childAspectRatio: 1.55,
            children: [
              _StatCard(label: 'Revenue',
                  value: _fmt(_stats['total_revenue'] ?? 0),
                  icon: Icons.attach_money, color: kGreen),
              _StatCard(label: 'Orders',
                  value: '${_stats['total_orders'] ?? 0}',
                  icon: Icons.shopping_bag_outlined, color: kPrimary),
              _StatCard(label: 'Users',
                  value: '${_stats['total_users'] ?? 0}',
                  icon: Icons.people_outline, color: kOrange),
              _StatCard(label: 'Products',
                  value: '${_stats['total_products'] ?? 0}',
                  icon: Icons.inventory_2_outlined,
                  color: const Color(0xFFA855F7)),
            ],
          ),
          const SizedBox(height: 20),

          // ── Revenue bar chart ───────────────────────────────────────
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: kWhite, borderRadius: BorderRadius.circular(14)),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text('Revenue (This Week)',
                    style: TextStyle(fontSize: 14,
                        fontWeight: FontWeight.w700, color: kTextDark)),
                const SizedBox(height: 16),
                const _SimpleBarChart(),
              ],
            ),
          ),
          const SizedBox(height: 16),

          // ── Recent orders table ─────────────────────────────────────
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text('Recent Orders',
                  style: TextStyle(fontSize: 15, fontWeight: FontWeight.w700,
                      color: kTextDark)),
              TextButton(onPressed: () {},
                  child: const Text('View all →',
                      style: TextStyle(color: kPrimary, fontSize: 12))),
            ],
          ),
          const SizedBox(height: 8),
          Container(
            decoration: BoxDecoration(color: kWhite,
                borderRadius: BorderRadius.circular(14)),
            child: Column(
              children: [
                Padding(
                  padding: const EdgeInsets.fromLTRB(14, 12, 14, 8),
                  child: Row(children: const [
                    Expanded(flex: 2, child: Text('Order',
                        style: TextStyle(fontSize: 10,
                            color: kTextSecondary,
                            fontWeight: FontWeight.w600))),
                    Expanded(flex: 2, child: Text('Customer',
                        style: TextStyle(fontSize: 10,
                            color: kTextSecondary,
                            fontWeight: FontWeight.w600))),
                    Expanded(flex: 2, child: Text('Amount',
                        style: TextStyle(fontSize: 10,
                            color: kTextSecondary,
                            fontWeight: FontWeight.w600))),
                    Expanded(flex: 2, child: Text('Status',
                        textAlign: TextAlign.right,
                        style: TextStyle(fontSize: 10,
                            color: kTextSecondary,
                            fontWeight: FontWeight.w600))),
                  ]),
                ),
                const Divider(height: 1, color: kBorder),
                if (_recentOrders.isEmpty)
                  const Padding(
                    padding: EdgeInsets.all(20),
                    child: Text('No orders yet',
                        style: TextStyle(color: kTextSecondary)),
                  )
                else
                  ..._recentOrders.map((o) {
                    final order  = o as Map<String, dynamic>;
                    final status = order['status'] as String? ?? 'pending';
                    final color  = _statusColors[status] ?? kTextSecondary;
                    final email  = order['user']?['email'] as String? ?? 'Customer';
                    final name   = email.split('@').first;
                    return Column(children: [
                      Padding(
                        padding: const EdgeInsets.symmetric(
                            horizontal: 14, vertical: 10),
                        child: Row(children: [
                          Expanded(flex: 2,
                              child: Text('#${order['id']}',
                                  style: const TextStyle(fontSize: 12,
                                      color: kPrimary,
                                      fontWeight: FontWeight.w600))),
                          Expanded(flex: 2,
                              child: Text(name,
                                  style: const TextStyle(
                                      fontSize: 12, color: kTextDark))),
                          Expanded(flex: 2,
                              child: Text(
                                  '\$${order['total_price'] ?? 0}',
                                  style: const TextStyle(fontSize: 12,
                                      color: kPrimary,
                                      fontWeight: FontWeight.w600))),
                          Expanded(flex: 2,
                              child: Align(
                                alignment: Alignment.centerRight,
                                child: Container(
                                  padding: const EdgeInsets.symmetric(
                                      horizontal: 7, vertical: 3),
                                  decoration: BoxDecoration(
                                    color: color.withOpacity(0.12),
                                    borderRadius: BorderRadius.circular(20),
                                  ),
                                  child: Text(_capitalize(status),
                                      style: TextStyle(fontSize: 9,
                                          color: color,
                                          fontWeight: FontWeight.w700)),
                                ),
                              )),
                        ]),
                      ),
                      const Divider(height: 1, color: kBorder),
                    ]);
                  }),
              ],
            ),
          ),
          const SizedBox(height: 16),

          // ── Quick actions ───────────────────────────────────────────
          const Text('Quick Actions',
              style: TextStyle(fontSize: 15, fontWeight: FontWeight.w700,
                  color: kTextDark)),
          const SizedBox(height: 10),
          GridView.count(
            crossAxisCount: 2,
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            crossAxisSpacing: 10,
            mainAxisSpacing: 10,
            childAspectRatio: 2.4,
            children: [
              _QuickAction(icon: Icons.add_box_outlined,
                  label: 'Add Product', color: kPrimary),
              _QuickAction(icon: Icons.campaign_outlined,
                  label: 'Send Promo', color: kGreen),
              _QuickAction(icon: Icons.bar_chart_outlined,
                  label: 'Analytics', color: kOrange),
              _QuickAction(icon: Icons.settings_outlined,
                  label: 'Settings',
                  color: const Color(0xFFA855F7)),
            ],
          ),
          const SizedBox(height: 16),

          // ── AI Insight ──────────────────────────────────────────────
          Container(
            padding: const EdgeInsets.all(14),
            decoration: BoxDecoration(
              color: kAiBanner,
              borderRadius: BorderRadius.circular(14),
              border: Border.all(color: kPrimary.withOpacity(0.2)),
            ),
            child: Row(
              children: [
                Container(
                  width: 36, height: 36,
                  decoration: const BoxDecoration(
                      color: kPrimary, shape: BoxShape.circle),
                  child: const Icon(Icons.auto_awesome,
                      color: kWhite, size: 18),
                ),
                const SizedBox(width: 12),
                const Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text('AI Insight',
                          style: TextStyle(color: kPrimary, fontSize: 13,
                              fontWeight: FontWeight.w700)),
                      SizedBox(height: 2),
                      Text(
                        'iPhone 15 Pro stock running low (14 units). '
                        'Restock in 3 days recommended.',
                        style: TextStyle(color: kTextSecondary,
                            fontSize: 11, height: 1.4),
                      ),
                    ],
                  ),
                ),
                const SizedBox(width: 8),
                TextButton(
                  onPressed: () {},
                  child: const Text('Restock →',
                      style: TextStyle(color: kPrimary, fontSize: 11,
                          fontWeight: FontWeight.w600)),
                ),
              ],
            ),
          ),
          const SizedBox(height: 24),
        ],
      ),
    );
  }
}

// ── Stat card widget ──────────────────────────────────────────────────────
class _StatCard extends StatelessWidget {
  final String label, value;
  final IconData icon;
  final Color color;
  const _StatCard({required this.label, required this.value,
      required this.icon, required this.color});

  @override
  Widget build(BuildContext context) => Container(
        padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(
          color: kWhite,
          borderRadius: BorderRadius.circular(14),
          boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.04),
              blurRadius: 6, offset: const Offset(0, 2))],
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Icon(icon, color: color, size: 22),
            const Spacer(),
            Text(value,
                style: TextStyle(fontSize: 20, fontWeight: FontWeight.w800,
                    color: color)),
            Text(label,
                style: const TextStyle(fontSize: 11, color: kTextSecondary)),
          ],
        ),
      );
}

// ── Quick action card ─────────────────────────────────────────────────────
class _QuickAction extends StatelessWidget {
  final IconData icon;
  final String label;
  final Color color;
  const _QuickAction({required this.icon, required this.label,
      required this.color});

  @override
  Widget build(BuildContext context) => InkWell(
        onTap: () {},
        borderRadius: BorderRadius.circular(12),
        child: Container(
          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
          decoration: BoxDecoration(color: kWhite,
              borderRadius: BorderRadius.circular(12)),
          child: Row(children: [
            Container(
              width: 32, height: 32,
              decoration: BoxDecoration(
                color: color.withOpacity(0.1),
                borderRadius: BorderRadius.circular(8),
              ),
              child: Icon(icon, color: color, size: 17),
            ),
            const SizedBox(width: 10),
            Expanded(child: Text(label,
                style: const TextStyle(fontSize: 12,
                    fontWeight: FontWeight.w600, color: kTextDark))),
            const Icon(Icons.chevron_right, size: 14, color: kTextSecondary),
          ]),
        ),
      );
}

// ── Simple bar chart ──────────────────────────────────────────────────────
class _SimpleBarChart extends StatelessWidget {
  const _SimpleBarChart();

  @override
  Widget build(BuildContext context) {
    const days   = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
    const values = [0.45, 0.60, 0.38, 0.80, 0.55, 0.70, 0.90];
    const maxVal = 0.90;
    return SizedBox(
      height: 100,
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.end,
        children: List.generate(days.length, (i) {
          final isMax = values[i] == maxVal;
          return Expanded(
            child: Padding(
              padding: const EdgeInsets.symmetric(horizontal: 3),
              child: Column(
                mainAxisAlignment: MainAxisAlignment.end,
                children: [
                  Container(
                    height: 72 * values[i],
                    decoration: BoxDecoration(
                      color: isMax
                          ? kPrimary
                          : kPrimary.withOpacity(0.25),
                      borderRadius: BorderRadius.circular(6),
                    ),
                  ),
                  const SizedBox(height: 6),
                  Text(days[i],
                      style: TextStyle(fontSize: 9,
                          color: isMax ? kPrimary : kTextSecondary,
                          fontWeight: isMax
                              ? FontWeight.w700
                              : FontWeight.w400)),
                ],
              ),
            ),
          );
        }),
      ),
    );
  }
}

// ═══════════════════════════════════════════════════════════════
// PRODUCTS TAB
// ═══════════════════════════════════════════════════════════════
class _ProductsTab extends StatefulWidget {
  const _ProductsTab();
  @override
  State<_ProductsTab> createState() => _ProductsTabState();
}

class _ProductsTabState extends State<_ProductsTab> {
  List<dynamic> _products = [];
  bool _loading = true;

  @override
  void initState() { super.initState(); _load(); }

  Future<void> _load() async {
    final p = await ApiService().getAdminProducts();
    if (mounted) setState(() { _products = p; _loading = false; });
  }

  @override
  Widget build(BuildContext context) {
    if (_loading) {
      return const Center(child: CircularProgressIndicator(color: kPrimary));
    }
    return Column(children: [
      Container(
        color: kWhite,
        padding: const EdgeInsets.fromLTRB(16, 12, 16, 12),
        child: Row(children: [
          const Text('Product List',
              style: TextStyle(fontSize: 15, fontWeight: FontWeight.w700,
                  color: kTextDark)),
          const Spacer(),
          ElevatedButton.icon(
            onPressed: _showAddDialog,
            icon: const Icon(Icons.add, size: 16),
            label: const Text('Add', style: TextStyle(fontSize: 12)),
            style: ElevatedButton.styleFrom(
              backgroundColor: kPrimary, foregroundColor: kWhite,
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
              shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(8)),
            ),
          ),
        ]),
      ),
      Expanded(
        child: ListView.separated(
          padding: const EdgeInsets.all(16),
          itemCount: _products.length,
          separatorBuilder: (_, __) => const SizedBox(height: 8),
          itemBuilder: (_, i) {
            final p     = _products[i] as Map<String, dynamic>;
            final stock = p['stock'] as int? ?? 0;
            Color stockColor = kGreen;
            String stockLabel = 'In Stock';
            if (stock == 0) {
              stockColor = kRed; stockLabel = 'Out of Stock';
            } else if (stock < 10) {
              stockColor = kOrange; stockLabel = 'Low Stock';
            }
            return Container(
              padding: const EdgeInsets.all(14),
              decoration: BoxDecoration(color: kWhite,
                  borderRadius: BorderRadius.circular(12)),
              child: Row(children: [
                Container(
                  width: 44, height: 44,
                  decoration: BoxDecoration(color: kBackground,
                      borderRadius: BorderRadius.circular(10)),
                  child: const Icon(Icons.inventory_2_outlined,
                      color: kTextSecondary, size: 22),
                ),
                const SizedBox(width: 12),
                Expanded(child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(p['name'] ?? '',
                        style: const TextStyle(fontSize: 13,
                            fontWeight: FontWeight.w600, color: kTextDark),
                        maxLines: 1, overflow: TextOverflow.ellipsis),
                    Text('${p['category'] ?? ''}  •  $stock units',
                        style: const TextStyle(fontSize: 10,
                            color: kTextSecondary)),
                    const SizedBox(height: 4),
                    Row(children: [
                      Text('\$${p['price']}',
                          style: const TextStyle(fontSize: 13,
                              fontWeight: FontWeight.w700, color: kPrimary)),
                      const SizedBox(width: 8),
                      Container(
                        padding: const EdgeInsets.symmetric(
                            horizontal: 7, vertical: 2),
                        decoration: BoxDecoration(
                          color: stockColor.withOpacity(0.1),
                          borderRadius: BorderRadius.circular(6),
                        ),
                        child: Text(stockLabel,
                            style: TextStyle(fontSize: 9,
                                color: stockColor,
                                fontWeight: FontWeight.w600)),
                      ),
                    ]),
                  ],
                )),
                Column(children: [
                  TextButton(onPressed: () {},
                      child: const Text('Edit',
                          style: TextStyle(color: kPrimary, fontSize: 11))),
                  TextButton(onPressed: () {},
                      child: const Text('Delete',
                          style: TextStyle(color: kRed, fontSize: 11))),
                ]),
              ]),
            );
          },
        ),
      ),
    ]);
  }

  void _showAddDialog() {
    final nameCtrl  = TextEditingController();
    final priceCtrl = TextEditingController();
    showDialog(
      context: context,
      builder: (_) => AlertDialog(
        title: const Text('Add New Product',
            style: TextStyle(fontSize: 16, fontWeight: FontWeight.w700)),
        content: Column(mainAxisSize: MainAxisSize.min, children: [
          TextField(controller: nameCtrl,
              decoration: const InputDecoration(
                  labelText: 'Product Name',
                  hintText: 'e.g. iPhone 15 Pro')),
          const SizedBox(height: 12),
          TextField(controller: priceCtrl,
              keyboardType: TextInputType.number,
              decoration: const InputDecoration(
                  labelText: 'Price', hintText: '\$0.00')),
        ]),
        actions: [
          TextButton(onPressed: () => Navigator.pop(context),
              child: const Text('Cancel')),
          ElevatedButton(onPressed: () => Navigator.pop(context),
              child: const Text('Save Product')),
        ],
      ),
    );
  }
}

// ═══════════════════════════════════════════════════════════════
// ORDERS TAB
// ═══════════════════════════════════════════════════════════════
class _OrdersTab extends StatefulWidget {
  const _OrdersTab();
  @override
  State<_OrdersTab> createState() => _OrdersTabState();
}

class _OrdersTabState extends State<_OrdersTab> {
  List<dynamic> _orders = [];
  bool _loading = true;

  final Map<String, Color> _statusColors = {
    'pending':   kOrange,
    'paid':      kPrimary,
    'shipped':   const Color(0xFFA855F7),
    'delivered': kGreen,
    'cancelled': kRed,
  };

  @override
  void initState() { super.initState(); _load(); }

  Future<void> _load() async {
    final orders = await ApiService().getAdminOrders();
    if (mounted) setState(() { _orders = orders; _loading = false; });
  }

  @override
  Widget build(BuildContext context) {
    if (_loading) {
      return const Center(child: CircularProgressIndicator(color: kPrimary));
    }
    if (_orders.isEmpty) {
      return const Center(child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(Icons.receipt_long_outlined, size: 48, color: kTextSecondary),
          SizedBox(height: 12),
          Text('No orders yet',
              style: TextStyle(color: kTextSecondary, fontSize: 15)),
        ],
      ));
    }
    return RefreshIndicator(
      onRefresh: _load,
      color: kPrimary,
      child: ListView.separated(
        padding: const EdgeInsets.all(16),
        itemCount: _orders.length,
        separatorBuilder: (_, __) => const SizedBox(height: 8),
        itemBuilder: (_, i) {
          final order  = _orders[i] as Map<String, dynamic>;
          final status = order['status'] as String? ?? 'pending';
          final color  = _statusColors[status] ?? kTextSecondary;
          final email  = order['user']?['email'] as String? ?? 'Customer';
          return Container(
            padding: const EdgeInsets.all(14),
            decoration: BoxDecoration(color: kWhite,
                borderRadius: BorderRadius.circular(12)),
            child: Row(children: [
              Expanded(child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text('Order #${order['id']}',
                      style: const TextStyle(fontSize: 14,
                          fontWeight: FontWeight.w600, color: kTextDark)),
                  const SizedBox(height: 2),
                  Text(email,
                      style: const TextStyle(fontSize: 11,
                          color: kTextSecondary)),
                  const SizedBox(height: 4),
                  Text('\$${order['total_price'] ?? 0}',
                      style: const TextStyle(fontSize: 14,
                          fontWeight: FontWeight.w700, color: kPrimary)),
                ],
              )),
              Column(crossAxisAlignment: CrossAxisAlignment.end, children: [
                Container(
                  padding: const EdgeInsets.symmetric(
                      horizontal: 10, vertical: 4),
                  decoration: BoxDecoration(
                    color: color.withOpacity(0.1),
                    borderRadius: BorderRadius.circular(20),
                  ),
                  child: Text(status.toUpperCase(),
                      style: TextStyle(fontSize: 10,
                          fontWeight: FontWeight.w700, color: color)),
                ),
                const SizedBox(height: 6),
                GestureDetector(
                  onTap: () => _showStatusSheet(order['id'] as int, status),
                  child: const Text('Update',
                      style: TextStyle(fontSize: 11, color: kPrimary,
                          fontWeight: FontWeight.w500)),
                ),
              ]),
            ]),
          );
        },
      ),
    );
  }

  void _showStatusSheet(int orderId, String current) {
    const statuses = ['pending','paid','shipped','delivered','cancelled'];
    showModalBottomSheet(
      context: context,
      shape: const RoundedRectangleBorder(
          borderRadius: BorderRadius.vertical(top: Radius.circular(20))),
      builder: (_) => Column(mainAxisSize: MainAxisSize.min, children: [
        const SizedBox(height: 12),
        Container(width: 36, height: 4,
            decoration: BoxDecoration(color: kBorder,
                borderRadius: BorderRadius.circular(2))),
        const SizedBox(height: 12),
        const Text('Update Order Status',
            style: TextStyle(fontSize: 16, fontWeight: FontWeight.w700)),
        const SizedBox(height: 8),
        ...statuses.map((s) => ListTile(
              title: Text(s.toUpperCase(),
                  style: TextStyle(fontSize: 13,
                      color: _statusColors[s] ?? kTextDark,
                      fontWeight: FontWeight.w500)),
              trailing: current == s
                  ? const Icon(Icons.check, color: kPrimary) : null,
              onTap: () async {
                await ApiService().updateOrderStatus(orderId, s);
                if (!mounted) return;
                Navigator.pop(context);
                _load();
              },
            )),
        const SizedBox(height: 12),
      ]),
    );
  }
}

// ═══════════════════════════════════════════════════════════════
// USERS TAB
// ═══════════════════════════════════════════════════════════════
class _UsersTab extends StatefulWidget {
  const _UsersTab();
  @override
  State<_UsersTab> createState() => _UsersTabState();
}

class _UsersTabState extends State<_UsersTab> {
  List<dynamic> _users = [];
  bool _loading = true;

  @override
  void initState() { super.initState(); _load(); }

  Future<void> _load() async {
    final u = await ApiService().getAdminUsers();
    if (mounted) setState(() { _users = u; _loading = false; });
  }

  @override
  Widget build(BuildContext context) {
    if (_loading) {
      return const Center(child: CircularProgressIndicator(color: kPrimary));
    }
    if (_users.isEmpty) {
      return const Center(child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(Icons.people_outline, size: 48, color: kTextSecondary),
          SizedBox(height: 12),
          Text('No users found',
              style: TextStyle(color: kTextSecondary, fontSize: 15)),
          SizedBox(height: 8),
          Text('Connect to backend to view users',
              style: TextStyle(color: kTextSecondary, fontSize: 12)),
        ],
      ));
    }
    return ListView.separated(
      padding: const EdgeInsets.all(16),
      itemCount: _users.length,
      separatorBuilder: (_, __) => const SizedBox(height: 8),
      itemBuilder: (_, i) {
        final u     = _users[i] as Map<String, dynamic>;
        final email = u['email'] as String? ?? '';
        final role  = u['role'] as String? ?? 'customer';
        final init  = email.isNotEmpty ? email[0].toUpperCase() : '?';
        return Container(
          padding: const EdgeInsets.all(14),
          decoration: BoxDecoration(color: kWhite,
              borderRadius: BorderRadius.circular(12)),
          child: Row(children: [
            CircleAvatar(
              radius: 22,
              backgroundColor: kPrimary.withOpacity(0.1),
              child: Text(init,
                  style: const TextStyle(color: kPrimary,
                      fontWeight: FontWeight.w700, fontSize: 16)),
            ),
            const SizedBox(width: 12),
            Expanded(child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(email,
                    style: const TextStyle(fontSize: 13,
                        fontWeight: FontWeight.w600, color: kTextDark),
                    maxLines: 1, overflow: TextOverflow.ellipsis),
                Text('ID: ${u['id'] ?? '—'}',
                    style: const TextStyle(fontSize: 11,
                        color: kTextSecondary)),
              ],
            )),
            Container(
              padding: const EdgeInsets.symmetric(
                  horizontal: 10, vertical: 4),
              decoration: BoxDecoration(
                color: role == 'admin'
                    ? kPrimary.withOpacity(0.1)
                    : kBackground,
                borderRadius: BorderRadius.circular(20),
              ),
              child: Text(role.toUpperCase(),
                  style: TextStyle(fontSize: 10,
                      fontWeight: FontWeight.w700,
                      color: role == 'admin'
                          ? kPrimary
                          : kTextSecondary)),
            ),
          ]),
        );
      },
    );
  }
}

// ═══════════════════════════════════════════════════════════════
// SETTINGS TAB
// ═══════════════════════════════════════════════════════════════
class _SettingsTab extends StatelessWidget {
  const _SettingsTab();

  @override
  Widget build(BuildContext context) => ListView(
        padding: const EdgeInsets.all(16),
        children: [
          _SettingsGroup(title: 'Store', items: const [
            _SettingsItem(icon: Icons.store_outlined,
                label: 'Store Information'),
            _SettingsItem(icon: Icons.local_shipping_outlined,
                label: 'Shipping Settings'),
            _SettingsItem(icon: Icons.payment_outlined,
                label: 'Payment Methods'),
            _SettingsItem(icon: Icons.discount_outlined,
                label: 'Promo Codes'),
          ]),
          const SizedBox(height: 12),
          _SettingsGroup(title: 'System', items: const [
            _SettingsItem(icon: Icons.notifications_outlined,
                label: 'Push Notifications'),
            _SettingsItem(icon: Icons.security_outlined,
                label: 'Security'),
            _SettingsItem(icon: Icons.backup_outlined,
                label: 'Backup & Restore'),
            _SettingsItem(icon: Icons.info_outline,
                label: 'App Version  v1.0.0'),
          ]),
        ],
      );
}

class _SettingsGroup extends StatelessWidget {
  final String title;
  final List<Widget> items;
  const _SettingsGroup({required this.title, required this.items});

  @override
  Widget build(BuildContext context) => Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Padding(
            padding: const EdgeInsets.only(bottom: 8),
            child: Text(title.toUpperCase(),
                style: const TextStyle(fontSize: 11,
                    fontWeight: FontWeight.w700,
                    color: kTextSecondary,
                    letterSpacing: 0.5)),
          ),
          Container(
            decoration: BoxDecoration(color: kWhite,
                borderRadius: BorderRadius.circular(14)),
            child: Column(children: items),
          ),
        ],
      );
}

class _SettingsItem extends StatelessWidget {
  final IconData icon;
  final String label;
  const _SettingsItem({required this.icon, required this.label});

  @override
  Widget build(BuildContext context) => InkWell(
        onTap: () {},
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
          child: Row(children: [
            Icon(icon, size: 20, color: kTextSecondary),
            const SizedBox(width: 14),
            Expanded(child: Text(label,
                style: const TextStyle(fontSize: 14, color: kTextDark))),
            const Icon(Icons.chevron_right, size: 18, color: kTextSecondary),
          ]),
        ),
      );
}
