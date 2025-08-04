import LockIcon from "@mui/icons-material/Lock";
import { Box, Button, Card, Input, Typography } from "@mui/material";
import Grid from "@mui/material/Grid";
import _ from "lodash";
import { BlockUI } from "primereact/blockui";
import { InputSwitch } from "primereact/inputswitch";
import { Menu } from "primereact/menu";
import { Panel } from "primereact/panel";
import { useRef, useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { useStore } from "../../hook/useStore";
import { useMySkillMutation } from "../../request/hook";
import { groupSkills } from "../../helper/function";
import SkillCard from "../card/SkillCard";
import { SKILL_CATEGORY } from "../../constants/constants";
import FilterInput from "../forminput/FilterInput";
import { useToastContext } from "../provider/ToastProvider";
import LoadingOverlay from "../common/LoadingOverlay";

const CardEdit = ({ skill, form, mode, onClick }) => {
    const { originalIndex, ...s } = skill;
    const { register, setValue } = form;
    const [blocked, setBlocked] = useState(!skill.is_active);

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
                    {...register(`skills[${originalIndex}].skill_id`)}
                    value={s.skill_id}
                />
                <SkillCard
                    skill={s}
                    onClick={mode === "character" ? onClick : () => onClick(s)}
                />
            </BlockUI>
            {mode !== "squad" && (
                <Grid container justifyContent="center">
                    <Grid item>
                        <InputSwitch
                            checked={!blocked}
                            onChange={(e) => {
                                setBlocked(!e.value);
                                setValue(
                                    `skills[${originalIndex}].is_active`,
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

export const MySkillForm = ({ skills, mode = "character", onClick }) => {
    const [filter, setFilter] = useState("");
    const configMenu = useRef(null);
    const { mutate, isPending } = useMySkillMutation();
    const { userId } = useStore();
    const displaySkills = groupSkills(
        skills
            .filter((s) =>
                s.skill_id.name?.toUpperCase().includes(filter.toUpperCase())
            )
            .filter((s) => !s.skill_id.hasOwner || s.skill_id.type === "arms")
    );
    const headerTemplate = (options, type) => {
        const className = `${options.className} justify-content-space-between`;

        return (
            <div className={className}>
                <div className="flex align-items-center">
                    <Typography fontWeight="900">{type}</Typography>
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
        defaultValues: displaySkills,
    });
    const { control, register, handleSubmit, setValue } = form;

    const fieldArray = useFieldArray({
        control,
        name: "skills",
    });

    const { showToast } = useToastContext();

    const onSubmit = (data) => {
        const formatData = data.skills.map((skill) => ({
            ...skill,
            user_id: userId,
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
            <form onSubmit={handleSubmit(onSubmit)}>
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
                {displaySkills.map((panel, i) => {
                    return (
                        <Panel
                            key={i}
                            headerTemplate={(options) =>
                                headerTemplate(
                                    options,
                                    SKILL_CATEGORY.find(
                                        (skill) => skill.value === panel.type
                                    ).label
                                )
                            }
                            toggleable
                        >
                            <Grid
                                container
                                rowSpacing={2}
                                columns={10}
                                spacing={1}
                            >
                                {panel.skills?.map((skill, i) => {
                                    return (
                                        <Grid key={i} item xs={1}>
                                            <CardEdit
                                                skill={skill}
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
