import 'package:flutter/material.dart';
import '../../models/chat_message.dart';
import '../../services/api_service.dart';
import '../../theme/app_theme.dart';

// ── Dark surface tokens (AI Chat only) ───────────────────────────────────────
const _kBg        = Color(0xFF0D0D0F);   // screen background
const _kCard      = Color(0xFF1A1A2E);   // AI bubble / cards
const _kInput     = Color(0xFF1E1E2E);   // input field fill
const _kChipBg    = Color(0xFF1A1A1A);   // suggestion chip bg
const _kChipBdr   = Color(0xFF2A2A3A);   // chip border
const _kSeparator = Color(0xFF2A2A2A);   // date separator line

class AiChatScreen extends StatefulWidget {
  const AiChatScreen({super.key});

  @override
  State<AiChatScreen> createState() => _AiChatScreenState();
}

class _AiChatScreenState extends State<AiChatScreen> {
  final List<ChatMessage> _messages = [
    ChatMessage(
      role: 'assistant',
      content:
          "Hi! I'm NovaAI.\nI can help you find the perfect products based on your preferences, budget, and style. What are you looking for today?",
    ),
  ];
  final _inputCtrl  = TextEditingController();
  final _scrollCtrl = ScrollController();
  bool _loading = false;

  final List<String> _quickReplies = [
    'Find me a laptop',
    'Budget options',
    'Latest releases',
  ];

  final List<String> _suggestions = [
    'Show specs',
    'Compare prices',
    'Add to cart',
  ];

  @override
  void dispose() {
    _inputCtrl.dispose();
    _scrollCtrl.dispose();
    super.dispose();
  }

