import express from 'express';
import expressWs from 'express-ws';
import cors from 'cors';
import { WebSocket} from 'ws';

const app = express();
expressWs(app);
app.use(cors());

const router = express.Router();

const connectedClients: WebSocket[] = [];

router.ws('/canvas', (ws, req) => {
    connectedClients.push(ws);
    console.log('client connected, total clients: ', connectedClients.length);


    ws.on('close', ()=>{
        console.log('client disconnected');
        const index = connectedClients.indexOf(ws);
        connectedClients.splice(index, 1);
    });
});

app.use(router);

const port = 8000;

app.listen(port, () => {
    console.log(`Server started on ${port} port!`);
});
