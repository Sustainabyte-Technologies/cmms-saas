import 'dart:io';

class StaticCmmsData {
  StaticCmmsData() {
    _seed();
  }

  final List<Map<String, dynamic>> customers = [];
  final List<Map<String, dynamic>> sites = [];
  final List<Map<String, dynamic>> departments = [];
  final List<Map<String, dynamic>> systems = [];
  final List<Map<String, dynamic>> users = [];
  final List<Map<String, dynamic>> assets = [];
  final List<Map<String, dynamic>> workOrders = [];
  final List<Map<String, dynamic>> checklists = [];
  final List<Map<String, dynamic>> preventive = [];
  final List<Map<String, dynamic>> activities = [];
  final Map<String, List<Map<String, dynamic>>> comments = {};
  final Map<String, List<Map<String, dynamic>>> attachments = {};

  dynamic handleGet(String path, Map<String, dynamic>? query) {
    if (path == '/dashboard/overview') return _overview();
    if (path == '/dashboard/work-order-status') return _statusDistribution();
    if (path == '/dashboard/recent-activities') {
      return {'activities': activities};
    }
    if (path == '/work-orders/dashboard/critical') {
      return workOrders
          .where((item) => item['priority'] == 'CRITICAL')
          .toList();
    }
    if (path == '/users/technicians/workload') {
      return users
          .where((user) => user['role']['name'] == 'TECHNICIAN')
          .map(
            (user) => {
              'technician': user['fullName'],
              'assigned': workOrders
                  .where((order) => order['assignedTechnicianId'] == user['id'])
                  .length,
              'completed': workOrders
                  .where(
                    (order) =>
                        order['assignedTechnicianId'] == user['id'] &&
                        order['status'] == 'COMPLETED',
                  )
                  .length,
            },
          )
          .toList();
    }

    final detail = _detail(path);
    if (detail != null) return detail;

    return switch (path) {
      '/customers' => _page(customers, query, 'customers'),
      '/customers/sites' => _page(sites, query, 'sites'),
      '/customers/departments' => _page(departments, query, 'departments'),
      '/customers/systems' => _page(systems, query, 'systems'),
      '/users' => _page(users, query, 'users'),
      '/assets' => _page(assets, query, 'assets'),
      '/work-orders' => _page(workOrders, query, 'workOrders'),
      '/work-orders/my' => _page(workOrders, query, 'workOrders'),
      '/checklists/templates' => {'templates': _filter(checklists, query)},
      '/preventive-maintenance' => {'schedules': _filter(preventive, query)},
      _ when path.endsWith('/comments') =>
        comments[_idBefore(path, '/comments')] ?? [],
      _ when path.endsWith('/attachments') =>
        attachments[_idBefore(path, '/attachments')] ?? [],
      _ => {},
    };
  }

  dynamic handlePost(String path, Object? data) {
    final payload = Map<String, dynamic>.from((data as Map?) ?? {});



    if (path.endsWith('/comments')) {
      final id = _idBefore(path, '/comments');
      final item = {
        'id': _id('comment'),
        'comment': payload['comment'] ?? '',
        'createdAt': DateTime.now().toIso8601String(),
        'createdBy': users.isNotEmpty ? users.first : null,
      };
      comments.putIfAbsent(id, () => []).insert(0, item);
      _activity('Note added', 'Comment added to work order $id');
      return item;
    }

    final target = _collectionFor(path);
    if (target != null) {
      final item = {
        'id': _id(path.split('/').last),
        'status': payload['status'] ?? true,
        'createdAt': DateTime.now().toIso8601String(),
        'updatedAt': DateTime.now().toIso8601String(),
        ...payload,
      };
      _decorateCreated(path, item);
      target.insert(0, item);
      _activity('Created', '${_label(path)} created');
      return item;
    }

    return {'success': true};
  }

