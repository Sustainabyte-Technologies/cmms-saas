import 'package:flutter/material.dart';
import 'package:mobile_scanner/mobile_scanner.dart';
import 'package:provider/provider.dart';

import '../../../core/providers/app_state.dart';
import '../../../core/widgets/cmms_scaffold.dart';
import 'asset_workspace_screen.dart';

class ScanAssetScreen extends StatefulWidget {
  const ScanAssetScreen({super.key});

  @override
  State<ScanAssetScreen> createState() => _ScanAssetScreenState();
}

class _ScanAssetScreenState extends State<ScanAssetScreen> {
  final MobileScannerController _controller = MobileScannerController();
  bool _loading = false;
  Map<String, dynamic>? _asset;
  String? _error;

  void _handleScan(String rawValue) async {
    if (_loading || _asset != null) return;

    final appState = Provider.of<AppState>(context, listen: false);

    setState(() {
      _loading = true;
      _error = null;
    });

    try {
      // Stop scanner camera feed while fetching details
      await _controller.stop();

      // Extract assetId query parameter if the value is a deep-link URL
      String assetId = rawValue;
      if (rawValue.contains('assetId=')) {
        final uri = Uri.parse(rawValue);
        assetId = uri.queryParameters['assetId'] ?? rawValue;
      }

      final response = await appState.apiClient.get('/assets/$assetId');

      if (mounted) {
        setState(() {
          _asset = Map<String, dynamic>.from(response);
          _loading = false;
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _error = 'Failed to load asset details: ${e.toString()}';
          _loading = false;
        });
      }
    }
  }

  void _reset() async {
    setState(() {
      _asset = null;
      _error = null;
      _loading = false;
    });
    try {
      await _controller.start();
    } catch (e) {
      debugPrint('Failed to restart scanner: $e');
    }
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Builder(
      builder: (context) {
        if (_loading) {
          return Scaffold(
            appBar: AppBar(
              leading: IconButton(
                icon: const Icon(Icons.arrow_back),
                onPressed: () => Navigator.pop(context),
              ),
              title: const Text('Loading...'),
            ),
            body: const Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  CircularProgressIndicator(),
                  SizedBox(height: 16),
                  Text('Loading asset details...', style: TextStyle(fontWeight: FontWeight.w500)),
                ],
              ),
            ),
          );
        }

        if (_error != null) {
          return Scaffold(
            appBar: AppBar(
              leading: IconButton(
                icon: const Icon(Icons.arrow_back),
                onPressed: () => Navigator.pop(context),
              ),
              title: const Text('Error'),
            ),
            body: Padding(
              padding: const EdgeInsets.all(24.0),
              child: Center(
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    const Icon(Icons.error_outline, size: 48, color: Colors.red),
                    const SizedBox(height: 16),
                    Text(
                      _error!,
                      textAlign: TextAlign.center,
                      style: const TextStyle(fontSize: 14, color: Colors.red),
                    ),
                    const SizedBox(height: 24),
                    FilledButton.icon(
                      onPressed: _reset,
                      icon: const Icon(Icons.refresh),
                      label: const Text('Scan Again'),
                    ),
                  ],
                ),
              ),
            ),
          );
        }

        if (_asset != null) {
          return AssetWorkspaceScreen(
            asset: _asset!,
            onBack: _reset,
          );
        }

        // Scanner view
        return CmmsScaffold(
          title: 'Scan Asset QR',
          child: Stack(
            children: [
              MobileScanner(
                controller: _controller,
                onDetect: (barcodeCapture) {
                  final List<Barcode> barcodes = barcodeCapture.barcodes;
                  if (barcodes.isNotEmpty) {
                    final value = barcodes.first.rawValue;
                    if (value != null) {
                      _handleScan(value);
                    }
                  }
                },
              ),
              // Viewfinder overlay
              Center(
                child: Container(
                  width: 250,
                  height: 250,
                  decoration: BoxDecoration(
                    border: Border.all(color: theme.colorScheme.primary, width: 2.5),
                    borderRadius: BorderRadius.circular(16),
                  ),
                ),
              ),
              Positioned(
                bottom: 24,
                left: 0,
                right: 0,
                child: Center(
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                    decoration: BoxDecoration(
                      color: Colors.black54,
                      borderRadius: BorderRadius.circular(20),
                    ),
                    child: const Text(
                      'Scan an Asset QR Code',
                      style: TextStyle(color: Colors.white, fontSize: 13),
                    ),
                  ),
                ),
              ),
            ],
          ),
        );
      },
    );
  }
}
