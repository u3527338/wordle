import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import { Menubar } from "primereact/menubar";
import { useEffect } from "react";
import { CiLogout } from "react-icons/ci";
import { GiVisoredHelm } from "react-icons/gi";
import { useLocation, useNavigate } from "react-router-dom";
import { MAIN_BACKGROUND } from "../../constants/colors";
import { MENU } from "../../constants/constants";
import { useStore } from "../../hook/useStore";
import { useUserQuery } from "../../request/hook";

export const MainAppbar = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { user, setUser, currentTab, setCurrentTab } = useStore();
    const userId = user?.userId;
    const { data } = useUserQuery(userId);

    const logout = () => {
        setUser(null);
        navigate("/login");
    };

    useEffect(() => {
        setCurrentTab(MENU[location.pathname.split("/").pop()]);
    }, [location.pathname]);

    var items = [
        {
            label: "Game",
            icon: <GiVisoredHelm style={{ marginRight: "0.5rem" }} />,
            command: () => {
                navigate("/wordle");
            },
        },
        {
            label: "Logout",
            icon: <CiLogout style={{ marginRight: "0.5rem" }} />,
            command: () => {
                logout();
            },
        },
    ];

    return (
        <AppBar component="nav" sx={{ zIndex: 9999 }}>
            <Toolbar
                sx={{
                    background: MAIN_BACKGROUND,
                }}
            >
                <Typography
                    component="h1"
                    variant="h6"
                    color="inherit"
                    noWrap
                    sx={{ flexGrow: 1 }}
                >
                    {currentTab}
                </Typography>
                <Menubar
                    style={{ border: "none", backgroundColor: "transparent" }}
                    model={items}
                />
            </Toolbar>
        </AppBar>
    );
};
