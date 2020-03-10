const router = require('express').Router()
const getData = require('../util')

router.post('/user-data', async (req, res)=> {
    const data = await getData()
    
    let response = await Promise.resolve( data.gsrun.map(data=> {
        if(data[9]===req.body.userId) {
            return data
        }
    }))
    
    res.send(response)
})

module.exports = router