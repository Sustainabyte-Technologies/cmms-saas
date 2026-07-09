import 'package:flutter/material.dart';

import '../../../../core/models/api_record.dart';

class RecentActivitiesList extends StatelessWidget {
  const RecentActivitiesList({super.key, required this.records});

  final List<ApiRecord> records;

  IconData _getActivityIcon(String action) {
    final act = action.toLowerCase();
    if (act.contains('create') || act.contains('added')) {
      return Icons.add_circle_outline_rounded;
    }
    if (act.contains('complete') || act.contains('resolve') || act.contains('finish')) {
      return Icons.check_circle_outline_rounded;
    }
    if (act.contains('assign') || act.contains('transfer')) {
      return Icons.assignment_ind_outlined;
    }
    if (act.contains('update') || act.contains('mod') || act.contains('edit')) {
      return Icons.edit_note_rounded;
    }
    if (act.contains('delete') || act.contains('remove')) {
      return Icons.delete_outline_rounded;
    }
    if (act.contains('hold') || act.contains('pause')) {
      return Icons.pause_circle_outline_rounded;
    }
    if (act.contains('reject') || act.contains('cancel')) {
      return Icons.cancel_outlined;
    }
    return Icons.history_rounded;
  }

  Color _getActivityColor(String action, ColorScheme scheme) {
    final act = action.toLowerCase();
    if (act.contains('create') || act.contains('added')) {
      return scheme.primary;
    }
    if (act.contains('complete') || act.contains('resolve') || act.contains('finish')) {
      return const Color(0xFF22C55E); // Green
    }
    if (act.contains('assign')) {
      return const Color(0xFF3B82F6); // Blue
    }
    if (act.contains('update')) {
      return const Color(0xFFF59E0B); // Amber
    }
    if (act.contains('delete') || act.contains('reject')) {
      return scheme.error;
    }
    return scheme.secondary;
  }

  @override
  Widget build(BuildContext context) {
    final scheme = Theme.of(context).colorScheme;
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Card(
      elevation: 0,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(16),
        side: BorderSide(color: scheme.outlineVariant.withValues(alpha: 0.5)),
      ),
      color: isDark ? const Color(0xFF111827) : Colors.white,
      child: Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  'Recent Activities',
                  style: Theme.of(context).textTheme.titleMedium?.copyWith(
                        fontWeight: FontWeight.bold,
                      ),
                ),
                Icon(
                  Icons.timeline_rounded,
                  color: scheme.primary.withValues(alpha: 0.7),
                  size: 20,
                ),
              ],
            ),
            const SizedBox(height: 4),
            Text(
              'Real-time operations log',
              style: Theme.of(context).textTheme.bodySmall?.copyWith(
                    color: scheme.onSurfaceVariant,
                  ),
            ),
            const Divider(height: 24),
            if (records.isEmpty)
              Padding(
                padding: const EdgeInsets.symmetric(vertical: 24),
                child: Center(
                  child: Column(
                    children: [
                      Icon(Icons.history_toggle_off_rounded, color: scheme.outline, size: 36),
                      const SizedBox(height: 8),
                      Text(
                        'No recent activity logs found.',
                        style: TextStyle(color: scheme.onSurfaceVariant, fontSize: 13),
                      ),
                    ],
                  ),
                ),
              )
            else
              ListView.separated(
                shrinkWrap: true,
                physics: const NeverScrollableScrollPhysics(),
                itemCount: records.take(6).length,
                separatorBuilder: (context, index) => const Divider(height: 16),
                itemBuilder: (context, index) {
                  final record = records[index];
                  final action = record.value('action', fallback: record.value('title', fallback: 'System Log'));
                  final date = record.value('createdAt', fallback: record.value('date', fallback: 'Just now'));
                  final detail = record.value('details', fallback: record.value('module', fallback: 'System'));

                  final iconColor = _getActivityColor(action, scheme);
                  final iconData = _getActivityIcon(action);

                  return Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Container(
                        padding: const EdgeInsets.all(8),
                        decoration: BoxDecoration(
                          color: iconColor.withValues(alpha: 0.1),
                          shape: BoxShape.circle,
                        ),
                        child: Icon(
                          iconData,
                          color: iconColor,
                          size: 18,
                        ),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              action,
                              style: const TextStyle(
                                fontSize: 13,
                                fontWeight: FontWeight.w600,
                              ),
                            ),
                            const SizedBox(height: 2),
                            Row(
                              children: [
                                if (detail.isNotEmpty) ...[
                                  Text(
                                    detail,
                                    style: TextStyle(
                                      fontSize: 11,
                                      fontWeight: FontWeight.w500,
                                      color: scheme.primary,
                                    ),
                                  ),
                                  const SizedBox(width: 6),
                                  Text(
                                    '•',
                                    style: TextStyle(
                                      fontSize: 11,
                                      color: scheme.onSurfaceVariant.withValues(alpha: 0.5),
                                    ),
                                  ),
                                  const SizedBox(width: 6),
                                ],
                                Text(
                                  date,
                                  style: TextStyle(
                                    fontSize: 11,
                                    color: scheme.onSurfaceVariant,
                                  ),
                                ),
                              ],
                            ),
                          ],
                        ),
                      ),
                    ],
                  );
                },
              ),
          ],
        ),
      ),
    );
  }
}
