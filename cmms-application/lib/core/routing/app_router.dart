import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../../features/assets/presentation/assets_screen.dart';
import '../../features/assets/presentation/scan_asset_screen.dart';
import '../../features/inventory/presentation/spare_parts_screen.dart';
import '../../features/auth/presentation/login_screen.dart';
import '../../features/checklists/presentation/checklists_screen.dart';
import '../../features/dashboard/presentation/dashboard_screen.dart';
import '../../features/notifications/presentation/notifications_screen.dart';
import '../../features/portfolio/presentation/portfolio_screen.dart';
import '../../features/preventive/presentation/preventive_screen.dart';
import '../../features/users/presentation/users_screen.dart';
import '../../features/work_orders/presentation/work_orders_screen.dart';
import '../../features/chat/presentation/chat_screen.dart';
import '../providers/app_state.dart';

class AppRouter {
  AppRouter(this.appState);

  final AppState appState;

  late final router = GoRouter(
    refreshListenable: appState,
    initialLocation: '/dashboard',
    redirect: (context, state) {
      final isLogin = state.matchedLocation == '/login';
      if (appState.isBootstrapping) return null;
      if (!appState.isAuthenticated) return isLogin ? null : '/login';
      if (isLogin) return '/dashboard';
      return null;
    },
    routes: [
      GoRoute(path: '/login', builder: (_, _) => const LoginScreen()),
      GoRoute(path: '/dashboard', builder: (_, _) => const DashboardScreen()),
      GoRoute(path: '/portfolio', builder: (_, _) => const PortfolioScreen()),
      GoRoute(path: '/users', builder: (_, _) => const UsersScreen()),
      GoRoute(path: '/assets', builder: (_, _) => const AssetsScreen()),
      GoRoute(path: '/scan-asset', builder: (_, _) => const ScanAssetScreen()),
      GoRoute(path: '/inventory', builder: (_, _) => const SparePartsScreen()),
      GoRoute(
        path: '/work-orders',
        builder: (_, _) => const WorkOrdersScreen(),
      ),
      GoRoute(path: '/checklists', builder: (_, _) => const ChecklistsScreen()),
      GoRoute(path: '/preventive', builder: (_, _) => const PreventiveScreen()),
      GoRoute(
        path: '/notifications',
        builder: (_, _) => const NotificationsScreen(),
      ),
      GoRoute(path: '/search', builder: (_, _) => const GlobalSearchScreen()),
      GoRoute(path: '/chat', builder: (_, _) => const ChatScreen()),
    ],
    errorBuilder: (_, _) =>
        const Scaffold(body: Center(child: Text('Screen not found'))),
  );
}
