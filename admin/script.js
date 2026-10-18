// Admin Dashboard Logic
const API = (function () {
    if (localStorage.getItem("admin_api_url")) {
        return localStorage.getItem("admin_api_url").replace(/\/$/, "");
    }
    if (location.port === "10000") {
        return location.origin;
    }
    if (location.hostname === "localhost" || location.hostname === "127.0.0.1") {
        return "http://127.0.0.1:10000";
    }
    return "https://bike-modification-api.onrender.com";
})();



let allUsers = [];
let allSvcs = [];
let allSQs = [];
let allBuilds = [];
let allSales = [];

// Gallery image stores (reset when modal opens)
const galleryStore = { build: [], sales: [] };

function resetGallery(type) {
    galleryStore[type] = [];
    const el = document.getElementById(type === 'build' ? 'buildGallery' : 'saleGallery');
    if (el) el.innerHTML = '';
    const fi = document.getElementById(type === 'build' ? 'buildImgFile' : 'saleImgFile');
    if (fi) fi.value = '';
    const st = document.getElementById(type === 'build' ? 'buildImgStatus' : 'saleImgStatus');
    if (st) st.style.display = 'none';
}

function renderGallery(type) {
    const el = document.getElementById(type === 'build' ? 'buildGallery' : 'saleGallery');
    if (!el) return;
    el.innerHTML = '';
    galleryStore[type].forEach(url => {
        const wrap = document.createElement('div');
        wrap.className = 'gallery-thumb-item';
        const img = document.createElement('img');
        img.src = url;
        const del = document.createElement('button');
        del.className = 'thumb-del';
        del.innerHTML = '\u2715';
        del.title = 'Remove';
        del.onclick = () => {
            const arr = galleryStore[type];
            arr.splice(arr.indexOf(url), 1);
            wrap.remove();
        };
        wrap.appendChild(img);
        wrap.appendChild(del);
        el.appendChild(wrap);
    });
}

