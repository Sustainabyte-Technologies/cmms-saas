import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:socket_io_client/socket_io_client.dart' as io;

import '../../../core/providers/app_state.dart';
import '../../../core/widgets/data_state_widgets.dart';

class WorkOrderChatScreen extends StatefulWidget {
  const WorkOrderChatScreen({super.key, required this.workOrder});

  final Map<String, dynamic> workOrder;

  @override
  State<WorkOrderChatScreen> createState() => _WorkOrderChatScreenState();
}

class _WorkOrderChatScreenState extends State<WorkOrderChatScreen> {
  io.Socket? _socket;
  final List<Map<String, dynamic>> _messages = [];
  final _textController = TextEditingController();
  final _scrollController = ScrollController();
  bool _isLoading = true;
  bool _isConnected = false;
  bool _isSending = false;
  String? _error;

  @override
  void initState() {
    super.initState();
    _initChat();
  }

  @override
  void dispose() {
    _socket?.emit('leaveWorkOrder', {'workOrderId': widget.workOrder['id']});
    _socket?.off('connect');
    _socket?.off('disconnect');
    _socket?.off('connect_error');
    _socket?.off('receiveWorkOrderMessage');
    _socket?.off('workOrderError');
    _socket?.disconnect();
    _socket?.dispose();
    _textController.dispose();
    _scrollController.dispose();
    super.dispose();
  }

  Future<void> _initChat() async {
    final appState = context.read<AppState>();
    final apiClient = appState.apiClient;

    setState(() {
      _isLoading = true;
      _error = null;
    });

    try {
      // 1. Fetch History
      final historyData = await apiClient.get('/work-order-chat/messages/${widget.workOrder['id']}');
      if (!mounted) return;

      if (historyData is List) {
        _messages.clear();
        for (final item in historyData) {
          if (item is Map) {
            _messages.add(Map<String, dynamic>.from(item));
          }
        }
      }

      // 2. Connect to Socket
      final token = await apiClient.tokenValue;
      if (!mounted) return;

      if (token != null) {
        _connectSocket(token, appState);
      } else {
        throw Exception('Authentication token not found.');
      }

      setState(() => _isLoading = false);
      _scrollToBottom();
    } catch (e) {
      debugPrint('Error initializing work order chat: $e');
      if (mounted) {
        setState(() {
          _error = e.toString();
          _isLoading = false;
        });
      }
    }
  }

