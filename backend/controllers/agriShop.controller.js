const fs = require("fs");
const path = require("path");

// Function to find nearby shops
const agriShop = (req, res) => {
    const filePath = path.join(__dirname, "../public/data", "shops.json");

    fs.readFile(filePath, "utf8", (err, data) => {
        if (err) {
            return res.status(500).json({ error: "Failed to read data" });
        }

        const shops = JSON.parse(data);

        const { latitude, longitude, radius = 100 } = req.body; // radius in KM, default 10 km

        if (!latitude || !longitude) {
            return res.status(400).json({ error: "User location is required" });
        }

        // Calculate distance of each shop
        const nearbyShops = shops
            .map((shop) => {
                const distance = haversineDistance(
                    latitude,
                    longitude,
                    shop.Latitude,
                    shop.Longitude
                );
                return { ...shop, distance };
            })
            .filter((shop) => shop.distance <= radius) // filter within radius
            .sort((a, b) => a.distance - b.distance); // sort nearest first

        res.json({ userLocation: { latitude, longitude }, nearbyShops });
    });
};

// Haversine helper
function haversineDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Radius of Earth in KM
    const toRad = (x) => (x * Math.PI) / 180;

    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);

    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRad(lat1)) *
            Math.cos(toRad(lat2)) *
            Math.sin(dLon / 2) *
            Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in KM
}

module.exports ={
    agriShop
};