  void _scrollToBottom() {
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (_scrollCtrl.hasClients) {
        _scrollCtrl.animateTo(
          _scrollCtrl.position.maxScrollExtent,
          duration: const Duration(milliseconds: 300),
          curve: Curves.easeOut,
        );
      }
    });
  }

  Future<void> _send(String text) async {
    final trimmed = text.trim();
    if (trimmed.isEmpty || _loading) return;

    setState(() {
      _messages.add(ChatMessage(role: 'user', content: trimmed));
      _loading = true;
    });
    _inputCtrl.clear();
    _scrollToBottom();

    try {
      final history = _messages
          .take(_messages.length - 1)
          .map((m) => {'role': m.role, 'content': m.content})
          .toList();
      final reply = await ApiService().chatWithAI(trimmed, history);
      setState(() => _messages.add(ChatMessage(role: 'assistant', content: reply)));
    } catch (_) {
      setState(() => _messages.add(ChatMessage(
          role: 'assistant',
          content: "Oops, I couldn't connect right now. Please try again!")));
    } finally {
      setState(() => _loading = false);
      _scrollToBottom();
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: _kBg,
      appBar: _buildAppBar(),
      body: Column(
        children: [
          // ── Messages list ──────────────────────────────────────────────
          Expanded(
            child: ListView.builder(
              controller: _scrollCtrl,
              padding: const EdgeInsets.fromLTRB(16, 8, 16, 8),
              itemCount: _messages.length + (_loading ? 1 : 0),
              itemBuilder: (_, i) {
                if (i == _messages.length) return const _TypingIndicator();
                final msg   = _messages[i];
                final isFirst = i == 0;
                // Date separator before first message
                return Column(
                  children: [
                    if (isFirst) _buildDateSeparator(),
                    _MessageBubble(
                      message: msg,
                      showQuickReplies: isFirst,
                      quickReplies: _quickReplies,
                      onQuickReply: _send,
                    ),
                  ],
                );
              },
            ),
          ),

          // ── Suggestion chips ───────────────────────────────────────────
          Container(
            color: _kBg,
            padding: const EdgeInsets.fromLTRB(16, 6, 16, 0),
            child: SizedBox(
              height: 40,
              child: ListView.builder(
                scrollDirection: Axis.horizontal,
                itemCount: _suggestions.length,
                itemBuilder: (_, i) => Padding(
                  padding: const EdgeInsets.only(right: 8),
                  child: GestureDetector(
                    onTap: () => _send(_suggestions[i]),
                    child: Container(
                      padding: const EdgeInsets.symmetric(
                          horizontal: 16, vertical: 8),
                      decoration: BoxDecoration(
                        color: _kChipBg,
                        borderRadius: BorderRadius.circular(20),
                        border: Border.all(color: _kChipBdr),
                      ),
                      child: Text(_suggestions[i],
                          style: const TextStyle(
                              color: Color(0xFFCCCCCC),
                              fontSize: 12,
                              fontWeight: FontWeight.w400)),
                    ),
                  ),
                ),
              ),
            ),
          ),

          // ── Input bar ─────────────────────────────────────────────────
          Container(
            color: _kBg,
            padding: const EdgeInsets.fromLTRB(16, 10, 16, 20),
            child: Row(
              children: [
                Expanded(
                  child: TextField(
                    controller: _inputCtrl,
                    style: const TextStyle(
                        color: Colors.white,
                        fontSize: 14,
                        fontWeight: FontWeight.w400),
                    cursorColor: kPrimary,
                    onSubmitted: _send,
                    decoration: InputDecoration(
                      hintText: 'Ask NovaAI anything...',
                      hintStyle: const TextStyle(
                          color: Color(0xFF666680), fontSize: 13),
                      filled: true,
                      fillColor: _kInput,
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(24),
                        borderSide: BorderSide.none,
                      ),
                      contentPadding: const EdgeInsets.symmetric(
                          horizontal: 20, vertical: 14),
                      suffixIcon: const Icon(Icons.mic_outlined,
                          color: Color(0xFF666680), size: 20),
                    ),
                  ),
                ),
                const SizedBox(width: 10),
                // Send button
                GestureDetector(
                  onTap: () => _send(_inputCtrl.text),
                  child: Container(
                    width: 48, height: 48,
                    decoration: BoxDecoration(
                      color: kPrimary,
                      shape: BoxShape.circle,
                      boxShadow: [
                        BoxShadow(
                            color: kPrimary.withOpacity(0.4),
                            blurRadius: 12,
                            offset: const Offset(0, 4)),
                      ],
                    ),
                    child: const Icon(Icons.arrow_upward_rounded,
                        color: Colors.white, size: 22),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  PreferredSizeWidget _buildAppBar() {
    return AppBar(
      backgroundColor: _kBg,
      elevation: 0,
      leading: IconButton(
        icon: const Icon(Icons.arrow_back_ios_rounded,
            color: Colors.white, size: 18),
        onPressed: () => Navigator.maybePop(context),
      ),
      titleSpacing: 0,
      title: Row(
        children: [
          // Avatar
          Container(
            width: 38, height: 38,
            decoration: const BoxDecoration(
                color: kPrimary, shape: BoxShape.circle),
            child: const Icon(Icons.rocket_launch_rounded,
                color: Colors.white, size: 20),
          ),
          const SizedBox(width: 10),
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text('NovaAI Assistant',
                  style: TextStyle(
                      color: Colors.white,
                      fontSize: 14,
                      fontWeight: FontWeight.w700)),
              Row(
                children: [
                  Container(
                      width: 7, height: 7,
                      decoration: const BoxDecoration(
                          color: kGreen, shape: BoxShape.circle)),
                  const SizedBox(width: 5),
                  const Text('Online · Powered by Nova AI',
                      style: TextStyle(
                          color: Color(0xFF8888AA), fontSize: 10)),
                ],
              ),
            ],
          ),
        ],
      ),
      actions: [
        IconButton(
          icon: const Icon(Icons.more_horiz,
              color: Colors.white, size: 22),
          onPressed: () {},
        ),
      ],
      bottom: const PreferredSize(
        preferredSize: Size.fromHeight(1),
        child: Divider(height: 1, color: Color(0xFF222233)),
      ),
    );
  }

  Widget _buildDateSeparator() {
    final now = DateTime.now();
    final time =
        '${now.hour.toString().padLeft(2, '0')}:${now.minute.toString().padLeft(2, '0')}';
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 12),
      child: Row(
        children: [
          const Expanded(child: Divider(color: _kSeparator, height: 1)),
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 12),
            child: Text('Today $time',
                style: const TextStyle(
                    color: Color(0xFF666680), fontSize: 11)),
          ),
          const Expanded(child: Divider(color: _kSeparator, height: 1)),
        ],
      ),
    );
  }
}

// ── Typing Indicator ──────────────────────────────────────────────────────────
class _TypingIndicator extends StatelessWidget {
  const _TypingIndicator();

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
            decoration: BoxDecoration(
              color: _kCard,
              borderRadius: const BorderRadius.only(
                topLeft: Radius.circular(16),
                topRight: Radius.circular(16),
                bottomRight: Radius.circular(16),
                bottomLeft: Radius.circular(4),
              ),
            ),
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: List.generate(
                  3, (i) => _Dot(delay: Duration(milliseconds: i * 180))),
            ),
          ),
        ],
      ),
    );
  }
}

