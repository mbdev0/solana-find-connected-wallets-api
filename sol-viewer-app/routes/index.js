var express = require('express');
var router = express.Router();

const {
  getAllSolTransfers
} = require('../controller/txInfoController')

/* GET home page. */
router.route('/api/getSolTransfers').post(getAllSolTransfers);




module.exports = router;