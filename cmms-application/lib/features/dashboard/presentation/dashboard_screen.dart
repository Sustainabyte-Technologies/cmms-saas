import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';

import '../../../core/models/api_record.dart';
import '../../../core/providers/app_state.dart';
import '../../../core/widgets/cmms_scaffold.dart';
import '../../../core/widgets/data_state_widgets.dart';

import 'widgets/admin_dashboard.dart';
import 'widgets/manager_dashboard.dart';
import 'widgets/site_incharge_dashboard.dart';
import 'widgets/supervisor_dashboard.dart';
import 'widgets/technician_dashboard.dart';

class DashboardScreen extends StatefulWidget {
  const DashboardScreen({super.key});

  @override
  State<DashboardScreen> createState() => _DashboardScreenState();
}

class _DashboardScreenState extends State<DashboardScreen> {
  late Future<DashboardData> _future;

  @override
  void initState() {
    super.initState();
    _future = _load();
  }

  void refreshDashboard() {
    setState(() {
      _future = _load();
    });
  }

  Future<DashboardData> _load() async {
    final api = context.read<AppState>().apiClient;
    final overview = await api.get('/dashboard/overview');
    final statuses = await api.get('/dashboard/work-order-status');
    final recent = await api.get('/dashboard/recent-activities');
    final workOrders = await api.get(
      '/work-orders',
      queryParameters: {'limit': 20},
    );
    return DashboardData(
      overview: overview is Map ? Map<String, dynamic>.from(overview) : {},
      statuses: normalizeRecords(statuses, ['data']),
      recent: normalizeRecords(recent, ['activities', 'data']),
      workOrders: normalizeRecords(workOrders, ['workOrders', 'data']),
    );
  }

  @override
  Widget build(BuildContext context) {
    final user = context.watch<AppState>().user;
    final role = user?.role ?? '';
    final title = role == 'TECHNICIAN'
        ? 'My Jobs'
        : role == 'SUPERVISOR' || role == 'SITE_INCHARGE'
            ? 'Site Dashboard'
            : 'Enterprise Dashboard';

    return CmmsScaffold(
      title: title,
      appBar: role == 'TECHNICIAN' ? _buildTechnicianAppBar(context) : null,
      child: FutureBuilder<DashboardData>(
        future: _future,
        builder: (context, snapshot) {
          if (snapshot.connectionState != ConnectionState.done && !snapshot.hasData) {
            return const LoadingView();
          }
          if (snapshot.hasError) {
            return ErrorPanel(
              message: snapshot.error.toString(),
              onRetry: refreshDashboard,
            );
          }
          final data = snapshot.data!;
          if (role == 'TECHNICIAN') {
            return TechnicianDashboard(
              data: data,
              onRefresh: refreshDashboard,
            );
          }
          if (role == 'MAINTENANCE_MANAGER') {
            return ManagerDashboard(data: data);
          }
          if (role == 'SITE_INCHARGE') {
            return SiteInchargeDashboard(data: data);
          }
          if (role == 'SUPERVISOR') {
            return SupervisorDashboard(data: data);
          }
          return AdminDashboard(data: data);
        },
      ),
    );
  }

  PreferredSizeWidget _buildTechnicianAppBar(BuildContext context) {
    final user = context.watch<AppState>().user;
    final name = user?.name ?? 'Technician';
    final firstName = name.split(' ').first;
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return AppBar(
      leading: Builder(
        builder: (context) {
          return IconButton(
            icon: const Icon(Icons.menu),
            onPressed: () {
              Scaffold.of(context).openDrawer();
            },
          );
        },
      ),
      title: Row(
        children: [
          Text(
            'Hello $firstName',
            style: const TextStyle(fontWeight: FontWeight.bold),
          ),
          const SizedBox(width: 4),
          const Text('👋', style: TextStyle(fontSize: 20)),
        ],
      ),
      actions: [
        IconButton(
          icon: const Icon(Icons.notifications_none),
          onPressed: () => context.push('/notifications'),
        ),
        const SizedBox(width: 4),
        Stack(
          children: [
            const CircleAvatar(
              radius: 18,
              backgroundImage: NetworkImage(
                'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=100',
              ),
            ),
            Positioned(
              bottom: 0,
              right: 0,
              child: Container(
                width: 10,
                height: 10,
                decoration: BoxDecoration(
                  color: const Color(0xFF3B82F6),
                  shape: BoxShape.circle,
                  border: Border.all(
                    color: isDark ? Colors.black : Colors.white,
                    width: 1.5,
                  ),
                ),
              ),
            ),
          ],
        ),
        const SizedBox(width: 16),
      ],
    );
  }
}

class DashboardData {
  const DashboardData({
    required this.overview,
    required this.statuses,
    required this.recent,
    required this.workOrders,
  });

  final Map<String, dynamic> overview;
  final List<ApiRecord> statuses;
  final List<ApiRecord> recent;
  final List<ApiRecord> workOrders;
}
