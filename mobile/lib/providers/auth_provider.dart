import 'package:flutter/foundation.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../services/api_service.dart';

class AuthProvider extends ChangeNotifier {
  String? _token;
  String? _userEmail;
  String? _userRole;
  int? _userId;
  bool _isLoading = false;

  bool get isLoggedIn => _token != null;
  bool get isLoading => _isLoading;
  bool get isAdmin => _userRole == 'admin';
  String? get userEmail => _userEmail;
  String? get userRole => _userRole;
  int? get userId => _userId;

  // Display name derived from email (e.g. bilge from bilge@example.com)
  String get userName {
    if (_userEmail == null) return 'User';
    return _userEmail!.split('@').first
        .split('.')
        .map((w) => w.isEmpty ? '' : w[0].toUpperCase() + w.substring(1))
        .join(' ');
  }

  String get userInitial =>
      userName.isNotEmpty ? userName[0].toUpperCase() : '?';

  Future<void> init() async {
    final prefs = await SharedPreferences.getInstance();
    _token = prefs.getString('token');
    _userEmail = prefs.getString('userEmail');
    _userRole = prefs.getString('userRole');
    _userId = prefs.getInt('userId');
    if (_token != null) ApiService().setToken(_token!);
    notifyListeners();
  }

  Future<bool> login(String email, String password) async {
    _isLoading = true;
    notifyListeners();
    try {
      final data = await ApiService().login(email, password);
      await _persist(data);
      return true;
    } catch (_) {
      return false;
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<bool> register(String email, String password) async {
    _isLoading = true;
    notifyListeners();
    try {
      final data = await ApiService().register(email, password);
      await _persist(data);
      return true;
    } catch (_) {
      return false;
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<void> logout() async {
    _token = null;
    _userEmail = null;
    _userRole = null;
    _userId = null;
    ApiService().clearToken();
    final prefs = await SharedPreferences.getInstance();
    await prefs.clear();
    notifyListeners();
  }

  Future<void> _persist(Map<String, dynamic> data) async {
    _token = data['access_token'] as String?;
    _userEmail = data['email'] as String?;
    _userRole = data['role'] as String? ?? 'customer';
    _userId = data['id'] as int?;
    if (_token != null) ApiService().setToken(_token!);
    final prefs = await SharedPreferences.getInstance();
    if (_token != null) await prefs.setString('token', _token!);
    if (_userEmail != null) await prefs.setString('userEmail', _userEmail!);
    if (_userRole != null) await prefs.setString('userRole', _userRole!);
    if (_userId != null) await prefs.setInt('userId', _userId!);
  }
}
