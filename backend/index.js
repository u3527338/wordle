import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import bcrypt from "bcrypt";
import cors from "cors";
import bodyParser from "body-parser";
import UserModel from "./db/userModel.js";
import SkillModel from "./db/skillModel.js";
import BookModel from "./db/bookModel.js";
import CharacterModel from "./db/characterModel.js";
import UserSquadModel from "./db/userSquadModel.js";
import { createNewData } from "./helper.js";
import UserCharacterModel from "./db/userCharacterModel.js";
import UserSkillModel from "./db/userSkillModel.js";

const app = express();
app.use(
  cors({
    origin: ["https://sgk-online-frontend.vercel.app","http://localhost:3000"],
    methods: ["POST", "GET", "PUT", "DELETE", "OPTIONS"],
    credentials: true,
  }),
  bodyParser.json()
);
dotenv.config();

app.get("/", (req, res) => {
  res.json("connected");
});

app.post("/register", async (req, res) => {
  const { username, password } = req.body;
  const hasUser = (await UserModel.countDocuments({})) > 0;
  bcrypt
    .hash(password, 10)
    .then(async (hashedPassword) => {
      const user = {
        username: username,
        password: hashedPassword,
        role: hasUser ? ["user"] : ["admin", "user"],
      };
      await UserModel.create(user)
        .then((result) => {
          res.status(201).send({
            status: "success",
            message: "成功創建帳號",
          });
        })
        .catch((error) => {
          res.status(500).send({
            status: "failed",
            message:
              error.errorResponse.code === 11000
                ? "已存在用戶"
                : "創建帳號失敗",
          });
        });
    })
    .catch((e) => {
      res.status(500).send({
        status: "failed",
        message: "儲存密碼出現錯誤",
      });
    });
});

app.post("/login", async (req, res) => {
  const { username, password: input_password } = req.body;
  const user = await UserModel.findOne({ username }).select("+password");
  const validMessage = "登入成功";
  const invalidMessage = "用戶名稱或密碼錯誤";
  if (!user) {
    res.status(401).send({
      status: "failed",
      data: [],
      message: invalidMessage,
    });
    return;
  }

  const isPasswordValid = await bcrypt.compare(input_password, user.password);
  if (!isPasswordValid) {
    res.status(401).send({
      status: "failed",
      data: [],
      message: invalidMessage,
    });
    return;
  }

  const { password, ...user_data } = user._doc;
  res.status(200).send({
    status: "success",
    data: [user_data],
    message: validMessage,
  });
});

app.get("/user/:userId", async (req, res) => {
  const userId = req.params.userId;
  try {
    const user = await UserModel.findOne({ _id: userId });
    res.status(200).json({
      status: "success",
      data: user,
    });
  } catch (error) {
    res.status(500).json({
      status: "failed",
      message: "獲取用戶權限失敗",
    });
  }
});

app.post("/addskill", async (req, res) => {
  createNewData({ model: SkillModel, data: req.body, type: "Skill", res });
});

app.post("/addbook", async (req, res) => {
  createNewData({ model: BookModel, data: req.body, type: "Book", res });
});

app.post("/addcharacter", async (req, res) => {
  createNewData({
    model: CharacterModel,
    data: req.body,
    type: "Character",
    res,
  });
});

//add a new empty squad
app.post("/addsquad", async (req, res) => {
  createNewData({
    model: UserSquadModel,
    data: req.body,
    type: "Squad",
    res,
  });
  // need to return squad here? maybe an id for squad update
});

//update my characters
app.post("/my-characters", async (req, res) => {
  const characterList = req.body;
  try {
    // Update existing records and insert new records
    await Promise.all(
      characterList.map(async (character) => {
        const existingCharacter = await CharacterModel.findById(
          character.character_id
        );

        if (existingCharacter) {
          // Update existing record
          await UserCharacterModel.findOneAndUpdate(
            {
              user_id: character.user_id,
              character_id: character.character_id,
            },
            character,
            { new: true }
          );
        } else {
          // Delete user character record in case character no show
          await UserCharacterModel.deleteOne({
            user_id: character.user_id,
            character_id: character.character_id,
          });
        }
      })
    );
    res.status(200).json({
      status: "success",
      message: "成功儲存武將庫",
    });
  } catch (error) {
    res.status(500).json({
      status: "failed",
      error: "儲存武將庫失敗",
    });
  }
});

