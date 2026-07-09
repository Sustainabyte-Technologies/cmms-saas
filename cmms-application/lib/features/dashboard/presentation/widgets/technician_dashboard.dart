import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:provider/provider.dart';

import '../../../../core/models/api_record.dart';
import '../../../../core/providers/app_state.dart';
import '../../../work_orders/presentation/work_order_detail_screen.dart';
import '../dashboard_screen.dart';

class TechnicianDashboard extends StatefulWidget {
  const TechnicianDashboard({super.key, required this.data, this.onRefresh});

  final DashboardData data;
  final VoidCallback? onRefresh;

  @override
  State<TechnicianDashboard> createState() => _TechnicianDashboardState();
}

class _TechnicianDashboardState extends State<TechnicianDashboard> {
  final _searchController = TextEditingController();
  String _searchQuery = '';
  String? _statusFilter;
  bool _showAllActive = false;
  bool _showAllCompleted = false;

  @override
  void initState() {
    super.initState();
    _searchController.addListener(() {
      setState(() {
        _searchQuery = _searchController.text.trim().toLowerCase();
      });
    });
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  String _formatDate(String isoString) {
    if (isoString.isEmpty) return 'N/A';
    try {
      final date = DateTime.parse(isoString);
      return DateFormat('dd MMM yy').format(date);
    } catch (_) {
      return isoString;
    }
  }

  String _getJobImageUrl(BuildContext context, ApiRecord job) {
    final baseUrl = context.read<AppState>().apiClient.baseUrl;
    final attachments = job.data['attachments'];
    if (attachments is List && attachments.isNotEmpty) {
      for (final att in attachments) {
        if (att is Map) {
          final id = att['id']?.toString() ?? '';
          if (id.isNotEmpty) {
            return '$baseUrl/work-orders/attachments/$id';
          }
        }
      }
    }

    final assetMap = job.data['asset'];
    if (assetMap is Map) {
      final id = assetMap['id']?.toString() ?? '';
      if (id.isNotEmpty) {
        return '$baseUrl/assets/$id/image';
      }
    }

    final title = job.value('title').toLowerCase();
    if (title.contains('conveyor') || title.contains('belt')) {
      return 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=150';
    }
    if (title.contains('hvac') ||
        title.contains('air') ||
        title.contains('ventilation')) {
      return 'https://images.unsplash.com/photo-1585338107529-13afc5f02586?w=150';
    }
    if (title.contains('electrical') ||
        title.contains('panel') ||
        title.contains('safety')) {
      return 'https://images.unsplash.com/photo-1471864190281-a93a3070b6de?w=150';
    }
    return 'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=150';
  }

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
      case 'UNDER_REVIEW':
      case 'UNDER REVIEW':
        bg = const Color(0xFFF97316);
        break;
      case 'REOPENED':
        bg = Colors.red.shade600;
        break;
      case 'CLOSED':
        bg = Colors.grey.shade600;
        break;
      default:
        bg = Colors.grey;
    }

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
      decoration: BoxDecoration(
        color: bg,
        borderRadius: BorderRadius.circular(4),
      ),
      child: Text(
        status.replaceAll('_', ' '),
        style: const TextStyle(
          color: Colors.white,
          fontWeight: FontWeight.bold,
          fontSize: 10,
        ),
      ),
    );
  }

  void _handleMenuAction(BuildContext context, ApiRecord job, String action) {
    if (action == 'view') {
      Navigator.push(
        context,
        MaterialPageRoute(
          builder: (context) => WorkOrderDetailScreen(workOrder: job),
        ),
      ).then((_) => setState(() {}));
    } else if (action == 'checklist') {
      showModalBottomSheet(
        context: context,
        isScrollControlled: true,
        builder: (context) => _ChecklistBottomSheet(job: job),
      ).then((_) => setState(() {}));
    } else if (action == 'history') {
      showModalBottomSheet(
        context: context,
        builder: (context) => _HistoryBottomSheet(job: job),
      );
    } else if (action == 'pdf') {
      _simulatePdfDownload(context, job);
    } else if (action == 'status') {
      showDialog<bool>(
        context: context,
        builder: (context) => _UpdateStatusDialog(job: job),
      ).then((success) {
        if (success == true) {
          if (context.mounted) {
            ScaffoldMessenger.of(context).showSnackBar(
              const SnackBar(
                content: Text('Status updated successfully!'),
                behavior: SnackBarBehavior.floating,
                duration: Duration(seconds: 2),
              ),
            );
          }
          widget.onRefresh?.call();
        }
      });
    }
  }

  void _simulatePdfDownload(BuildContext context, ApiRecord job) {
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (context) {
        Future.delayed(const Duration(milliseconds: 1500), () {
          Navigator.pop(context);
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text(
                'Download complete: ${job.value('workOrderNumber')}.pdf',
              ),
            ),
          );
        });
        return const AlertDialog(
          content: Row(
            children: [
              CircularProgressIndicator(),
              SizedBox(width: 20),
              Text('Generating PDF document...'),
            ],
          ),
        );
      },
    );
  }

  Widget _buildJobCard(BuildContext context, ApiRecord job) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;

    final number = job.value('workOrderNumber');
    final status = job.value('status');
    final title = job.value('title');
    final assetCode = job.nested(
      'asset',
      'assetCode',
      fallback: job.value('assetId'),
    );
    final assetName = job.nested('asset', 'assetName', fallback: 'Unknown');
    final dateStr = job.value('dueDate').isNotEmpty
        ? job.value('dueDate')
        : job.value('createdAt');

    return Card(
      elevation: 0,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(8),
        side: BorderSide(
          color: isDark ? Colors.grey.shade800 : Colors.grey.shade200,
        ),
      ),
      color: isDark ? const Color(0xFF161E2E) : Colors.white,
      child: Padding(
        padding: const EdgeInsets.all(12),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            ClipRRect(
              borderRadius: BorderRadius.circular(6),
              child: Image.network(
                _getJobImageUrl(context, job),
                width: 72,
                height: 72,
                fit: BoxFit.cover,
                errorBuilder: (context, error, stackTrace) {
                  return Container(
                    width: 72,
                    height: 72,
                    color: isDark ? Colors.grey.shade800 : Colors.grey.shade200,
                    child: Icon(
                      Icons.image_not_supported_outlined,
                      color: isDark ? Colors.grey.shade600 : Colors.grey.shade400,
                      size: 24,
                    ),
                  );
                },
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Text(
                        number,
                        style: const TextStyle(
                          fontWeight: FontWeight.bold,
                          fontSize: 14,
                        ),
                      ),
                      const SizedBox(width: 8),
                      _buildStatusChip(status),
                      const Spacer(),
                      PopupMenuButton<String>(
                        padding: EdgeInsets.zero,
                        icon: const Icon(Icons.more_vert, size: 20),
                        onSelected: (value) =>
                            _handleMenuAction(context, job, value),
                        itemBuilder: (context) {
                          final isUnderReview = status.toUpperCase() == 'UNDER_REVIEW' || status.toUpperCase() == 'UNDER REVIEW';
                          return [
                            const PopupMenuItem(
                              value: 'view',
                              child: Row(
                                children: [
                                  Icon(Icons.visibility_outlined, size: 18),
                                  SizedBox(width: 8),
                                  Text('View'),
                                ],
                              ),
                            ),
                            if (!isUnderReview) ...[
                              const PopupMenuItem(
                                value: 'checklist',
                                child: Row(
                                  children: [
                                    Icon(Icons.playlist_add_check, size: 18),
                                    SizedBox(width: 8),
                                    Text('Checklist'),
                                  ],
                                ),
                              ),
                            ],
                            const PopupMenuItem(
                              value: 'history',
                              child: Row(
                                children: [
                                  Icon(Icons.history, size: 18),
                                  SizedBox(width: 8),
                                  Text('History'),
                                ],
                              ),
                            ),
                            if (!isUnderReview) ...[
                              const PopupMenuItem(
                                value: 'status',
                                child: Row(
                                  children: [
                                    Icon(Icons.edit_note, size: 18),
                                    SizedBox(width: 8),
                                    Text('Update Status'),
                                  ],
                                ),
                              ),
                            ],
                            const PopupMenuItem(
                              value: 'pdf',
                              child: Row(
                                children: [
                                  Icon(Icons.download, size: 18),
                                  SizedBox(width: 8),
                                  Text('Download as PDF'),
                                ],
                              ),
                            ),
                          ];
                        },
                      ),
                    ],
                  ),
                  const SizedBox(height: 4),
                  Text(
                    'Title: $title',
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    style: TextStyle(
                      fontSize: 12,
                      color: isDark ? Colors.grey.shade400 : Colors.black87,
                    ),
                  ),
                  const SizedBox(height: 2),
                  Text(
                    'Asset: $assetCode | $assetName',
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    style: TextStyle(
                      fontSize: 12,
                      color: isDark ? Colors.grey.shade400 : Colors.black54,
                    ),
                  ),
                  const SizedBox(height: 2),
                  Text(
                    'Date: ${_formatDate(dateStr)}',
                    style: TextStyle(
                      fontSize: 12,
                      color: isDark ? Colors.grey.shade400 : Colors.black54,
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;
    final user = context.watch<AppState>().user;

    final myWorkOrders = widget.data.workOrders
        .where((r) => r.value('assignedTechnicianId') == user?.id)
        .toList();

    var filtered = myWorkOrders;
    if (_searchQuery.isNotEmpty) {
      filtered = filtered.where((job) {
        final title = job.value('title').toLowerCase();
        final number = job.value('workOrderNumber').toLowerCase();
        return title.contains(_searchQuery) || number.contains(_searchQuery);
      }).toList();
    }

    if (_statusFilter != null) {
      final filterUpper = _statusFilter!.toUpperCase();
      if (filterUpper == 'COMPLETED') {
        filtered = filtered
            .where((job) => ['COMPLETED', 'CLOSED'].contains(job.value('status').toUpperCase()))
            .toList();
      } else if (filterUpper == 'UNDER_REVIEW') {
        filtered = filtered
            .where((job) => ['UNDER_REVIEW', 'UNDER REVIEW'].contains(job.value('status').toUpperCase()))
            .toList();
      } else {
        filtered = filtered
            .where((job) => job.value('status').toUpperCase() == filterUpper)
            .toList();
      }
    }

    final activeJobs = filtered
        .where(
          (job) =>
              ['OPEN', 'ASSIGNED', 'IN_PROGRESS', 'ACCEPTED', 'ON_HOLD', 'REOPENED', 'UNDER_REVIEW', 'UNDER REVIEW']
                  .contains(job.value('status').toUpperCase()),
        )
        .toList();
    final completedJobs = filtered
        .where((job) => ['COMPLETED', 'CLOSED'].contains(job.value('status').toUpperCase()))
        .toList();

    final visibleActive = _showAllActive
        ? activeJobs
        : activeJobs.take(3).toList();
    final visibleCompleted = _showAllCompleted
        ? completedJobs
        : completedJobs.take(3).toList();

    return RefreshIndicator(
      onRefresh: () async {
        widget.onRefresh?.call();
      },
      child: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          Row(
            children: [
              Expanded(
                child: Container(
                  height: 48,
                  decoration: BoxDecoration(
                    color: isDark
                        ? const Color(0xFF161E2E)
                        : Colors.grey.shade100,
                    borderRadius: BorderRadius.circular(8),
                  ),
                  padding: const EdgeInsets.symmetric(horizontal: 12),
                  child: Row(
                    children: [
                      const Icon(Icons.search, color: Colors.grey),
                      const SizedBox(width: 8),
                      Expanded(
                        child: TextField(
                          controller: _searchController,
                          decoration: const InputDecoration(
                            hintText: 'Search for specific jobs by title',
                            hintStyle: TextStyle(
                              color: Colors.grey,
                              fontSize: 14,
                            ),
                            border: InputBorder.none,
                            enabledBorder: InputBorder.none,
                            focusedBorder: InputBorder.none,
                            contentPadding: EdgeInsets.symmetric(vertical: 12),
                          ),
                          style: const TextStyle(fontSize: 14),
                        ),
                      ),
                    ],
                  ),
                ),
              ),
              const SizedBox(width: 8),
              Container(
                height: 48,
                width: 48,
                decoration: BoxDecoration(
                  color: isDark ? const Color(0xFF161E2E) : Colors.grey.shade100,
                  borderRadius: BorderRadius.circular(8),
                ),
                child: PopupMenuButton<String?>(
                  icon: const Icon(Icons.tune, color: Colors.grey),
                  onSelected: (val) {
                    setState(() => _statusFilter = val);
                  },
                  itemBuilder: (context) => const [
                    PopupMenuItem(value: null, child: Text('All Jobs')),
                    PopupMenuItem(value: 'OPEN', child: Text('Open')),
                    PopupMenuItem(value: 'ASSIGNED', child: Text('Assigned')),
                    PopupMenuItem(
                      value: 'IN_PROGRESS',
                      child: Text('In Progress'),
                    ),
                    PopupMenuItem(value: 'UNDER_REVIEW', child: Text('Under Review')),
                    PopupMenuItem(value: 'COMPLETED', child: Text('Completed')),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 20),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text(
                'My Active Jobs',
                style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18),
              ),
              if (activeJobs.length > 3)
                TextButton(
                  onPressed: () {
                    setState(() => _showAllActive = !_showAllActive);
                  },
                  child: Text(
                    _showAllActive ? 'Show less' : 'Show all',
                    style: const TextStyle(fontWeight: FontWeight.bold),
                  ),
                ),
            ],
          ),
          const SizedBox(height: 8),
          if (visibleActive.isEmpty)
            const Padding(
              padding: EdgeInsets.symmetric(vertical: 24),
              child: Center(
                child: Text(
                  'No active jobs found.',
                  style: TextStyle(color: Colors.grey),
                ),
              ),
            )
          else
            for (final job in visibleActive) _buildJobCard(context, job),
          const SizedBox(height: 20),
          const DashedDivider(color: Colors.grey, height: 1),
          const SizedBox(height: 20),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text(
                'Completed Jobs',
                style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18),
              ),
              if (completedJobs.length > 3)
                TextButton(
                  onPressed: () {
                    setState(() => _showAllCompleted = !_showAllCompleted);
                  },
                  child: Text(
                    _showAllCompleted ? 'Show less' : 'Show all',
                    style: const TextStyle(fontWeight: FontWeight.bold),
                  ),
                ),
            ],
          ),
          const SizedBox(height: 8),
          if (visibleCompleted.isEmpty)
            const Padding(
              padding: EdgeInsets.symmetric(vertical: 24),
              child: Center(
                child: Text(
                  'No completed jobs found.',
                  style: TextStyle(color: Colors.grey),
                ),
              ),
            )
          else
            for (final job in visibleCompleted) _buildJobCard(context, job),
          const SizedBox(height: 30),
        ],
      ),
    );
  }
}

