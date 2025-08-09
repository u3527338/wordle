import { Box, Avatar, Typography } from "@mui/material";
import avatar from "../../assets/image/avatar.png";

const UserInfo = ({ player, flexDirection }) => (
    <Box
        className={`user-info ${player?.isSelf ? "self" : "opponent"}`}
        sx={{
            display: "flex",
            height: "auto",
            width:
                flexDirection === "column" ? "20%" : "-webkit-fill-available",
            flexDirection,
            alignItems: "center",
            gap: 2,
            padding: 1,
            borderRadius: 2,
        }}
    >
        <Avatar
            src={avatar}
            alt={player?.name}
            sx={{
                width: { xs: 40, md: 60 },
                height: { xs: 40, md: 60 },
                backgroundColor: "#000",
            }}
        />
        <Typography variant="subtitle1" sx={{ fontSize: { xs: 12, sm: 16 } }}>
            {player?.name}
        </Typography>
    </Box>
);

export default UserInfo;
