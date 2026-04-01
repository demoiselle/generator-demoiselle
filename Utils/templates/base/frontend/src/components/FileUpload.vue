<template>
  <div class="file-upload">
    <div
      class="drop-zone"
      :class="{ dragging: isDragging, 'has-file': previewUrl }"
      @dragover.prevent="isDragging = true"
      @dragleave.prevent="isDragging = false"
      @drop.prevent="onDrop"
      @click="openFilePicker"
    >
      <input
        ref="fileInput"
        type="file"
        :accept="accept"
        class="file-input"
        @change="onFileSelected"
      />
      <div v-if="previewUrl && isImage" class="preview">
        <img :src="previewUrl" :alt="$t('upload.preview')" class="preview-img" />
      </div>
      <div v-else-if="selectedFile" class="file-info">
        <span class="file-icon">📄</span>
        <span class="file-name">{{ selectedFile.name }}</span>
        <span class="file-size">{{ formatSize(selectedFile.size) }}</span>
      </div>
      <div v-else class="placeholder">
        <span class="upload-icon">📁</span>
        <span class="upload-text">{{ $t('upload.dragOrClick') }}</span>
        <span class="upload-hint">{{ $t('upload.hint') }}</span>
      </div>
    </div>
    <div v-if="selectedFile" class="actions">
      <button class="btn btn-primary" @click="upload" :disabled="uploading">
        {{ uploading ? $t('upload.uploading') : $t('upload.send') }}
      </button>
      <button class="btn btn-secondary" @click="clear" :disabled="uploading">
        {{ $t('upload.clear') }}
      </button>
    </div>
    <div v-if="uploading" class="progress-bar">
      <div class="progress-fill" :style="{ width: progress + '%' }"></div>
    </div>
    <div v-if="error" class="error-msg">{{ error }}</div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useApi } from '@/composables/useApi';
import { useI18n } from 'vue-i18n';

const props = defineProps({
  accept: { type: String, default: '*/*' },
  maxSize: { type: Number, default: 10 * 1024 * 1024 }
});

const emit = defineEmits(['uploaded', 'error']);

const { t } = useI18n();
const api = useApi();

const fileInput = ref(null);
const selectedFile = ref(null);
const previewUrl = ref(null);
const isDragging = ref(false);
const uploading = ref(false);
const progress = ref(0);
const error = ref(null);

const isImage = computed(() =>
  selectedFile.value?.type?.startsWith('image/')
);

function openFilePicker() {
  fileInput.value?.click();
}

function onFileSelected(e) {
  const file = e.target.files?.[0];
  if (file) handleFile(file);
}

function onDrop(e) {
  isDragging.value = false;
  const file = e.dataTransfer.files?.[0];
  if (file) handleFile(file);
}

function handleFile(file) {
  error.value = null;
  if (file.size > props.maxSize) {
    error.value = t('upload.tooLarge');
    return;
  }
  selectedFile.value = file;
  if (file.type.startsWith('image/')) {
    const reader = new FileReader();
    reader.onload = (e) => { previewUrl.value = e.target.result; };
    reader.readAsDataURL(file);
  } else {
    previewUrl.value = null;
  }
}

async function upload() {
  if (!selectedFile.value) return;
  uploading.value = true;
  progress.value = 0;
  error.value = null;
  try {
    const formData = new FormData();
    formData.append('file', selectedFile.value);
    const response = await api.post('/api/files/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (e) => {
        if (e.total) progress.value = Math.round((e.loaded / e.total) * 100);
      }
    });
    emit('uploaded', response.data);
    clear();
  } catch (err) {
    const msg = err.response?.data?.message || t('upload.error');
    error.value = msg;
    emit('error', msg);
  } finally {
    uploading.value = false;
  }
}

function clear() {
  selectedFile.value = null;
  previewUrl.value = null;
  progress.value = 0;
  error.value = null;
  if (fileInput.value) fileInput.value.value = '';
}

function formatSize(bytes) {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}
</script>

<style scoped>
.file-upload {
  width: 100%;
}

.drop-zone {
  border: 2px dashed var(--border-color);
  border-radius: 8px;
  padding: 32px;
  text-align: center;
  cursor: pointer;
  transition: border-color 0.15s, background-color 0.15s;
  background-color: var(--bg-secondary);
}

.drop-zone:hover,
.drop-zone.dragging {
  border-color: var(--color-primary);
  background-color: var(--bg-card);
}

.file-input {
  display: none;
}

.placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.upload-icon {
  font-size: 2rem;
}

.upload-text {
  font-size: 0.9rem;
  color: var(--text-primary);
}

.upload-hint {
  font-size: 0.8rem;
  color: var(--text-secondary);
}

.preview-img {
  max-width: 200px;
  max-height: 200px;
  border-radius: 6px;
  object-fit: contain;
}

.file-info {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.file-icon {
  font-size: 2rem;
}

.file-name {
  font-size: 0.9rem;
  color: var(--text-primary);
  word-break: break-all;
}

.file-size {
  font-size: 0.8rem;
  color: var(--text-secondary);
}

.actions {
  display: flex;
  gap: 8px;
  margin-top: 12px;
}

.btn {
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  font-size: 0.85rem;
  font-weight: 500;
}

.btn-primary {
  background-color: var(--color-primary);
  color: #fff;
}

.btn-primary:hover:not(:disabled) {
  background-color: var(--color-primary-hover);
}

.btn-primary:disabled {
  opacity: 0.6;
}

.btn-secondary {
  background-color: var(--bg-secondary);
  color: var(--text-primary);
  border: 1px solid var(--border-color);
}

.progress-bar {
  margin-top: 8px;
  height: 4px;
  background-color: var(--bg-secondary);
  border-radius: 2px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background-color: var(--color-primary);
  transition: width 0.2s;
}

.error-msg {
  margin-top: 8px;
  font-size: 0.85rem;
  color: #ef4444;
}
</style>
