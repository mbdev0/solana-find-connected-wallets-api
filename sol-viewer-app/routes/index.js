var express = require('express');
var router = express.Router();

const {
  getAllSolTransfers,
  getAllSplTransfers,
  getSortedSolTransfers
} = require('../controller/txInfoController')

// const {
//   getAllSplTransfers
// } = require('../controller/txInfoController')



/* GET home page. */
router.route('/api/getSolTransfers').post(getAllSolTransfers);

router.route('/api/getSplTransfers').post(getAllSplTransfers);

router.route('/api/getSortedSolTransfers').post(getSortedSolTransfers)

module.exports = router;