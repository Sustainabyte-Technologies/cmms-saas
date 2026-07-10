import 'package:flutter/material.dart';

import '../../../core/widgets/api_record_list.dart';
import '../../../core/widgets/cmms_scaffold.dart';

class PortfolioScreen extends StatelessWidget {
  const PortfolioScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return CmmsScaffold(
      title: 'Portfolio',
      child: DefaultTabController(
        length: 4,
        child: Column(
          children: const [
            TabBar(
              isScrollable: true,
              tabs: [
                Tab(text: 'Customers'),
                Tab(text: 'Sites'),
                Tab(text: 'Departments'),
                Tab(text: 'Systems'),
              ],
            ),
            Expanded(
              child: TabBarView(
                children: [
                  ApiRecordList(
                    title: 'Customers',
                    endpoint: '/customers',
                    listKeys: ['data', 'customers'],
                    primaryField: 'name',
                    secondaryFields: ['code', 'contactPerson', 'email', 'city'],
                    createFields: [
                      FormFieldSpec(
                        'name',
                        'Customer Name',
                        required: true,
                        icon: Icons.business,
                      ),
                      FormFieldSpec(
                        'contactPerson',
                        'Contact Person',
                        icon: Icons.person_outline,
                      ),
                      FormFieldSpec(
                        'email',
                        'Email',
                        icon: Icons.mail_outline,
                        keyboardType: TextInputType.emailAddress,
                      ),
                      FormFieldSpec(
                        'phone',
                        'Phone',
                        icon: Icons.phone_outlined,
                      ),
                      FormFieldSpec(
                        'address',
                        'Address',
                        icon: Icons.place_outlined,
                        multiline: true,
                      ),
                      FormFieldSpec('city', 'City'),
                      FormFieldSpec('state', 'State'),
                      FormFieldSpec('country', 'Country'),
                      FormFieldSpec(
                        'description',
                        'Description',
                        multiline: true,
                      ),
                    ],
                  ),
                  ApiRecordList(
                    title: 'Sites',
                    endpoint: '/customers/sites',
                    listKeys: ['data', 'sites'],
                    primaryField: 'name',
                    secondaryFields: ['code', 'customer.name', 'city', 'state'],
                    createFields: [
                      FormFieldSpec(
                        'name',
                        'Site Name',
                        required: true,
                        icon: Icons.location_city,
                      ),
                      FormFieldSpec(
                        'customerId',
                        'Customer ID',
                        required: true,
                        icon: Icons.business,
                      ),
                      FormFieldSpec(
                        'address',
                        'Address',
                        multiline: true,
                        icon: Icons.place_outlined,
                      ),
                      FormFieldSpec('city', 'City'),
                      FormFieldSpec('state', 'State'),
                      FormFieldSpec('country', 'Country'),
                    ],
                  ),
                  ApiRecordList(
                    title: 'Departments',
                    endpoint: '/customers/departments',
                    listKeys: ['data', 'departments'],
                    primaryField: 'name',
                    secondaryFields: ['code', 'site.name', 'description'],
                    createFields: [
                      FormFieldSpec(
                        'name',
                        'Department Name',
                        required: true,
                        icon: Icons.apartment,
                      ),
                      FormFieldSpec(
                        'siteId',
                        'Site ID',
                        required: true,
                        icon: Icons.location_city,
                      ),
                      FormFieldSpec(
                        'description',
                        'Description',
                        multiline: true,
                      ),
                    ],
                  ),
                  ApiRecordList(
                    title: 'Systems',
                    endpoint: '/customers/systems',
                    listKeys: ['data', 'systems'],
                    primaryField: 'name',
                    secondaryFields: ['code', 'department.name', 'description'],
                    createFields: [
                      FormFieldSpec(
                        'name',
                        'System Name',
                        required: true,
                        icon: Icons.account_tree,
                      ),
                      FormFieldSpec(
                        'departmentId',
                        'Department ID',
                        required: true,
                        icon: Icons.apartment,
                      ),
                      FormFieldSpec(
                        'description',
                        'Description',
                        multiline: true,
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
