const bcrypt = require("bcryptjs");
const { User } = require("../../models");
const jwt = require("jsonwebtoken");

const { SECRET_KEY } = process.env;
const Joi = require("joi");

const joiShema = Joi.object({
  email: Joi.string().required(),
  password: Joi.string().required(),
});

const login = async (req, res) => {
  try {
    const { error } = joiShema.validate(req.body);
    if (error) {
      res.status(400).json({
        status: "error",
        code: 400,
        message: "missing required name field",
      });
    }
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      res.status(401).json({
        status: "error",
        code: 401,
        message: "Email or password is wrong",
      });
      return;
    }
    const comparePassword = bcrypt.compareSync(password, user.password);
    if (!comparePassword) {
      res.status(401).json({
        status: "error",
        code: 401,
        message: "Password is wrong",
      });
    }
    const payload = { id: user._id };
    const token = jwt.sign(payload, SECRET_KEY, { expiresIn: "1h" });
    await User.findByIdAndUpdate(user._id, { token });
    res.json({
      status: "success",
      code: 200,
      data: {
        token,
      },
    });
  } catch {
    res.status(500).json({
      status: "error",
      code: 500,
      message: "Server error",
    });
  }
};
module.exports = login;
