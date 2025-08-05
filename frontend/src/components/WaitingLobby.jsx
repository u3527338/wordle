import ComputerIcon from "@mui/icons-material/Computer";
import GroupIcon from "@mui/icons-material/Group";
import {
    Button,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    ToggleButton,
    Typography,
} from "@mui/material";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useStore } from "../hook/useStore";
import socket from "../socket";
import "../styles/WaitingLobby.css";

const RoomTable = ({ rows, onJoin }) => {
    const hasRecords = rows && rows.length > 0;
    const headings = ["Room ID", "Host", "Mode", "Players", ""];
    const Cell = ({ value, ...props }) => (
        <TableCell
            align="center"
            {...props}
            sx={{ ...props.sx, background: "transparent", fontWeight: "bold" }}
        >
            {value}
        </TableCell>
    );
    return (
        <TableContainer
            component={Paper}
            sx={{
                background: "rgba(106, 170, 100, 0.5);",
                border: 1,
                borderColor: "#2c2c2c",
                borderRadius: 2,
                overflow: "hidden",
            }}
        >
            <Table stickyHeader aria-label="room list table">
                <TableHead>
                    <TableRow
                        sx={{
                            background:
                                "linear-gradient(135deg, #222, #2c2c2c)",
                        }}
                    >
                        {headings.map((h, i) => (
                            <Cell key={i} sx={{ color: "#fff" }} value={h} />
                        ))}
                    </TableRow>
                </TableHead>
                <TableBody>
                    {hasRecords ? (
                        rows.map((row) => (
                            <TableRow
                                key={row.id}
                                hover
                                sx={{ borderRadius: 2 }}
                            >
                                <Cell value={row.id} />
                                <Cell value={row.hostName} />
                                <Cell
                                    value={
                                        row.mode === "server" ? (
                                            <ComputerIcon />
                                        ) : (
                                            <GroupIcon />
                                        )
                                    }
                                />
                                <Cell value={`${row.players.length} / 2`} />
                                <Cell
                                    value={
                                        row.players.length >= 2 ? (
                                            <Typography>Full</Typography>
                                        ) : (
                                            <Button
                                                variant="contained"
                                                disabled={
                                                    row.players.length >= 2
                                                }
                                                onClick={() => onJoin(row.id)}
                                                sx={{
                                                    padding: "6px 12px",
                                                    borderRadius: "8px",
                                                    fontWeight: "bold",
                                                    backgroundColor: "#6aaa64",
                                                }}
                                            >
                                                Join
                                            </Button>
                                        )
                                    }
                                />
                            </TableRow>
                        ))
                    ) : (
                        <TableRow>
                            <TableCell
                                colSpan={5}
                                align="center"
                                sx={{ py: 4, backgroundColor: "transparent" }}
                            >
                                <Typography variant="h6" color="#fff">
                                    No Game Session Available
                                </Typography>
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </TableContainer>
    );
};

const WaitingLobby = () => {
    const [rooms, setRooms] = useState([]);
    const navigate = useNavigate();
    const { userId } = useStore();
    const [mode, setMode] = useState("server"); // 'server' or 'custom'

    useEffect(() => {
        socket.emit("getRooms");
        socket.on("updateRooms", (data) => {
            setRooms(data);
        });
        return () => {
            socket.off("updateRooms");
            socket.off("getRooms");
        };
    }, []);

    const handleCreateRoom = () => {
        const roomId = Math.random().toString(36).substring(2, 8).toUpperCase();
        const data = {
            roomId,
            player: { id: userId, isHost: true },
            mode,
        };
        socket.emit("createRoom", data);
        navigate(`/rooms/${roomId}`);
    };

    const handleJoinRoom = (roomId) => {
        navigate(`/rooms/${roomId}`);
    };

    const handleChange = (event, mode) => {
        setMode(mode);
    };

    const control = {
        value: mode,
        onChange: handleChange,
        exclusive: true,
    };

    const rows = rooms.map((room) => ({
        id: room.id,
        hostName: room.hostName || "Host",
        mode: room.mode,
        players: room.players,
    }));

    return (
        <div className="lobby-container">
            <div className="mode-selection">
                <ToggleButtonGroup
                    size="small"
                    {...control}
                    aria-label="Small sizes"
                >
                    [
                    <ToggleButton
                        disabled={mode === "server"}
                        value="server"
                        key="server"
                    >
                        <ComputerIcon />
                    </ToggleButton>
                    ,
                    <ToggleButton
                        disabled={mode === "custom"}
                        value="custom"
                        key="custom"
                    >
                        <GroupIcon />
                    </ToggleButton>
                    ]
                </ToggleButtonGroup>
            </div>
            <div className="mode-selection">
                <button className="create-room-btn" onClick={handleCreateRoom}>
                    Create New Room
                </button>
            </div>
            <RoomTable rows={rows} onJoin={handleJoinRoom} />
        </div>
    );
};

export default WaitingLobby;
