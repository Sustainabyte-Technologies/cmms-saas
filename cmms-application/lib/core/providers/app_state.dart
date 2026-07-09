import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:socket_io_client/socket_io_client.dart' as io;

import '../api/api_client.dart';
import '../auth/auth_repository.dart';
import '../models/session_user.dart';

class AppState extends ChangeNotifier {
  AppState({required this.authRepository, required this.apiClient});

  final AuthRepository authRepository;
  final ApiClient apiClient;

  SessionUser? user;
  bool isBootstrapping = true;
  bool isBusy = false;
  ThemeMode themeMode = ThemeMode.system;

  io.Socket? _backgroundSocket;
  int unreadSupportCount = 0;
  int unreadWorkOrderCount = 0;

  int get unreadChatCount => unreadSupportCount + unreadWorkOrderCount;

  bool isSupportChatActive = false;
  bool isWorkOrderChatActive = false;
  String? activeWorkOrderId;

  // Callback to display global snackbar when a new message arrives in the background
  void Function(
    String senderName,
    String message, {
    required bool isWorkOrder,
    String? workOrderNumber,
  })? onNewChatMessage;

  bool get isAuthenticated => user != null;

  Future<void> bootstrap() async {
    final prefs = await SharedPreferences.getInstance();
    final mode = prefs.getString('themeMode');
    themeMode = switch (mode) {
      'light' => ThemeMode.light,
      'dark' => ThemeMode.dark,
      _ => ThemeMode.system,
    };
    user = await authRepository.loadSession();
    isBootstrapping = false;
    if (user != null) {
      connectBackgroundSocket();
    }
    notifyListeners();
  }

  Future<void> login(String email, String password) async {
    isBusy = true;
    notifyListeners();
    try {
      user = await authRepository.login(email, password);
      if (user != null) {
        connectBackgroundSocket();
      }
    } finally {
      isBusy = false;
      notifyListeners();
    }
  }

  Future<void> logout() async {
    disconnectBackgroundSocket();
    await authRepository.logout();
    user = null;
    notifyListeners();
  }

  Future<void> setThemeMode(ThemeMode mode) async {
    themeMode = mode;
    notifyListeners();
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString('themeMode', mode.name);
  }

  Future<void> connectBackgroundSocket() async {
    _backgroundSocket?.disconnect();
    _backgroundSocket?.dispose();
    _backgroundSocket = null;

    final token = await apiClient.tokenValue;
    if (token == null) return;

    final baseUrl = apiClient.baseUrl;

    _backgroundSocket = io.io(
      baseUrl,
      io.OptionBuilder()
          .setTransports(['websocket'])
          .setAuth({'token': token})
          .setQuery({'token': token})
          .enableForceNew()
          .build(),
    );

    _backgroundSocket?.onConnect((_) {
      debugPrint('Background socket connected successfully');
      _backgroundSocket?.emit('join');
    });

    _backgroundSocket?.on('receiveMessage', (data) {
      debugPrint('Background socket receiveMessage: $data');
      if (data is Map) {
        final message = Map<String, dynamic>.from(data);
        final senderId = message['senderId'] ?? '';
        final currentUserId = user?.id ?? '';

        if (senderId == currentUserId) return;

        final senderName = message['sender']?['fullName'] ?? 'Support Admin';
        final messageText = message['message'] ?? '';

        if (!isSupportChatActive) {
          unreadSupportCount++;
          notifyListeners();
          onNewChatMessage?.call(senderName, messageText, isWorkOrder: false);
        }
      }
    });

    _backgroundSocket?.on('receiveWorkOrderMessageNotification', (data) {
      debugPrint('Background socket receiveWorkOrderMessageNotification: $data');
      if (data is Map) {
        final message = Map<String, dynamic>.from(data);
        final senderId = message['senderId'] ?? '';
        final currentUserId = user?.id ?? '';

        if (senderId == currentUserId) return;

        final senderName = message['sender']?['fullName'] ?? 'System';
        final messageText = message['message'] ?? '';
        final workOrderId = message['workOrderId'] ?? '';
        final workOrderNumber = message['workOrder']?['workOrderNumber'] ?? 'WO';

        if (activeWorkOrderId != workOrderId) {
          unreadWorkOrderCount++;
          notifyListeners();
          onNewChatMessage?.call(
            senderName,
            messageText,
            isWorkOrder: true,
            workOrderNumber: workOrderNumber,
          );
        }
      }
    });
  }

  void disconnectBackgroundSocket() {
    _backgroundSocket?.disconnect();
    _backgroundSocket?.dispose();
    _backgroundSocket = null;
    unreadSupportCount = 0;
    unreadWorkOrderCount = 0;
    notifyListeners();
  }

  void setSupportChatActive(bool active) {
    isSupportChatActive = active;
    if (active) {
      unreadSupportCount = 0;
      notifyListeners();
    }
  }

  void setWorkOrderChatActive(bool active) {
    isWorkOrderChatActive = active;
    if (active) {
      unreadWorkOrderCount = 0;
      notifyListeners();
    }
  }

  bool canManage(String module) {
    final role = user?.role;
    if (role == 'ADMIN' ||
        role == 'MAINTENANCE_MANAGER' ||
        role == 'CUSTOMER_MANAGER') {
      return true;
    }
    if (role == 'SUPERVISOR' || role == 'SITE_INCHARGE') {
      return ['workOrders', 'assets', 'checklists'].contains(module);
    }
    return false;
  }

  @override
  void dispose() {
    disconnectBackgroundSocket();
    super.dispose();
  }
}
