import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../../../core/providers/app_state.dart';
import '../../../core/widgets/api_record_list.dart';
import '../../../core/widgets/cmms_scaffold.dart';
import 'widgets/asset_form.dart';

class AssetsScreen extends StatelessWidget {
  const AssetsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return CmmsScaffold(
      title: 'Assets',
      child: ApiRecordList(
        title: 'Assets',
        endpoint: '/assets',
        listKeys: const ['assets', 'data'],
        primaryField: 'assetName',
        secondaryFields: const [
          'assetCode',
          'category',
          'manufacturer',
          'modelNumber',
          'serialNumber',
        ],
        uploadPathBuilder: (record) => '/assets/${record.id}/image',
        customFormBuilder: (context, initialValues, onSubmit) => AssetForm(
          apiClient: Provider.of<AppState>(context, listen: false).apiClient,
          initialValues: initialValues,
          onSubmit: onSubmit,
        ),
      ),
    );
  }
}
