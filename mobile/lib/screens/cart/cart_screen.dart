import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../providers/cart_provider.dart';
import '../../theme/app_theme.dart';

class CartScreen extends StatefulWidget {
  const CartScreen({super.key});

  @override
  State<CartScreen> createState() => _CartScreenState();
}

class _CartScreenState extends State<CartScreen> {
  final _promoCtrl = TextEditingController();
  String? _promoError;
  bool _promoApplied = false;

  @override
  Widget build(BuildContext context) {
    return Consumer<CartProvider>(
      builder: (_, cart, __) => Scaffold(
        backgroundColor: kBackground,
        appBar: AppBar(
          backgroundColor: kBackground,
          elevation: 0,
          leading: IconButton(
            icon: const Icon(Icons.arrow_back_ios, color: kTextDark, size: 18),
            onPressed: () {},
          ),
          title: Text(
            'My Cart (${cart.count})',
            style: const TextStyle(
                color: kTextDark, fontSize: 17, fontWeight: FontWeight.w700),
          ),
          actions: [
            TextButton(
              onPressed: () {},
              child: const Text('Edit',
                  style: TextStyle(
                      color: kPrimary,
                      fontSize: 14,
                      fontWeight: FontWeight.w500)),
            ),
          ],
        ),
        body: cart.items.isEmpty
            ? _EmptyCart()
            : Column(
                children: [
                  Expanded(
                    child: ListView(
                      padding: const EdgeInsets.all(16),
                      children: [
                        // Cart items
                        ...cart.items.map((item) => _CartItemRow(
                              item: item,
                              onRemove: () =>
                                  cart.removeItem(item.product.id),
                              onQtyChange: (q) =>
                                  cart.updateQuantity(item.product.id, q),
                            )),
                        const SizedBox(height: 16),
                        // Promo code
                        Row(
                          children: [
                            Expanded(
                              child: TextField(
                                controller: _promoCtrl,
                                style: const TextStyle(
                                    fontSize: 13, color: kTextDark),
                                decoration: InputDecoration(
                                  hintText: 'Enter promo code',
                                  errorText: _promoError,
                                  filled: true,
                                  fillColor: kWhite,
                                  contentPadding:
                                      const EdgeInsets.symmetric(
                                          horizontal: 14, vertical: 12),
                                  border: OutlineInputBorder(
                                    borderRadius: BorderRadius.circular(10),
                                    borderSide:
                                        const BorderSide(color: kBorder),
                                  ),
                                  enabledBorder: OutlineInputBorder(
                                    borderRadius: BorderRadius.circular(10),
                                    borderSide:
                                        const BorderSide(color: kBorder),
                                  ),
                                ),
                              ),
                            ),
                            const SizedBox(width: 10),
                            ElevatedButton(
                              onPressed: () {
                                final ok =
                                    cart.applyPromo(_promoCtrl.text);
                                setState(() {
                                  _promoApplied = ok;
                                  _promoError = ok
                                      ? null
                                      : 'Invalid promo code';
                                });
                              },
                              style: ElevatedButton.styleFrom(
                                backgroundColor: kPrimary,
                                padding: const EdgeInsets.symmetric(
                                    horizontal: 20, vertical: 14),
                                shape: RoundedRectangleBorder(
                                    borderRadius:
                                        BorderRadius.circular(10)),
                              ),
                              child: const Text('Apply'),
                            ),
                          ],
                        ),
                        if (_promoApplied)
                          Padding(
                            padding: const EdgeInsets.only(top: 6),
                            child: Text(
                              '✓ Promo applied: -\$${cart.discount.toStringAsFixed(0)}',
                              style: const TextStyle(
                                  color: kGreen,
                                  fontSize: 12,
                                  fontWeight: FontWeight.w500),
                            ),
                          ),
                        const SizedBox(height: 16),
                        // AI Suggestion
                        Container(
                          padding: const EdgeInsets.all(12),
                          decoration: BoxDecoration(
                            color: kAiBanner,
                            borderRadius: BorderRadius.circular(12),
                            border: Border.all(
                                color: kPrimary.withOpacity(0.2)),
                          ),
                          child: Row(
                            children: [
                              const Icon(Icons.auto_awesome,
                                  color: kPrimary, size: 18),
                              const SizedBox(width: 8),
                              const Expanded(
                                child: Column(
                                  crossAxisAlignment:
                                      CrossAxisAlignment.start,
                                  children: [
                                    Text('AI Suggestion',
                                        style: TextStyle(
                                            color: kPrimary,
                                            fontSize: 12,
                                            fontWeight: FontWeight.w600)),
                                    Text(
                                        'Add iPhone 15 Case to protect your new phone — only \$29',
                                        style: TextStyle(
                                            color: kTextSecondary,
                                            fontSize: 11)),
                                  ],
                                ),
                              ),
                              Container(
                                width: 28,
                                height: 28,
                                decoration: BoxDecoration(
                                  color: kPrimary,
                                  borderRadius:
                                      BorderRadius.circular(8),
                                ),
                                child: const Icon(Icons.add,
                                    color: kWhite, size: 16),
                              ),
                            ],
                          ),
                        ),
                        const SizedBox(height: 16),
                        // Order summary
                        Container(
                          padding: const EdgeInsets.all(16),
                          decoration: BoxDecoration(
                            color: kWhite,
                            borderRadius: BorderRadius.circular(14),
                          ),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              const Text('Order Summary',
                                  style: TextStyle(
                                      fontSize: 15,
                                      fontWeight: FontWeight.w700,
                                      color: kTextDark)),
                              const SizedBox(height: 12),
                              _SummaryRow('Subtotal',
                                  '\$${cart.subtotal.toStringAsFixed(2)}'),
                              _SummaryRow('Shipping', 'Free',
                                  valueColor: kGreen),
                              if (cart.discount > 0)
                                _SummaryRow('Discount',
                                    '-\$${cart.discount.toStringAsFixed(0)}',
                                    valueColor: kRed),
                              _SummaryRow('Tax (8%)',
                                  '\$${cart.tax.toStringAsFixed(2)}'),
                              const Divider(height: 20, color: kBorder),
                              Row(
                                mainAxisAlignment:
                                    MainAxisAlignment.spaceBetween,
                                children: [
                                  const Text('Total',
                                      style: TextStyle(
                                          fontSize: 15,
                                          fontWeight: FontWeight.w700,
                                          color: kTextDark)),
                                  Text(
                                    '\$${cart.total.toStringAsFixed(2)}',
                                    style: const TextStyle(
                                        fontSize: 18,
                                        fontWeight: FontWeight.w800,
                                        color: kPrimary),
                                  ),
                                ],
                              ),
                            ],
                          ),
                        ),
                        const SizedBox(height: 16),
                      ],
                    ),
                  ),
                  // Checkout button
                  Padding(
                    padding: const EdgeInsets.fromLTRB(16, 0, 16, 20),
                    child: ElevatedButton(
                      onPressed: () async {
                        final ok = await cart.checkout();
                        if (!context.mounted) return;
                        showDialog(
                          context: context,
                          builder: (_) => AlertDialog(
                            title: Text(ok ? 'Order Placed! 🎉' : 'Error'),
                            content: Text(ok
                                ? 'Your order has been placed successfully.'
                                : 'Could not place order. Try again.'),
                            actions: [
                              TextButton(
                                onPressed: () {
                                  Navigator.pop(context);
                                },
                                child: const Text('OK'),
                              ),
                            ],
                          ),
                        );
                      },
                      style: ElevatedButton.styleFrom(
                        minimumSize: const Size.fromHeight(52),
                        shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(14)),
                      ),
                      child: const Text('Proceed to Checkout →',
                          style: TextStyle(
                              fontSize: 15,
                              fontWeight: FontWeight.w600)),
                    ),
                  ),
                ],
              ),
      ),
    );
  }

  Widget _EmptyCart() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          const Icon(Icons.shopping_cart_outlined,
              size: 64, color: kTextSecondary),
          const SizedBox(height: 16),
          const Text('Your cart is empty',
              style: TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.w600,
                  color: kTextDark)),
          const SizedBox(height: 8),
          const Text('Add some products to get started',
              style: TextStyle(color: kTextSecondary)),
        ],
      ),
    );
  }

  Widget _SummaryRow(String label, String value,
      {Color? valueColor}) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label,
              style: const TextStyle(
                  fontSize: 13, color: kTextSecondary)),
          Text(value,
              style: TextStyle(
                  fontSize: 13,
                  fontWeight: FontWeight.w500,
                  color: valueColor ?? kTextDark)),
        ],
      ),
    );
  }
}

