import { Navigate, Route, Routes } from "react-router-dom";
import { GameRoute } from "./routes/GameRoute";
import { LobbyRoute } from "./routes/LobbyRoute";

export const AuthenticatedApp = () => {
    return (
        <Routes>
            <Route path="/wordle" element={<LobbyRoute />} />
            <Route path="/wordle/:roomId" element={<GameRoute />} />
            <Route path="*" element={<Navigate to="/wordle" />} />
        </Routes>
    );
};
