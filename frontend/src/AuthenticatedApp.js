import { Navigate, Route, Routes, useNavigate } from "react-router-dom";
import { GameRoute } from "./routes/GameRoute";
import { LobbyRoute } from "./routes/LobbyRoute";
import socket from "./socket";
import { useEffect, useState } from "react";
import { useStore } from "./hook/useStore";
import MyModal from "./components/common/MyModal";

export const AuthenticatedApp = () => {
    const navigate = useNavigate();
    const { user } = useStore();
    const { userId, nickName } = user;
    const [gameLoading, setGameLoading] = useState(true);

    const socketHandlers = {
        inGame: (roomId) => {
            setGameLoading(false);
            if (roomId) {
                navigate(`/wordle/${roomId}`);
            }
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
        setGameLoading(true);
        registerSocketEvents(socketHandlers);
        return () => deregisterSocketEvents(socketHandlers);
    }, []);

    if (gameLoading)
        return (
            <MyModal open={true}>
                <span>Retriving game status...</span>
            </MyModal>
        );
    return (
        <Routes>
            <Route path="/wordle" element={<LobbyRoute />} />
            <Route path="/wordle/:roomId" element={<GameRoute />} />
            <Route path="*" element={<Navigate to="/wordle" />} />
        </Routes>
    );
};
