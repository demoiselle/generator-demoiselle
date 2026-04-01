import 'package:flutter/material.dart';

class AppColorSchemes {
  AppColorSchemes._();

  static const Color _seedColor = Color(0xFF1565C0);

  static final ColorScheme light = ColorScheme.fromSeed(
    seedColor: _seedColor,
    brightness: Brightness.light,
  );

  static final ColorScheme dark = ColorScheme.fromSeed(
    seedColor: _seedColor,
    brightness: Brightness.dark,
  );
}
