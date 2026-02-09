import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { adminApi } from '@/api/adminApi'
import type { CreateAdminRequest } from '@/types/api'

export function useAdmins() {
  return useQuery({
    queryKey: ['admins'],
    queryFn: () => adminApi.getAdmins(),
  })
}

export function useCreateAdmin() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateAdminRequest) => adminApi.createAdmin(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admins'] }),
  })
}

export function useActivateAdmin() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => adminApi.activateAdmin(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admins'] }),
  })
}

export function useDeactivateAdmin() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => adminApi.deactivateAdmin(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admins'] }),
  })
}
