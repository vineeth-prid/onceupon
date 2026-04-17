const axios = require('axios');
async function test() {
  try {
    const res = await axios.post('http://localhost:3000/api/coupons/validate', {
      code: 'FIRSTTRY1',
      amount: 500000
    });
    console.log('SUCCESS:' + JSON.stringify(res.data));
  } catch (e) {
    console.log('ERROR:' + JSON.stringify(e.response?.data || e.message));
  }
}
test();