  dynamic handlePatch(String path, Object? data) {
    final payload = Map<String, dynamic>.from((data as Map?) ?? {});

    if (path.endsWith('/status')) {
      final id = _idBefore(path, '/status');
      final item = workOrders.firstWhere((order) => order['id'] == id);
      item['status'] = payload['status'];
      item['updatedAt'] = DateTime.now().toIso8601String();
      _activity(
        'Status updated',
        '${item['workOrderNumber']} moved to ${payload['status']}',
      );
      return {'workOrder': item};
    }

    if (path.endsWith('/assign-technician')) {
      final id = _idBefore(path, '/assign-technician');
      final item = workOrders.firstWhere((order) => order['id'] == id);
      final technician = users.firstWhere(
        (user) => user['id'] == payload['technicianId'],
        orElse: () => users.last,
      );
      item['assignedTechnicianId'] = technician['id'];
      item['assignedTechnician'] = technician;
      item['status'] = 'ASSIGNED';
      _activity(
        'Technician assigned',
        '${technician['fullName']} assigned to ${item['workOrderNumber']}',
      );
      return {'workOrder': item};
    }

    final id = path.split('/').last;
    final collectionPath = path.substring(0, path.lastIndexOf('/'));
    final target = _collectionFor(collectionPath);
    final item = target?.firstWhere((entry) => entry['id'] == id);
    if (item != null) {
      item.addAll(payload);
      item['updatedAt'] = DateTime.now().toIso8601String();
      _decorateCreated(collectionPath, item);
      _activity('Updated', '${_label(collectionPath)} updated');
      return item;
    }
    return {'success': true};
  }

  dynamic handleDelete(String path) => {'success': true};

  dynamic handleUpload(String path, File file, Map<String, dynamic>? fields) {
    final item = {
      'id': _id('file'),
      'fileName': file.path.split(Platform.pathSeparator).last,
      'fileUrl': file.path,
      'fileType': 'LOCAL',
      'attachmentType': fields?['attachmentType'] ?? 'IMAGE',
      'createdAt': DateTime.now().toIso8601String(),
    };

    if (path.contains('/work-orders/')) {
      attachments
          .putIfAbsent(_idBefore(path, '/attachments'), () => [])
          .insert(0, item);
    }
    _activity('Attachment uploaded', item['fileName'].toString());
    return item;
  }

  Map<String, dynamic>? _detail(String path) {
    final parts = path.split('/').where((item) => item.isNotEmpty).toList();
    if (parts.length != 2) return null;
    final list = _collectionFor('/${parts.first}');
    final matches = list?.where((entry) => entry['id'] == parts.last).toList();
    final item = matches == null || matches.isEmpty ? null : matches.first;
    if (item == null) return null;
    if (parts.first == 'work-orders') {
      return {
        'workOrder': {
          ...item,
          'activities': activities,
          'comments': comments[item['id']] ?? [],
        },
      };
    }
    return item;
  }

  List<Map<String, dynamic>>? _collectionFor(String path) {
    return switch (path) {
      '/customers' => customers,
      '/customers/sites' => sites,
      '/customers/departments' => departments,
      '/customers/systems' => systems,
      '/users' => users,
      '/assets' => assets,
      '/work-orders' => workOrders,
      '/checklists/templates' => checklists,
      '/preventive-maintenance' => preventive,
      _ => null,
    };
  }

  Map<String, dynamic> _page(
    List<Map<String, dynamic>> source,
    Map<String, dynamic>? query,
    String key,
  ) {
    final rows = _filter(source, query);
    return {
      key: rows,
      'data': rows,
      'total': rows.length,
      'page': 1,
      'limit': rows.length,
      'totalPages': 1,
    };
  }

  List<Map<String, dynamic>> _filter(
    List<Map<String, dynamic>> source,
    Map<String, dynamic>? query,
  ) {
    final search = query?['search']?.toString().toLowerCase();
    final status = query?['status']?.toString();
    return source.where((item) {
      final matchesSearch =
          search == null ||
          search.isEmpty ||
          item.values.join(' ').toLowerCase().contains(search);
      final matchesStatus =
          status == null || item['status']?.toString() == status;
      return matchesSearch && matchesStatus;
    }).toList();
  }

