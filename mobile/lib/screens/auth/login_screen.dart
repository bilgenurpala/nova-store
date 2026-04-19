import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../providers/auth_provider.dart';
import '../../providers/cart_provider.dart';
import '../../theme/app_theme.dart';

class LoginScreen extends StatefulWidget {
  final VoidCallback? onSuccess;
  const LoginScreen({super.key, this.onSuccess});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final _emailCtrl = TextEditingController();
  final _passCtrl = TextEditingController();
  bool _isRegister = false;
  bool _obscure = true;
  String? _error;

  @override
  void dispose() {
    _emailCtrl.dispose();
    _passCtrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: kDark,
      body: SafeArea(
        child: SingleChildScrollView(
          child: Column(
            children: [
              const SizedBox(height: 48),
              // Logo
              RichText(
                text: const TextSpan(children: [
                  TextSpan(text: 'Nova',
                      style: TextStyle(color: kPrimary, fontSize: 36,
                          fontWeight: FontWeight.w800)),
                  TextSpan(text: 'Store',
                      style: TextStyle(color: kWhite, fontSize: 36,
                          fontWeight: FontWeight.w800)),
                ]),
              ),
              const SizedBox(height: 6),
              const Text('Your AI-Powered Shopping Companion',
                  style: TextStyle(color: kTextSecondary, fontSize: 13)),
              const SizedBox(height: 32),
              // Card
              Container(
                margin: const EdgeInsets.symmetric(horizontal: 20),
                padding: const EdgeInsets.all(24),
                decoration: BoxDecoration(
                  color: kWhite,
                  borderRadius: BorderRadius.circular(24),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(_isRegister ? 'Create account' : 'Welcome back',
                        style: const TextStyle(fontSize: 22,
                            fontWeight: FontWeight.w700, color: kTextDark)),
                    const SizedBox(height: 4),
                    Text(_isRegister
                        ? 'Join NovaStore today'
                        : 'Sign in to continue shopping',
                        style: const TextStyle(fontSize: 13, color: kTextSecondary)),
                    const SizedBox(height: 20),
                    _label('Email'),
                    const SizedBox(height: 6),
                    TextField(
                      controller: _emailCtrl,
                      keyboardType: TextInputType.emailAddress,
                      decoration: const InputDecoration(
                          hintText: 'you@example.com'),
                    ),
                    const SizedBox(height: 14),
                    _label('Password'),
                    const SizedBox(height: 6),
                    TextField(
                      controller: _passCtrl,
                      obscureText: _obscure,
                      decoration: InputDecoration(
                        hintText: '••••••••',
                        suffixIcon: GestureDetector(
                          onTap: () => setState(() => _obscure = !_obscure),
                          child: Icon(
                            _obscure ? Icons.visibility_outlined
                                : Icons.visibility_off_outlined,
                            color: kTextSecondary, size: 18),
                        ),
                      ),
                    ),
                    if (!_isRegister) ...[
                      const SizedBox(height: 8),
                      Align(
                        alignment: Alignment.centerRight,
                        child: GestureDetector(
                          onTap: () {},
                          child: const Text('Forgot Password?',
                              style: TextStyle(color: kPrimary, fontSize: 13,
                                  fontWeight: FontWeight.w500)),
                        ),
                      ),
                    ],
                    if (_error != null) ...[
                      const SizedBox(height: 10),
                      Text(_error!,
                          style: const TextStyle(color: kRed, fontSize: 12)),
                    ],
                    const SizedBox(height: 16),
                    Consumer<AuthProvider>(
                      builder: (_, auth, __) => ElevatedButton(
                        onPressed: auth.isLoading ? null : _submit,
                        style: ElevatedButton.styleFrom(
                          minimumSize: const Size.fromHeight(50),
                          shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(12)),
                        ),
                        child: auth.isLoading
                            ? const SizedBox(width: 20, height: 20,
                                child: CircularProgressIndicator(
                                    color: kWhite, strokeWidth: 2))
                            : Text(_isRegister ? 'Create Account' : 'Sign In',
                                style: const TextStyle(fontSize: 15,
                                    fontWeight: FontWeight.w600)),
                      ),
                    ),
                    const SizedBox(height: 20),
                    // Divider
                    const Row(children: [
                      Expanded(child: Divider(color: kBorder)),
                      Padding(
                        padding: EdgeInsets.symmetric(horizontal: 12),
                        child: Text('or continue with',
                            style: TextStyle(fontSize: 12, color: kTextSecondary)),
                      ),
                      Expanded(child: Divider(color: kBorder)),
                    ]),
                    const SizedBox(height: 16),
                    // Social buttons
                    Row(children: [
                      Expanded(child: _SocialBtn(label: 'Google',
                          icon: Icons.g_mobiledata, onTap: () {})),
                      const SizedBox(width: 12),
                      Expanded(child: _SocialBtn(label: 'Apple',
                          icon: Icons.apple, onTap: () {})),
                    ]),
                    const SizedBox(height: 16),
                    Center(
                      child: GestureDetector(
                        onTap: () => setState(() {
                          _isRegister = !_isRegister;
                          _error = null;
                        }),
                        child: RichText(
                          text: TextSpan(style: const TextStyle(fontSize: 13),
                            children: [
                              TextSpan(
                                text: _isRegister
                                    ? 'Already have an account?  '
                                    : "Don't have an account?  ",
                                style: const TextStyle(color: kTextSecondary),
                              ),
                              TextSpan(
                                text: _isRegister ? 'Sign in →' : 'Sign up →',
                                style: const TextStyle(color: kPrimary,
                                    fontWeight: FontWeight.w600),
                              ),
                            ],
                          ),
                        ),
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 16),
              // AI banner
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 20),
                child: Container(
                  padding: const EdgeInsets.all(14),
                  decoration: BoxDecoration(
                    color: const Color(0xFF1A2A5E),
                    borderRadius: BorderRadius.circular(14),
                  ),
                  child: const Row(
                    children: [
                      Icon(Icons.auto_awesome, color: kPrimary, size: 18),
                      SizedBox(width: 10),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text('Personalized AI experience',
                                style: TextStyle(color: kPrimary, fontSize: 12,
                                    fontWeight: FontWeight.w600)),
                            Text('Sign in to unlock AI-powered recommendations',
                                style: TextStyle(color: kTextSecondary, fontSize: 11)),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
              ),
              const SizedBox(height: 20),
              const Text(
                'By signing in, you agree to our Terms & Privacy Policy',
                style: TextStyle(color: kTextSecondary, fontSize: 11),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 24),
            ],
          ),
        ),
      ),
    );
  }

  Future<void> _submit() async {
    setState(() => _error = null);
    final auth = context.read<AuthProvider>();
    final cart = context.read<CartProvider>();
    bool ok;
    if (_isRegister) {
      ok = await auth.register(_emailCtrl.text.trim(), _passCtrl.text);
    } else {
      ok = await auth.login(_emailCtrl.text.trim(), _passCtrl.text);
    }
    if (!mounted) return;
    if (ok) {
      // Load backend cart after login
      await cart.loadFromBackend();
      widget.onSuccess?.call();
      Navigator.of(context).popUntil((route) => route.isFirst);
    } else {
      setState(() => _error = _isRegister
          ? 'Registration failed. Try a different email.'
          : 'Invalid email or password.');
    }
  }

  Widget _label(String text) => Text(text,
      style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w600,
          color: kTextDark));
}

class _SocialBtn extends StatelessWidget {
  final String label;
  final IconData icon;
  final VoidCallback onTap;
  const _SocialBtn({required this.label, required this.icon, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return OutlinedButton.icon(
      onPressed: onTap,
      icon: Icon(icon, size: 20, color: kTextDark),
      label: Text(label, style: const TextStyle(fontSize: 13,
          fontWeight: FontWeight.w500, color: kTextDark)),
      style: OutlinedButton.styleFrom(
        side: const BorderSide(color: kBorder),
        padding: const EdgeInsets.symmetric(vertical: 12),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      ),
    );
  }
}