class _ChecklistBottomSheet extends StatefulWidget {
  const _ChecklistBottomSheet({required this.job});
  final ApiRecord job;

  @override
  State<_ChecklistBottomSheet> createState() => _ChecklistBottomSheetState();
}

class _ChecklistBottomSheetState extends State<_ChecklistBottomSheet> {
  bool _loading = true;
  List<Map<String, dynamic>> _items = [];
  List<bool> _checked = [];
  String _name = 'Checklist';

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    try {
      final api = context.read<AppState>().apiClient;
      final checklistTemplate = widget.job.data['checklistTemplate'];
      if (checklistTemplate is Map) {
        _name = checklistTemplate['name']?.toString() ?? 'Checklist';
        final rawItems = checklistTemplate['items'];
        if (rawItems is List) {
          _items = List<Map<String, dynamic>>.from(
            rawItems.map((item) => Map<String, dynamic>.from(item as Map)),
          );
          _checked = List<bool>.filled(_items.length, false);
        }
      } else {
        final templateId = widget.job.value('checklistTemplateId');
        if (templateId.isNotEmpty && templateId != '-') {
          final res = await api.get('/checklists/templates');
          final templates = normalizeRecords(res, ['templates', 'data']);
          final match = templates.firstWhere(
            (t) => t.id == templateId,
            orElse: () => ApiRecord(const {}),
          );
          if (match.id.isNotEmpty && match.id != '-') {
            _name = match.value('name');
            final rawItems = match.data['items'];
            if (rawItems is List) {
              _items = List<Map<String, dynamic>>.from(
                rawItems.map((item) => Map<String, dynamic>.from(item as Map)),
              );
              _checked = List<bool>.filled(_items.length, false);
            }
          }
        }
      }
      if (_items.isEmpty) {
        _name = 'General Checklist';
        _items = [
          {'title': 'Verify safety guards are in place', 'isRequired': true},
          {'title': 'Visual inspection for leaks/damage', 'isRequired': true},
          {'title': 'Clear work area after maintenance', 'isRequired': false},
        ];
        _checked = List<bool>.filled(_items.length, false);
      }
    } catch (_) {}
    if (mounted) {
      setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: EdgeInsets.only(
        left: 16,
        right: 16,
        top: 16,
        bottom: MediaQuery.of(context).viewInsets.bottom + 16,
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                _name,
                style: const TextStyle(
                  fontWeight: FontWeight.bold,
                  fontSize: 18,
                ),
              ),
              IconButton(
                icon: const Icon(Icons.close),
                onPressed: () => Navigator.pop(context),
              ),
            ],
          ),
          const Divider(),
          if (_loading)
            const Center(
              child: Padding(
                padding: EdgeInsets.all(24),
                child: CircularProgressIndicator(),
              ),
            )
          else ...[
            ConstrainedBox(
              constraints: const BoxConstraints(maxHeight: 300),
              child: SingleChildScrollView(
                child: Column(
                  children: List.generate(_items.length, (index) {
                    final item = _items[index];
                    final isRequired = item['isRequired'] == true;
                    return CheckboxListTile(
                      title: Row(
                        children: [
                          Expanded(
                            child: Text(
                              item['title'] ?? '',
                              style: TextStyle(
                                decoration: _checked[index]
                                    ? TextDecoration.lineThrough
                                    : TextDecoration.none,
                                fontSize: 14,
                              ),
                            ),
                          ),
                          if (isRequired)
                            Container(
                              margin: const EdgeInsets.only(left: 6),
                              padding: const EdgeInsets.symmetric(
                                horizontal: 4,
                                vertical: 2,
                              ),
                              decoration: BoxDecoration(
                                color: Colors.red.shade50,
                                borderRadius: BorderRadius.circular(4),
                                border: Border.all(color: Colors.red.shade200),
                              ),
                              child: Text(
                                'Required',
                                style: TextStyle(
                                  fontSize: 9,
                                  color: Colors.red.shade700,
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                            ),
                        ],
                      ),
                      value: _checked[index],
                      onChanged: (val) {
                        setState(() => _checked[index] = val ?? false);
                      },
                      contentPadding: EdgeInsets.zero,
                      controlAffinity: ListTileControlAffinity.leading,
                      dense: true,
                    );
                  }),
                ),
              ),
            ),
            const SizedBox(height: 16),
            FilledButton(
              onPressed: () {
                Navigator.pop(context);
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(
                    content: Text('Checklist saved successfully!'),
                  ),
                );
              },
              child: const Text('Save Checklist'),
            ),
          ],
        ],
      ),
    );
  }
}

