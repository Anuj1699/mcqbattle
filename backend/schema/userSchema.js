import mongoose from "mongoose";
import bcrypt from "bcryptjs"

const userSchema = new mongoose.Schema({
    username: {type: String, required: true},
    email: {type: String, required: true, unique: true},
    password: {type: String, required: true},
    date: {
        type: Date,
        default: Date.now,
    },
    avatar: {
        type: String,
        default: "https://imgs.search.brave.com/MGm_aybkNwmNL9ecLDYnT0ZngfkK27CFMAKgJXRz2Jk/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9jZG4u/dmVjdG9yc3RvY2su/Y29tL2kvcHJldmll/dy0xeC85OC8xNi9w/aXhlbGF0ZWQtZmFj/ZS1ib3ktdmlkZW8t/Z2FtZS1hdmF0YXIt/dmVjdG9yLTE5NTY5/ODE2LmpwZw"
    }
});

userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        return next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

const User = mongoose.model("user", userSchema);

export default User;