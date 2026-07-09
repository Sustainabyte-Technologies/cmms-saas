import 'dart:io';

import 'package:file_picker/file_picker.dart';
import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';
import 'package:provider/provider.dart';

import '../models/api_record.dart';
import '../providers/app_state.dart';
import 'data_state_widgets.dart';

class ApiRecordList extends StatefulWidget {
  const ApiRecordList({
    super.key,
    required this.title,
    required this.endpoint,
    required this.listKeys,
    required this.primaryField,
    required this.secondaryFields,
    this.queryBuilder,
    this.createFields = const [],
    this.createTitle,
    this.uploadPathBuilder,
    this.statusField = 'status',
    this.trailingActions,
    this.customFormBuilder,
  });

  final String title;
  final String endpoint;
  final List<String> listKeys;
  final String primaryField;
  final List<String> secondaryFields;
  final Map<String, dynamic> Function(String search, String? filter)?
  queryBuilder;
  final List<FormFieldSpec> createFields;
  final String? createTitle;
  final String Function(ApiRecord record)? uploadPathBuilder;
  final String statusField;
  final List<RecordAction> Function(ApiRecord record)? trailingActions;
  final Widget Function(
    BuildContext context,
    Map<String, dynamic>? initialValues,
    void Function(Map<String, dynamic> submittedValues) onSubmit,
  )? customFormBuilder;

  @override
  State<ApiRecordList> createState() => _ApiRecordListState();
}

class _ApiRecordListState extends State<ApiRecordList> {
  final _searchController = TextEditingController();
  String? _filter;
  bool _loading = true;
  String? _error;
  List<ApiRecord> _records = [];

