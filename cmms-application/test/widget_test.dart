import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:provider/provider.dart';

import 'package:cmms_mobile/core/api/api_client.dart';
import 'package:cmms_mobile/core/auth/auth_repository.dart';
import 'package:cmms_mobile/core/providers/app_state.dart';
import 'package:cmms_mobile/features/auth/presentation/login_screen.dart';

void main() {
  testWidgets('login screen renders static test users', (tester) async {
    final apiClient = ApiClient(baseUrl: 'http://localhost:3001');
    final appState = AppState(
      authRepository: AuthRepository(apiClient),
      apiClient: apiClient,
    );

    await tester.pumpWidget(
      ChangeNotifierProvider.value(
        value: appState,
        child: const MaterialApp(home: LoginScreen()),
      ),
    );

    expect(find.text('Welcome'), findsOneWidget);
    expect(find.text('Admin'), findsOneWidget);
    expect(find.text('Technician'), findsOneWidget);
  });
}
