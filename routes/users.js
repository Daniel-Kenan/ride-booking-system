var express = require('express');
const axios = require('axios');
var router = express.Router();

/* GET users listing. */
router.get('/', async function(req, res, next) {
  
  
  axios.get('http://localhost:3000/api/users')
  .then(response => {
    // Handle successful response
    console.log(response.data);
  })
  .catch(error => {
    // Handle error
    console.error(error);
  });

  res.send('respond with a resource');
});


module.exports = router;