window.uploadMultipleImages = async function (fileInput, type, galleryId, statusId) {
    const files = fileInput.files;
    if (!files || !files.length) return;
    const statusEl = statusId ? document.getElementById(statusId) : null;
    if (statusEl) { statusEl.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Uploading…'; statusEl.style.display = 'block'; }
    try {
        const fd = new FormData();
        for (let i = 0; i < files.length; i++) fd.append('files', files[i]);
        fd.append('type', type);
        const res = await fetch(`${API}/api/admin/upload`, { method: 'POST', body: fd });
        const data = await res.json();
        if (!data.success) throw new Error(data.error || 'Upload failed');
        data.urls.forEach(u => galleryStore[type].push(u));
        renderGallery(type);
        if (statusEl) { statusEl.innerHTML = '<i class="fas fa-check-circle"></i> Uploaded'; setTimeout(() => statusEl.style.display = 'none', 2500); }
        showToast('Images uploaded!', 'success');
    } catch (e) {
        if (statusEl) statusEl.innerHTML = '<i class="fas fa-exclamation-circle"></i> ' + escapeHtml(e.message);
        showToast(e.message, 'error');
    }
};

const STATUS_OPTIONS = ["Pending", "In Progress", "Completed", "Cancelled"];

async function apiCall(endpoint, options = {}) {
    try {
        const res = await fetch(`${API}${endpoint}`, options);
        if (!res.ok) {
            if (res.status === 404) {
                throw new Error(`404 Not Found on ${API}${endpoint}. Please restart your backend server (python app.py) to load the new endpoints.`);
            }
            const errData = await res.json().catch(() => ({}));
            throw new Error(errData.error || errData.message || `Server returned HTTP ${res.status}`);
        }
        return await res.json();
    } catch (err) {
        if (err.name === "TypeError" && err.message.includes("Failed to fetch")) {
            throw new Error(`Cannot connect to backend server at ${API}. Ensure 'python app.py' is running.`);
        }
        throw err;
    }
}

// Auth Logic
const loginBtn = document.getElementById("adminLoginBtn");
const logoutBtn = document.getElementById("adminLogoutBtn");
const usernameInput = document.getElementById("adminUser");
const passwordInput = document.getElementById("adminPass");
const loginErr = document.getElementById("loginError");
const loginSec = document.getElementById("loginSection");
const dashSec = document.getElementById("dashboardSection");

if (loginBtn) {
    loginBtn.onclick = () => {
        const u = usernameInput.value.trim();
        const p = passwordInput.value.trim();
        if (u === "admin" && p === "JEBikez@2026") {
            sessionStorage.setItem("je_admin_auth", "true");
            loginErr.style.display = "none";
            showDashboard();
        } else {
            loginErr.textContent = "Invalid admin username or password.";
            loginErr.style.display = "block";
        }
    };
}

if (passwordInput) {
    passwordInput.addEventListener("keydown", (e) => {
        if (e.key === "Enter") loginBtn.click();
    });
}

if (logoutBtn) {
    logoutBtn.onclick = () => {
        sessionStorage.removeItem("je_admin_auth");
        location.reload();
    };
}

// Session check
if (sessionStorage.getItem("je_admin_auth") === "true") {
    showDashboard();
}

function showDashboard() {
    if (loginSec) loginSec.style.display = "none";
    if (dashSec) dashSec.style.display = "block";
    loadAllData();
}

// Tab Navigation (Desktop & Mobile)
function switchTab(tabName) {
    document.querySelectorAll(".nav-item[data-tab]").forEach(x => {
        x.classList.toggle("active", x.dataset.tab === tabName);
    });
    document.querySelectorAll(".mob-nav-item[data-tab]").forEach(x => {
        x.classList.toggle("active", x.dataset.tab === tabName);
    });
    document.querySelectorAll(".tab-section").forEach(x => {
        x.classList.remove("active");
    });
    const target = document.getElementById("section-" + tabName);
    if (target) {
        target.classList.add("active");
        window.scrollTo({ top: 0, behavior: "smooth" });
    }
    closeMobileSidebar();
}

document.querySelectorAll(".nav-item[data-tab]").forEach(btn => {
    btn.addEventListener("click", () => switchTab(btn.dataset.tab));
});

document.querySelectorAll(".mob-nav-item[data-tab]").forEach(btn => {
    btn.addEventListener("click", () => switchTab(btn.dataset.tab));
});

// Mobile Drawer & Overlay Handlers
const hamburgerBtn = document.getElementById("hamburgerBtn");
const sidebarCloseBtn = document.getElementById("sidebarCloseBtn");
const sidebarOverlay = document.getElementById("sidebarOverlay");
const adminSidebar = document.getElementById("adminSidebar");

function openMobileSidebar() {
    if (adminSidebar) adminSidebar.classList.add("open");
    if (sidebarOverlay) sidebarOverlay.classList.add("active");
    document.body.style.overflow = "hidden";
}

function closeMobileSidebar() {
    if (adminSidebar) adminSidebar.classList.remove("open");
    if (sidebarOverlay) sidebarOverlay.classList.remove("active");
    document.body.style.overflow = "";
}

if (hamburgerBtn) hamburgerBtn.onclick = openMobileSidebar;
if (sidebarCloseBtn) sidebarCloseBtn.onclick = closeMobileSidebar;
if (sidebarOverlay) sidebarOverlay.onclick = closeMobileSidebar;

const logoutBtnMobile = document.getElementById("adminLogoutBtnMobile");
if (logoutBtnMobile) {
    logoutBtnMobile.onclick = () => {
        sessionStorage.removeItem("je_admin_auth");
        location.reload();
    };
}

const refreshBtn = document.getElementById("refreshAllBtn");
if (refreshBtn) refreshBtn.onclick = loadAllData;

function loadAllData() {
    loadUsers();
    loadServices();
    loadSalesBookings();
    loadBuilds();
    loadSales();
}

// Users
async function loadUsers() {
    const tbody = document.getElementById("usersTableBody");
    try {
        const data = await apiCall("/api/admin/users");
        if (!data.success) throw new Error(data.error);
        allUsers = data.users || [];
        document.getElementById("usersBadge").textContent = allUsers.length;
        document.getElementById("statUsers").textContent = allUsers.length;
        renderUsers(allUsers);
    } catch (e) {
        if (tbody) tbody.innerHTML = tableErrorRow(e.message, 5);
    }
}

function renderUsers(list) {
    const tbody = document.getElementById("usersTableBody");
    if (!tbody) return;
    if (!list.length) {
        tbody.innerHTML = tableEmptyRow("fa-users", "No registered users found", 5);
        return;
    }
    tbody.innerHTML = list.map(u => {
        const initial = ((u.name || u.email || "?")[0]).toUpperCase();
        const dateStr = u.created_at ? new Date(u.created_at).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "—";
        return `
            <tr>
                <td data-label="User"><span class="user-avatar">${initial}</span><strong>${escapeHtml(u.name || "—")}</strong></td>
                <td data-label="Email" style="color:var(--text-muted)">${escapeHtml(u.email || "—")}</td>
                <td data-label="Mobile">${escapeHtml(u.phone || u.mobile || "—")}</td>
                <td data-label="Joined Date" style="color:var(--text-muted);font-size:12px">${dateStr}</td>
                <td data-label="Account Status"><span class="badge-status ${u.deleted_account ? 'cancelled' : 'completed'}">${u.deleted_account ? 'Deleted' : 'Active'}</span></td>
            </tr>
        `;
    }).join("");
}

window.filterUsers = function () {
    const q = (document.getElementById("userSearchInput").value || "").toLowerCase();
    const filtered = allUsers.filter(u =>
        (u.name || "").toLowerCase().includes(q) ||
        (u.email || "").toLowerCase().includes(q) ||
        (u.phone || u.mobile || "").includes(q)
    );
    renderUsers(filtered);
};

// Services
async function loadServices() {
    const tbody = document.getElementById("servicesTableBody");
    try {
        const data = await apiCall("/api/admin/services");
        if (!data.success) throw new Error(data.error);
        allSvcs = data.services || [];
        document.getElementById("servicesBadge").textContent = allSvcs.length;
        document.getElementById("statServices").textContent = allSvcs.length;
        renderServices();
        renderRecentBookings();
    } catch (e) {
        if (tbody) tbody.innerHTML = tableErrorRow(e.message, 7);
    }
}

function renderServices() {
    const tbody = document.getElementById("servicesTableBody");
    if (!tbody) return;
    if (!allSvcs.length) {
        tbody.innerHTML = tableEmptyRow("fa-tools", "No service bookings found", 7);
        return;
    }
    tbody.innerHTML = allSvcs.map(s => {
        const bikeName = s.manufacturer ? `${s.manufacturer} ${s.model || ""}` : (s.bike ? `${s.bike.manufacturer || ""} ${s.bike.model || ""}` : "—");
        const regInfo = s.register_number ? `<br><span style="display:inline-block;background:rgba(255,255,255,0.06);padding:2px 6px;border-radius:4px;font-size:11px;font-weight:600;letter-spacing:0.5px;color:var(--text-primary);margin-top:3px;">${escapeHtml(s.register_number)}</span>` : "";
        const odoInfo = s.odo_km ? `<span style="font-size:11px;color:var(--text-muted);margin-left:4px;">• ${escapeHtml(s.odo_km)} KM</span>` : "";
        const dateStr = s.date ? new Date(s.date).toLocaleDateString("en-GB") : "—";
        const currentStatus = s.status || "Pending";
        const optionsHtml = STATUS_OPTIONS.map(opt => `<option value="${opt}" ${opt === currentStatus ? "selected" : ""}>${opt}</option>`).join("");
        return `
            <tr>
                <td data-label="Booking ID" style="font-size:11px;color:var(--text-muted);font-family:monospace">${s.booking_id ? s.booking_id.slice(-8) : "—"}</td>
                <td data-label="User ID" style="font-size:12px;color:var(--text-muted)">${s.user_id ? s.user_id.slice(-8) : "—"}</td>
                <td data-label="Bike Info"><strong>${escapeHtml(bikeName.trim() || "—")}</strong>${regInfo}${odoInfo}</td>
                <td data-label="Service Package">${escapeHtml(s.serviceType || "—")}</td>
                <td data-label="Date" style="font-size:12px">${dateStr}</td>
                <td data-label="Current Status"><span class="badge-status ${statusClass(currentStatus)}">${currentStatus}</span></td>
                <td data-label="Change Status">
                    <select class="status-select" onchange="updateServiceStatus('${s.booking_id}', this.value, this)">
                        ${optionsHtml}
                    </select>
                </td>
            </tr>
        `;
    }).join("");
}

function renderRecentBookings() {
    const tbody = document.getElementById("recentServicesTableBody");
    if (!tbody) return;
    const recent = allSvcs.slice(0, 5);
    if (!recent.length) {
        tbody.innerHTML = `<tr class="loading-row"><td colspan="5">No recent bookings</td></tr>`;
        return;
    }
    tbody.innerHTML = recent.map(s => {
        const bikeName = s.manufacturer ? `${s.manufacturer} ${s.model || ""}` : "—";
        const regBadge = s.register_number ? `<br><span style="font-size:10px;font-weight:600;color:var(--text-muted);">${escapeHtml(s.register_number)}</span>` : "";
        const odoBadge = s.odo_km ? `<span style="font-size:10px;color:var(--text-muted);"> • ${escapeHtml(s.odo_km)} KM</span>` : "";
        const dateStr = s.date ? new Date(s.date).toLocaleDateString("en-GB") : "—";
        const currentStatus = s.status || "Pending";
        return `
            <tr>
                <td data-label="User ID" style="font-size:12px;color:var(--text-muted);font-family:monospace">${s.user_id ? s.user_id.slice(-8) : "—"}</td>
                <td data-label="Bike"><strong>${escapeHtml(bikeName.trim() || "—")}</strong>${regBadge}${odoBadge}</td>
                <td data-label="Service Type">${escapeHtml(s.serviceType || "—")}</td>
                <td data-label="Preferred Date" style="font-size:12px">${dateStr}</td>
                <td data-label="Status"><span class="badge-status ${statusClass(currentStatus)}">${currentStatus}</span></td>
            </tr>
        `;
    }).join("");
}

window.updateServiceStatus = async function (id, status, selectEl) {
    try {
        const data = await apiCall(`/api/admin/services/${id}/status`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status })
        });
        if (!data.success) throw new Error(data.error);
        const badge = selectEl.closest("tr").querySelector(".badge-status");
        if (badge) {
            badge.textContent = status;
            badge.className = "badge-status " + statusClass(status);
        }
        showToast("Service booking status updated: " + status, "success");
    } catch (e) {
        showToast(e.message, "error");
    }
};

