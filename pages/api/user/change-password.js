import { getSession } from "next-auth/client";
import { hashPassword, verifyPassword } from "../../../helpers/auth";
import { connectToDatabase } from "../../../helpers/db";

async function handler(req, res) {
  if (req.method !== "PATCH") {
    return;
  }

  const session = await getSession({ req });

  if (!session) {
    res.status(401).json({ message: "Not authenticated!" });
    return;
  }

  const userEmail = session.user.email;

  const { oldPassword, newPassword } = req.body;

  const client = await connectToDatabase();
  const usersCollection = client
    .db()
    .collection(process.env.MONGODB_COLLECTION);

  const user = await usersCollection.findOne({ email: userEmail });
  console.log(user);

  if (!user) {
    res.status(404).json({ message: "User not found." });
    client.close();
    return;
  }

  const currentPassoword = user.password;

  const passworrdsAreEqual = await verifyPassword(
    oldPassword,
    currentPassoword
  );

  if (!passworrdsAreEqual) {
    res.status(403).json({ message: "Invalid password." });
    client.close();
    return;
  }

  const hashedPassword = await hashPassword(newPassword);

  const result = await usersCollection.updateOne(
    { email: userEmail },
    {
      $set: {
        password: hashedPassword,
      },
    }
  );

  client.close();
  res.status(200).json({ message: "Password updated!" });
}

export default handler;