  Map<String, dynamic> _overview() {
    return {
      'totalCustomers': customers.length,
      'totalSites': sites.length,
      'totalDepartments': departments.length,
      'totalSystems': systems.length,
      'totalAssets': assets.length,
      'totalUsers': users.length,
      'totalWorkOrders': workOrders.length,
      'openWorkOrders': workOrders
          .where((item) => item['status'] == 'OPEN')
          .length,
      'completedWorkOrders': workOrders
          .where((item) => item['status'] == 'COMPLETED')
          .length,
    };
  }

  List<Map<String, dynamic>> _statusDistribution() {
    const statuses = [
      'OPEN',
      'ASSIGNED',
      'IN_PROGRESS',
      'ON_HOLD',
      'COMPLETED',
      'CLOSED',
    ];
    return statuses
        .map(
          (status) => {
            'status': status,
            'count': workOrders
                .where((item) => item['status'] == status)
                .length,
          },
        )
        .toList();
  }

  void _decorateCreated(String path, Map<String, dynamic> item) {
    if (path == '/work-orders') {
      item['workOrderNumber'] ??= 'WO${(1002000 + workOrders.length + 1)}';
      item['priority'] ??= 'MEDIUM';
      item['status'] ??= 'OPEN';
      item['workType'] ??= 'REACTIVE';
      item['asset'] = assets.firstWhere(
        (asset) => asset['id'] == item['assetId'],
        orElse: () => assets.first,
      );
      item['assignedTechnician'] = users.firstWhere(
        (user) => user['id'] == item['assignedTechnicianId'],
        orElse: () => users.last,
      );
    }
    if (path == '/assets') {
      item['assetCode'] ??= 'AS${2000 + assets.length + 1}';
    }
    if (path == '/customers' ||
        path == '/customers/sites' ||
        path == '/customers/departments' ||
        path == '/customers/systems') {
      item['code'] ??=
          '${_label(path).substring(0, 2).toUpperCase()}${100 + customers.length + sites.length + departments.length + systems.length}';
    }
  }

  void _activity(String action, String title) {
    activities.insert(0, {
      'id': _id('activity'),
      'action': action,
      'title': title,
      'createdAt': DateTime.now().toIso8601String(),
    });
  }

  String _id(String prefix) =>
      '$prefix-${DateTime.now().microsecondsSinceEpoch}';

  String _idBefore(String path, String suffix) {
    final clean = path.substring(0, path.indexOf(suffix));
    return clean.split('/').last;
  }

  String _label(String path) => switch (path) {
    '/customers' => 'Customer',
    '/customers/sites' => 'Site',
    '/customers/departments' => 'Department',
    '/customers/systems' => 'System',
    '/users' => 'User',
    '/assets' => 'Asset',
    '/work-orders' => 'Work Order',
    '/checklists/templates' => 'Checklist',
    '/preventive-maintenance' => 'PM Schedule',
    _ => 'Record',
  };