//update my skills
app.post("/my-skills", async (req, res) => {
  const skillList = req.body;
  try {
    // Update existing records and insert new records
    await Promise.all(
      skillList.map(async (skill) => {
        const existingSkill = await SkillModel.findById(skill.skill_id);

        if (existingSkill) {
          // Update existing record
          await UserSkillModel.findOneAndUpdate(
            {
              user_id: skill.user_id,
              skill_id: skill.skill_id,
            },
            skill,
            { new: true }
          );
        } else {
          // Delete user character record in case character no show
          await UserSkillModel.deleteOne({
            user_id: skill.user_id,
            skill_id: skill.skill_id,
          });
        }
      })
    );
    res.status(200).json({
      status: "success",
      message: "成功儲存戰法庫",
    });
  } catch (error) {
    res.status(500).json({
      status: "failed",
      error: "儲存戰法庫失敗",
    });
  }
});

//update each squad
app.post("/my-squad", async (req, res) => {
  const { id, ...data } = req.body; //id should be
  try {
    const updatedUserSquad = await UserSquadModel.findByIdAndUpdate(id, data, {
      new: true,
    })
      .populate({
        path: "squads.characters.user_character",
        model: "UserCharacters",
        populate: {
          path: "character_id",
          model: "Characters",
          populate: {
            path: "book_options",
            model: "Books",
          },
        },
      })
      .populate({
        path: "squads.characters.skill_sets",
        model: "Skills",
        options: { retainNullValues: true },
      })
      .populate({
        path: "squads.characters.book_sets",
        model: "Books",
        options: { retainNullValues: true },
      });
    res.status(200).json({ status: "success", data: updatedUserSquad, message: `成功儲存陣容${data.tab}` });
  } catch (err) {
    res.status(500).json({
      status: "failed",
      message: `儲存陣容${data.tab}出現錯誤`,
    });
  }
});

app.get("/characters", async (req, res) => {
  await CharacterModel.find({})
    .then((result) => {
      res.status(200).send({
        status: "success",
        data: result,
        // message: "Finish retrieving Character Data",
      });
    })
    .catch((e) => {
      res.status(500).send({
        status: "failed",
        data: [],
        message: "Retrieve Character Data Failed",
      });
    });
});

app.get("/skills", async (req, res) => {
  await SkillModel.find({})
    .then((result) => {
      res.status(200).send({
        status: "success",
        data: result,
        message: "Finish retrieving Skill Set Data",
      });
    })
    .catch((e) => {
      res.status(500).send({
        status: "failed",
        data: [],
        message: "Retrieve Skill Set Data Failed",
      });
    });
});

app.get("/books", async (req, res) => {
  await BookModel.find({})
    .then((result) => {
      res.status(200).send({
        status: "success",
        data: result,
        message: "Finish retrieving Book Data",
      });
    })
    .catch((e) => {
      res.status(500).send({
        status: "failed",
        data: [],
        message: "Retrieve Book Data Failed",
      });
    });
});

app.get("/my-characters", async (req, res) => {
  const { user_id } = req.query;
  try {
    // Get all characters and user characters for the given user_id
    const characters = await CharacterModel.find();
    const userCharacters = await UserCharacterModel.find({ user_id });

    // Create a map of existing user character IDs for faster lookup
    const userCharacterIds = new Set(
      userCharacters.map((userChar) => userChar.character_id.toString())
    );

    // Batch operations to create new user characters and delete obsolete user characters
    const bulkOperations = [];
    const updatedUserCharacterIds = new Set();

    characters.forEach((character) => {
      if (!userCharacterIds.has(character._id.toString())) {
        bulkOperations.push({
          insertOne: {
            document: {
              user_id,
              character_id: character._id,
              rating: 0,
              is_active: false,
            },
          },
        });
      }
      updatedUserCharacterIds.add(character._id.toString());
    });

    userCharacters.forEach((userChar) => {
      if (!updatedUserCharacterIds.has(userChar.character_id.toString())) {
        bulkOperations.push({
          deleteOne: {
            filter: {
              _id: userChar._id,
              user_id,
            },
          },
        });
      }
    });

    // Execute bulk operations using MongoDB's bulkWrite
    if (bulkOperations.length > 0) {
      await UserCharacterModel.bulkWrite(bulkOperations);
    }

    // Retrieve and return updated user characters with populated data
    const updatedCharacters = await UserCharacterModel.find({
      user_id,
    }).populate({
      path: "character_id",
      model: "Characters",
      populate: [
        {
          path: "self_skill",
          model: "Skills",
        },
        {
          path: "book_options",
          model: "Books",
        },
      ],
    });

    res.status(200).json(updatedCharacters);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: "failed",
      message: "獲取我的武將出現錯誤",
    });
  }
});

