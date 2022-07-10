import jwt from 'jsonwebtoken';
import AWS from 'aws-sdk';
import User from '../models/user';
import { hashPassword, comparePassword } from '../utils/auth';

const awsConfig = {
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION,
    apiVersion: process.env.AWS_API_VERSION,
}

const SES = new AWS.SES(awsConfig);

export const register = async (req, res) => {
    try {
        const { name, email, password} = req.body;
        if (!name) {
            return res.status(400).send("Name is required");
        }
        if (!email) {
            return res.status(400).send("Email is required");
        }
        if (!password || password.length < 6) {
            return res.status(400).send("Password is required and should be min 6 characters long.");
        }
        let userExist = await User.findOne({ email }).exec();
        if (userExist) {
            return res.status(400).send("Email is taken.");
        }
        const hashedPassword = await hashPassword(password);
        const user = new User({
            name,
            email,
            password: hashedPassword,
        })
        await user.save();
        return res.json({ ok: true });
    } catch (err) {
        console.log(err);
        return res.status(400).send("Error. Try again.");
    }
}

export const login = async (req, res) => {
    try {
        const { email, password} = req.body;
        const user = await User.findOne({ email }).exec();
        if (!user) return res.status(400).send("No user found.");
        const match = await comparePassword(password, user.password);
        if (!match) return res.status(400).send("No user found.");
        const token = jwt.sign({_id: user._id}, process.env.JWT_SECRET, { expiresIn: "7d" });
        user.password = undefined;
        res.cookie("token", token, {
            httpOnly: true,
            // secure: true, // only works on https
        });
        res.json(user);
    } catch (err) {
        console.log(err);
        return res.status(400).send("Error. Try again.");
    }
}

export const logout = async (req, res) => {
    try {
        res.clearCookie("token");
        return res.json({ message: "Signout success"});
    } catch (err) {
        console.log(err);
        return res.status(400).send("Error. Try again.");
    }
}

export const currentUser = async (req, res) => {
    try {
        const user = await User.findById(req.auth._id).select('-password').exec();
        console.log("CURRENT USER", user);
        return res.json({ ok: true });
    } catch (err) {
        console.log(err);
        return res.status(400).send("Error. Try again.");
    }
}

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const shortCode = Math.random().toString(36).substring(6).toUpperCase();
    const user = await User.findOneAndUpdate({ email: email }, { passwordResetCode: shortCode});
    if (!user) return res.status(404).send("User not found");
    const params = {
        Source: process.env.EMAIL_FROM,
        Destination: {
            ToAddresses: [email],
        },
        ReplyToAddresses: [process.env.EMAIL_FROM],
        Message: {
            Body: {
                Html: {
                    Charset: "UTF-8",
                    Data: `
                        <html>
                            <h1>Reset password</h1>
                            <p>Please use the following code to reset your password</p>
                            <h2 style="color: red;">${shortCode}</h2>
                            <i>edemy.com</i>
                        </html>
                    `
                }
            },
            Subject: {
                Charset: "UTF-8",
                Data: "Reset Password"
            }
        }
    }
    const emailSent = SES.sendEmail(params).promise();
    emailSent.then((data) => {
      console.log(data);
      res.json({ ok: true })
    }).catch((err) => {
      console.log(err);
    });
  } catch (err) {
      console.log(err);
  } 
}