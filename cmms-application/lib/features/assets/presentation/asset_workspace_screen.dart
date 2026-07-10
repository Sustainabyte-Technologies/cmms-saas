import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:provider/provider.dart';
import '../../../core/models/api_record.dart';
import '../../../core/providers/app_state.dart';
import '../../work_orders/presentation/work_order_detail_screen.dart';
import 'asset_history_screen.dart';
import 'breakdown_report_screen.dart';

class AssetWorkspaceScreen extends StatefulWidget {
  const AssetWorkspaceScreen({
    super.key,
    required this.asset,
    required this.onBack,
  });

  final Map<String, dynamic> asset;
  final VoidCallback onBack;

  @override
  State<AssetWorkspaceScreen> createState() => _AssetWorkspaceScreenState();
}

class _AssetWorkspaceScreenState extends State<AssetWorkspaceScreen> {
  bool _loading = true;
  String? _error;
  List<dynamic> _workOrders = [];
  List<dynamic> _pmSchedules = [];

  // Local additions to simulate breakdowns reported in the current session
  final List<Map<String, dynamic>> _reportedBreakdowns = [];

  @override
  void initState() {
    super.initState();
    _loadWorkspaceData();
  }

  Future<void> _loadWorkspaceData() async {
    if (!mounted) return;
    setState(() {
      _loading = true;
      _error = null;
    });

    try {
      final apiClient = Provider.of<AppState>(context, listen: false).apiClient;

      // 1. Fetch work orders
      final woData = await apiClient.get('/work-orders?limit=100');
      List<dynamic> woList = [];
      if (woData is List) {
        woList = woData;
      } else if (woData is Map && woData['data'] is List) {
        woList = woData['data'];
      }

      // 2. Fetch preventive maintenance
      final pmData = await apiClient.get('/preventive-maintenance');
      List<dynamic> pmList = [];
      if (pmData is List) {
        pmList = pmData;
      } else if (pmData is Map && pmData['schedules'] is List) {
        pmList = pmData['schedules'];
      } else if (pmData is Map && pmData['data'] is List) {
        pmList = pmData['data'];
      }

      if (mounted) {
        setState(() {
          _workOrders = woList;
          _pmSchedules = pmList;
          _loading = false;
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _error = 'Failed to load workspace data: ${e.toString()}';
          _loading = false;
        });
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;

    if (_loading) {
      return Scaffold(
        appBar: AppBar(
          leading: IconButton(
            icon: const Icon(Icons.arrow_back),
            onPressed: widget.onBack,
          ),
          title: const Text('Asset Workspace'),
        ),
        body: const Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              CircularProgressIndicator(),
              SizedBox(height: 16),
              Text('Initializing Asset Workspace...', style: TextStyle(fontWeight: FontWeight.w500)),
            ],
          ),
        ),
      );
    }

