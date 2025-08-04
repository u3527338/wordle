import { Navigate, Route, Routes } from "react-router-dom";
import { MenuRoute } from "./routes/MenuRoute";
import { WordleRoute } from "./routes/WordleRoute";

export const AuthenticatedApp = () => {
    return (
        <Routes>
            <Route path="/menu" element={<MenuRoute />} />
            <Route path="/wordle" element={<WordleRoute />} />
            <Route path="*" element={<Navigate to="/menu" />} />
        </Routes>
    );
};
