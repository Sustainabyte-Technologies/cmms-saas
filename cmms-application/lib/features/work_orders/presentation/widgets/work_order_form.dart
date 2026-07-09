import 'package:flutter/material.dart';
import 'package:intl/intl.dart';

import '../../../../core/api/api_client.dart';

class WorkOrderForm extends StatefulWidget {
  const WorkOrderForm({
    super.key,
    required this.apiClient,
    this.initialValues,
    required this.onSubmit,
  });

  final ApiClient apiClient;
  final Map<String, dynamic>? initialValues;
  final void Function(Map<String, dynamic> submittedValues) onSubmit;

  @override
  State<WorkOrderForm> createState() => _WorkOrderFormState();
}

class _WorkOrderFormState extends State<WorkOrderForm> {
  final _formKey = GlobalKey<FormState>();
  bool _isLoadingOptions = false;
  String? _errorMsg;

  // Form Fields State
  late final TextEditingController _titleController;
  late final TextEditingController _descriptionController;
  late final TextEditingController _dueDateController;

  // Selected option IDs
  String? _selectedPriority;
  String? _selectedWorkType;
  String? _selectedAssetId;
  String? _selectedTechId;
  String? _selectedTemplateId;
  DateTime? _selectedDueDate;

  // Lists fetched from API
  List<dynamic> _assets = [];
  List<dynamic> _technicians = [];
  List<dynamic> _templates = [];

  final List<Map<String, String>> _priorityOptions = const [
    {'value': 'LOW', 'label': 'Low'},
    {'value': 'MEDIUM', 'label': 'Medium'},
    {'value': 'HIGH', 'label': 'High'},
    {'value': 'CRITICAL', 'label': 'Critical'},
  ];

  final List<Map<String, String>> _workTypeOptions = const [
    {'value': 'REACTIVE', 'label': 'Reactive (Breakdown)'},
    {'value': 'PREVENTIVE', 'label': 'Preventive'},
    {'value': 'INSPECTION', 'label': 'Inspection'},
  ];

  @override
  void initState() {
    super.initState();

    final init = widget.initialValues ?? {};
    _titleController = TextEditingController(text: init['title']?.toString() ?? '');
    _descriptionController = TextEditingController(text: init['description']?.toString() ?? '');

    // Setup initial status / defaults
    _selectedPriority = init['priority']?.toString().toUpperCase() ?? 'MEDIUM';
    _selectedWorkType = init['workType']?.toString().toUpperCase() ?? 'REACTIVE';

    _selectedAssetId = _getInitialId('assetId', 'asset');
    _selectedTechId = _getInitialId('assignedTechnicianId', 'assignedTechnician');
    _selectedTemplateId = _getInitialId('checklistTemplateId', 'checklistTemplate');

    if (init['dueDate'] != null) {
      _selectedDueDate = DateTime.tryParse(init['dueDate'].toString());
    }
    _dueDateController = TextEditingController(
      text: _selectedDueDate != null
          ? DateFormat('yyyy-MM-dd HH:mm').format(_selectedDueDate!)
          : '',
    );

    _fetchOptions();
  }

  @override
  void dispose() {
    _titleController.dispose();
    _descriptionController.dispose();
    _dueDateController.dispose();
    super.dispose();
  }

  String? _getInitialId(String idKey, String objectKey) {
    if (widget.initialValues == null) return null;
    if (widget.initialValues![idKey] != null) {
      return widget.initialValues![idKey].toString();
    }
    final obj = widget.initialValues![objectKey];
    if (obj is Map) {
      return obj['id']?.toString();
    }
    return null;
  }

  Future<void> _fetchOptions() async {
    if (!mounted) return;
    setState(() {
      _isLoadingOptions = true;
      _errorMsg = null;
    });

    try {
      // Fetch assets, users, templates in parallel
      final results = await Future.wait([
        widget.apiClient.get('/assets?limit=1000'),
        widget.apiClient.get('/users'),
        widget.apiClient.get('/checklists/templates?limit=1000'),
      ]);

      // 1. Process Assets
      List<dynamic> assetsList = [];
      final assetRes = results[0];
      if (assetRes is List) {
        assetsList = assetRes;
      } else if (assetRes is Map && assetRes['data'] is List) {
        assetsList = assetRes['data'];
      }

      // 2. Process Users (filtering to Technician)
      List<dynamic> techList = [];
      final usersRes = results[1];
      List<dynamic> allUsers = [];
      if (usersRes is List) {
        allUsers = usersRes;
      } else if (usersRes is Map && usersRes['data'] is List) {
        allUsers = usersRes['data'];
      }
      techList = allUsers.where((u) {
        final roleObj = u['role'];
        final roleName = roleObj is Map ? roleObj['name']?.toString() : u['roleName']?.toString();
        return roleName?.toUpperCase() == 'TECHNICIAN';
      }).toList();

      // 3. Process Checklist Templates
      List<dynamic> templatesList = [];
      final templateRes = results[2];
      if (templateRes is List) {
        templatesList = templateRes;
      } else if (templateRes is Map) {
        if (templateRes['templates'] is List) {
          templatesList = templateRes['templates'];
        } else if (templateRes['data'] is List) {
          templatesList = templateRes['data'];
        }
      }

      if (!mounted) return;
      setState(() {
        _assets = assetsList;
        _technicians = techList;
        _templates = templatesList;

        // Verify loaded selections actually exist in option sets
        if (_selectedAssetId != null && !_assets.any((a) => a['id'] == _selectedAssetId)) {
          _selectedAssetId = null;
        }
        if (_selectedTechId != null && !_technicians.any((t) => t['id'] == _selectedTechId)) {
          _selectedTechId = null;
        }
        if (_selectedTemplateId != null && !_templates.any((t) => t['id'] == _selectedTemplateId)) {
          _selectedTemplateId = null;
        }
      });
    } catch (e) {
      if (!mounted) return;
      setState(() {
        _errorMsg = 'Failed to load form options from server';
      });
    } finally {
      if (mounted) {
        setState(() {
          _isLoadingOptions = false;
        });
      }
    }
  }

