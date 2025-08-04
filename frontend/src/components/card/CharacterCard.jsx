import WaterDropIcon from "@mui/icons-material/WaterDrop";
import {
    CardContent,
    CardMedia,
    Grid,
    Rating,
    Typography,
} from "@mui/material";
import { Controller } from "react-hook-form";
import { GOLDEN_BACKGROUND } from "../../constants/colors";
import {
    CHARACTER_FACTION,
    COLOR_SCHEME_FACTION,
    COST,
} from "../../constants/constants";

const CharacterCard = ({ form, field, character, mode }) => {
    const { control } = form;
    const startColor = COLOR_SCHEME_FACTION[character.faction][0];
    const endColor = COLOR_SCHEME_FACTION[character.faction][1];
    const CostLogo = COST[character.cost]

    const Faction = ({ height, width }) => {
        return (
            <svg
                xmlns="http://www.w3.org/2000/svg"
                width={width}
                height={height}
                viewBox="0 0 50 50"
            >
                <defs>
                    <linearGradient
                        id={character.faction}
                        x1="0%"
                        y1="0%"
                        x2="100%"
                        y2="0%"
                    >
                        <stop offset="0%" style={{ stopColor: startColor }} />
                        <stop offset="100%" style={{ stopColor: endColor }} />
                    </linearGradient>
                </defs>
                <rect
                    x="-5"
                    y="30"
                    width={width * 0.8}
                    height={width * 0.8}
                    transform="rotate(45 50 50)"
                    fill={`url(#${character.faction})`}
                    stroke="white"
                    strokeWidth="1"
                />
                <text
                    x="25"
                    y="15"
                    textAnchor="middle"
                    alignmentBaseline="middle"
                    fontSize="12"
                    fill="white"
                    fontWeight="bold"
                >
                    {
                        CHARACTER_FACTION.find(
                            (faction) => faction.value === character.faction
                        ).label
                    }
                </text>
            </svg>
        );
    };

    return (
        <>
            <CardMedia
                component="img"
                sx={{
                    height: "75%",
                    background: `linear-gradient(to bottom, ${startColor}, ${endColor})`,
                    objectFit: "cover",
                }}
                // className="character-animation"
                image={`/img/characters/${character.faction}/${character.img.split("/").pop()}`}
                alt={character.name}
            />
            <CostLogo
                style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    color: 'white',
                    fontSize: 18,
                }}
            />
            <CardContent
                sx={{
                    height: "25%",
                    background: GOLDEN_BACKGROUND,
                    justifyContent: "center",
                    alignItems: "center",
                    padding: "4px 0px 0px",
                }}
            >
                <Grid container>
                    <Grid item xs={2}>
                        <Faction height={40} width={30} />
                    </Grid>
                    <Grid item xs={10}>
                        <Grid container direction="column" alignItems="center">
                            <Grid item display="flex" padding="1px 0px 2px 6px">
                                <Controller
                                    name={`${field}.rating`}
                                    defaultValue={character.rating}
                                    control={control}
                                    render={({ field }) => (
                                        <Rating
                                            readOnly={mode !== "character"}
                                            value={field.value}
                                            onChange={(event, newValue) => {
                                                field.onChange(newValue);
                                            }}
                                            emptyIcon={
                                                <WaterDropIcon
                                                    sx={{
                                                        transform:
                                                            "rotate(180deg)",
                                                        color: "#faaf00",
                                                        fontSize: 12,
                                                    }}
                                                />
                                            }
                                            icon={
                                                <WaterDropIcon
                                                    sx={{
                                                        transform:
                                                            "rotate(180deg)",
                                                        color: "red",
                                                        fontSize: 12,
                                                    }}
                                                />
                                            }
                                        />
                                    )}
                                />
                            </Grid>
                            <Grid item>
                                <Typography
                                    fontFamily="fantasy"
                                    fontWeight="bold"
                                    color="white"
                                    fontSize={8}
                                    letterSpacing={2}
                                >{`${character.name}`}</Typography>
                            </Grid>
                        </Grid>
                    </Grid>
                </Grid>
            </CardContent>
        </>
    );
};

export default CharacterCard;
