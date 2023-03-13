import { message, Modal } from 'antd'
import { useEffect, useState } from 'react'
import { verify } from '../../service/captcha'

function isServe() {
  return typeof window === 'undefined'
}

const googleVerify = (success?: () => void) => {
  if (!window.grecaptcha?.render) {
    success?.()
    return
  }

  window.grecaptcha.render('robot', {
    sitekey: process.env.NEXT_PUBLIC_RECAPTCHA_WEB_SECRET,
    callback: function (token: any) {
      verify(token)
        .then((res) => {
          success?.()
        })
        .catch((err) => {
          message.error('verification failed')
        })
    },
  })
}

export function CaptchaModal({
  open,
  onSuccess,
  onCancel,
}: {
  open: boolean
  onSuccess?: () => void
  onCancel?: () => void
}) {

  useEffect(() => {
    if (isServe() || !open) return
    googleVerify(() => {
      onSuccess?.()
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  return (
    <Modal open={open} footer={null} onCancel={onCancel}>
      <div className="w-full flex justify-center items-center">
        <div className="w-full flex justify-center items-center mt-[10px]" id="robot"></div>
      </div>
    </Modal>
  )
}
