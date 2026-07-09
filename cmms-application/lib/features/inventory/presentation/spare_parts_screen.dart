import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../../core/providers/app_state.dart';
import '../../../core/widgets/cmms_scaffold.dart';

class SparePartsScreen extends StatefulWidget {
  const SparePartsScreen({super.key});

  @override
  State<SparePartsScreen> createState() => _SparePartsScreenState();
}

class _SparePartsScreenState extends State<SparePartsScreen> {
  List<dynamic> _parts = [];
  bool _loading = true;
  String? _error;
  String _search = '';

  @override
  void initState() {
    super.initState();
    _loadParts();
  }

  Future<void> _loadParts() async {
    setState(() {
      _loading = true;
      _error = null;
    });
    try {
      final api = context.read<AppState>().apiClient;
      final response = await api.get('/inventory/spare-parts', queryParameters: {
        if (_search.isNotEmpty) 'search': _search,
      });
      if (mounted) {
        setState(() {
          _parts = response is List ? response : [];
          _loading = false;
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _error = e.toString();
          _loading = false;
        });
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return CmmsScaffold(
      title: 'Spare Parts Catalog',
      child: Column(
        children: [
          // Search Input Bar
          Padding(
            padding: const EdgeInsets.all(12.0),
            child: TextField(
              decoration: InputDecoration(
                hintText: 'Search spare parts catalog...',
                prefixIcon: const Icon(Icons.search),
                suffixIcon: _search.isNotEmpty
                    ? IconButton(
                        icon: const Icon(Icons.clear),
                        onPressed: () {
                          setState(() => _search = '');
                          _loadParts();
                        },
                      )
                    : null,
                contentPadding: const EdgeInsets.symmetric(vertical: 0, horizontal: 16),
              ),
              onChanged: (val) {
                _search = val;
                _loadParts();
              },
            ),
          ),
          const Divider(height: 1),

          Expanded(
            child: _loading
                ? const Center(child: CircularProgressIndicator())
                : _error != null
                    ? Center(
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            const Icon(Icons.error_outline, size: 48, color: Colors.red),
                            const SizedBox(height: 8),
                            Text('Failed to load parts: $_error', style: const TextStyle(color: Colors.red)),
                            const SizedBox(height: 16),
                            ElevatedButton(onPressed: _loadParts, child: const Text('Retry')),
                          ],
                        ),
                      )
                    : _parts.isEmpty
                        ? const Center(child: Text('No spare parts catalog items found.'))
                        : RefreshIndicator(
                            onRefresh: _loadParts,
                            child: ListView.separated(
                              padding: const EdgeInsets.all(12),
                              itemCount: _parts.length,
                              separatorBuilder: (_, __) => const SizedBox(height: 8),
                              itemBuilder: (context, index) {
                                final part = _parts[index];
                                final currentStock = (part['currentStock'] ?? 0).toDouble();
                                final minStock = (part['minimumStock'] ?? 0).toDouble();
                                final isLow = currentStock < minStock;

                                return Card(
                                  elevation: 0.5,
                                  shape: RoundedRectangleBorder(
                                    borderRadius: BorderRadius.circular(12),
                                    side: BorderSide(
                                      color: isLow ? Colors.red.shade200 : Colors.grey.shade300,
                                      width: isLow ? 1.5 : 1,
                                    ),
                                  ),
                                  color: isLow ? Colors.red.shade50.withAlpha(20) : null,
                                  child: Padding(
                                    padding: const EdgeInsets.all(16.0),
                                    child: Row(
                                      children: [
                                        Container(
                                          padding: const EdgeInsets.all(10),
                                          decoration: BoxDecoration(
                                            color: isLow ? Colors.red.shade100.withAlpha(80) : theme.colorScheme.primaryContainer,
                                            borderRadius: BorderRadius.circular(10),
                                          ),
                                          child: Icon(
                                            Icons.build,
                                            color: isLow ? Colors.red.shade700 : theme.colorScheme.onPrimaryContainer,
                                            size: 24,
                                          ),
                                        ),
                                        const SizedBox(width: 16),
                                        Expanded(
                                          child: Column(
                                            crossAxisAlignment: CrossAxisAlignment.start,
                                            children: [
                                              Text(
                                                part['partName']?.toString() ?? 'Unknown',
                                                style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14),
                                              ),
                                              const SizedBox(height: 4),
                                              Row(
                                                children: [
                                                  Container(
                                                    padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                                                    decoration: BoxDecoration(
                                                      color: Colors.grey.shade200,
                                                      borderRadius: BorderRadius.circular(4),
                                                    ),
                                                    child: Text(
                                                      part['partCode']?.toString() ?? '',
                                                      style: TextStyle(
                                                        fontFamily: 'monospace',
                                                        fontSize: 10,
                                                        color: Colors.grey.shade800,
                                                        fontWeight: FontWeight.bold,
                                                      ),
                                                    ),
                                                  ),
                                                  const SizedBox(width: 8),
                                                  Text(
                                                    part['category']?['name']?.toString() ?? 'Uncategorized',
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
                                            Text(
                                              '${currentStock.toStringAsFixed(0)} ${part['unit'] ?? 'PCS'}',
                                              style: TextStyle(
                                                fontWeight: FontWeight.bold,
                                                fontSize: 16,
                                                color: isLow ? Colors.red.shade700 : Colors.green.shade700,
                                              ),
                                            ),
                                            const SizedBox(height: 2),
                                            Text(
                                              part['warehouse']?['name']?.toString() ?? 'No warehouse',
                                              style: TextStyle(color: Colors.grey.shade500, fontSize: 10),
                                            ),
                                          ],
                                        ),
                                      ],
                                    ),
                                  ),
                                );
                              },
                            ),
                          ),
          ),
        ],
      ),
    );
  }
}
