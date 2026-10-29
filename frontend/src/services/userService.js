import { request } from './api';

export function getUsers(role) {
  const query = role ? `?role=${encodeURIComponent(role)}` : '';
  return request(`/users${query}`);
}

export function getUserById(id) {
  return request(`/users/${id}`);
}

export function createUser(payload) {
  return request('/users', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function updateUser(id, payload) {
  return request(`/users/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
}

export function deleteUser(id) {
  return request(`/users/${id}`, {
    method: 'DELETE',
  });
}