// Sale Bookings / Inquiries
async function loadSalesBookings() {
    const tbody = document.getElementById("saleInquiriesTableBody");
    try {
        const data = await apiCall("/api/admin/sales-bookings");
        if (!data.success) throw new Error(data.error);
        allSQs = data.sales_bookings || [];
        document.getElementById("saleInquiriesBadge").textContent = allSQs.length;
        renderSalesBookings();
    } catch (e) {
        if (tbody) tbody.innerHTML = tableErrorRow(e.message, 7);
    }
}

function renderSalesBookings() {
    const tbody = document.getElementById("saleInquiriesTableBody");
    if (!tbody) return;
    if (!allSQs.length) {
        tbody.innerHTML = tableEmptyRow("fa-tag", "No sale inquiries found", 7);
        return;
    }
    tbody.innerHTML = allSQs.map(s => {
        const dateStr = s.date ? new Date(s.date).toLocaleDateString("en-GB") : "—";
        const currentStatus = s.status || "Pending";
        const optionsHtml = STATUS_OPTIONS.map(opt => `<option value="${opt}" ${opt === currentStatus ? "selected" : ""}>${opt}</option>`).join("");
        return `
            <tr>
                <td data-label="Buyer Name"><strong>${escapeHtml(s.name || "—")}</strong></td>
                <td data-label="Phone"><a href="tel:${s.phone}" style="color:var(--primary);text-decoration:none">${escapeHtml(s.phone || "—")}</a></td>
                <td data-label="Bike Requested">${escapeHtml(s.bike_name || "—")}</td>
                <td data-label="Location">${escapeHtml(s.location || "—")}</td>
                <td data-label="Date" style="font-size:12px">${dateStr}</td>
                <td data-label="Status"><span class="badge-status ${statusClass(currentStatus)}">${currentStatus}</span></td>
                <td data-label="Change Status">
                    <select class="status-select" onchange="updateSaleBookingStatus('${s._id}', this.value, this)">
                        ${optionsHtml}
                    </select>
                </td>
            </tr>
        `;
    }).join("");
}

