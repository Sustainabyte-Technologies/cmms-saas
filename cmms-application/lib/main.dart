import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'core/api/api_client.dart';
import 'core/auth/auth_repository.dart';
import 'core/config/app_config.dart';
import 'core/providers/app_state.dart';
import 'core/routing/app_router.dart';
import 'core/theme/app_theme.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();

  final prefs = await SharedPreferences.getInstance();
  var customUrl = prefs.getString('custom_api_url');

  // Ignore cached localhost URLs — they don't work on physical devices
  if (customUrl != null && customUrl.contains('localhost')) {
    await prefs.remove('custom_api_url');
    customUrl = null;
  }

  final apiClient = ApiClient(baseUrl: customUrl ?? AppConfig.apiBaseUrl);
  final authRepository = AuthRepository(apiClient);
  final appState = AppState(authRepository: authRepository, apiClient: apiClient);
  await appState.bootstrap();

  runApp(CmmsMobileApp(appState: appState));
}

class CmmsMobileApp extends StatefulWidget {
  const CmmsMobileApp({super.key, required this.appState});

  final AppState appState;

  @override
  State<CmmsMobileApp> createState() => _CmmsMobileAppState();
}

class _CmmsMobileAppState extends State<CmmsMobileApp> {
  final _messengerKey = GlobalKey<ScaffoldMessengerState>();
  late final _router = AppRouter(widget.appState).router;

  @override
  void initState() {
    super.initState();
    widget.appState.onNewChatMessage = (
      senderName,
      message, {
      required isWorkOrder,
      workOrderNumber,
    }) {
      _messengerKey.currentState?.hideCurrentSnackBar();
      final title = isWorkOrder
          ? 'New Message in Work Order $workOrderNumber'
          : 'New Message from $senderName';
      _messengerKey.currentState?.showSnackBar(
        SnackBar(
          content: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            mainAxisSize: MainAxisSize.min,
            children: [
              Text(
                title,
                style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13),
              ),
              const SizedBox(height: 2),
              Text(
                message,
                maxLines: 2,
                overflow: TextOverflow.ellipsis,
                style: const TextStyle(fontSize: 12),
              ),
            ],
          ),
          behavior: SnackBarBehavior.floating,
          duration: const Duration(seconds: 4),
          action: SnackBarAction(
            label: 'View',
            onPressed: () {
              _router.push('/chat');
            },
          ),
        ),
      );
    };
  }

  @override
  Widget build(BuildContext context) {
    return ChangeNotifierProvider.value(
      value: widget.appState,
      child: Consumer<AppState>(
        builder: (context, state, _) {
          return MaterialApp.router(
            title: 'CMMS Enterprise',
            debugShowCheckedModeBanner: false,
            scaffoldMessengerKey: _messengerKey,
            themeMode: state.themeMode,
            theme: AppTheme.light(),
            darkTheme: AppTheme.dark(),
            routerConfig: _router,
          );
        },
      ),
    );
  }
}
