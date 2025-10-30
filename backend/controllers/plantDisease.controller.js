const fs = require("fs");
const { GoogleGenerativeAI } = require("@google/generative-ai");

// Load from environment variable
const genAI = new GoogleGenerativeAI("AIzaSyCcUbiSv2Eem2j43PYdQBt5VejTtVduEZw");

const plantDisease = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    console.log("Uploaded image file path:", req.file.path);

    // Convert file to base64
    const imageBase64 = fs.readFileSync(req.file.path, { encoding: "base64" });

    // Model
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `
      You are an expert plant pathologist. 
      Analyze the uploaded plant image and return a STRICT JSON response ONLY.
      JSON format:
      {
        "disease": "Name of the disease or 'Unknown'",
        "advice": "Simple explanation for farmers",
        "treatment": "Practical treatment steps"
      }
    `;

    const imagePart = {
      inlineData: {
        data: imageBase64,
        mimeType: req.file.mimetype || "image/jpeg",
      },
    };

    // Generate content
    const result = await model.generateContent([prompt, imagePart]);

    // Extract text safely
    const responseText =
      result?.response?.text?.() ||
      result?.response?.candidates?.[0]?.content?.parts?.[0]?.text ||
      "";

    console.log("AI Raw Response:", responseText);

    // Try to extract valid JSON
    let outputJSON = {};
    try {
      // Remove markdown ```json ... ``` if present
      const cleaned = responseText.replace(/```json|```/g, "").trim();

      outputJSON = JSON.parse(cleaned);
    } catch (err) {
      console.error("❌ JSON Parse Error:", err);
      outputJSON = {
        disease: "Unknown",
        advice: responseText,
        treatment: "Could not parse structured response.",
      };
    }

    res.json(outputJSON);

    // Cleanup uploaded file
    fs.unlinkSync(req.file.path);
  } catch (err) {
    console.error("Error using Google GenAI:", err);

    if (req.file && req.file.path) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (unlinkError) {
        console.error("Error deleting file:", unlinkError);
      }
    }

    res.status(500).json({
      error: err.message || "Internal server error",
    });
  }
};

module.exports = { plantDisease };
