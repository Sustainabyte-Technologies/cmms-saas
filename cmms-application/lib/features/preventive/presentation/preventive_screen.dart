import 'package:flutter/material.dart';

import '../../../core/widgets/api_record_list.dart';
import '../../../core/widgets/cmms_scaffold.dart';

class PreventiveScreen extends StatelessWidget {
  const PreventiveScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return const CmmsScaffold(
      title: 'Preventive Maintenance',
      child: ApiRecordList(
        title: 'Preventive',
        endpoint: '/preventive-maintenance',
        listKeys: ['schedules', 'data'],
        primaryField: 'title',
        secondaryFields: [
          'frequency',
          'nextDueDate',
          'asset.assetName',
          'assignedTechnician.fullName',
        ],
        createFields: [
          FormFieldSpec(
            'title',
            'Schedule Title',
            required: true,
            icon: Icons.event_repeat,
          ),
          FormFieldSpec(
            'assetId',
            'Asset ID',
            required: true,
            icon: Icons.precision_manufacturing,
          ),
          FormFieldSpec(
            'frequency',
            'Frequency',
            required: true,
            icon: Icons.repeat,
          ),
          FormFieldSpec(
            'assignedTechnicianId',
            'Technician ID',
            icon: Icons.engineering,
          ),
          FormFieldSpec('startDate', 'Start Date', icon: Icons.calendar_month),
          FormFieldSpec('description', 'Description', multiline: true),
        ],
      ),
    );
  }
}