app.get("/my-skills", async (req, res) => {
  const { user_id } = req.query;
  try {
    const skills = await SkillModel.find();
    const userSkills = await UserSkillModel.find({ user_id });

    // Create a map of existing user skill IDs for faster lookup
    const userSkillIds = new Set(
      userSkills.map((userSkill) => userSkill.skill_id.toString())
    );

    // Batch operations to create new user skills and delete obsolete user skills
    const bulkOperations = [];
    const updatedUserSkillIds = new Set();

    skills.forEach((skill) => {
      if (!userSkillIds.has(skill._id.toString())) {
        bulkOperations.push({
          insertOne: {
            document: {
              user_id,
              skill_id: skill._id,
              is_active: false,
            },
          },
        });
      }
      updatedUserSkillIds.add(skill._id.toString());
    });

    userSkills.forEach((userSkill) => {
      if (!updatedUserSkillIds.has(userSkill.skill_id.toString())) {
        bulkOperations.push({
          deleteOne: {
            filter: {
              _id: userSkill._id,
              user_id,
            },
          },
        });
      }
    });

    // Execute bulk operations using MongoDB's bulkWrite
    if (bulkOperations.length > 0) {
      await UserSkillModel.bulkWrite(bulkOperations);
    }

    // Retrieve and return updated user skills
    const updatedSkills = await UserSkillModel.find({ user_id }).populate(
      "skill_id"
    );
    res.status(200).json(updatedSkills);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: "failed",
      message: "獲取我的戰法出現錯誤",
    });
  }
});

app.get("/my-squads", async (req, res) => {
  const { user_id } = req.query;

  try {
    // Find all squads for the user
    let squads = await UserSquadModel.find({ user_id })
      .populate({
        path: "squads.characters.user_character",
        model: "UserCharacters",
        populate: {
          path: "character_id",
          model: "Characters",
          populate: {
            path: "book_options",
            model: "Books",
          },
        },
      })
      .populate({
        path: "squads.characters.skill_sets",
        model: "Skills",
        options: { retainNullValues: true },
      })
      .populate({
        path: "squads.characters.book_sets",
        model: "Books",
        options: { retainNullValues: true },
      });

    if (squads.length > 0) {
      // If squads exist, return them
      res.json({ all_squads: squads });
    } else {
      // If no squads exist, create a new squad
      const newSquad = new UserSquadModel({
        user_id,
        tab: "陣容一",
        mode: "simple",
        squads: [
          {
            type: "lance",
            characters: [null, null, null], // Populate with actual UserCharacterModel IDs
          },
        ],
      });
      const createdSquad = await newSquad.save();
      res.json({ all_squads: [createdSquad] });
    }
  } catch (error) {
    res.status(500).json({ status: "failed", message: "獲取我的陣容出現錯誤" });
  }
});

app.post("/add-squad", async (req, res) => {
  const { user_id, tab } = req.body;
  try {
    const newSquad = new UserSquadModel({
      user_id,
      tab,
      mode: "simple",
      squads: [
        {
          type: "lance",
          characters: [null, null, null], // Populate with actual UserCharacterModel IDs
        },
      ],
    });
    await newSquad.save();
    res
      .status(200)
      .json({ status: "success", message: "Add Squad Successful" });
  } catch (error) {
    console.error("Error retrieving or creating squads:", error);
    res.status(500).json({ status: "failed", message: "新增陣容出現錯誤" });
  }
});

app.delete("/delete-squad/:id", async (req, res) => {
  const id = req.params.id;
  try {
    const squad = await UserSquadModel.findOneAndDelete({ _id: id });
    res.status(200).json({
      status: "success",
      message: "Delete Squad Successful",
    });
  } catch (error) {
    console.error("Error deleting squads:", error);
    res.status(500).json({
      status: "failed",
      message: "移除陣容出現錯誤",
    });
  }
});

mongoose.connect(
  "mongodb+srv://ericsiu0420:o3z1XU2OVrxiM3el@backend.r7htuqw.mongodb.net/SGK_online?retryWrites=true&w=majority&appName=Backend"
);

export default app;
