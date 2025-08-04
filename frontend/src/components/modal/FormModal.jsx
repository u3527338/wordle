import {
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
} from "@mui/material";

const FormModal = ({
    title = "New",
    open,
    handleClose,
    children,
    parentSx,
    sx,
    customButton = false,
}) => {
    return (
        <Dialog
            open={open}
            onClose={handleClose}
            sx={{
                "& .MuiDialog-paper": {
                    minWidth: "100%",
                    backgroundColor: "rgba(25,25,25,0.7)",
                    marginTop: '96px',
                    height: "85%",
                    ...parentSx,
                },
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
            }}
        >
            <DialogTitle color="white">{title}</DialogTitle>
            <DialogContent sx={{ width: "100%", maxHeight: "600px", ...sx }}>
                {children}
            </DialogContent>
            {!customButton && (
                <DialogActions>
                    <Button onClick={handleClose} color="primary">
                        關閉
                    </Button>
                </DialogActions>
            )}
        </Dialog>
    );
};

export default FormModal;
