const express = require('express')
const app = express()
var morgan = require('morgan')
var uuid = require('node-uuid')



let notes = [
  {
    id: 1,
    content: "HTML is easy",
    date: "2022-01-10T17:30:31.098Z",
    important: true
  },
  {
    id: 2,
    content: "Browser can execute only Javascript",
    date: "2022-01-10T18:39:34.091Z",
    important: false
  },
  {
    id: 3,
    content: "GET and POST are the most important methods of HTTP protocol",
    date: "2022-01-10T19:20:14.298Z",
    important: true
  }
]

morgan.token('id', function getId (req) {
  return req.id
})

function assignId (req, res, next) {
  req.id = uuid.v4()
  next()
}

app.use(assignId)
app.use(morgan(':id :method :url :response-time'))



const requestLogger = (request, response, next) => {
  console.log('Method:', request.method)
  console.log('Path:  ', request.path)
  console.log('Body:  ', request.body)
  console.log('---')
  next()
}

app.use(express.json())

app.use(requestLogger)

var requestTime = function (req, res, next) {
  req.requestTime = new Date();
  next();
};

app.use(requestTime);
app.use(morgan('combined'))

app.get('/', function (req, res) {
  res.send('hello, world!')
})

app.get('/info', (req, res) => {
  var id = generateId()
  
  res.send('phone has info for '+id+' people <br><br>'+' el tiempo es '+ req.requestTime)
})

const generateId = () => {
  const maxId = notes.length > 0
    ? Math.max(...notes.map(n => n.id))
    : 0
  return maxId + 1
}

app.post('/api/persons', (request, response) => {
  const body = request.body

  if (!body.content) {
    return response.status(400).json({ 
      error: 'content missing' 
    })
  }

  const note = {
    content: body.content,
    important: body.important || false,
    date: new Date(),
    id: generateId(),
  }

  notes = notes.concat(note)

  response.json(note)
}) 

app.get('/api/persons', (req, res) => {
  
  
  res.json(notes)
})

app.delete('/api/persons/:id', (request, response) => { 
  const id = Number(request.params.id)
  notes = notes.filter(note => note.id !== id)

  response.status(204).end()
})

app.get('/api/persons/:id', (request, response) => {
  const id = Number(request.params.id)
  const note = notes.find(note => note.id === id)

  if (note) {
    response.json(note)
  } else {
    response.status(404).end()
  }
})

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}

app.use(unknownEndpoint)

const PORT = 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})