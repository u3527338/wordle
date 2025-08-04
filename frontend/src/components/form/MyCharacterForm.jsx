import LockIcon from "@mui/icons-material/Lock";
import { Box, Button, Input, Typography } from "@mui/material";
import Grid from "@mui/material/Grid";
import { BlockUI } from "primereact/blockui";
import { InputSwitch } from "primereact/inputswitch";
import { Menu } from "primereact/menu";
import { Panel } from "primereact/panel";
import { useRef, useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import {
    CHARACTER_FACTION,
    COLOR_SCHEME_FACTION,
} from "../../constants/constants";
import { groupCharacters } from "../../helper/function";
import { useStore } from "../../hook/useStore";
import { useMyCharacterMutation } from "../../request/hook";
import CharacterCard from "../card/CharacterCard";
import LoadingOverlay from "../common/LoadingOverlay";
import { CardContainer } from "../container/CardContainer";
import FilterInput from "../forminput/FilterInput";
import { useToastContext } from "../provider/ToastProvider";

const CardEdit = ({ character, form, mode, onClick }) => {
    const { originalIndex, ...c } = character;
    const { register, setValue } = form;
    const [blocked, setBlocked] = useState(!character.is_active);

    return (
        <Box display="ruby">
            <BlockUI
                baseZIndex={100}
                blocked={blocked}
                containerStyle={{ color: "white" }}
                template={<LockIcon fontSize="large" />}
            >
                <Input
                    sx={{ display: "none" }}
                    {...register(`characters[${originalIndex}].character_id`)}
                    value={c.character_info._id}
                />
                <CardContainer
                    hasCharacter
                    startColor={COLOR_SCHEME_FACTION[character.faction][0]}
                    cursor="pointer"
                    onClick={mode === "character" ? onClick : () => onClick(c)}
                >
                    <CharacterCard
                        character={c}
                        form={form}
                        field={`characters.${originalIndex}`}
                        mode={mode}
                    />
                </CardContainer>
            </BlockUI>
            {mode !== "squad" && (
                <Grid container justifyContent="center">
                    <Grid item>
                        <InputSwitch
                            checked={!blocked}
                            onChange={(e) => {
                                setBlocked(!e.value);
                                setValue(
                                    `characters[${originalIndex}].is_active`,
                                    e.value
                                );
                            }}
                        />
                    </Grid>
                </Grid>
            )}
        </Box>
    );
};

export const MyCharacterForm = ({
    characters,
    mode = "character",
    onClick,
}) => {
    const [filter, setFilter] = useState("");
    const configMenu = useRef(null);
    const { mutate, isPending } = useMyCharacterMutation();
    const { userId } = useStore();
    const displayCharacters = groupCharacters(characters).map((f) => {
        return {
            faction: f.faction,
            characters: f.characters.filter((c) =>
                c.character_info.name
                    ?.toUpperCase()
                    .includes(filter.toUpperCase())
            ),
        };
    });
    const headerTemplate = (options, faction) => {
        const className = `${options.className} justify-content-space-between`;

        return (
            <div className={className}>
                <div className="flex align-items-center">
                    <Typography fontWeight="900">{faction}</Typography>
                </div>
                <div>
                    <Menu ref={configMenu} id="config_menu" />
                    <button
                        className="p-panel-header-icon p-link mr-2"
                        onClick={(e) => configMenu?.current?.toggle(e)}
                    >
                        <span className="pi pi-cog"></span>
                    </button>
                    {options.togglerElement}
                </div>
            </div>
        );
    };
    const form = useForm({
        defaultValues: displayCharacters,
    });

    const { control, register, handleSubmit, setValue } = form;

    const fieldArray = useFieldArray({
        control,
        name: "characters",
    });

    const { showToast } = useToastContext();

    const onSubmit = (data) => {
        const formatData = data.characters.map((char) => ({
            user_id: userId,
            ...char,
        }));
        mutate(formatData, {
            onSettled: (res) => {
                showToast({ status: res.status, detail: res.message });
            },
        });
    };

    return (
        <>
            {isPending && <LoadingOverlay />}
            <form
                onSubmit={handleSubmit(onSubmit)}
                style={{
                    paddingBottom: "20px",
                }}
            >
                <Box
                    sx={{ margin: "10px 0px 15px 0px" }}
                    display="flex"
                    justifyContent="space-between"
                >
                    {mode === "character" && (
                        <Button
                            variant="contained"
                            sx={{
                                height: "fit-content",
                            }}
                            size="small"
                            type="submit"
                        >
                            儲存
                        </Button>
                    )}
                    <FilterInput onChange={(e) => setFilter(e.target.value)} />
                </Box>
                {displayCharacters.map((panel, i) => {
                    return (
                        <Panel
                            key={i}
                            headerTemplate={(options) =>
                                headerTemplate(
                                    options,
                                    CHARACTER_FACTION.find(
                                        (faction) =>
                                            faction.value === panel.faction
                                    ).label
                                )
                            }
                            toggleable
                        >
                            <Grid
                                container
                                rowSpacing={2}
                                columns={10}
                                spacing={0.2}
                            >
                                {panel.characters?.map((character, i) => {
                                    return (
                                        <Grid
                                            item
                                            xs={1}
                                            key={i}
                                            sx={{
                                                "&:hover": {
                                                    zIndex: i + 2,
                                                },
                                            }}
                                        >
                                            <CardEdit
                                                character={character}
                                                form={form}
                                                mode={mode}
                                                onClick={onClick}
                                            />
                                        </Grid>
                                    );
                                })}
                            </Grid>
                        </Panel>
                    );
                })}
            </form>
        </>
    );
};
