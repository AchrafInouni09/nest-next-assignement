export default async function handler(req, res) {
  const backend = process.env.BACKEND_URL || 'http://localhost:3001'
  try {
    const backendRes = await fetch(`${backend}/secret`, {
      method: 'GET',
      headers: {
        cookie: req.headers.cookie || '',
        accept: 'application/json',
      },
    })
    const text = await backendRes.text()
    res.status(backendRes.status)
    try {
      return res.json(JSON.parse(text))
    } catch (e) {
      return res.send(text)
    }
  } catch (err) {
    return res.status(502).json({ error: 'Bad gateway', details: String(err) })
  }
}