window.updateSaleBookingStatus = async function (id, status, selectEl) {
    try {
        const data = await apiCall(`/api/admin/sales-bookings/${id}/status`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status })
        });
        if (!data.success) throw new Error(data.error);
        const badge = selectEl.closest("tr").querySelector(".badge-status");
        if (badge) {
            badge.textContent = status;
            badge.className = "badge-status " + statusClass(status);
        }
        showToast("Inquiry status updated: " + status, "success");
    } catch (e) {
        showToast(e.message, "error");
    }
};

// Builds CRUD
async function loadBuilds() {
    const tbody = document.getElementById("buildsTableBody");
    try {
        const data = await apiCall("/api/builds");
        if (!data.success) throw new Error(data.error);
        allBuilds = data.builds || [];
        document.getElementById("buildsBadge").textContent = allBuilds.length;
        document.getElementById("statBuilds").textContent = allBuilds.length;
        renderBuilds();
    } catch (e) {
        if (tbody) tbody.innerHTML = tableErrorRow(e.message, 6);
    }
}

function renderBuilds() {
    const tbody = document.getElementById("buildsTableBody");
    if (!tbody) return;
    if (!allBuilds.length) {
        tbody.innerHTML = tableEmptyRow("fa-hammer", "No build projects yet. Click 'Add Build' to add one!", 6);
        return;
    }
    tbody.innerHTML = allBuilds.map(b => {
        const img = (b.images && b.images[0] && b.images[0].url) || b.afterImg || "";
        let videoBadge = "";
        if (b.videoUrl) {
            const vUrl = String(b.videoUrl).trim();
            if (/instagram\.com\/(?:reel|reels|p|tv)\//i.test(vUrl)) {
                videoBadge = `<br><a href="${escapeHtml(vUrl)}" target="_blank" rel="noopener" style="display:inline-flex;align-items:center;gap:4px;color:#E1306C;font-size:11px;font-weight:600;text-decoration:none;margin-top:4px;"><i class="fab fa-instagram"></i> Instagram Reel</a>`;
            } else if (/youtube\.com\/shorts\//i.test(vUrl)) {
                videoBadge = `<br><a href="${escapeHtml(vUrl)}" target="_blank" rel="noopener" style="display:inline-flex;align-items:center;gap:4px;color:#ff3333;font-size:11px;font-weight:600;text-decoration:none;margin-top:4px;"><i class="fab fa-youtube"></i> YouTube Short</a>`;
            } else if (/youtu\.be|youtube\.com/i.test(vUrl)) {
                videoBadge = `<br><a href="${escapeHtml(vUrl)}" target="_blank" rel="noopener" style="display:inline-flex;align-items:center;gap:4px;color:#ff3333;font-size:11px;font-weight:600;text-decoration:none;margin-top:4px;"><i class="fab fa-youtube"></i> YouTube Video</a>`;
            } else {
                videoBadge = `<br><a href="${escapeHtml(vUrl)}" target="_blank" rel="noopener" style="display:inline-flex;align-items:center;gap:4px;color:var(--primary);font-size:11px;font-weight:600;text-decoration:none;margin-top:4px;"><i class="fas fa-video"></i> Video Link</a>`;
            }
        }
        return `
            <tr>
                <td data-label="Preview">${img ? `<img src="${img}" style="width:58px;height:42px;object-fit:cover;border-radius:6px;border:1px solid var(--border)">` : "—"}</td>
                <td data-label="Project Title"><strong>${escapeHtml(b.title || "—")}</strong><br><span style="font-size:11px;color:var(--text-muted)">${escapeHtml(b.subtitle || "")}</span>${videoBadge}</td>
                <td data-label="Category"><span class="badge-status pending" style="font-size:11px">${escapeHtml(b.categoryLabel || b.category || "—")}</span></td>
                <td data-label="Approx Cost">${escapeHtml(b.cost || "—")}</td>
                <td data-label="Duration">${escapeHtml(b.duration || "—")}</td>
                <td data-label="Actions">
                    <button class="btn btn-secondary btn-sm" onclick="editBuild('${b._id}')"><i class="fas fa-edit"></i> Edit</button>
                    <button class="btn btn-danger btn-sm" onclick="deleteBuild('${b._id}')"><i class="fas fa-trash"></i></button>
                </td>
            </tr>
        `;
    }).join("");
}