  Future<void> _selectDueDate() async {
    final DateTime? date = await showDatePicker(
      context: context,
      initialDate: _selectedDueDate ?? DateTime.now().add(const Duration(hours: 4)),
      firstDate: DateTime.now().subtract(const Duration(days: 365)),
      lastDate: DateTime.now().add(const Duration(days: 365 * 5)),
    );

    if (date == null) return;

    if (!mounted) return;

    final TimeOfDay? time = await showTimePicker(
      context: context,
      initialTime: TimeOfDay.fromDateTime(
        _selectedDueDate ?? DateTime.now().add(const Duration(hours: 4)),
      ),
    );

    if (time == null) return;

    setState(() {
      _selectedDueDate = DateTime(
        date.year,
        date.month,
        date.day,
        time.hour,
        time.minute,
      );
      _dueDateController.text = DateFormat('yyyy-MM-dd HH:mm').format(_selectedDueDate!);
    });
  }

  void _submit() {
    if (!_formKey.currentState!.validate()) return;

    final values = {
      'title': _titleController.text.trim(),
      'description': _descriptionController.text.trim().isEmpty ? null : _descriptionController.text.trim(),
      'assetId': _selectedAssetId,
      'priority': _selectedPriority,
      'workType': _selectedWorkType,
      'assignedTechnicianId': _selectedTechId,
      'dueDate': _selectedDueDate?.toIso8601String(),
      'checklistTemplateId': _selectedTemplateId,
    };

    widget.onSubmit(values);
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isEdit = widget.initialValues != null;

    return Container(
      padding: EdgeInsets.only(
        top: 16,
        left: 16,
        right: 16,
        bottom: MediaQuery.of(context).viewInsets.bottom + 16,
      ),
      child: SafeArea(
        child: SingleChildScrollView(
          child: Form(
            key: _formKey,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                // Header indicator and title
                Center(
                  child: Container(
                    width: 40,
                    height: 4,
                    margin: const EdgeInsets.only(bottom: 16),
                    decoration: BoxDecoration(
                      color: Colors.grey.shade300,
                      borderRadius: BorderRadius.circular(2),
                    ),
                  ),
                ),
                Row(
                  children: [
                    Icon(
                      isEdit ? Icons.edit_note : Icons.add_task,
                      color: theme.colorScheme.primary,
                      size: 28,
                    ),
                    const SizedBox(width: 8),
                    Text(
                      isEdit ? 'Update Work Order' : 'Create New Work Order',
                      style: theme.textTheme.titleLarge?.copyWith(
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ],
                ),
                const Divider(height: 24),

                if (_isLoadingOptions)
                  const Padding(
                    padding: EdgeInsets.symmetric(vertical: 24),
                    child: Center(
                      child: Column(
                        children: [
                          CircularProgressIndicator(),
                          SizedBox(height: 12),
                          Text('Loading options from server...'),
                        ],
                      ),
                    ),
                  )
                else if (_errorMsg != null)
                  Padding(
                    padding: const EdgeInsets.symmetric(vertical: 16),
                    child: Column(
                      children: [
                        Text(
                          _errorMsg!,
                          style: const TextStyle(color: Colors.red),
                        ),
                        const SizedBox(height: 8),
                        ElevatedButton(
                          onPressed: _fetchOptions,
                          child: const Text('Retry'),
                        ),
                      ],
                    ),
                  )
                else ...[
                  // Basic Details section
                  _buildSectionTitle('Basic Details', Icons.info_outline),
                  const SizedBox(height: 12),
                  TextFormField(
                    controller: _titleController,
                    decoration: const InputDecoration(
                      labelText: 'Work Order Title *',
                      prefixIcon: Icon(Icons.assignment_outlined),
                    ),
                    validator: (v) =>
                        v == null || v.trim().isEmpty ? 'Title is required' : null,
                  ),
                  const SizedBox(height: 12),
                  TextFormField(
                    controller: _descriptionController,
                    minLines: 2,
                    maxLines: 4,
                    decoration: const InputDecoration(
                      labelText: 'Description',
                      alignLabelWithHint: true,
                    ),
                  ),
                  const SizedBox(height: 24),

                  // Classifications & Priority section
                  _buildSectionTitle('Classifications', Icons.tune),
                  const SizedBox(height: 12),
                  Row(
                    children: [
                      Expanded(
                        child: DropdownButtonFormField<String>(
                          value: _selectedPriority,
                          decoration: const InputDecoration(
                            labelText: 'Priority',
                            prefixIcon: Icon(Icons.priority_high),
                          ),
                          items: _priorityOptions
                              .map((p) => DropdownMenuItem<String>(
                                    value: p['value'],
                                    child: Text(p['label']!),
                                  ))
                              .toList(),
                          onChanged: (val) {
                            setState(() {
                              _selectedPriority = val;
                            });
                          },
                        ),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: DropdownButtonFormField<String>(
                          value: _selectedWorkType,
                          decoration: const InputDecoration(
                            labelText: 'Work Type',
                            prefixIcon: Icon(Icons.build_outlined),
                          ),
                          items: _workTypeOptions
                              .map((wt) => DropdownMenuItem<String>(
                                    value: wt['value'],
                                    child: Text(wt['label']!),
                                  ))
                              .toList(),
                          onChanged: (val) {
                            setState(() {
                              _selectedWorkType = val;
                            });
                          },
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 24),

                  // Target Assignment section
                  _buildSectionTitle('Assignment & Targets', Icons.people_outline),
                  const SizedBox(height: 12),

                  // Linked Asset Dropdown
                  DropdownButtonFormField<String>(
                    value: _selectedAssetId,
                    decoration: const InputDecoration(
                      labelText: 'Linked Asset',
                      prefixIcon: Icon(Icons.precision_manufacturing),
                    ),
                    items: [
                      const DropdownMenuItem<String>(
                        value: null,
                        child: Text('— Select Asset —'),
                      ),
                      ..._assets.map((a) => DropdownMenuItem<String>(
                            value: a['id']?.toString(),
                            child: Text(a['assetName']?.toString() ?? 'Unnamed'),
                          )),
                    ],
                    onChanged: (val) {
                      setState(() {
                        _selectedAssetId = val;
                      });
                    },
                  ),
                  const SizedBox(height: 12),

                  // Assignee Dropdown
                  DropdownButtonFormField<String>(
                    value: _selectedTechId,
                    decoration: const InputDecoration(
                      labelText: 'Assigned Technician',
                      prefixIcon: Icon(Icons.engineering_outlined),
                    ),
                    items: [
                      const DropdownMenuItem<String>(
                        value: null,
                        child: Text('— Unassigned —'),
                      ),
                      ..._technicians.map((t) => DropdownMenuItem<String>(
                            value: t['id']?.toString(),
                            child: Text(t['fullName']?.toString() ?? 'Unnamed'),
                          )),
                    ],
                    onChanged: (val) {
                      setState(() {
                        _selectedTechId = val;
                      });
                    },
                  ),
                  const SizedBox(height: 12),

                  // Checklist Template Dropdown
                  DropdownButtonFormField<String>(
                    value: _selectedTemplateId,
                    decoration: const InputDecoration(
                      labelText: 'Checklist Template',
                      prefixIcon: Icon(Icons.checklist_outlined),
                    ),
                    items: [
                      const DropdownMenuItem<String>(
                        value: null,
                        child: Text('— None —'),
                      ),
                      ..._templates.map((t) => DropdownMenuItem<String>(
                            value: t['id']?.toString(),
                            child: Text(t['name']?.toString() ?? 'Unnamed'),
                          )),
                    ],
                    onChanged: (val) {
                      setState(() {
                        _selectedTemplateId = val;
                      });
                    },
                  ),
                  const SizedBox(height: 12),

                  // Due date picker field
                  TextFormField(
                    controller: _dueDateController,
                    readOnly: true,
                    decoration: const InputDecoration(
                      labelText: 'Due Date',
                      prefixIcon: Icon(Icons.calendar_today_outlined),
                    ),
                    onTap: _selectDueDate,
                  ),
                  const SizedBox(height: 24),
                ],

                const Divider(height: 16),
                Row(
                  mainAxisAlignment: MainAxisAlignment.end,
                  children: [
                    TextButton(
                      onPressed: () => Navigator.pop(context),
                      child: const Text('Cancel'),
                    ),
                    const SizedBox(width: 8),
                    FilledButton(
                      onPressed: _submit,
                      child: Text(isEdit ? 'Save Changes' : 'Create Work Order'),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildSectionTitle(String title, IconData icon) {
    final theme = Theme.of(context);
    return Row(
      children: [
        Icon(icon, size: 18, color: theme.colorScheme.secondary),
        const SizedBox(width: 6),
        Text(
          title,
          style: theme.textTheme.titleSmall?.copyWith(
            fontWeight: FontWeight.bold,
            color: theme.colorScheme.secondary,
          ),
        ),
      ],
    );
  }
}
