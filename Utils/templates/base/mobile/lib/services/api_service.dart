import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';

import '../providers/auth_provider.dart';

final dioProvider = Provider<Dio>((ref) {
  final dio = Dio(BaseOptions(
    baseUrl: const String.fromEnvironment(
      'API_BASE_URL',
      defaultValue: 'http://10.0.2.2:8080',
    ),
    connectTimeout: const Duration(seconds: 15),
    receiveTimeout: const Duration(seconds: 15),
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
  ));

  dio.interceptors.add(AuthInterceptor(ref));

  return dio;
});

class AuthInterceptor extends Interceptor {
  final Ref _ref;

  AuthInterceptor(this._ref);

  @override
  void onRequest(
    RequestOptions options,
    RequestInterceptorHandler handler,
  ) async {
    final storage = _ref.read(secureStorageProvider);
    final token = await storage.read(key: 'token');
    if (token != null) {
      options.headers['Authorization'] = 'Bearer $token';
    }
    handler.next(options);
  }

  @override
  void onError(DioException err, ErrorInterceptorHandler handler) async {
    if (err.response?.statusCode == 401) {
      // Try to refresh the token
      final storage = _ref.read(secureStorageProvider);
      final currentToken = await storage.read(key: 'token');

      if (currentToken != null) {
        try {
          final authNotifier = _ref.read(authProvider.notifier);
          await authNotifier.refreshToken();

          // Retry the original request with the new token
          final newToken = await storage.read(key: 'token');
          if (newToken != null) {
            err.requestOptions.headers['Authorization'] = 'Bearer $newToken';
            final response = await _ref.read(dioProvider).fetch(
              err.requestOptions,
            );
            return handler.resolve(response);
          }
        } catch (_) {
          // Refresh failed, logout
          final authNotifier = _ref.read(authProvider.notifier);
          await authNotifier.logout();
        }
      }
    }
    handler.next(err);
  }
}
