import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';

import '../../../../core/providers/app_state.dart';
import '../../../../core/widgets/data_state_widgets.dart';
import '../dashboard_screen.dart';

class SiteInchargeDashboard extends StatelessWidget {
  const SiteInchargeDashboard({super.key, required this.data});

  final DashboardData data;

  Widget _buildStatusChip(String status) {
    Color bg;
    switch (status.toUpperCase()) {
      case 'IN_PROGRESS':
        bg = const Color(0xFFA855F7);
        break;
      case 'COMPLETED':
        bg = const Color(0xFF22C55E);
        break;
      case 'ASSIGNED':
        bg = const Color(0xFF3B82F6);
        break;
      case 'OPEN':
        bg = const Color(0xFFF59E0B);
        break;
      default:
        bg = Colors.grey;
    }

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
      decoration: BoxDecoration(
        color: bg.withValues(alpha: 0.1),
        borderRadius: BorderRadius.circular(4),
        border: Border.all(color: bg.withValues(alpha: 0.3)),
      ),
      child: Text(
        status.replaceAll('_', ' '),
        style: TextStyle(
          color: bg,
          fontWeight: FontWeight.bold,
          fontSize: 9,
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final scheme = Theme.of(context).colorScheme;
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final siteOrders = data.workOrders;

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
          // Header Card
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
                        'Site Incharge Dashboard',
                        style: TextStyle(
                          fontSize: 12,
                          fontWeight: FontWeight.bold,
                          color: scheme.primary,
                        ),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        'Hello, ${context.watch<AppState>().user?.name ?? 'Site Incharge'}',
                        style: Theme.of(context).textTheme.titleLarge?.copyWith(
                              fontWeight: FontWeight.bold,
                            ),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        'Manage site work orders, track status, and coordinate with supervisors.',
                        style: TextStyle(fontSize: 12, color: scheme.onSurfaceVariant),
                      ),
                    ],
                  ),
                ),
                const SizedBox(width: 8),
                CircleAvatar(
                  radius: 24,
                  backgroundColor: scheme.primary.withValues(alpha: 0.1),
                  child: Icon(Icons.location_city_rounded, color: scheme.primary, size: 28),
                ),
              ],
            ),
          ),
          const SizedBox(height: 20),

          // Site KPIs
          Text(
            'Site Overview',
            style: Theme.of(context).textTheme.titleSmall?.copyWith(fontWeight: FontWeight.bold),
          ),
          const SizedBox(height: 8),
          GridView.count(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            crossAxisCount: 2,
            mainAxisSpacing: 8,
            crossAxisSpacing: 8,
            childAspectRatio: 1.55,
            children: [
              KpiCard(
                label: 'Site Work Orders',
                value: '${siteOrders.length}',
                icon: Icons.assignment,
                color: scheme.primary,
              ),
              KpiCard(
                label: 'Completed',
                value: '${siteOrders.where((r) => ['COMPLETED', 'CLOSED'].contains(r.value('status').toUpperCase())).length}',
                icon: Icons.task_alt,
                color: const Color(0xFF10B981),
              ),
              KpiCard(
                label: 'Assigned',
                value: '${siteOrders.where((r) => r.value('status').toUpperCase() == 'ASSIGNED').length}',
                icon: Icons.engineering,
                color: const Color(0xFF3B82F6),
              ),
              KpiCard(
                label: 'In Progress',
                value: '${siteOrders.where((r) => r.value('status').toUpperCase() == 'IN_PROGRESS').length}',
                icon: Icons.timelapse,
                color: const Color(0xFFA855F7),
              ),
            ],
          ),
          const SizedBox(height: 24),

          // Track Site Progress List
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
                        'Track Site Progress',
                        style: TextStyle(fontWeight: FontWeight.bold, fontSize: 15, color: scheme.onSurface),
                      ),
                      Icon(Icons.query_stats_rounded, color: scheme.primary, size: 20),
                    ],
                  ),
                  const Divider(height: 20),
                  if (siteOrders.isEmpty)
                    const Padding(
                      padding: EdgeInsets.symmetric(vertical: 24),
                      child: Center(
                        child: Text(
                          'No work orders active on this site.',
                          style: TextStyle(color: Colors.grey, fontSize: 13),
                        ),
                      ),
                    )
                  else
                    ...siteOrders.take(8).map((order) {
                      return ListTile(
                        contentPadding: EdgeInsets.zero,
                        dense: true,
                        title: Text(
                          order.value('title'),
                          style: const TextStyle(fontWeight: FontWeight.bold),
                        ),
                        subtitle: Text(
                          '${order.value('workOrderNumber')} • Priority: ${order.value('priority')}',
                          style: const TextStyle(fontSize: 11),
                        ),
                        trailing: _buildStatusChip(order.value('status')),
                        onTap: () => context.push('/work-orders'),
                      );
                    }),
                ],
              ),
            ),
          ),
          const SizedBox(height: 24),
        ],
      ),
    );
  }
}
