import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../../core/providers/app_state.dart';
import '../../../core/widgets/cmms_scaffold.dart';

class RequestPartsScreen extends StatefulWidget {
  const RequestPartsScreen({super.key, required this.workOrderId});

  final String workOrderId;

  @override
  State<RequestPartsScreen> createState() => _RequestPartsScreenState();
}

class _RequestPartsScreenState extends State<RequestPartsScreen> {
  final _reasonController = TextEditingController();
  final _formKey = GlobalKey<FormState>();

  List<dynamic> _parts = [];
  bool _loadingParts = true;
  String? _selectedPartId;
  int _quantity = 1;
  bool _submitting = false;

  @override
  void initState() {
    super.initState();
    _loadSpareParts();
  }

  @override
  void dispose() {
    _reasonController.dispose();
    super.dispose();
  }

  Future<void> _loadSpareParts() async {
    try {
      final api = context.read<AppState>().apiClient;
      final response = await api.get('/inventory/spare-parts');
      if (mounted) {
        setState(() {
          _parts = response is List ? response : [];
          _loadingParts = false;
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _loadingParts = false;
        });
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Failed to load spare parts: $e')),
        );
      }
    }
  }

  Future<void> _submitRequest() async {
    if (!_formKey.currentState!.validate() || _selectedPartId == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please select a spare part.')),
      );
      return;
    }

    setState(() => _submitting = true);

    try {
      final api = context.read<AppState>().apiClient;
      await api.post('/inventory/parts-requests', data: {
        'workOrderId': widget.workOrderId,
        'reason': _reasonController.text.trim(),
        'priority': 'MEDIUM',
        'items': [
          {
            'sparePartId': _selectedPartId,
            'requestedQty': _quantity,
          }
        ]
      });

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Spare parts request submitted successfully.')),
        );
        Navigator.pop(context, true); // Pop and trigger update
      }
    } catch (e) {
      if (mounted) {
        setState(() => _submitting = false);
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Submission failed: $e')),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return CmmsScaffold(
      title: 'Request Spare Parts',
      child: _loadingParts
          ? const Center(child: CircularProgressIndicator())
          : _submitting
              ? const Center(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      CircularProgressIndicator(),
                      SizedBox(height: 16),
                      Text('Submitting request...'),
                    ],
                  ),
                )
              : Form(
                  key: _formKey,
                  child: ListView(
                    padding: const EdgeInsets.all(16),
                    children: [
                      Card(
                        elevation: 0.5,
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(12),
                          side: BorderSide(color: Colors.grey.shade300),
                        ),
                        child: Padding(
                          padding: const EdgeInsets.all(16.0),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                'New Spare Parts Requisition',
                                style: theme.textTheme.titleMedium?.copyWith(
                                  fontWeight: FontWeight.bold,
                                  color: theme.colorScheme.primary,
                                ),
                              ),
                              const SizedBox(height: 4),
                              const Text(
                                'Select the required part and quantity. The request will be sent to your supervisor for approval.',
                                style: TextStyle(fontSize: 12, color: Colors.grey),
                              ),
                            ],
                          ),
                        ),
                      ),
                      const SizedBox(height: 20),

                      // Part Selection Dropdown
                      const Text(
                        'Select Spare Part *',
                        style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13),
                      ),
                      const SizedBox(height: 8),
                      DropdownButtonFormField<String>(
                        isExpanded: true,
                        value: _selectedPartId,
                        decoration: const InputDecoration(
                          hintText: 'Choose from parts catalog',
                          prefixIcon: Icon(Icons.build_outlined),
                        ),
                        items: _parts.map((p) {
                          final name = p['partName']?.toString() ?? 'Unknown';
                          final code = p['partCode']?.toString() ?? '';
                          final stock = (p['currentStock'] ?? 0).toString();
                          final unit = p['unit']?.toString() ?? 'PCS';
                          return DropdownMenuItem<String>(
                            value: p['id'].toString(),
                            child: Text('$name ($code) - Stock: $stock $unit'),
                          );
                        }).toList(),
                        onChanged: (val) {
                          setState(() {
                            _selectedPartId = val;
                          });
                        },
                        validator: (value) => value == null ? 'Spare part is required' : null,
                      ),
                      const SizedBox(height: 16),

                      // Quantity Selector
                      const Text(
                        'Requested Quantity *',
                        style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13),
                      ),
                      const SizedBox(height: 8),
                      Row(
                        children: [
                          IconButton(
                            onPressed: _quantity > 1
                                ? () => setState(() => _quantity--)
                                : null,
                            icon: const Icon(Icons.remove_circle_outline),
                            color: theme.colorScheme.primary,
                          ),
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 10),
                            decoration: BoxDecoration(
                              border: Border.all(color: Colors.grey.shade300),
                              borderRadius: BorderRadius.circular(8),
                            ),
                            child: Text(
                              _quantity.toString(),
                              style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
                            ),
                          ),
                          IconButton(
                            onPressed: () => setState(() => _quantity++),
                            icon: const Icon(Icons.add_circle_outline),
                            color: theme.colorScheme.primary,
                          ),
                        ],
                      ),
                      const SizedBox(height: 20),

                      // Remarks
                      const Text(
                        'Reason for Request / Remarks *',
                        style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13),
                      ),
                      const SizedBox(height: 8),
                      TextFormField(
                        controller: _reasonController,
                        maxLines: 3,
                        decoration: const InputDecoration(
                          hintText: 'State why this replacement part is required (e.g. damaged seal, worn bearing)',
                        ),
                        validator: (v) =>
                            v == null || v.trim().isEmpty ? 'Please enter a reason' : null,
                      ),
                      const SizedBox(height: 32),

                      // Submit Button
                      FilledButton(
                        onPressed: _submitRequest,
                        style: FilledButton.styleFrom(
                          padding: const EdgeInsets.symmetric(vertical: 14),
                        ),
                        child: const Text('Submit Requisition Request', style: TextStyle(fontWeight: FontWeight.bold)),
                      ),
                    ],
                  ),
                ),
    );
  }
}
