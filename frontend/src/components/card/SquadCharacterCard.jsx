import AddIcon from "@mui/icons-material/Add";
import { Box, Button, Typography } from "@mui/material";
import { ATTRIBUTES, COLOR_SCHEME_FACTION } from "../../constants/constants.js";
import CustomTooltip from "../common/CustomTooltip.jsx";
import { CardContainer } from "../container/CardContainer.jsx";
import CharacterCard from "./CharacterCard";

export const SquadCharacterCard = ({
    form,
    character,
    characterIndex,
    squadIndex,
    onCharacterSelectReady,
}) => {
    const startColor = character
        ? COLOR_SCHEME_FACTION[character.user_character.faction][0]
        : "transparent";

    const className = character
        ? `character-info-${character?.user_character?._id}`
        : null;
    return (
        <>
            {character ? (
                <>
                    <CardContainer
                        hasCharacter
                        editable
                        startColor={startColor}
                        className={className}
                    >
                        <CharacterCard
                            form={form}
                            character={character.user_character}
                            characterIndex={characterIndex}
                            squadIndex={squadIndex}
                            field={`squads[${squadIndex}].characters[${characterIndex}]`}
                        />
                    </CardContainer>
                    <CustomTooltip className={`.${className}`}>
                        {Object.entries(
                            character?.user_character?.attributes
                        )?.map(([key, value], i) => {
                            return (
                                <Box
                                    key={i}
                                    display="flex"
                                    color="white"
                                    paddingY="1px"
                                    gap="4px"
                                >
                                    <Typography fontSize={8} fontWeight="bold">
                                        {
                                            ATTRIBUTES.find(
                                                (a) => a.value === key
                                            ).label
                                        }
                                    </Typography>
                                    <Typography fontSize={8} fontWeight="bold">
                                        {value.original}
                                    </Typography>
                                    <Typography
                                        fontSize={8}
                                        fontWeight="bold"
                                        color="lightgreen"
                                    >
                                        {`(+${value.growth})`}
                                    </Typography>
                                </Box>
                            );
                        })}
                    </CustomTooltip>
                </>
            ) : (
                <CardContainer
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    backgroundColor="grey"
                    editable
                    startColor={startColor}
                >
                    <Button
                        onClick={onCharacterSelectReady}
                        sx={{
                            width: "100%",
                            height: "100%",
                            backgroundColor: "transparent",
                            color: "orange",
                        }}
                    >
                        <AddIcon fontSize="small" />
                    </Button>
                </CardContainer>
            )}
        </>
    );
};
