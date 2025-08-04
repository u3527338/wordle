import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import { Menubar } from "primereact/menubar";
import { useEffect } from "react";
import { BiSolidEdit } from "react-icons/bi";
import { CiLogout } from "react-icons/ci";
import { GiSecretBook, GiTiedScroll, GiVisoredHelm } from "react-icons/gi";
import { LiaUserCircleSolid } from "react-icons/lia";
import { MdOutlineManageAccounts } from "react-icons/md";
import { useLocation, useNavigate } from "react-router-dom";
import { MAIN_BACKGROUND } from "../../constants/colors";
import { MENU } from "../../constants/constants";
import { useStore } from "../../hook/useStore";
import { useUserQuery } from "../../request/hook";

export const MainAppbar = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { userId, setUserId, currentTab, setCurrentTab } = useStore();
    const { data } = useUserQuery(userId);

    const logout = () => {
        setUserId(null);
        navigate("/login");
    };

    useEffect(() => {
        setCurrentTab(MENU[location.pathname.split("/").pop()]);
    }, [location.pathname]);

    var items = [
        {
            label: "我的武將",
            icon: <GiVisoredHelm style={{ marginRight: "0.5rem" }} />,
            command: () => {
                navigate("/my-characters");
            },
        },
        {
            label: "我的戰法",
            icon: <GiTiedScroll style={{ marginRight: "0.5rem" }} />,
            command: () => {
                navigate("/my-skills");
            },
        },
        {
            label: "我的陣容",
            icon: <GiSecretBook style={{ marginRight: "0.5rem" }} />,
            command: () => {
                navigate("/my-squads");
            },
        },
        {
            label: "登出",
            icon: <CiLogout style={{ marginRight: "0.5rem" }} />,
            command: () => {
                logout();
            },
        },
    ];

    if (data?.data?.role.includes("admin"))
        items.unshift({
            label: "管理",
            icon: <MdOutlineManageAccounts style={{ marginRight: "0.5rem" }} />,
            items: [
                {
                    label: "新增武將",
                    icon: <BiSolidEdit style={{ marginRight: "0.5rem" }} />,
                    command: () => {
                        navigate("/characters");
                    },
                },
                {
                    label: "新增戰法",
                    icon: <BiSolidEdit style={{ marginRight: "0.5rem" }} />,
                    command: () => {
                        navigate("/skillsets");
                    },
                },
                {
                    label: "新增兵書",
                    icon: <BiSolidEdit style={{ marginRight: "0.5rem" }} />,
                    command: () => {
                        navigate("/books");
                    },
                },
            ],
        });
        
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
