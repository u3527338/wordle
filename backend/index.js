import cors from "cors";
import express from "express";

const app = express();
app.use(
    cors({
        origin: "http://localhost:3001", // or '*' to allow all origins (less secure)
        methods: ["POST", "GET", "PUT", "DELETE", "OPTIONS"],
        credentials: true,
    })
);
app.use(express.json());

// app.use(
//     cors({
//         origin: [
//             "https://sgk-online-frontend.vercel.app",
//             "http://localhost:3000",
//         ],
//         methods: ["POST", "GET", "PUT", "DELETE", "OPTIONS"],
//         credentials: true,
//     }),
//     bodyParser.json()
// );
// dotenv.config();

app.get("/", (req, res) => {
    res.json("connected");
});

// app.post("/register", async (req, res) => {
//     const { username, password } = req.body;
//     const hasUser = (await UserModel.countDocuments({})) > 0;
//     bcrypt
//         .hash(password, 10)
//         .then(async (hashedPassword) => {
//             const user = {
//                 username: username,
//                 password: hashedPassword,
//                 role: hasUser ? ["user"] : ["admin", "user"],
//             };
//             await UserModel.create(user)
//                 .then((result) => {
//                     res.status(201).send({
//                         status: "success",
//                         message: "成功創建帳號",
//                     });
//                 })
//                 .catch((error) => {
//                     res.status(500).send({
//                         status: "failed",
//                         message:
//                             error.errorResponse.code === 11000
//                                 ? "已存在用戶"
//                                 : "創建帳號失敗",
//                     });
//                 });
//         })
//         .catch((e) => {
//             res.status(500).send({
//                 status: "failed",
//                 message: "儲存密碼出現錯誤",
//             });
//         });
// });

// app.post("/login", async (req, res) => {
//     const { username, password: input_password } = req.body;
//     const user = await UserModel.findOne({ username }).select("+password");
//     const validMessage = "登入成功";
//     const invalidMessage = "用戶名稱或密碼錯誤";
//     if (!user) {
//         res.status(401).send({
//             status: "failed",
//             data: [],
//             message: invalidMessage,
//         });
//         return;
//     }

//     const isPasswordValid = await bcrypt.compare(input_password, user.password);
//     if (!isPasswordValid) {
//         res.status(401).send({
//             status: "failed",
//             data: [],
//             message: invalidMessage,
//         });
//         return;
//     }

//     const { password, ...user_data } = user._doc;
//     res.status(200).send({
//         status: "success",
//         data: [user_data],
//         message: validMessage,
//     });
// });

// app.get("/user/:userId", async (req, res) => {
//     const userId = req.params.userId;
//     try {
//         const user = await UserModel.findOne({ _id: userId });
//         res.status(200).json({
//             status: "success",
//             data: user,
//         });
//     } catch (error) {
//         res.status(500).json({
//             status: "failed",
//             message: "獲取用戶權限失敗",
//         });
//     }
// });

app.post("/guess", (req, res) => {
    let targetWord = "REACT";
    const { currentGuess } = req.body;
    // Basic validation
    if (
        !currentGuess ||
        currentGuess.length !== 5 ||
        !/^[A-Z]+$/.test(currentGuess)
    ) {
        return res.status(400).json({ message: "Invalid guess" });
    }

    // Check guess correctness
    const isCorrect = currentGuess === targetWord;
    const colors = getColors(currentGuess, targetWord);
    if (isCorrect) {
        return res.json({
            correct: true,
            colors,
            message: "Correct!",
        });
    }
    res.json({ correct: false, colors, message: "Try again" });
});

const getColors = (guess, target) => {
    const guessLetters = guess.split("");
    const targetLetters = target.split("");
    const result = Array(5).fill("gray");

    // First pass: correct position
    for (let i = 0; i < 5; i++) {
        if (guessLetters[i] === targetLetters[i]) {
            result[i] = "green";
            targetLetters[i] = null; // mark used
        }
    }

    // Second pass: wrong position
    for (let i = 0; i < 5; i++) {
        if (result[i] !== "green") {
            const index = targetLetters.indexOf(guessLetters[i]);
            if (index !== -1) {
                result[i] = "yellow";
                targetLetters[index] = null; // mark as used
            }
        }
    }
    return result;
};

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});

// mongoose.connect(
//     "mongodb+srv://ericsiu0420:o3z1XU2OVrxiM3el@backend.r7htuqw.mongodb.net/SGK_online?retryWrites=true&w=majority&appName=Backend"
// );

export default app;
