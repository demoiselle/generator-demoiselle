class UserModel {
  final int? id;
  final String name;
  final String email;
  final bool emailVerified;
  final List<String> roles;

  const UserModel({
    this.id,
    required this.name,
    required this.email,
    this.emailVerified = false,
    this.roles = const [],
  });

  factory UserModel.fromJson(Map<String, dynamic> json) {
    return UserModel(
      id: json['id'] as int?,
      name: json['name'] as String? ?? '',
      email: json['email'] as String? ?? '',
      emailVerified: json['emailVerified'] as bool? ?? false,
      roles: json['roles'] != null
          ? List<String>.from(json['roles'] as List)
          : const [],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'email': email,
      'emailVerified': emailVerified,
      'roles': roles,
    };
  }
}
