import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_localizations/flutter_localizations.dart';
import 'package:firebase_messaging/firebase_messaging.dart';

import 'routes/app_router.dart';
import 'providers/theme_provider.dart';
import 'theme/app_theme.dart';
import 'l10n/app_localizations.dart';

class <%= project.capital %>App extends ConsumerStatefulWidget {
  const <%= project.capital %>App({super.key});

  @override
  ConsumerState<<%= project.capital %>App> createState() => _<%= project.capital %>AppState();
}

class _<%= project.capital %>AppState extends ConsumerState<<%= project.capital %>App> {
  @override
  void initState() {
    super.initState();
    _setupForegroundMessaging();
  }

  void _setupForegroundMessaging() {
    FirebaseMessaging.onMessage.listen((RemoteMessage message) {
      if (message.notification != null && mounted) {
        final messenger = ScaffoldMessenger.maybeOf(context);
        if (messenger != null) {
          messenger.showSnackBar(
            SnackBar(
              content: Text(
                message.notification!.title ?? 'Nova notificação',
              ),
              action: SnackBarAction(
                label: 'Ver',
                onPressed: () {},
              ),
            ),
          );
        }
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    final router = ref.watch(routerProvider);
    final themeMode = ref.watch(themeModeProvider);

    return MaterialApp.router(
      title: '<%= project.capital %>',
      debugShowCheckedModeBanner: false,
      theme: AppTheme.light(),
      darkTheme: AppTheme.dark(),
      themeMode: themeMode,
      routerConfig: router,
      localizationsDelegates: const [
        AppLocalizations.delegate,
        GlobalMaterialLocalizations.delegate,
        GlobalWidgetsLocalizations.delegate,
        GlobalCupertinoLocalizations.delegate,
      ],
      supportedLocales: const [
        Locale('pt', 'BR'),
        Locale('en'),
      ],
      locale: const Locale('pt', 'BR'),
    );
  }
}
