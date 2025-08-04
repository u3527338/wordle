import Backdrop from "@mui/material/Backdrop";
import CircularProgress from "@mui/material/CircularProgress";

const LoadingOverlay = () => {
    return (
        <Backdrop sx={{ color: "#fff", zIndex: 9999 }} open={true}>
            <CircularProgress color="inherit" />
        </Backdrop>
    );
};

export default LoadingOverlay;
