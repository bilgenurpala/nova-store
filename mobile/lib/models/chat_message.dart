class ChatMessage {
  final String role; // 'user' | 'assistant'
  final String content;
  final DateTime time;

  ChatMessage({
    required this.role,
    required this.content,
    DateTime? time,
  }) : time = time ?? DateTime.now();

  bool get isUser => role == 'user';
}
