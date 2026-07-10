import 'package:flutter/material.dart';

import '../../../core/widgets/api_record_list.dart';
import '../../../core/widgets/cmms_scaffold.dart';

class UsersScreen extends StatelessWidget {
  const UsersScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return const CmmsScaffold(
      title: 'Users',
      child: ApiRecordList(
        title: 'Users',
        endpoint: '/users',
        listKeys: ['users', 'data'],
        primaryField: 'fullName',
        secondaryFields: ['email', 'phone', 'role.name'],
        createFields: [
          FormFieldSpec(
            'fullName',
            'Name',
            required: true,
            icon: Icons.person_outline,
          ),
          FormFieldSpec(
            'email',
            'Email',
            required: true,
            icon: Icons.mail_outline,
            keyboardType: TextInputType.emailAddress,
          ),
          FormFieldSpec(
            'password',
            'Password',
            required: true,
            icon: Icons.lock_outline,
          ),
          FormFieldSpec('phone', 'Phone', icon: Icons.phone_outlined),
          FormFieldSpec(
            'role',
            'Role',
            required: true,
            icon: Icons.admin_panel_settings_outlined,
          ),
        ],
      ),
    );
  }
}
