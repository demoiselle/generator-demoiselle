import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../models/notification_model.dart';
import 'api_service.dart';

class NotificationService {
  final Ref _ref;

  NotificationService(this._ref);

  Dio get _dio => _ref.read(dioProvider);

  Future<List<NotificationModel>> getNotifications({
    bool? readOnly,
    int page = 0,
    int size = 20,
  }) async {
    final params = <String, dynamic>{
      'page': page,
      'size': size,
    };
    if (readOnly != null) {
      params['read'] = readOnly;
    }
    final response = await _dio.get(
      '/api/notifications',
      queryParameters: params,
    );
    final list = response.data as List;
    return list.map((json) => NotificationModel.fromJson(json)).toList();
  }

  Future<void> markAsRead(int id) async {
    await _dio.put('/api/notifications/$id/read');
  }
}
