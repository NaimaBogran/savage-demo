const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const MongoClient = require('mongodb').MongoClient

let db
const url = "mongodb+srv://demo:demo@cluster0-q2ojb.mongodb.net/test?retryWrites=true"
const dbName = "demo"

// --- Connect to MongoDB ---
app.listen(3000, () => {
  MongoClient.connect(url, { useNewUrlParser: true, useUnifiedTopology: true }, (error, client) => {
    if (error) throw error
    db = client.db(dbName)
    console.log("✅ Connected to `" + dbName + "`!")
  })
})

// --- Middleware ---
app.set('view engine', 'ejs')
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())
app.use(express.static('public'))

// --- Routes ---

// Home page: display messages
app.get('/', (req, res) => {
  db.collection('messages').find().toArray((err, result) => {
    if (err) return console.log(err)
    res.render('index.ejs', { messages: result })
  })
})

// add a message
app.post('/messages', (req, res) => {
  db.collection('messages').insertOne(
    { name: req.body.name, msg: req.body.msg, thumbUp: 0 },
    (err, result) => {
      if (err) return console.log(err)
      console.log('💾 Saved to database')
      res.redirect('/')
    }
  )
})

// increment thumbs up
app.put('/messages', (req, res) => {
  db.collection('messages').findOneAndUpdate(
    { name: req.body.name, msg: req.body.msg },
    { $inc: { thumbUp: 1 } },
    { sort: { _id: -1 }, returnOriginal: false },
    (err, result) => {
      if (err) return res.send(err)
      res.send(result)
    }
  )
})

// decrement thumbs up (same field)
app.put('/messages/thumbDown', (req, res) => {
  db.collection('messages').findOneAndUpdate(
    { name: req.body.name, msg: req.body.msg },
    { $inc: { thumbUp: -1 } },
    { sort: { _id: -1 }, returnOriginal: false },
    (err, result) => {
      if (err) return res.send(err)
      res.send(result)
    }
  )
})

// delete message
app.delete('/messages', (req, res) => {
  db.collection('messages').findOneAndDelete(
    { name: req.body.name, msg: req.body.msg },
    (err, result) => {
      if (err) return res.status(500).send(err)
      res.send('🗑️ Message deleted!')
    }
  )
})
