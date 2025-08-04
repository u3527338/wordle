import { Navigate, Route, Routes } from "react-router-dom";
import { MenuRoute } from "./routes/MenuRoute";
import { WordleRoute } from "./routes/WordleRoute";
import { RoomsRoute } from "./routes/RoomsRoute";
import { RoomRoute } from "./routes/RoomRoute";

export const AuthenticatedApp = () => {
    return (
        <Routes>
            <Route path="/menu" element={<MenuRoute />} />
            <Route path="/wordle" element={<WordleRoute />} />
            <Route path="/rooms" element={<RoomsRoute />} />
            <Route path="/rooms/:roomId" element={<RoomRoute />} />
            <Route path="*" element={<Navigate to="/menu" />} />
        </Routes>
    );
};
