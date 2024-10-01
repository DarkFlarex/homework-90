import express from 'express';
import expressWs from 'express-ws';
import cors from 'cors';
import { WebSocket} from 'ws';

interface DrawPoint {
    offsetX: number;
    offsetY: number;
}

interface IncomingDraw {
    type: string;
    payload: DrawPoint[];
}

const app = express();
expressWs(app);
app.use(cors());

const router = express.Router();

const connectedClients: WebSocket[] = [];

let filledPixels: DrawPoint[] = [];

router.ws('/canvas', (ws, req) => {
    connectedClients.push(ws);
    console.log('client connected, total clients: ', connectedClients.length);

    ws.send(JSON.stringify({ type: 'EXISTING_PIXEL', payload: filledPixels }));

    ws.on('message', (drawMessage) => {
        try {
            const decodedDraw = JSON.parse(drawMessage.toString()) as IncomingDraw;
            if (decodedDraw.type === 'EXISTING_PIXEL') {
                filledPixels.push(...decodedDraw.payload);
                connectedClients.forEach((clientWs) => {
                    clientWs.send(JSON.stringify({
                        type: 'NEW_PIXEL',
                        payload: decodedDraw.payload,
                    }));
                });
            }
        } catch (e) {
            ws.send(JSON.stringify({error: 'Invalid Draw'}));
        }
    });

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