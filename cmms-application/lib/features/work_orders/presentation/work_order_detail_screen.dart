import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:provider/provider.dart';
import '../../../core/models/api_record.dart';
import '../../../core/providers/app_state.dart';
import '../../../core/widgets/data_state_widgets.dart';
import '../../inventory/presentation/request_parts_screen.dart';

class WorkOrderDetailScreen extends StatefulWidget {
  const WorkOrderDetailScreen({super.key, required this.workOrder});

  final ApiRecord workOrder;

  @override
  State<WorkOrderDetailScreen> createState() => _WorkOrderDetailScreenState();
}

class _WorkOrderDetailScreenState extends State<WorkOrderDetailScreen> {
  late ApiRecord _workOrder;
  bool _loading = true;
  String? _error;
  List<Map<String, dynamic>> _checklistItems = [];
  List<bool> _checklistChecked = [];
  String _checklistName = 'Work Order Checklist';

  bool _isAdditionalExpanded = true;
  bool _isChecklistExpanded = true;
  bool _isSparePartsExpanded = true;
  List<dynamic> _partsRequests = [];

  @override
  void initState() {
    super.initState();
    _workOrder = widget.workOrder;
    _loadDetails();
  }

  Future<void> _loadDetails() async {
    setState(() {
      _loading = true;
      _error = null;
    });

    try {
      final api = context.read<AppState>().apiClient;
      // Fetch full details of work order
      final details = await api.get('/work-orders/${_workOrder.id}');
      if (details is Map) {
        final woData = details['workOrder'] is Map ? details['workOrder'] : details;
        _workOrder = ApiRecord(Map<String, dynamic>.from(woData));
      }

      // Try to read checklist directly from the work order details first!
      final checklistTemplate = _workOrder.data['checklistTemplate'];
      if (checklistTemplate is Map) {
        _checklistName = checklistTemplate['name']?.toString() ?? 'Checklist';
        final rawItems = checklistTemplate['items'];
        if (rawItems is List) {
          _checklistItems = List<Map<String, dynamic>>.from(
            rawItems.map((item) => Map<String, dynamic>.from(item as Map)),
          );
          _checklistChecked = List<bool>.filled(_checklistItems.length, false);
        }
      } else {
        // Fallback to fetch from templates list if not directly included
        final checklistTemplateId = _workOrder.value('checklistTemplateId');
        if (checklistTemplateId.isNotEmpty && checklistTemplateId != '-') {
          final checklistsResponse = await api.get('/checklists/templates');
          final templates = normalizeRecords(checklistsResponse, ['templates', 'data']);
          final match = templates.firstWhere(
            (t) => t.id == checklistTemplateId,
            orElse: () => ApiRecord(const {}),
          );
          if (match.id.isNotEmpty && match.id != '-') {
            _checklistName = match.value('name');
            final rawItems = match.data['items'];
            if (rawItems is List) {
              _checklistItems = List<Map<String, dynamic>>.from(
                rawItems.map((item) => Map<String, dynamic>.from(item as Map)),
              );
              _checklistChecked = List<bool>.filled(_checklistItems.length, false);
            }
          }
        }
      }

      if (_checklistItems.isEmpty) {
        // Fallback checklist if none is associated
        _checklistName = 'General Inspection Checklist';
        _checklistItems = [
          {'title': 'Perform preliminary safety checks', 'isRequired': true},
          {'title': 'Inspect primary components for visible wear', 'isRequired': true},
          {'title': 'Document final operational readings', 'isRequired': false},
        ];
        _checklistChecked = List<bool>.filled(_checklistItems.length, false);
      }

      final requestsResponse = await api.get('/inventory/parts-requests', queryParameters: {
        'workOrderId': _workOrder.id,
      });
      if (requestsResponse is List) {
        _partsRequests = requestsResponse;
      }
    } catch (e) {
      _error = e.toString();
    } finally {
      if (mounted) {
        setState(() => _loading = false);
      }
    }
  }