// ── Animated dot ──────────────────────────────────────────────────────────────
class _Dot extends StatefulWidget {
  final Duration delay;
  const _Dot({required this.delay});

  @override
  State<_Dot> createState() => _DotState();
}

class _DotState extends State<_Dot> with SingleTickerProviderStateMixin {
  late AnimationController _ctrl;
  late Animation<double> _anim;

  @override
  void initState() {
    super.initState();
    _ctrl = AnimationController(
        vsync: this, duration: const Duration(milliseconds: 600));
    _anim = Tween<double>(begin: 0, end: -5)
        .animate(CurvedAnimation(parent: _ctrl, curve: Curves.easeInOut));
    Future.delayed(widget.delay, () {
      if (mounted) _ctrl.repeat(reverse: true);
    });
  }

  @override
  void dispose() {
    _ctrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return AnimatedBuilder(
      animation: _anim,
      builder: (_, __) => Transform.translate(
        offset: Offset(0, _anim.value),
        child: Container(
          width: 8, height: 8,
          margin: const EdgeInsets.symmetric(horizontal: 3),
          decoration: const BoxDecoration(
              color: kPrimary, shape: BoxShape.circle),
        ),
      ),
    );
  }
}

// ── Message bubble ────────────────────────────────────────────────────────────
class _MessageBubble extends StatelessWidget {
  final ChatMessage message;
  final bool showQuickReplies;
  final List<String> quickReplies;
  final ValueChanged<String> onQuickReply;

  const _MessageBubble({
    required this.message,
    this.showQuickReplies = false,
    required this.quickReplies,
    required this.onQuickReply,
  });

  @override
  Widget build(BuildContext context) {
    final isUser = message.isUser;
    final timeStr =
        '${message.time.hour.toString().padLeft(2, '0')}:${message.time.minute.toString().padLeft(2, '0')}';

    return Padding(
      padding: const EdgeInsets.only(bottom: 14),
      child: Column(
        crossAxisAlignment:
            isUser ? CrossAxisAlignment.end : CrossAxisAlignment.start,
        children: [
          // Bubble
          Container(
            constraints: BoxConstraints(
                maxWidth: MediaQuery.of(context).size.width * 0.78),
            decoration: BoxDecoration(
              color: isUser ? kPrimary : _kCard,
              borderRadius: BorderRadius.only(
                topLeft: const Radius.circular(16),
                topRight: const Radius.circular(16),
                bottomLeft: Radius.circular(isUser ? 16 : 4),
                bottomRight: Radius.circular(isUser ? 4 : 16),
              ),
              // Figma: AI bubble has subtle left border accent
              border: !isUser
                  ? const Border(
                      left: BorderSide(color: kPrimary, width: 2))
                  : null,
            ),
            padding: const EdgeInsets.fromLTRB(14, 12, 14, 8),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  message.content,
                  style: TextStyle(
                      color: isUser
                          ? Colors.white
                          : const Color(0xFFDDDDF0),
                      fontSize: 13,
                      height: 1.5),
                ),
                const SizedBox(height: 4),
                Align(
                  alignment: Alignment.centerRight,
                  child: Text(
                    timeStr,
                    style: TextStyle(
                        color: isUser
                            ? Colors.white.withOpacity(0.55)
                            : const Color(0xFF666680),
                        fontSize: 9),
                  ),
                ),
              ],
            ),
          ),

          // Quick reply chips (only after first AI message)
          if (showQuickReplies && !isUser) ...[
            const SizedBox(height: 10),
            SingleChildScrollView(
              scrollDirection: Axis.horizontal,
              child: Row(
                children: quickReplies.map((q) => Padding(
                  padding: const EdgeInsets.only(right: 8),
                  child: GestureDetector(
                    onTap: () => onQuickReply(q),
                    child: Container(
                      padding: const EdgeInsets.symmetric(
                          horizontal: 16, vertical: 8),
                      decoration: BoxDecoration(
                        color: Colors.transparent,
                        borderRadius: BorderRadius.circular(20),
                        border: Border.all(color: kPrimary, width: 1.5),
                      ),
                      child: Text(q,
                          style: const TextStyle(
                              color: kPrimary,
                              fontSize: 12,
                              fontWeight: FontWeight.w500)),
                    ),
                  ),
                )).toList(),
              ),
            ),
          ],
        ],
      ),
    );
  }
}
