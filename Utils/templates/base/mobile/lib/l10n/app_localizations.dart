import 'package:flutter/material.dart';

/// Placeholder for Flutter gen_l10n generated localizations.
///
/// In a real Flutter project, run `flutter gen-l10n` to generate this class
/// from the ARB files. This stub provides the API contract that screens import.
class AppLocalizations {
  final Locale locale;

  AppLocalizations(this.locale);

  static AppLocalizations? of(BuildContext context) {
    return Localizations.of<AppLocalizations>(context, AppLocalizations);
  }

  static const LocalizationsDelegate<AppLocalizations> delegate =
      _AppLocalizationsDelegate();

  static const List<Locale> supportedLocales = [
    Locale('pt', 'BR'),
    Locale('en'),
  ];

  bool get _isPt => locale.languageCode == 'pt';

  // Login
  String get loginTitle => _isPt ? 'Entrar' : 'Sign In';
  String get loginEmail => 'Email';
  String get loginPassword => _isPt ? 'Senha' : 'Password';
  String get loginSubmit => _isPt ? 'Entrar' : 'Sign In';
  String get loginForgotPassword =>
      _isPt ? 'Esqueci minha senha' : 'Forgot password';
  String get loginRegister => _isPt ? 'Criar conta' : 'Create account';

  // Register
  String get registerTitle => _isPt ? 'Criar Conta' : 'Create Account';
  String get registerName => _isPt ? 'Nome' : 'Name';
  String get registerEmail => 'Email';
  String get registerPassword => _isPt ? 'Senha' : 'Password';
  String get registerConfirmPassword =>
      _isPt ? 'Confirmar Senha' : 'Confirm Password';
  String get registerSubmit => _isPt ? 'Registrar' : 'Register';
  String get registerAlreadyHaveAccount =>
      _isPt ? 'Já tem uma conta? Entrar' : 'Already have an account? Sign in';
  String get registerSuccess =>
      _isPt ? 'Conta criada com sucesso!' : 'Account created successfully!';
  String get registerConfirmEmail => _isPt
      ? 'Verifique seu email para confirmar o cadastro.'
      : 'Check your email to confirm your registration.';
  String get registerGoToLogin => _isPt ? 'Ir para Login' : 'Go to Login';

  // Forgot Password
  String get forgotPasswordTitle =>
      _isPt ? 'Esqueci Minha Senha' : 'Forgot Password';
  String get forgotPasswordDescription => _isPt
      ? 'Informe seu email para receber um link de redefinição de senha.'
      : 'Enter your email to receive a password reset link.';
  String get forgotPasswordEmail => 'Email';
  String get forgotPasswordSubmit => _isPt ? 'Enviar' : 'Send';
  String get forgotPasswordBackToLogin =>
      _isPt ? 'Voltar para Login' : 'Back to Login';
  String get forgotPasswordSuccess =>
      _isPt ? 'Email enviado!' : 'Email sent!';
  String get forgotPasswordCheckEmail => _isPt
      ? 'Verifique sua caixa de entrada para redefinir sua senha.'
      : 'Check your inbox to reset your password.';

  // Reset Password
  String get resetPasswordTitle =>
      _isPt ? 'Redefinir Senha' : 'Reset Password';
  String get resetPasswordToken =>
      _isPt ? 'Código de verificação' : 'Verification code';
  String get resetPasswordNewPassword =>
      _isPt ? 'Nova Senha' : 'New Password';
  String get resetPasswordConfirmPassword =>
      _isPt ? 'Confirmar Nova Senha' : 'Confirm New Password';
  String get resetPasswordSubmit =>
      _isPt ? 'Redefinir Senha' : 'Reset Password';
  String get resetPasswordSuccess =>
      _isPt ? 'Senha redefinida com sucesso!' : 'Password reset successfully!';
  String get resetPasswordGoToLogin =>
      _isPt ? 'Ir para Login' : 'Go to Login';

  // Dashboard
  String get dashboardTitle => 'Dashboard';
  String get dashboardError => _isPt
      ? 'Erro ao carregar estatísticas.'
      : 'Failed to load statistics.';

