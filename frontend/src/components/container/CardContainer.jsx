import { Card } from "@mui/material";
import {
    CHARACTER_CARD_HEIGHT,
    CHARACTER_CARD_WIDTH,
} from "../../constants/values";

export const CardContainer = ({
    children,
    editable = false,
    hasCharacter = false,
    startColor = "transparent",
    onClick = () => {},
    className,
    ...props
}) => {
    return (
        <Card
            onClick={onClick}
            className={className}
            sx={{
                maxWidth: CHARACTER_CARD_WIDTH,
                height: CHARACTER_CARD_HEIGHT,
                cursor: editable ? "pointer" : "auto",
                border: hasCharacter ? "none" : "1px dashed orange",
                background: hasCharacter
                    ? startColor
                    : "rgba(255, 255, 255, 1)",
                "&:hover": {
                    boxShadow: hasCharacter
                        ? `4px 4px 4px ${startColor}`
                        : null,
                    transition: hasCharacter ? "all 0.5s ease" : null,
                    transform: hasCharacter
                        ? "translateY(-12px) scale(1.1)"
                        : null,
                },
                ...props,
            }}
        >
            {children}
        </Card>
    );
};
