const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
require('dotenv').config()
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const res = require('express/lib/response');
const app = express();
const port = process.env.PORT || 5000;

//middleware
app.use(express.json());
app.use(cors());
// bujhe sune api gulor modde dite hbe, login er modde deya jabe na, keno na login er maddome muloto token toiri kra hocche, order api get krar somoy deya hlo
function verifyJWT(req, res, next) {
    const authoHeaders = req.headers.authorization;
    if (!authoHeaders) {
        return res.status(401).send({ massage: 'unauthorize access' })
    }
    const token = authoHeaders.split(' ')[1];
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
        if (err) {
            return res.status(403).send({ massage: 'forbidden access' });
        }
        console.log('decoded rrr', decoded);
        req.decoded = decoded;
        next();
    })
}
const uri = `mongodb+srv://${process.env._GENIUS_USER}:${process.env._GENIUS_PASSWORD}@cluster0.ho8nb.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
    try {
        await client.connect();
        const serviceCollection = client.db('geniusCar').collection('Service');
        const orderCollection = client.db('geniusCar').collection('order')
        //SERVICE API
        app.get('/service', async (req, res) => {
            const query = {};
            const cursor = serviceCollection.find(query);
            const services = await cursor.toArray()
            res.send(services);
        })
        app.get('/service/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const service = await serviceCollection.findOne(query);
            res.send(service);
        })
        //post
        app.post('/service', async (req, res) => {
            const newService = req.body;
            const result = await serviceCollection.insertOne(newService);
            res.send(result);
        })
        //delete
        app.delete('/service/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await serviceCollection.deleteOne(query);
            res.send(result);

        })
        //order api
        app.post('/order', async (req, res) => {
            const order = req.body;
            const result = await orderCollection.insertOne(order);
            res.send(result);
        })
        app.get('/order', verifyJWT, async (req, res) => {
            const decodedEmail = req.decoded.email;
            const email = req.query.email;
            if (email === decodedEmail) {
                const query = { email: email };
                const cursor = orderCollection.find(query);
                const orders = await cursor.toArray();
                res.send(orders);
            }
        })
        //AUTH
        app.post('/login', async (req, res) => {
            const user = req.body;
            //jwt install kre upore require krte hbe>>> const jwt = require('jsonwebtoken');
            const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1d' });
            res.send({ accessToken })
        })
    }
    finally {

    }
}
run().catch(console.dir)

app.get('/', (req, res) => {
    res.send('readey server')
})
app.listen(port, () => {
    console.log('Listening to port', port)
})