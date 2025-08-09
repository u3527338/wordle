import { Box } from "@mui/material";
import WordleGrid from "./WordleGrid";
import UserInfo from "./UserInfo"; // import your user info component

const WordleGridsContainer = ({ grids }) => {
    return (
        <Box
            sx={{
                display: "flex",
                flexDirection: "row",
                justifyContent: "center",
                alignItems: "center",
                gap: 2,
                height: "auto",
                margin: "auto",
                "@media(max-width: 800px)": {
                    flexDirection: "column-reverse !important",
                },
            }}
        >
            {grids.map((grid, index) => (
                <Box
                    key={index}
                    sx={{
                        display: "flex",
                        flexDirection:
                            grids.length === 1
                                ? "column"
                                : index === 0
                                ? "row"
                                : "row-reverse",
                        gap: 1,
                        padding: 1,
                        paddingLeft: 2,
                        paddingRight: 2,
                        backgroundColor: "#fff",
                        width: "90%",
                        background: "transparent",
                        "@media(max-width: 400px)": {
                            flexDirection:
                                grids.length === 1
                                    ? "column !important"
                                    : index === 0
                                    ? "row"
                                    : "row-reverse",
                        },
                    }}
                >
                    <UserInfo
                        player={grid.player}
                        flexDirection={grids.length === 1 ? "row" : "column"}
                    />
                    <WordleGrid
                        guesses={grid.guesses}
                        currentGuess={grid.currentGuess}
                        shakeRow={grid.shakeRow}
                        gridCount={grids.length}
                    />
                </Box>
            ))}
        </Box>
    );
};

export default WordleGridsContainer;
