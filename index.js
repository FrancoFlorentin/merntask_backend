import express from 'express';
import dotenv from 'dotenv';
import conectarDB from './config/db.js';
import cors from 'cors';
import usuarioRoutes from './routes/usuarioRoutes.js';
import proyectoRoutes from './routes/proyectoRoutes.js';
import tareaRoutes from './routes/tareaRoutes.js';

const app = express();
app.use(express.json())
dotenv.config();

conectarDB()

//! Configuracion de cors (Transferencia de datos de un dominio a otro)
const whiteList = [process.env.FRONTEND_URL]; // Lista blanca de los dominios que pueden utilizar mis datos
const corsOptions = {
    origin: function(origin, callback) {
        if (whiteList.includes(origin)) {
            // Puede consultar la api
            callback(null, true); // Damos el acceso con un true
        } else {
            // No está permitido su request
            callback(new Error("Error de Cors"))
        }
    }
}

app.use(cors(corsOptions))
// app.use(cors({
//     origin: '*'
// }));

//! Routing
app.use('/api/usuarios', usuarioRoutes)
app.use('/api/proyectos', proyectoRoutes)
app.use('/api/tareas', tareaRoutes)

const PORT = process.env.PORT || 4000 

const servidor = app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`)
})


// Socket.io
import { Server } from "socket.io"

const io = new Server(servidor, {
    pingTimeout: 60000,
    cors: {
        origin: process.env.FRONTEND_URL
    }
})

io.on('connection', (socket) => {
    console.log("Conectado a Socket.io")

    // Definir los eventos de socket.io
    socket.on('abrir proyecto', proyecto => {
        socket.join(proyecto)
    })

    socket.on('nueva tarea', tarea => {
        socket.to(tarea.proyecto).emit('tarea agregada', tarea)
    })

    socket.on('eliminar tarea', tarea => {
        socket.to(tarea.proyecto).emit('tarea eliminada', tarea)
    })

    socket.on('editar tarea', tarea => {
        socket.to(tarea.proyecto._id).emit('tarea editada', tarea)
    })

    socket.on('completar tarea', tarea => {
        socket.to(tarea.proyecto._id).emit('tarea completada', tarea)
    })
})

