/**
 * Clears all task/routine/goal/entry data for every user.
 * Users are preserved.
 *
 * Run from the server/ directory:
 *   node scripts/clearData.js
 */

require("dotenv").config();
const mongoose = require("mongoose");

const COLLECTIONS_TO_CLEAR = [
  "dailyentries",
  "personaltasks",
  "dailytemplates",
  "dailyroutines",
  "weeklyplans",
  "goals",
  "goalhistories",
];

async function clearData() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log("Connected to MongoDB:", mongoose.connection.host);

  for (const name of COLLECTIONS_TO_CLEAR) {
    const col = mongoose.connection.collection(name);
    const { deletedCount } = await col.deleteMany({});
    console.log(`  ${name}: deleted ${deletedCount} documents`);
  }

  console.log("\nDone. Users collection was not touched.");
  await mongoose.disconnect();
}

clearData().catch((err) => {
  console.error(err);
  process.exit(1);
});
