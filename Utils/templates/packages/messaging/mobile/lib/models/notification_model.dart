class NotificationModel {
  final int? id;
  final int? userId;
  final String title;
  final String message;
  final String type;
  final bool read;
  final DateTime? createdAt;

  const NotificationModel({
    this.id,
    this.userId,
    required this.title,
    required this.message,
    this.type = 'INFO',
    this.read = false,
    this.createdAt,
  });

  factory NotificationModel.fromJson(Map<String, dynamic> json) {
    return NotificationModel(
      id: json['id'] as int?,
      userId: json['userId'] as int?,
      title: json['title'] as String? ?? '',
      message: json['message'] as String? ?? '',
      type: json['type'] as String? ?? 'INFO',
      read: json['read'] as bool? ?? false,
      createdAt: json['createdAt'] != null
          ? DateTime.parse(json['createdAt'] as String)
          : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'userId': userId,
      'title': title,
      'message': message,
      'type': type,
      'read': read,
      'createdAt': createdAt?.toIso8601String(),
    };
  }
}
