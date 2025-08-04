import AddIcon from "@mui/icons-material/Add";
import {
    Button,
    Card,
    CardContent,
    Chip,
    Grid,
    Stack,
    Typography,
} from "@mui/material";
import _ from "lodash";
import { InputIcon } from "primereact/inputicon";
import { BiSolidUpArrowCircle } from "react-icons/bi";
import { PiBookFill, PiBookLight } from "react-icons/pi";
import {
    CHARACTER_INFO_BACKGROUND,
    SQUAD_CARD_BACKGROUND,
} from "../../constants/colors";
import {
    ARM_CATEGORY,
    COLOR_SCHEME_QUALITY,
    QUALITY,
} from "../../constants/constants";
import {
    CHARACTER_CARD_WIDTH,
    SQUAD_CARD_HEIGHT,
} from "../../constants/values";
import BookContainer from "../container/BookContainer";
import ButtonList from "../forminput/ButtonList";
import Checkbox from "../forminput/Checkbox";
import { SquadCharacterCard } from "./SquadCharacterCard";

const EmptySquadCard = ({ addSquad }) => {
    return (
        <Card
            style={{
                width: "100%",
                height: SQUAD_CARD_HEIGHT,
                border: `2px dashed ${SQUAD_CARD_BACKGROUND}`,
                backgroundColor: "rgba(255,255,255,0.4)",
            }}
        >
            <Button
                onClick={addSquad}
                sx={{
                    width: "100%",
                    height: "100%",
                    color: SQUAD_CARD_BACKGROUND,
                }}
            >
                <AddIcon fontSize="small" />
            </Button>
        </Card>
    );
};

