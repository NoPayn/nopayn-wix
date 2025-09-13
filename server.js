require('dotenv').config();
const express = require('express');
const axios = require('axios');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());

const PORT = process.env.PORT || 3000;

// Example Wix endpoint: create transaction
app.post('/psp/transactions/create', async (req, res) => {
  const { wixTransactionId, amount, currency } = req.body;

  try {
    const resp = await axios.post(
      `${process.env.NOPAYN_API_BASE}/payments`,
      {
        reference: wixTransactionId,
        amount_minor: amount,
        currency
      },
      {
        headers: {
          Authorization:
            "Basic " +
            Buffer.from(`${process.env.NOPAYN_API_KEY}:`).toString("base64")
        }
      }
    );

    res.json({
      wixTransactionId,
      pluginTransactionId: resp.data.id,
      action: {
        type: "REDIRECTION",
        redirectUrl: resp.data.redirect_url
      }
    });
  } catch (err) {
    console.error(err.message);
    res.json({ approved: false, reasonCode: 6000 });
  }
});

// Health check
app.get('/', (req, res) => res.send('NoPayn Wix Gateway is running!'));

app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
