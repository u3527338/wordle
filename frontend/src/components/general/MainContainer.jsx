import { Toolbar } from "@mui/material";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";

export const MainContainer = ({ children }) => {
    return (
        <Box component="main" sx={{ flexGrow: 1 }}>
            <Toolbar />
            <Container maxWidth="lg" sx={{ padding: 0 }}>
                {children}
            </Container>
        </Box>
    );
};
