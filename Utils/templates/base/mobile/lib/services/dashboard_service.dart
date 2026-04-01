import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../models/dashboard_stats_model.dart';
import 'api_service.dart';

final dashboardServiceProvider = Provider<DashboardService>((ref) {
  return DashboardService(ref);
});

class DashboardService {
  final Ref _ref;

  DashboardService(this._ref);

  Dio get _dio => _ref.read(dioProvider);

  Future<DashboardStatsModel> getStats() async {
    final response = await _dio.get('/api/dashboard/stats');
    return DashboardStatsModel.fromJson(response.data);
  }
}
