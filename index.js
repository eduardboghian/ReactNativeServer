const express = require('express')
const bodyParser = require('body-parser')
const dotenv = require('dotenv')
const cors = require('cors')
const { Expo } = require('expo-server-sdk')
const googleSheet = require('./util')
const schedule = require('node-schedule')

const app = express()

// MIDDLEWAREt

const sendEmail = require('./routes/email')
const sendData = require('./routes/user-data')
const sendCode = require('./routes/user-code')
const openHours = require('./routes/open-hours')

app.use(express.json())
app.use(bodyParser.urlencoded({ extended: false }))
app.use(cors())
dotenv.config()
app.use('/api', sendEmail) 
app.use('/api', sendData)
app.use('/api', sendCode)
app.use('/api', openHours)

// ROUTES

async function sendNotifications() {
    console.log('send notifications called...')
    let expo = new Expo()
    const sheet = (await googleSheet()).gsrun
    let messages = []
    
    sheet.map(data => {
        if(data[10] !== undefined) {
            if (!Expo.isExpoPushToken(data[10])) {
              console.log(`Push token ${data[10]} is not a valid Expo push token`);
            }
            messages.push({
              to: data[10],
              sound: 'default',
              title: 'WorkRULES',
              body: `${data[0]} ${data[1]}, please confirm that you are working today!!!`,
              data: { withSome: 'data' },
            })
        }
    })

    let chunks = expo.chunkPushNotifications(messages);
    let tickets = [];

        
    for (let chunk of chunks) {
        try {
          let ticketChunk = await expo.sendPushNotificationsAsync(chunk);
          console.log(ticketChunk);
          tickets.push(...ticketChunk)
        } catch (error) {
          console.error(error);
        }
    }

}

let min
let hour

(async function(){
  const data = await googleSheet()
  let hr = data.gsrun[0]
  console.log('hrs: ',hr[9], hr[10])

  if(hr[9].slice(-2)==='00'){ 
      min = 0
      if(hr[9].charAt(1)==='.') {
        hour = hr[9].charAt(0)
      }else {
        hour = hr[9].slice(0, 2)
      }

  }else if(hr[9].charAt( hr[9].length - 2 ) === '0') {
      min = hr[9].slice(-1)
      if(hr[9].charAt(1)==='.') {
        hour = hr[9].charAt(0)
      }else {
        hour = hr[9].slice(0, 2)
      }
  }else {
      min = hr[9].slice(-2)
      if(hr[9].charAt(1)==='.') {
        hour = hr[9].charAt(0)
      }else {
        hour = hr[9].slice(0, 2)
      }
  }

  let test = new Date().getHours() +":"+new Date().getMinutes()
  min = parseInt(min)
  hour = parseInt(hour)
  console.log( hour, min, test)

  schedule.scheduleJob(` ${min} ${hour} * * *`, function() {
    sendNotifications() 
  })
})()





// // BUILD THE CLIENT SIDE 

// if (process.env.NODE_ENV === "production") {
//     app.use(express.static('client/build'))
//     app.get("*", (req, res) => {
//       res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'));
//     })
// }

// PORT

const PORT = process.env.PORT || 3001
app.listen(PORT)