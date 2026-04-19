import 'dart:convert';
import 'package:flutter/services.dart' show rootBundle;
import 'package:http/http.dart' as http;
import '../config/app_config.dart';
import '../models/product.dart';

// ── Mock products fallback ────────────────────────────────────────────────
final List<Product> _mockProducts = [
  Product(id: 1, name: 'iPhone 15 Pro', category: 'Phones', price: 999,
      imageUrl: 'https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=400&q=80&auto=format',
      rating: 4.8, reviewCount: 2847, inStock: true),
  Product(id: 2, name: 'MacBook Air M3', category: 'Computers', price: 1299,
      imageUrl: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400&q=80&auto=format',
      rating: 4.9, reviewCount: 1563, inStock: true, badge: 'SALE'),
  Product(id: 3, name: 'AirPods Max', category: 'Audio', price: 549,
      imageUrl: 'https://images.unsplash.com/photo-1599669454699-248893623440?w=400&q=80&auto=format',
      rating: 4.7, reviewCount: 987, inStock: true),
  Product(id: 4, name: 'Apple Watch S9', category: 'Wearables', price: 399,
      imageUrl: 'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=400&q=80&auto=format',
      rating: 4.6, reviewCount: 2341, inStock: true),
  Product(id: 5, name: 'iPad Pro 13"', category: 'Tablets', price: 1099,
      imageUrl: 'https://images.unsplash.com/photo-1604398787082-88f4d18d1a29?w=400&q=80&auto=format',
      rating: 4.8, reviewCount: 892, inStock: true, badge: 'LOW STOCK'),
  Product(id: 6, name: 'Samsung Galaxy S24', category: 'Phones', price: 899,
      imageUrl: 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=400&q=80&auto=format',
      rating: 4.5, reviewCount: 1234, inStock: true),
  Product(id: 7, name: 'Sony WH-1000XM5', category: 'Audio', price: 349,
      imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&q=80&auto=format',
      rating: 4.9, reviewCount: 3102, inStock: true),
  Product(id: 8, name: 'Apple TV 4K', category: 'TV & Media', price: 129,
      imageUrl: 'https://images.unsplash.com/photo-1593359677879-a4bb92f4834a?w=400&q=80&auto=format',
      rating: 4.4, reviewCount: 567, inStock: true, badge: 'SALE'),
  Product(id: 9, name: 'AirPods Pro 2', category: 'Audio', price: 249,
      imageUrl: 'https://images.unsplash.com/photo-1603351154351-5e2d0600bb77?w=400&q=80&auto=format',
      rating: 4.8, reviewCount: 4521, inStock: true),
  Product(id: 10, name: 'MagSafe Charger', category: 'Accessories', price: 39,
      imageUrl: 'https://images.unsplash.com/photo-1591370874773-6702e8f12fd8?w=400&q=80&auto=format',
      rating: 4.3, reviewCount: 876, inStock: true),
];

class ApiService {
  static final ApiService _instance = ApiService._internal();
  factory ApiService() => _instance;
  ApiService._internal();

  String? _token;
  void setToken(String token) => _token = token;
  void clearToken() => _token = null;
  bool get hasToken => _token != null;

  Map<String, String> get _headers => {
        'Content-Type': 'application/json',
        if (_token != null) 'Authorization': 'Bearer $_token',
      };

  // ── Local JSON Asset ──────────────────────────────────────────────────────
  /// Loads products from assets/products.json.
  /// Works even when backend and internet are unavailable (offline fallback).
  Future<List<Product>> _loadFromAsset() async {
    try {
      final jsonStr = await rootBundle.loadString('assets/products.json');
      final List<dynamic> data = jsonDecode(jsonStr);
      return data.map((j) => Product.fromJson(j)).toList();
    } catch (_) {
      return List<Product>.from(_mockProducts);
    }
  }

  // ── Products ─────────────────────────────────────────────────────────────
  Future<List<Product>> getProducts({
    String? category,
    String? search,
    String? sort,
    int page = 1,
    int limit = 20,
  }) async {
    try {
      final params = <String, String>{
        'page': '$page',
        'limit': '$limit',
        if (category != null && category != 'All') 'category': category,
        if (search != null && search.isNotEmpty) 'search': search,
        if (sort != null) 'sort': sort,
      };
      final uri = Uri.parse('${AppConfig.apiUrl}/products')
          .replace(queryParameters: params);
      final res = await http.get(uri, headers: _headers)
          .timeout(const Duration(seconds: 5));
      if (res.statusCode == 200) {
        final data = jsonDecode(res.body);
        final items = data['items'] as List? ?? data as List;
        return items.map((j) => Product.fromJson(j)).toList();
      }
    } catch (_) {}

    // 2️⃣ Backend unavailable → load from assets/products.json
    var fallback = await _loadFromAsset();
    if (category != null && category != 'All') {
      fallback = fallback.where((p) =>
          p.category.toLowerCase() == category.toLowerCase()).toList();
    }
    if (search != null && search.isNotEmpty) {
      fallback = fallback.where((p) =>
          p.name.toLowerCase().contains(search.toLowerCase())).toList();
    }
    return fallback.take(limit).toList();
  }

