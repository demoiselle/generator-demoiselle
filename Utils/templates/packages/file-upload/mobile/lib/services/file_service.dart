import 'dart:io';

import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'api_service.dart';

final fileServiceProvider = Provider<FileService>((ref) {
  return FileService(ref);
});

class FileService {
  final Ref _ref;

  FileService(this._ref);

  Dio get _dio => _ref.read(dioProvider);

  Future<Map<String, dynamic>> uploadFile(
    File file, {
    void Function(int, int)? onProgress,
  }) async {
    final fileName = file.path.split(Platform.pathSeparator).last;
    final formData = FormData.fromMap({
      'file': await MultipartFile.fromFile(file.path, filename: fileName),
    });

    final response = await _dio.post(
      '/api/files/upload',
      data: formData,
      options: Options(headers: {
        'Content-Type': 'multipart/form-data',
      }),
      onSendProgress: onProgress,
    );
    return response.data;
  }

  Future<Response> downloadFile(
    int id, {
    String? savePath,
    void Function(int, int)? onProgress,
  }) async {
    return await _dio.get(
      '/api/files/$id',
      options: Options(responseType: ResponseType.bytes),
      onReceiveProgress: onProgress,
    );
  }

  Future<void> deleteFile(int id) async {
    await _dio.delete('/api/files/$id');
  }
}
