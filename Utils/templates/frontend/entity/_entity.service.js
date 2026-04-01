import { useApi } from '@/composables/useApi';

const BASE_URL = '/api/v1/<%= name.lower %>s';

export function use<%= name.capital %>Service() {
  const api = useApi();

  async function findAll(params = {}) {
    const response = await api.get(BASE_URL, { params });
    return response;
  }

  async function findById(id) {
    const response = await api.get(`${BASE_URL}/${id}`);
    return response.data;
  }

  async function create(data) {
    const response = await api.post(BASE_URL, data);
    return response.data;
  }

  async function update(data) {
    const response = await api.put(`${BASE_URL}/${data.id}`, data);
    return response.data;
  }

  async function remove(id) {
    const response = await api.delete(`${BASE_URL}/${id}`);
    return response.data;
  }

  return {
    findAll,
    findById,
    create,
    update,
    remove
  };
}
