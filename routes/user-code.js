const router = require('express').Router()
const { v4: uuidv4 } = require('uuid')
const getData = require('../util')
const {google} = require('googleapis')

router.post('/send-code', async (req, res)=> {
    // GENERATE THE ID
    const userId = uuidv4()
    // CHECK THE CODE
    let data = await getData()
    let client = data.client
    const gsapi = google.sheets({
        version: 'v4',
        auth: client
    })

    data.gsrun.map(async (data, index)=> {
        if(parseInt(data[7]) === parseInt( req.body.code)) {
            // GET PUSH NOTIFICATION TOKEN

            // SAVE THE USERID TO GOOGLE SHEET
            console.log(req.body)
            let passData = []
            passData[0] = [userId, req.body.pushToken]
            const options = {
                spreadsheetId: '1d3ZiP1I9jJ2ddlD1Hx2ylWn1VFD_5lYQ9Ps9e9gEqxI',
                range: `Sheet1!J${index+1}`,
                valueInputOption: 'USER_ENTERED',
                resource: { values: passData }
            }
            
            try{
                await gsapi.spreadsheets.values.update(options)
            }catch(err){
                console.log(err)
            }
            if(data[9]===undefined) {
                
            }

        }
    })

    res.send(userId)
})

module.exports = router