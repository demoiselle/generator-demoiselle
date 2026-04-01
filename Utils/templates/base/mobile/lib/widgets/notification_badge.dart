import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../providers/notifications_provider.dart';

class NotificationBadge extends ConsumerWidget {
  const NotificationBadge({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final theme = Theme.of(context);
    final state = ref.watch(notificationsProvider);
    final unreadCount = state.unreadCount;

    return IconButton(
      icon: Badge(
        isLabelVisible: unreadCount > 0,
        label: Text(
          unreadCount > 99 ? '99+' : unreadCount.toString(),
          style: TextStyle(
            color: theme.colorScheme.onError,
            fontSize: 10,
            fontWeight: FontWeight.bold,
          ),
        ),
        backgroundColor: theme.colorScheme.error,
        child: Icon(
          unreadCount > 0
              ? Icons.notifications_active_outlined
              : Icons.notifications_outlined,
          color: theme.colorScheme.onSurface,
        ),
      ),
      onPressed: () => context.push('/notifications'),
      tooltip: 'Notifications',
    );
  }
}
