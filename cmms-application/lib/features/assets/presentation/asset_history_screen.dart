import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '../../../core/widgets/cmms_scaffold.dart';

class AssetHistoryScreen extends StatelessWidget {
  const AssetHistoryScreen({
    super.key,
    required this.asset,
    required this.workOrders,
    required this.pmSchedules,
  });

  final Map<String, dynamic> asset;
  final List<dynamic> workOrders;
  final List<dynamic> pmSchedules;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final timelineEvents = _buildTimelineEvents();

    return CmmsScaffold(
      title: 'Asset History',
      child: Column(
        children: [
          // Brief header summary
          Container(
            padding: const EdgeInsets.all(16),
            color: theme.colorScheme.primaryContainer.withAlpha(50),
            child: Row(
              children: [
                CircleAvatar(
                  backgroundColor: theme.colorScheme.primary,
                  foregroundColor: theme.colorScheme.onPrimary,
                  child: const Icon(Icons.history),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        asset['assetName']?.toString() ?? 'Asset',
                        style: theme.textTheme.titleMedium?.copyWith(
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      Text(
                        'Code: ${asset['assetCode']?.toString() ?? '—'}',
                        style: theme.textTheme.bodySmall?.copyWith(
                          color: theme.colorScheme.secondary,
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
          const Divider(height: 1),

          // Timeline view
          Expanded(
            child: timelineEvents.isEmpty
                ? const Center(
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(Icons.history_toggle_off, size: 48, color: Colors.grey),
                        SizedBox(height: 12),
                        Text(
                          'No Maintenance History',
                          style: TextStyle(fontWeight: FontWeight.w500, color: Colors.grey),
                        ),
                      ],
                    ),
                  )
                : ListView.builder(
                    padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 20),
                    itemCount: timelineEvents.length,
                    itemBuilder: (context, index) {
                      final event = timelineEvents[index];
                      final isLast = index == timelineEvents.length - 1;
                      return _buildTimelineNode(context, event, isLast);
                    },
                  ),
          ),
        ],
      ),
    );
  }

  // Combine actual and fallback seed data into chronological events
  List<_HistoryEvent> _buildTimelineEvents() {
    final List<_HistoryEvent> events = [];

    // 1. Process actual work orders
    for (final wo in workOrders) {
      if (wo['assetId'] == asset['id'] || (wo['asset'] is Map && wo['asset']['id'] == asset['id'])) {
        final dateStr = wo['updatedAt']?.toString() ?? wo['createdAt']?.toString() ?? '';
        final date = DateTime.tryParse(dateStr) ?? DateTime.now();
        final status = wo['status']?.toString() ?? 'COMPLETED';
        final number = wo['workOrderNumber']?.toString() ?? 'WO';
        final title = wo['title']?.toString() ?? 'Work Order';
        final type = wo['workType']?.toString() ?? 'REACTIVE';

        events.add(_HistoryEvent(
          title: '$number: $title',
          description: 'Type: $type | Status: $status',
          date: date,
          eventType: status.toUpperCase() == 'CLOSED' || status.toUpperCase() == 'COMPLETED'
              ? _EventType.workOrderCompleted
              : _EventType.workOrderActive,
          meta: wo,
        ));
      }
    }

    // 2. Process PM Schedules
    for (final pm in pmSchedules) {
      if (pm['assetId'] == asset['id']) {
        final dateStr = pm['updatedAt']?.toString() ?? pm['createdAt']?.toString() ?? '';
        final date = DateTime.tryParse(dateStr) ?? DateTime.now().subtract(const Duration(days: 30));
        final title = pm['title']?.toString() ?? 'Preventive Maintenance';
        final freq = pm['frequency']?.toString() ?? 'Monthly';

        events.add(_HistoryEvent(
          title: 'PM: $title',
          description: 'Scheduled recurrence: $freq',
          date: date,
          eventType: _EventType.pmCompleted,
          meta: pm,
        ));
      }
    }

    // 3. Fallback mock history if no real history exists (as requested by prompt)
    if (events.isEmpty) {
      final now = DateTime.now();
      events.addAll([
        _HistoryEvent(
          title: 'Asset Registered',
          description: 'Asset initialized in the database by Administrator',
          date: now.subtract(const Duration(days: 90)),
          eventType: _EventType.systemActivity,
        ),
        _HistoryEvent(
          title: 'Initial Installation & Testing',
          description: 'Commissioning work completed successfully',
          date: now.subtract(const Duration(days: 88)),
          eventType: _EventType.pmCompleted,
        ),
        _HistoryEvent(
          title: 'WO-2041: Periodic Calibrations',
          description: 'Completed calibration of sensor nodes',
          date: now.subtract(const Duration(days: 60)),
          eventType: _EventType.workOrderCompleted,
        ),
        _HistoryEvent(
          title: 'Breakdown Reported: High Temperature Spike',
          description: 'System triggered alert. Ref: BRK-9023',
          date: now.subtract(const Duration(days: 45)),
          eventType: _EventType.breakdown,
        ),
        _HistoryEvent(
          title: 'WO-3142: Fan Module Replacement',
          description: 'Replaced faulty cooling fans. Resolved thermal spike issue.',
          date: now.subtract(const Duration(days: 44)),
          eventType: _EventType.workOrderCompleted,
        ),
        _HistoryEvent(
          title: 'PM: General Inspection checklist',
          description: 'Routine maintenance: Checked fluid levels and connections',
          date: now.subtract(const Duration(days: 15)),
          eventType: _EventType.pmCompleted,
        ),
      ]);
    }

    // Sort by date descending
    events.sort((a, b) => b.date.compareTo(a.date));
    return events;
  }

  Widget _buildTimelineNode(BuildContext context, _HistoryEvent event, bool isLast) {
    final theme = Theme.of(context);
    final dateFormatted = DateFormat('dd MMM yyyy, hh:mm a').format(event.date);

    return IntrinsicHeight(
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          // Left Line & Dot Column
          Column(
            children: [
              Container(
                width: 14,
                height: 14,
                decoration: BoxDecoration(
                  color: _getEventColor(event.eventType, theme),
                  shape: BoxShape.circle,
                  border: Border.all(color: theme.scaffoldBackgroundColor, width: 2),
                ),
              ),
              if (!isLast)
                Expanded(
                  child: Container(
                    width: 2,
                    color: Colors.grey.shade300,
                  ),
                ),
            ],
          ),
          const SizedBox(width: 16),

          // Content Column
          Expanded(
            child: Padding(
              padding: const EdgeInsets.only(bottom: 20),
              child: Card(
                elevation: 0.5,
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(12),
                  side: BorderSide(color: Colors.grey.shade200),
                ),
                child: Padding(
                  padding: const EdgeInsets.all(12.0),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          _buildEventBadge(event.eventType, theme),
                          Text(
                            dateFormatted,
                            style: theme.textTheme.bodySmall?.copyWith(
                              color: Colors.grey.shade600,
                              fontSize: 10,
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 6),
                      Text(
                        event.title,
                        style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        event.description,
                        style: TextStyle(color: Colors.grey.shade600, fontSize: 12),
                      ),
                    ],
                  ),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Color _getEventColor(_EventType type, ThemeData theme) {
    switch (type) {
      case _EventType.workOrderActive:
        return Colors.purple;
      case _EventType.workOrderCompleted:
        return Colors.green;
      case _EventType.pmCompleted:
        return theme.colorScheme.primary;
      case _EventType.breakdown:
        return Colors.red;
      case _EventType.systemActivity:
        return Colors.grey;
    }
  }

  Widget _buildEventBadge(_EventType type, ThemeData theme) {
    String text = '';
    Color color = Colors.grey;

    switch (type) {
      case _EventType.workOrderActive:
        text = 'Active WO';
        color = Colors.purple.shade50;
        break;
      case _EventType.workOrderCompleted:
        text = 'Completed WO';
        color = Colors.green.shade50;
        break;
      case _EventType.pmCompleted:
        text = 'Routine PM';
        color = theme.colorScheme.primaryContainer;
        break;
      case _EventType.breakdown:
        text = 'Breakdown';
        color = Colors.red.shade50;
        break;
      case _EventType.systemActivity:
        text = 'System Log';
        color = Colors.grey.shade100;
        break;
    }

    final textColor = type == _EventType.pmCompleted
        ? theme.colorScheme.onPrimaryContainer
        : type == _EventType.workOrderActive
            ? Colors.purple.shade700
            : type == _EventType.workOrderCompleted
                ? Colors.green.shade700
                : type == _EventType.breakdown
                    ? Colors.red.shade700
                    : Colors.grey.shade700;

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
      decoration: BoxDecoration(
        color: color,
        borderRadius: BorderRadius.circular(6),
      ),
      child: Text(
        text,
        style: TextStyle(
          fontSize: 9,
          fontWeight: FontWeight.bold,
          color: textColor,
        ),
      ),
    );
  }
}

enum _EventType {
  workOrderActive,
  workOrderCompleted,
  pmCompleted,
  breakdown,
  systemActivity,
}

class _HistoryEvent {
  const _HistoryEvent({
    required this.title,
    required this.description,
    required this.date,
    required this.eventType,
    this.meta,
  });

  final String title;
  final String description;
  final DateTime date;
  final _EventType eventType;
  final dynamic meta;
}
