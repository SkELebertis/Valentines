require('dotenv').config()
const express=require('express')
const nodemailer=require('nodemailer')
const path=require('path')

const app=express()
app.use(express.json())
app.use(express.static(path.join(__dirname,'..')))

app.post('/api/send', async (req,res)=>{
  try{
    const transporter=nodemailer.createTransport({
      host:process.env.SMTP_HOST,
      port:Number(process.env.SMTP_PORT),
      secure:false,
      auth:{
        user:process.env.SMTP_USER,
        pass:process.env.SMTP_PASS
      }
    })

    await transporter.sendMail({
      from:process.env.SMTP_USER,
      to:process.env.TO_EMAIL,
      subject:"YES 💘",
      text:"She clicked YES"
    })

    res.json({ok:true})
  }catch(e){
    console.error(e)
    res.status(500).json({error:true})
  }
})

app.listen(3000)
