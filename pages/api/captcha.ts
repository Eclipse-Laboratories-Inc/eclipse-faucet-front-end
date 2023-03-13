import { NextApiResponse, NextApiRequest } from 'next'
import axios from 'axios'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { token } = req.body

    const { data } = await axios({
      url: 'https://www.google.com/recaptcha/api/siteverify',
      method: 'post',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      data: `secret=${process.env.NEXT_PUBLIC_RECAPTCHA_SECRET}&response=${token}`,
    })

    if (data && data.success) {
      res.status(200).json({ status: true })
    } else {
      res.status(200).json({ status: false })
    }
  } catch (err) {
    res.status(200).json({ status: false })
  }
}
