import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../../../core/models/api_record.dart';
import '../../../core/providers/app_state.dart';
import '../../../core/widgets/api_record_list.dart';
import '../../../core/widgets/cmms_scaffold.dart';
import 'widgets/work_order_form.dart';

class WorkOrdersScreen extends StatelessWidget {
  const WorkOrdersScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final state = context.watch<AppState>();
    final isTechnician = state.user?.role == 'TECHNICIAN';
    final endpoint = isTechnician ? '/work-orders/my' : '/work-orders';

    return CmmsScaffold(
      title: 'Work Orders',
      child: ApiRecordList(
        title: 'Work Orders',
        endpoint: endpoint,
        listKeys: const ['workOrders', 'data'],
        primaryField: 'title',
        secondaryFields: const [
          'workOrderNumber',
          'asset.assetName',
          'priority',
          'assignedTechnician.fullName',
          'dueDate',
        ],
        queryBuilder: (search, filter) => {
          'limit': 100,
          if (search.trim().isNotEmpty) 'search': search.trim(),
          if (filter != null) 'status': filter,
        },
        uploadPathBuilder: (record) => '/work-orders/${record.id}/attachments',
        trailingActions: (record) => [
          RecordAction(
            'view',
            'View Timeline',
            (context) => _showDetails(context, record),
          ),
          RecordAction(
            'note',
            'Add Note',
            (context) => _addNote(context, record),
          ),
          RecordAction(
            'assign',
            'Assign Technician',
            (context) => _assignTechnician(context, record),
          ),
          RecordAction(
            'start',
            'Start Work',
            (context) => _updateStatus(context, record, 'IN_PROGRESS'),
          ),
          RecordAction(
            'hold',
            'Put On Hold',
            (context) => _updateStatus(context, record, 'ON_HOLD'),
          ),
          RecordAction(
            'complete',
            'Complete Work',
            (context) => _updateStatus(context, record, 'COMPLETED'),
          ),
          RecordAction(
            'close',
            'Close',
            (context) => _updateStatus(context, record, 'CLOSED'),
          ),
        ],
        customFormBuilder: (context, initialValues, onSubmit) => WorkOrderForm(
          apiClient: Provider.of<AppState>(context, listen: false).apiClient,
          initialValues: initialValues,
          onSubmit: onSubmit,
        ),
      ),
    );
  }
}

Future<void> _updateStatus(
  BuildContext context,
  ApiRecord record,
  String status,
) async {
  try {
    await context.read<AppState>().apiClient.patch(
      '/work-orders/${record.id}/status',
      data: {'status': status},
    );
    if (context.mounted) {
      ScaffoldMessenger.of(
        context,
      ).showSnackBar(SnackBar(content: Text('Status updated to $status')));
    }
  } catch (error) {
    if (context.mounted) {
      ScaffoldMessenger.of(
        context,
      ).showSnackBar(SnackBar(content: Text(error.toString())));
    }
  }
}

Future<void> _addNote(BuildContext context, ApiRecord record) async {
  final api = context.read<AppState>().apiClient;
  final controller = TextEditingController();
  final note = await showDialog<String>(
    context: context,
    builder: (context) => AlertDialog(
      title: const Text('Add Note'),
      content: TextField(
        controller: controller,
        minLines: 3,
        maxLines: 5,
        decoration: const InputDecoration(labelText: 'Note'),
      ),
      actions: [
        TextButton(
          onPressed: () => Navigator.pop(context),
          child: const Text('Cancel'),
        ),
        FilledButton(
          onPressed: () => Navigator.pop(context, controller.text.trim()),
          child: const Text('Save'),
        ),
      ],
    ),
  );
  controller.dispose();
  if (note == null || note.isEmpty) return;

  try {
    await api.post(
      '/work-orders/${record.id}/comments',
      data: {'comment': note},
    );
    if (context.mounted) {
      ScaffoldMessenger.of(
        context,
      ).showSnackBar(const SnackBar(content: Text('Note added')));
    }
  } catch (error) {
    if (context.mounted) {
      ScaffoldMessenger.of(
        context,
      ).showSnackBar(SnackBar(content: Text(error.toString())));
    }
  }
}

