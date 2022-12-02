const express = require('express');
const router = express.Router();

const {
    httpGetAllPlanets,
} = require('./planets.controller');

router.get('/', httpGetAllPlanets);



module.exports = router;