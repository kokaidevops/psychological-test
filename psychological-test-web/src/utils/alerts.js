import Swal from 'sweetalert2'

const themeConfig = {
  background: '#FFFFFF',
  color: '#1A1816',
  confirmButtonColor: '#1A1816',
  cancelButtonColor: '#E5DDD0',
  customClass: {
    popup: 'rounded-2xl border border-border shadow-xl font-sans',
    title: 'font-display text-2xl font-medium text-fg tracking-tight',
    htmlContainer: 'text-muted text-sm leading-relaxed',
    confirmButton: 'rounded-full px-6 py-2 text-sm font-medium text-bg hover:!bg-accent transition-colors',
    cancelButton: 'rounded-full px-6 py-2 text-sm font-medium text-fg hover:!bg-subtle transition-colors ml-2'
  },
  buttonsStyling: true
}

export const showSuccess = (title, text = '') => {
  return Swal.fire({
    ...themeConfig,
    icon: 'success',
    iconColor: '#2F4A3A',
    title,
    text
  })
}

export const showError = (title, text = '') => {
  return Swal.fire({
    ...themeConfig,
    icon: 'error',
    iconColor: '#B85042',
    title,
    text
  })
}

export const showLoading = (title = 'Memproses...') => {
  return Swal.fire({
    ...themeConfig,
    title,
    allowOutsideClick: false,
    didOpen: () => {
      Swal.showLoading()
    }
  })
}

export const closeAlert = () => {
  Swal.close()
}