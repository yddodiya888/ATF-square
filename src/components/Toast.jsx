import React from 'react'
import { toast } from 'react-toastify'

export function Toast(msg) {
  return toast(msg, {
    position: 'bottom-right',
    autoClose: 3000,
    hideProgressBar: true,
    closeOnClick: true,
    rtl: false,
    pauseOnFocusLoss: false,
    draggable: false,
    pauseOnHover: false,
    style: {
      background: '#000',
      color: '#fff',
      fontSize: '14px',
      width: 'auto',
      maxWidth: '98vw',
      wordBreak: 'break-word',
      opacity : '9999999'
    }
  })
}

// export default Toast
