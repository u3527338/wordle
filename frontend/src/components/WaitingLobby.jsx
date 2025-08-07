import ComputerIcon from "@mui/icons-material/Computer";
import PeopleIcon from "@mui/icons-material/People";
import PersonIcon from "@mui/icons-material/Person";
import {
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
import MyButton from "./common/MyButton";
import { generateUUID } from "../constants/helper.js";

const modes = {
    singlePlayer: <PersonIcon />,
    twoPlayerServer: <ComputerIcon />,
    twoPlayerCustom: <PeopleIcon />,
};

const RoomTable = ({ rows, onJoin }) => {
    const hasRecords = rows && rows.length > 0;
    const headings = ["Host", "Mode", "Players", "Status"];
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
                                    {/* <Cell value={row.id} /> */}
                                    <Cell value={row.hostPlayer?.name} />
                                    <Cell value={modes[row.mode]} />
                                    <Cell
                                        value={`${row.players.length} / ${maxPlayer}`}
                                    />
                                    <Cell
                                        value={
                                            row.players.length >= maxPlayer ? (
                                                <Typography>
                                                    {row.status}
                                                </Typography>
                                            ) : (
                                                <MyButton
                                                    onClick={() =>
                                                        onJoin(row.id)
                                                    }
                                                >
                                                    Join
                                                </MyButton>
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
    const [gameMode, setGameMode] = useState("singlePlayer");
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

    const handleCreateRoom = () => {
        const isSinglePlayer = gameMode === "singlePlayer";
        const player = { id: userId, name: nickName };
        const data = { player, mode: gameMode };
        const roomId = generateUUID();
        socket.emit("createRoom", {
            roomId,
            player: { id: userId, name: nickName },
            mode: gameMode,
        });
        navigate(`/wordle/${roomId}`, {
            state: { isSinglePlayer },
        });
        // mutateCreateRoom(data, {
        //     onSuccess: (data) => {
        //         const status = data.status;
        //         const roomId = data.roomId;
        //         if (status === "ok") {
        //             socket.emit("createRoom", {
        //                 roomId,
        //                 player: { id: userId, name: nickName },
        //                 mode: gameMode,
        //             });
        //             navigate(`/wordle/${roomId}`, {
        //                 state: { isSinglePlayer },
        //             });
        //         } else {
        //         }
        //     },
        // });
    };

    const handleJoinRoom = (roomId) => {
        const player = { id: userId, name: nickName };
        const data = { player, roomId };
        navigate(`/wordle/${roomId}`);
        // mutateJoinRoom(data, {
        //     onSuccess: (data) => {
        //         const status = data.status;
        //         if (status === "ok") {
        //             navigate(`/wordle/${roomId}`);
        //         } else {
        //         }
        //     },
        // });
    };

    const handleChange = (event, mode) => {
        setGameMode(mode);
    };

    const control = {
        value: gameMode,
        onChange: handleChange,
        exclusive: true,
    };

    const rows = rooms.map((room) => ({
        id: room.id,
        hostPlayer: room.hostPlayer || room.players[0],
        mode: room.mode,
        isSinglePlayer: room.isSinglePlayer,
        players: room.players,
        status: room.status,
    }));

    return (
        <div className="lobby-container">
            <div className="mode-selection">
                <ToggleButtonGroup
                    size="small"
                    {...control}
                    aria-label="Small sizes"
                >
                    {Object.entries(modes).map(([key, value]) => (
                        <ToggleButton
                            disabled={gameMode === key}
                            value={key}
                            key={key}
                        >
                            {value}
                        </ToggleButton>
                    ))}
                </ToggleButtonGroup>
            </div>
            <div className="mode-selection">
                <MyButton onClick={handleCreateRoom}>Create Room</MyButton>
            </div>
            <RoomTable rows={rows} onJoin={handleJoinRoom} />
        </div>
    );
};

export default WaitingLobby;
