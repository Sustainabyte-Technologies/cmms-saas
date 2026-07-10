import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../../../core/models/api_record.dart';
import '../../../core/providers/app_state.dart';
import '../../../core/widgets/cmms_scaffold.dart';
import '../../../core/widgets/data_state_widgets.dart';

class NotificationsScreen extends StatefulWidget {
  const NotificationsScreen({super.key});

  @override
  State<NotificationsScreen> createState() => _NotificationsScreenState();
}

class _NotificationsScreenState extends State<NotificationsScreen> {
  late Future<List<ApiRecord>> _future;

  @override
  void initState() {
    super.initState();
    _future = _load();
  }

  Future<List<ApiRecord>> _load() async {
    final api = context.read<AppState>().apiClient;
    final recent = await api.get('/dashboard/recent-activities');
    final critical = await api.get('/work-orders/dashboard/critical');
    return [
      ...normalizeRecords(recent, ['activities', 'data']),
      ...normalizeRecords(critical, ['data']),
    ];
  }

  @override
  Widget build(BuildContext context) {
    return CmmsScaffold(
      title: 'Notifications',
      child: FutureBuilder<List<ApiRecord>>(
        future: _future,
        builder: (context, snapshot) {
          if (snapshot.connectionState != ConnectionState.done) {
            return const LoadingView();
          }
          if (snapshot.hasError) {
            return ErrorPanel(
              message: snapshot.error.toString(),
              onRetry: () {
                setState(() {
                  _future = _load();
                });
              },
            );
          }
          final records = snapshot.data ?? [];
          if (records.isEmpty) {
            return const EmptyView(
              message: 'No notifications returned by the API.',
            );
          }
          return RefreshIndicator(
            onRefresh: () async {
              final fut = _load();
              setState(() {
                _future = fut;
              });
              await fut;
            },
            child: ListView.separated(
              padding: const EdgeInsets.all(16),
              itemCount: records.length,
              separatorBuilder: (_, _) => const SizedBox(height: 8),
              itemBuilder: (context, index) {
                final item = records[index];
                return Card(
                  child: ListTile(
                    leading: const Icon(Icons.notifications_active_outlined),
                    title: Text(
                      item.value(
                        'title',
                        fallback: item.value(
                          'action',
                          fallback: item.value('workOrderNumber'),
                        ),
                      ),
                    ),
                    subtitle: Text(
                      item.value('createdAt', fallback: item.value('dueDate')),
                    ),
                    trailing: Chip(
                      label: Text(
                        item.value(
                          'status',
                          fallback: item.value('priority', fallback: 'INFO'),
                        ),
                      ),
                    ),
                  ),
                );
              },
            ),
          );
        },
      ),
    );
  }
}

class GlobalSearchScreen extends StatefulWidget {
  const GlobalSearchScreen({super.key});

  @override
  State<GlobalSearchScreen> createState() => _GlobalSearchScreenState();
}

class _GlobalSearchScreenState extends State<GlobalSearchScreen> {
  final _controller = TextEditingController();
  bool _loading = false;
  String? _error;
  List<_SearchGroup> _groups = [];

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  Future<void> _search() async {
    final query = _controller.text.trim();
    if (query.isEmpty) return;
    setState(() {
      _loading = true;
      _error = null;
    });

    try {
      final api = context.read<AppState>().apiClient;
      final responses = await Future.wait([
        api.get('/customers', queryParameters: {'search': query, 'limit': 10}),
        api.get(
          '/customers/sites',
          queryParameters: {'search': query, 'limit': 10},
        ),
        api.get(
          '/customers/departments',
          queryParameters: {'search': query, 'limit': 10},
        ),
        api.get(
          '/customers/systems',
          queryParameters: {'search': query, 'limit': 10},
        ),
        api.get('/users', queryParameters: {'search': query, 'limit': 10}),
        api.get('/assets', queryParameters: {'search': query, 'limit': 10}),
        api.get(
          '/work-orders',
          queryParameters: {'search': query, 'limit': 10},
        ),
      ]);
      setState(() {
        _groups = [
          _SearchGroup(
            'Customers',
            normalizeRecords(responses[0], ['data', 'customers']),
            'name',
          ),
          _SearchGroup(
            'Sites',
            normalizeRecords(responses[1], ['data', 'sites']),
            'name',
          ),
          _SearchGroup(
            'Departments',
            normalizeRecords(responses[2], ['data', 'departments']),
            'name',
          ),
          _SearchGroup(
            'Systems',
            normalizeRecords(responses[3], ['data', 'systems']),
            'name',
          ),
          _SearchGroup(
            'Users',
            normalizeRecords(responses[4], ['data', 'users']),
            'fullName',
          ),
          _SearchGroup(
            'Assets',
            normalizeRecords(responses[5], ['data', 'assets']),
            'assetName',
          ),
          _SearchGroup(
            'Work Orders',
            normalizeRecords(responses[6], ['data', 'workOrders']),
            'title',
          ),
        ];
      });
    } catch (error) {
      setState(() => _error = error.toString());
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final total = _groups.fold<int>(
      0,
      (sum, group) => sum + group.records.length,
    );

    return CmmsScaffold(
      title: 'Global Search',
      child: Column(
        children: [
          Padding(
            padding: const EdgeInsets.all(16),
            child: SearchBar(
              controller: _controller,
              leading: const Icon(Icons.search),
              hintText: 'Search customers, sites, assets, work orders',
              onSubmitted: (_) => _search(),
              trailing: [
                IconButton(
                  tooltip: 'Search',
                  onPressed: _search,
                  icon: const Icon(Icons.arrow_forward),
                ),
              ],
            ),
          ),
          Expanded(
            child: Builder(
              builder: (context) {
                if (_loading) {
                  return const LoadingView();
                }
                if (_error != null) {
                  return ErrorPanel(message: _error!, onRetry: _search);
                }
                if (total == 0) {
                  return const EmptyView(
                    message: 'Enter a search term to query all CMMS modules.',
                  );
                }
                return ListView(
                  padding: const EdgeInsets.fromLTRB(16, 0, 16, 16),
                  children: [
                    for (final group in _groups.where(
                      (group) => group.records.isNotEmpty,
                    )) ...[
                      Text(
                        group.title,
                        style: Theme.of(context).textTheme.titleMedium,
                      ),
                      const SizedBox(height: 8),
                      for (final record in group.records)
                        Card(
                          child: ListTile(
                            title: Text(record.value(group.primaryField)),
                            subtitle: Text(
                              record.value(
                                'code',
                                fallback: record.value(
                                  'workOrderNumber',
                                  fallback: record.value('email'),
                                ),
                              ),
                            ),
                          ),
                        ),
                      const SizedBox(height: 16),
                    ],
                  ],
                );
              },
            ),
          ),
        ],
      ),
    );
  }
}

class _SearchGroup {
  const _SearchGroup(this.title, this.records, this.primaryField);

  final String title;
  final List<ApiRecord> records;
  final String primaryField;
}
