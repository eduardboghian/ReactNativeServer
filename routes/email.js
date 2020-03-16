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
        response = 'WORKING'
    }else {
        response = 'NOT WORKING'
    }


    if(emailsList[datas.email]!==undefined) {
        emailsList['ids'].push(datas.id)
        emailsList[datas.email].push(`${datas.name} - ${datas.address} - ${response}`)

        let data = JSON.stringify(emailsList, null, 2)
        fs.writeFileSync('emails.json', data)
    }else {
        emailsList['ids'].push(datas.id)
        emailsList[datas.email] = []
        emailsList[datas.email].push(`${datas.name} - ${datas.address} - ${response}`) 

        let data = JSON.stringify(emailsList, null, 2)
        fs.writeFileSync('emails.json', data)
    }

    res.send('email sent...')
})

async function sendEmails(googleSheet) {
    console.log('attetmp to send the emails...')
    // HERE GOES THE MAP THROUGH THE JSON FILE
    let mapList = await emails

    async function addNotRespond() {
        return await Promise.all(googleSheet.map(async data => {
            let res = await mapList['ids'].find(el => el === data[9])
            let email = await data[6]
            if(res === undefined) {
                console.log('passed the test',res)
                if(mapList[email]!==undefined) {
                    mapList['ids'].push(data[9])
                    mapList[email].push(`${data[0]} ${data[1]} - ${data[3]} ${data[4]} ${data[5]} - NOT KNOWN`)
            
                    let dataObj = JSON.stringify(mapList, null, 2)
                    fs.writeFileSync('emails.json', dataObj)
                }else {
                    mapList['ids'].push(data[9])
                    mapList[email] = []
                    mapList[email].push(`${data[0]} ${data[1]} - ${data[3]} ${data[4]} ${data[5]} - NOT KNOWN`) 
            
                    let dataObj = JSON.stringify(mapList, null, 2)
                    fs.writeFileSync('emails.json', dataObj)
                }
            
            }
        }))
    }    
    await addNotRespond()
    console.log('versiunea finala a ls',mapList)

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
            to: `${email}, office@workrules.com, johnnycodepro@gmail.com`, 
            subject: ` WorkRules Ltd - Worker Status ${new Date().toDateString()}`,
            text: res
        })
    
        console.log("Message sent: %s", info.messageId)
    }

    console.log(mapList)

    //CLEAR JSON FILE 
    const clearJson = {
        "ids": []
    }
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
    console.log('emails.json: ',await emails)

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
    
    min = parseInt(min)
    hour = parseInt(hour)
    console.log('send email hour...', hour, min)
    schedule.scheduleJob(`${min} ${hour} * * *`, function() {
        sendEmails(data.gsrun) 
    })
  })()

module.exports = router