  void _connectSocket(String token, AppState appState) {
    final baseUrl = appState.apiClient.baseUrl;

    _socket = io.io(
      baseUrl,
      io.OptionBuilder()
          .setTransports(['websocket'])
          .setAuth({'token': token})
          .setQuery({'token': token})
          .enableForceNew()
          .build(),
    );

    _socket?.onConnect((_) {
      debugPrint('Work order chat connected successfully');
      _socket?.emit('joinWorkOrder', {'workOrderId': widget.workOrder['id']});
      if (mounted) {
        setState(() => _isConnected = true);
      }
    });

    _socket?.onDisconnect((_) {
      debugPrint('Work order chat disconnected');
      if (mounted) {
        setState(() {
          _isConnected = false;
          _isSending = false;
        });
      }
    });

    _socket?.onConnectError((err) {
      debugPrint('Work order chat connection error: $err');
      if (mounted) {
        setState(() {
          _isConnected = false;
          _isSending = false;
        });
      }
    });

    _socket?.on('receiveWorkOrderMessage', (data) {
      debugPrint('Receive Work Order Message: $data');
      if (data is Map && mounted) {
        final message = Map<String, dynamic>.from(data);
        if (message['workOrderId'] == widget.workOrder['id']) {
          setState(() {
            _messages.add(message);
          });
          _scrollToBottom();
        }
      }
    });

    _socket?.on('workOrderError', (data) {
      debugPrint('Work Order Chat Error: $data');
      if (data is Map && mounted) {
        final err = data['error']?.toString() ?? 'Unauthorized access to room';
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(err), backgroundColor: Colors.red),
        );
      }
    });
  }

  void _sendMessage() {
    final text = _textController.text.trim();
    if (text.isEmpty || _socket == null || _isSending) return;

    setState(() {
      _isSending = true;
    });

    _socket?.emit('sendWorkOrderMessage', {
      'workOrderId': widget.workOrder['id'],
      'message': text,
    });

    _textController.clear();
    setState(() {
      _isSending = false;
    });
  }

  void _scrollToBottom() {
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (_scrollController.hasClients) {
        _scrollController.animateTo(
          _scrollController.position.maxScrollExtent,
          duration: const Duration(milliseconds: 300),
          curve: Curves.easeOut,
        );
      }
    });
  }

  String _formatTime(String? dateStr) {
    if (dateStr == null || dateStr.isEmpty) return '';
    try {
      final dateTime = DateTime.parse(dateStr).toLocal();
      final hour = dateTime.hour.toString().padLeft(2, '0');
      final minute = dateTime.minute.toString().padLeft(2, '0');
      return '$hour:$minute';
    } catch (_) {
      return '';
    }
  }

  @override
  Widget build(BuildContext context) {
    final currentUserId = context.watch<AppState>().user?.id ?? '';
    final number = widget.workOrder['workOrderNumber']?.toString() ?? 'WO';
    final title = widget.workOrder['title']?.toString() ?? 'Discussion';

    return Scaffold(
      appBar: AppBar(
        title: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              number,
              style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
            ),
            Text(
              title,
              style: const TextStyle(fontSize: 11, color: Colors.black54),
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
            ),
          ],
        ),
        actions: [
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16.0),
            child: Center(
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                decoration: BoxDecoration(
                  color: _isConnected ? Colors.green.withOpacity(0.15) : Colors.red.withOpacity(0.15),
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(
                    color: _isConnected ? Colors.green.withOpacity(0.3) : Colors.red.withOpacity(0.3),
                  ),
                ),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Container(
                      width: 6,
                      height: 6,
                      decoration: BoxDecoration(
                        shape: BoxShape.circle,
                        color: _isConnected ? Colors.green : Colors.red,
                      ),
                    ),
                    const SizedBox(width: 6),
                    Text(
                      _isConnected ? 'Online' : 'Offline',
                      style: TextStyle(
                        fontSize: 10,
                        fontWeight: FontWeight.bold,
                        color: _isConnected ? Colors.green : Colors.red,
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),
        ],
      ),
      body: _isLoading
          ? const LoadingView()
          : _error != null
              ? ErrorPanel(
                  message: _error!,
                  onRetry: _initChat,
                )
              : Column(
                  children: [
                    Expanded(
                      child: _messages.isEmpty
                          ? Center(
                              child: Column(
                                mainAxisAlignment: MainAxisAlignment.center,
                                children: [
                                  Icon(Icons.forum_outlined, size: 48, color: Colors.grey.shade400),
                                  const SizedBox(height: 12),
                                  Text(
                                    'No messages yet',
                                    style: TextStyle(color: Colors.grey.shade500, fontWeight: FontWeight.bold),
                                  ),
                                  const SizedBox(height: 4),
                                  Text(
                                    'Discussion timeline for this work order will appear here.',
                                    style: TextStyle(color: Colors.grey.shade400, fontSize: 11),
                                  ),
                                ],
                              ),
                            )
                          : ListView.builder(
                              controller: _scrollController,
                              padding: const EdgeInsets.all(16),
                              itemCount: _messages.length,
                              itemBuilder: (context, index) {
                                final msg = _messages[index];
                                final isSystem = msg['messageType'] == 'SYSTEM';
                                final text = msg['message']?.toString() ?? '';
                                final timeStr = _formatTime(msg['createdAt']?.toString());

                                if (isSystem) {
                                  return Container(
                                    margin: const EdgeInsets.symmetric(vertical: 8),
                                    alignment: Alignment.center,
                                    child: Container(
                                      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                                      decoration: BoxDecoration(
                                        color: Colors.blue.shade50,
                                        borderRadius: BorderRadius.circular(16),
                                        border: Border.all(color: Colors.blue.shade100),
                                      ),
                                      child: Row(
                                        mainAxisSize: MainAxisSize.min,
                                        children: [
                                          Icon(Icons.info_outline, size: 13, color: Colors.blue.shade700),
                                          const SizedBox(width: 6),
                                          Flexible(
                                            child: Text(
                                              text,
                                              style: TextStyle(
                                                fontSize: 10,
                                                color: Colors.blue.shade800,
                                                fontWeight: FontWeight.bold,
                                              ),
                                            ),
                                          ),
                                        ],
                                      ),
                                    ),
                                  );
                                }

                                final isSelf = msg['senderId'] == currentUserId;
                                final senderName = msg['sender']?['fullName']?.toString() ?? 'User';

                                return Padding(
                                  padding: const EdgeInsets.only(bottom: 12.0),
                                  child: Align(
                                    alignment: isSelf ? Alignment.centerRight : Alignment.centerLeft,
                                    child: Column(
                                      crossAxisAlignment: isSelf ? CrossAxisAlignment.end : CrossAxisAlignment.start,
                                      children: [
                                        Padding(
                                          padding: const EdgeInsets.only(left: 4, right: 4, bottom: 2),
                                          child: Text(
                                            isSelf ? 'You • $timeStr' : '$senderName • $timeStr',
                                            style: TextStyle(fontSize: 9, color: Colors.grey.shade600),
                                          ),
                                        ),
                                        Container(
                                          constraints: BoxConstraints(
                                            maxWidth: MediaQuery.of(context).size.width * 0.75,
                                          ),
                                          padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                                          decoration: BoxDecoration(
                                            color: isSelf ? const Color(0xFF1E5CB3) : Colors.grey.shade200,
                                            borderRadius: BorderRadius.only(
                                              topLeft: const Radius.circular(16),
                                              topRight: const Radius.circular(16),
                                              bottomLeft: Radius.circular(isSelf ? 16 : 0),
                                              bottomRight: Radius.circular(isSelf ? 0 : 16),
                                            ),
                                          ),
                                          child: Text(
                                            text,
                                            style: TextStyle(
                                              color: isSelf ? Colors.white : Colors.black87,
                                              fontSize: 13,
                                            ),
                                          ),
                                        ),
                                      ],
                                    ),
                                  ),
                                );
                              },
                            ),
                    ),
                    const Divider(height: 1),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                      color: Theme.of(context).cardColor,
                      child: Row(
                        children: [
                          Expanded(
                            child: TextField(
                              controller: _textController,
                              decoration: InputDecoration(
                                hintText: 'Type a message...',
                                hintStyle: TextStyle(fontSize: 13, color: Colors.grey.shade500),
                                border: OutlineInputBorder(
                                  borderRadius: BorderRadius.circular(24),
                                  borderSide: BorderSide.none,
                                ),
                                filled: true,
                                fillColor: Colors.grey.shade100,
                                contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                              ),
                              textCapitalization: TextCapitalization.sentences,
                            ),
                          ),
                          const SizedBox(width: 8),
                          IconButton(
                            style: IconButton.styleFrom(
                              backgroundColor: const Color(0xFF1E5CB3),
                              foregroundColor: Colors.white,
                            ),
                            icon: const Icon(Icons.send),
                            onPressed: _sendMessage,
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
    );
  }
}
