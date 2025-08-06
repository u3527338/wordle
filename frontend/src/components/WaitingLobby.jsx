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
import { useCreateRoomMutation, useJoinRoomMutation } from "../request/hook";
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
                        rows.map((row) => {
                            const maxPlayer = row.isSinglePlayer ? 1 : 2;
                            return (
                                <TableRow key={row.id} sx={{ borderRadius: 2 }}>
                                    <Cell value={row.id} />
                                    <Cell value={row.hostName} />
                                    <Cell
                                        value={
                                            row.mode === "twoPlayerServer" ? (
                                                <ComputerIcon />
                                            ) : (
                                                <GroupIcon />
                                            )
                                        }
                                    />
                                    <Cell
                                        value={`${row.players.length} / ${maxPlayer}`}
                                    />
                                    <Cell
                                        value={
                                            row.players.length >= maxPlayer ? (
                                                <Typography>Full</Typography>
                                            ) : (
                                                <Button
                                                    variant="contained"
                                                    onClick={() =>
                                                        onJoin(row.id)
                                                    }
                                                    sx={{
                                                        padding: "6px 12px",
                                                        borderRadius: "8px",
                                                        fontWeight: "bold",
                                                        backgroundColor:
                                                            "#6aaa64",
                                                    }}
                                                >
                                                    Join
                                                </Button>
                                            )
                                        }
                                    />
                                </TableRow>
                            );
                        })
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
    const { user } = useStore();
    const { userId, nickName } = user;
    const [multiPlayerMode, setMultiPlayerMode] = useState("twoPlayerServer");
    const { mutate: mutateCreateRoom } = useCreateRoomMutation();
    const { mutate: mutateJoinRoom } = useJoinRoomMutation();

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

    const handleCreateRoom = (isSinglePlayer) => {
        const mode = isSinglePlayer ? "singlePlayer" : multiPlayerMode;
        const player = { id: userId, name: nickName };
        const data = { player, mode };
        mutateCreateRoom(data, {
            onSuccess: (data) => {
                const status = data.status;
                const roomId = data.roomId;
                if (status === "ok") {
                    socket.emit("createRoom", {
                        roomId,
                        player: { id: userId, name: nickName },
                        mode,
                    });
                    navigate(`/wordle/${roomId}`, {
                        state: { isSinglePlayer, isAuth: true },
                    });
                } else {
                }
            },
        });
    };

    const handleJoinRoom = (roomId) => {
        const player = { id: userId, name: nickName };
        const data = { player, roomId };
        mutateJoinRoom(data, {
            onSuccess: (data) => {
                const status = data.status;
                if (status === "ok") {
                    navigate(`/wordle/${roomId}`);
                } else {
                }
            },
        });
    };

    const handleChange = (event, mode) => {
        setMultiPlayerMode(mode);
    };

    const control = {
        value: multiPlayerMode,
        onChange: handleChange,
        exclusive: true,
    };

    const rows = rooms.map((room) => ({
        id: room.id,
        hostName: room.hostName || "Host",
        mode: room.mode,
        isSinglePlayer: room.isSinglePlayer,
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
                        disabled={multiPlayerMode === "twoPlayerServer"}
                        value="twoPlayerServer"
                        key="twoPlayerServer"
                    >
                        <ComputerIcon />
                    </ToggleButton>
                    ,
                    <ToggleButton
                        disabled={multiPlayerMode === "twoPlayerCustom"}
                        value="twoPlayerCustom"
                        key="twoPlayerCustom"
                    >
                        <GroupIcon />
                    </ToggleButton>
                    ]
                </ToggleButtonGroup>
            </div>
            <div className="mode-selection">
                <button
                    className="create-room-btn"
                    onClick={() => handleCreateRoom(true)}
                >
                    Single Player
                </button>
                <button
                    className="create-room-btn"
                    onClick={() => handleCreateRoom(false)}
                >
                    Two Players
                </button>
            </div>
            <RoomTable rows={rows} onJoin={handleJoinRoom} />
        </div>
    );
};

export default WaitingLobby;
