import 'package:flutter/material.dart';

import '../l10n/app_localizations.dart';

enum FilterFieldType { text, dateRange, numberRange, boolean, select }

class FilterFieldDefinition {
  final String key;
  final String label;
  final FilterFieldType type;
  final List<String>? options; // for select type

  const FilterFieldDefinition({
    required this.key,
    required this.label,
    required this.type,
    this.options,
  });
}

class AdvancedFilterWidget extends StatefulWidget {
  final List<FilterFieldDefinition> fields;
  final void Function(Map<String, dynamic> filters) onFilter;

  const AdvancedFilterWidget({
    super.key,
    required this.fields,
    required this.onFilter,
  });

  @override
  State<AdvancedFilterWidget> createState() => _AdvancedFilterWidgetState();
}

class _AdvancedFilterWidgetState extends State<AdvancedFilterWidget> {
  final Map<String, dynamic> _values = {};
  bool _expanded = false;

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    final theme = Theme.of(context);

    return Card(
      margin: const EdgeInsets.all(8),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          InkWell(
            onTap: () => setState(() => _expanded = !_expanded),
            borderRadius: BorderRadius.circular(12),
            child: Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
              child: Row(
                children: [
                  Icon(
                    Icons.filter_list,
                    color: theme.colorScheme.primary,
                  ),
                  const SizedBox(width: 8),
                  Text(
                    l10n.filterTitle,
                    style: theme.textTheme.titleSmall?.copyWith(
                      color: theme.colorScheme.primary,
                    ),
                  ),
                  const Spacer(),
                  if (_hasActiveFilters())
                    Container(
                      padding: const EdgeInsets.symmetric(
                        horizontal: 8,
                        vertical: 2,
                      ),
                      decoration: BoxDecoration(
                        color: theme.colorScheme.primaryContainer,
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: Text(
                        _activeFilterCount().toString(),
                        style: theme.textTheme.labelSmall?.copyWith(
                          color: theme.colorScheme.onPrimaryContainer,
                        ),
                      ),
                    ),
                  const SizedBox(width: 4),
                  Icon(
                    _expanded
                        ? Icons.expand_less
                        : Icons.expand_more,
                    color: theme.colorScheme.onSurfaceVariant,
                  ),
                ],
              ),
            ),
          ),
          if (_expanded) ...[
            const Divider(height: 1),
            Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                children: [
                  ...widget.fields.map((field) => Padding(
                        padding: const EdgeInsets.only(bottom: 12),
                        child: _buildField(context, theme, field),
                      )),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.end,
                    children: [
                      TextButton(
                        onPressed: _clear,
                        child: Text(l10n.filterClear),
                      ),
                      const SizedBox(width: 8),
                      FilledButton.icon(
                        onPressed: _apply,
                        icon: const Icon(Icons.search, size: 18),
                        label: Text(l10n.filterApply),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ],
        ],
      ),
    );
  }

