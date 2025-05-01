import React, { useRef, useEffect, useState } from 'react';
import { useSocket } from '@/context/SocketContext';

const Whiteboard = ({ roomId }) => {

 const canvasRef = useRef(null);
 const socket = useSocket();
 const [selectedColor,setSelectedColor] = useState("#000000");

 useEffect(() => {

    socket.emit('joinRoom', roomId);

    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    let drawing = false;

    canvas.addEventListener('mousedown', (e) => {
        drawing = true;
    });

    canvas.addEventListener('mouseup', () => {
        drawing = false;
    });

    canvas.addEventListener('mousemove', (e) => {

        if (!drawing) return;

        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const data = { x, y, color: selectedColor,size: 2 };
        socket.emit('draw', data, roomId);
        draw(data);

    });
        socket.on('draw', data => {
        draw(data);
        });

        const draw = (data) => {
        context.beginPath();
        context.arc(data.x, data.y, data.size, 0, 2 * Math.PI);
        context.fillStyle = data.color;
        context.fill();
        };

    }, [roomId,selectedColor]);

    const handleColorChange = (e) => {
        setSelectedColor(e.target.value);
      };

    return (<div>
        <div>
            <label htmlFor="colorPicker">Select Color:</label>
            <input
            type="color"
            id="colorPicker"
            value={selectedColor}
            onChange={handleColorChange}
            />
        </div>
        <canvas ref={canvasRef} width={800} height={600} />
        </div>);

};



export default Whiteboard;