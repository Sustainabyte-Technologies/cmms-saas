import 'dart:io';

import 'package:dio/dio.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';

import '../data/static_cmms_data.dart';

class ApiClient {
  ApiClient({required String baseUrl}) : _baseUrl = baseUrl {
    _initDio();
  }

  String _baseUrl;
  String get baseUrl => _baseUrl;

  set baseUrl(String value) {
    if (_baseUrl != value) {
      _baseUrl = value;
      _initDio();
    }
  }

  final FlutterSecureStorage _storage = const FlutterSecureStorage();
  final StaticCmmsData _staticData = StaticCmmsData();

  static const tokenKey = 'cmms.jwt';

  late Dio _dio;

  void _initDio() {
    debugPrint('[API] Initializing ApiClient with baseUrl: $_baseUrl');

    _dio = Dio(BaseOptions(
      baseUrl: _baseUrl,
      connectTimeout: const Duration(seconds: 15),
      receiveTimeout: const Duration(seconds: 15),
    ));

    // Add logging in debug mode to help diagnose connection issues
    if (kDebugMode) {
      _dio.interceptors.add(LogInterceptor(
        requestBody: true,
        responseBody: true,
        error: true,
        logPrint: (obj) => debugPrint('[API] $obj'),
      ));
    }
  }

  bool _useRealApi(String path) {
    return true;
  }

  Future<Map<String, String>> _getHeaders() async {
    final token = await tokenValue;
    final headers = <String, String>{
      'Content-Type': 'application/json',
    };
    if (token != null) {
      headers['Authorization'] = 'Bearer $token';
      headers['Cookie'] = 'access_token=$token';
    }
    return headers;
  }

  String _parseDioError(DioException e) {
    if (e.response != null) {
      final data = e.response!.data;
      if (data is Map && data['message'] != null) {
        final msg = data['message'];
        if (msg is List) return msg.join(', ');
        return msg.toString();
      }
      return 'Server error (${e.response!.statusCode})';
    }
    if (e.type == DioExceptionType.connectionTimeout ||
        e.type == DioExceptionType.receiveTimeout) {
      return 'Connection timed out. Please check your network or server.';
    }
    if (e.type == DioExceptionType.connectionError) {
      return 'Cannot reach the server. Make sure the backend is running.';
    }
    return e.message ?? 'An unexpected error occurred';
  }

  Future<String?> get tokenValue => _storage.read(key: tokenKey);

  Future<void> setToken(String token) {
    return _storage.write(key: tokenKey, value: token);
  }

  Future<void> clearToken() {
    return _storage.delete(key: tokenKey);
  }

  Future<dynamic> get(
    String path, {
    Map<String, dynamic>? queryParameters,
  }) async {
    if (_useRealApi(path)) {
      try {
        final response = await _dio.get(
          path,
          queryParameters: queryParameters,
          options: Options(headers: await _getHeaders()),
        );
        return response.data;
      } on DioException catch (e) {
        throw ApiException(_parseDioError(e));
      }
    }
    return _staticData.handleGet(path, queryParameters);
  }

  Future<dynamic> post(String path, {Object? data}) async {
    if (_useRealApi(path)) {
      try {
        final response = await _dio.post(
          path,
          data: data,
          options: Options(headers: await _getHeaders()),
        );
        return response.data;
      } on DioException catch (e) {
        throw ApiException(_parseDioError(e));
      }
    }
    return _staticData.handlePost(path, data);
  }

  Future<dynamic> patch(String path, {Object? data}) async {
    if (_useRealApi(path)) {
      try {
        final response = await _dio.patch(
          path,
          data: data,
          options: Options(headers: await _getHeaders()),
        );
        return response.data;
      } on DioException catch (e) {
        throw ApiException(_parseDioError(e));
      }
    }
    return _staticData.handlePatch(path, data);
  }

  Future<dynamic> delete(String path) async {
    if (_useRealApi(path)) {
      try {
        final response = await _dio.delete(
          path,
          options: Options(headers: await _getHeaders()),
        );
        return response.data;
      } on DioException catch (e) {
        throw ApiException(_parseDioError(e));
      }
    }
    return _staticData.handleDelete(path);
  }

  Future<dynamic> upload(
    String path, {
    required File file,
    String fieldName = 'file',
    Map<String, dynamic>? fields,
  }) async {
    if (_useRealApi(path)) {
      try {
        final formData = FormData.fromMap({
          fieldName: await MultipartFile.fromFile(file.path),
          if (fields != null) ...fields,
        });
        final response = await _dio.post(
          path,
          data: formData,
          options: Options(headers: await _getHeaders()),
        );
        return response.data;
      } on DioException catch (e) {
        throw ApiException(_parseDioError(e));
      }
    }
    return _staticData.handleUpload(path, file, fields);
  }
}

class ApiException implements Exception {
  const ApiException(this.message);

  final String message;

  @override
  String toString() => message;
}