  Future<Product> getProduct(int id) async {
    try {
      final res = await http
          .get(Uri.parse('${AppConfig.apiUrl}/products/$id'), headers: _headers)
          .timeout(const Duration(seconds: 5));
      if (res.statusCode == 200) return Product.fromJson(jsonDecode(res.body));
    } catch (_) {}
    // JSON asset fallback
    final all = await _loadFromAsset();
    return all.firstWhere((p) => p.id == id, orElse: () => all.first);
  }

  // ── Auth ─────────────────────────────────────────────────────────────────
  Future<Map<String, dynamic>> login(String email, String password) async {
    try {
      final res = await http.post(
        Uri.parse('${AppConfig.apiUrl}/auth/login'),
        headers: _headers,
        body: jsonEncode({'email': email, 'password': password}),
      ).timeout(const Duration(seconds: 8));

      if (res.statusCode == 200) {
        final tokenData = jsonDecode(res.body) as Map<String, dynamic>;
        final token = tokenData['access_token'] as String;
        // Fetch user profile
        final me = await getMe(token);
        return {...tokenData, ...me};
      }
      final err = jsonDecode(res.body);
      throw Exception(err['detail'] ?? 'Login failed');
    } catch (e) {
      if (e.toString().contains('detail') ||
          e.toString().contains('Login failed')) rethrow;
      // Mock login for demo (backend unreachable)
      if (email.isNotEmpty && password.length >= 4) {
        return {
          'access_token': 'mock_${email.hashCode}',
          'email': email,
          'role': email == 'admin@admin.com' ? 'admin' : 'customer',
          'is_active': true,
          'id': email.hashCode,
        };
      }
      throw Exception('Invalid credentials');
    }
  }

  Future<Map<String, dynamic>> register(String email, String password) async {
    try {
      final res = await http.post(
        Uri.parse('${AppConfig.apiUrl}/auth/register'),
        headers: _headers,
        body: jsonEncode({'email': email, 'password': password}),
      ).timeout(const Duration(seconds: 8));
      if (res.statusCode == 200 || res.statusCode == 201) {
        final tokenData = jsonDecode(res.body) as Map<String, dynamic>;
        final token = tokenData['access_token'] as String;
        final me = await getMe(token);
        return {...tokenData, ...me};
      }
      final err = jsonDecode(res.body);
      throw Exception(err['detail'] ?? 'Registration failed');
    } catch (e) {
      if (e.toString().contains('detail') ||
          e.toString().contains('failed')) rethrow;
      return {
        'access_token': 'mock_${email.hashCode}',
        'email': email,
        'role': 'customer',
        'is_active': true,
        'id': email.hashCode,
      };
    }
  }

  Future<Map<String, dynamic>> getMe(String token) async {
    try {
      final res = await http.get(
        Uri.parse('${AppConfig.apiUrl}/auth/me'),
        headers: {..._headers, 'Authorization': 'Bearer $token'},
      ).timeout(const Duration(seconds: 5));
      if (res.statusCode == 200) return jsonDecode(res.body);
    } catch (_) {}
    return {};
  }

  // ── Cart ──────────────────────────────────────────────────────────────────
  Future<Map<String, dynamic>?> getCart() async {
    try {
      final res = await http.get(
        Uri.parse('${AppConfig.apiUrl}/cart'),
        headers: _headers,
      ).timeout(const Duration(seconds: 5));
      if (res.statusCode == 200) return jsonDecode(res.body);
    } catch (_) {}
    return null;
  }

  Future<bool> addToCart(int productId, int quantity) async {
    try {
      final res = await http.post(
        Uri.parse('${AppConfig.apiUrl}/cart/add'),
        headers: _headers,
        body: jsonEncode({'product_id': productId, 'quantity': quantity}),
      ).timeout(const Duration(seconds: 5));
      return res.statusCode == 200;
    } catch (_) {
      return false;
    }
  }

