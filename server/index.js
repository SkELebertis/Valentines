require('dotenv').config()
const express = require('express')
const nodemailer = require('nodemailer')
const path = require('path')

const app = express()
const PORT = process.env.PORT || 3000

app.use(express.json())
app.use(express.static(path.join(__dirname,'..','src')))

app.post('/api/send', async (req,res)=>{
  const { answer, message } = req.body
  try{
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: process.env.SMTP_PORT == 465,
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
    })

    // Prefer TO_EMAIL; fallback to the provided address if not set
    const recipient = process.env.TO_EMAIL || 'salvadorralphrussel@gmail.com'

    // prepare attachments if featured image sent as data URI
    const attachments = []
    let htmlBody = `<p><strong>Answer:</strong> ${answer}</p><p><strong>Message:</strong> ${message || '(none)'}</p>`
    if(req.body.featured){
      const m = String(req.body.featured).match(/^data:(image\/\w+);base64,(.+)$/)
      if(m){
        const mime = m[1]
        const b64 = m[2]
        const ext = mime.split('/')[1]
        attachments.push({ filename: `featured.${ext}`, content: Buffer.from(b64, 'base64'), cid: 'featured@valentine' })
        htmlBody += `<p><strong>Featured Photo:</strong><br/><img src="cid:featured@valentine" style="max-width:300px;border-radius:8px"/></p>`
      }
    }

    const mailRes = await transporter.sendMail({
      from: process.env.SMTP_USER,
      to: recipient,
      subject: `Valentine Answer: ${answer}`,
      text: `Answer: ${answer}\nMessage: ${message || '(none)'}\nSent from Valentine Showoff`,
      html: htmlBody,
      attachments
    })

    res.json({ message: 'Answer sent! Thank you.', info: mailRes })
  }catch(err){
    console.error(err)
    res.status(500).json({ error: 'Failed to send email.' })
  }
})

app.listen(PORT, ()=>console.log(`Server listening on ${PORT}`))