  // Audit
  String get auditTitle => _isPt ? 'Auditoria' : 'Audit';
  String get auditAccessDenied => _isPt
      ? 'Acesso restrito a administradores.'
      : 'Access restricted to administrators.';
  String get auditEmpty => _isPt
      ? 'Nenhum registro de auditoria encontrado.'
      : 'No audit records found.';
  String get auditFilters => _isPt ? 'Filtros' : 'Filters';
  String get auditFilterEntity => _isPt ? 'Entidade' : 'Entity';
  String get auditFilterUser => _isPt ? 'Usuário' : 'User';
  String get auditApplyFilters => _isPt ? 'Aplicar' : 'Apply';
  String get auditChangesTitle => _isPt ? 'Alterações' : 'Changes';

  // Notifications
  String get notificationsTitle => _isPt ? 'Notificações' : 'Notifications';
  String get notificationsEmpty =>
      _isPt ? 'Nenhuma notificação.' : 'No notifications.';

  // Settings
  String get settingsTitle => _isPt ? 'Configurações' : 'Settings';
  String get settingsAppearance => _isPt ? 'Aparência' : 'Appearance';
  String get settingsTheme => _isPt ? 'Tema' : 'Theme';
  String get settingsThemeLight => _isPt ? 'Claro' : 'Light';
  String get settingsThemeDark => _isPt ? 'Escuro' : 'Dark';
  String get settingsThemeSystem => _isPt ? 'Sistema' : 'System';
  String get settingsLanguage => _isPt ? 'Idioma' : 'Language';
  String get settingsLanguageSelect =>
      _isPt ? 'Selecionar idioma' : 'Select language';
  String get settingsAccount => _isPt ? 'Conta' : 'Account';
  String get settingsLogout => _isPt ? 'Sair' : 'Sign Out';
  String get settingsLogoutConfirmTitle =>
      _isPt ? 'Sair da conta' : 'Sign out';
  String get settingsLogoutConfirmMessage =>
      _isPt ? 'Tem certeza que deseja sair?' : 'Are you sure you want to sign out?';

  // Common
  String get commonCancel => _isPt ? 'Cancelar' : 'Cancel';
  String get commonRetry => _isPt ? 'Tentar novamente' : 'Retry';
  String get commonClear => _isPt ? 'Limpar' : 'Clear';
  String get commonClose => _isPt ? 'Fechar' : 'Close';

  // Validation
  String get validationRequired => _isPt ? 'Campo obrigatório' : 'Required field';
  String get validationEmail => _isPt ? 'Email inválido' : 'Invalid email';
  String get validationMinLength =>
      _isPt ? 'Mínimo de 6 caracteres' : 'Minimum 6 characters';
  String get validationPasswordMatch =>
      _isPt ? 'As senhas não coincidem' : 'Passwords do not match';

  // Filter
  String get filterTitle => _isPt ? 'Filtros' : 'Filters';
  String get filterClear => _isPt ? 'Limpar' : 'Clear';
  String get filterApply => _isPt ? 'Aplicar' : 'Apply';

  // Export
  String get exportCsv => _isPt ? 'Exportar CSV' : 'Export CSV';
  String get exportPdf => _isPt ? 'Exportar PDF' : 'Export PDF';

  // File Upload
  String get fileUploadSelectFile =>
      _isPt ? 'Selecione um arquivo para enviar' : 'Select a file to upload';
  String get fileUploadFile => _isPt ? 'Arquivo' : 'File';
  String get fileUploadImage => _isPt ? 'Imagem' : 'Image';
  String get fileUploadUpload => _isPt ? 'Enviar' : 'Upload';
}

class _AppLocalizationsDelegate
    extends LocalizationsDelegate<AppLocalizations> {
  const _AppLocalizationsDelegate();

  @override
  bool isSupported(Locale locale) {
    return ['pt', 'en'].contains(locale.languageCode);
  }

  @override
  Future<AppLocalizations> load(Locale locale) async {
    return AppLocalizations(locale);
  }

  @override
  bool shouldReload(_AppLocalizationsDelegate old) => false;
}
