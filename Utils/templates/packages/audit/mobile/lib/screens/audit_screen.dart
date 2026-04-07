import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../l10n/app_localizations.dart';
import '../providers/auth_provider.dart';
import '../services/audit_service.dart';

class AuditScreen extends ConsumerStatefulWidget {
  const AuditScreen({super.key});

  @override
  ConsumerState<AuditScreen> createState() => _AuditScreenState();
}

class _AuditScreenState extends ConsumerState<AuditScreen> {
  final List<Map<String, dynamic>> _logs = [];
  bool _loading = false;
  bool _hasMore = true;
  int _page = 0;
  final int _pageSize = 20;

  String? _filterEntity;
  String? _filterUserId;

  @override
  void initState() {
    super.initState();
    _fetchLogs();
  }

  Future<void> _fetchLogs({bool reset = false}) async {
    if (_loading) return;

    if (reset) {
      setState(() {
        _logs.clear();
        _page = 0;
        _hasMore = true;
      });
    }

    setState(() => _loading = true);

    try {
      final service = ref.read(auditServiceProvider);
      final results = await service.getAuditLogs(
        entityName: _filterEntity,
        userId: _filterUserId,
        page: _page,
        size: _pageSize,
      );
      setState(() {
        _logs.addAll(results);
        _hasMore = results.length >= _pageSize;
        _page++;
      });
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(e.toString())),
        );
      }
    } finally {
      if (mounted) {
        setState(() => _loading = false);
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    final theme = Theme.of(context);
    final authState = ref.watch(authProvider);

    // ADMIN only guard
    if (!authState.hasRole('ADMIN')) {
      return Scaffold(
        appBar: AppBar(title: Text(l10n.auditTitle)),
        body: Center(
          child: Text(
            l10n.auditAccessDenied,
            style: theme.textTheme.bodyLarge,
          ),
        ),
      );
    }

    return Scaffold(
      appBar: AppBar(
        title: Text(l10n.auditTitle),
        actions: [
          IconButton(
            icon: const Icon(Icons.filter_list),
            onPressed: () => _showFilterDialog(context, l10n),
          ),
        ],
      ),
      body: _logs.isEmpty && _loading
          ? const Center(child: CircularProgressIndicator())
          : _logs.isEmpty
              ? Center(
                  child: Text(
                    l10n.auditEmpty,
                    style: theme.textTheme.bodyLarge?.copyWith(
                      color: theme.colorScheme.onSurfaceVariant,
                    ),
                  ),
                )
              : RefreshIndicator(
                  onRefresh: () => _fetchLogs(reset: true),
                  child: NotificationListener<ScrollNotification>(
                    onNotification: (notification) {
                      if (notification is ScrollEndNotification &&
                          notification.metrics.extentAfter < 200 &&
                          _hasMore &&
                          !_loading) {
                        _fetchLogs();
                      }
                      return false;
                    },
                    child: ListView.builder(
                      itemCount: _logs.length + (_hasMore ? 1 : 0),
                      itemBuilder: (context, index) {
                        if (index >= _logs.length) {
                          return const Padding(
                            padding: EdgeInsets.all(16),
                            child: Center(child: CircularProgressIndicator()),
                          );
                        }
                        return _buildLogTile(context, theme, l10n, _logs[index]);
                      },
                    ),
                  ),
                ),
    );
  }

  Widget _buildLogTile(
    BuildContext context,
    ThemeData theme,
    AppLocalizations l10n,
    Map<String, dynamic> log,
  ) {
    final action = log['action'] as String? ?? '';
    final color = _actionColor(action, theme);

    return Card(
      margin: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
      child: ListTile(
        leading: CircleAvatar(
          backgroundColor: color.withOpacity(0.15),
          child: Icon(_actionIcon(action), color: color, size: 20),
        ),
        title: Text(
          '${log['entityName'] ?? ''} #${log['entityId'] ?? ''}',
          style: theme.textTheme.bodyMedium?.copyWith(
            fontWeight: FontWeight.w600,
          ),
        ),
        subtitle: Text(
          '${action.toUpperCase()} — ${log['userId'] ?? ''}',
          style: theme.textTheme.bodySmall?.copyWith(
            color: theme.colorScheme.onSurfaceVariant,
          ),
        ),
        trailing: Text(
          _formatTimestamp(log['timestamp']),
          style: theme.textTheme.labelSmall?.copyWith(
            color: theme.colorScheme.onSurfaceVariant,
          ),
        ),
        onTap: log['changes'] != null
            ? () => _showChangesDialog(context, theme, l10n, log)
            : null,
      ),
    );
  }

  Color _actionColor(String action, ThemeData theme) {
    switch (action.toUpperCase()) {
      case 'CREATE':
        return Colors.green;
      case 'UPDATE':
        return Colors.blue;
      case 'DELETE':
        return Colors.red;
      default:
        return theme.colorScheme.primary;
    }
  }

  IconData _actionIcon(String action) {
    switch (action.toUpperCase()) {
      case 'CREATE':
        return Icons.add_circle_outline;
      case 'UPDATE':
        return Icons.edit_outlined;
      case 'DELETE':
        return Icons.delete_outline;
      default:
        return Icons.info_outline;
    }
  }

  String _formatTimestamp(dynamic timestamp) {
    if (timestamp == null) return '';
    try {
      final dt = DateTime.parse(timestamp.toString());
      return '${dt.day.toString().padLeft(2, '0')}/${dt.month.toString().padLeft(2, '0')} ${dt.hour.toString().padLeft(2, '0')}:${dt.minute.toString().padLeft(2, '0')}';
    } catch (_) {
      return timestamp.toString();
    }
  }

  void _showFilterDialog(BuildContext context, AppLocalizations l10n) {
    final entityController = TextEditingController(text: _filterEntity ?? '');
    final userController = TextEditingController(text: _filterUserId ?? '');

    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: Text(l10n.auditFilters),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            TextField(
              controller: entityController,
              decoration: InputDecoration(
                labelText: l10n.auditFilterEntity,
                border: const OutlineInputBorder(),
              ),
            ),
            const SizedBox(height: 12),
            TextField(
              controller: userController,
              decoration: InputDecoration(
                labelText: l10n.auditFilterUser,
                border: const OutlineInputBorder(),
              ),
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () {
              setState(() {
                _filterEntity = null;
                _filterUserId = null;
              });
              Navigator.of(ctx).pop();
              _fetchLogs(reset: true);
            },
            child: Text(l10n.commonClear),
          ),
          FilledButton(
            onPressed: () {
              setState(() {
                _filterEntity = entityController.text.isNotEmpty
                    ? entityController.text
                    : null;
                _filterUserId = userController.text.isNotEmpty
                    ? userController.text
                    : null;
              });
              Navigator.of(ctx).pop();
              _fetchLogs(reset: true);
            },
            child: Text(l10n.auditApplyFilters),
          ),
        ],
      ),
    );
  }

  void _showChangesDialog(
    BuildContext context,
    ThemeData theme,
    AppLocalizations l10n,
    Map<String, dynamic> log,
  ) {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: Text(l10n.auditChangesTitle),
        content: SingleChildScrollView(
          child: Text(
            log['changes']?.toString() ?? '',
            style: theme.textTheme.bodySmall?.copyWith(
              fontFamily: 'monospace',
            ),
          ),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(ctx).pop(),
            child: Text(l10n.commonClose),
          ),
        ],
      ),
    );
  }
}
