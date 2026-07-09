import 'package:flutter/material.dart';

import '../../../../core/api/api_client.dart';

class AssetForm extends StatefulWidget {
  const AssetForm({
    super.key,
    required this.apiClient,
    this.initialValues,
    required this.onSubmit,
  });

  final ApiClient apiClient;
  final Map<String, dynamic>? initialValues;
  final void Function(Map<String, dynamic> submittedValues) onSubmit;

  @override
  State<AssetForm> createState() => _AssetFormState();
}

class _AssetFormState extends State<AssetForm> {
  final _formKey = GlobalKey<FormState>();
  bool _isLoadingCustomers = false;
  String? _customersError;
  List<dynamic> _customers = [];

  // Form Field Controllers
  late final TextEditingController _nameController;
  late final TextEditingController _categoryController;
  late final TextEditingController _locationController;
  late final TextEditingController _manufacturerController;
  late final TextEditingController _modelController;
  late final TextEditingController _serialController;
  late final TextEditingController _capacityController;
  late final TextEditingController _powerRatingController;
  late final TextEditingController _descriptionController;

  // System Assignment State
  String? _selectedCustomerId;
  String? _selectedSiteId;
  String? _selectedDeptId;
  String? _selectedSystemId;

  @override
  void initState() {
    super.initState();

    final init = widget.initialValues ?? {};
    _nameController = TextEditingController(text: init['assetName']?.toString() ?? '');
    _categoryController = TextEditingController(text: init['category']?.toString() ?? '');
    _locationController = TextEditingController(text: init['location']?.toString() ?? '');
    _manufacturerController = TextEditingController(text: init['manufacturer']?.toString() ?? '');
    _modelController = TextEditingController(text: init['modelNumber']?.toString() ?? '');
    _serialController = TextEditingController(text: init['serialNumber']?.toString() ?? '');
    _capacityController = TextEditingController(text: init['capacity']?.toString() ?? '');
    _powerRatingController = TextEditingController(text: init['powerRating']?.toString() ?? '');
    _descriptionController = TextEditingController(text: init['description']?.toString() ?? '');

    _selectedCustomerId = _getInitialId('customerId', 'customer');
    _selectedSiteId = _getInitialId('siteId', 'site');
    _selectedDeptId = _getInitialId('departmentId', 'department');
    _selectedSystemId = _getInitialId('systemId', 'system');

    _fetchCustomers();
  }

