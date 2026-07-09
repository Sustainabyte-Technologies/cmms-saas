import 'package:fl_chart/fl_chart.dart';
import 'package:flutter/material.dart';

import '../../../../core/models/api_record.dart';

class DashboardStatusChart extends StatelessWidget {
  const DashboardStatusChart({super.key, required this.statuses});

  final List<ApiRecord> statuses;

  Color _getStatusColor(String status, ColorScheme scheme) {
    switch (status.toUpperCase()) {
      case 'IN_PROGRESS':
      case 'IN PROGRESS':
        return const Color(0xFFA855F7); // Purple
      case 'COMPLETED':
      case 'CLOSED':
        return const Color(0xFF22C55E); // Green
      case 'ASSIGNED':
      case 'ACCEPTED':
        return const Color(0xFF3B82F6); // Blue
      case 'OPEN':
        return const Color(0xFFF59E0B); // Amber
      case 'UNDER_REVIEW':
      case 'UNDER REVIEW':
        return const Color(0xFFF97316); // Orange
      default:
        return scheme.outline;
    }
  }

  @override
  Widget build(BuildContext context) {
    final scheme = Theme.of(context).colorScheme;
    final isDark = Theme.of(context).brightness == Brightness.dark;

    final List<PieChartSectionData> sections = [];

    if (statuses.isEmpty) {
      sections.add(
        PieChartSectionData(
          value: 1,
          title: 'No Data',
          color: scheme.outlineVariant,
          radius: 50,
          titleStyle: TextStyle(
            fontSize: 12,
            fontWeight: FontWeight.bold,
            color: scheme.onSurface,
          ),
        ),
      );
    } else {
      for (final record in statuses) {
        final countVal = double.tryParse(
              record.value('count', fallback: record.value('value', fallback: '0')),
            ) ??
            0;

        if (countVal <= 0) continue;

        final statusName = record.value('status', fallback: record.value('name', fallback: 'WO'));
        final color = _getStatusColor(statusName, scheme);

        sections.add(
          PieChartSectionData(
            value: countVal,
            title: '${countVal.toInt()}',
            color: color,
            radius: 55,
            titleStyle: const TextStyle(
              fontSize: 13,
              fontWeight: FontWeight.bold,
              color: Colors.white,
            ),
            badgeWidget: _Badge(
              statusName.replaceAll('_', ' '),
              color: color,
              borderColor: isDark ? const Color(0xFF1F2937) : Colors.white,
            ),
            badgePositionPercentageOffset: .98,
          ),
        );
      }
    }

    // In case all counts were 0
    if (sections.isEmpty) {
      sections.add(
        PieChartSectionData(
          value: 1,
          title: 'No Active WOs',
          color: scheme.outlineVariant,
          radius: 50,
          titleStyle: TextStyle(
            fontSize: 12,
            fontWeight: FontWeight.bold,
            color: scheme.onSurface,
          ),
        ),
      );
    }

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
            Text(
              'Work Order Status Distribution',
              style: Theme.of(context).textTheme.titleMedium?.copyWith(
                    fontWeight: FontWeight.bold,
                  ),
            ),
            const SizedBox(height: 4),
            Text(
              'Real-time breakdown of work orders',
              style: Theme.of(context).textTheme.bodySmall?.copyWith(
                    color: scheme.onSurfaceVariant,
                  ),
            ),
            const SizedBox(height: 24),
            SizedBox(
              height: 200,
              child: PieChart(
                PieChartData(
                  sections: sections,
                  centerSpaceRadius: 40,
                  sectionsSpace: 2,
                  borderData: FlBorderData(show: false),
                ),
              ),
            ),
            const SizedBox(height: 16),
            // Custom Legend
            Wrap(
              spacing: 12,
              runSpacing: 8,
              children: statuses.map((record) {
                final statusName = record.value('status', fallback: record.value('name', fallback: 'WO'));
                final color = _getStatusColor(statusName, scheme);
                return Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Container(
                      width: 10,
                      height: 10,
                      decoration: BoxDecoration(
                        color: color,
                        shape: BoxShape.circle,
                      ),
                    ),
                    const SizedBox(width: 6),
                    Text(
                      statusName.replaceAll('_', ' '),
                      style: TextStyle(
                        fontSize: 11,
                        color: scheme.onSurface,
                        fontWeight: FontWeight.w500,
                      ),
                    ),
                  ],
                );
              }).toList(),
            ),
          ],
        ),
      ),
    );
  }
}

class _Badge extends StatelessWidget {
  const _Badge(this.text, {required this.color, required this.borderColor});
  final String text;
  final Color color;
  final Color borderColor;

  @override
  Widget build(BuildContext context) {
    return AnimatedContainer(
      duration: const Duration(milliseconds: 300),
      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
      decoration: BoxDecoration(
        color: color,
        borderRadius: BorderRadius.circular(4),
        border: Border.all(color: borderColor, width: 1.5),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: .15),
            offset: const Offset(0, 1),
            blurRadius: 2,
          ),
        ],
      ),
      child: Text(
        text,
        style: const TextStyle(
          fontSize: 9,
          fontWeight: FontWeight.bold,
          color: Colors.white,
        ),
      ),
    );
  }
}
