const usersRouter = require("express").Router();
const bcrypt = require("bcrypt");
const User = require("../models/user");

usersRouter.get("/", async (req, res, next) => {
	const users = await User.find({});
	res.json(users);
});

// add a new user
usersRouter.post("/", async (req, res, next) => {
	const { username, name, password } = req.body;

	const exisitingUser = await User.findOne({ username });
	if (exisitingUser) {
		return res.status(400).json({
			error: "username must be unique",
		});
	}

	if (username.length < 3) {
		return res.status(400).json({
			error: "username must be at least 3 characters long",
		});
	}

	if (password.length < 6) {
		return res.status(400).json({
			error: "password must be at least 6 characters long",
		});
	}

	const saltRounds = 10;
	const passwordHash = await bcrypt.hash(password, saltRounds);

	const user = new User({ username, name, passwordHash });

	const savedUser = await user.save();

	res.status(201).json(savedUser);
});

module.exports = usersRouter;
