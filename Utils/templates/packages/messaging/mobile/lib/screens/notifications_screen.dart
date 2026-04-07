import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../l10n/app_localizations.dart';
import '../models/notification_model.dart';
import '../providers/notifications_provider.dart';

class NotificationsScreen extends ConsumerStatefulWidget {
  const NotificationsScreen({super.key});

  @override
  ConsumerState<NotificationsScreen> createState() =>
      _NotificationsScreenState();
}

class _NotificationsScreenState extends ConsumerState<NotificationsScreen> {
  @override
  void initState() {
    super.initState();
    Future.microtask(() {
      ref.read(notificationsProvider.notifier).fetchNotifications();
    });
  }

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    final theme = Theme.of(context);
    final state = ref.watch(notificationsProvider);

    return Scaffold(
      appBar: AppBar(
        title: Text(l10n.notificationsTitle),
      ),
      body: state.isLoading && state.notifications.isEmpty
          ? const Center(child: CircularProgressIndicator())
          : state.notifications.isEmpty
              ? Center(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Icon(
                        Icons.notifications_none_outlined,
                        size: 64,
                        color: theme.colorScheme.onSurfaceVariant,
                      ),
                      const SizedBox(height: 16),
                      Text(
                        l10n.notificationsEmpty,
                        style: theme.textTheme.bodyLarge?.copyWith(
                          color: theme.colorScheme.onSurfaceVariant,
                        ),
                      ),
                    ],
                  ),
                )
              : RefreshIndicator(
                  onRefresh: () => ref
                      .read(notificationsProvider.notifier)
                      .fetchNotifications(),
                  child: ListView.builder(
                    itemCount: state.notifications.length,
                    itemBuilder: (context, index) {
                      final notification = state.notifications[index];
                      return _buildNotificationTile(
                        context,
                        theme,
                        l10n,
                        notification,
                      );
                    },
                  ),
                ),
    );
  }

  Widget _buildNotificationTile(
    BuildContext context,
    ThemeData theme,
    AppLocalizations l10n,
    NotificationModel notification,
  ) {
    final color = _typeColor(notification.type, theme);

    return Dismissible(
      key: ValueKey(notification.id),
      direction: DismissDirection.endToStart,
      background: Container(
        alignment: Alignment.centerRight,
        padding: const EdgeInsets.only(right: 20),
        color: theme.colorScheme.primary,
        child: Icon(
          Icons.mark_email_read_outlined,
          color: theme.colorScheme.onPrimary,
        ),
      ),
      confirmDismiss: (_) async {
        if (!notification.read) {
          await ref
              .read(notificationsProvider.notifier)
              .markAsRead(notification.id);
        }
        return false;
      },
      child: Card(
        margin: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
        color: notification.read
            ? null
            : theme.colorScheme.primaryContainer.withOpacity(0.3),
        child: ListTile(
          leading: CircleAvatar(
            backgroundColor: color.withOpacity(0.15),
            child: Icon(_typeIcon(notification.type), color: color, size: 20),
          ),
          title: Text(
            notification.title,
            style: theme.textTheme.bodyMedium?.copyWith(
              fontWeight: notification.read ? FontWeight.normal : FontWeight.w600,
            ),
          ),
          subtitle: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const SizedBox(height: 4),
              Text(
                notification.message,
                style: theme.textTheme.bodySmall?.copyWith(
                  color: theme.colorScheme.onSurfaceVariant,
                ),
                maxLines: 2,
                overflow: TextOverflow.ellipsis,
              ),
              const SizedBox(height: 4),
              Text(
                _formatDate(notification.createdAt),
                style: theme.textTheme.labelSmall?.copyWith(
                  color: theme.colorScheme.onSurfaceVariant,
                ),
              ),
            ],
          ),
          trailing: notification.read
              ? null
              : Container(
                  width: 10,
                  height: 10,
                  decoration: BoxDecoration(
                    color: theme.colorScheme.primary,
                    shape: BoxShape.circle,
                  ),
                ),
          onTap: () {
            if (!notification.read) {
              ref
                  .read(notificationsProvider.notifier)
                  .markAsRead(notification.id);
            }
          },
        ),
      ),
    );
  }

  Color _typeColor(String type, ThemeData theme) {
    switch (type.toUpperCase()) {
      case 'WARNING':
        return Colors.orange;
      case 'ERROR':
        return Colors.red;
      case 'INFO':
      default:
        return theme.colorScheme.primary;
    }
  }

  IconData _typeIcon(String type) {
    switch (type.toUpperCase()) {
      case 'WARNING':
        return Icons.warning_amber_outlined;
      case 'ERROR':
        return Icons.error_outline;
      case 'INFO':
      default:
        return Icons.info_outline;
    }
  }

  String _formatDate(String? dateStr) {
    if (dateStr == null) return '';
    try {
      final dt = DateTime.parse(dateStr);
      return '${dt.day.toString().padLeft(2, '0')}/${dt.month.toString().padLeft(2, '0')}/${dt.year} ${dt.hour.toString().padLeft(2, '0')}:${dt.minute.toString().padLeft(2, '0')}';
    } catch (_) {
      return dateStr;
    }
  }
}
