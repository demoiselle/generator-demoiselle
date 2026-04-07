import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'dart:convert';

import '../models/user_model.dart';
import '../services/auth_service.dart';

final secureStorageProvider = Provider<FlutterSecureStorage>((ref) {
  return const FlutterSecureStorage();
});

final authServiceProvider = Provider<AuthService>((ref) {
  return AuthService(ref);
});

final authProvider = StateNotifierProvider<AuthNotifier, AuthState>((ref) {
  return AuthNotifier(ref);
});

class AuthState {
  final String? token;
  final UserModel? user;
  final List<String> roles;
  final bool isLoading;
  final String? error;

  const AuthState({
    this.token,
    this.user,
    this.roles = const [],
    this.isLoading = false,
    this.error,
  });

  bool get isAuthenticated => token != null;

  bool hasRole(String role) => roles.contains(role);

  AuthState copyWith({
    String? token,
    UserModel? user,
    List<String>? roles,
    bool? isLoading,
    String? error,
  }) {
    return AuthState(
      token: token ?? this.token,
      user: user ?? this.user,
      roles: roles ?? this.roles,
      isLoading: isLoading ?? this.isLoading,
      error: error,
    );
  }
}

class AuthNotifier extends StateNotifier<AuthState> {
  final Ref _ref;

  AuthNotifier(this._ref) : super(const AuthState()) {
    _loadStoredAuth();
  }

  Future<void> _loadStoredAuth() async {
    final storage = _ref.read(secureStorageProvider);
    final token = await storage.read(key: 'token');
    final userJson = await storage.read(key: 'user');
    final rolesJson = await storage.read(key: 'roles');

    if (token != null) {
      UserModel? user;
      if (userJson != null) {
        user = UserModel.fromJson(json.decode(userJson));
      }
      final roles = rolesJson != null
          ? List<String>.from(json.decode(rolesJson))
          : <String>[];

      state = AuthState(token: token, user: user, roles: roles);
    }
  }

  Future<void> login(String email, String password) async {
    state = state.copyWith(isLoading: true, error: null);
    try {
      final authService = _ref.read(authServiceProvider);
      final data = await authService.login(email, password);
      await _persistAuth(data);
    } catch (e) {
      state = state.copyWith(isLoading: false, error: e.toString());
      rethrow;
    }
  }

  Future<void> refreshToken() async {
    try {
      final authService = _ref.read(authServiceProvider);
      final data = await authService.refreshToken(state.token!);
      await _persistAuth(data);
    } catch (e) {
      await logout();
      rethrow;
    }
  }

  Future<void> _persistAuth(Map<String, dynamic> data) async {
    final storage = _ref.read(secureStorageProvider);
    final token = data['token'] as String;
    final user = data['user'] != null ? UserModel.fromJson(data['user']) : null;
    final roles = data['roles'] != null
        ? List<String>.from(data['roles'])
        : <String>[];

    await storage.write(key: 'token', value: token);
    if (user != null) {
      await storage.write(key: 'user', value: json.encode(user.toJson()));
    }
    await storage.write(key: 'roles', value: json.encode(roles));

    state = AuthState(token: token, user: user, roles: roles);
  }

  Future<void> logout() async {
    final storage = _ref.read(secureStorageProvider);
    await storage.delete(key: 'token');
    await storage.delete(key: 'user');
    await storage.delete(key: 'roles');
    state = const AuthState();
  }
}
