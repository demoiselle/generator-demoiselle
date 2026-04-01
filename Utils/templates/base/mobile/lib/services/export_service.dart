import 'dart:io';

import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:share_plus/share_plus.dart';

import 'api_service.dart';

final exportServiceProvider = Provider<ExportService>((ref) {
  return ExportService(ref);
});

class ExportService {
  final Ref _ref;

  ExportService(this._ref);

  Dio get _dio => _ref.read(dioProvider);

  Future<void> exportCsv(
    String entityPath, {
    Map<String, dynamic>? filters,
  }) async {
    final response = await _dio.get(
      '/api/v1/$entityPath/export',
      queryParameters: filters,
      options: Options(responseType: ResponseType.bytes),
    );

    await _shareFile(response.data, '$entityPath.csv', 'text/csv');
  }

  Future<void> exportPdf(
    String entityPath, {
    Map<String, dynamic>? filters,
  }) async {
    final response = await _dio.get(
      '/api/v1/$entityPath/export/pdf',
      queryParameters: filters,
      options: Options(responseType: ResponseType.bytes),
    );

    await _shareFile(response.data, '$entityPath.pdf', 'application/pdf');
  }

  Future<void> _shareFile(
    List<int> bytes,
    String filename,
    String mimeType,
  ) async {
    final tempDir = Directory.systemTemp;
    final file = File('${tempDir.path}/$filename');
    await file.writeAsBytes(bytes);

    await Share.shareXFiles(
      [XFile(file.path, mimeType: mimeType)],
      subject: filename,
    );
  }
}
