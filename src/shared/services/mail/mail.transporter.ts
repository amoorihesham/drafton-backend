import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: "smtp-relay.brevo.com",
  port: 587,
  secure: false,
  auth: {
    user: "a62df8001@smtp-brevo.com",
    pass: "hIYsLSyTwQzB83jK",
  },
});

export default transporter;