  void _seed() {
    users.addAll([
      _user('u-admin', 'Admin User', 'admin@cmms.com', 'ADMIN'),
      _user(
        'u-manager',
        'Maintenance Manager',
        'manager@cmms.com',
        'MAINTENANCE_MANAGER',
      ),
      _user(
        'u-supervisor',
        'Site Supervisor',
        'supervisor@cmms.com',
        'SUPERVISOR',
      ),
      _user('u-tech', 'Kumar Technician', 'technician@cmms.com', 'TECHNICIAN'),
    ]);

    customers.addAll([
      {
        'id': 'c-1',
        'code': 'CUS001',
        'name': 'ABC Manufacturing',
        'contactPerson': 'Arun Kumar',
        'email': 'ops@abc.example',
        'phone': '+91 90000 10001',
        'address': 'Industrial Estate',
        'city': 'Chennai',
        'state': 'Tamil Nadu',
        'country': 'India',
        'description': 'Automotive components facility',
        'status': true,
      },
      {
        'id': 'c-2',
        'code': 'CUS002',
        'name': 'Fixbyte HQ',
        'contactPerson': 'Karthik',
        'email': 'hq@fixbyte.example',
        'phone': '+91 90000 10002',
        'city': 'Bengaluru',
        'state': 'Karnataka',
        'country': 'India',
        'status': true,
      },
    ]);

    sites.addAll([
      {
        'id': 's-1',
        'code': 'SITE001',
        'name': 'Plant 1',
        'customerId': 'c-1',
        'customer': customers.first,
        'address': 'Block A',
        'city': 'Chennai',
        'state': 'Tamil Nadu',
        'country': 'India',
        'status': true,
      },
      {
        'id': 's-2',
        'code': 'SITE002',
        'name': 'HQ Tower',
        'customerId': 'c-2',
        'customer': customers.last,
        'city': 'Bengaluru',
        'state': 'Karnataka',
        'country': 'India',
        'status': true,
      },
    ]);

    departments.addAll([
      {
        'id': 'd-1',
        'code': 'DEP001',
        'name': 'Production Line B',
        'siteId': 's-1',
        'site': sites.first,
        'description': 'Conveyor and packaging section',
        'status': true,
      },
      {
        'id': 'd-2',
        'code': 'DEP002',
        'name': 'Utilities',
        'siteId': 's-2',
        'site': sites.last,
        'description': 'HVAC and electrical utilities',
        'status': true,
      },
    ]);

    systems.addAll([
      {
        'id': 'sys-1',
        'code': 'SYS001',
        'name': 'Conveyor System',
        'departmentId': 'd-1',
        'department': departments.first,
        'status': true,
      },
      {
        'id': 'sys-2',
        'code': 'SYS002',
        'name': 'HVAC System',
        'departmentId': 'd-2',
        'department': departments.last,
        'status': true,
      },
    ]);

    assets.addAll([
      {
        'id': 'a-1',
        'assetCode': 'AS20034',
        'assetName': 'Conveyor Belt Assembly',
        'customerId': 'c-1',
        'siteId': 's-1',
        'departmentId': 'd-1',
        'systemId': 'sys-1',
        'category': 'Mechanical',
        'manufacturer': 'Siemens',
        'modelNumber': 'CBX-900',
        'serialNumber': 'SN-CBX-7781',
        'status': 'ACTIVE',
      },
      {
        'id': 'a-2',
        'assetCode': 'AS548',
        'assetName': 'ABC Machine',
        'customerId': 'c-1',
        'siteId': 's-1',
        'departmentId': 'd-1',
        'systemId': 'sys-1',
        'category': 'Machine',
        'manufacturer': 'Bosch',
        'modelNumber': 'B2B-22',
        'serialNumber': 'SN-ABC-2210',
        'status': 'ACTIVE',
      },
      {
        'id': 'a-3',
        'assetCode': 'AS490',
        'assetName': 'IBC Machine',
        'category': 'HVAC',
        'manufacturer': 'Carrier',
        'modelNumber': 'HV-44',
        'serialNumber': 'SN-HVAC-4488',
        'status': 'ACTIVE',
      },
    ]);

    workOrders.addAll([
      _workOrder(
        'wo-1',
        'WO456151',
        'Conveyor Belt Replacement and Installation',
        'ASSIGNED',
        'HIGH',
        assets[0],
        users.last,
        checklistTemplateId: 'cl-1',
      ),
      _workOrder(
        'wo-2',
        'WO125689',
        'Mechanical Hardware Component Replacement',
        'IN_PROGRESS',
        'CRITICAL',
        assets[1],
        users.last,
        checklistTemplateId: 'cl-1',
      ),
      _workOrder(
        'wo-3',
        'WO102000',
        'Replace Worn Conveyor Belt in Production Line B',
        'OPEN',
        'HIGH',
        assets[0],
        users.last,
        checklistTemplateId: 'cl-1',
      ),
      _workOrder(
        'wo-4',
        'WO125345',
        'Electrical Panel Safety Audit and Upgrades',
        'COMPLETED',
        'MEDIUM',
        assets[2],
        users.last,
        checklistTemplateId: 'cl-2',
      ),
    ]);

    checklists.addAll([
      {
        'id': 'cl-1',
        'name': 'Conveyor Service Checklist',
        'description':
            'Safety lockout, belt tension, roller inspection, remarks',
        'items': [
          {'title': 'Verify lockout tagout', 'isRequired': true},
          {'title': 'Check belt tension', 'isRequired': true},
          {'title': 'Add technician remarks', 'isRequired': false},
        ],
        'status': 'ACTIVE',
        'createdAt': DateTime.now().toIso8601String(),
      },
      {
        'id': 'cl-2',
        'name': 'HVAC Preventive Checklist',
        'description': 'Filter, coil, fan and temperature readings',
        'status': 'ACTIVE',
        'createdAt': DateTime.now().toIso8601String(),
      },
    ]);

    preventive.addAll([
      {
        'id': 'pm-1',
        'title': 'Monthly Conveyor Inspection',
        'frequency': 'Monthly',
        'nextDueDate': '2026-07-15',
        'asset': assets[0],
        'assignedTechnician': users.last,
        'status': 'UPCOMING',
      },
      {
        'id': 'pm-2',
        'title': 'Quarterly HVAC Service',
        'frequency': 'Quarterly',
        'nextDueDate': '2026-07-04',
        'asset': assets[2],
        'assignedTechnician': users.last,
        'status': 'OVERDUE',
      },
    ]);

    activities.addAll([
      {
        'id': 'act-1',
        'action': 'Work Order Assigned',
        'title': 'WO456151 assigned to Kumar',
        'createdAt': '2026-06-30T09:20:00.000Z',
      },
      {
        'id': 'act-2',
        'action': 'PM Due',
        'title': 'Monthly Conveyor Inspection due soon',
        'createdAt': '2026-06-30T08:00:00.000Z',
      },
      {
        'id': 'act-3',
        'action': 'Asset Alert',
        'title': 'Conveyor Belt Assembly reported abnormal wear',
        'createdAt': '2026-06-29T16:40:00.000Z',
      },
    ]);

    comments['wo-2'] = [
      {
        'id': 'comment-1',
        'comment':
            'Belt has significant wear and tear. Replace and inspect rollers.',
        'createdAt': '2026-06-30T09:45:00.000Z',
        'createdBy': users.last,
      },
    ];
    attachments['wo-2'] = [
      {
        'id': 'att-1',
        'fileName': 'before-image.jpg',
        'fileType': 'IMAGE',
        'attachmentType': 'BEFORE',
        'createdAt': '2026-06-30T09:55:00.000Z',
      },
    ];
  }

  Map<String, dynamic> _user(
    String id,
    String name,
    String email,
    String role,
  ) {
    return {
      'id': id,
      'fullName': name,
      'email': email,
      'phone': '+91 90000 00000',
      'role': {'name': role},
      'status': 'ACTIVE',
    };
  }

  Map<String, dynamic> _workOrder(
    String id,
    String number,
    String title,
    String status,
    String priority,
    Map<String, dynamic> asset,
    Map<String, dynamic> technician, {
    String? checklistTemplateId,
  }) {
    return {
      'id': id,
      'workOrderNumber': number,
      'title': title,
      'description': 'Static CMMS work order for mobile view testing.',
      'assetId': asset['id'],
      'asset': asset,
      'priority': priority,
      'status': status,
      'workType': 'REACTIVE',
      'assignedTechnicianId': technician['id'],
      'assignedTechnician': technician,
      'checklistTemplateId': checklistTemplateId,
      'createdBy': users.first,
      'dueDate': '2026-07-05T10:00:00.000Z',
      'createdAt': '2026-06-30T08:00:00.000Z',
      'updatedAt': '2026-06-30T08:00:00.000Z',
    };
  }
}