  Widget _buildField(
    BuildContext context,
    ThemeData theme,
    FilterFieldDefinition field,
  ) {
    switch (field.type) {
      case FilterFieldType.text:
        return TextFormField(
          decoration: InputDecoration(
            labelText: field.label,
            border: const OutlineInputBorder(),
            isDense: true,
          ),
          initialValue: _values[field.key] as String?,
          onChanged: (v) => _values[field.key] = v.isEmpty ? null : v,
        );

      case FilterFieldType.dateRange:
        return _DateRangeField(
          label: field.label,
          startDate: _values['${field.key}Start'] as DateTime?,
          endDate: _values['${field.key}End'] as DateTime?,
          onChanged: (start, end) {
            setState(() {
              _values['${field.key}Start'] = start;
              _values['${field.key}End'] = end;
            });
          },
        );

      case FilterFieldType.numberRange:
        return Row(
          children: [
            Expanded(
              child: TextFormField(
                decoration: InputDecoration(
                  labelText: '${field.label} min',
                  border: const OutlineInputBorder(),
                  isDense: true,
                ),
                keyboardType: TextInputType.number,
                initialValue: _values['${field.key}Min']?.toString(),
                onChanged: (v) => _values['${field.key}Min'] =
                    v.isEmpty ? null : num.tryParse(v),
              ),
            ),
            const SizedBox(width: 8),
            Expanded(
              child: TextFormField(
                decoration: InputDecoration(
                  labelText: '${field.label} max',
                  border: const OutlineInputBorder(),
                  isDense: true,
                ),
                keyboardType: TextInputType.number,
                initialValue: _values['${field.key}Max']?.toString(),
                onChanged: (v) => _values['${field.key}Max'] =
                    v.isEmpty ? null : num.tryParse(v),
              ),
            ),
          ],
        );

      case FilterFieldType.boolean:
        return SwitchListTile(
          title: Text(field.label),
          value: _values[field.key] as bool? ?? false,
          onChanged: (v) => setState(() => _values[field.key] = v),
          contentPadding: EdgeInsets.zero,
        );

      case FilterFieldType.select:
        return DropdownButtonFormField<String>(
          decoration: InputDecoration(
            labelText: field.label,
            border: const OutlineInputBorder(),
            isDense: true,
          ),
          value: _values[field.key] as String?,
          items: field.options
              ?.map((o) => DropdownMenuItem(value: o, child: Text(o)))
              .toList(),
          onChanged: (v) => _values[field.key] = v,
        );
    }
  }

  bool _hasActiveFilters() {
    return _values.values.any((v) => v != null && v != false);
  }

  int _activeFilterCount() {
    return _values.values.where((v) => v != null && v != false).length;
  }

  void _clear() {
    setState(() => _values.clear());
    widget.onFilter({});
  }

  void _apply() {
    final filters = Map<String, dynamic>.from(_values)
      ..removeWhere((_, v) => v == null || v == false);
    // Convert DateTime values to ISO strings for API
    filters.updateAll((key, value) {
      if (value is DateTime) return value.toIso8601String();
      return value;
    });
    widget.onFilter(filters);
  }
}

class _DateRangeField extends StatelessWidget {
  final String label;
  final DateTime? startDate;
  final DateTime? endDate;
  final void Function(DateTime? start, DateTime? end) onChanged;

  const _DateRangeField({
    required this.label,
    required this.startDate,
    required this.endDate,
    required this.onChanged,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Row(
      children: [
        Expanded(
          child: InkWell(
            onTap: () => _pickDate(context, isStart: true),
            child: InputDecorator(
              decoration: InputDecoration(
                labelText: '$label (início)',
                border: const OutlineInputBorder(),
                isDense: true,
                suffixIcon: const Icon(Icons.calendar_today, size: 18),
              ),
              child: Text(
                startDate != null ? _formatDate(startDate!) : '',
                style: theme.textTheme.bodyMedium,
              ),
            ),
          ),
        ),
        const SizedBox(width: 8),
        Expanded(
          child: InkWell(
            onTap: () => _pickDate(context, isStart: false),
            child: InputDecorator(
              decoration: InputDecoration(
                labelText: '$label (fim)',
                border: const OutlineInputBorder(),
                isDense: true,
                suffixIcon: const Icon(Icons.calendar_today, size: 18),
              ),
              child: Text(
                endDate != null ? _formatDate(endDate!) : '',
                style: theme.textTheme.bodyMedium,
              ),
            ),
          ),
        ),
      ],
    );
  }

  Future<void> _pickDate(BuildContext context, {required bool isStart}) async {
    final picked = await showDatePicker(
      context: context,
      initialDate: (isStart ? startDate : endDate) ?? DateTime.now(),
      firstDate: DateTime(2000),
      lastDate: DateTime(2100),
    );
    if (picked != null) {
      onChanged(
        isStart ? picked : startDate,
        isStart ? endDate : picked,
      );
    }
  }

  String _formatDate(DateTime dt) {
    return '${dt.day.toString().padLeft(2, '0')}/${dt.month.toString().padLeft(2, '0')}/${dt.year}';
  }
}
