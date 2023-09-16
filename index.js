// Import necessary packages and modules
import express from "express"; // Import Express.js for creating a web server
import { z } from "zod"; // Import Zod for data validation
import { google } from "googleapis"; // Import Google APIs for interacting with Google Sheets
import key from "./keys.json" assert { type: "json" }; // Google API key from a JSON file
import bodyParser from "body-parser";
import { fileURLToPath } from "url";
import path from "path";
// Convert the URL to a file path
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// Create an Express application
const app = express();
// Use JSON parsing middleware
app.use(express.json());
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

// Google Sheet ID in which i have to store data
const SHEET_ID = "1KS-1s_zsoR3gIiPadGoxg4m4IDYXDf6ZsT5KtztXZ3U";

// Define a schema to validate the incoming data
const contactFormSchema = z.object({
  name: z.string().min(1, { message: "Name is required" }),
  email: z.string().email(),
  mobile: z.string().length(10),
  metaData: z.string().min(1, { message: "Cannot be empty" }),
});

// Create a Google Sheets client using JWT authentication
const client = new google.auth.JWT(key.client_email, null, key.private_key, [
  "https://www.googleapis.com/auth/spreadsheets",
]);
// Create a Google Sheets API client
const sheets = google.sheets({ version: "v4", auth: client });

//root path

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "contactUs.html"));
});

// Define an endpoint to post data to Google Sheets
app.post("/getData", async (req, res) => {
  try {
    const { name, email, mobile, metaData } = req.body;
    console.log(req.body);
    const data = contactFormSchema.parse(req.body); // Validate the incoming data against the schema

    // Convert the validated data object to an array
    const rows = Object.values(data);

    // Append the data to the Google Sheet
    await sheets.spreadsheets.values.append({
      spreadsheetId: SHEET_ID,
      range: "Sheet1!A2:D2", // Specify the target range where data will be added
      insertDataOption: "INSERT_ROWS", // Insert new rows for the data
      valueInputOption: "RAW", // Treat the data as raw values
      requestBody: {
        values: [rows], // Provide the data to be added in a 2D array format
      },
    });
    res.json({ Message: "data added successfully" });
  } catch (error) {
    console.log(error, { Message: error.message });
    res.sendStatus(400); // Send a 400 Bad Request response for validation errors
  }
});

// Start the Express server on port 2020
app.listen(2020, () => {
  console.log("Server running on port 2020");
});
