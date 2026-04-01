import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../l10n/app_localizations.dart';
import '../models/<%= name.lower %>_model.dart';
import '../services/<%= name.lower %>_service.dart';

class <%= name.capital %>FormScreen extends ConsumerStatefulWidget {
  final String? id;

  const <%= name.capital %>FormScreen({super.key, this.id});

  @override
  ConsumerState<<%= name.capital %>FormScreen> createState() => _<%= name.capital %>FormScreenState();
}

class _<%= name.capital %>FormScreenState extends ConsumerState<<%= name.capital %>FormScreen> {
  final _formKey = GlobalKey<FormState>();
  bool _isLoading = false;
  bool _isEditing = false;

<%_ (properties || []).filter(function(p) { return !p.isReadOnly; }).forEach(function(property) { _%>
<%_ if (/^boolean$/i.test(property.type)) { _%>
  bool _<%= property.name %> = false;
<%_ } else if (/^(date|localdate|localdatetime)$/i.test(property.type)) { _%>
  DateTime? _<%= property.name %>;
<%_ } else { _%>
  final _<%= property.name %>Controller = TextEditingController();
<%_ } _%>
<%_ }); _%>

  @override
  void initState() {
    super.initState();
    if (widget.id != null) {
      _isEditing = true;
      _loadEntity();
    }
  }

  @override
  void dispose() {
<%_ (properties || []).filter(function(p) { return !p.isReadOnly && !/^boolean$/i.test(p.type) && !/^(date|localdate|localdatetime)$/i.test(p.type); }).forEach(function(property) { _%>
    _<%= property.name %>Controller.dispose();
<%_ }); _%>
    super.dispose();
  }

