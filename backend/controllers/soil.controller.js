const axios = require("axios");

// Node.js controller
const soilInfo = async (req, res) => {
  try {
    const soilData = req.body;

    // ✅ Input validation
    if (
      soilData.ph === undefined ||
      soilData.nitrogen === undefined ||
      soilData.phosphorus === undefined ||
      soilData.potassium === undefined
    ) {
      return res.status(400).json({ error: "Missing soil parameters" });
    }

    if (soilData.ph < 0 || soilData.ph > 14) {
      return res.status(400).json({ error: "Invalid pH value (0–14 allowed)" });
    }
    if (
      soilData.nitrogen < 0 ||
      soilData.phosphorus < 0 ||
      soilData.potassium < 0
    ) {
      return res.status(400).json({ error: "NPK values cannot be negative" });
    }
    if (
      soilData.moisture !== undefined &&
      (soilData.moisture < 0 || soilData.moisture > 100)
    ) {
      return res
        .status(400)
        .json({ error: "Moisture must be between 0 and 100" });
    }

    // ✅ Call Flask API with axios
    const flaskResponse = await axios.post(
      "http://127.0.0.1:5000/soilInfo",
      // "https://f3d8f1f63e61.ngrok-free.app",
      soilData
    );

    const flaskData = flaskResponse.data;

    // ✅ Send combined response
    res.json({
      message: "Soil data processed successfully via Flask",
      soilData,
      recommendations:
        flaskData.recommended_crop || flaskData.recommendations,
    });
  } catch (err) {
    console.error("Error communicating with Flask:", err.message);
    res.status(500).json({
      error: "Something went wrong in Node controller",
      details: err.response?.data || err.message,
    });
  }
};

module.exports = { soilInfo };
