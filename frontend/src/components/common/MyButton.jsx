import Button from "@mui/material/Button";

const MyButton = ({
    onClick,
    className = "button",
    children,
    color,
    ...props
}) => {
    return (
        <Button
            onClick={onClick}
            className={className}
            sx={{ backgroundColor: `${color} !important` }}
            {...props}
        >
            {children}
        </Button>
    );
};

export default MyButton;
