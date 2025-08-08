import { Navigate, Route, Routes, useNavigate } from "react-router-dom";
import { GameRoute } from "./routes/GameRoute";
import { LobbyRoute } from "./routes/LobbyRoute";
import socket from "./socket";
import { useEffect } from "react";
import { useStore } from "./hook/useStore";

export const AuthenticatedApp = () => {
    const navigate = useNavigate();
    const { user } = useStore();
    const { userId, nickName } = user;
    const socketHandlers = {
        inGame: (roomId) => {
            navigate(`/wordle/${roomId}`);
        },
    };

    const registerSocketEvents = (handlers) => {
        Object.entries(handlers).forEach(([event, handler]) =>
            socket.on(event, handler)
        );
    };
    const deregisterSocketEvents = (handlers) => {
        socket.off("joinRoom");
        Object.entries(handlers).forEach(([event, handler]) =>
            socket.off(event, handler)
        );
    };

    useEffect(() => {
        socket.emit("reconnect", userId);
        registerSocketEvents(socketHandlers);
        return () => deregisterSocketEvents(socketHandlers);
    }, []);

    return (
        <Routes>
            <Route path="/wordle" element={<LobbyRoute />} />
            <Route path="/wordle/:roomId" element={<GameRoute />} />
            <Route path="*" element={<Navigate to="/wordle" />} />
        </Routes>
    );
};
