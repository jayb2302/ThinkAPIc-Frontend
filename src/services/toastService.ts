import { useToast } from 'primevue/usetoast';

export const useAppToast = () => {
  const toast = useToast();

  return {
    success: (detail: string, summary = 'Success') => {
      toast.add({ severity: 'success', summary, detail, life: 3000 });
    },
    error: (detail: string, summary = 'Error') => {
      toast.add({ severity: 'error', summary, detail, life: 3000 });
    },
    warn: (detail: string, summary = 'Warning') => {
      toast.add({ severity: 'warn', summary, detail, life: 3000 });
    },
    info: (detail: string, summary = 'Info') => {
      toast.add({ severity: 'info', summary, detail, life: 3000 });
    },
  };
};