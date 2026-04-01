import 'dart:io';

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:file_picker/file_picker.dart';
import 'package:image_picker/image_picker.dart';

import '../l10n/app_localizations.dart';
import '../services/file_service.dart';

class FileUploadWidget extends ConsumerStatefulWidget {
  final void Function(Map<String, dynamic> metadata)? onUploadComplete;
  final List<String>? allowedExtensions;

  const FileUploadWidget({
    super.key,
    this.onUploadComplete,
    this.allowedExtensions,
  });

  @override
  ConsumerState<FileUploadWidget> createState() => _FileUploadWidgetState();
}

class _FileUploadWidgetState extends ConsumerState<FileUploadWidget> {
  File? _selectedFile;
  bool _isUploading = false;
  double _progress = 0;
  String? _error;

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    final theme = Theme.of(context);

    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          mainAxisSize: MainAxisSize.min,
          children: [
            if (_selectedFile == null) ...[
              _buildPickerButtons(l10n, theme),
            ] else ...[
              _buildFilePreview(theme, l10n),
              const SizedBox(height: 12),
              if (_isUploading) ...[
                LinearProgressIndicator(value: _progress),
                const SizedBox(height: 8),
                Text(
                  '${(_progress * 100).toStringAsFixed(0)}%',
                  textAlign: TextAlign.center,
                  style: theme.textTheme.bodySmall,
                ),
              ] else ...[
                _buildActionButtons(l10n, theme),
              ],
            ],
            if (_error != null) ...[
              const SizedBox(height: 8),
              Text(
                _error!,
                style: theme.textTheme.bodySmall?.copyWith(
                  color: theme.colorScheme.error,
                ),
              ),
            ],
          ],
        ),
      ),
    );
  }

  Widget _buildPickerButtons(AppLocalizations l10n, ThemeData theme) {
    return Column(
      children: [
        Icon(
          Icons.cloud_upload_outlined,
          size: 48,
          color: theme.colorScheme.onSurfaceVariant,
        ),
        const SizedBox(height: 12),
        Text(
          l10n.fileUploadSelectFile,
          style: theme.textTheme.bodyMedium?.copyWith(
            color: theme.colorScheme.onSurfaceVariant,
          ),
        ),
        const SizedBox(height: 16),
        Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            OutlinedButton.icon(
              onPressed: _pickFile,
              icon: const Icon(Icons.attach_file),
              label: Text(l10n.fileUploadFile),
            ),
            const SizedBox(width: 12),
            OutlinedButton.icon(
              onPressed: _pickImage,
              icon: const Icon(Icons.image_outlined),
              label: Text(l10n.fileUploadImage),
            ),
          ],
        ),
      ],
    );
  }

  Widget _buildFilePreview(ThemeData theme, AppLocalizations l10n) {
    final fileName = _selectedFile!.path.split(Platform.pathSeparator).last;
    final isImage = _isImageFile(fileName);

    return Row(
      children: [
        if (isImage)
          ClipRRect(
            borderRadius: BorderRadius.circular(8),
            child: Image.file(
              _selectedFile!,
              width: 56,
              height: 56,
              fit: BoxFit.cover,
            ),
          )
        else
          Container(
            width: 56,
            height: 56,
            decoration: BoxDecoration(
              color: theme.colorScheme.surfaceContainerHighest,
              borderRadius: BorderRadius.circular(8),
            ),
            child: Icon(
              Icons.insert_drive_file_outlined,
              color: theme.colorScheme.onSurfaceVariant,
            ),
          ),
        const SizedBox(width: 12),
        Expanded(
          child: Text(
            fileName,
            style: theme.textTheme.bodyMedium,
            overflow: TextOverflow.ellipsis,
          ),
        ),
      ],
    );
  }

  Widget _buildActionButtons(AppLocalizations l10n, ThemeData theme) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.end,
      children: [
        TextButton(
          onPressed: () => setState(() {
            _selectedFile = null;
            _error = null;
          }),
          child: Text(l10n.commonCancel),
        ),
        const SizedBox(width: 8),
        FilledButton.icon(
          onPressed: _upload,
          icon: const Icon(Icons.upload),
          label: Text(l10n.fileUploadUpload),
        ),
      ],
    );
  }

  Future<void> _pickFile() async {
    final result = await FilePicker.platform.pickFiles(
      type: widget.allowedExtensions != null
          ? FileType.custom
          : FileType.any,
      allowedExtensions: widget.allowedExtensions,
    );
    if (result != null && result.files.single.path != null) {
      setState(() {
        _selectedFile = File(result.files.single.path!);
        _error = null;
      });
    }
  }

  Future<void> _pickImage() async {
    final picker = ImagePicker();
    final image = await picker.pickImage(source: ImageSource.gallery);
    if (image != null) {
      setState(() {
        _selectedFile = File(image.path);
        _error = null;
      });
    }
  }

  Future<void> _upload() async {
    if (_selectedFile == null) return;

    setState(() {
      _isUploading = true;
      _progress = 0;
      _error = null;
    });

    try {
      final fileService = ref.read(fileServiceProvider);
      final metadata = await fileService.uploadFile(
        _selectedFile!,
        onProgress: (sent, total) {
          if (total > 0) {
            setState(() => _progress = sent / total);
          }
        },
      );

      setState(() {
        _isUploading = false;
        _selectedFile = null;
      });

      widget.onUploadComplete?.call(metadata);
    } catch (e) {
      setState(() {
        _isUploading = false;
        _error = e.toString();
      });
    }
  }

  bool _isImageFile(String name) {
    final ext = name.split('.').last.toLowerCase();
    return ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp'].contains(ext);
  }
}
