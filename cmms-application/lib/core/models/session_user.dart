class SessionUser {
  const SessionUser({
    required this.id,
    required this.email,
    required this.name,
    required this.role,
    this.phone,
    this.status,
  });

  final String id;
  final String email;
  final String name;
  final String role;
  final String? phone;
  final String? status;

  bool get isAdmin => role == 'ADMIN';
  bool get isManager => role == 'MAINTENANCE_MANAGER';
  bool get isSupervisor => role == 'SUPERVISOR' || role == 'SITE_INCHARGE';
  bool get isTechnician => role == 'TECHNICIAN';

  factory SessionUser.fromJson(Map<String, dynamic> json) {
    final roleValue = json['role'];
    final resolvedRole = roleValue is Map
        ? roleValue['name']?.toString()
        : roleValue?.toString();

    return SessionUser(
      id: json['id']?.toString() ?? json['sub']?.toString() ?? '',
      email: json['email']?.toString() ?? '',
      name:
          json['fullName']?.toString() ??
          json['name']?.toString() ??
          json['username']?.toString() ??
          'CMMS User',
      role: (resolvedRole ?? 'TECHNICIAN').toUpperCase(),
      phone: json['phone']?.toString(),
      status: json['status']?.toString(),
    );
  }

  Map<String, dynamic> toJson() => {
    'id': id,
    'email': email,
    'fullName': name,
    'role': role,
    'phone': phone,
    'status': status,
  };
}
