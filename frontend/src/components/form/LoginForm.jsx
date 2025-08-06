import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Grid from "@mui/material/Grid";
import TextField from "@mui/material/TextField";
import { useState } from "react";
// import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { useStore } from "../../hook/useStore";
import { useLoginMutation, useRegisterMutation } from "../../request/hook";
import { useToastContext } from "../provider/ToastProvider";

export const LoginForm = () => {
    const { mutate: mutateRegister } = useRegisterMutation();
    const { mutate: mutateLogin } = useLoginMutation();
    const { register, handleSubmit } = useForm();
    const navigate = useNavigate();
    const [isRegister, setIsRegister] = useState(false);
    const setUser = useStore((state) => state.setUser);
    const { showToast } = useToastContext();

    const onSignIn = (data) => {
        mutateLogin(data, {
            onSettled: (res) => {
                showToast({ status: res.status, detail: res.message });
                if (res.status === "success") {
                    const user = res.data[0];
                    setUser({
                        userId: user?._id,
                        nickName: user?.nickname,
                        stats: user?.stats,
                    });
                    navigate("/wordle");
                }
            },
        });
    };

    const onRegister = (data) => {
        mutateRegister(data, {
            onSettled: (res) => {
                showToast({ status: res.status, detail: res.message });
            },
        });
    };

    const handleRegisterMode = () => {
        setIsRegister(!isRegister);
    };

    return (
        <Container component="main" maxWidth="xs">
            {/* <CssBaseline /> */}
            <Box
                sx={{
                    marginTop: 8,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    backgroundColor: "white",
                    border: "3px solid black",
                    borderRadius: "8px",
                    padding: "32px",
                    backgroundColor: "rgb(255,255,255,0.7)",
                }}
            >
                <Box
                    component="form"
                    onSubmit={handleSubmit(isRegister ? onRegister : onSignIn)}
                    sx={{ mt: 1 }}
                >
                    {isRegister && (
                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            id="nickname"
                            label="NICKNAME"
                            name="nickname"
                            autoComplete="nickname"
                            autoFocus
                            {...register("nickname")}
                        />
                    )}
                    <TextField
                        margin="normal"
                        required
                        fullWidth
                        id="username"
                        label="USERNAME"
                        name="username"
                        autoComplete="username"
                        {...register("username")}
                    />
                    <TextField
                        margin="normal"
                        required
                        fullWidth
                        name="password"
                        label="PASSWORD"
                        type="password"
                        id="password"
                        autoComplete="current-password"
                        {...register("password")}
                    />
                    <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        sx={{ mt: 3, mb: 2 }}
                    >
                        {isRegister ? "REGISTER" : "LOGIN"}
                    </Button>
                    <Grid container>
                        <Grid item xs={12}>
                            <Button onClick={handleRegisterMode} variant="text">
                                {isRegister
                                    ? "ALREADY HAVE AN ACCOUNT?"
                                    : "REGISTER NEW ACCOUNT"}
                            </Button>
                        </Grid>
                    </Grid>
                </Box>
            </Box>
        </Container>
    );
};
