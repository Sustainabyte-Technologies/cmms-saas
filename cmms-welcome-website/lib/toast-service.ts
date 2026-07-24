/**
 * Professional Sonner Toast Service
 * Centralized toast notifications for the entire application
 * Usage: import { toast } from 'sonner'
 */

import { toast } from 'sonner';

export const toastService = {
  /**
   * Success toast
   * @example toastService.success('User created successfully')
   */
  success: (message: string, description?: string) => {
    toast.success(message, {
      description,
      duration: 3000,
    });
  },

  /**
   * Error toast
   * @example toastService.error('Failed to create user', 'Please check the form')
   */
  error: (message: string, description?: string) => {
    toast.error(message, {
      description,
      duration: 4000,
    });
  },

  /**
   * Loading/Processing toast
   * @example const id = toastService.loading('Creating user...')
   * @returns Toast ID for dismissing later
   */
  loading: (message: string) => {
    return toast.loading(message, {
      duration: Infinity,
    });
  },

  /**
   * Dismiss a loading toast and show success
   * @example
   * const loadingId = toastService.loading('Processing...')
   * // ... do something
   * toastService.success('Done!', loadingId)
   */
  successWithId: (message: string, id: string | number, description?: string) => {
    toast.success(message, {
      id,
      description,
      duration: 3000,
    });
  },

  /**
   * Dismiss a loading toast and show error
   */
  errorWithId: (message: string, id: string | number, description?: string) => {
    toast.error(message, {
      id,
      description,
      duration: 4000,
    });
  },

  /**
   * Info/Neutral toast
   * @example toastService.info('Updated successfully')
   */
  info: (message: string, description?: string) => {
    toast.info(message, {
      description,
      duration: 3000,
    });
  },

  /**
   * Warning toast
   * @example toastService.warning('This action cannot be undone')
   */
  warning: (message: string, description?: string) => {
    toast.warning(message, {
      description,
      duration: 4000,
    });
  },

  /**
   * Promise-based toast (for async operations)
   * @example
   * toastService.promise(
   *   fetchUsers(),
   *   {
   *     loading: 'Loading users...',
   *     success: 'Users loaded!',
   *     error: 'Failed to load users',
   *   }
   * )
   */
  promise: <T,>(
    promise: Promise<T>,
    messages: {
      loading: string;
      success: string;
      error: string;
    }
  ) => {
    return toast.promise(promise, {
      loading: messages.loading,
      success: messages.success,
      error: messages.error,
    });
  },

  /**
   * Dismiss a specific toast by ID
   */
  dismiss: (id?: string | number) => {
    toast.dismiss(id);
  },

  /**
   * Dismiss all toasts
   */
  dismissAll: () => {
    toast.dismiss();
  },
};
