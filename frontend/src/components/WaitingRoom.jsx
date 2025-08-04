import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useStore } from "../hook/useStore";
import socket from "../socket";

const WaitingRoom = () => {
    const [rooms, setRooms] = useState([]);
    const navigate = useNavigate();
    const { userId } = useStore();

    useEffect(() => {
        socket.on("updateRooms", (data) => {
            console.log("Received room list:", data);
            setRooms(data);
        });

        return () => {
            socket.off("updateRooms");
        };
    }, []);

    const handleCreateRoom = () => {
        const roomId = Math.random().toString(36).substring(2, 8).toUpperCase();
        socket.emit("createRoom", {
            roomId,
            player: { id: userId, isHost: true },
        });
        navigate(`/rooms/${roomId}`);
    };

    const handleJoinRoom = (roomId) => {
        navigate(`/rooms/${roomId}`);
    };

    return (
        <div>
            <h3>Available Rooms</h3>
            <button onClick={handleCreateRoom}>Create New Room</button>
            {rooms.length === 0 ? (
                <p>No available rooms right now.</p>
            ) : (
                <ul>
                    {rooms.map((room) => (
                        <li key={room.id}>
                            Room ID: {room.id} | Host: {room.hostName}
                            <button onClick={() => handleJoinRoom(room.id)}>
                                Join
                            </button>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default WaitingRoom;
