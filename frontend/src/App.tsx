import { useEffect, useRef, useState, MouseEvent } from 'react';
import './App.css';
import { DrawPoint, IncomingDraw } from "./types";

const App: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const contextRef = useRef<CanvasRenderingContext2D | null>(null);
    const [isDrawing, setIsDrawing] = useState<boolean>(false);

    const ws = useRef<WebSocket | null>(null);

    useEffect(() => {
        ws.current = new WebSocket('ws://localhost:8000/canvas');

        const canvas = canvasRef.current;

        if (canvas) {
            canvas.width = 500;
            canvas.height = 500;

            const context = canvas.getContext("2d");
            if (context) {
                context.lineCap = "round";
                context.strokeStyle = "black";
                context.lineWidth = 5;
                contextRef.current = context;
            }
        }

        ws.current.onmessage = (event) => {
            const decodedMessage = JSON.parse(event.data) as IncomingDraw;

            if (decodedMessage.type === 'EXISTING_PIXEL') {
                decodedMessage.payload.forEach((point: DrawPoint) => {
                    contextRef.current?.beginPath();
                    contextRef.current?.moveTo(point.offsetX, point.offsetY);
                    contextRef.current?.lineTo(point.offsetX, point.offsetY);
                    contextRef.current?.stroke();
                });
            }
        }

        return () => {
            ws.current?.close();
        }
    }, []);

    const startDrawing = (event: MouseEvent<HTMLCanvasElement>): void => {
        const { offsetX, offsetY } = event.nativeEvent;
        contextRef.current?.beginPath();
        contextRef.current?.moveTo(offsetX, offsetY);
        contextRef.current?.lineTo(offsetX, offsetY);
        contextRef.current?.stroke();
        setIsDrawing(true);
        event.preventDefault();
    };

    const draw = (event: MouseEvent<HTMLCanvasElement>): void => {
        if (!isDrawing) return;
        const { offsetX, offsetY } = event.nativeEvent;
        contextRef.current?.lineTo(offsetX, offsetY);
        contextRef.current?.stroke();

        if (ws.current) {
            const drawPoint: DrawPoint = { offsetX, offsetY };
            ws.current.send(JSON.stringify({
                type: 'EXISTING_PIXEL',
                payload: [drawPoint],
            }));
        }
        event.preventDefault();
    };

    const stopDrawing = (): void => {
        contextRef.current?.closePath();
        setIsDrawing(false);
    };

    return (
        <div className="App">
            <canvas
                ref={canvasRef}
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                style={{ border: '1px solid black' }}
            />
        </div>
    );
}

export default App;