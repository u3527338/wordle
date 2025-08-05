import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useStore } from "../hook/useStore";
import socket from "../socket";
import "../styles/WaitingLobby.css";

const WaitingLobby = () => {
    const [rooms, setRooms] = useState([]);
    const navigate = useNavigate();
    const { userId } = useStore();

    useEffect(() => {
        socket.emit("getRooms");
        socket.on("updateRooms", (data) => {
            setRooms(data);
        });
        return () => {
            socket.off("updateRooms");
            socket.off("getRooms");
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
        <div className="lobby-container">
            <h2 className="lobby-title">Waiting Rooms</h2>
            <button className="create-room-btn" onClick={handleCreateRoom}>
                Create New Room
            </button>
            {rooms.length === 0 ? (
                <p className="no-rooms">No available rooms right now.</p>
            ) : (
                <div className="room-list">
                    {rooms.map((room) => (
                        <div key={room.id} className="room-card">
                            <div className="room-info">
                                <h3 className="room-id">Room ID: {room.id}</h3>
                                <p className="host-name">
                                    Host: {room.hostName || "Host"}
                                </p>
                            </div>
                            <button
                                className="join-btn"
                                onClick={() => handleJoinRoom(room.id)}
                            >
                                Join
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default WaitingLobby;
