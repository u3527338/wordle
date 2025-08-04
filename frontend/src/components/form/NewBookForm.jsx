import {
    Button,
    Checkbox,
    FormControlLabel,
    Grid,
    TextField,
    Typography
} from "@mui/material";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { BOOK_CATEGORY } from "../../constants/constants";
import { useCreateBookMutation } from "../../request/hook";
import { FormWrapper } from "../common/FormWrapper";
import { SelectInput } from "../forminput/SelectInput";

export const NewBookForm = () => {
    const { mutate } = useCreateBookMutation();
    const {
        register,
        handleSubmit,
        watch,
        formState: { errors },
    } = useForm();
    const [message, setMessage] = useState(null);
    const onSubmit = (data) => {
        mutate(
            {
                isParent: data.isParent === "true" ? true : false,
                ...data,
            },
            {
                onSuccess: (res) => {
                    setMessage(res.message);
                },
                onError: (err) => {
                    setMessage("新增兵書失敗"); // Handle error
                },
            }
        );
    };

    return (
        <FormWrapper>
            <form onSubmit={handleSubmit(onSubmit)}>
                <Typography variant="h6" gutterBottom>
                    新增兵書
                </Typography>
                <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                        <TextField
                            required
                            label="兵書"
                            fullWidth
                            autoComplete="name"
                            {...register("name")}
                        />
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <SelectInput
                            required
                            label="類別"
                            options={BOOK_CATEGORY}
                            register={register}
                            id="category"
                        />
                    </Grid>
                    <Grid item xs={12} md={12}>
                        <TextField
                            required
                            label="效果"
                            fullWidth
                            {...register("description")}
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <FormControlLabel
                            control={
                                <Checkbox
                                    color="secondary"
                                    name="isParent"
                                    value={true}
                                    {...register("isParent")}
                                />
                            }
                            label="主兵書"
                        />
                    </Grid>
                </Grid>
                <Button type="submit">確定</Button>
                {message && <Typography>{message}</Typography>}
            </form>
        </FormWrapper>
    );
};
