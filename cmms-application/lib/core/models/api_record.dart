class ApiRecord {
  const ApiRecord(this.data);

  final Map<String, dynamic> data;

  String get id => value('id');

  String value(String key, {String fallback = '-'}) {
    final raw = data[key];
    if (raw == null || raw.toString().trim().isEmpty) return fallback;
    return raw.toString();
  }

  String nested(String key, String child, {String fallback = '-'}) {
    final raw = data[key];
    if (raw is Map<String, dynamic>) return raw[child]?.toString() ?? fallback;
    if (raw is Map) return raw[child]?.toString() ?? fallback;
    return fallback;
  }
}

List<ApiRecord> normalizeRecords(dynamic response, List<String> preferredKeys) {
  if (response is List) {
    return response
        .whereType<Map>()
        .map((item) => ApiRecord(Map<String, dynamic>.from(item)))
        .toList();
  }

  if (response is Map) {
    for (final key in preferredKeys) {
      final value = response[key];
      if (value is List) {
        return value
            .whereType<Map>()
            .map((item) => ApiRecord(Map<String, dynamic>.from(item)))
            .toList();
      }
    }

    final data = response['data'];
    if (data is List) {
      return data
          .whereType<Map>()
          .map((item) => ApiRecord(Map<String, dynamic>.from(item)))
          .toList();
    }
  }

  return [];
}
