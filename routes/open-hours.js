const router = require('express').Router()
const googleSheet = require('../util')

router.get('/open-hours', async (req, res)=> {
    const data = await googleSheet()

    let hr = data.gsrun[0]
    let hours = [hr[9], hr[10]]
    res.send(hours)
})

module.exports = router