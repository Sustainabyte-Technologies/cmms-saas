import 'package:flutter/material.dart';

import '../../../core/widgets/api_record_list.dart';
import '../../../core/widgets/cmms_scaffold.dart';

class ChecklistsScreen extends StatelessWidget {
  const ChecklistsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return const CmmsScaffold(
      title: 'Checklists',
      child: ApiRecordList(
        title: 'Checklists',
        endpoint: '/checklists/templates',
        listKeys: ['templates', 'data'],
        primaryField: 'name',
        secondaryFields: ['description', 'createdAt'],
        createFields: [
          FormFieldSpec(
            'name',
            'Template Name',
            required: true,
            icon: Icons.checklist,
          ),
          FormFieldSpec('description', 'Description', multiline: true),
        ],
      ),
    );
  }
}
