import {
    Button,
    Grid,
    Input,
    InputLabel,
    TextField,
    Typography,
} from "@mui/material";
import { useState } from "react";
import { useForm } from "react-hook-form";
import {
    ARM_CATEGORY,
    ATTRIBUTES,
    CHARACTER_FACTION,
    QUALITY,
} from "../../constants/constants";
import { uploadImage } from "../../request/api";
import {
    useBookQuery,
    useCreateCharacterMutation,
    useSkillQuery,
    useUploadS3ImageMutation,
} from "../../request/hook";
import { FormWrapper } from "../common/FormWrapper";
import LoadingOverlay from "../common/LoadingOverlay";
import { SelectInput } from "../forminput/SelectInput";

const NewCharacterForm = () => {
    const { mutate: createCharacter, isPending: createCharacterPending } =
        useCreateCharacterMutation();
    const { mutate: uploadS3Image, isPending: uploadS3ImagePending } =
        useUploadS3ImageMutation();
    const { data: bookData, isFetching: isBookFetching } = useBookQuery();
    const { data: skillData, isFetching: isSkillFetching } = useSkillQuery();

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm();
    const [message, setMessage] = useState(null);
    const onSubmit = async (data) => {
        uploadS3Image(data.img[0], {
            onSuccess: (imageUrl) => {
                createCharacter(
                    {
                        ...data,
                        img: imageUrl,
                    },
                    {
                        onSuccess: (res) => {
                            setMessage(res.message);
                        },
                        onError: (err) => {
                            setMessage("新增武將失敗"); // Handle error
                        },
                    }
                );
            },
            onError: (err) => {
                setMessage("新增武將失敗"); // Handle error
            },
        });
    };

    if (
        isBookFetching ||
        isSkillFetching ||
        createCharacterPending ||
        uploadS3ImagePending
    )
        return <LoadingOverlay />;

    const SKILL_OPTIONS = skillData?.data?.map((b, i) => ({
        label: b.name,
        value: b._id,
    }));
    const BOOK_OPTIONS = bookData?.data?.map((b, i) => ({
        label: b.name,
        value: b._id,
    }));

    return (
        <FormWrapper>
            <form onSubmit={handleSubmit(onSubmit)}>
                <Typography variant="h6" gutterBottom>
                    新增武將
                </Typography>
                <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                        <TextField
                            required
                            label="名字"
                            fullWidth
                            autoComplete="name"
                            {...register("name")}
                        />
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <SelectInput
                            required
                            label="陣營"
                            options={CHARACTER_FACTION}
                            register={register}
                            id="faction"
                        />
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <Typography paddingBottom={2}>兵種適性</Typography>
                        <Grid container spacing={2}>
                            {ARM_CATEGORY.map((c, i) => (
                                <Grid key={i} item xs={12} md={6}>
                                    <SelectInput
                                        required
                                        label={c.label}
                                        options={QUALITY}
                                        register={register}
                                        id={`arms.${c.value}`}
                                    />
                                </Grid>
                            ))}
                        </Grid>
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <Typography paddingBottom={2}>個人數值</Typography>
                        <Grid container spacing={2}>
                            {ATTRIBUTES.map((c, i) => (
                                <Grid item key={i} xs={12} md={2}>
                                    <div>
                                        <InputLabel
                                            htmlFor={`attributes.${c.value}.original`}
                                        >
                                            {c.label}
                                        </InputLabel>
                                        <Input
                                            fullWidth
                                            required
                                            type="number"
                                            inputProps={{ step: "0.01" }}
                                            {...register(
                                                `attributes.${c.value}.original`
                                            )}
                                        />
                                    </div>
                                    <div>
                                        <InputLabel
                                            htmlFor={`attributes.${c.value}.growth`}
                                        >
                                            {`${c.label}成長`}
                                        </InputLabel>
                                        <Input
                                            fullWidth
                                            required
                                            type="number"
                                            inputProps={{ step: "0.01" }}
                                            {...register(
                                                `attributes.${c.value}.growth`
                                            )}
                                        />
                                    </div>
                                </Grid>
                            ))}
                        </Grid>
                    </Grid>
                    <Grid item xs={6}>
                        <SelectInput
                            // required
                            label="自帶戰法"
                            options={SKILL_OPTIONS}
                            register={register}
                            id="self_skill"
                        />
                    </Grid>
                    <Grid item xs={6}>
                        <SelectInput
                            multiple
                            // required
                            label="可㩦兵書"
                            options={BOOK_OPTIONS}
                            register={register}
                            id="book_options"
                        />
                    </Grid>
                    <Grid item xs={2}>
                        <TextField
                            required
                            label="Cost"
                            fullWidth
                            inputProps={{ type: "number" }}
                            {...register("cost")}
                        />
                    </Grid>
                    <Grid item xs={6}>
                        <SelectInput
                            required
                            label="稀有度"
                            options={QUALITY}
                            register={register}
                            id="quality"
                        />
                    </Grid>
                    <Grid item xs={6}>
                        <Input
                            type="file"
                            required
                            label="圖像"
                            {...register("img")}
                        />
                        <Typography>
                            Image remove background and maintain a width-height
                            ratio of 0.93 (png)
                        </Typography>
                    </Grid>
                </Grid>
                <Button type="submit">確定</Button>
                {message && <Typography>{message}</Typography>}
            </form>
        </FormWrapper>
    );
};

export default NewCharacterForm;
