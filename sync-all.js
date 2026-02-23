const cloudinary = require("cloudinary").v2;
const fs = require("fs");

cloudinary.config({
    cloud_name: "dmvae9tee",
    api_key: "615584698459282",
    api_secret: "2xWqVIC8LelZEdEMLshhRJZdx_Y"
});

async function getAllClients() {
    const result = await cloudinary.search
        .expression("folder:clients/*")
        .max_results(500)
        .execute();

    const folders = new Set();

    result.resources.forEach(r => {
        const parts = r.public_id.split("/");
        if (parts.length >= 3) {
            folders.add(parts[1]); // lấy tên khách
        }
    });

    return Array.from(folders);
}

async function syncClient(clientName) {
    const folder = `clients/${clientName}`;

    const result = await cloudinary.search
        .expression(`folder:${folder}`)
        .sort_by("created_at", "asc")
        .max_results(500)
        .execute();

    const images = result.resources.map(r => r.public_id);

    fs.writeFileSync(
        `data/${clientName}.json`,
        JSON.stringify(images, null, 2)
    );

    console.log(`✔ Synced ${clientName}`);
}

async function main() {
    const clients = await getAllClients();

    for (const client of clients) {
        await syncClient(client);
    }

    console.log("🚀 Sync toàn bộ hoàn tất");
}

main();