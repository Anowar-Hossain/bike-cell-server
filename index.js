const express = require('express');
const app = express();
const cors = require('cors');
require('dotenv').config();
const objectId = require('mongodb').ObjectId;
const port =process.env.PORT || 5000;
const { MongoClient } = require('mongodb');


app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.sg0vz.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function run() {

  try{
    await client.connect();
    const database = client.db("bike-Sell");
    const servicesCollection = database.collection('services');
    const ordersCollection = database.collection('orders');
    const usersCollection = database.collection('users');

   
     //get all service api
      app.get('/services', async(req, res)=> {
      const cursor = servicesCollection.find({});
      const services = await cursor.toArray();
      res.send(services);
     });

      //get single service api
      app.get('/services/:id', async(req, res) => {
      const id = req.params.id;
      const query = { _id: objectId(id) };
      const service = await servicesCollection.findOne(query);
      res.send(service);
    })

    //service delete api
    app.delete('/services/:id', async(req,res)=>{
      const id = req.params.id;
      const query = {_id:objectId(id)};
      const result = await servicesCollection.deleteOne(query);
      res.json(result);

    })

    //Orders delete api
    app.delete('/orders/:id', async(req,res)=>{
      const id = req.params.id;
      const query = {_id:objectId(id)};
      const result = await ordersCollection.deleteOne(query);
      res.json(result);
    });


   //get Orders Appi
    app.get('/orders', async(req,res)=> {
    const email = req.query.email;
    const query = {email: email}
    console.log(query);
    const cursor = ordersCollection.find(query);
    const orders = await cursor.toArray();
    res.json(orders);
  });

  //post users api
  app.post('/users', async(req,res) => {
    const user = req.body;
    const result  = usersCollection.insertOne(user);
    console.log(result);
    res.json(result);
  });

  //put Admin api
  app.put('/users/admin', async (req,res)=> {
    const user = req.body;
    console.log('put', user);
    const filter = {email: user.email}
    const updateDoc = {$set: {role: 'admin'}};
    const result = await usersCollection.updateOne(filter, updateDoc);
    res.json(result);
  });


  //post orders api
    app.post('/orders', async (req, res) => {
    const order = req.body;
    const result= await ordersCollection.insertOne(order);
    console.log(result);
    res.json(result)
  });

  //get Admin check api
  app.get('/users/:email', async (req, res) => {
    const email = req.params.email;
    const query = { email: email };
    const user = await usersCollection.findOne(query);
    let isAdmin = false;
    if(user?.role === 'admin'){
      isAdmin= true;
    }
    res.json({admin: isAdmin});
  });

  }
  finally {
    // await client.close();
  }
}
run().catch(console.dir);



app.get('/', (req, res) => {
    res.send('Bike-selling')
  })
  
  app.listen(port, () => {
    console.log('Server Running')
  })