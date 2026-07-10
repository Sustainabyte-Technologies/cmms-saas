import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';

import '../providers/app_state.dart';

class CmmsScaffold extends StatelessWidget {
  const CmmsScaffold({
    super.key,
    required this.title,
    required this.child,
    this.actions,
    this.floatingActionButton,
    this.appBar,
  });

  final String title;
  final Widget child;
  final List<Widget>? actions;
  final Widget? floatingActionButton;
  final PreferredSizeWidget? appBar;

  @override
  Widget build(BuildContext context) {
    final state = context.watch<AppState>();
    final navItems = _navItemsFor(state.user?.role ?? '');
    final isChatRoute = title == 'Support Chat';

    return Scaffold(
      appBar: appBar ?? AppBar(
        title: Text(title),
        actions: [
          IconButton(
            tooltip: 'Search',
            onPressed: () => context.push('/search'),
            icon: const Icon(Icons.search),
          ),
          IconButton(
            tooltip: 'Notifications',
            onPressed: () => context.push('/notifications'),
            icon: const Icon(Icons.notifications_none),
          ),
          PopupMenuButton<ThemeMode>(
            tooltip: 'Theme',
            icon: const Icon(Icons.contrast),
            onSelected: state.setThemeMode,
            itemBuilder: (context) => const [
              PopupMenuItem(value: ThemeMode.system, child: Text('System')),
              PopupMenuItem(value: ThemeMode.light, child: Text('Light')),
              PopupMenuItem(value: ThemeMode.dark, child: Text('Dark')),
            ],
          ),
          ...?actions,
        ],
      ),
      drawer: Drawer(
        child: SafeArea(
          child: Column(
            children: [
              ListTile(
                title: Text(state.user?.name ?? 'CMMS'),
                subtitle: Text(state.user?.role ?? ''),
                leading: const CircleAvatar(child: Icon(Icons.engineering)),
              ),
              const Divider(),
              Expanded(
                child: ListView(
                  children: [
                    for (final item in navItems)
                      ListTile(
                        leading: Icon(item.icon),
                        title: Text(item.label),
                        onTap: () {
                          Navigator.of(context).pop();
                          context.go(item.path);
                        },
                      ),
                  ],
                ),
              ),
              ListTile(
                leading: const Icon(Icons.logout),
                title: const Text('Logout'),
                onTap: () => state.logout(),
              ),
            ],
          ),
        ),
      ),
      floatingActionButton: floatingActionButton ??
          (isChatRoute || !state.isAuthenticated
              ? null
              : Stack(
                  clipBehavior: Clip.none,
                  children: [
                    FloatingActionButton(
                      tooltip: 'Support Chat',
                      onPressed: () => context.push('/chat'),
                      child: const Icon(Icons.support_agent),
                    ),
                    if (state.unreadChatCount > 0)
                      Positioned(
                        right: -4,
                        top: -4,
                        child: Container(
                          padding: const EdgeInsets.all(6),
                          decoration: const BoxDecoration(
                            color: Colors.red,
                            shape: BoxShape.circle,
                          ),
                          constraints: const BoxConstraints(
                            minWidth: 20,
                            minHeight: 20,
                          ),
                          child: Text(
                            '${state.unreadChatCount}',
                            style: const TextStyle(
                              color: Colors.white,
                              fontSize: 10,
                              fontWeight: FontWeight.bold,
                            ),
                            textAlign: TextAlign.center,
                          ),
                        ),
                      ),
                  ],
                )),
      body: SafeArea(child: child),
    );
  }
}

class NavItem {
  const NavItem(this.label, this.path, this.icon);

  final String label;
  final String path;
  final IconData icon;
}

List<NavItem> _navItemsFor(String role) {
  final common = <NavItem>[
    const NavItem('Dashboard', '/dashboard', Icons.dashboard_outlined),
    const NavItem('Assets', '/assets', Icons.precision_manufacturing_outlined),
    const NavItem('Work Orders', '/work-orders', Icons.assignment_outlined),
    const NavItem('Checklists', '/checklists', Icons.checklist),
    const NavItem('Preventive', '/preventive', Icons.event_repeat),
    const NavItem('Spare Parts', '/inventory', Icons.inventory_2_outlined),
  ];

  if (role == 'TECHNICIAN') {
    return [
      const NavItem('My Jobs', '/dashboard', Icons.assignment_ind_outlined),
      const NavItem('Support Chat', '/chat', Icons.chat_bubble_outline),
      const NavItem('Checklists', '/checklists', Icons.checklist),
      const NavItem('Scan Asset', '/scan-asset', Icons.qr_code_scanner),
      const NavItem('Spare Parts', '/inventory', Icons.inventory_2_outlined),
    ];
  }

  if (role == 'SUPERVISOR' || role == 'SITE_INCHARGE') return common;

  return [
    const NavItem('Dashboard', '/dashboard', Icons.dashboard_outlined),
    const NavItem('Portfolio', '/portfolio', Icons.account_tree_outlined),
    const NavItem('Users', '/users', Icons.people_alt_outlined),
    ...common.skip(1),
  ];
}
