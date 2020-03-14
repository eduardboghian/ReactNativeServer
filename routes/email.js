const router = require('express').Router()
const nodemailer = require('nodemailer')
const schedule = require('node-schedule')
const fs = require('fs')
const googleSheet = require('../util')

let emails

router.post('/send-email', async (req, res)=> {
    datas = req.body
    console.log(req.body)
    let emailsList = await emails
    let response

    if(datas.response === 'yes') {
        response = 'Yes, I am going to work today!'
    }else {
        response = 'No, I am not going to work today!'
    }


    if(emailsList[datas.email]!==undefined) {
        emailsList[datas.email].push(`${datas.name} - ${response}`)

        let data = JSON.stringify(emailsList, null, 2)
        fs.writeFileSync('emails.json', data)
    }else {
        emailsList[datas.email] = []
        emailsList[datas.email].push(`${datas.name} - ${response}`) 

        let data = JSON.stringify(emailsList, null, 2)
        fs.writeFileSync('emails.json', data)
    }

    res.send('email sent...')
})

async function sendEmails() {
    // HERE GOES THE MAP THROUGH THE JSON FILE
    let mapList = await emails

    if(Object.keys(mapList).length === 0) {
        return
    }
    let transporter = nodemailer.createTransport({
        service: 'gmail',
        secure: false,
        auth: {
            user: 'eduardradu1990@gmail.com',
            pass: 'bughibad4404pdf'
        },
        tls: {
            rejectUnauthorized: false
        }
    });

    for( let email in mapList) {
        let res = ''
        await Promise.all(mapList[email].map(data => {
            res = res+' '+data+'\n'
            return res
        }))
        console.log(res)

        let info = await transporter.sendMail({
            from: '"WorkRULES"<eduardradu1990@gmail.com>',
            to: email, 
            subject: `WorkRULES worker status!`,
            text: res
        })
    
        console.log("Message sent: %s", info.messageId)
    }

    console.log(mapList)

    // CLEAR JSON FILE 
    const clearJson = {}
    const passEmpty = JSON.stringify(clearJson, null, 2)
    fs.writeFileSync('emails.json', passEmpty)
}

(async function(){
    emails = new Promise((resolve, reject)=>{
        fs.readFile('emails.json', (err, data) => {
            if (err) {
                reject(err)
            }else {
                let emails = JSON.parse(data);
                resolve(emails)
            }
        })
    })

    const data = await googleSheet()
    let hr = data.gsrun[0]
  
    if(hr[10].slice(-2)==='00'){
        min = 0
        if(hr[10].charAt(1)==='.') {
          hour = hr[10].charAt(0)
        }else {
          hour = hr[10].slice(0, 2)
        }
  
    }else if(hr[10].charAt( hr[10].length - 2 ) === '0') {
        min = hr[10].slice(-1)
        if(hr[10].charAt(1)==='.') {
          hour = hr[10].charAt(0)
        }else {
          hour = hr[10].slice(0, 2)
        }
    }else {
        min = hr[10].slice(-2)
        if(hr[10].charAt(1)==='.') {
          hour = hr[10].charAt(0)
        }else {
          hour = hr[10].slice(0, 2)
        }
    }
  
    schedule.scheduleJob(`${min} ${hour} * * *`, function() {
      sendEmails() 
    })
  })()

module.exports = router