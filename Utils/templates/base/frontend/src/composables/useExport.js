import { useApi } from '@/composables/useApi';

export function useExport() {
  const api = useApi();

  async function downloadCsv(entityPath, filters) {
    const response = await api.get(`/api/v1/${entityPath}/export`, {
      params: filters,
      responseType: 'blob'
    });
    triggerDownload(response.data, `${entityPath}.csv`, 'text/csv');
  }

  async function downloadPdf(entityPath, filters) {
    const response = await api.get(`/api/v1/${entityPath}/export/pdf`, {
      params: filters,
      responseType: 'blob'
    });
    triggerDownload(response.data, `${entityPath}.pdf`, 'application/pdf');
  }

  function triggerDownload(data, filename, mimeType) {
    const blob = new Blob([data], { type: mimeType });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }

  return {
    downloadCsv,
    downloadPdf
  };
}
