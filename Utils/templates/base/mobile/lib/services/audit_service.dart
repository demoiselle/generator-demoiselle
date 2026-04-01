import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'api_service.dart';

final auditServiceProvider = Provider<AuditService>((ref) {
  return AuditService(ref);
});

class AuditService {
  final Ref _ref;

  AuditService(this._ref);

  Dio get _dio => _ref.read(dioProvider);

  Future<List<Map<String, dynamic>>> getAuditLogs({
    String? entityName,
    String? userId,
    String? startDate,
    String? endDate,
    int page = 0,
    int size = 20,
  }) async {
    final params = <String, dynamic>{
      'page': page,
      'size': size,
    };
    if (entityName != null) params['entityName'] = entityName;
    if (userId != null) params['userId'] = userId;
    if (startDate != null) params['startDate'] = startDate;
    if (endDate != null) params['endDate'] = endDate;

    final response = await _dio.get(
      '/api/audit',
      queryParameters: params,
    );
    return List<Map<String, dynamic>>.from(response.data);
  }
}
