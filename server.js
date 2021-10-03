const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const package = require('./package.json');

const port = 5000;
const apiRoot = '/api';

const db = {
    "Chris": {
        "amount": 100,
        "address": "Mumbai",
        "account Number": "10001",
        "limit": 1000
    },
    "Bill": {
        "amount": 200,
        "address": "Delhi",
        "account Number": "10002",
        "limit": 2500
    }
}

const accountsDB = {

}

const app = express();
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())
app.use(cors({ origin: /http:\/\/localhost/ }))
app.options('*', cors())

const router = express.Router()
router.get('/', (req, resp) => {
    resp.send(`${package.version} -v ${package.description}`);
})
router.get('/accounts/:user', (req, res) => {
    const user = req.params.user;
    const account = accountsDB[user];

    if (!account) {
        return res.status(404)
            .json({ error: "User doesn't exist" });
    }
    return res.json(account);
});
router.post('/accounts', (req, res) => {
    const body = req.body;

    if (!body.user || !body.amount) {
        return res
            .status(400)
            .json({error:"User and Amount are required"});
    }
    if (accountsDB[body.user]) {
        return res.status(400)
            .json({error:"Account already exists"});
    }

    let amount = body.amount;
    if (amount && typeof (amount) !== 'number') {
        amount = parseFloat(amount);
        if (isNaN(amount)) {
            return res.status(400)
            .json({error:"Amount should be a number"});
        }
    }
    const account = {
        user: body.user,
        amount: amount || 0,
        description: body.description || `${body.user}'s account'`,
        currency: body.currency,
        transactions: []
    };
    accountsDB[account.user] = account;
    return res.status(201)
        .json(account);
});
router.put('/accounts/:user', (req, res) => {
    const body = req.body;
    const user = req.params.user;
    
    const account = accountsDB[user];
    
    if (!account) {
        return res.status(404)
            .json({ error: "Account doesn't exist" });
    }

    if (body.amount || body.amount || body.transactions) {
        return res.status(400)
            .json({ error: "Can only edit currency and description" });
    }

    if (body.currency)
        account.currency = body.currency;
    if (body.description)
        account.description = body.description;
    accountsDB[user] = account;

    return res.status(200)
        .json(account);
});
router.delete('/accounts/:user', (req, res) => {
    const user = req.params.user;
    const account = accountsDB[user];

    if (!account) {
        return res.status(404)
            .json({ error: "Account doesn't exist" });
    }
    delete accountsDB[user];
    return res.status(204);
});

app.use(apiRoot, router);
app.listen(port, () => {
    console.log("Server is up and running");
})