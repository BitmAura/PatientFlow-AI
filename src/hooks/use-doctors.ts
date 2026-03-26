import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { CreateDoctorInput, DoctorAvailabilityInput } from '@/lib/validations/doctor';

export function useDoctors() {
  return useQuery({
    queryKey: ['doctors'],
    queryFn: async () => {
      const response = await fetch('/api/doctors');
      if (!response.ok) throw new Error('Failed to fetch doctors');
      return response.json();
    }
  });
}

export function useDoctor(id: string) {
  return useQuery({
    queryKey: ['doctor', id],
    queryFn: async () => {
      const response = await fetch(`/api/doctors/${id}`);
      if (!response.ok) throw new Error('Failed to fetch doctor');
      return response.json();
    },
    enabled: !!id
  });
}

export function useCreateDoctor() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateDoctorInput) => {
      const response = await fetch('/api/doctors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to create doctor');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['doctors'] });
    }
  });
}

export function useUpdateDoctor() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<CreateDoctorInput> }) => {
      const response = await fetch(`/api/doctors/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to update doctor');
      return response.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['doctors'] });
      queryClient.invalidateQueries({ queryKey: ['doctor', variables.id] });
    }
  });
}

export function useDeleteDoctor() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/doctors/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete doctor');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['doctors'] });
    }
  });
}

export function useDoctorAvailability(id: string) {
  return useQuery({
    queryKey: ['doctor-availability', id],
    queryFn: async () => {
      const response = await fetch(`/api/doctors/${id}/availability`);
      if (!response.ok) throw new Error('Failed to fetch availability');
      return response.json();
    },
    enabled: !!id
  });
}

export function useUpdateDoctorAvailability() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: DoctorAvailabilityInput }) => {
      const response = await fetch(`/api/doctors/${id}/availability`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to update availability');
      return response.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['doctor-availability', variables.id] });
    }
  });
}
