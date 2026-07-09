import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';

import '../../../../core/providers/app_state.dart';
import '../../../../core/widgets/data_state_widgets.dart';
import '../dashboard_screen.dart';
import 'dashboard_charts.dart';
import 'recent_activities.dart';

class AdminDashboard extends StatelessWidget {
  const AdminDashboard({super.key, required this.data});

  final DashboardData data;

  String _count(String key) {
    final overview = data.overview;
    return (overview[key] ??
            overview[key.replaceFirst('total', '').toLowerCase()] ??
            0)
        .toString();
  }

  @override
  Widget build(BuildContext context) {
    final scheme = Theme.of(context).colorScheme;
    final isDark = Theme.of(context).brightness == Brightness.dark;

    final counts = [
      ('Customers', _count('totalCustomers'), Icons.business, scheme.primary),
      ('Sites', _count('totalSites'), Icons.location_city, const Color(0xFF3B82F6)),
      ('Departments', _count('totalDepartments'), Icons.apartment, const Color(0xFF10B981)),
      ('Systems', _count('totalSystems'), Icons.account_tree, const Color(0xFFEC4899)),
      ('Assets', _count('totalAssets'), Icons.precision_manufacturing, const Color(0xFF8B5CF6)),
      ('Users', _count('totalUsers'), Icons.people, const Color(0xFFF59E0B)),
      ('Work Orders', _count('totalWorkOrders'), Icons.assignment, const Color(0xFF14B8A6)),
      ('Open', _count('openWorkOrders'), Icons.pending_actions, const Color(0xFFEF4444)),
      ('Completed', _count('completedWorkOrders'), Icons.task_alt, const Color(0xFF10B981)),
    ];

    return RefreshIndicator(
      onRefresh: () async {
        // Trigger parent state reload
        final state = context.findAncestorStateOfType<State<StatefulWidget>>();
        if (state != null && state.mounted) {
          // call the load function from dashboard screen
          (state as dynamic).refreshDashboard();
        }
      },
      child: ListView(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
        children: [
          // Welcome Banner
          Container(
            padding: const EdgeInsets.all(18),
            decoration: BoxDecoration(
              gradient: LinearGradient(
                colors: isDark
                    ? [const Color(0xFF1F2937), const Color(0xFF111827)]
                    : [scheme.primaryContainer.withValues(alpha: .5), scheme.primaryContainer.withValues(alpha: .2)],
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
              ),
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: scheme.outlineVariant.withValues(alpha: .4)),
            ),
            child: Row(
              children: [
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'System Administrator',
                        style: TextStyle(
                          fontSize: 12,
                          fontWeight: FontWeight.bold,
                          color: scheme.primary,
                        ),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        'Hello, ${context.watch<AppState>().user?.name ?? 'Admin'}',
                        style: Theme.of(context).textTheme.titleLarge?.copyWith(
                              fontWeight: FontWeight.bold,
                            ),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        'You have full access to enterprise metrics and controls.',
                        style: TextStyle(fontSize: 12, color: scheme.onSurfaceVariant),
                      ),
                    ],
                  ),
                ),
                const SizedBox(width: 8),
                CircleAvatar(
                  radius: 24,
                  backgroundColor: scheme.primary.withValues(alpha: 0.1),
                  child: Icon(Icons.shield_rounded, color: scheme.primary, size: 28),
                ),
              ],
            ),
          ),
          const SizedBox(height: 20),

          // Quick Operations Row
          Text(
            'Quick Actions',
            style: Theme.of(context).textTheme.titleSmall?.copyWith(fontWeight: FontWeight.bold),
          ),
          const SizedBox(height: 8),
          SingleChildScrollView(
            scrollDirection: Axis.horizontal,
            child: Row(
              children: [
                _QuickActionBtn(
                  label: 'Add User',
                  icon: Icons.person_add_outlined,
                  color: const Color(0xFFF59E0B),
                  onTap: () => context.push('/users'),
                ),
                const SizedBox(width: 10),
                _QuickActionBtn(
                  label: 'New Asset',
                  icon: Icons.add_circle_outline_rounded,
                  color: const Color(0xFF8B5CF6),
                  onTap: () => context.push('/assets'),
                ),
                const SizedBox(width: 10),
                _QuickActionBtn(
                  label: 'New Job',
                  icon: Icons.assignment_turned_in_outlined,
                  color: const Color(0xFF3B82F6),
                  onTap: () => context.push('/work-orders'),
                ),
              ],
            ),
          ),
          const SizedBox(height: 24),

          Text(
            'Enterprise Metrics',
            style: Theme.of(context).textTheme.titleSmall?.copyWith(fontWeight: FontWeight.bold),
          ),
          const SizedBox(height: 8),
          GridView.count(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            crossAxisCount: MediaQuery.sizeOf(context).width > 520 ? 3 : 2,
            mainAxisSpacing: 8,
            crossAxisSpacing: 8,
            childAspectRatio: 1.55,
            children: [
              for (final item in counts)
                KpiCard(
                  label: item.$1,
                  value: item.$2,
                  icon: item.$3,
                  color: item.$4,
                ),
            ],
          ),
          const SizedBox(height: 20),
          DashboardStatusChart(statuses: data.statuses),
          const SizedBox(height: 20),
          RecentActivitiesList(records: data.recent),
          const SizedBox(height: 24),
        ],
      ),
    );
  }
}

class _QuickActionBtn extends StatelessWidget {
  const _QuickActionBtn({
    required this.label,
    required this.icon,
    required this.color,
    required this.onTap,
  });

  final String label;
  final IconData icon;
  final Color color;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(12),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
        decoration: BoxDecoration(
          color: color.withValues(alpha: isDark ? 0.15 : 0.08),
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: color.withValues(alpha: 0.3)),
        ),
        child: Row(
          children: [
            Icon(icon, color: color, size: 18),
            const SizedBox(width: 8),
            Text(
              label,
              style: TextStyle(
                fontWeight: FontWeight.bold,
                fontSize: 12,
                color: isDark ? color : color.withValues(alpha: 0.9),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
