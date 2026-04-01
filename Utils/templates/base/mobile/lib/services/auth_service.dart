import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'api_service.dart';

class AuthService {
  final Ref _ref;

  AuthService(this._ref);

  Dio get _dio => _ref.read(dioProvider);

  Future<Map<String, dynamic>> login(String email, String password) async {
    final response = await _dio.post('/api/auth/login', data: {
      'email': email,
      'password': password,
    });
    return response.data;
  }

  Future<Map<String, dynamic>> refreshToken(String token) async {
    final response = await _dio.get(
      '/api/auth/refresh',
      options: Options(headers: {'Authorization': 'Bearer $token'}),
    );
    return response.data;
  }

  Future<void> register({
    required String name,
    required String email,
    required String password,
  }) async {
    await _dio.post('/api/auth/register', data: {
      'name': name,
      'email': email,
      'password': password,
    });
  }

  Future<void> forgotPassword(String email) async {
    await _dio.post('/api/auth/forgot-password', data: {
      'email': email,
    });
  }

  Future<void> resetPassword({
    required String token,
    required String password,
  }) async {
    await _dio.post('/api/auth/reset-password', data: {
      'token': token,
      'password': password,
    });
  }
}
