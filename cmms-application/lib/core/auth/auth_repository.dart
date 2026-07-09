import 'dart:convert';

import 'package:flutter_secure_storage/flutter_secure_storage.dart';

import '../api/api_client.dart';
import '../models/session_user.dart';

class AuthRepository {
  AuthRepository(this._apiClient);

  final ApiClient _apiClient;
  final FlutterSecureStorage _storage = const FlutterSecureStorage();

  static const _userKey = 'cmms.user';

  Future<SessionUser?> loadSession() async {
    final token = await _apiClient.tokenValue;
    final userJson = await _storage.read(key: _userKey);
    if (token == null || userJson == null) return null;

    try {
      final remoteUser = await me();
      await _saveUser(remoteUser);
      return remoteUser;
    } catch (_) {
      return SessionUser.fromJson(jsonDecode(userJson) as Map<String, dynamic>);
    }
  }

  Future<SessionUser> login(String email, String password) async {
    final response = await _apiClient.post(
      '/auth/login',
      data: {'email': email, 'password': password},
    );

    final token = _readToken(response);
    if (token != null) await _apiClient.setToken(token);

    final user = _readUser(response) ?? await me();
    await _saveUser(user);
    return user;
  }

  Future<SessionUser> me() async {
    final response = await _apiClient.get('/auth/me');
    final userJson = response is Map && response['user'] is Map
        ? response['user']
        : response;
    return SessionUser.fromJson(Map<String, dynamic>.from(userJson as Map));
  }

  Future<void> logout() async {
    try {
      await _apiClient.post('/auth/logout');
    } catch (_) {
      // Local session must still be cleared if the server is unavailable.
    }
    await _apiClient.clearToken();
    await _storage.delete(key: _userKey);
  }

  Future<void> _saveUser(SessionUser user) async {
    await _storage.write(key: _userKey, value: jsonEncode(user.toJson()));
  }

  String? _readToken(dynamic response) {
    if (response is! Map) return null;
    return response['access_token']?.toString() ??
        response['accessToken']?.toString() ??
        response['token']?.toString() ??
        response['jwt']?.toString();
  }

  SessionUser? _readUser(dynamic response) {
    if (response is! Map) return null;
    final userJson = response['user'];
    if (userJson is Map) {
      return SessionUser.fromJson(Map<String, dynamic>.from(userJson));
    }
    return null;
  }
}