  Future<void> _loadEntity() async {
    setState(() => _isLoading = true);
    try {
      final service = ref.read(<%= name.lower %>ServiceProvider);
      final entity = await service.findById(widget.id);
      _populateFields(entity);
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(e.toString())),
        );
      }
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  void _populateFields(<%= name.capital %>Model entity) {
<%_ (properties || []).filter(function(p) { return !p.isReadOnly; }).forEach(function(property) { _%>
<%_ if (/^boolean$/i.test(property.type)) { _%>
    _<%= property.name %> = entity.<%= property.name %>;
<%_ } else if (/^(date|localdate|localdatetime)$/i.test(property.type)) { _%>
    _<%= property.name %> = entity.<%= property.name %>;
<%_ } else if (/^(integer|int|long|double|float|bigdecimal|number|short)$/i.test(property.type)) { _%>
    _<%= property.name %>Controller.text = entity.<%= property.name %>.toString();
<%_ } else { _%>
    _<%= property.name %>Controller.text = entity.<%= property.name %> ?? '';
<%_ } _%>
<%_ }); _%>
    setState(() {});
  }

  Future<void> _save() async {
    if (!_formKey.currentState!.validate()) return;

    setState(() => _isLoading = true);
    try {
      final service = ref.read(<%= name.lower %>ServiceProvider);
      final model = <%= name.capital %>Model(
<%_ (properties || []).filter(function(p) { return !p.isReadOnly; }).forEach(function(property) { _%>
<%_ if (/^boolean$/i.test(property.type)) { _%>
        <%= property.name %>: _<%= property.name %>,
<%_ } else if (/^(date|localdate|localdatetime)$/i.test(property.type)) { _%>
        <%= property.name %>: _<%= property.name %> ?? DateTime.now(),
<%_ } else if (/^(integer|int|long|short)$/i.test(property.type)) { _%>
        <%= property.name %>: int.tryParse(_<%= property.name %>Controller.text) ?? 0,
<%_ } else if (/^(double|float|bigdecimal|number)$/i.test(property.type)) { _%>
        <%= property.name %>: double.tryParse(_<%= property.name %>Controller.text) ?? 0.0,
<%_ } else { _%>
        <%= property.name %>: _<%= property.name %>Controller.text,
<%_ } _%>
<%_ }); _%>
      );

      if (_isEditing) {
        await service.update(widget.id, model);
      } else {
        await service.create(model);
      }

      if (mounted) context.pop();
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(e.toString())),
        );
      }
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;

    return Scaffold(
      appBar: AppBar(
        title: Text(_isEditing ? l10n.<%= name.lower %>Edit : l10n.<%= name.lower %>Create),
      ),
      body: _isLoading && _isEditing
          ? const Center(child: CircularProgressIndicator())
          : SingleChildScrollView(
              padding: const EdgeInsets.all(16),
              child: Form(
                key: _formKey,
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
<%_ (properties || []).filter(function(p) { return !p.isReadOnly; }).forEach(function(property) { _%>
<%_ var widgetType = flutterWidgetType(property); _%>
<%_ if (widgetType === 'email') { _%>
                    TextFormField(
                      controller: _<%= property.name %>Controller,
                      decoration: const InputDecoration(
                        labelText: '<%= property.name.charAt(0).toUpperCase() + property.name.slice(1) %>',
                        border: OutlineInputBorder(),
                      ),
                      keyboardType: TextInputType.emailAddress,
                      validator: (value) {
                        if (value == null || value.isEmpty) {
                          return l10n.validationRequired;
                        }
                        if (!value.contains('@')) {
                          return l10n.validationEmail;
                        }
                        return null;
                      },
                    ),
                    const SizedBox(height: 16),
<%_ } else if (widgetType === 'password') { _%>
                    TextFormField(
                      controller: _<%= property.name %>Controller,
                      decoration: const InputDecoration(
                        labelText: '<%= property.name.charAt(0).toUpperCase() + property.name.slice(1) %>',
                        border: OutlineInputBorder(),
                      ),
                      obscureText: true,
                      validator: (value) {
                        if (value == null || value.isEmpty) {
                          return l10n.validationRequired;
                        }
                        return null;
                      },
                    ),
                    const SizedBox(height: 16),
<%_ } else if (widgetType === 'datePicker') { _%>
                    InkWell(
                      onTap: () async {
                        final picked = await showDatePicker(
                          context: context,
                          initialDate: _<%= property.name %> ?? DateTime.now(),
                          firstDate: DateTime(2000),
                          lastDate: DateTime(2100),
                        );
                        if (picked != null) {
                          setState(() => _<%= property.name %> = picked);
                        }
                      },
                      child: InputDecorator(
                        decoration: const InputDecoration(
                          labelText: '<%= property.name.charAt(0).toUpperCase() + property.name.slice(1) %>',
                          border: OutlineInputBorder(),
                          suffixIcon: Icon(Icons.calendar_today),
                        ),
                        child: Text(
                          _<%= property.name %> != null
                              ? '${_<%= property.name %>!.day.toString().padLeft(2, '0')}/${_<%= property.name %>!.month.toString().padLeft(2, '0')}/${_<%= property.name %>!.year}'
                              : '',
                        ),
                      ),
                    ),
                    const SizedBox(height: 16),
<%_ } else if (widgetType === 'number') { _%>
                    TextFormField(
                      controller: _<%= property.name %>Controller,
                      decoration: const InputDecoration(
                        labelText: '<%= property.name.charAt(0).toUpperCase() + property.name.slice(1) %>',
                        border: OutlineInputBorder(),
                      ),
                      keyboardType: TextInputType.number,
                      validator: (value) {
                        if (value == null || value.isEmpty) {
                          return l10n.validationRequired;
                        }
                        return null;
                      },
                    ),
                    const SizedBox(height: 16),
<%_ } else if (widgetType === 'switch') { _%>
                    SwitchListTile(
                      title: const Text('<%= property.name.charAt(0).toUpperCase() + property.name.slice(1) %>'),
                      value: _<%= property.name %>,
                      onChanged: (value) => setState(() => _<%= property.name %> = value),
                      contentPadding: EdgeInsets.zero,
                    ),
                    const SizedBox(height: 16),
<%_ } else if (widgetType === 'dropdown') { _%>
                    DropdownButtonFormField<String>(
                      decoration: const InputDecoration(
                        labelText: '<%= property.name.charAt(0).toUpperCase() + property.name.slice(1) %>',
                        border: OutlineInputBorder(),
                      ),
                      value: _<%= property.name %>Controller.text.isNotEmpty ? _<%= property.name %>Controller.text : null,
                      items: const [],
                      onChanged: (value) {
                        _<%= property.name %>Controller.text = value ?? '';
                      },
                      validator: (value) {
                        if (value == null || value.isEmpty) {
                          return l10n.validationRequired;
                        }
                        return null;
                      },
                    ),
                    const SizedBox(height: 16),
<%_ } else { _%>
                    TextFormField(
                      controller: _<%= property.name %>Controller,
                      decoration: const InputDecoration(
                        labelText: '<%= property.name.charAt(0).toUpperCase() + property.name.slice(1) %>',
                        border: OutlineInputBorder(),
                      ),
                      validator: (value) {
                        if (value == null || value.isEmpty) {
                          return l10n.validationRequired;
                        }
                        return null;
                      },
                    ),
                    const SizedBox(height: 16),
<%_ } _%>
<%_ }); _%>
                    const SizedBox(height: 8),
                    FilledButton(
                      onPressed: _isLoading ? null : _save,
                      child: _isLoading
                          ? const SizedBox(
                              width: 20,
                              height: 20,
                              child: CircularProgressIndicator(strokeWidth: 2),
                            )
                          : Text(_isEditing
                              ? l10n.<%= name.lower %>Edit
                              : l10n.<%= name.lower %>Create),
                    ),
                  ],
                ),
              ),
            ),
    );
  }
}
