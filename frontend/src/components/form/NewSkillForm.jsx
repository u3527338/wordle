import { Button, Checkbox, FormControlLabel, Grid, TextField, Typography } from "@mui/material";
import { useState } from "react";
import { useForm } from "react-hook-form";
import {
    ARM_CATEGORY,
    QUALITY,
    SKILL_CATEGORY,
} from "../../constants/constants";
import { useCreateSkillMutation } from "../../request/hook";
import { FormWrapper } from "../common/FormWrapper";
import { SelectInput } from "../forminput/SelectInput";

export const NewSkillForm = () => {
    const { mutate } = useCreateSkillMutation();
    const {
        register,
        handleSubmit,
        watch,
        formState: { errors },
    } = useForm();
    const [message, setMessage] = useState(null);
    const onSubmit = (data) => {
        mutate(data, {
            onSuccess: (res) => {
                setMessage(res.message);
            },
            onError: (err) => {
                setMessage("新增戰法失敗"); // Handle error
            },
        });
    };

    return (
        <FormWrapper>
            <form onSubmit={handleSubmit(onSubmit)}>
                <Typography variant="h6" gutterBottom>
                    新增戰法
                </Typography>
                <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                        <TextField
                            required
                            label="戰法"
                            fullWidth
                            autoComplete="name"
                            {...register("name")}
                        />
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <SelectInput
                            required
                            label="類別"
                            options={SKILL_CATEGORY}
                            register={register}
                            id="type"
                        />
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <SelectInput
                            required
                            label="級別"
                            options={QUALITY}
                            register={register}
                            id="quality"
                        />
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <SelectInput
                            required
                            label="適性"
                            options={ARM_CATEGORY.filter(
                                (c) => c.value !== "navy"
                            )}
                            register={register}
                            id="allowance"
                            multiple
                        />
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <TextField
                            required
                            label="發動機率(%)"
                            fullWidth
                            inputProps={{ type: "number" }}
                            {...register("probability")}
                        />
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <TextField
                            label="發動機率(max%)"
                            fullWidth
                            inputProps={{ type: "number" }}
                            {...register("probability_max")}
                        />
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <FormControlLabel
                            control={
                                <Checkbox
                                    color="secondary"
                                    name="hasOwner"
                                    value={true}
                                    {...register("hasOwner")}
                                />
                            }
                            label="自帶戰法"
                        />
                    </Grid>
                    <Grid item xs={12} md={12}>
                        <TextField
                            required
                            label="戰法說明"
                            fullWidth
                            {...register("description")}
                        />
                    </Grid>
                </Grid>
                <Button type="submit">確定</Button>
                {message && <Typography>{message}</Typography>}
            </form>
        </FormWrapper>
    );
};