    if (_error != null) {
      return Scaffold(
        appBar: AppBar(
          leading: IconButton(
            icon: const Icon(Icons.arrow_back),
            onPressed: widget.onBack,
          ),
          title: const Text('Asset Workspace Error'),
        ),
        body: Padding(
          padding: const EdgeInsets.all(24.0),
          child: Center(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                const Icon(Icons.error_outline, size: 48, color: Colors.red),
                const SizedBox(height: 16),
                Text(_error!, textAlign: TextAlign.center, style: const TextStyle(color: Colors.red)),
                const SizedBox(height: 24),
                FilledButton.icon(
                  onPressed: _loadWorkspaceData,
                  icon: const Icon(Icons.refresh),
                  label: const Text('Retry Loading'),
                ),
              ],
            ),
          ),
        ),
      );
    }

    final state = context.watch<AppState>();
    final currentUserId = state.user?.id;

    // Filter work orders for this asset
    final assetWorkOrders = _workOrders.where((wo) {
      return wo['assetId'] == widget.asset['id'] ||
          (wo['asset'] is Map && wo['asset']['id'] == widget.asset['id']);
    }).toList();

    // Filter PM schedules for this asset
    final assetPMs = _pmSchedules.where((pm) => pm['assetId'] == widget.asset['id']).toList();

    // Identify active work order assigned to current technician
    final myActiveWorkOrders = assetWorkOrders.where((wo) {
      final isAssignedToMe = wo['assignedTechnicianId'] == currentUserId ||
          (wo['assignedTechnician'] is Map && wo['assignedTechnician']['id'] == currentUserId);
      final isOpenedOrInProgress = ['OPEN', 'ASSIGNED', 'IN_PROGRESS'].contains(wo['status']?.toString().toUpperCase());
      return isAssignedToMe && isOpenedOrInProgress;
    }).toList();

    final hasActiveWO = myActiveWorkOrders.isNotEmpty;
    final activeWO = hasActiveWO ? myActiveWorkOrders.first : null;

    // Calculate health based on asset status
    final assetStatus = widget.asset['status']?.toString().toUpperCase() ?? 'ACTIVE';
    String healthPercent = '95%';
    String healthLabel = 'Healthy';
    Color healthColor = Colors.green;

    if (assetStatus == 'BREAKDOWN') {
      healthPercent = '15%';
      healthLabel = 'Critical';
      healthColor = Colors.red;
    } else if (assetStatus == 'UNDER_MAINTENANCE') {
      healthPercent = '55%';
      healthLabel = 'Warning';
      healthColor = Colors.orange;
    } else if (assetStatus == 'IDLE') {
      healthPercent = '75%';
      healthLabel = 'Fair';
      healthColor = Colors.amber;
    }

    // Maintenance Summary KPIs
    final openWOsCount = assetWorkOrders.where((wo) => ['OPEN', 'ASSIGNED', 'IN_PROGRESS'].contains(wo['status']?.toString().toUpperCase())).length;
    final hasPM = assetPMs.isNotEmpty;
    final nextPMDate = hasPM ? _formatDate(assetPMs.first['nextDueDate']?.toString() ?? '') : '--';

    // Last completed maintenance date
    final completedWOs = assetWorkOrders.where((wo) => ['COMPLETED', 'CLOSED', 'APPROVED'].contains(wo['status']?.toString().toUpperCase())).toList();
    completedWOs.sort((a, b) => (b['updatedAt']?.toString() ?? '').compareTo(a['updatedAt']?.toString() ?? ''));
    final lastMaintenanceDate = completedWOs.isNotEmpty ? _formatDate(completedWOs.first['updatedAt']?.toString() ?? completedWOs.first['createdAt']?.toString() ?? '') : '--';

    // Last breakdown date
    final lastBreakdownDate = _reportedBreakdowns.isNotEmpty ? _formatDate(_reportedBreakdowns.first['createdAt'] ?? '') : '--';

    // Category criticality mapping
    String criticality = 'MEDIUM';
    final categoryUpper = widget.asset['category']?.toString().toUpperCase() ?? '';
    if (['HVAC', 'GENERATOR', 'MOTOR', 'BOILER', 'ELECTRICAL'].any((c) => categoryUpper.contains(c))) {
      criticality = 'HIGH';
    } else if (['TOOL', 'OFFICE', 'FURNITURE'].any((c) => categoryUpper.contains(c))) {
      criticality = 'LOW';
    }

    return Scaffold(
      appBar: AppBar(
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: widget.onBack,
        ),
        title: const Text('Asset Workspace', style: TextStyle(fontWeight: FontWeight.bold)),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            tooltip: 'Reload',
            onPressed: _loadWorkspaceData,
          ),
        ],
      ),
      body: RefreshIndicator(
        onRefresh: _loadWorkspaceData,
        child: ListView(
          padding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 12.0),
          children: [
            // 1. ACTIVE WORK ORDER BANNER
            if (hasActiveWO && activeWO != null) ...[
              GestureDetector(
                onTap: () {
                  Navigator.push(
                    context,
                    MaterialPageRoute(
                      builder: (context) => WorkOrderDetailScreen(
                        workOrder: ApiRecord(Map<String, dynamic>.from(activeWO)),
                      ),
                    ),
                  );
                },
                child: Card(
                  elevation: 2,
                  color: Colors.purple.shade50.withAlpha(isDark ? 30 : 255),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12),
                    side: BorderSide(color: Colors.purple.shade200, width: 1.5),
                  ),
                  child: Padding(
                    padding: const EdgeInsets.all(16.0),
                    child: Row(
                      children: [
                        Container(
                          padding: const EdgeInsets.all(8),
                          decoration: BoxDecoration(
                            color: Colors.purple.shade100.withAlpha(isDark ? 50 : 255),
                            shape: BoxShape.circle,
                          ),
                          child: Icon(Icons.play_circle_outline, color: Colors.purple.shade700, size: 24),
                        ),
                        const SizedBox(width: 12),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                'Active Job Assigned to You',
                                style: TextStyle(
                                  fontWeight: FontWeight.bold,
                                  fontSize: 14,
                                  color: isDark ? Colors.purple.shade300 : Colors.purple.shade900,
                                ),
                              ),
                              const SizedBox(height: 2),
                              Text(
                                '${activeWO['workOrderNumber'] ?? 'WO'}: ${activeWO['title'] ?? 'Work in Progress'}',
                                style: const TextStyle(fontSize: 12),
                                maxLines: 1,
                                overflow: TextOverflow.ellipsis,
                              ),
                            ],
                          ),
                        ),
                        const SizedBox(width: 8),
                        FilledButton(
                          onPressed: () {
                            Navigator.push(
                              context,
                              MaterialPageRoute(
                                builder: (context) => WorkOrderDetailScreen(
                                  workOrder: ApiRecord(Map<String, dynamic>.from(activeWO)),
                                ),
                              ),
                            );
                          },
                          style: FilledButton.styleFrom(
                            backgroundColor: Colors.purple.shade700,
                            foregroundColor: Colors.white,
                            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                            minimumSize: Size.zero,
                            tapTargetSize: MaterialTapTargetSize.shrinkWrap,
                          ),
                          child: const Text('Continue', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold)),
                        ),
                      ],
                    ),
                  ),
                ),
              ),
              const SizedBox(height: 16),
            ],

            // 2. ASSET SUMMARY CARD (IBM Maximo / SAP style Layout)
            Card(
              elevation: 1,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(16),
                side: BorderSide(color: Colors.grey.shade200),
              ),
              child: Padding(
                padding: const EdgeInsets.all(20.0),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Title and Codes
                    Row(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                widget.asset['assetName']?.toString() ?? 'Unnamed Asset',
                                style: theme.textTheme.titleMedium?.copyWith(
                                  fontWeight: FontWeight.bold,
                                  fontSize: 18,
                                ),
                              ),
                              const SizedBox(height: 4),
                              Row(
                                children: [
                                  Container(
                                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                                    decoration: BoxDecoration(
                                      color: theme.colorScheme.secondaryContainer,
                                      borderRadius: BorderRadius.circular(6),
                                    ),
                                    child: Text(
                                      widget.asset['assetCode']?.toString() ?? 'AST-XXXX',
                                      style: TextStyle(
                                        fontFamily: 'monospace',
                                        fontSize: 10,
                                        fontWeight: FontWeight.bold,
                                        color: theme.colorScheme.onSecondaryContainer,
                                      ),
                                    ),
                                  ),
                                  const SizedBox(width: 8),
                                  Text(
                                    widget.asset['category']?.toString() ?? 'Not Available',
                                    style: TextStyle(color: Colors.grey.shade600, fontSize: 11),
                                  ),
                                ],
                              ),
                            ],
                          ),
                        ),
                        Column(
                          crossAxisAlignment: CrossAxisAlignment.end,
                          children: [
                            // Health ring/badge
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                              decoration: BoxDecoration(
                                color: healthColor.withAlpha(20),
                                borderRadius: BorderRadius.circular(20),
                                border: Border.all(color: healthColor.withAlpha(100)),
                              ),
                              child: Row(
                                mainAxisSize: MainAxisSize.min,
                                children: [
                                  Container(
                                    width: 8,
                                    height: 8,
                                    decoration: BoxDecoration(color: healthColor, shape: BoxShape.circle),
                                  ),
                                  const SizedBox(width: 6),
                                  Text(
                                    '$healthPercent Health',
                                    style: TextStyle(
                                      fontSize: 10,
                                      fontWeight: FontWeight.bold,
                                      color: healthColor,
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          ],
                        ),
                      ],
                    ),
                    const Divider(height: 32),

                    // Organization Metadata Details Grid
                    _buildMetadataGrid(theme),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 16),

            // 3. MAINTENANCE SUMMARY (KPI CARDS)
            Text(
              'Maintenance Summary',
              style: theme.textTheme.titleSmall?.copyWith(fontWeight: FontWeight.bold, letterSpacing: 0.5),
            ),
            const SizedBox(height: 10),
            GridView.count(
              crossAxisCount: 2,
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              crossAxisSpacing: 12,
              mainAxisSpacing: 12,
              childAspectRatio: 1.5,
              children: [
                _buildKpiCard('Open Work Orders', openWOsCount.toString(), Icons.assignment_outlined, Colors.orange),
                _buildKpiCard('Upcoming PM', nextPMDate, Icons.event_repeat, theme.colorScheme.primary),
                _buildKpiCard('Last Maintenance', lastMaintenanceDate, Icons.build_circle_outlined, Colors.green),
                _buildKpiCard('Last Breakdown', lastBreakdownDate, Icons.report_problem_outlined, Colors.red),
                _buildKpiCard('Asset Criticality', criticality, Icons.warning_amber, Colors.red.shade700),
                _buildKpiCard('Health Status', healthLabel, Icons.favorite_border, healthColor),
              ],
            ),
            const SizedBox(height: 24),

            // 4. ACTIVE PM CHECKLIST CALLOUT
            _buildUpcomingPMCallout(theme, assetPMs),
            const SizedBox(height: 20),

            // 5. QUICK ACTIONS
            Text(
              'Workspace Actions',
              style: theme.textTheme.titleSmall?.copyWith(fontWeight: FontWeight.bold, letterSpacing: 0.5),
            ),
            const SizedBox(height: 10),
            GridView.count(
              crossAxisCount: 2,
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              crossAxisSpacing: 12,
              mainAxisSpacing: 12,
              childAspectRatio: 1.35,
              children: [
                _buildActionCard(
                  context,
                  title: 'Start PM Checklist',
                  subtitle: hasPM ? 'Run active PM routine' : 'No schedules',
                  icon: Icons.checklist_outlined,
                  color: Colors.blue.shade700,
                  onTap: () => _handleStartPM(context, assetPMs),
                ),
                _buildActionCard(
                  context,
                  title: 'Report Breakdown',
                  subtitle: 'Log on-site fault report',
                  icon: Icons.error_outline,
                  color: Colors.red.shade700,
                  onTap: () {
                    Navigator.push(
                      context,
                      MaterialPageRoute(
                        builder: (context) => BreakdownReportScreen(
                          asset: widget.asset,
                          onSubmitMock: (breakdown) {
                            setState(() {
                              _reportedBreakdowns.add(breakdown);
                            });
                          },
                        ),
                      ),
                    );
                  },
                ),
                _buildActionCard(
                  context,
                  title: 'Asset History',
                  subtitle: 'WO log & audit timeline',
                  icon: Icons.history,
                  color: const Color(0xFF047857),
                  onTap: () {
                    Navigator.push(
                      context,
                      MaterialPageRoute(
                        builder: (context) => AssetHistoryScreen(
                          asset: widget.asset,
                          workOrders: _workOrders,
                          pmSchedules: _pmSchedules,
                        ),
                      ),
                    );
                  },
                ),
                _buildActionCard(
                  context,
                  title: 'Manuals & Docs',
                  subtitle: 'User manuals & SOPs',
                  icon: Icons.description_outlined,
                  color: Colors.indigo.shade700,
                  onTap: () => _showDocumentsDialog(context),
                ),
              ],
            ),
            const SizedBox(height: 32),
          ],
        ),
      ),
    );
  }

  // Build metadata fields grid layout (Customer, Site, Department, System, Location)
  Widget _buildMetadataGrid(ThemeData theme) {
    final customer = widget.asset['customer']?['name']?.toString() ?? 'Not Available';
    final site = widget.asset['site']?['name']?.toString() ?? 'Not Available';
    final dept = widget.asset['department']?['name']?.toString() ?? 'Not Available';
    final system = widget.asset['system']?['name']?.toString() ?? 'Not Available';
    final location = widget.asset['location']?.toString() ?? 'Not Available';

    return Column(
      children: [
        _buildMetadataRow('Customer', customer, Icons.business),
        _buildMetadataRow('Site', site, Icons.location_city),
        _buildMetadataRow('Department', dept, Icons.apartment),
        _buildMetadataRow('System', system, Icons.hub_outlined),
        _buildMetadataRow('Location', location, Icons.location_on_outlined),
      ],
    );
  }

  Widget _buildMetadataRow(String label, String value, IconData icon) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4.0),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(icon, size: 16, color: Colors.grey.shade500),
          const SizedBox(width: 8),
          SizedBox(
            width: 90,
            child: Text(
              label,
              style: TextStyle(
                fontWeight: FontWeight.w600,
                fontSize: 12,
                color: Colors.grey.shade600,
              ),
            ),
          ),
          Expanded(
            child: Text(
              value,
              style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w500),
            ),
          ),
        ],
      ),
    );
  }

  // KPI card widgets
  Widget _buildKpiCard(String label, String value, IconData icon, Color color) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    return Card(
      elevation: 0.5,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(12),
        side: BorderSide(color: Colors.grey.shade200),
      ),
      child: Padding(
        padding: const EdgeInsets.all(12.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  label,
                  style: TextStyle(
                    fontSize: 10,
                    fontWeight: FontWeight.bold,
                    color: Colors.grey.shade600,
                  ),
                ),
                Icon(icon, size: 16, color: color),
              ],
            ),
            Text(
              value,
              style: TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.bold,
                color: isDark ? Colors.white : Colors.black87,
              ),
            ),
          ],
        ),
      ),
    );
  }

  // Large Action Cards grid item builder
  Widget _buildActionCard(
    BuildContext context, {
    required String title,
    required String subtitle,
    required IconData icon,
    required Color color,
    required VoidCallback onTap,
  }) {
    return Card(
      elevation: 1,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(14),
        side: BorderSide(color: Colors.grey.shade200),
      ),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(14),
        child: Padding(
          padding: const EdgeInsets.all(16.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Container(
                padding: const EdgeInsets.all(8),
                decoration: BoxDecoration(
                  color: color.withAlpha(20),
                  shape: BoxShape.circle,
                ),
                child: Icon(icon, color: color, size: 24),
              ),
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    title,
                    style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13),
                  ),
                  const SizedBox(height: 2),
                  Text(
                    subtitle,
                    style: TextStyle(color: Colors.grey.shade500, fontSize: 10),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                ],
              )
            ],
          ),
        ),
      ),
    );
  }

  // Upcoming PM display layout callout
  Widget _buildUpcomingPMCallout(ThemeData theme, List<dynamic> schedules) {
    if (schedules.isEmpty) {
      return Card(
        elevation: 0,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(12),
          side: BorderSide(color: Colors.grey.shade300),
        ),
        color: Colors.grey.shade50.withAlpha(theme.brightness == Brightness.dark ? 20 : 255),
        child: const Padding(
          padding: EdgeInsets.all(16.0),
          child: Center(
            child: Text(
              'No Scheduled Preventive Maintenance',
              style: TextStyle(color: Colors.grey, fontSize: 12, fontWeight: FontWeight.w500),
            ),
          ),
        ),
      );
    }

    final pm = schedules.first;
    final title = pm['title']?.toString() ?? 'Routine Inspection';
    final dueDate = pm['nextDueDate']?.toString() ?? '';
    final freq = pm['frequency']?.toString() ?? 'Monthly';

    return Card(
      elevation: 0.5,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Row(
              children: [
                Icon(Icons.event_repeat, color: theme.colorScheme.primary, size: 20),
                const SizedBox(width: 8),
                const Text(
                  'Upcoming PM Task',
                  style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13),
                ),
              ],
            ),
            const Divider(height: 20),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(title, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
                    const SizedBox(height: 4),
                    Text('Due Date: ${_formatDate(dueDate)}', style: TextStyle(color: Colors.grey.shade600, fontSize: 11)),
                  ],
                ),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                  decoration: BoxDecoration(
                    color: theme.colorScheme.primaryContainer,
                    borderRadius: BorderRadius.circular(6),
                  ),
                  child: Text(
                    freq,
                    style: TextStyle(
                      fontSize: 10,
                      fontWeight: FontWeight.bold,
                      color: theme.colorScheme.onPrimaryContainer,
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 12),
            FilledButton.icon(
              onPressed: () => _handleStartPM(context, schedules),
              icon: const Icon(Icons.play_arrow_outlined, size: 18),
              label: const Text('Start PM Routine', style: TextStyle(fontSize: 12)),
              style: FilledButton.styleFrom(
                padding: const EdgeInsets.symmetric(vertical: 8),
                minimumSize: Size.zero,
              ),
            ),
          ],
        ),
      ),
    );
  }

  // Handle PM Checklist initiation flow
  void _handleStartPM(BuildContext context, List<dynamic> schedules) {
    if (schedules.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('No PM Scheduled for this asset.')),
      );
      return;
    }

    final pm = schedules.first;
    final template = pm['checklistTemplate'];
    final List<dynamic> items = template is Map && template['items'] is List
        ? template['items']
        : [
            {'title': 'Verify primary electrical connections', 'isRequired': true},
            {'title': 'Check fan cooling ventilation paths', 'isRequired': true},
            {'title': 'Confirm operational parameters match baseline specs', 'isRequired': false},
          ];

    // Show Checklist Bottom Sheet Modal
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.only(topLeft: Radius.circular(20), topRight: Radius.circular(20)),
      ),
      builder: (context) {
        return _PmChecklistForm(
          pmTitle: pm['title']?.toString() ?? 'Inspection Checklist',
          assetName: widget.asset['assetName']?.toString() ?? 'Asset',
          checklistItems: List<Map<String, dynamic>>.from(items),
          onComplete: () {
            ScaffoldMessenger.of(context).showSnackBar(
              const SnackBar(content: Text('Preventive Maintenance checklist completed and logged.')),
            );
          },
        );
      },
    );
  }

  // Show documents viewer popup dialog
  void _showDocumentsDialog(BuildContext context) {
    showModalBottomSheet(
      context: context,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.only(topLeft: Radius.circular(20), topRight: Radius.circular(20)),
      ),
      builder: (context) => SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(20.0),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              const Text(
                'Manuals & Documentation',
                style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
              ),
              const SizedBox(height: 12),
              _buildDocListTile(context, 'User Operations Manual.pdf', 'PDF File | 4.2 MB'),
              _buildDocListTile(context, 'SOP: Maintenance & Calibration.pdf', 'PDF File | 1.8 MB'),
              _buildDocListTile(context, 'Wiring Schematic & Drawings.dwg', 'CAD File | 12.5 MB'),
              const SizedBox(height: 12),
              TextButton(
                onPressed: () => Navigator.pop(context),
                child: const Text('Close'),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildDocListTile(BuildContext context, String filename, String desc) {
    return ListTile(
      leading: const Icon(Icons.picture_as_pdf, color: Colors.red),
      title: Text(filename, style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w500)),
      subtitle: Text(desc, style: const TextStyle(fontSize: 11)),
      trailing: const Icon(Icons.download, size: 18),
      onTap: () {
        Navigator.pop(context);
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Downloading "$filename"...')),
        );
      },
    );
  }

  String _formatDate(String isoString) {
    if (isoString.isEmpty) return '--';
    try {
      final date = DateTime.parse(isoString);
      return DateFormat('dd MMM yyyy').format(date);
    } catch (_) {
      return isoString;
    }
  }
}

