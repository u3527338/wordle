import Box from "@mui/material/Box";
import CssBaseline from "@mui/material/CssBaseline";
import { MainAppbar } from "./MainAppbar";
import { MainContainer } from "./MainContainer";

const Wrapper = ({ children, showAppBar = true }) => {
    return (
        <Box sx={{ display: "flex" }}>
            <CssBaseline />
            {showAppBar && <MainAppbar />}
            <MainContainer children={children} />
        </Box>
    );
};

export default Wrapper;
