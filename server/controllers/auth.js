import User from "../models/user";
import { hashPassword, comparePassword} from "../utils/auth";

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