class _HistoryBottomSheet extends StatelessWidget {
  const _HistoryBottomSheet({required this.job});
  final ApiRecord job;

  @override
  Widget build(BuildContext context) {
    final status = job.value('status');
    final number = job.value('workOrderNumber');
    final activities = [
      {'action': 'Work Order Created', 'createdAt': '30 Jun 2026 | 08:00 AM'},
      {
        'action': 'Assigned to Kumar Technician',
        'createdAt': '30 Jun 2026 | 09:20 AM',
      },
      if (status == 'IN_PROGRESS' || status == 'COMPLETED')
        {
          'action': 'Work Started by Technician',
          'createdAt': '30 Jun 2026 | 09:45 AM',
        },
      if (status == 'COMPLETED')
        {
          'action': 'Completed by Technician',
          'createdAt': '30 Jun 2026 | 10:00 AM',
        },
    ];

    return Container(
      padding: const EdgeInsets.all(16),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                'History - $number',
                style: const TextStyle(
                  fontWeight: FontWeight.bold,
                  fontSize: 18,
                ),
              ),
              IconButton(
                icon: const Icon(Icons.close),
                onPressed: () => Navigator.pop(context),
              ),
            ],
          ),
          const Divider(),
          ConstrainedBox(
            constraints: const BoxConstraints(maxHeight: 300),
            child: ListView.builder(
              shrinkWrap: true,
              itemCount: activities.length,
              itemBuilder: (context, index) {
                final act = activities[index];
                return ListTile(
                  leading: const Icon(
                    Icons.history_toggle_off,
                    color: Color(0xFF1E5CB3),
                  ),
                  title: Text(
                    act['action'] ?? '',
                    style: const TextStyle(
                      fontSize: 14,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  subtitle: Text(
                    act['createdAt'] ?? '',
                    style: const TextStyle(fontSize: 12),
                  ),
                  dense: true,
                  contentPadding: EdgeInsets.zero,
                );
              },
            ),
          ),
        ],
      ),
    );
  }
}

