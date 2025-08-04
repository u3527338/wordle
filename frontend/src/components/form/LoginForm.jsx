import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Checkbox from "@mui/material/Checkbox";
import FormControlLabel from "@mui/material/FormControlLabel";
import Grid from "@mui/material/Grid";
import Link from "@mui/material/Link";
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
    const setUserId = useStore((state) => state.setUserId);
    const { showToast } = useToastContext()

    const onSignIn = (data) => {
        mutateLogin(data, {
            onSettled: (res) => {
                showToast({ status: res.status, detail: res.message });
                if (res.status === "success") {
                    setUserId(res.data[0]._id);
                    navigate("/my-squads");
                }
            }
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
                {/* <Avatar sx={{ m: 1, bgcolor: 'secondary.main' }}>
            <LockOutlinedIcon />
            </Avatar> */}
                <Typography component="h1" variant="h5">
                    {isRegister ? "註冊" : "登錄"}
                </Typography>
                <Box
                    component="form"
                    onSubmit={handleSubmit(isRegister ? onRegister : onSignIn)}
                    sx={{ mt: 1 }}
                >
                    <TextField
                        margin="normal"
                        required
                        fullWidth
                        id="username"
                        label="用戶名稱"
                        name="username"
                        autoComplete="username"
                        autoFocus
                        {...register("username")}
                    />
                    <TextField
                        margin="normal"
                        required
                        fullWidth
                        name="password"
                        label="密碼"
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
                        {isRegister ? "確認註冊" : "確認登錄"}
                    </Button>
                    <Grid container>
                        <Grid item xs={12}>
                            <Button
                                onClick={handleRegisterMode}
                                variant="text"
                            >
                                {isRegister ? "已有帳戶" : "註冊新帳戶"}
                            </Button>
                        </Grid>
                    </Grid>
                </Box>
            </Box>
        </Container>
    );
};
