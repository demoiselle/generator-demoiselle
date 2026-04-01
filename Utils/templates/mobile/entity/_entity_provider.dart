import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../models/<%= name.lower %>_model.dart';
import '../services/<%= name.lower %>_service.dart';

final <%= name.lower %>ListProvider =
    StateNotifierProvider<<%= name.capital %>ListNotifier, <%= name.capital %>ListState>((ref) {
  return <%= name.capital %>ListNotifier(ref.read(<%= name.lower %>ServiceProvider));
});

class <%= name.capital %>ListState {
  final List<<%= name.capital %>Model> items;
  final bool isLoading;
  final bool hasMore;
  final int currentPage;
  final String? error;
  final Map<String, dynamic> filters;

  const <%= name.capital %>ListState({
    this.items = const [],
    this.isLoading = false,
    this.hasMore = true,
    this.currentPage = 1,
    this.error,
    this.filters = const {},
  });

  <%= name.capital %>ListState copyWith({
    List<<%= name.capital %>Model>? items,
    bool? isLoading,
    bool? hasMore,
    int? currentPage,
    String? error,
    Map<String, dynamic>? filters,
  }) {
    return <%= name.capital %>ListState(
      items: items ?? this.items,
      isLoading: isLoading ?? this.isLoading,
      hasMore: hasMore ?? this.hasMore,
      currentPage: currentPage ?? this.currentPage,
      error: error,
      filters: filters ?? this.filters,
    );
  }
}

class <%= name.capital %>ListNotifier extends StateNotifier<<%= name.capital %>ListState> {
  final <%= name.capital %>Service _service;
  static const int _pageSize = 20;

  <%= name.capital %>ListNotifier(this._service) : super(const <%= name.capital %>ListState());

  Future<void> loadItems({bool refresh = false}) async {
    if (state.isLoading) return;

    final page = refresh ? 1 : state.currentPage;
    state = state.copyWith(isLoading: true, error: null);

    try {
      final items = await _service.findAll(
        page: page,
        size: _pageSize,
        filters: state.filters,
      );

      state = state.copyWith(
        items: refresh ? items : [...state.items, ...items],
        isLoading: false,
        hasMore: items.length >= _pageSize,
        currentPage: page + 1,
      );
    } catch (e) {
      state = state.copyWith(isLoading: false, error: e.toString());
    }
  }

  Future<void> refresh() async {
    await loadItems(refresh: true);
  }

  void applyFilters(Map<String, dynamic> filters) {
    state = state.copyWith(filters: filters, items: [], currentPage: 1, hasMore: true);
    loadItems();
  }

  Future<void> deleteItem(dynamic id) async {
    try {
      await _service.remove(id);
      state = state.copyWith(
        items: state.items.where((item) => item.toJson()['id'] != id).toList(),
      );
    } catch (e) {
      state = state.copyWith(error: e.toString());
    }
  }
}