class _CartItemRow extends StatelessWidget {
  final dynamic item;
  final VoidCallback onRemove;
  final ValueChanged<int> onQtyChange;

  const _CartItemRow({
    required this.item,
    required this.onRemove,
    required this.onQtyChange,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: kWhite,
        borderRadius: BorderRadius.circular(14),
      ),
      child: Row(
        children: [
          // Image
          ClipRRect(
            borderRadius: BorderRadius.circular(10),
            child: SizedBox(
              width: 64,
              height: 64,
              child: Image.network(
                item.product.imageUrl,
                fit: BoxFit.cover,
                loadingBuilder: (_, child, progress) =>
                    progress == null
                        ? child
                        : Container(color: kBackground),
                errorBuilder: (_, __, ___) => Container(
                  color: kBackground,
                  child: const Icon(Icons.image_outlined,
                      color: kTextSecondary),
                ),
              ),
            ),
          ),
          const SizedBox(width: 12),
          // Info
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(item.product.category,
                    style: const TextStyle(
                        fontSize: 11, color: kTextSecondary)),
                Text(item.product.name,
                    style: const TextStyle(
                        fontSize: 13,
                        fontWeight: FontWeight.w600,
                        color: kTextDark),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis),
                const SizedBox(height: 6),
                Row(
                  children: [
                    Text(
                      '\$${item.product.price.toStringAsFixed(0)}',
                      style: const TextStyle(
                          fontSize: 14,
                          fontWeight: FontWeight.w700,
                          color: kPrimary),
                    ),
                    const Spacer(),
                    // Quantity controls
                    _QtyButton(
                      icon: Icons.remove,
                      onTap: () => onQtyChange(item.quantity - 1),
                    ),
                    Padding(
                      padding:
                          const EdgeInsets.symmetric(horizontal: 10),
                      child: Text('${item.quantity}',
                          style: const TextStyle(
                              fontSize: 14,
                              fontWeight: FontWeight.w600,
                              color: kTextDark)),
                    ),
                    _QtyButton(
                      icon: Icons.add,
                      onTap: () => onQtyChange(item.quantity + 1),
                      filled: true,
                    ),
                  ],
                ),
              ],
            ),
          ),
          const SizedBox(width: 8),
          // Delete
          GestureDetector(
            onTap: onRemove,
            child: const Icon(Icons.delete_outline,
                color: kTextSecondary, size: 20),
          ),
        ],
      ),
    );
  }
}

class _QtyButton extends StatelessWidget {
  final IconData icon;
  final VoidCallback onTap;
  final bool filled;

  const _QtyButton(
      {required this.icon, required this.onTap, this.filled = false});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        width: 26,
        height: 26,
        decoration: BoxDecoration(
          color: filled ? kPrimary : kBackground,
          borderRadius: BorderRadius.circular(7),
        ),
        child: Icon(icon,
            size: 14, color: filled ? kWhite : kTextDark),
      ),
    );
  }
}
