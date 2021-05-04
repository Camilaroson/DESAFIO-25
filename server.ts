
import express from 'express';
const app = express()
import session from 'express-session';
const cookieParser = require('cookie-parser');
app.use(cookieParser());
// ---------------------------------//

const http = require('http').createServer(app);
const io = require('socket.io')(http);

app.use(express.json())
app.use(express.urlencoded({extended: false}));
app.use(express.static('public'))

//------------------------------------//
import {NuevoProducto} from './public/service/producto.service'
const chatModel = require('./models/chatModel')
const mongoose = require('mongoose');
const MongoStore = require('connect-mongo');

declare module "express-session" {
    interface Session {
      user: string;
    }
  }

// INICIACION SESSION //

app.use(session({
  store: MongoStore.create({ 
    mongoUrl: 'mongodb://localhost/sesions',
    ttl: 10 * 60, 
}),
    secret:'secreto',
    resave:true,
    saveUninitialized : true
}))


//endpoints 

app.get('/login-form',(req,res) => {
res.sendFile(__dirname+'/public/login.html')
})


app.post('/login',(req,res)=>{
 req.session.user = req.body.nombre
    res.redirect('/formulario')

   
})

app.get('/formulario',(req,res)=>{
    res.sendFile(__dirname+'/public/formulario.html');
    const user = req.session.user
    console.log(`Hola ${user}`)
    
})

app.get('/logout',(req,res) => {
    res.sendFile(__dirname+'/public/chau.html')
    })
    

app.get('/logout',(req,res)=>{
    req.session.destroy(function (err) {
      res.redirect('/'); 
     });
  })
  



//socket 
io.on('connection', (socket:any) => {
    //recibe lo que viene del script formulario
    socket.on('producto nuevo', (message:any)=>{
       console.log(message) //el  mensaje me traeria los datos del input
        io.emit('producto nuevo', message); //muestra a todoslos usuarios en tiempo rea
    })
      // GUARDAR DATOS DEL CHAT 
    socket.on('mensaje del chat', (data:any) =>{
      console.log(data)
      io.emit('mensaje del chat',data);
      const saveChat = new chatModel(data)
      saveChat.save()
     
})
})

//conexión
app.listen(6666 , () =>{
  mongoose.connect('mongodb://localhost:27017/desafios',
  {
   useNewUrlParser: true, 
   useUnifiedTopology: true
  }
 )

 .then( () => console.log('Conexión establecida'))
 .catch((err:any) => console.log(err))
})
