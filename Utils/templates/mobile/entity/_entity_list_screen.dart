import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../l10n/app_localizations.dart';
import '../models/<%= name.lower %>_model.dart';
import '../providers/<%= name.lower %>_provider.dart';
import '../widgets/advanced_filter_widget.dart';
import '../widgets/export_buttons.dart';
import '../widgets/responsive_layout.dart';

class <%= name.capital %>ListScreen extends ConsumerStatefulWidget {
  const <%= name.capital %>ListScreen({super.key});

  @override
  ConsumerState<<%= name.capital %>ListScreen> createState() => _<%= name.capital %>ListScreenState();
}

class _<%= name.capital %>ListScreenState extends ConsumerState<<%= name.capital %>ListScreen> {
  final ScrollController _scrollController = ScrollController();
  <%= name.capital %>Model? _selectedItem;

  @override
  void initState() {
    super.initState();
    _scrollController.addListener(_onScroll);
    Future.microtask(() => ref.read(<%= name.lower %>ListProvider.notifier).loadItems(refresh: true));
  }

  @override
  void dispose() {
    _scrollController.dispose();
    super.dispose();
  }

  void _onScroll() {
    if (_scrollController.position.pixels >= _scrollController.position.maxScrollExtent - 200) {
      final state = ref.read(<%= name.lower %>ListProvider);
      if (!state.isLoading && state.hasMore) {
        ref.read(<%= name.lower %>ListProvider.notifier).loadItems();
      }
    }
  }

  List<FilterFieldDefinition> get _filterFields => [
<%_ (properties || []).filter(function(p) { return !p.isReadOnly && !/^id$/i.test(p.name); }).forEach(function(property) { _%>
<%_ if (/^(date|localdate|localdatetime)$/i.test(property.type)) { _%>
    const FilterFieldDefinition(
      key: '<%= property.name %>',
      label: '<%= property.name.charAt(0).toUpperCase() + property.name.slice(1) %>',
      type: FilterFieldType.dateRange,
    ),
<%_ } else if (/^(integer|int|long|double|float|bigdecimal|number|short)$/i.test(property.type)) { _%>
    const FilterFieldDefinition(
      key: '<%= property.name %>',
      label: '<%= property.name.charAt(0).toUpperCase() + property.name.slice(1) %>',
      type: FilterFieldType.numberRange,
    ),
<%_ } else if (/^boolean$/i.test(property.type)) { _%>
    const FilterFieldDefinition(
      key: '<%= property.name %>',
      label: '<%= property.name.charAt(0).toUpperCase() + property.name.slice(1) %>',
      type: FilterFieldType.boolean,
    ),
<%_ } else if (!property.isPrimitive) { _%>
    const FilterFieldDefinition(
      key: '<%= property.name %>',
      label: '<%= property.name.charAt(0).toUpperCase() + property.name.slice(1) %>',
      type: FilterFieldType.select,
    ),
<%_ } else { _%>
    const FilterFieldDefinition(
      key: '<%= property.name %>',
      label: '<%= property.name.charAt(0).toUpperCase() + property.name.slice(1) %>',
      type: FilterFieldType.text,
    ),
<%_ } _%>
<%_ }); _%>
  ];

  @override
  Widget build(BuildContext context) {
    final listState = ref.watch(<%= name.lower %>ListProvider);
    final l10n = AppLocalizations.of(context)!;

    return Scaffold(
      appBar: AppBar(
        title: Text(l10n.<%= name.lower %>Title),
        actions: [
          ExportButtons(
            entityPath: '<%= name.lower %>s',
            filters: listState.filters.isNotEmpty ? listState.filters : null,
          ),
        ],
      ),
      body: ResponsiveLayout(
        phoneLayout: _buildPhoneLayout(context, listState),
        tabletLayout: _buildTabletLayout(context, listState),
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: () => context.pushNamed('<%= name.lower %>-create'),
        child: const Icon(Icons.add),
      ),
    );
  }

  Widget _buildPhoneLayout(BuildContext context, <%= name.capital %>ListState listState) {
    return Column(
      children: [
        AdvancedFilterWidget(
          fields: _filterFields,
          onFilter: (filters) {
            ref.read(<%= name.lower %>ListProvider.notifier).applyFilters(filters);
          },
        ),
        Expanded(
          child: RefreshIndicator(
            onRefresh: () => ref.read(<%= name.lower %>ListProvider.notifier).refresh(),
            child: _buildListView(context, listState),
          ),
        ),
      ],
    );
  }

  Widget _buildTabletLayout(BuildContext context, <%= name.capital %>ListState listState) {
    return Row(
      children: [
        Expanded(
          flex: 2,
          child: Column(
            children: [
              AdvancedFilterWidget(
                fields: _filterFields,
                onFilter: (filters) {
                  ref.read(<%= name.lower %>ListProvider.notifier).applyFilters(filters);
                },
              ),
              Expanded(
                child: RefreshIndicator(
                  onRefresh: () => ref.read(<%= name.lower %>ListProvider.notifier).refresh(),
                  child: _buildListView(context, listState),
                ),
              ),
            ],
          ),
        ),
        if (_selectedItem != null)
          Expanded(
            flex: 3,
            child: _buildDetailPanel(context, _selectedItem!),
          ),
      ],
    );
  }

