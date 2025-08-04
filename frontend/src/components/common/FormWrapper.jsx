import Paper from "@mui/material/Paper";

export const FormWrapper = ({ children }) => {
    return (
        <Paper
            sx={{
                p: 4,
                display: "flex",
                flexDirection: "column",
            }}
        >
            {children}
        </Paper>
    );
};
