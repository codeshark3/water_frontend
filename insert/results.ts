import type { NextApiRequest, NextApiResponse } from 'next'
import { insertTest } from '~/server/test_queries'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'POST') {
    const data = req.body
    try {
      const newTest = await insertTest(data)
      if (!newTest) {
        res.status(400).json({ message: 'Invalid value' })
        return
      }
      res.status(201).json(newTest)
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: String(error) })
    }
  } else {
    res.setHeader('Allow', ['POST'])
    res.status(405).json({ message: `Method ${req.method} Not Allowed` })
  }
}
