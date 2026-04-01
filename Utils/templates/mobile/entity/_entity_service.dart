import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../models/<%= name.lower %>_model.dart';
import '../services/api_service.dart';

final <%= name.lower %>ServiceProvider = Provider<<%= name.capital %>Service>((ref) {
  return <%= name.capital %>Service(ref.read(dioProvider));
});

class <%= name.capital %>Service {
  final Dio _dio;
  static const String _basePath = '/api/v1/<%= name.lower %>s';

  <%= name.capital %>Service(this._dio);

  Future<List<<%= name.capital %>Model>> findAll({
    int page = 1,
    int size = 20,
    String? sort,
    Map<String, dynamic>? filters,
  }) async {
    final queryParams = <String, dynamic>{
      'page': page,
      'size': size,
    };
    if (sort != null) queryParams['sort'] = sort;
    if (filters != null) queryParams.addAll(filters);

    final response = await _dio.get(
      _basePath,
      queryParameters: queryParams,
    );
    final list = response.data as List<dynamic>;
    return list
        .map((json) => <%= name.capital %>Model.fromJson(json as Map<String, dynamic>))
        .toList();
  }

  Future<<%= name.capital %>Model> findById(dynamic id) async {
    final response = await _dio.get('$_basePath/$id');
    return <%= name.capital %>Model.fromJson(response.data as Map<String, dynamic>);
  }

  Future<<%= name.capital %>Model> create(<%= name.capital %>Model model) async {
    final response = await _dio.post(_basePath, data: model.toJson());
    return <%= name.capital %>Model.fromJson(response.data as Map<String, dynamic>);
  }

  Future<<%= name.capital %>Model> update(dynamic id, <%= name.capital %>Model model) async {
    final response = await _dio.put('$_basePath/$id', data: model.toJson());
    return <%= name.capital %>Model.fromJson(response.data as Map<String, dynamic>);
  }

  Future<void> remove(dynamic id) async {
    await _dio.delete('$_basePath/$id');
  }

  Future<String> exportCsv({Map<String, dynamic>? filters}) async {
    final response = await _dio.get(
      '$_basePath/export',
      queryParameters: filters,
      options: Options(responseType: ResponseType.bytes),
    );
    return response.headers.value('content-disposition') ?? '<%= name.lower %>s.csv';
  }

  Future<String> exportPdf({Map<String, dynamic>? filters}) async {
    final response = await _dio.get(
      '$_basePath/export/pdf',
      queryParameters: filters,
      options: Options(responseType: ResponseType.bytes),
    );
    return response.headers.value('content-disposition') ?? '<%= name.lower %>s.pdf';
  }
}
