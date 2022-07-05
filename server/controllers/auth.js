import User from "../models/user";
import { hashPassword, comparePassword} from "../utils/auth";
import jwt from 'jsonwebtoken';
import { response } from "express";

export const register = async (req, res) => {
    try {
        const {name, email, password} = req.body

        if (!name) return res.status(400).send("Name is required");
        if (!password || password.length > 6) {
            return res
                .status(400)
                .send("Password is required and should be min 6 characters long");
        }
        let userExist = await User.findOne({ email }).exec();
        if (userExist) return res.status(400).send("Email is taken");

        const hashedPassword = await hashPassword(password)

        const user = new User({
            name, 
            email, 
            password: hashedPassword,
        });
        await user.save();
        return res.json({ ok: true });
    } catch (err) {
        console.log(err);
        return res.status(400).send("Error. Try again.");
    }
};

export const login = async (req, res) => {
    try {
        const {email, password} = req.body
        const user = await User.findOne({ email }).exec();
        if (!user) return res.status(400).send("No user found");
        const match = await comparePassword(password, user.password)
        const token = jwt.sign({_id: user._id}, process.env.JWT_SECRET, {
            expiresIn: "7d",
        });

        user.password = undefined;

        res.cookie("token", token, {
            httpOnly: true,
            // secure: true
        });
        res.json(user);
    } catch (err) {
        console.log(err)
        return res.status(400).send("Error. Try again.")
    }
}