// Live Video URL detection and preview in Admin Modal
window.previewBuildVideo = function () {
    const input = document.getElementById("buildVideoUrl");
    const container = document.getElementById("buildVideoPreviewContainer");
    if (!input || !container) return;

    let url = input.value.trim();
    if (!url) {
        container.style.display = "none";
        container.innerHTML = "";
        return;
    }

    // Auto-prepend https:// if omitted
    if (!/^https?:\/\//i.test(url) && (url.includes("instagram.com") || url.includes("youtube.com") || url.includes("youtu.be"))) {
        url = "https://" + url;
        input.value = url;
    }

    container.style.display = "block";

    const isInstagram = /instagram\.com\/(?:reel|reels|p|tv)\/([A-Za-z0-9_-]+)/i.test(url);
    const isYtShort = /youtube\.com\/shorts\/([A-Za-z0-9_-]+)/i.test(url);
    const isYt = /youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/)/i.test(url);
    const isDirect = /\.(mp4|webm|ogg)(\?|$)/i.test(url) || url.includes('/video/upload/');

    if (isInstagram) {
        const match = url.match(/instagram\.com\/(?:reel|reels|p|tv)\/([A-Za-z0-9_-]+)/i);
        const code = match ? match[1] : "";
        container.innerHTML = `
            <div style="margin-top:8px;padding:9px 13px;border-radius:8px;background:rgba(225,48,108,0.1);border:1px solid rgba(225,48,108,0.3);display:flex;align-items:center;justify-content:space-between;gap:8px;flex-wrap:wrap;">
                <div style="display:flex;align-items:center;gap:8px;color:#E1306C;font-size:12px;font-weight:600;">
                    <i class="fab fa-instagram" style="font-size:16px;"></i>
                    <span>Instagram Reel Identified (${escapeHtml(code)})</span>
                </div>
                <a href="${escapeHtml(url)}" target="_blank" rel="noopener" style="font-size:12px;color:#E1306C;font-weight:600;text-decoration:underline;display:inline-flex;align-items:center;gap:4px;">
                    Test Reel Link <i class="fas fa-external-link-alt" style="font-size:10px;"></i>
                </a>
            </div>
        `;
    } else if (isYtShort) {
        container.innerHTML = `
            <div style="margin-top:8px;padding:9px 13px;border-radius:8px;background:rgba(255,0,0,0.1);border:1px solid rgba(255,0,0,0.3);display:flex;align-items:center;justify-content:space-between;gap:8px;flex-wrap:wrap;">
                <div style="display:flex;align-items:center;gap:8px;color:#ff3333;font-size:12px;font-weight:600;">
                    <i class="fab fa-youtube" style="font-size:16px;"></i>
                    <span>YouTube Short Identified</span>
                </div>
                <a href="${escapeHtml(url)}" target="_blank" rel="noopener" style="font-size:12px;color:#ff3333;font-weight:600;text-decoration:underline;display:inline-flex;align-items:center;gap:4px;">
                    Test Short Link <i class="fas fa-external-link-alt" style="font-size:10px;"></i>
                </a>
            </div>
        `;
    } else if (isYt) {
        container.innerHTML = `
            <div style="margin-top:8px;padding:9px 13px;border-radius:8px;background:rgba(255,0,0,0.1);border:1px solid rgba(255,0,0,0.3);display:flex;align-items:center;justify-content:space-between;gap:8px;flex-wrap:wrap;">
                <div style="display:flex;align-items:center;gap:8px;color:#ff3333;font-size:12px;font-weight:600;">
                    <i class="fab fa-youtube" style="font-size:16px;"></i>
                    <span>YouTube Video Identified</span>
                </div>
                <a href="${escapeHtml(url)}" target="_blank" rel="noopener" style="font-size:12px;color:#ff3333;font-weight:600;text-decoration:underline;display:inline-flex;align-items:center;gap:4px;">
                    Test Video Link <i class="fas fa-external-link-alt" style="font-size:10px;"></i>
                </a>
            </div>
        `;
    } else if (isDirect) {
        container.innerHTML = `
            <div style="margin-top:8px;padding:9px 13px;border-radius:8px;background:rgba(30,144,255,0.1);border:1px solid rgba(30,144,255,0.3);display:flex;align-items:center;justify-content:space-between;gap:8px;flex-wrap:wrap;">
                <div style="display:flex;align-items:center;gap:8px;color:#1e90ff;font-size:12px;font-weight:600;">
                    <i class="fas fa-play" style="font-size:13px;"></i>
                    <span>Direct Video URL Identified</span>
                </div>
                <a href="${escapeHtml(url)}" target="_blank" rel="noopener" style="font-size:12px;color:#1e90ff;font-weight:600;text-decoration:underline;display:inline-flex;align-items:center;gap:4px;">
                    Test Link <i class="fas fa-external-link-alt" style="font-size:10px;"></i>
                </a>
            </div>
        `;
    } else {
        container.innerHTML = `
            <div style="margin-top:8px;padding:9px 13px;border-radius:8px;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);display:flex;align-items:center;justify-content:space-between;gap:8px;flex-wrap:wrap;">
                <div style="display:flex;align-items:center;gap:8px;color:var(--text-muted);font-size:12px;">
                    <i class="fas fa-link"></i>
                    <span>Video / External Link</span>
                </div>
                <a href="${escapeHtml(url)}" target="_blank" rel="noopener" style="font-size:12px;color:var(--primary);font-weight:600;text-decoration:underline;display:inline-flex;align-items:center;gap:4px;">
                    Test Link <i class="fas fa-external-link-alt" style="font-size:10px;"></i>
                </a>
            </div>
        `;
    }
};