Future<void> _assignTechnician(BuildContext context, ApiRecord record) async {
  final api = context.read<AppState>().apiClient;
  
  final String? technicianId = await showDialog<String?>(
    context: context,
    builder: (context) {
      String? selectedId = record.value('assignedTechnicianId', fallback: '');
      if (selectedId == '') selectedId = null;

      return FutureBuilder<dynamic>(
        future: api.get('/users'),
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) {
            return const AlertDialog(
              title: Text('Assign Technician'),
              content: SizedBox(
                height: 80,
                child: Center(child: CircularProgressIndicator()),
              ),
            );
          }
          if (snapshot.hasError || snapshot.data == null) {
            return AlertDialog(
              title: const Text('Assign Technician'),
              content: const Text('Failed to load technicians from server'),
              actions: [
                TextButton(
                  onPressed: () => Navigator.pop(context),
                  child: const Text('Close'),
                ),
              ],
            );
          }

          List<dynamic> allUsers = [];
          final res = snapshot.data;
          if (res is List) {
            allUsers = res;
          } else if (res is Map && res['data'] is List) {
            allUsers = res['data'];
          }

          final techs = allUsers.where((u) {
            final roleObj = u['role'];
            final roleName = roleObj is Map ? roleObj['name']?.toString() : u['roleName']?.toString();
            return roleName?.toUpperCase() == 'TECHNICIAN';
          }).toList();

          return StatefulBuilder(
            builder: (context, setState) {
              return AlertDialog(
                title: const Text('Assign Technician'),
                content: DropdownButtonFormField<String>(
                  value: selectedId,
                  decoration: const InputDecoration(labelText: 'Technician'),
                  items: [
                    const DropdownMenuItem<String>(
                      value: null,
                      child: Text('— Unassigned —'),
                    ),
                    ...techs.map((t) => DropdownMenuItem<String>(
                          value: t['id']?.toString(),
                          child: Text(t['fullName']?.toString() ?? 'Unnamed'),
                        )),
                  ],
                  onChanged: (val) {
                    setState(() {
                      selectedId = val;
                    });
                  },
                ),
                actions: [
                  TextButton(
                    onPressed: () => Navigator.pop(context),
                    child: const Text('Cancel'),
                  ),
                  FilledButton(
                    onPressed: () => Navigator.pop(context, selectedId),
                    child: const Text('Assign'),
                  ),
                ],
              );
            },
          );
        },
      );
    },
  );

  if (technicianId == null) return;

  try {
    await api.patch(
      '/work-orders/${record.id}/assign-technician',
      data: {'technicianId': technicianId},
    );
    if (context.mounted) {
      ScaffoldMessenger.of(
        context,
      ).showSnackBar(const SnackBar(content: Text('Technician assigned')));
    }
  } catch (error) {
    if (context.mounted) {
      ScaffoldMessenger.of(
        context,
      ).showSnackBar(SnackBar(content: Text(error.toString())));
    }
  }
}

Future<void> _showDetails(BuildContext context, ApiRecord record) async {
  final api = context.read<AppState>().apiClient;
  final baseUrl = api.baseUrl;
  final details = await api.get('/work-orders/${record.id}');
  final comments = await api.get('/work-orders/${record.id}/comments');
  final attachments = await api.get('/work-orders/${record.id}/attachments');
  final detailRecord = ApiRecord(
    Map<String, dynamic>.from(
      details is Map && details['workOrder'] is Map
          ? details['workOrder']
          : details as Map,
    ),
  );
  final commentRecords = normalizeRecords(comments, ['comments', 'data']);
  final attachmentRecords = normalizeRecords(attachments, [
    'attachments',
    'data',
  ]);

  final assetMap = detailRecord.data['asset'];
  String? resolvedAssetImageUrl;
  if (assetMap is Map) {
    final assetId = assetMap['id']?.toString() ?? '';
    if (assetId.isNotEmpty) {
      resolvedAssetImageUrl = '$baseUrl/assets/$assetId/image';
    }
  }

  if (!context.mounted) return;
  showModalBottomSheet<void>(
    context: context,
    isScrollControlled: true,
    builder: (context) => DraggableScrollableSheet(
      expand: false,
      initialChildSize: .82,
      builder: (context, controller) => ListView(
        controller: controller,
        padding: const EdgeInsets.all(16),
        children: [
          if (resolvedAssetImageUrl != null) ...[
            ClipRRect(
              borderRadius: BorderRadius.circular(12),
              child: Image.network(
                resolvedAssetImageUrl,
                height: 200,
                width: double.infinity,
                fit: BoxFit.cover,
                errorBuilder: (context, error, stackTrace) => const SizedBox.shrink(),
              ),
            ),
            const SizedBox(height: 12),
          ],
          Text(
            detailRecord.value('workOrderNumber'),
            style: Theme.of(context).textTheme.titleLarge,
          ),
          const SizedBox(height: 6),
          Text(detailRecord.value('title')),
          const SizedBox(height: 12),
          Wrap(
            spacing: 8,
            children: [
              Chip(label: Text(detailRecord.value('status'))),
              Chip(label: Text(detailRecord.value('priority'))),
              Chip(label: Text(detailRecord.value('workType'))),
            ],
          ),
          const Divider(height: 28),
          Text('Timeline', style: Theme.of(context).textTheme.titleMedium),
          for (final activity in normalizeRecords(
            detailRecord.data['activities'],
            ['data'],
          ))
            ListTile(
              leading: const Icon(Icons.history),
              title: Text(activity.value('action')),
              subtitle: Text(activity.value('createdAt')),
            ),
          Text('Notes', style: Theme.of(context).textTheme.titleMedium),
          for (final comment in commentRecords)
            ListTile(
              leading: const Icon(Icons.notes),
              title: Text(comment.value('comment')),
              subtitle: Text(comment.value('createdAt')),
            ),
          Text('Attachments', style: Theme.of(context).textTheme.titleMedium),
          for (final attachment in attachmentRecords) ...[
            ListTile(
              leading: const Icon(Icons.attachment),
              title: Text(attachment.value('fileName')),
              subtitle: Text(
                attachment.value(
                  'attachmentType',
                  fallback: attachment.value('fileType'),
                ),
              ),
            ),
            if (attachment.id.isNotEmpty)
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                child: ClipRRect(
                  borderRadius: BorderRadius.circular(8),
                  child: Image.network(
                    '$baseUrl/work-orders/attachments/${attachment.id}',
                    height: 180,
                    width: double.infinity,
                    fit: BoxFit.cover,
                    errorBuilder: (context, error, stackTrace) => Container(
                      height: 80,
                      color: Theme.of(context).colorScheme.errorContainer,
                      child: const Center(
                        child: Text('Could not load image preview'),
                      ),
                    ),
                  ),
                ),
              ),
          ],
        ],
      ),
    ),
  );
}