// Inline Stateful widget for PM Checklist interactive sheets
class _PmChecklistForm extends StatefulWidget {
  const _PmChecklistForm({
    required this.pmTitle,
    required this.assetName,
    required this.checklistItems,
    required this.onComplete,
  });

  final String pmTitle;
  final String assetName;
  final List<Map<String, dynamic>> checklistItems;
  final VoidCallback onComplete;

  @override
  State<_PmChecklistForm> createState() => _PmChecklistFormState();
}

class _PmChecklistFormState extends State<_PmChecklistForm> {
  late final List<bool> _checked;

  @override
  void initState() {
    super.initState();
    _checked = List<bool>.filled(widget.checklistItems.length, false);
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;

    return DraggableScrollableSheet(
      expand: false,
      initialChildSize: 0.8,
      builder: (context, scrollController) => Column(
        children: [
          // Sheet Drag Handle & Header
          Padding(
            padding: const EdgeInsets.all(16.0),
            child: Column(
              children: [
                Container(
                  width: 40,
                  height: 4,
                  decoration: BoxDecoration(color: Colors.grey.shade300, borderRadius: BorderRadius.circular(2)),
                ),
                const SizedBox(height: 16),
                Text(
                  widget.pmTitle,
                  style: theme.textTheme.titleMedium?.copyWith(fontWeight: FontWeight.bold),
                ),
                Text(
                  'Asset: ${widget.assetName}',
                  style: theme.textTheme.bodySmall?.copyWith(color: Colors.grey.shade600),
                ),
              ],
            ),
          ),
          const Divider(height: 1),

          // Checklist items scroll list
          Expanded(
            child: ListView.separated(
              controller: scrollController,
              padding: const EdgeInsets.all(16.0),
              itemCount: widget.checklistItems.length,
              separatorBuilder: (_, __) => const Divider(),
              itemBuilder: (context, index) {
                final item = widget.checklistItems[index];
                final isRequired = item['isRequired'] == true;

                return CheckboxListTile(
                  value: _checked[index],
                  controlAffinity: ListTileControlAffinity.leading,
                  title: Row(
                    children: [
                      Expanded(
                        child: Text(
                          item['title'] ?? '',
                          style: TextStyle(
                            decoration: _checked[index] ? TextDecoration.lineThrough : TextDecoration.none,
                            fontSize: 13,
                          ),
                        ),
                      ),
                      if (isRequired)
                        Container(
                          margin: const EdgeInsets.only(left: 6),
                          padding: const EdgeInsets.symmetric(horizontal: 4, vertical: 2),
                          decoration: BoxDecoration(
                            color: Colors.red.shade50.withAlpha(isDark ? 30 : 255),
                            borderRadius: BorderRadius.circular(4),
                            border: Border.all(color: Colors.red.shade200),
                          ),
                          child: Text(
                            'Required',
                            style: TextStyle(fontSize: 8, color: Colors.red.shade700, fontWeight: FontWeight.bold),
                          ),
                        ),
                    ],
                  ),
                  onChanged: (val) {
                    setState(() {
                      _checked[index] = val ?? false;
                    });
                  },
                );
              },
            ),
          ),
          const Divider(height: 1),

          // Completion Button
          Padding(
            padding: const EdgeInsets.all(16.0),
            child: Row(
              children: [
                Expanded(
                  child: TextButton(
                    onPressed: () => Navigator.pop(context),
                    child: const Text('Cancel'),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  flex: 2,
                  child: FilledButton(
                    onPressed: () {
                      // Validate all required items are checked
                      for (int i = 0; i < widget.checklistItems.length; i++) {
                        final isRequired = widget.checklistItems[i]['isRequired'] == true;
                        if (isRequired && !_checked[i]) {
                          ScaffoldMessenger.of(context).showSnackBar(
                            SnackBar(
                              content: Text('Please complete all required items: "${widget.checklistItems[i]['title']}"'),
                              backgroundColor: Colors.red.shade700,
                            ),
                          );
                          return;
                        }
                      }
                      widget.onComplete();
                      Navigator.pop(context); // close sheet
                    },
                    child: const Text('Complete PM Checklist', style: TextStyle(fontWeight: FontWeight.bold)),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
