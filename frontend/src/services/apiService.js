import authAxios from './authService';

// Service API centralisé pour toutes les requêtes
export const apiService = {
  // Gestion des utilisateurs
  users: {
    getAll: (params) => authAxios.get('/users', { params }),
    getById: (id) => authAxios.get(`/users/${id}`),
    create: (userData) => authAxios.post('/users', userData),
    update: (id, userData) => authAxios.put(`/users/${id}`, userData),
    delete: (id) => authAxios.delete(`/users/${id}`),
    updateQualification: (id, qualification) => 
      authAxios.put(`/users/${id}/qualification`, { qualification }),
    resetPassword: (id) => authAxios.post(`/users/${id}/reset-password`),
    getStats: () => authAxios.get('/users/stats'),
    getAvailable: () => authAxios.get('/users/available'),
    getRetired: () => authAxios.get('/users/retired'),
    getNonIsoles: () => authAxios.get('/users/non-isoles'),
    getIsoles: () => authAxios.get('/users/isoles')
  },

  // Gestion des réseaux
  networks: {
    getAll: (params) => authAxios.get('/networks', { params }),
    getById: (id) => authAxios.get(`/networks/${id}`),
    create: (networkData) => authAxios.post('/networks', networkData),
    update: (id, networkData) => authAxios.put(`/networks/${id}`, networkData),
    delete: (id) => authAxios.delete(`/networks/${id}`),
    addMember: (id, memberId) => authAxios.post(`/networks/${id}/members`, { memberId }),
    removeMember: (id, memberId) => authAxios.delete(`/networks/${id}/members/${memberId}`),
    getStats: (id) => authAxios.get(`/networks/${id}/stats`),
    getGroups: (id) => authAxios.get(`/networks/${id}/grs`),
    getMembers: (id) => authAxios.get(`/networks/${id}/members`),
    getQualificationStats: () => authAxios.get('/networks/qualification-stats')
  },

  // Gestion des groupes
  groups: {
    getAll: (params) => authAxios.get('/groups', { params }),
    getById: (id) => authAxios.get(`/groups/${id}`),
    create: (groupData) => authAxios.post('/groups', groupData),
    update: (id, groupData) => authAxios.put(`/groups/${id}`, groupData),
    delete: (id) => authAxios.delete(`/groups/${id}`),
    addMember: (id, memberId) => authAxios.post(`/groups/${id}/members`, { memberId }),
    removeMember: (id, memberId) => authAxios.delete(`/groups/${id}/members/${memberId}`)
  },

  // Gestion des églises
  churches: {
    getAll: () => authAxios.get('/churches'),
    getById: (id) => authAxios.get(`/churches/${id}`),
    create: (churchData) => authAxios.post('/churches', churchData,{
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    }),
    update: (id, churchData) => authAxios.patch(`/churches/${id}`, churchData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    }),
    delete: (id) => authAxios.delete(`/churches/${id}`),
    getCityInfo: (cityName) => authAxios.get(`/churches/city-info/${encodeURIComponent(cityName)}`)
  },

  // Gestion des départements
  departments: {
    getAll: () => authAxios.get('/departments'),
    getById: (id) => authAxios.get(`/departments/${id}`),
    create: (departmentData) => authAxios.post('/departments', departmentData),
    update: (id, departmentData) => authAxios.put(`/departments/${id}`, departmentData),
    delete: (id) => authAxios.delete(`/departments/${id}`)
  },

  // Gestion des services/cultes
  services: {
    getAll: (params) => authAxios.get('/services', { params }),
    getById: (id) => authAxios.get(`/services/${id}`),
    create: (serviceData) => authAxios.post('/services', serviceData),
    update: (id, serviceData) => authAxios.put(`/services/${id}`, serviceData),
    delete: (id) => authAxios.delete(`/services/${id}`),
    getStats: () => authAxios.get('/services/stats')
  },

  // Gestion du carousel
  carousel: {
    getAll: () => authAxios.get('/carousel'),
    upload: (formData) => authAxios.post('/carousel', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    }),
    delete: (id) => authAxios.delete(`/carousel/${id}`)
  },

  // Statistiques générales
  stats: {
    getOverview: (params) => authAxios.get('/stats', { params }),
    getNetworks: () => authAxios.get('/networks/stats'),
    getMembers: () => authAxios.get('/users/stats'),
    getServices: () => authAxios.get('/services/stats'),
    getNetworksEvolution: () => authAxios.get('/stats/networks/evolution'),
    getNetworksComparison: (years) => authAxios.get(`/stats/networks/evolution/compare?years=${years}`)
  }
};

export default apiService; 