class DashedDivider extends StatelessWidget {
  const DashedDivider({super.key, this.height = 1, this.color = Colors.grey});
  final double height;
  final Color color;

  @override
  Widget build(BuildContext context) {
    return LayoutBuilder(
      builder: (context, constraints) {
        var boxWidth = constraints.constrainWidth();
        if (boxWidth.isInfinite || boxWidth.isNaN || boxWidth <= 0) {
          boxWidth = MediaQuery.sizeOf(context).width;
        }
        const dashWidth = 5.0;
        final dashHeight = 1.0;
        const dashSpace = 4.0;
        final dashCount = (boxWidth / (dashWidth + dashSpace)).floor().clamp(0, 500);
        return Flex(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          direction: Axis.horizontal,
          children: List.generate(dashCount, (_) {
            return SizedBox(
              width: dashWidth,
              height: dashHeight,
              child: DecoratedBox(decoration: BoxDecoration(color: color)),
            );
          }),
        );
      },
    );
  }
}

class _UpdateStatusDialog extends StatefulWidget {
  const _UpdateStatusDialog({required this.job});
  final ApiRecord job;

  @override
  State<_UpdateStatusDialog> createState() => _UpdateStatusDialogState();
}

class _UpdateStatusDialogState extends State<_UpdateStatusDialog> {
  final _reasonController = TextEditingController();
  final _notesController = TextEditingController();
  final _hoursController = TextEditingController();
  bool _submitting = false;
  String? _error;