  @override
  void dispose() {
    _nameController.dispose();
    _categoryController.dispose();
    _locationController.dispose();
    _manufacturerController.dispose();
    _modelController.dispose();
    _serialController.dispose();
    _capacityController.dispose();
    _powerRatingController.dispose();
    _descriptionController.dispose();
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

  Future<void> _fetchCustomers() async {
    if (!mounted) return;
    setState(() {
      _isLoadingCustomers = true;
      _customersError = null;
    });

    try {
      final response = await widget.apiClient.get('/customers?limit=1000');
      List<dynamic> list = [];
      if (response is List) {
        list = response;
      } else if (response is Map && response['data'] is List) {
        list = response['data'];
      }

      if (!mounted) return;
      setState(() {
        _customers = list;
        // Verify initialized IDs exist in the fetched tree, else clear them
        if (_selectedCustomerId != null && !_customers.any((c) => c['id'] == _selectedCustomerId)) {
          _selectedCustomerId = null;
          _selectedSiteId = null;
          _selectedDeptId = null;
          _selectedSystemId = null;
        }
      });
    } catch (e) {
      if (!mounted) return;
      setState(() {
        _customersError = 'Failed to load customers for system assignment';
      });
    } finally {
      if (mounted) {
        setState(() {
          _isLoadingCustomers = false;
        });
      }
    }
  }

  // Get sites list for currently selected customer
  List<dynamic> get _availableSites {
    if (_selectedCustomerId == null) return [];
    final customer = _customers.firstWhere(
      (c) => c['id'] == _selectedCustomerId,
      orElse: () => null,
    );
    if (customer == null || customer['sites'] == null) return [];
    return customer['sites'] as List<dynamic>;
  }

  // Get departments list for currently selected site
  List<dynamic> get _availableDepartments {
    if (_selectedSiteId == null) return [];
    final site = _availableSites.firstWhere(
      (s) => s['id'] == _selectedSiteId,
      orElse: () => null,
    );
    if (site == null || site['departments'] == null) return [];
    return site['departments'] as List<dynamic>;
  }

  // Get systems list for currently selected department
  List<dynamic> get _availableSystems {
    if (_selectedDeptId == null) return [];
    final dept = _availableDepartments.firstWhere(
      (d) => d['id'] == _selectedDeptId,
      orElse: () => null,
    );
    if (dept == null || dept['systems'] == null) return [];
    return dept['systems'] as List<dynamic>;
  }

  void _submit() {
    if (!_formKey.currentState!.validate()) return;

    final values = {
      'assetName': _nameController.text.trim(),
      'category': _categoryController.text.trim(),
      'location': _locationController.text.trim(),
      'manufacturer': _manufacturerController.text.trim().isEmpty ? null : _manufacturerController.text.trim(),
      'modelNumber': _modelController.text.trim().isEmpty ? null : _modelController.text.trim(),
      'serialNumber': _serialController.text.trim().isEmpty ? null : _serialController.text.trim(),
      'capacity': _capacityController.text.trim().isEmpty ? null : _capacityController.text.trim(),
      'powerRating': _powerRatingController.text.trim().isEmpty ? null : _powerRatingController.text.trim(),
      'description': _descriptionController.text.trim().isEmpty ? null : _descriptionController.text.trim(),
      'customerId': _selectedCustomerId,
      'siteId': _selectedSiteId,
      'departmentId': _selectedDeptId,
      'systemId': _selectedSystemId,
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
                      isEdit ? Icons.edit_note : Icons.add_circle_outline,
                      color: theme.colorScheme.primary,
                      size: 28,
                    ),
                    const SizedBox(width: 8),
                    Text(
                      isEdit ? 'Update Asset' : 'Create New Asset',
                      style: theme.textTheme.titleLarge?.copyWith(
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ],
                ),
                const Divider(height: 24),

                // SECTION 1: BASIC INFO
                _buildSectionTitle('Basic Information', Icons.info_outline),
                const SizedBox(height: 12),
                TextFormField(
                  controller: _nameController,
                  decoration: const InputDecoration(
                    labelText: 'Asset Name *',
                    prefixIcon: Icon(Icons.precision_manufacturing),
                  ),
                  validator: (v) =>
                      v == null || v.trim().isEmpty ? 'Asset name is required' : null,
                ),
                const SizedBox(height: 12),
                TextFormField(
                  controller: _categoryController,
                  decoration: const InputDecoration(
                    labelText: 'Category *',
                    prefixIcon: Icon(Icons.category_outlined),
                  ),
                  validator: (v) =>
                      v == null || v.trim().isEmpty ? 'Category is required' : null,
                ),
                const SizedBox(height: 12),
                TextFormField(
                  controller: _locationController,
                  decoration: const InputDecoration(
                    labelText: 'Location *',
                    prefixIcon: Icon(Icons.location_on_outlined),
                  ),
                  validator: (v) =>
                      v == null || v.trim().isEmpty ? 'Location is required' : null,
                ),
                const SizedBox(height: 12),
                TextFormField(
                  controller: _manufacturerController,
                  decoration: const InputDecoration(
                    labelText: 'Manufacturer',
                    prefixIcon: Icon(Icons.factory_outlined),
                  ),
                ),
                const SizedBox(height: 24),

                // SECTION 2: SYSTEM ASSIGNMENT (OPTIONAL)
                _buildSectionTitle('System Assignment (Optional)', Icons.account_tree_outlined),
                const SizedBox(height: 12),
                if (_isLoadingCustomers)
                  const Padding(
                    padding: EdgeInsets.symmetric(vertical: 8),
                    child: Center(
                      child: SizedBox(
                        height: 24,
                        width: 24,
                        child: CircularProgressIndicator(strokeWidth: 2.5),
                      ),
                    ),
                  )
                else if (_customersError != null)
                  Text(
                    _customersError!,
                    style: const TextStyle(color: Colors.red, fontSize: 13),
                  )
                else ...[
                  // Customer dropdown
                  DropdownButtonFormField<String>(
                    value: _selectedCustomerId,
                    decoration: const InputDecoration(
                      labelText: 'Customer',
                      prefixIcon: Icon(Icons.business),
                    ),
                    items: [
                      const DropdownMenuItem<String>(
                        value: null,
                        child: Text('— Select Customer —'),
                      ),
                      ..._customers.map((c) => DropdownMenuItem<String>(
                            value: c['id']?.toString(),
                            child: Text(c['name']?.toString() ?? 'Unnamed'),
                          )),
                    ],
                    onChanged: (val) {
                      setState(() {
                        _selectedCustomerId = val;
                        _selectedSiteId = null;
                        _selectedDeptId = null;
                        _selectedSystemId = null;
                      });
                    },
                  ),
                  const SizedBox(height: 12),

                  // Site dropdown
                  DropdownButtonFormField<String>(
                    value: _selectedSiteId,
                    decoration: const InputDecoration(
                      labelText: 'Site',
                      prefixIcon: Icon(Icons.location_city),
                    ),
                    disabledHint: const Text('— Select Customer First —'),
                    items: _selectedCustomerId == null
                        ? null
                        : [
                            const DropdownMenuItem<String>(
                              value: null,
                              child: Text('— Select Site —'),
                            ),
                            ..._availableSites.map((s) => DropdownMenuItem<String>(
                                  value: s['id']?.toString(),
                                  child: Text(s['name']?.toString() ?? 'Unnamed'),
                                )),
                          ],
                    onChanged: _selectedCustomerId == null
                        ? null
                        : (val) {
                            setState(() {
                              _selectedSiteId = val;
                              _selectedDeptId = null;
                              _selectedSystemId = null;
                            });
                          },
                  ),
                  const SizedBox(height: 12),

                  // Department dropdown
                  DropdownButtonFormField<String>(
                    value: _selectedDeptId,
                    decoration: const InputDecoration(
                      labelText: 'Department',
                      prefixIcon: Icon(Icons.apartment),
                    ),
                    disabledHint: const Text('— Select Site First —'),
                    items: _selectedSiteId == null
                        ? null
                        : [
                            const DropdownMenuItem<String>(
                              value: null,
                              child: Text('— Select Department —'),
                            ),
                            ..._availableDepartments.map((d) => DropdownMenuItem<String>(
                                  value: d['id']?.toString(),
                                  child: Text(d['name']?.toString() ?? 'Unnamed'),
                                )),
                          ],
                    onChanged: _selectedSiteId == null
                        ? null
                        : (val) {
                            setState(() {
                              _selectedDeptId = val;
                              _selectedSystemId = null;
                            });
                          },
                  ),
                  const SizedBox(height: 12),

                  // System dropdown
                  DropdownButtonFormField<String>(
                    value: _selectedSystemId,
                    decoration: const InputDecoration(
                      labelText: 'System',
                      prefixIcon: Icon(Icons.hub_outlined),
                    ),
                    disabledHint: const Text('— Select Department First —'),
                    items: _selectedDeptId == null
                        ? null
                        : [
                            const DropdownMenuItem<String>(
                              value: null,
                              child: Text('— Select System —'),
                            ),
                            ..._availableSystems.map((sys) => DropdownMenuItem<String>(
                                  value: sys['id']?.toString(),
                                  child: Text(sys['name']?.toString() ?? 'Unnamed'),
                                )),
                          ],
                    onChanged: _selectedDeptId == null
                        ? null
                        : (val) {
                            setState(() {
                              _selectedSystemId = val;
                            });
                          },
                  ),
                ],
                const SizedBox(height: 24),

                // SECTION 3: TECHNICAL SPECIFICATIONS
                _buildSectionTitle('Technical Specifications', Icons.construction),
                const SizedBox(height: 12),
                TextFormField(
                  controller: _modelController,
                  decoration: const InputDecoration(
                    labelText: 'Model Number',
                    prefixIcon: Icon(Icons.view_in_ar),
                  ),
                ),
                const SizedBox(height: 12),
                TextFormField(
                  controller: _serialController,
                  decoration: const InputDecoration(
                    labelText: 'Serial Number',
                    prefixIcon: Icon(Icons.tag),
                  ),
                ),
                const SizedBox(height: 12),
                TextFormField(
                  controller: _capacityController,
                  decoration: const InputDecoration(
                    labelText: 'Capacity',
                    prefixIcon: Icon(Icons.speed),
                  ),
                ),
                const SizedBox(height: 12),
                TextFormField(
                  controller: _powerRatingController,
                  decoration: const InputDecoration(
                    labelText: 'Power Rating',
                    prefixIcon: Icon(Icons.bolt),
                  ),
                ),
                const SizedBox(height: 24),

                // SECTION 4: DESCRIPTION
                _buildSectionTitle('Description', Icons.description_outlined),
                const SizedBox(height: 12),
                TextFormField(
                  controller: _descriptionController,
                  minLines: 3,
                  maxLines: 5,
                  decoration: const InputDecoration(
                    labelText: 'Notes / Description',
                    alignLabelWithHint: true,
                  ),
                ),
                const SizedBox(height: 24),

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
                      child: Text(isEdit ? 'Save Changes' : 'Create Asset'),
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
