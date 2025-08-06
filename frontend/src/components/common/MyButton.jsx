const MyButton = ({
    onClick,
    className = "button",
    children,
    color,
    ...props
}) => {
    return (
        <button
            className={className}
            sx={{ backgroundColor: color }}
            onClick={onClick}
            {...props}
        >
            {children}
        </button>
    );
};

export default MyButton;
