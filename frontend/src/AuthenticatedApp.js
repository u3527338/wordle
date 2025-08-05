import { Navigate, Route, Routes } from "react-router-dom";
import { RoomRoute } from "./routes/RoomRoute";
import { RoomsRoute } from "./routes/RoomsRoute";

export const AuthenticatedApp = () => {
    return (
        <Routes>
            <Route path="/wordle" element={<RoomsRoute />} />
            <Route path="/wordle/:roomId" element={<RoomRoute />} />
            <Route path="*" element={<Navigate to="/wordle" />} />
        </Routes>
    );
};
