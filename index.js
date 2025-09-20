require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const mongoose = require('mongoose');//ODM
 
const socketio = require('socket.io');
const http = require('http');
 
const routes = require('./routes');
 
const app = express();
const server = http.createServer(app);
 
// A configuração do Socket.io precisa permitir a origem do seu frontend
const io = socketio(server, {
    cors:{
        origin: 'http://localhost:5173', // <-- CORREÇÃO AQUI: Porta do seu frontend web
        methods: ['GET', 'POST'],
    }
});
const connectedUsers = {};
 
io.on('connection', socket => {
    const { user_id } = socket.handshake.query;
    if (user_id) {
        if(!connectedUsers[user_id]){
            connectedUsers[user_id] = []
        }
        connectedUsers[user_id].push(socket.id);
    }
})
 
// Você pode deixar o cors() geral sem opções, ele vai permitir tudo por padrão.
app.use(cors());
app.use(express.json());
 
app.use((req, res, next) =>{
    req.io = io;
    req.connectedUsers = connectedUsers;
    return next();
})
 
app.use(routes);
app.use('/files', express.static(path.resolve(__dirname, 'uploads')))
 
app.get('/ping', (req, res) => {
    console.log('recebeu ping');
    res.send('pong');
})
 
async function startDatabase(){
    const { DB_USER, DB_PASS, DB_NAME } = process.env
    const uri = `mongodb+srv://${DB_USER}:${DB_PASS}@cluster0.i1ywpkx.mongodb.net/${DB_NAME}?retryWrites=true&w=majority&appName=Cluster0`;
    try {
        await mongoose.connect(uri);
        console.log('Conectado ao MongoDBAtlas');
    } catch (error) {
        console.error('Erro ao conectar ao MongoDB: ', error.message);
        process.exit(1);
    }
}
 
startDatabase().then( ()=> {
    const port = process.env.PORT || 3335
    server.listen(port, () =>{
        console.log(`Servidor rodando na porta ${port}`);
    })
})