const addBuildBtn = document.getElementById("addBuildBtn");
if (addBuildBtn) {
    addBuildBtn.onclick = () => {
        document.getElementById("buildEditId").value = "";
        document.getElementById("buildModalTitle").textContent = "Add Custom Build Project";
        ["buildTitle", "buildSubtitle", "buildCost", "buildDuration", "buildEngine", "buildPower", "buildBeforeImg", "buildAfterImg", "buildMods", "buildVideoUrl"].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.value = "";
        });
        const prevContainer = document.getElementById("buildVideoPreviewContainer");
        if (prevContainer) {
            prevContainer.style.display = "none";
            prevContainer.innerHTML = "";
        }
        ["buildBeforeImgFile", "buildAfterImgFile"].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.value = "";
        });
        ["buildBeforeStatus", "buildAfterStatus"].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.style.display = "none";
        });
        ["buildBeforeImgPreview", "buildAfterImgPreview"].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.style.display = "none";
        });
        resetGallery('build');
        openModal("buildModal");
    };
}

window.editBuild = function (id) {
    const b = allBuilds.find(x => x._id === id);
    if (!b) return;
    document.getElementById("buildEditId").value = id;
    document.getElementById("buildModalTitle").textContent = "Edit Build Project";
    document.getElementById("buildTitle").value = b.title || "";
    document.getElementById("buildSubtitle").value = b.subtitle || "";
    document.getElementById("buildCategory").value = b.category || "caferacer";
    document.getElementById("buildCost").value = b.cost || "";
    document.getElementById("buildDuration").value = b.duration || "";
    document.getElementById("buildEngine").value = b.engine || "";
    document.getElementById("buildPower").value = b.powerGain || "";
    document.getElementById("buildBeforeImg").value = b.beforeImg || "";
    document.getElementById("buildAfterImg").value = b.afterImg || "";
    document.getElementById("buildMods").value = (b.mods || []).join("\n");
    const videoInput = document.getElementById("buildVideoUrl");
    if (videoInput) {
        videoInput.value = b.videoUrl || b.video_url || b.videoLink || "";
        window.previewBuildVideo();
    }
    resetGallery('build');
    if (Array.isArray(b.images) && b.images.length) {
        b.images.forEach(img => galleryStore.build.push(img.url || img));
        renderGallery('build');
    }
    openModal("buildModal");
};

