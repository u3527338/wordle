import { Button, Grid } from "@mui/material";
import _ from "lodash";
import { useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { useMySquadMutation } from "../../request/hook";
import SquadCard from "../card/SquadCard";
import MyCharacterModal from "../modal/MyCharacterModal";
import MySkillModal from "../modal/MySkillModal";
import { formatCharacterData } from "../../helper/function";
import NewSeasonModal from "../modal/NewSeasonModal";
import CustomSpeedDial from "../common/CustomSpeedDial";
import { useToastContext } from "../provider/ToastProvider";
import LoadingOverlay from "../common/LoadingOverlay";

const MySquadForm = ({ squads, characters, skills, refetch }) => {
    const squadId = squads._id;
    const squadForm = useForm({
        defaultValues: {
            ...squads,
            squads: formatCharacterData(squads.squads),
        },
    });
    const { control, register, handleSubmit, setValue } = squadForm;
    const fieldArray = useFieldArray({
        control,
        name: "squads",
    });
    const { fields, append, remove, update } = fieldArray;

    const { mutate, isPending } = useMySquadMutation();

    const [open, setOpen] = useState("");
    const [cardPosition, setCardPosition] = useState({
        squadIndex: 0,
        characterIndex: 0,
    });
    const [skillPosition, setSkillPosition] = useState(0);
    const [selected, setSelected] = useState(
        _.chain(fields)
            .flatMap("characters")
            .map("user_character.character_id")
            .compact()
            .value()
    );

    const { showToast } = useToastContext();

    const onSubmit = (data) => {
        const { squads, ...rest } = data;
        const formattedSquad = squads.map((squad) => {
            const { type, characters } = squad;
            return {
                type,
                characters: characters.map((character) => {
                    if (!character) return null;
                    const { user_character, skill_sets, book_sets, ...r } =
                        character;
                    return {
                        user_character: user_character?._id,
                        skill_sets: skill_sets.map(
                            (skill) => skill?.skill_id || null
                        ),
                        book_sets: book_sets.map((book) => book?._id || null),
                        ...r,
                    };
                }),
            };
        });
        const formattedData = {
            squads: formattedSquad,
            ...rest,
        };
        mutate(
            { id: squadId, ...formattedData },
            {
                onSettled: (res) => {
                    showToast({ status: res.status, detail: res.message });
                    if (res.status === "success") {
                        refetch();
                    }
                }
            }
        );
    };

    const handleAddSquad = () => {
        append({ type: "horse", characters: Array.from({ length: 3 }) });
    };

    const handleRemoveSquad = (index) => {
        remove(index);
    };

    const onCharacterSelectReady = (squadIndex, characterIndex) => {
        setCardPosition({ squadIndex, characterIndex });
        setOpen("character");
    };

    const onSkillSelectReady = (squadIndex, characterIndex, skillIndex) => {
        setCardPosition({ squadIndex, characterIndex });
        setSkillPosition(skillIndex);
        setOpen("skill");
    };

    const onCharacterSelected = (char) => {
        const { squadIndex, characterIndex } = cardPosition;
        const character = {
            user_character: char,
            rating: char.rating,
            self_skill: char.self_skill,
            book_options: char.book_options,
            hasTreasure: false,
            skill_sets: [null, null, null],
            book_sets: [null, null, null],
        };
        updateCharacter(character, squadIndex, characterIndex);
        setSelected((prev) => [...prev, char.character_info._id]);
        onClose();
    };

    const onRemoveCharacter = (char, si, ci) => {
        updateCharacter(null, si, ci);
        setSelected((prev) =>
            prev.filter((id) => id !== char.user_character.character_info._id)
        );
    };

    const updateCharacter = (char, si, ci) => {
        const targetChar = `squads[${si}].characters[${ci}]`;
        const updatedItems = [...fields];
        updatedItems[si].characters[ci] = char;
        update({ squads: updatedItems });
        setValue(targetChar, char);
        if (char !== null)
            setValue(`${targetChar}.skill_sets[0]`, {
                skill_id: char.self_skill._id,
                ...char.self_skill,
            });
    };

    const onSkillSelected = (skill) => {
        const { squadIndex, characterIndex } = cardPosition;
        const targetChar = `squads[${squadIndex}].characters[${characterIndex}]`;
        const updatedItems = [...fields];
        updatedItems[squadIndex].characters[characterIndex].skill_sets[
            skillPosition
        ] = skill;
        update({ squads: updatedItems });
        setValue(`${targetChar}.skill_sets[${skillPosition}]`, skill);
        onClose();
    };

    const onClose = () => {
        setOpen("");
    };

    const items = [
        {
            label: `儲存賽季陣容`,
            icon: "pi pi-save",
            command: handleSubmit(onSubmit),
        },
        {
            label: "新增劇本",
            icon: "pi pi-plus",
            command: () => {
                setOpen("season");
            },
        },
    ];

    const squadList = fields.length >= 10 ? fields : [...fields, null];

    return (
        <>
            {isPending && <LoadingOverlay />}
            <form>
                <Grid container spacing={2} pb={4}>
                    {squadList.map((squad, squadIndex) => (
                        <Grid item xs={12} md={6} key={squadIndex}>
                            <SquadCard
                                form={squadForm}
                                fieldArray={fieldArray}
                                squad={squad}
                                squadIndex={squadIndex}
                                onCharacterSelectReady={onCharacterSelectReady}
                                onSkillSelectReady={onSkillSelectReady}
                                onRemoveSquad={() =>
                                    handleRemoveSquad(squadIndex)
                                }
                                onRemoveCharacter={onRemoveCharacter}
                                addSquad={handleAddSquad}
                            />
                        </Grid>
                    ))}
                </Grid>
            </form>
            <MyCharacterModal
                open={open === "character"}
                onClose={onClose}
                characters={characters.filter(
                    (char) => !selected.includes(char.character_id._id)
                )}
                onClick={onCharacterSelected}
            />
            <MySkillModal
                open={open === "skill"}
                onClose={onClose}
                skills={skills}
                onClick={onSkillSelected}
            />
            <NewSeasonModal
                open={open === "season"}
                onClose={onClose}
                refetch={refetch}
            />
            <CustomSpeedDial items={items} />
        </>
    );
};

export default MySquadForm;
