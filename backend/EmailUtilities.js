import nodemailer from "nodemailer";

export const sendEmail = async ({ to, subject, html }) => {
  try {
    console.log(to,subject,html);
    const transporter = nodemailer.createTransport({
      service: "Gmail",
      auth: {
        user: "davidagochukwu@gmail.com",
        pass: "ryho qzgh sagx qbll",
      },
    });

    const mailOptions = { to, subject, html };

    await transporter.sendMail(mailOptions);

    // TODO: remove the console.log before prod
    console.log("Email sent successfully");
  } catch (error) {
    console.error("Error sending email:", error);
    throw new Error("Failed to send email");
  }
};
