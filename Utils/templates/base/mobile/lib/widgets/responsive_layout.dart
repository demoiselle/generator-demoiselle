import 'package:flutter/material.dart';

class ResponsiveLayout extends StatelessWidget {
  /// Widget displayed on phone-sized screens (< 600px width).
  final Widget phoneLayout;

  /// Widget displayed on tablet-sized screens (>= 600px width).
  final Widget tabletLayout;

  /// Breakpoint in logical pixels. Defaults to 600.
  final double breakpoint;

  const ResponsiveLayout({
    super.key,
    required this.phoneLayout,
    required this.tabletLayout,
    this.breakpoint = 600,
  });

  @override
  Widget build(BuildContext context) {
    return LayoutBuilder(
      builder: (context, constraints) {
        if (constraints.maxWidth >= breakpoint) {
          return tabletLayout;
        }
        return phoneLayout;
      },
    );
  }

  /// Helper to check if the current screen is tablet-sized.
  static bool isTablet(BuildContext context) {
    return MediaQuery.sizeOf(context).width >= 600;
  }
}