  void _toggleChecklistItem(int index, bool? value) {
    setState(() {
      _checklistChecked[index] = value ?? false;
    });
    ScaffoldMessenger.of(context).hideCurrentSnackBar();
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(
          _checklistChecked[index]
              ? 'Completed: ${_checklistItems[index]['title']}'
              : 'Cleared: ${_checklistItems[index]['title']}',
        ),
        duration: const Duration(seconds: 1),
      ),
    );
  }

  String _formatDate(String isoString) {
    if (isoString.isEmpty) return 'N/A';
    try {
      final date = DateTime.parse(isoString);
      return DateFormat('dd MMM yyyy | hh:mm a').format(date);
    } catch (_) {
      return isoString;
    }
  }

  Color _getPriorityColor(String priority) {
    switch (priority.toUpperCase()) {
      case 'CRITICAL':
        return Colors.red.shade700;
      case 'HIGH':
        return Colors.orange.shade800;
      case 'MEDIUM':
        return Colors.amber.shade800;
      case 'LOW':
        return Colors.green.shade700;
      default:
        return Colors.grey.shade700;
    }
  }

  Color _getStatusColor(String status) {
    switch (status.toUpperCase()) {
      case 'IN_PROGRESS':
        return const Color(0xFFA855F7); // Purple
      case 'COMPLETED':
        return const Color(0xFF22C55E); // Green
      case 'ASSIGNED':
        return const Color(0xFF3B82F6); // Blue
      case 'OPEN':
        return const Color(0xFFF59E0B); // Amber
      case 'UNDER_REVIEW':
      case 'UNDER REVIEW':
        return const Color(0xFFF97316); // Orange
      case 'REOPENED':
        return Colors.red.shade600;
      case 'CLOSED':
        return Colors.grey.shade600;
      default:
        return Colors.grey;
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;

    final baseUrl = context.read<AppState>().apiClient.baseUrl;
    String? resolvedImageUrl;
    String resolvedImageLabel = 'Uploaded image of the damaged conveyor belt';

    final attachments = _workOrder.data['attachments'];
    if (attachments is List && attachments.isNotEmpty) {
      for (final att in attachments) {
        if (att is Map) {
          final id = att['id']?.toString() ?? '';
          final fileName = att['fileName']?.toString() ?? 'attachment';
          if (id.isNotEmpty) {
            resolvedImageUrl = '$baseUrl/work-orders/attachments/$id';
            resolvedImageLabel = 'Attachment: $fileName';
            break;
          }
        }
      }
    }

    if (resolvedImageUrl == null) {
      final assetMap = _workOrder.data['asset'];
      if (assetMap is Map) {
        final id = assetMap['id']?.toString() ?? '';
        final assetNameVal = assetMap['assetName']?.toString() ?? 'Asset';
        if (id.isNotEmpty) {
          resolvedImageUrl = '$baseUrl/assets/$id/image';
          resolvedImageLabel = 'Asset: $assetNameVal';
        }
      }
    }

    final displayImageUrl = resolvedImageUrl ?? 'https://images.unsplash.com/photo-1506784983877-45594efa4cbe?w=600';

    final number = _workOrder.value('workOrderNumber', fallback: 'WO------');
    final title = _workOrder.value('title', fallback: 'Work Order Title');
    final status = _workOrder.value('status', fallback: 'OPEN');
    final priority = _workOrder.value('priority', fallback: 'MEDIUM');
    final assetCode = _workOrder.nested('asset', 'assetCode', fallback: _workOrder.value('assetId'));
    final assetName = _workOrder.nested('asset', 'assetName', fallback: 'Unknown Asset');
    final dueDate = _workOrder.value('dueDate');
    final description = _workOrder.value('description', fallback: 'No details provided.');

    final startDate = _workOrder.value('createdAt');
    final laborTime = priority.toUpperCase() == 'CRITICAL' || priority.toUpperCase() == 'HIGH' ? '60 Hrs' : '24 Hrs';
    final workType = _workOrder.value('workType', fallback: 'REACTIVE');
    final linkedWo = _workOrder.value('linkedWorkOrder', fallback: 'WO34264');

    return Scaffold(
      appBar: AppBar(
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () => Navigator.pop(context),
        ),
        title: Text(
          'Work Order #: $number',
          style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 18),
        ),
        elevation: 0,
      ),
      body: _loading
          ? const LoadingView()
          : _error != null
              ? ErrorPanel(message: _error!, onRetry: _loadDetails)
              : RefreshIndicator(
                  onRefresh: _loadDetails,
                  child: ListView(
                    padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                    children: [
                      if (status.toUpperCase() == 'UNDER_REVIEW' || status.toUpperCase() == 'UNDER REVIEW') ...[
                        Container(
                          margin: const EdgeInsets.only(bottom: 16),
                          padding: const EdgeInsets.all(12),
                          decoration: BoxDecoration(
                            color: Colors.orange.shade50.withOpacity(isDark ? 0.15 : 1.0),
                            borderRadius: BorderRadius.circular(8),
                            border: Border.all(color: Colors.orange.shade200),
                          ),
                          child: Row(
                            children: [
                              Icon(Icons.info_outline, color: Colors.orange.shade700),
                              const SizedBox(width: 12),
                              const Expanded(
                                child: Text(
                                  'Your work has been submitted for Supervisor review.\nWaiting for approval.',
                                  style: TextStyle(
                                    fontSize: 13,
                                    color: Colors.orange,
                                    fontWeight: FontWeight.w600,
                                  ),
                                ),
                              ),
                            ],
                          ),
                        ),
                      ],
                      // Work Order Title & Status Badge
                      Row(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Expanded(
                            child: Text(
                              title,
                              style: const TextStyle(
                                fontSize: 20,
                                fontWeight: FontWeight.bold,
                                height: 1.3,
                              ),
                            ),
                          ),
                          const SizedBox(width: 8),
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                            decoration: BoxDecoration(
                              color: _getStatusColor(status),
                              borderRadius: BorderRadius.circular(6),
                            ),
                            child: Text(
                              status.replaceAll('_', ' '),
                              style: const TextStyle(
                                color: Colors.white,
                                fontWeight: FontWeight.bold,
                                fontSize: 12,
                              ),
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 16),

                      // Asset Metadata
                      _buildMetadataRow('Asset:', '$assetCode | $assetName',
                          trailing: const Icon(
                            Icons.qr_code_2,
                            color: Color(0xFF1E5CB3),
                            size: 20,
                          )),
                      _buildMetadataRow('Priority:', priority,
                          valueColor: _getPriorityColor(priority)),
                      _buildMetadataRow('Due Date:', _formatDate(dueDate)),

                      const Divider(height: 24, thickness: 1, color: Colors.black12),

                      // Note Section
                      const Text(
                        'Note:',
                        style: TextStyle(
                          color: Color(0xFF1E5CB3),
                          fontWeight: FontWeight.bold,
                          fontSize: 16,
                        ),
                      ),
                      const SizedBox(height: 6),
                      Text(
                        description,
                        style: TextStyle(
                          fontSize: 14,
                          color: isDark ? Colors.grey.shade300 : Colors.black87,
                          height: 1.4,
                        ),
                      ),
                      const SizedBox(height: 20),

                      // Accordion 1: Additional Details
                      _buildAccordionHeader(
                        title: 'Additional Details',
                        isExpanded: _isAdditionalExpanded,
                        onTap: () => setState(() => _isAdditionalExpanded = !_isAdditionalExpanded),
                      ),
                      if (_isAdditionalExpanded) ...[
                        Container(
                          decoration: BoxDecoration(
                            border: Border.all(color: Colors.black12),
                            borderRadius: const BorderRadius.only(
                              bottomLeft: Radius.circular(8),
                              bottomRight: Radius.circular(8),
                            ),
                            color: isDark ? Colors.grey.shade900 : Colors.grey.shade50,
                          ),
                          padding: const EdgeInsets.all(12),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              // Image Placeholder matching blueprint mockup
                              Stack(
                                alignment: Alignment.bottomCenter,
                                children: [
                                  ClipRRect(
                                    borderRadius: BorderRadius.circular(6),
                                    child: Image.network(
                                      displayImageUrl,
                                      height: 180,
                                      width: double.infinity,
                                      fit: BoxFit.cover,
                                      errorBuilder: (context, error, stackTrace) {
                                        return Container(
                                          height: 180,
                                          width: double.infinity,
                                          color: isDark ? Colors.grey.shade800 : Colors.grey.shade200,
                                          child: Icon(
                                            Icons.image_not_supported_outlined,
                                            color: isDark ? Colors.grey.shade600 : Colors.grey.shade400,
                                            size: 32,
                                          ),
                                        );
                                      },
                                    ),
                                  ),
                                  Container(
                                    width: double.infinity,
                                    color: Colors.black54,
                                    padding: const EdgeInsets.symmetric(vertical: 6, horizontal: 10),
                                    child: Text(
                                      resolvedImageLabel,
                                      style: const TextStyle(color: Colors.white, fontSize: 12),
                                      textAlign: TextAlign.center,
                                    ),
                                  ),
                                  Positioned(
                                    top: 8,
                                    right: 8,
                                    child: GestureDetector(
                                      onTap: () {
                                        ScaffoldMessenger.of(context).showSnackBar(
                                          const SnackBar(content: Text('Delete clicked (mocked)')),
                                        );
                                      },
                                      child: Container(
                                        padding: const EdgeInsets.all(6),
                                        decoration: const BoxDecoration(
                                          color: Colors.black38,
                                          shape: BoxShape.circle,
                                        ),
                                        child: const Icon(
                                          Icons.delete_outline,
                                          color: Colors.white,
                                          size: 18,
                                        ),
                                      ),
                                    ),
                                  ),
                                ],
                              ),
                              const SizedBox(height: 16),
                              _buildAccordionMetadataRow('Start Date:', _formatDate(startDate)),
                              _buildAccordionMetadataRow('Estimated Labor Time:', laborTime),
                              _buildAccordionMetadataRow('Work Order Type:', workType.replaceAll('_', ' ')),
                              _buildAccordionMetadataRow('Linked Work Order:', linkedWo),
                            ],
                          ),
                        ),
                      ],
                      const SizedBox(height: 16),

                      // Accordion 2: Checklist & Other Details
                      _buildAccordionHeader(
                        title: 'Checklist & Other Details',
                        isExpanded: _isChecklistExpanded,
                        onTap: () => setState(() => _isChecklistExpanded = !_isChecklistExpanded),
                      ),
                      if (_isChecklistExpanded) ...[
                        Container(
                          decoration: BoxDecoration(
                            border: Border.all(color: Colors.black12),
                            borderRadius: const BorderRadius.only(
                              bottomLeft: Radius.circular(8),
                              bottomRight: Radius.circular(8),
                            ),
                            color: isDark ? Colors.grey.shade900 : Colors.grey.shade50,
                          ),
                          padding: const EdgeInsets.all(12),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                _checklistName,
                                style: const TextStyle(
                                  fontWeight: FontWeight.bold,
                                  fontSize: 14,
                                  color: Color(0xFF1E5CB3),
                                ),
                              ),
                              const SizedBox(height: 10),
                              ...List.generate(_checklistItems.length, (index) {
                                final item = _checklistItems[index];
                                final isRequired = item['isRequired'] == true;
                                return CheckboxListTile(
                                  value: _checklistChecked[index],
                                  onChanged: (status.toUpperCase() == 'UNDER_REVIEW' || status.toUpperCase() == 'UNDER REVIEW')
                                      ? null
                                      : (val) => _toggleChecklistItem(index, val),
                                  title: Row(
                                    children: [
                                      Expanded(
                                        child: Text(
                                          item['title'] ?? '',
                                          style: TextStyle(
                                            decoration: _checklistChecked[index]
                                                ? TextDecoration.lineThrough
                                                : TextDecoration.none,
                                            fontSize: 14,
                                          ),
                                        ),
                                      ),
                                      if (isRequired)
                                        Container(
                                          margin: const EdgeInsets.only(left: 6),
                                          padding: const EdgeInsets.symmetric(horizontal: 4, vertical: 2),
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
                                  contentPadding: EdgeInsets.zero,
                                  controlAffinity: ListTileControlAffinity.leading,
                                  dense: true,
                                );
                              }),
                            ],
                          ),
                        ),
                      ],
                      const SizedBox(height: 16),

                      // Accordion 3: Spare Parts Requisitions
                      _buildAccordionHeader(
                        title: 'Spare Parts Requisitions',
                        isExpanded: _isSparePartsExpanded,
                        onTap: () => setState(() => _isSparePartsExpanded = !_isSparePartsExpanded),
                      ),
                      if (_isSparePartsExpanded) ...[
                        Container(
                          decoration: BoxDecoration(
                            border: Border.all(color: Colors.black12),
                            borderRadius: const BorderRadius.only(
                              bottomLeft: Radius.circular(8),
                              bottomRight: Radius.circular(8),
                            ),
                            color: isDark ? Colors.grey.shade900 : Colors.grey.shade50,
                          ),
                          padding: const EdgeInsets.all(12),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              if (_partsRequests.isEmpty)
                                const Padding(
                                  padding: EdgeInsets.symmetric(vertical: 12.0),
                                  child: Center(
                                    child: Text(
                                      'No spare parts requested for this work order.',
                                      style: TextStyle(fontSize: 12, color: Colors.grey),
                                    ),
                                  ),
                                )
                              else
                                ..._partsRequests.map((req) {
                                  final reqNo = req['requestNumber'] ?? 'PR';
                                  final statusStr = (req['status'] ?? 'PENDING').toString().toUpperCase();
                                  
                                  String displayStatus = statusStr;
                                  Color statusColor = Colors.grey;
                                  if (statusStr == 'PENDING') {
                                    displayStatus = 'Pending Approval';
                                    statusColor = Colors.orange;
                                  } else if (statusStr == 'APPROVED') {
                                    displayStatus = 'Approved - Inventory Processing';
                                    statusColor = Colors.blue;
                                  } else if (statusStr == 'REJECTED') {
                                    displayStatus = 'Rejected';
                                    statusColor = Colors.red;
                                  } else if (statusStr == 'ISSUED') {
                                    displayStatus = 'Ready for Collection';
                                    statusColor = Colors.green;
                                  } else if (statusStr == 'COMPLETED') {
                                    displayStatus = 'Collected / Completed';
                                    statusColor = Colors.grey;
                                  }

                                  final itemsList = req['items'] as List? ?? [];
                                  
                                  return Card(
                                    margin: const EdgeInsets.only(bottom: 8),
                                    elevation: 0.5,
                                    shape: RoundedRectangleBorder(
                                      borderRadius: BorderRadius.circular(8),
                                      side: BorderSide(color: Colors.grey.shade300),
                                    ),
                                    child: Padding(
                                      padding: const EdgeInsets.all(12.0),
                                      child: Column(
                                        crossAxisAlignment: CrossAxisAlignment.start,
                                        children: [
                                          Row(
                                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                            children: [
                                              Text(
                                                'Req: $reqNo',
                                                style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13),
                                              ),
                                              Container(
                                                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                                                decoration: BoxDecoration(
                                                  color: statusColor.withAlpha(20),
                                                  borderRadius: BorderRadius.circular(4),
                                                  border: Border.all(color: statusColor.withAlpha(100)),
                                                ),
                                                child: Text(
                                                  displayStatus,
                                                  style: TextStyle(
                                                    fontSize: 10,
                                                    fontWeight: FontWeight.bold,
                                                    color: statusColor,
                                                  ),
                                                ),
                                              ),
                                            ],
                                          ),
                                          const SizedBox(height: 8),
                                          ...itemsList.map((it) {
                                            final partName = it['sparePart']?['partName'] ?? 'Spare Part';
                                            final qty = it['requestedQty'] ?? 0;
                                            final unit = it['sparePart']?['unit'] ?? 'PCS';
                                            return Padding(
                                              padding: const EdgeInsets.symmetric(vertical: 2.0),
                                              child: Text(
                                                '• $partName x $qty $unit',
                                                style: const TextStyle(fontSize: 12),
                                              ),
                                            );
                                          }),
                                        ],
                                      ),
                                    ),
                                  );
                                }),
                              const SizedBox(height: 10),
                              if (status.toUpperCase() != 'CLOSED' && status.toUpperCase() != 'COMPLETED')
                                SizedBox(
                                  width: double.infinity,
                                  child: OutlinedButton.icon(
                                    onPressed: () async {
                                      final result = await Navigator.push(
                                        context,
                                        MaterialPageRoute(
                                          builder: (_) => RequestPartsScreen(workOrderId: _workOrder.id),
                                        ),
                                      );
                                      if (result == true) {
                                        _loadDetails();
                                      }
                                    },
                                    icon: const Icon(Icons.add, size: 16),
                                    label: const Text('Request Spare Parts', style: TextStyle(fontSize: 12)),
                                  ),
                                ),
                            ],
                          ),
                        ),
                      ],
                      const SizedBox(height: 30),
                    ],
                  ),
                ),
    );
  }

  Widget _buildMetadataRow(String label, String value, {Widget? trailing, Color? valueColor}) {
    final theme = Theme.of(context);
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.center,
        children: [
          SizedBox(
            width: 100,
            child: Text(
              label,
              style: const TextStyle(
                color: Color(0xFF1E5CB3),
                fontWeight: FontWeight.bold,
                fontSize: 14,
              ),
            ),
          ),
          Expanded(
            child: Text(
              value,
              style: TextStyle(
                fontSize: 14,
                fontWeight: valueColor != null ? FontWeight.bold : FontWeight.normal,
                color: valueColor ?? (theme.brightness == Brightness.dark ? Colors.grey.shade300 : Colors.black87),
              ),
            ),
          ),
          if (trailing != null) ...[
            const SizedBox(width: 8),
            trailing,
          ],
        ],
      ),
    );
  }

  Widget _buildAccordionHeader({
    required String title,
    required bool isExpanded,
    required VoidCallback onTap,
  }) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 12),
        decoration: BoxDecoration(
          color: const Color(0xFF0F4C81), // Dark premium blue matching mockup
          borderRadius: isExpanded
              ? const BorderRadius.only(topLeft: Radius.circular(8), topRight: Radius.circular(8))
              : BorderRadius.circular(8),
        ),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(
              title,
              style: const TextStyle(
                color: Colors.white,
                fontWeight: FontWeight.bold,
                fontSize: 15,
              ),
            ),
            Icon(
              isExpanded ? Icons.keyboard_arrow_up : Icons.keyboard_arrow_down,
              color: Colors.white,
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildAccordionMetadataRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 6),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SizedBox(
            width: 150,
            child: Text(
              label,
              style: const TextStyle(
                color: Color(0xFF1E5CB3),
                fontWeight: FontWeight.bold,
                fontSize: 13,
              ),
            ),
          ),
          Expanded(
            child: Text(
              value,
              style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w500),
            ),
          ),
        ],
      ),
    );
  }
}

String _proxyUrl(String url) {
  if (url.toLowerCase().contains('.avif')) {
    final clean = url.replaceFirst(RegExp(r'^https?://'), '');
    return 'https://images.weserv.nl/?url=$clean&output=webp';
  }
  return url;
}
