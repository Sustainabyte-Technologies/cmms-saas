import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';

import '../../../../core/providers/app_state.dart';
import '../../../../core/widgets/data_state_widgets.dart';
import '../dashboard_screen.dart';
import 'dashboard_charts.dart';
import 'recent_activities.dart';

class ManagerDashboard extends StatelessWidget {
  const ManagerDashboard({super.key, required this.data});

  final DashboardData data;

  String _count(String key) {
    final overview = data.overview;
    return (overview[key] ??
            overview[key.replaceFirst('total', '').toLowerCase()] ??
            0)
        .toString();
  }

  Widget _buildPriorityChip(String priority) {
    Color color;
    switch (priority.toUpperCase()) {
      case 'CRITICAL':
        color = Colors.red.shade600;
        break;
      case 'HIGH':
        color = Colors.orange.shade700;
        break;
      case 'MEDIUM':
        color = Colors.blue.shade600;
        break;
      default:
        color = Colors.green.shade600;
    }
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.1),
        borderRadius: BorderRadius.circular(4),
        border: Border.all(color: color.withValues(alpha: 0.3)),
      ),
      child: Text(
        priority,
        style: TextStyle(
          fontSize: 9,
          color: color,
          fontWeight: FontWeight.bold,
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final scheme = Theme.of(context).colorScheme;
    final isDark = Theme.of(context).brightness == Brightness.dark;

    final counts = [
      ('Work Orders', _count('totalWorkOrders'), Icons.assignment, const Color(0xFF14B8A6)),
      ('Open', _count('openWorkOrders'), Icons.pending_actions, const Color(0xFFEF4444)),
      ('Completed', _count('completedWorkOrders'), Icons.task_alt, const Color(0xFF10B981)),
      ('Total Assets', _count('totalAssets'), Icons.precision_manufacturing, const Color(0xFF8B5CF6)),
      ('Team Users', _count('totalUsers'), Icons.people, const Color(0xFFF59E0B)),
      ('Sites Managed', _count('totalSites'), Icons.location_city, const Color(0xFF3B82F6)),
    ];

    // Get critical/high priority work orders that are open or in progress
    final pendingWOs = data.workOrders.where((wo) {
      final status = wo.value('status').toUpperCase();
      final priority = wo.value('priority').toUpperCase();
      return ['OPEN', 'ASSIGNED', 'IN_PROGRESS'].contains(status) &&
          ['CRITICAL', 'HIGH'].contains(priority);
    }).toList();

    return RefreshIndicator(
      onRefresh: () async {
        final state = context.findAncestorStateOfType<State<StatefulWidget>>();
        if (state != null && state.mounted) {
          (state as dynamic).refreshDashboard();
        }
      },
      child: ListView(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
        children: [
          // Manager Welcome Card
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
                        'Maintenance Operations Manager',
                        style: TextStyle(
                          fontSize: 12,
                          fontWeight: FontWeight.bold,
                          color: scheme.primary,
                        ),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        'Hello, ${context.watch<AppState>().user?.name ?? 'Manager'}',
                        style: Theme.of(context).textTheme.titleLarge?.copyWith(
                              fontWeight: FontWeight.bold,
                            ),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        'Oversee site maintenance, plan schedules, and manage team allocation.',
                        style: TextStyle(fontSize: 12, color: scheme.onSurfaceVariant),
                      ),
                    ],
                  ),
                ),
                const SizedBox(width: 8),
                CircleAvatar(
                  radius: 24,
                  backgroundColor: scheme.primary.withValues(alpha: 0.1),
                  child: Icon(Icons.manage_accounts_rounded, color: scheme.primary, size: 28),
                ),
              ],
            ),
          ),
          const SizedBox(height: 20),

          // Operations Quick Actions
          Text(
            'Operations Control',
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
                  label: 'Create Job',
                  icon: Icons.add_task_rounded,
                  color: const Color(0xFF3B82F6),
                  onTap: () => context.push('/work-orders'),
                ),
                const SizedBox(width: 10),
                _QuickActionBtn(
                  label: 'PM Schedule',
                  icon: Icons.calendar_month_outlined,
                  color: const Color(0xFF10B981),
                  onTap: () => context.push('/preventive'),
                ),
              ],
            ),
          ),
          const SizedBox(height: 24),

          // Maintenance KPIs
          Text(
            'Maintenance Metrics',
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

          // Urgent Work Orders
          Card(
            elevation: 0,
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(16),
              side: BorderSide(color: scheme.outlineVariant.withValues(alpha: 0.5)),
            ),
            color: isDark ? const Color(0xFF111827) : Colors.white,
            child: Padding(
              padding: const EdgeInsets.all(18),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        'Urgent Work Orders',
                        style: TextStyle(fontWeight: FontWeight.bold, fontSize: 15, color: scheme.onSurface),
                      ),
                      Icon(Icons.warning_amber_rounded, color: Colors.orange.shade700, size: 20),
                    ],
                  ),
                  const Divider(height: 20),
                  if (pendingWOs.isEmpty)
                    const Padding(
                      padding: EdgeInsets.symmetric(vertical: 16),
                      child: Center(
                        child: Text(
                          'No urgent pending work orders.',
                          style: TextStyle(color: Colors.grey, fontSize: 13),
                        ),
                      ),
                    )
                  else
                    ...pendingWOs.take(4).map((wo) {
                      return ListTile(
                        contentPadding: EdgeInsets.zero,
                        dense: true,
                        title: Text(
                          wo.value('title'),
                          style: const TextStyle(fontWeight: FontWeight.bold),
                        ),
                        subtitle: Text(
                          '${wo.value('workOrderNumber')} • ${wo.value('status')}',
                          style: const TextStyle(fontSize: 11),
                        ),
                        trailing: _buildPriorityChip(wo.value('priority')),
                        onTap: () => context.push('/work-orders'),
                      );
                    }),
                ],
              ),
            ),
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