  Widget _buildListView(BuildContext context, <%= name.capital %>ListState listState) {
    if (listState.items.isEmpty && !listState.isLoading) {
      return ListView(
        children: [
          Center(
            child: Padding(
              padding: const EdgeInsets.all(32),
              child: Text(
                AppLocalizations.of(context)!.commonClear,
                style: Theme.of(context).textTheme.bodyLarge,
              ),
            ),
          ),
        ],
      );
    }

    return ListView.builder(
      controller: _scrollController,
      itemCount: listState.items.length + (listState.hasMore ? 1 : 0),
      itemBuilder: (context, index) {
        if (index >= listState.items.length) {
          return const Center(
            child: Padding(
              padding: EdgeInsets.all(16),
              child: CircularProgressIndicator(),
            ),
          );
        }

        final item = listState.items[index];
        return _buildListTile(context, item);
      },
    );
  }

  Widget _buildListTile(BuildContext context, <%= name.capital %>Model item) {
    final json = item.toJson();
    final subtitle = <String>[];
<%_ (properties || []).filter(function(p) { return !p.isReadOnly && !/^id$/i.test(p.name); }).slice(0, 2).forEach(function(property) { _%>
    if (json['<%= property.name %>'] != null) subtitle.add(json['<%= property.name %>'].toString());
<%_ }); _%>

    return ListTile(
      title: Text(
<%_ var titleProp = (properties || []).find(function(p) { return !p.isReadOnly && !/^id$/i.test(p.name); }); _%>
<%_ if (titleProp) { _%>
        json['<%= titleProp.name %>']?.toString() ?? '',
<%_ } else { _%>
        json['id']?.toString() ?? '',
<%_ } _%>
      ),
      subtitle: subtitle.isNotEmpty ? Text(subtitle.join(' · ')) : null,
      trailing: PopupMenuButton<String>(
        onSelected: (value) {
          if (value == 'edit') {
            context.pushNamed('<%= name.lower %>-edit', pathParameters: {'id': json['id'].toString()});
          } else if (value == 'delete') {
            _confirmDelete(context, json['id']);
          }
        },
        itemBuilder: (context) => [
          const PopupMenuItem(value: 'edit', child: Text('Edit')),
          const PopupMenuItem(value: 'delete', child: Text('Delete')),
        ],
      ),
      onTap: () {
        if (ResponsiveLayout.isTablet(context)) {
          setState(() => _selectedItem = item);
        } else {
          context.pushNamed('<%= name.lower %>-edit', pathParameters: {'id': json['id'].toString()});
        }
      },
    );
  }

  Widget _buildDetailPanel(BuildContext context, <%= name.capital %>Model item) {
    final json = item.toJson();
    final theme = Theme.of(context);

    return Card(
      margin: const EdgeInsets.all(8),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
<%_ if (titleProp) { _%>
                  json['<%= titleProp.name %>']?.toString() ?? '',
<%_ } else { _%>
                  json['id']?.toString() ?? '',
<%_ } _%>
                  style: theme.textTheme.headlineSmall,
                ),
                Row(
                  children: [
                    IconButton(
                      icon: const Icon(Icons.edit),
                      onPressed: () => context.pushNamed(
                        '<%= name.lower %>-edit',
                        pathParameters: {'id': json['id'].toString()},
                      ),
                    ),
                    IconButton(
                      icon: const Icon(Icons.delete),
                      onPressed: () => _confirmDelete(context, json['id']),
                    ),
                  ],
                ),
              ],
            ),
            const Divider(),
<%_ (properties || []).forEach(function(property) { _%>
            Padding(
              padding: const EdgeInsets.symmetric(vertical: 4),
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  SizedBox(
                    width: 120,
                    child: Text(
                      '<%= property.name.charAt(0).toUpperCase() + property.name.slice(1) %>',
                      style: theme.textTheme.bodySmall?.copyWith(
                        color: theme.colorScheme.onSurfaceVariant,
                      ),
                    ),
                  ),
                  Expanded(
                    child: Text(json['<%= property.name %>']?.toString() ?? '-'),
                  ),
                ],
              ),
            ),
<%_ }); _%>
          ],
        ),
      ),
    );
  }

  void _confirmDelete(BuildContext context, dynamic id) {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Confirm Delete'),
        content: const Text('Are you sure you want to delete this item?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: Text(AppLocalizations.of(context)!.commonCancel),
          ),
          TextButton(
            onPressed: () {
              Navigator.pop(ctx);
              ref.read(<%= name.lower %>ListProvider.notifier).deleteItem(id);
              if (_selectedItem != null) {
                setState(() => _selectedItem = null);
              }
            },
            child: const Text('Delete'),
          ),
        ],
      ),
    );
  }
}
