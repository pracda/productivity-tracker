const jwt = require("jsonwebtoken");
const { OAuth2Client } = require("google-auth-library");
const User = require("../models/User");
const { seedDefaultPlannerIfEmpty } = require("../utils/seedDefaultPlanner");

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const signAppToken = (user) => {
  return jwt.sign(
    {
      sub: user._id.toString(),
      email: user.email,
      name: user.name,
    },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
};

const googleLogin = async (req, res) => {
  try {
    const { credential } = req.body;

    if (!credential) {
      return res.status(400).json({ message: "Google credential is required" });
    }

    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();

    if (!payload || !payload.email || !payload.sub || !payload.name) {
      return res.status(400).json({ message: "Invalid Google token payload" });
    }

    let user = await User.findOne({ email: payload.email.toLowerCase() });

    if (!user) {
      user = await User.create({
        name: payload.name,
        email: payload.email.toLowerCase(),
        provider: "google",
        providerId: payload.sub,
        avatarUrl: payload.picture || null,
      });
    } else {
      user.name = payload.name;
      user.provider = "google";
      user.providerId = payload.sub;
      user.avatarUrl = payload.picture || user.avatarUrl || null;
      await user.save();
    }

    await seedDefaultPlannerIfEmpty(user._id);

    const token = signAppToken(user);

    return res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatarUrl: user.avatarUrl,
        provider: user.provider,
      },
    });
  } catch (error) {
    return res.status(401).json({ message: "Google authentication failed" });
  }
};

const getAuthStatus = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.json({
        authenticated: false,
        user: null,
      });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.sub);

    if (!user) {
      return res.json({
        authenticated: false,
        user: null,
      });
    }

    return res.json({
      authenticated: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatarUrl: user.avatarUrl,
        provider: user.provider,
      },
    });
  } catch (error) {
    return res.json({
      authenticated: false,
      user: null,
    });
  }
};

module.exports = {
  googleLogin,
  getAuthStatus,
};