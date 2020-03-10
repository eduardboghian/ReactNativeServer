const {google} = require('googleapis')
const keys = require('./keys.json')


async function gsrun(client) {
  const gsapi = google.sheets({
    version: 'v4',
    auth: client
  })

  const options = {
    spreadsheetId: '1d3ZiP1I9jJ2ddlD1Hx2ylWn1VFD_5lYQ9Ps9e9gEqxI',
    range: 'Sheet1!A1:L'
  }

  const data = await gsapi.spreadsheets.values.get(options)

  return data.data.values
}

function authorize(client) {
  return new Promise((resolve, reject) => {
    client.authorize((err, tokens) => {
      if (err) {
        reject(err);
      } else {
        resolve(tokens);
      }
    });
  });
}


async function getData() {
  const client = new google.auth.JWT(
    keys.client_email,
    null,
    keys.private_key, ['https://www.googleapis.com/auth/spreadsheets']
  )

  await authorize(client);
  await gsrun(client);

  const response = {}
  response.gsrun = await gsrun(client);
  response.client = client;

  return response
}

// (async function(){
//     let response = await getData()
//     console.log(response)
// })()

module.exports = getData