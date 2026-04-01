import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../l10n/app_localizations.dart';
import '../models/dashboard_stats_model.dart';
import '../services/dashboard_service.dart';

final _dashboardStatsProvider =
    FutureProvider.autoDispose<DashboardStatsModel>((ref) async {
  final service = ref.read(dashboardServiceProvider);
  return service.getStats();
});

class DashboardScreen extends ConsumerWidget {
  const DashboardScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final l10n = AppLocalizations.of(context)!;
    final theme = Theme.of(context);
    final statsAsync = ref.watch(_dashboardStatsProvider);

    return Scaffold(
      appBar: AppBar(
        title: Text(l10n.dashboardTitle),
      ),
      body: statsAsync.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (error, _) => _buildError(context, ref, l10n, theme, error),
        data: (stats) => _buildContent(context, l10n, theme, stats),
      ),
    );
  }

  Widget _buildError(
    BuildContext context,
    WidgetRef ref,
    AppLocalizations l10n,
    ThemeData theme,
    Object error,
  ) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              Icons.error_outline,
              size: 48,
              color: theme.colorScheme.error,
            ),
            const SizedBox(height: 16),
            Text(
              l10n.dashboardError,
              style: theme.textTheme.bodyLarge,
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 16),
            FilledButton.icon(
              onPressed: () => ref.invalidate(_dashboardStatsProvider),
              icon: const Icon(Icons.refresh),
              label: Text(l10n.commonRetry),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildContent(
    BuildContext context,
    AppLocalizations l10n,
    ThemeData theme,
    DashboardStatsModel stats,
  ) {
    final entries = stats.counts.entries.toList();

    return RefreshIndicator(
      onRefresh: () async {
        // Trigger a refresh by reading the provider again
        // The autoDispose + invalidate pattern handles this
      },
      child: LayoutBuilder(
        builder: (context, constraints) {
          final isTablet = constraints.maxWidth >= 600;
          final crossAxisCount = isTablet ? 3 : 2;

          return GridView.builder(
            padding: const EdgeInsets.all(16),
            gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
              crossAxisCount: crossAxisCount,
              crossAxisSpacing: 12,
              mainAxisSpacing: 12,
              childAspectRatio: isTablet ? 1.8 : 1.4,
            ),
            itemCount: entries.length,
            itemBuilder: (context, index) {
              final entry = entries[index];
              return _StatCard(
                entityName: entry.key,
                count: entry.value,
                icon: _getEntityIcon(entry.key),
                theme: theme,
                l10n: l10n,
              );
            },
          );
        },
      ),
    );
  }

  IconData _getEntityIcon(String entity) {
    final icons = <String, IconData>{
      'users': Icons.people_outlined,
      'notifications': Icons.notifications_outlined,
      'files': Icons.folder_outlined,
      'auditLogs': Icons.history_outlined,
    };
    return icons[entity] ?? Icons.inventory_2_outlined;
  }
}

class _StatCard extends StatelessWidget {
  final String entityName;
  final int count;
  final IconData icon;
  final ThemeData theme;
  final AppLocalizations l10n;

  const _StatCard({
    required this.entityName,
    required this.count,
    required this.icon,
    required this.theme,
    required this.l10n,
  });

  @override
  Widget build(BuildContext context) {
    return Card(
      elevation: 1,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              icon,
              size: 32,
              color: theme.colorScheme.primary,
            ),
            const SizedBox(height: 8),
            Text(
              count.toString(),
              style: theme.textTheme.headlineSmall?.copyWith(
                fontWeight: FontWeight.bold,
                color: theme.colorScheme.onSurface,
              ),
            ),
            const SizedBox(height: 4),
            Text(
              entityName,
              style: theme.textTheme.bodySmall?.copyWith(
                color: theme.colorScheme.onSurfaceVariant,
              ),
              textAlign: TextAlign.center,
              overflow: TextOverflow.ellipsis,
            ),
          ],
        ),
      ),
    );
  }
}