window.saveBuild = async function () {
    const title = document.getElementById("buildTitle").value.trim();
    if (!title) { showToast("Title is required", "error"); return; }
    const id = document.getElementById("buildEditId").value;
    const catSelect = document.getElementById("buildCategory");
    let videoUrl = document.getElementById("buildVideoUrl") ? document.getElementById("buildVideoUrl").value.trim() : "";
    if (videoUrl && !/^https?:\/\//i.test(videoUrl)) {
        videoUrl = "https://" + videoUrl;
    }
    const payload = {
        title,
        subtitle: document.getElementById("buildSubtitle").value.trim(),
        category: catSelect.value,
        categoryLabel: catSelect.options[catSelect.selectedIndex].text,
        cost: document.getElementById("buildCost").value.trim(),
        duration: document.getElementById("buildDuration").value.trim(),
        engine: document.getElementById("buildEngine").value.trim(),
        powerGain: document.getElementById("buildPower").value.trim(),
        images: galleryStore.build.map(url => ({ url, caption: title })),
        beforeImg: document.getElementById("buildBeforeImg").value.trim(),
        afterImg: document.getElementById("buildAfterImg").value.trim(),
        mods: document.getElementById("buildMods").value.split("\n").map(s => s.trim()).filter(Boolean),
        videoUrl
    };
    try {
        const path = id ? `/api/builds/${id}` : `/api/builds`;
        const method = id ? "PUT" : "POST";
        const data = await apiCall(path, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
        if (!data.success) throw new Error(data.error);
        closeModal("buildModal");
        showToast(id ? "Build updated successfully!" : "Build project created!", "success");
        loadBuilds();
    } catch (e) { showToast(e.message, "error"); }
};

window.deleteBuild = async function (id) {
    if (!confirm("Are you sure you want to delete this build project?")) return;
    try {
        const data = await apiCall(`/api/builds/${id}`, { method: "DELETE" });
        if (!data.success) throw new Error(data.error);
        showToast("Build project deleted", "success");
        loadBuilds();
    } catch (e) {
        showToast(e.message, "error");
    }
};

// Sales CRUD
async function loadSales() {
    const tbody = document.getElementById("salesTableBody");
    try {
        const data = await apiCall("/api/sales");
        if (!data.success) throw new Error(data.error);
        allSales = data.sales || [];
        document.getElementById("salesBadge").textContent = allSales.length;
        document.getElementById("statSales").textContent = allSales.length;
        renderSales();
    } catch (e) {
        if (tbody) tbody.innerHTML = tableErrorRow(e.message, 6);
    }
}

function renderSales() {
    const tbody = document.getElementById("salesTableBody");
    if (!tbody) return;
    if (!allSales.length) {
        tbody.innerHTML = tableEmptyRow("fa-motorcycle", "No sales bikes yet. Click 'Add Bike' to add one!", 6);
        return;
    }
    tbody.innerHTML = allSales.map(s => {
        const img = (s.images && s.images[0] && s.images[0].url) || s.imageUrl || "";
        return `
            <tr>
                <td data-label="Preview">${img ? `<img src="${img}" style="width:58px;height:42px;object-fit:cover;border-radius:6px;border:1px solid var(--border)">` : "—"}</td>
                <td data-label="Model Name"><strong>${escapeHtml(s.name || "—")}</strong><br><span style="font-size:11px;color:var(--text-muted)">${escapeHtml(s.subtitle || "")}</span></td>
                <td data-label="Category"><span class="badge-status in-progress" style="font-size:11px">${escapeHtml(s.categoryLabel || s.category || "—")}</span></td>
                <td data-label="Price"><strong>${escapeHtml(s.price || "—")}</strong></td>
                <td data-label="Year / KM" style="font-size:12px;color:var(--text-muted)">${escapeHtml(s.year || "—")} / ${escapeHtml(s.km || "—")}</td>
                <td data-label="Actions">
                    <button class="btn btn-secondary btn-sm" onclick="editSale('${s._id}')"><i class="fas fa-edit"></i> Edit</button>
                    <button class="btn btn-danger btn-sm" onclick="deleteSale('${s._id}')"><i class="fas fa-trash"></i></button>
                </td>
            </tr>
        `;
    }).join("");
}

const addSaleBtn = document.getElementById("addSaleBtn");
if (addSaleBtn) {
    addSaleBtn.onclick = () => {
        document.getElementById("saleEditId").value = "";
        document.getElementById("saleModalTitle").textContent = "Add Certified Sale Bike";
        ["saleName", "saleSubtitle", "salePrice", "saleEmi", "saleYear", "saleKm", "saleCc", "saleOwners", "saleCheckpoints"].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.value = "";
        });
        resetGallery('sales');
        openModal("saleModal");
    };
}

window.editSale = function (id) {
    const s = allSales.find(x => x._id === id);
    if (!s) return;
    document.getElementById("saleEditId").value = id;
    document.getElementById("saleModalTitle").textContent = "Edit Sale Bike";
    document.getElementById("saleName").value = s.name || "";
    document.getElementById("saleSubtitle").value = s.subtitle || "";
    document.getElementById("saleCategory").value = s.category || "supersport";
    document.getElementById("salePrice").value = s.price || "";
    document.getElementById("saleEmi").value = s.emi || "";
    document.getElementById("saleYear").value = s.year || "";
    document.getElementById("saleKm").value = s.km || "";
    document.getElementById("saleCc").value = s.cc || "";
    document.getElementById("saleOwners").value = s.owners || "";
    document.getElementById("saleCheckpoints").value = (s.checkpoints || []).join("\n");
    resetGallery('sales');
    if (Array.isArray(s.images) && s.images.length) {
        s.images.forEach(img => galleryStore.sales.push(img.url || img));
        renderGallery('sales');
    }
    openModal("saleModal");
};