  Future<bool> updateCartItem(int productId, int quantity) async {
    try {
      final res = await http.put(
        Uri.parse('${AppConfig.apiUrl}/cart/update'),
        headers: _headers,
        body: jsonEncode({'product_id': productId, 'quantity': quantity}),
      ).timeout(const Duration(seconds: 5));
      return res.statusCode == 200;
    } catch (_) {
      return false;
    }
  }

  Future<bool> removeFromCart(int productId) async {
    try {
      final res = await http.delete(
        Uri.parse('${AppConfig.apiUrl}/cart/remove'),
        headers: _headers,
        body: jsonEncode({'product_id': productId}),
      ).timeout(const Duration(seconds: 5));
      return res.statusCode == 200;
    } catch (_) {
      return false;
    }
  }

  // ── Orders ────────────────────────────────────────────────────────────────
  Future<Map<String, dynamic>?> createOrder(Map<String, dynamic> address) async {
    try {
      final res = await http.post(
        Uri.parse('${AppConfig.apiUrl}/orders'),
        headers: _headers,
        body: jsonEncode({'address': address}),
      ).timeout(const Duration(seconds: 10));
      if (res.statusCode == 201) return jsonDecode(res.body);
    } catch (_) {}
    return null;
  }

  Future<List<dynamic>> getMyOrders() async {
    try {
      final res = await http.get(
        Uri.parse('${AppConfig.apiUrl}/orders/my'),
        headers: _headers,
      ).timeout(const Duration(seconds: 5));
      if (res.statusCode == 200) return jsonDecode(res.body) as List;
    } catch (_) {}
    return [];
  }

  // ── Admin ─────────────────────────────────────────────────────────────────
  Future<Map<String, dynamic>> getAdminDashboard() async {
    try {
      final res = await http.get(
        Uri.parse('${AppConfig.apiUrl}/admin/dashboard'),
        headers: _headers,
      ).timeout(const Duration(seconds: 5));
      if (res.statusCode == 200) return jsonDecode(res.body);
    } catch (_) {}
    return {'total_users': 0, 'total_orders': 0, 'total_products': 0, 'total_revenue': 0};
  }

  Future<List<dynamic>> getAdminOrders({int page = 1}) async {
    try {
      final res = await http.get(
        Uri.parse('${AppConfig.apiUrl}/orders/admin/all?page=$page&limit=20'),
        headers: _headers,
      ).timeout(const Duration(seconds: 5));
      if (res.statusCode == 200) {
        final data = jsonDecode(res.body);
        return data['items'] as List? ?? data as List;
      }
    } catch (_) {}
    return [];
  }

  Future<List<dynamic>> getAdminUsers() async {
    try {
      final res = await http.get(
        Uri.parse('${AppConfig.apiUrl}/admin/users'),
        headers: _headers,
      ).timeout(const Duration(seconds: 5));
      if (res.statusCode == 200) {
        final data = jsonDecode(res.body);
        return data['items'] as List? ?? data as List;
      }
    } catch (_) {}
    return [];
  }

  Future<List<dynamic>> getAdminProducts({int page = 1}) async {
    try {
      final res = await http.get(
        Uri.parse('${AppConfig.apiUrl}/products?page=$page&limit=50'),
        headers: _headers,
      ).timeout(const Duration(seconds: 5));
      if (res.statusCode == 200) {
        final data = jsonDecode(res.body);
        return data['items'] as List? ?? data as List;
      }
    } catch (_) {}
    return _mockProducts.map((p) => {
      'id': p.id, 'name': p.name, 'price': p.price,
      'category': p.category, 'stock': 10,
    }).toList();
  }

  Future<bool> updateOrderStatus(int orderId, String status) async {
    try {
      final res = await http.patch(
        Uri.parse('${AppConfig.apiUrl}/orders/$orderId/status'),
        headers: _headers,
        body: jsonEncode({'status': status}),
      ).timeout(const Duration(seconds: 5));
      return res.statusCode == 200;
    } catch (_) {
      return false;
    }
  }

  // ── AI Chat ───────────────────────────────────────────────────────────────
  Future<String> chatWithAI(String message, List<Map<String, String>> history) async {
    try {
      final res = await http.post(
        Uri.parse('${AppConfig.apiUrl}/ai/chat'),
        headers: _headers,
        body: jsonEncode({'message': message, 'history': history}),
      ).timeout(const Duration(seconds: 15));
      if (res.statusCode == 200) {
        return jsonDecode(res.body)['reply'] as String;
      }
    } catch (_) {}
    return "I'm Nova AI, your shopping assistant! Ask me about our products, prices, or recommendations.";
  }
}
