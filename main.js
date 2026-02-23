const CLOUD_NAME = "dmvae9tee";

const params = new URLSearchParams(window.location.search);
const client = params.get("client");
const mode = params.get("mode") || "view";
const IMAGES_PER_PAGE = 20;
let currentPage = 1;
let allImages = [];

if (!client) {
    document.body.innerHTML = "Thiếu tên khách";
    throw new Error("No client");
}

document.getElementById("title").innerText = `Album: ${client}`;

fetch(`data/${client}.json`)
    .then(res => res.json())
    .then(images => {
    allImages = images;
    renderPage(1);
    renderPagination();
})
    .catch(() => {
        document.body.innerHTML = "Không tìm thấy album";
    });

function getViewImageUrl(id) {
    return `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/w_600,c_limit/l_watermark:watermark,w_100,o_35,g_south_east,x_20,y_20/f_auto,q_auto/${id}`;
}
function getOriginalImageUrl(id) {
    return `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/f_auto,q_90/${id}.jpg`;
}
function getDownloadImageUrl(id) {
    return `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/fl_attachment:attachment,f_jpg,q_100/${id}.jpg`;
}
function renderImages(images) {
    const gallery = document.getElementById("gallery");

    images.forEach(id => {
        const item = document.createElement("div");
        item.className = "photo-item";

        const previewUrl = getViewImageUrl(id);
        const originalUrl = getOriginalImageUrl(id);

        const img = document.createElement("img");

        // 🔥 Nếu ở mode download → hiển thị ảnh gốc
        img.src = (mode === "download") ? originalUrl : previewUrl;

        img.loading = "lazy";

        // Lightbox cũng theo mode
        img.onclick = () => {
            openLightbox((mode === "download") ? originalUrl : previewUrl);
        };

        item.appendChild(img);

        // Nếu download mode thì hiện nút tải
        if (mode === "download") {
            const a = document.createElement("a");
            a.href = getDownloadImageUrl(id);
            a.className = "download-btn";
            a.innerText = "⬇ Tải ảnh JPG";
            a.download = `${id}.jpg`;
            a.onclick = e => e.stopPropagation();
            item.appendChild(a);
        }

        gallery.appendChild(item);
    });
}

function renderPage(page) {
    const gallery = document.getElementById("gallery");
    gallery.innerHTML = "";

    currentPage = page;

    const start = (page - 1) * IMAGES_PER_PAGE;
    const end = start + IMAGES_PER_PAGE;
    const pageImages = allImages.slice(start, end);

    pageImages.forEach(id => {
        const item = document.createElement("div");
        item.className = "photo-item";

        const previewUrl = getViewImageUrl(id);
        const originalUrl = getDownloadImageUrl(id);

        const img = document.createElement("img");
        img.src = (mode === "download") ? originalUrl : previewUrl;
        img.loading = "lazy";

        img.onclick = () => {
            openLightbox((mode === "download") ? originalUrl : previewUrl);
        };

        item.appendChild(img);

        if (mode === "download") {
            const a = document.createElement("a");
            a.href = originalUrl;
            a.className = "download-btn";
            a.innerText = "⬇ Tải ảnh JPG";
            a.onclick = e => e.stopPropagation();
            item.appendChild(a);
        }

        gallery.appendChild(item);
    });
}
function renderPagination() {
    const totalPages = Math.ceil(allImages.length / IMAGES_PER_PAGE);

    const container = document.createElement("div");
    container.className = "pagination";

    // Prev
    const prev = document.createElement("button");
    prev.innerText = "«";
    prev.disabled = currentPage === 1;
    prev.onclick = () => {
        renderPage(currentPage - 1);
        renderPagination();
        window.scrollTo({ top: 0, behavior: "smooth" });
    };
    container.appendChild(prev);

    // Page numbers
    for (let i = 1; i <= totalPages; i++) {
        const btn = document.createElement("button");
        btn.innerText = i;
        if (i === currentPage) btn.classList.add("active");

        btn.onclick = () => {
            renderPage(i);
            renderPagination();
            window.scrollTo({ top: 0, behavior: "smooth" });
        };

        container.appendChild(btn);
    }

    // Next
    const next = document.createElement("button");
    next.innerText = "»";
    next.disabled = currentPage === totalPages;
    next.onclick = () => {
        renderPage(currentPage + 1);
        renderPagination();
        window.scrollTo({ top: 0, behavior: "smooth" });
    };
    container.appendChild(next);

    const old = document.querySelector(".pagination");
    if (old) old.remove();

    const wrapper = document.getElementById("pagination");
    wrapper.innerHTML = "";
    wrapper.appendChild(container);
}