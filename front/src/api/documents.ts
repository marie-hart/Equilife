import apiClient from './client'
import type { Document, CreateDocumentDto } from '../types'

export const documentsApi = {
  getAll: async (horseId?: string) => {
    const response = await apiClient.get<Document[]>('/documents', {
      params: horseId ? { horseId } : undefined,
    })
    return response.data
  },
  create: async (data: CreateDocumentDto) => {
    const formData = new FormData()
    formData.append('horse_id', data.horse_id)
    formData.append('title', data.title)
    if (data.document_date) formData.append('document_date', data.document_date)
    if (data.tag) formData.append('tag', data.tag)
    if (data.note) formData.append('note', data.note)
    formData.append('file', data.file)

    const response = await apiClient.post<Document>('/documents', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return response.data
  },
  delete: async (id: string) => {
    await apiClient.delete(`/documents/${id}`)
  },
}
