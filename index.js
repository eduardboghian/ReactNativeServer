const express = require('express')
const bodyParser = require('body-parser')
const path = require('path')
const dotenv = require('dotenv')
const cors = require('cors')
const { Expo } = require('expo-server-sdk')
const googleSeet = require('./util')
const schedule = require('node-schedule')

const app = express()

// MIDDLEWAREt

const sendEmail = require('./routes/email')
const sendData = require('./routes/user-data')

app.use(express.json())
app.use(bodyParser.urlencoded({ extended: false }))
app.use(cors())
dotenv.config()
app.use('/api', sendEmail)
app.use('/api', sendData)

// ROUTES

async function sendNotifications() {
    let expo = new Expo()
    const sheet = (await googleSeet()).gsrun
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
              body: `${data[0]} ${data[1]}, please confirm that you are working today!`,
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

schedule.scheduleJob(' * 6 * * *', function() {
  sendNotifications()
})



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