import 'package:flutter/foundation.dart';
import '../models/product.dart';
import '../models/cart_item.dart';
import '../services/api_service.dart';

class CartProvider extends ChangeNotifier {
  final List<CartItem> _items = [];
  String _promoCode = '';
  double _discount = 0;
  bool _syncing = false;

  List<CartItem> get items => List.unmodifiable(_items);
  int get count => _items.fold(0, (sum, i) => sum + i.quantity);
  bool get isSyncing => _syncing;

  double get subtotal => _items.fold(0, (sum, i) => sum + i.total);
  double get shipping => 0; // Free
  double get discount => _discount;
  double get tax => subtotal * 0.08;
  double get total => subtotal + tax - _discount;

  // Load cart from backend (called after login)
  Future<void> loadFromBackend() async {
    final data = await ApiService().getCart();
    if (data == null) return;
    // data has {id, user_id, items: [{id, product_id, quantity, product: {...}}]}
    _items.clear();
    final rawItems = data['items'] as List? ?? [];
    for (final item in rawItems) {
      final productData = item['product'] as Map<String, dynamic>?;
      if (productData == null) continue;
      try {
        final product = Product.fromJson(productData);
        _items.add(CartItem(product: product, quantity: item['quantity'] as int? ?? 1));
      } catch (_) {}
    }
    notifyListeners();
  }

  void addProduct(Product product, {bool syncBackend = true}) {
    final idx = _items.indexWhere((i) => i.product.id == product.id);
    if (idx >= 0) {
      _items[idx].quantity++;
    } else {
      _items.add(CartItem(product: product));
    }
    notifyListeners();
    if (syncBackend && ApiService().hasToken) {
      ApiService().addToCart(product.id, 1);
    }
  }

  void removeItem(int productId, {bool syncBackend = true}) {
    _items.removeWhere((i) => i.product.id == productId);
    notifyListeners();
    if (syncBackend && ApiService().hasToken) {
      ApiService().removeFromCart(productId);
    }
  }

  void updateQuantity(int productId, int qty, {bool syncBackend = true}) {
    if (qty <= 0) {
      removeItem(productId, syncBackend: syncBackend);
      return;
    }
    final idx = _items.indexWhere((i) => i.product.id == productId);
    if (idx >= 0) {
      _items[idx].quantity = qty;
      notifyListeners();
      if (syncBackend && ApiService().hasToken) {
        ApiService().updateCartItem(productId, qty);
      }
    }
  }

  bool applyPromo(String code) {
    if (code.toUpperCase() == 'NOVA50') {
      _promoCode = code;
      _discount = 50;
      notifyListeners();
      return true;
    }
    return false;
  }

  Future<bool> checkout() async {
    if (ApiService().hasToken) {
      final order = await ApiService().createOrder({
        'street': '123 Main St',
        'city': 'Istanbul',
        'country': 'Turkey',
        'zip': '34000',
      });
      if (order != null) {
        clear(syncBackend: false);
        return true;
      }
    }
    // Local checkout (no backend)
    clear(syncBackend: false);
    return true;
  }

  void clear({bool syncBackend = false}) {
    _items.clear();
    _discount = 0;
    _promoCode = '';
    notifyListeners();
  }
}