const SquadCard = ({
    form,
    fieldArray,
    squad,
    squadIndex,
    onCharacterSelectReady,
    onSkillSelectReady,
    onRemoveSquad,
    onRemoveCharacter,
    addSquad,
}) => {
    const { setValue, getValues, watch } = form;
    const { fields, update } = fieldArray;

    if (!squad) return <EmptySquadCard addSquad={addSquad} />;

    const totalCost = _.sum(
        squad.characters.map(
            (character) => character?.user_character?.cost || 0
        )
    );

    const options = [
        { value: true, icon: <PiBookFill /> },
        { value: false, icon: <PiBookLight /> },
    ];

    return (
        <Card
            style={{
                backgroundColor: SQUAD_CARD_BACKGROUND,
                height: SQUAD_CARD_HEIGHT,
            }}
        >
            <CardContent sx={{ padding: "4px 8px" }}>
                <Grid alignItems="center" paddingY={1} container>
                    <Grid item xs={4}>
                        <ButtonList
                            form={form}
                            id={`squads[${squadIndex}].type`}
                            options={ARM_CATEGORY.filter(
                                (a) =>
                                    a.value !== "engine" && a.value !== "navy"
                            )}
                            onChange={(e) => {
                                setValue(`squads[${squadIndex}].type`, e);
                                const updatedItems = [...fields];
                                updatedItems[squadIndex].type = e;
                                update({ squads: updatedItems });
                            }}
                        />
                    </Grid>
                    <Grid item xs={4} display="flex" justifyContent="center">
                        <Typography
                            color={totalCost > 20 ? "red" : "white"}
                            fontSize={12}
                            fontWeight="bold"
                        >{`${totalCost} / 20`}</Typography>
                    </Grid>
                    <Grid item xs={4} display="flex" justifyContent="end">
                        <Button
                            sx={{
                                fontSize: "12px",
                                width: "fit-content",
                                color: "white",
                                alignSelf: "flex-start",
                            }}
                            onClick={onRemoveSquad}
                        >
                            <InputIcon className="pi pi-minus-circle" />
                        </Button>
                    </Grid>
                </Grid>
                <Grid container spacing={1}>
                    {squad.characters?.map((character, characterIndex) => {
                        const onRemoveSkill = (skillIndex) => {
                            const targetSkill = `squads[${squadIndex}].characters[${characterIndex}].skill_sets[${skillIndex}]`;
                            const updatedItems = [...fields];
                            updatedItems[squadIndex].characters[
                                characterIndex
                            ].skill_sets[skillIndex] = null;
                            update({ squads: updatedItems });
                            setValue(targetSkill, null);
                        };
                        const [armType, treasureEquiped] = getValues([
                            `squads[${squadIndex}].type`,
                            `squads[${squadIndex}].characters[${characterIndex}].hasTreasure`,
                        ]);
                        const armLabel = ARM_CATEGORY.find(
                            (c) => c.value === armType
                        ).label;
                        const proficiencyIndex = QUALITY.findIndex(
                            (q) =>
                                q.value ===
                                character?.user_character?.arms[armType]
                        );
                        const proficiency =
                            QUALITY[
                                treasureEquiped
                                    ? proficiencyIndex - 1
                                    : proficiencyIndex
                            ]?.value;
                        const color = proficiency
                            ? COLOR_SCHEME_QUALITY[proficiency][0]
                            : "white";
                        return (
                            <Grid
                                item
                                key={characterIndex}
                                xs={12}
                                sm={4}
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    columnGap: "12px",
                                }}
                                zIndex={characterIndex}
                            >
                                <Grid container spacing={1}>
                                    <Grid display="flex" item xs={12}>
                                        <Chip
                                            size="small"
                                            variant="contained"
                                            label={`${
                                                characterIndex === 0
                                                    ? "主"
                                                    : "副"
                                            }將`}
                                            sx={{
                                                width: "100%",
                                                letterSpacing: 4,
                                                color: "white",
                                            }}
                                            onDelete={() => {}}
                                            deleteIcon={
                                                <>
                                                    {character && (
                                                        <Chip
                                                            onClick={() => {
                                                                onRemoveCharacter(
                                                                    character,
                                                                    squadIndex,
                                                                    characterIndex
                                                                );
                                                            }}
                                                            variant="outlined"
                                                            sx={{
                                                                position:
                                                                    "absolute",
                                                                right: 0,
                                                                padding:
                                                                    "2px 2px 2px 6px",
                                                                color: "white !important",
                                                                fontSize:
                                                                    "10px",
                                                                border: "1px solid white",
                                                                borderRadius:
                                                                    "4px",
                                                                backgroundColor:
                                                                    "rgba(75, 65, 60, 1)",
                                                                "&:hover": {
                                                                    borderColor:
                                                                        "orange",
                                                                    backgroundColor:
                                                                        "darkorange !important",
                                                                },
                                                            }}
                                                            label="下陣"
                                                        />
                                                    )}
                                                </>
                                            }
                                        />
                                    </Grid>
                                    <Grid
                                        item
                                        xs={12}
                                        display="flex"
                                        columnGap={0.5}
                                        justifyContent="space-between"
                                    >
                                        <Grid minWidth={CHARACTER_CARD_WIDTH}>
                                            <SquadCharacterCard
                                                form={form}
                                                fieldArray={fieldArray}
                                                character={character}
                                                squadIndex={squadIndex}
                                                characterIndex={characterIndex}
                                                onCharacterSelectReady={() =>
                                                    onCharacterSelectReady(
                                                        squadIndex,
                                                        characterIndex
                                                    )
                                                }
                                            />
                                        </Grid>
                                        <Card
                                            sx={{
                                                p: 0.5,
                                                height: "100%",
                                                width: "100%",
                                                background:
                                                    CHARACTER_INFO_BACKGROUND,
                                            }}
                                        >
                                            <Stack
                                                direction="column"
                                                spacing={0.5}
                                            >
                                                <Chip
                                                    size="small"
                                                    sx={{
                                                        fontSize: "10px",
                                                        fontWeight: "bold",
                                                        border: `1px solid`,
                                                        background: proficiency
                                                            ? treasureEquiped
                                                                ? "bisque"
                                                                : COLOR_SCHEME_QUALITY[
                                                                      proficiency
                                                                  ][1]
                                                            : proficiencyIndex ==
                                                                  0 &&
                                                              treasureEquiped
                                                            ? "red"
                                                            : "transparent",
                                                        color: color,
                                                    }}
                                                    label={`${armLabel}${
                                                        proficiency || ""
                                                    }`}
                                                    deleteIcon={
                                                        <BiSolidUpArrowCircle
                                                            style={{
                                                                fontSize:
                                                                    "14px",
                                                                color: color,
                                                            }}
                                                        />
                                                    }
                                                    onDelete={
                                                        treasureEquiped
                                                            ? () => {}
                                                            : null
                                                    }
                                                    variant="outlined"
                                                />
                                                <BookContainer
                                                    form={form}
                                                    character={character}
                                                    squadIndex={squadIndex}
                                                    characterIndex={
                                                        characterIndex
                                                    }
                                                />
                                                {!!character && (
                                                    <Checkbox
                                                        id={`squads[${squadIndex}].characters[${characterIndex}].hasTreasure`}
                                                        form={form}
                                                        onChange={(e) => {
                                                            setValue(
                                                                `squads[${squadIndex}].characters[${characterIndex}].hasTreasure`,
                                                                e
                                                            );
                                                            const updatedItems =
                                                                [...fields];
                                                            updatedItems[
                                                                squadIndex
                                                            ].type = e;
                                                            update({
                                                                squads: updatedItems,
                                                            });
                                                        }}
                                                        options={options}
                                                        disabled={
                                                            proficiencyIndex <=
                                                                0 &&
                                                            !treasureEquiped
                                                        }
                                                    />
                                                )}
                                            </Stack>
                                        </Card>
                                    </Grid>
                                    <Grid item xs={12}>
                                        <Card
                                            sx={{
                                                p: 0.5,
                                                background:
                                                    CHARACTER_INFO_BACKGROUND,
                                                color: "white",
                                                fontColor: "white",
                                            }}
                                        >
                                            <Stack
                                                direction="column"
                                                spacing={0.5}
                                                fontWeight="bold"
                                            >
                                                {[
                                                    "自帶戰法",
                                                    "戰法一",
                                                    "戰法二",
                                                ].map((skill, skillIndex) => {
                                                    const assignedSkill =
                                                        character?.skill_sets[
                                                            skillIndex
                                                        ]?.name;
                                                    return (
                                                        <Chip
                                                            size="small"
                                                            key={skillIndex}
                                                            // color="warning"
                                                            variant="outlined"
                                                            label={
                                                                assignedSkill ||
                                                                skill
                                                            }
                                                            sx={{
                                                                fontSize:
                                                                    "12px",
                                                                letterSpacing: 6,
                                                                color: `rgba(255, 255, 255, ${
                                                                    assignedSkill
                                                                        ? 1
                                                                        : 0.5
                                                                })`,
                                                                borderColor:
                                                                    "rgba(255,255,255,0.3)",
                                                            }}
                                                            onClick={
                                                                skillIndex === 0
                                                                    ? null
                                                                    : () => {
                                                                          onSkillSelectReady(
                                                                              squadIndex,
                                                                              characterIndex,
                                                                              skillIndex
                                                                          );
                                                                      }
                                                            }
                                                            onDelete={
                                                                !assignedSkill ||
                                                                skillIndex === 0
                                                                    ? null
                                                                    : () => {
                                                                          onRemoveSkill(
                                                                              skillIndex
                                                                          );
                                                                      }
                                                            }
                                                        />
                                                    );
                                                })}
                                            </Stack>
                                        </Card>
                                    </Grid>
                                </Grid>
                            </Grid>
                        );
                    })}
                </Grid>
            </CardContent>
        </Card>
    );
};

export default SquadCard;
