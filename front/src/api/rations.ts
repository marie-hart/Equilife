import apiClient from './client'
import type { Ration, CreateRationDto } from '../types'

export const rationsApi = {
  getAll: async (horseId?: string) => {
    const response = await apiClient.get<Ration[]>('/rations', {
      params: horseId ? { horseId } : undefined,
    })
    return response.data
  },
  getById: async (id: string) => {
    const response = await apiClient.get<Ration>(`/rations/${id}`)
    return response.data
  },
  create: async (data: CreateRationDto) => {
    const response = await apiClient.post<Ration>('/rations', data)
    return response.data
  },
  update: async (id: string, data: Partial<CreateRationDto>) => {
    const response = await apiClient.put<Ration>(`/rations/${id}`, data)
    return response.data
  },
  delete: async (id: string) => {
    await apiClient.delete(`/rations/${id}`)
  },
}