  late String _currentStatus;
  String? _selectedAction;

  @override
  void initState() {
    super.initState();
    _currentStatus = widget.job.value('status').toUpperCase();
    if (_currentStatus == 'OPEN' || _currentStatus == 'ASSIGNED') {
      _selectedAction = 'ACCEPT';
    } else if (_currentStatus == 'ACCEPTED') {
      _selectedAction = 'IN_PROGRESS';
    } else if (_currentStatus == 'IN_PROGRESS') {
      _selectedAction = 'COMPLETED';
      _selectedAction = 'COMPLETED';
    } else if (_currentStatus == 'ON_HOLD') {
      _selectedAction = 'IN_PROGRESS';
    } else if (_currentStatus == 'REOPENED') {
      _selectedAction = 'IN_PROGRESS';
    }
  }

  @override
  void dispose() {
    _reasonController.dispose();
    _notesController.dispose();
    _hoursController.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    if (_selectedAction == null) return;
    setState(() {
      _submitting = true;
      _error = null;
    });

    try {
      final api = context.read<AppState>().apiClient;
      if (_selectedAction == 'ACCEPT') {
        await api.patch('/work-orders/${widget.job.id}/accept');
      } else {
        final payload = <String, dynamic>{
          'status': _selectedAction,
        };

        if (_selectedAction == 'ON_HOLD') {
          final reason = _reasonController.text.trim();
          if (reason.isEmpty) {
            throw 'Please specify the reason for putting the job on hold.';
          }
          payload['reason'] = reason;
        } else if (_selectedAction == 'COMPLETED') {
          final notes = _notesController.text.trim();
          if (notes.isEmpty) {
            throw 'Please enter resolution notes describing what was done.';
          }
          final hoursStr = _hoursController.text.trim();
          if (hoursStr.isEmpty) {
            throw 'Please enter actual hours spent.';
          }
          final hours = double.tryParse(hoursStr);
          if (hours == null || hours <= 0) {
            throw 'Please enter a valid decimal number for actual hours.';
          }
          payload['resolutionNotes'] = notes;
          payload['actualHours'] = hours;
        }

        await api.patch('/work-orders/${widget.job.id}/status', data: payload);
      }

      if (mounted) {
        Navigator.pop(context, true);
      }
    } catch (e) {
      setState(() {
        _error = e.toString();
        _submitting = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;

    final List<DropdownMenuItem<String>> actionItems = [];
    if (_currentStatus == 'OPEN' || _currentStatus == 'ASSIGNED') {
      actionItems.add(const DropdownMenuItem(value: 'ACCEPT', child: Text('Accept Work Order')));
    } else if (_currentStatus == 'ACCEPTED') {
      actionItems.add(const DropdownMenuItem(value: 'IN_PROGRESS', child: Text('Start Work (In Progress)')));
    } else if (_currentStatus == 'IN_PROGRESS') {
      actionItems.add(const DropdownMenuItem(value: 'COMPLETED', child: Text('Complete Work Order')));
      actionItems.add(const DropdownMenuItem(value: 'ON_HOLD', child: Text('Put on Hold')));
    } else if (_currentStatus == 'ON_HOLD') {
      actionItems.add(const DropdownMenuItem(value: 'IN_PROGRESS', child: Text('Resume Work (In Progress)')));
    } else if (_currentStatus == 'REOPENED') {
      actionItems.add(const DropdownMenuItem(value: 'IN_PROGRESS', child: Text('Start Work (In Progress)')));
    }

    return AlertDialog(
      title: Text(
        'Update Status: ${widget.job.value('workOrderNumber')}',
        style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
      ),
      content: SingleChildScrollView(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            if (_error != null) ...[
              Container(
                padding: const EdgeInsets.all(10),
                decoration: BoxDecoration(
                  color: Colors.red.shade50.withValues(alpha: isDark ? 0.1 : 1.0),
                  borderRadius: BorderRadius.circular(6),
                  border: Border.all(color: Colors.red.shade200),
                ),
                child: Text(
                  _error!,
                  style: TextStyle(color: isDark ? Colors.red.shade300 : Colors.red.shade800, fontSize: 13),
                ),
              ),
              const SizedBox(height: 12),
            ],
            Text(
              'Current Status: $_currentStatus',
              style: TextStyle(color: theme.colorScheme.primary, fontWeight: FontWeight.w600, fontSize: 13),
            ),
            const SizedBox(height: 16),
            const Text(
              'Action',
              style: TextStyle(fontWeight: FontWeight.w600, fontSize: 13),
            ),
            const SizedBox(height: 8),
            DropdownButtonFormField<String>(
              value: _selectedAction,
              decoration: InputDecoration(
                contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                border: OutlineInputBorder(borderRadius: BorderRadius.circular(8)),
              ),
              items: actionItems,
              onChanged: (val) {
                if (val != null) {
                  setState(() => _selectedAction = val);
                }
              },
            ),
            if (_selectedAction == 'ON_HOLD') ...[
              const SizedBox(height: 16),
              const Text(
                'Reason for Hold *',
                style: TextStyle(fontWeight: FontWeight.w600, fontSize: 13),
              ),
              const SizedBox(height: 8),
              TextField(
                controller: _reasonController,
                decoration: InputDecoration(
                  hintText: 'e.g. Waiting for spare parts',
                  contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(8)),
                ),
              ),
            ],
            if (_selectedAction == 'COMPLETED') ...[
              const SizedBox(height: 16),
              const Text(
                'Resolution Notes *',
                style: TextStyle(fontWeight: FontWeight.w600, fontSize: 13),
              ),
              const SizedBox(height: 8),
              TextField(
                controller: _notesController,
                maxLines: 2,
                decoration: InputDecoration(
                  hintText: 'e.g. Replaced 24V LED indicator bulb.',
                  contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(8)),
                ),
              ),
              const SizedBox(height: 16),
              const Text(
                'Actual Hours Spent *',
                style: TextStyle(fontWeight: FontWeight.w600, fontSize: 13),
              ),
              const SizedBox(height: 8),
              TextField(
                controller: _hoursController,
                keyboardType: const TextInputType.numberWithOptions(decimal: true),
                decoration: InputDecoration(
                  hintText: 'e.g. 0.8',
                  contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(8)),
                ),
              ),
            ],
          ],
        ),
      ),
      actions: [
        TextButton(
          onPressed: _submitting ? null : () => Navigator.pop(context),
          child: const Text('Cancel'),
        ),
        ElevatedButton(
          onPressed: _submitting || _selectedAction == null ? null : _submit,
          style: ElevatedButton.styleFrom(
            backgroundColor: theme.colorScheme.primary,
            foregroundColor: theme.colorScheme.onPrimary,
            elevation: 0,
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
          ),
          child: _submitting
              ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
              : const Text('Update'),
        ),
      ],
    );
  }
}
