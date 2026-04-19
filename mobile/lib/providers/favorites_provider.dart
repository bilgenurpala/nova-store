import 'package:flutter/foundation.dart';
import '../models/product.dart';

class FavoritesProvider extends ChangeNotifier {
  final List<Product> _items = [];

  List<Product> get items => List.unmodifiable(_items);
  int get count => _items.length;

  bool isFavorite(int productId) => _items.any((p) => p.id == productId);

  void toggle(Product product) {
    if (isFavorite(product.id)) {
      _items.removeWhere((p) => p.id == product.id);
    } else {
      _items.add(product);
    }
    notifyListeners();
  }
}
