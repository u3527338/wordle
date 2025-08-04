import { Navigate, Route, Routes } from "react-router-dom";
import { BooksRoute } from "./routes/BooksRoute";
import { CharactersRoute } from "./routes/CharactersRoute";
import { MyCharactersRoute } from "./routes/MyCharactersRoute";
import { MySkillsRoute } from "./routes/MySkillsRoute";
import { MySquadsRoute } from "./routes/MySquadsRoute";
import { SkillSetsRoute } from "./routes/SkillSetsRoute";

export const AuthenticatedApp = () => {
    return (
        <Routes>
            <Route path="/characters" element={<CharactersRoute />} />
            <Route path="/skillsets" element={<SkillSetsRoute />} />
            <Route path="/books" element={<BooksRoute />} />
            <Route path="/my-characters" element={<MyCharactersRoute />} />
            <Route path="/my-skills" element={<MySkillsRoute />} />
            <Route path="/my-squads" element={<MySquadsRoute />} />
            <Route path="*" element={<Navigate to="/my-squads" />} />
        </Routes>
    );
};
