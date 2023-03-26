import { hashPassword } from "../../../helpers/auth";
import { connectToDatabase } from "../../../helpers/db";

async function handler(req, res) {
  if (req.method !== "POST") {
    return;
  }

  const { email, password } = req.body;
  console.log(email, password);

  if (
    !email ||
    !email.includes("@") ||
    !password ||
    password.trim().length < 7
  ) {
    res.status(422).json({
      message: "Invalid input - password should be at least 7 characters long.",
    });
    return;
  }

  const client = await connectToDatabase();
  const db = client.db();

  const existingUser = await db
    .collection(process.env.MONGODB_COLLECTION)
    .findOne({ email });
  console.log({ existingUser });

  if (existingUser) {
    res.status(422).json({ message: "User exists already!" });
    client.close();
    return;
  }

  const hashedPassword = await hashPassword(password);
  const result = await db
    .collection(process.env.MONGODB_COLLECTION)
    .insertOne({ email, password: hashedPassword });

  res.status(201).json({ message: "Created User" });
  client.close();
}

export default handler;