  @override
  void initState() {
    super.initState();
    _load();
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  Future<void> _load() async {
    setState(() {
      _loading = true;
      _error = null;
    });
    try {
      final query =
          widget.queryBuilder?.call(_searchController.text, _filter) ??
          {
            if (_searchController.text.trim().isNotEmpty)
              'search': _searchController.text.trim(),
            'limit': 100,
          };
      final data = await context.read<AppState>().apiClient.get(
        widget.endpoint,
        queryParameters: query,
      );
      if (!mounted) return;
      setState(() => _records = normalizeRecords(data, widget.listKeys));
    } catch (error) {
      if (!mounted) return;
      setState(() => _error = error.toString());
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  Future<void> _create() async {
    final api = context.read<AppState>().apiClient;
    final values = await showModalBottomSheet<Map<String, dynamic>>(
      context: context,
      isScrollControlled: true,
      builder: (context) => widget.customFormBuilder != null
          ? widget.customFormBuilder!(
              context,
              null,
              (val) => Navigator.pop(context, val),
            )
          : _RecordForm(
              title: widget.createTitle ?? 'Create ${widget.title}',
              fields: widget.createFields,
            ),
    );
    if (values == null) return;

    try {
      await api.post(widget.endpoint, data: values);
      if (!mounted) return;
      await _load();
      _toast('${widget.title} created');
    } catch (error) {
      _toast(error.toString());
    }
  }

  Future<void> _edit(ApiRecord record) async {
    final api = context.read<AppState>().apiClient;
    final values = await showModalBottomSheet<Map<String, dynamic>>(
      context: context,
      isScrollControlled: true,
      builder: (context) => widget.customFormBuilder != null
          ? widget.customFormBuilder!(
              context,
              record.data,
              (val) => Navigator.pop(context, val),
            )
          : _RecordForm(
              title: 'Update ${widget.title}',
              fields: widget.createFields,
              initial: record.data,
            ),
    );
    if (values == null) return;

    try {
      await api.patch('${widget.endpoint}/${record.id}', data: values);
      if (!mounted) return;
      await _load();
      _toast('${widget.title} updated');
    } catch (error) {
      _toast(error.toString());
    }
  }

  Future<void> _upload(ApiRecord record) async {
    final path = widget.uploadPathBuilder?.call(record);
    if (path == null) return;
    final api = context.read<AppState>().apiClient;

    final picked = await showModalBottomSheet<File?>(
      context: context,
      builder: (context) => SafeArea(
        child: Wrap(
          children: [
            ListTile(
              leading: const Icon(Icons.photo_camera),
              title: const Text('Camera'),
              onTap: () async {
                final image = await ImagePicker().pickImage(
                  source: ImageSource.camera,
                );
                if (context.mounted) {
                  Navigator.pop(
                    context,
                    image == null ? null : File(image.path),
                  );
                }
              },
            ),
            ListTile(
              leading: const Icon(Icons.attach_file),
              title: const Text('File'),
              onTap: () async {
                final result = await FilePicker.platform.pickFiles();
                if (context.mounted) {
                  Navigator.pop(
                    context,
                    result?.files.single.path == null
                        ? null
                        : File(result!.files.single.path!),
                  );
                }
              },
            ),
          ],
        ),
      ),
    );
    if (picked == null) return;

    try {
      await api.upload(path, file: picked);
      if (!mounted) return;
      await _load();
      _toast('Upload complete');
    } catch (error) {
      _toast(error.toString());
    }
  }

  void _toast(String message) {
    if (!mounted) return;
    ScaffoldMessenger.of(
      context,
    ).showSnackBar(SnackBar(content: Text(message)));
  }

  @override
  Widget build(BuildContext context) {
    final canManage = context.watch<AppState>().canManage(
      widget.title.camelModule,
    );

    return Column(
      children: [
        Padding(
          padding: const EdgeInsets.fromLTRB(16, 8, 16, 8),
          child: Row(
            children: [
              Expanded(
                child: SearchBar(
                  controller: _searchController,
                  hintText: 'Search ${widget.title.toLowerCase()}',
                  leading: const Icon(Icons.search),
                  trailing: [
                    IconButton(
                      tooltip: 'Apply search',
                      onPressed: _load,
                      icon: const Icon(Icons.arrow_forward),
                    ),
                  ],
                  onSubmitted: (_) => _load(),
                ),
              ),
              const SizedBox(width: 8),
              PopupMenuButton<String?>(
                tooltip: 'Filter status',
                icon: const Icon(Icons.tune),
                onSelected: (value) {
                  setState(() => _filter = value);
                  _load();
                },
                itemBuilder: (context) => const [
                  PopupMenuItem(value: null, child: Text('All')),
                  PopupMenuItem(value: 'OPEN', child: Text('Open')),
                  PopupMenuItem(value: 'ASSIGNED', child: Text('Assigned')),
                  PopupMenuItem(
                    value: 'IN_PROGRESS',
                    child: Text('In Progress'),
                  ),
                  PopupMenuItem(value: 'COMPLETED', child: Text('Completed')),
                ],
              ),
            ],
          ),
        ),
        Expanded(
          child: RefreshIndicator(
            onRefresh: _load,
            child: Builder(
              builder: (context) {
                if (_loading) {
                  return const LoadingView();
                }
                if (_error != null) {
                  return ErrorPanel(message: _error!, onRetry: _load);
                }
                if (_records.isEmpty) {
                  return EmptyView(
                    message:
                        'No ${widget.title.toLowerCase()} found from the API.',
                  );
                }

                return ListView.separated(
                  physics: const AlwaysScrollableScrollPhysics(),
                  padding: const EdgeInsets.fromLTRB(16, 8, 16, 96),
                  itemCount: _records.length,
                  separatorBuilder: (_, _) => const SizedBox(height: 10),
                  itemBuilder: (context, index) {
                    final record = _records[index];
                    final actions = widget.trailingActions?.call(record) ?? [];

                    String? imageUrl;
                    final baseUrl = context.read<AppState>().apiClient.baseUrl;

                    final directUrl = record.value('imageUrl', fallback: '');
                    if (directUrl.isNotEmpty && directUrl.startsWith('http')) {
                      if (directUrl.contains('devstsustainabyte.blob.core.windows.net')) {
                        imageUrl = '$baseUrl${widget.endpoint}/${record.id}/image';
                      } else {
                        imageUrl = directUrl;
                      }
                    }
                    if (imageUrl == null) {
                      final assetMap = record.data['asset'];
                      if (assetMap is Map) {
                        final id = assetMap['id']?.toString() ?? '';
                        if (id.isNotEmpty) {
                          imageUrl = '$baseUrl/assets/$id/image';
                        }
                      }
                    }
                    if (imageUrl == null) {
                      final attachments = record.data['attachments'];
                      if (attachments is List && attachments.isNotEmpty) {
                        for (final att in attachments) {
                          if (att is Map) {
                            final id = att['id']?.toString() ?? '';
                            if (id.isNotEmpty) {
                              imageUrl = '$baseUrl/work-orders/attachments/$id';
                              break;
                            }
                          }
                        }
                      }
                    }

                    return Card(
                      child: ListTile(
                        contentPadding: const EdgeInsets.all(12),
                        leading: ClipRRect(
                          borderRadius: BorderRadius.circular(24),
                          child: Container(
                            width: 48,
                            height: 48,
                            color: Theme.of(context).colorScheme.primaryContainer,
                            child: imageUrl != null
                                ? Image.network(
                                    _proxyUrl(imageUrl),
                                    fit: BoxFit.cover,
                                    errorBuilder: (context, error, stackTrace) {
                                      return Center(
                                        child: Text(
                                          record
                                              .value(widget.primaryField, fallback: '?')
                                              .characters
                                              .first
                                              .toUpperCase(),
                                          style: TextStyle(
                                            color: Theme.of(context).colorScheme.onPrimaryContainer,
                                            fontWeight: FontWeight.bold,
                                          ),
                                        ),
                                      );
                                    },
                                  )
                                : Center(
                                    child: Text(
                                      record
                                          .value(widget.primaryField, fallback: '?')
                                          .characters
                                          .first
                                          .toUpperCase(),
                                      style: TextStyle(
                                        color: Theme.of(context).colorScheme.onPrimaryContainer,
                                        fontWeight: FontWeight.bold,
                                      ),
                                    ),
                                  ),
                          ),
                        ),
                        title: Text(
                          record.value(widget.primaryField),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                        subtitle: Padding(
                          padding: const EdgeInsets.only(top: 6),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Wrap(
                                spacing: 8,
                                runSpacing: 4,
                                children: [
                                  for (final field in widget.secondaryFields)
                                    Text(
                                      '${field.labelize}: ${_display(record, field)}',
                                    ),
                                ],
                              ),
                              const SizedBox(height: 6),
                              Chip(
                                label: Text(
                                  record.value(
                                    widget.statusField,
                                    fallback: 'ACTIVE',
                                  ),
                                ),
                                visualDensity: VisualDensity.compact,
                              ),
                            ],
                          ),
                        ),
                        trailing: PopupMenuButton<String>(
                          onSelected: (value) {
                            if (value == 'edit') {
                              _edit(record);
                            }
                            if (value == 'upload') {
                              _upload(record);
                            }
                            for (final action in actions) {
                              if (action.key == value) action.onTap(context);
                            }
                          },
                          itemBuilder: (context) => [
                            if (canManage &&
                                (widget.createFields.isNotEmpty ||
                                    widget.customFormBuilder != null))
                              const PopupMenuItem(
                                value: 'edit',
                                child: Text('Edit'),
                              ),
                            if (widget.uploadPathBuilder != null)
                              const PopupMenuItem(
                                value: 'upload',
                                child: Text('Upload attachment'),
                              ),
                            for (final action in actions)
                              PopupMenuItem(
                                value: action.key,
                                child: Text(action.label),
                              ),
                          ],
                        ),
                      ),
                    );
                  },
                );
              },
            ),
          ),
        ),
        if (canManage &&
            (widget.createFields.isNotEmpty ||
                widget.customFormBuilder != null))
          Padding(
            padding: const EdgeInsets.all(16),
            child: FilledButton.icon(
              onPressed: _create,
              icon: const Icon(Icons.add),
              label: Text('Create ${widget.title}'),
            ),
          ),
      ],
    );
  }

  String _display(ApiRecord record, String field) {
    if (field.contains('.')) {
      final parts = field.split('.');
      return record.nested(parts.first, parts.last);
    }
    return record.value(field);
  }
}

class _RecordForm extends StatefulWidget {
  const _RecordForm({
    required this.title,
    required this.fields,
    this.initial = const {},
  });

  final String title;
  final List<FormFieldSpec> fields;
  final Map<String, dynamic> initial;

  @override
  State<_RecordForm> createState() => _RecordFormState();
}

class _RecordFormState extends State<_RecordForm> {
  final _formKey = GlobalKey<FormState>();
  late final Map<String, TextEditingController> _controllers;

  @override
  void initState() {
    super.initState();
    _controllers = {
      for (final field in widget.fields)
        field.key: TextEditingController(
          text: widget.initial[field.key]?.toString() ?? '',
        ),
    };
  }

  @override
  void dispose() {
    for (final controller in _controllers.values) {
      controller.dispose();
    }
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return SafeArea(
      child: Padding(
        padding: EdgeInsets.only(
          left: 16,
          right: 16,
          top: 16,
          bottom: MediaQuery.viewInsetsOf(context).bottom + 16,
        ),
        child: Form(
          key: _formKey,
          child: SingleChildScrollView(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  widget.title,
                  style: Theme.of(context).textTheme.titleLarge,
                ),
                const SizedBox(height: 16),
                for (final field in widget.fields) ...[
                  TextFormField(
                    controller: _controllers[field.key],
                    decoration: InputDecoration(
                      labelText: field.label,
                      prefixIcon: Icon(field.icon),
                    ),
                    minLines: field.multiline ? 3 : 1,
                    maxLines: field.multiline ? 5 : 1,
                    keyboardType: field.keyboardType,
                    validator: field.required
                        ? (value) => value == null || value.trim().isEmpty
                              ? '${field.label} is required'
                              : null
                        : null,
                  ),
                  const SizedBox(height: 12),
                ],
                FilledButton(
                  onPressed: () {
                    if (!_formKey.currentState!.validate()) return;
                    Navigator.pop(context, {
                      for (final field in widget.fields)
                        if (_controllers[field.key]!.text.trim().isNotEmpty)
                          field.key: _controllers[field.key]!.text.trim(),
                    });
                  },
                  child: const Text('Save'),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

class FormFieldSpec {
  const FormFieldSpec(
    this.key,
    this.label, {
    this.required = false,
    this.icon = Icons.edit_outlined,
    this.multiline = false,
    this.keyboardType,
  });

  final String key;
  final String label;
  final bool required;
  final IconData icon;
  final bool multiline;
  final TextInputType? keyboardType;
}

class RecordAction {
  const RecordAction(this.key, this.label, this.onTap);

  final String key;
  final String label;
  final void Function(BuildContext context) onTap;
}

extension on String {
  String get labelize {
    final spaced = replaceAllMapped(
      RegExp(r'([A-Z])'),
      (match) => ' ${match.group(1)}',
    ).replaceAll('.', ' ');
    return spaced.characters.first.toUpperCase() + spaced.substring(1);
  }

  String get camelModule => switch (this) {
    'Work Orders' => 'workOrders',
    'Assets' => 'assets',
    'Users' => 'users',
    'Checklists' => 'checklists',
    _ => toLowerCase(),
  };
}

String _proxyUrl(String url) {
  if (url.toLowerCase().contains('.avif')) {
    final clean = url.replaceFirst(RegExp(r'^https?://'), '');
    return 'https://images.weserv.nl/?url=$clean&output=webp';
  }
  return url;
}