window.saveSale = async function () {
    const name = document.getElementById("saleName").value.trim();
    if (!name) { showToast("Bike Name is required", "error"); return; }
    const id = document.getElementById("saleEditId").value;
    const catSelect = document.getElementById("saleCategory");
    const payload = {
        name,
        subtitle: document.getElementById("saleSubtitle").value.trim(),
        category: catSelect.value,
        categoryLabel: catSelect.options[catSelect.selectedIndex].text,
        price: document.getElementById("salePrice").value.trim(),
        emi: document.getElementById("saleEmi").value.trim(),
        year: document.getElementById("saleYear").value.trim(),
        km: document.getElementById("saleKm").value.trim(),
        cc: document.getElementById("saleCc").value.trim(),
        owners: document.getElementById("saleOwners").value.trim(),
        images: galleryStore.sales.map(url => ({ url, caption: name })),
        checkpoints: document.getElementById("saleCheckpoints").value.split("\n").map(s => s.trim()).filter(Boolean),
        verified: true
    };

    try {
        const path = id ? `/api/sales/${id}` : `/api/sales`;
        const method = id ? "PUT" : "POST";
        const data = await apiCall(path, {
            method,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });
        if (!data.success) throw new Error(data.error);
        closeModal("saleModal");
        showToast(id ? "Sale bike updated successfully!" : "Sale bike added successfully!", "success");
        loadSales();
    } catch (e) {
        showToast(e.message, "error");
    }
};

window.deleteSale = async function (id) {
    if (!confirm("Are you sure you want to remove this bike from sales?")) return;
    try {
        const data = await apiCall(`/api/sales/${id}`, { method: "DELETE" });
        if (!data.success) throw new Error(data.error);
        showToast("Bike removed from sales", "success");
        loadSales();
    } catch (e) {
        showToast(e.message, "error");
    }
};

// Helpers
function statusClass(st) {
    return st ? st.toLowerCase().replace(/ /g, "-") : "pending";
}

function tableErrorRow(msg, cols) {
    return `<tr class="loading-row"><td colspan="${cols}" style="color:var(--status-danger)">Failed to load data: ${escapeHtml(msg)}</td></tr>`;
}

function tableEmptyRow(icon, text, cols) {
    return `<tr class="loading-row"><td colspan="${cols}"><div class="empty-state"><i class="fas ${icon}"></i><p>${escapeHtml(text)}</p></div></td></tr>`;
}

window.previewImage = function (inputId, previewId) {
    const url = document.getElementById(inputId).value.trim();
    const preview = document.getElementById(previewId);
    if (url) {
        preview.src = url;
        preview.style.display = "block";
    } else {
        preview.style.display = "none";
    }
};

window.uploadImage = async function (fileInput, type, targetInputId, previewId, statusId) {
    const file = fileInput.files && fileInput.files[0];
    if (!file) return;

    const statusEl = statusId ? document.getElementById(statusId) : null;
    if (statusEl) {
        statusEl.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Uploading to Cloudinary (' + (type === "sales" ? "je-bikez/sales" : "je-bikez/build") + ')...';
        statusEl.style.display = "block";
        statusEl.style.color = "var(--primary)";
    }

    try {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("type", type);

        const res = await fetch(`${API}/api/admin/upload`, {
            method: "POST",
            body: formData
        });
        const data = await res.json();

        if (!data.success) {
            throw new Error(data.error || "Upload failed");
        }

        const targetInput = document.getElementById(targetInputId);
        if (targetInput) {
            targetInput.value = data.url;
        }

        if (previewId) {
            const preview = document.getElementById(previewId);
            if (preview) {
                preview.src = data.url;
                preview.style.display = "block";
            }
        }

        if (statusEl) {
            statusEl.innerHTML = '<i class="fas fa-check-circle" style="color:var(--status-success)"></i> Uploaded successfully!';
            setTimeout(() => { statusEl.style.display = "none"; }, 3500);
        }
        showToast("Image uploaded to Cloudinary!", "success");
    } catch (err) {
        if (statusEl) {
            statusEl.innerHTML = '<i class="fas fa-exclamation-circle" style="color:var(--status-danger)"></i> ' + escapeHtml(err.message);
        }
        showToast("Upload failed: " + err.message, "error");
    }
};

window.openModal = function (id) {
    const modal = document.getElementById(id);
    if (modal) modal.classList.add("open");
};

window.closeModal = function (id) {
    const modal = document.getElementById(id);
    if (modal) modal.classList.remove("open");
};

document.querySelectorAll(".modal-backdrop").forEach(m => {
    m.addEventListener("click", (e) => {
        if (e.target === m) m.classList.remove("open");
    });
});

function showToast(msg, type = "success") {
    const el = document.createElement("div");
    el.className = `toast ${type}`;
    el.innerHTML = `<i class="fas fa-${type === "success" ? "check-circle" : "exclamation-circle"}"></i><span>${escapeHtml(msg)}</span>`;
    const container = document.getElementById("toastContainer");
    if (container) {
        container.appendChild(el);
        setTimeout(() => el.remove(), 3500);
    }
}

function escapeHtml(str) {
    return String(str || "").replace(/[&<>"']/g, s => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    })[s]);
}
