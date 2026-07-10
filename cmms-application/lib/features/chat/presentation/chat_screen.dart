import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:socket_io_client/socket_io_client.dart' as io;

import '../../../core/providers/app_state.dart';
import '../../../core/widgets/cmms_scaffold.dart';
import '../../../core/widgets/data_state_widgets.dart';
import 'work_order_chat_screen.dart';

class ChatScreen extends StatefulWidget {
  const ChatScreen({super.key});

  @override
  State<ChatScreen> createState() => _ChatScreenState();
}

class _ChatScreenState extends State<ChatScreen> with SingleTickerProviderStateMixin {
  io.Socket? _socket;
  Map<String, dynamic>? _partner;
  final List<Map<String, dynamic>> _messages = [];
  List<Map<String, dynamic>> _contacts = [];
  final _textController = TextEditingController();
  final _scrollController = ScrollController();
  bool _isLoading = true;
  bool _isConnected = false;
  bool _isSending = false;
  String? _error;
  late TabController _tabController;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 2, vsync: this);
    _tabController.addListener(_handleTabChange);
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (mounted) {
        context.read<AppState>().setSupportChatActive(true);
      }
    });
    _initChat();
  }

  void _handleTabChange() {
    if (_tabController.indexIsChanging) return;
    final state = context.read<AppState>();
    if (_tabController.index == 0) {
      state.setSupportChatActive(true);
      state.setWorkOrderChatActive(false);
    } else {
      state.setSupportChatActive(false);
      state.setWorkOrderChatActive(true);
    }
  }

  @override
  void dispose() {
    _tabController.removeListener(_handleTabChange);
    _tabController.dispose();
    try {
      final state = context.read<AppState>();
      state.setSupportChatActive(false);
      state.setWorkOrderChatActive(false);
    } catch (_) {}
    _socket?.off('connect');
    _socket?.off('disconnect');
    _socket?.off('connect_error');
    _socket?.off('receiveMessage');
    _socket?.off('messageSent');
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
      // 1. Fetch Available Chat Users
      final contactsData = await apiClient.get('/chat/available-users');
      if (!mounted) return;

      if (contactsData is List) {
        _contacts = List<Map<String, dynamic>>.from(
          contactsData.map((x) => Map<String, dynamic>.from(x as Map))
        );
      } else {
        throw Exception('Invalid contacts data format returned by server.');
      }

      if (_contacts.isEmpty) {
        throw Exception('No chat contacts are available under your hierarchy.');
      }

      // Default to first contact if none selected
      if (_partner == null) {
        _partner = _contacts.first;
      } else {
        // Ensure previously selected partner still exists in available list
        final stillExists = _contacts.any((c) => c['id'] == _partner!['id']);
        if (!stillExists) {
          _partner = _contacts.first;
        }
      }

      // 2. Fetch Chat History
      final historyData = await apiClient.get('/chat/messages/${_partner!['id']}');
      if (!mounted) return;

      if (historyData is List) {
        _messages.clear();
        for (final item in historyData) {
          if (item is Map) {
            _messages.add(Map<String, dynamic>.from(item));
          }
        }
      }

      // 3. Connect to Socket
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
      debugPrint('Error initializing chat: $e');
      if (mounted) {
        setState(() {
          _error = e.toString();
          _isLoading = false;
        });
      }
    }
  }

  Future<void> _switchPartner(Map<String, dynamic> partner) async {
    if (_partner?['id'] == partner['id']) return;

    setState(() {
      _partner = partner;
      _isLoading = true;
    });

    try {
      final appState = context.read<AppState>();
      final apiClient = appState.apiClient;

      final historyData = await apiClient.get('/chat/messages/${partner['id']}');
      if (!mounted) return;

      if (historyData is List) {
        setState(() {
          _messages.clear();
          for (final item in historyData) {
            if (item is Map) {
              _messages.add(Map<String, dynamic>.from(item));
            }
          }
          _isLoading = false;
        });
        _scrollToBottom();
      }
    } catch (e) {
      debugPrint('Error switching partner: $e');
      if (mounted) {
        setState(() {
          _error = e.toString();
          _isLoading = false;
        });
      }
    }
  }

  void _showContactsBottomSheet(BuildContext context) {
    showModalBottomSheet(
      context: context,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (context) {
        return SafeArea(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              const Padding(
                padding: EdgeInsets.all(16.0),
                child: Text(
                  'Select Chat Partner',
                  style: TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ),
              const Divider(height: 1),
              Expanded(
                child: ListView.builder(
                  shrinkWrap: true,
                  itemCount: _contacts.length,
                  itemBuilder: (context, index) {
                    final contact = _contacts[index];
                    final isSelected = contact['id'] == _partner?['id'];
                    final roleName = contact['role']?.toString().replaceAll('_', ' ') ?? '';
                    final deptOrSite = contact['department'] ?? contact['site'] ?? '';

                    return ListTile(
                      leading: CircleAvatar(
                        backgroundColor: isSelected
                            ? Theme.of(context).primaryColor
                            : Colors.grey.shade200,
                        child: Text(
                          contact['fullName'].toString().substring(0, 2).toUpperCase(),
                          style: TextStyle(
                            color: isSelected ? Colors.white : Colors.black87,
                            fontSize: 12,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ),
                      title: Text(
                        contact['fullName'],
                        style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w600),
                      ),
                      subtitle: Row(
                        children: [
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                            decoration: BoxDecoration(
                              color: Colors.grey.shade100,
                              borderRadius: BorderRadius.circular(4),
                              border: Border.all(color: Colors.grey.shade300),
                            ),
                            child: Text(
                              roleName,
                              style: TextStyle(fontSize: 8, color: Colors.grey.shade700, fontWeight: FontWeight.bold),
                            ),
                          ),
                          if (deptOrSite.isNotEmpty) ...[
                            const SizedBox(width: 6),
                            Expanded(
                              child: Text(
                                deptOrSite,
                                style: const TextStyle(fontSize: 10, color: Colors.grey),
                                overflow: TextOverflow.ellipsis,
                              ),
                            ),
                          ],
                        ],
                      ),
                      trailing: isSelected
                          ? Icon(Icons.check_circle, color: Theme.of(context).primaryColor)
                          : null,
                      onTap: () {
                        Navigator.pop(context);
                        _switchPartner(contact);
                      },
                    );
                  },
                ),
              ),
            ],
          ),
        );
      },
    );
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
      debugPrint('Socket connected successfully');
      _socket?.emit('join');
      if (mounted) {
        setState(() => _isConnected = true);
      }
    });

    _socket?.onDisconnect((_) {
      debugPrint('Socket disconnected');
      if (mounted) {
        setState(() {
          _isConnected = false;
          _isSending = false;
        });
      }
    });

    _socket?.onConnectError((err) {
      debugPrint('Socket connection error: $err');
      if (mounted) {
        setState(() {
          _isConnected = false;
          _isSending = false;
        });
      }
    });

    _socket?.on('receiveMessage', (data) {
      debugPrint('Socket receiveMessage: $data');
      if (data is Map && mounted) {
        final message = Map<String, dynamic>.from(data);
        // Only append if it belongs to current conversation
        final currentUserId = appState.user?.id ?? '';
        final partnerId = _partner?['id'] ?? '';
        if ((message['senderId'] == partnerId && message['receiverId'] == currentUserId) ||
            (message['senderId'] == currentUserId && message['receiverId'] == partnerId)) {
          setState(() {
            _messages.add(message);
          });
          _scrollToBottom();
        }
      }
    });

    _socket?.on('messageSent', (data) {
      debugPrint('Socket messageSent confirmation: $data');
      if (data is Map && mounted) {
        final message = Map<String, dynamic>.from(data);
        setState(() {
          _isSending = false;
          // Prevent duplicates if already present in history
          if (!_messages.any((m) => m['id'] == message['id'])) {
            _messages.add(message);
          }
        });
        _scrollToBottom();
      }
    });
  }

  void _sendMessage() {
    final text = _textController.text.trim();
    if (text.isEmpty || _partner == null || _socket == null || _isSending) return;

    setState(() {
      _isSending = true;
    });

    _socket?.emit('sendMessage', {
      'receiverId': _partner!['id'],
      'message': text,
    });

    _textController.clear();
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
    final appState = context.watch<AppState>();
    final currentUserId = appState.user?.id ?? '';
    final partnerName = _partner?['fullName'] ?? _partner?['name'] ?? 'Admin';

    return CmmsScaffold(
      title: 'Chat',
      actions: [
        IconButton(
          tooltip: 'Select Contact',
          icon: const Icon(Icons.people_outline),
          onPressed: () => _showContactsBottomSheet(context),
        ),
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 8.0),
          child: Center(
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
              decoration: BoxDecoration(
                color: _isConnected ? Colors.green.withValues(alpha: 0.15) : Colors.red.withValues(alpha: 0.15),
                borderRadius: BorderRadius.circular(12),
                border: Border.all(
                  color: _isConnected ? Colors.green.withValues(alpha: 0.3) : Colors.red.withValues(alpha: 0.3),
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
      child: Column(
        children: [
          TabBar(
            controller: _tabController,
            labelColor: Theme.of(context).primaryColor,
            unselectedLabelColor: Colors.black54,
            indicatorColor: Theme.of(context).primaryColor,
            tabs: [
              Tab(
                icon: const Icon(Icons.chat_bubble_outline, size: 20),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    const Text('Support Desk'),
                    if (appState.unreadSupportCount > 0) ...[
                      const SizedBox(width: 6),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                        decoration: BoxDecoration(
                          color: Colors.red,
                          borderRadius: BorderRadius.circular(10),
                        ),
                        child: Text(
                          '${appState.unreadSupportCount}',
                          style: const TextStyle(
                            color: Colors.white,
                            fontSize: 10,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ),
                    ],
                  ],
                ),
              ),
              Tab(
                icon: const Icon(Icons.forum_outlined, size: 20),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    const Text('Work Orders'),
                    if (appState.unreadWorkOrderCount > 0) ...[
                      const SizedBox(width: 6),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                        decoration: BoxDecoration(
                          color: Colors.red,
                          borderRadius: BorderRadius.circular(10),
                        ),
                        child: Text(
                          '${appState.unreadWorkOrderCount}',
                          style: const TextStyle(
                            color: Colors.white,
                            fontSize: 10,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ),
                    ],
                  ],
                ),
              ),
            ],
          ),
          const Divider(height: 1),
          Expanded(
            child: TabBarView(
              controller: _tabController,
              children: [
                // Support Desk Chat View
                Builder(
                  builder: (context) {
                    if (_isLoading) {
                      return const LoadingView();
                    }
                    if (_error != null) {
                      return ErrorPanel(
                        message: _error!,
                        onRetry: _initChat,
                      );
                    }
                    return Column(
                      children: [
                        // Active support info bar
                        Container(
                          width: double.infinity,
                          padding: const EdgeInsets.all(12),
                          color: Theme.of(context).cardColor,
                          child: Row(
                            children: [
                              const CircleAvatar(
                                radius: 16,
                                child: Icon(Icons.support_agent, size: 18),
                              ),
                              const SizedBox(width: 12),
                              Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text(
                                      partnerName,
                                      style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13),
                                    ),
                                    Text(
                                      _partner?['email'] ?? '',
                                      style: TextStyle(fontSize: 11, color: Colors.grey.shade600),
                                    ),
                                  ],
                                ),
                              ),
                            ],
                          ),
                        ),
                        const Divider(height: 1),

                        // Messages List
                        Expanded(
                          child: _messages.isEmpty
                              ? Center(
                                  child: Column(
                                    mainAxisAlignment: MainAxisAlignment.center,
                                    children: [
                                      Icon(Icons.chat_outlined, size: 48, color: Colors.grey.shade400),
                                      const SizedBox(height: 12),
                                      Text(
                                        'No messages yet',
                                        style: TextStyle(color: Colors.grey.shade500),
                                      ),
                                      const SizedBox(height: 4),
                                      Text(
                                        'Type a message to start support.',
                                        style: TextStyle(color: Colors.grey.shade400, fontSize: 12),
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
                                    final isSelf = msg['senderId'] == currentUserId;
                                    final text = msg['message']?.toString() ?? '';
                                    final timeStr = _formatTime(msg['createdAt']?.toString());

                                    return Align(
                                      alignment: isSelf ? Alignment.centerRight : Alignment.centerLeft,
                                      child: Container(
                                        margin: const EdgeInsets.only(bottom: 12),
                                        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                                        decoration: BoxDecoration(
                                          color: isSelf
                                              ? Theme.of(context).primaryColor
                                              : Theme.of(context).cardColor,
                                          borderRadius: BorderRadius.only(
                                            topLeft: const Radius.circular(16),
                                            topRight: const Radius.circular(16),
                                            bottomLeft: isSelf ? const Radius.circular(16) : Radius.zero,
                                            bottomRight: isSelf ? Radius.zero : const Radius.circular(16),
                                          ),
                                          border: isSelf
                                              ? null
                                              : Border.all(
                                                  color: Colors.grey.withValues(alpha: 0.15),
                                                ),
                                        ),
                                        constraints: BoxConstraints(
                                          maxWidth: MediaQuery.of(context).size.width * 0.75,
                                        ),
                                        child: Column(
                                          crossAxisAlignment: CrossAxisAlignment.end,
                                          mainAxisSize: MainAxisSize.min,
                                          children: [
                                            Text(
                                              text,
                                              style: TextStyle(
                                                color: isSelf ? Colors.white : null,
                                                fontSize: 13,
                                              ),
                                            ),
                                            if (timeStr.isNotEmpty) ...[
                                              const SizedBox(height: 4),
                                              Text(
                                                timeStr,
                                                style: TextStyle(
                                                  fontSize: 9,
                                                  color: isSelf ? Colors.white.withValues(alpha: 0.7) : Colors.grey,
                                                ),
                                              ),
                                            ],
                                          ],
                                        ),
                                      ),
                                    );
                                  },
                                ),
                        ),

                        const Divider(height: 1),

                        // Bottom input bar
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                          color: Theme.of(context).cardColor,
                          child: Row(
                            children: [
                              Expanded(
                                child: Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 16),
                                  decoration: BoxDecoration(
                                    color: Theme.of(context).brightness == Brightness.dark
                                        ? const Color(0xFF161E2E)
                                        : Colors.grey.shade100,
                                    borderRadius: BorderRadius.circular(24),
                                  ),
                                  child: TextField(
                                    controller: _textController,
                                    decoration: InputDecoration(
                                      hintText: _isConnected ? 'Type a message...' : 'Connecting...',
                                      border: InputBorder.none,
                                      enabled: _isConnected,
                                    ),
                                    style: const TextStyle(fontSize: 14),
                                    onSubmitted: (_) => _sendMessage(),
                                  ),
                                ),
                              ),
                              const SizedBox(width: 8),
                              IconButton(
                                icon: _isSending
                                    ? SizedBox(
                                        width: 18,
                                        height: 18,
                                        child: CircularProgressIndicator(
                                          strokeWidth: 2,
                                          color: Theme.of(context).primaryColor,
                                        ),
                                      )
                                    : const Icon(Icons.send),
                                color: Theme.of(context).primaryColor,
                                onPressed: (_isConnected && !_isSending) ? _sendMessage : null,
                              ),
                            ],
                          ),
                        ),
                      ],
                    );
                  },
                ),

                // Work Orders Chat View
                const _WorkOrderListTab(),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _WorkOrderListTab extends StatefulWidget {
  const _WorkOrderListTab();

  @override
  State<_WorkOrderListTab> createState() => _WorkOrderListTabState();
}

class _WorkOrderListTabState extends State<_WorkOrderListTab> {
  late Future<List<Map<String, dynamic>>> _futureWorkOrders;

  @override
  void initState() {
    super.initState();
    _loadWorkOrders();
  }

  void _loadWorkOrders() {
    setState(() {
      _futureWorkOrders = _fetchWorkOrders();
    });
  }

  Future<List<Map<String, dynamic>>> _fetchWorkOrders() async {
    final appState = context.read<AppState>();
    final isTechnician = appState.user?.role == 'TECHNICIAN';
    final endpoint = isTechnician ? '/work-orders/my' : '/work-orders';
    final response = await appState.apiClient.get(endpoint);

    List<dynamic> rawList = [];
    if (response is Map) {
      if (response['workOrders'] is List) {
        rawList = response['workOrders'];
      } else if (response['data'] is List) {
        rawList = response['data'];
      }
    } else if (response is List) {
      rawList = response;
    }

    return List<Map<String, dynamic>>.from(
      rawList.map((x) => Map<String, dynamic>.from(x as Map))
    );
  }

  @override
  Widget build(BuildContext context) {
    return RefreshIndicator(
      onRefresh: () async => _loadWorkOrders(),
      child: FutureBuilder<List<Map<String, dynamic>>>(
        future: _futureWorkOrders,
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) {
            return const Center(child: CircularProgressIndicator());
          }
          if (snapshot.hasError) {
            return ErrorPanel(
              message: snapshot.error.toString(),
              onRetry: _loadWorkOrders,
            );
          }

          final list = snapshot.data ?? [];
          if (list.isEmpty) {
            return Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(Icons.playlist_remove, size: 48, color: Colors.grey.shade400),
                  const SizedBox(height: 12),
                  Text(
                    'No Work Orders found',
                    style: TextStyle(color: Colors.grey.shade500, fontWeight: FontWeight.bold),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    'Pull down to refresh.',
                    style: TextStyle(color: Colors.grey.shade400, fontSize: 11),
                  ),
                ],
              ),
            );
          }

          return ListView.separated(
            padding: const EdgeInsets.all(12),
            itemCount: list.length,
            separatorBuilder: (context, index) => const SizedBox(height: 8),
            itemBuilder: (context, index) {
              final wo = list[index];
              final number = wo['workOrderNumber']?.toString() ?? 'WO';
              final title = wo['title']?.toString() ?? 'Work Order';
              final status = wo['status']?.toString() ?? 'OPEN';

              Color statusColor = Colors.grey;
              if (status == 'IN_PROGRESS') statusColor = Colors.purple;
              if (status == 'COMPLETED') statusColor = Colors.green;
              if (status == 'ASSIGNED') statusColor = Colors.blue;
              if (status == 'OPEN') statusColor = Colors.orange;

              return Card(
                elevation: 0,
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(12),
                  side: BorderSide(color: Colors.grey.shade200),
                ),
                child: ListTile(
                  contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                  leading: CircleAvatar(
                    backgroundColor: Colors.blue.shade50,
                    child: Icon(Icons.engineering, color: Colors.blue.shade700),
                  ),
                  title: Row(
                    children: [
                      Text(
                        number,
                        style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14),
                      ),
                      const SizedBox(width: 8),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                        decoration: BoxDecoration(
                          color: statusColor.withValues(alpha: 0.12),
                          borderRadius: BorderRadius.circular(4),
                        ),
                        child: Text(
                          status.replaceAll('_', ' '),
                          style: TextStyle(color: statusColor, fontSize: 8, fontWeight: FontWeight.bold),
                        ),
                      ),
                    ],
                  ),
                  subtitle: Padding(
                    padding: const EdgeInsets.only(top: 4.0),
                    child: Text(
                      title,
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                      style: TextStyle(color: Colors.grey.shade700, fontSize: 12),
                    ),
                  ),
                  trailing: const Icon(Icons.arrow_forward_ios, size: 14, color: Colors.grey),
                  onTap: () {
                    Navigator.push(
                      context,
                      MaterialPageRoute(
                        builder: (context) => WorkOrderChatScreen(workOrder: wo),
                      ),
                    );
                  },
                ),
              );
            },
          );
        },
      ),
    );
  }
}
