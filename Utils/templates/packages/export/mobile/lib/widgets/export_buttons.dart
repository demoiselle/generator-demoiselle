import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../l10n/app_localizations.dart';
import '../services/export_service.dart';

class ExportButtons extends ConsumerStatefulWidget {
  /// The entity API path used for export endpoints (e.g. 'users').
  final String entityPath;

  /// Optional filters to apply when exporting.
  final Map<String, dynamic>? filters;

  const ExportButtons({
    super.key,
    required this.entityPath,
    this.filters,
  });

  @override
  ConsumerState<ExportButtons> createState() => _ExportButtonsState();
}

class _ExportButtonsState extends ConsumerState<ExportButtons> {
  bool _exporting = false;

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    final theme = Theme.of(context);

    if (_exporting) {
      return const Padding(
        padding: EdgeInsets.symmetric(horizontal: 12),
        child: SizedBox(
          width: 20,
          height: 20,
          child: CircularProgressIndicator(strokeWidth: 2),
        ),
      );
    }

    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        IconButton(
          icon: const Icon(Icons.table_chart_outlined),
          tooltip: l10n.exportCsv,
          onPressed: () => _export(context, 'csv'),
        ),
        IconButton(
          icon: const Icon(Icons.picture_as_pdf_outlined),
          tooltip: l10n.exportPdf,
          onPressed: () => _export(context, 'pdf'),
        ),
      ],
    );
  }

  Future<void> _export(BuildContext context, String format) async {
    setState(() => _exporting = true);

    try {
      final exportService = ref.read(exportServiceProvider);
      if (format == 'csv') {
        await exportService.exportCsv(
          widget.entityPath,
          filters: widget.filters,
        );
      } else {
        await exportService.exportPdf(
          widget.entityPath,
          filters: widget.filters,
        );
      }
    } catch (e) {
      if (context.mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('${AppLocalizations.of(context)!.exportError}: $e'),
            backgroundColor: Theme.of(context).colorScheme.error,
          ),
        );
      }
    } finally {
      if (mounted) {
        setState(() => _exporting = false);
      }
    }
  }
}
