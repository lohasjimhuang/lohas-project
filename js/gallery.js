document.addEventListener("DOMContentLoaded", () => {
      const SUPABASE_URL = "https://mbmuextzyyhseibruaop.supabase.co";
      const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1ibXVleHR6eXloc2VpYnJ1YW9wIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY4NTUxNzMsImV4cCI6MjA5MjQzMTE3M30.F6iclxio0NijUmp5pTYgNlMElg42J6fbai0XJEdnQoM";
      const SUPABASE_BUCKET = "gallery-uploads";
      const SUPABASE_TABLE = "gallery_posts";
      const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

      const state = {
        selectedSlot: null,
        draggedSlot: null,
        images: [null, null, null],
        files: [null, null, null],
  isPreviewMode: false
      };

      const menu = document.getElementById("mobile-menu");
      const navList = document.getElementById("nav-list");
      const openUploadBtns = document.querySelectorAll(".js-open-upload");
      const uploadModal = document.getElementById("uploadModal");
      const detailModal = document.getElementById("detailModal");
      const closeDetail = document.getElementById("closeDetail");
      const detailBody = document.getElementById("detailBody");
      const closeUpload = document.getElementById("closeUpload");
      const fileInput = document.getElementById("fileInput");
      const uploadBoxes = document.querySelectorAll(".upload-box");
      const shareText = document.getElementById("shareText");
      const currentChar = document.getElementById("currentChar");
      const workTitle = document.getElementById("workTitle");
      const workTitleError = document.getElementById("workTitleError");
      const workCategory = document.getElementById("workCategory");
      const carrierCategory = document.getElementById("carrierCategory");
      const previewBtn = document.getElementById("previewBtn");
      const submitBtn = document.getElementById("submitBtn");
      const galleryGrid = document.getElementById("galleryGrid");
      const toast = document.getElementById("toast");
      const mobileFilterBtn = document.getElementById("mobileFilterBtn");
      const mobileTopicFilter = document.getElementById("mobileTopicFilter");
      const mobileCarrierFilter = document.getElementById("mobileCarrierFilter");
      const filterDrawer = document.getElementById("filterDrawer");
      const drawerClose = document.getElementById("drawerClose");
      const drawerApply = document.getElementById("drawerApply");
      const drawerReset = document.getElementById("drawerReset");
      const desktopTopicFilter = document.getElementById("desktopTopicFilter");
      const desktopCarrierFilter = document.getElementById("desktopCarrierFilter");
      const desktopSearchInput = document.getElementById("desktopSearchInput");
      const mobileSearchInput = document.getElementById("mobileSearchInput");
      const resultMeta = document.querySelector(".result-meta");

      const filterState = {
        topic: "全部作品",
        carrier: "全部位置",
        keyword: ""
      };

      function showToast(message) {
        toast.textContent = message;
        toast.classList.add("is-show");
        window.clearTimeout(showToast.timer);
        showToast.timer = window.setTimeout(() => {
          toast.classList.remove("is-show");
        }, 1800);
      }

      function openModal() {
        uploadModal.classList.add("is-open");
        uploadModal.setAttribute("aria-hidden", "false");
        document.body.style.overflow = "hidden";
      }

      function closeModal() {
        uploadModal.classList.remove("is-open");
        uploadModal.setAttribute("aria-hidden", "true");
        document.body.style.overflow = "";
      }

      function openDetailModal(card) {
        const images = (card.dataset.images || card.querySelector("img")?.src || "").split(",").map(item => item.trim()).filter(Boolean);
        const title = card.querySelector(".title")?.textContent || "未命名作品";
        const topic = card.dataset.topic || "未分類主題";
        const carrier = card.dataset.carrier || "未分類位置";
        const name = card.dataset.name || card.querySelector(".desc")?.textContent || "顧客";
        const story = card.dataset.story || "這是一份來自顧客分享的刻圖作品。";
        const mainImage = images[0] || "images/lens-01.jpg";
        const subImages = images.slice(1, 3);

        detailBody.innerHTML = `
          <div class="detail-gallery">
            <div class="detail-main-image"><img src="${mainImage}" alt="${title}" /></div>
            <div class="detail-sub-list">
              ${subImages.map(src => `<div class="detail-sub-image"><img src="${src}" alt="${title}" /></div>`).join("")}
            </div>
          </div>
          <div class="detail-title-row">
  <h3 class="detail-title">${title}</h3>
  <span class="detail-user">${name}</span>
</div>

<div class="detail-meta">
  <span class="detail-chip">${topic}</span>
  <span class="detail-chip">${carrier}</span>
</div>
          <p class="detail-story">${story}</p>
        `;

        detailModal.classList.add("is-open");
        detailModal.setAttribute("aria-hidden", "false");
        document.body.style.overflow = "hidden";
      }

      function closeDetailModal() {
  detailModal.classList.remove("is-open");
  detailModal.setAttribute("aria-hidden", "true");

  if (state.isPreviewMode) {
    uploadModal.classList.add("is-open");
    uploadModal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
    state.isPreviewMode = false;
  } else {
    document.body.style.overflow = "";
  }
}

      function resetBox(slot) {
        const box = document.querySelector(`.upload-box[data-slot="${slot}"]`);
        const isMain = box.classList.contains("main-upload");

        box.classList.remove("has-image");
        box.setAttribute("draggable", "false");
        box.innerHTML = `
          ${isMain ? '<span class="badge-main">首圖</span>' : ''}
          <div class="upload-placeholder">
            <i class="fa-regular fa-image"></i>
            <p>新增圖片</p>
            <span class="upload-hint">${isMain ? "點擊選擇，或拖曳圖片到這裡" : "副圖"}</span>
          </div>
        `;
      }

      function renderBox(slot) {
        const box = document.querySelector(`.upload-box[data-slot="${slot}"]`);
        const image = state.images[slot];

        if (!image) {
          resetBox(slot);
          return;
        }

        const isMain = box.classList.contains("main-upload");
        box.classList.add("has-image");
        box.setAttribute("draggable", "true");
        box.innerHTML = `
          ${isMain ? '<span class="badge-main">首圖</span>' : ''}
          <img class="preview-image" src="${image}" alt="上傳預覽圖片" />
          <button class="delete-btn" type="button" data-delete-slot="${slot}" aria-label="刪除圖片">
            <i class="fas fa-times"></i>
          </button>
        `;
      }

      let cropper = null;
let cropTargetSlot = null;
let cropTargetFile = null;

function readImageFile(file, slot) {
  if (!file) return;

  if (!file.type.startsWith("image/")) {
    showToast("請上傳圖片格式");
    return;
  }

  cropTargetSlot = slot;
  cropTargetFile = file;

  const reader = new FileReader();

  reader.onload = event => {
    const cropModal = document.getElementById("cropModal");
    const cropImage = document.getElementById("cropImage");

    cropImage.src = event.target.result;
    cropModal.classList.add("is-open");
    cropModal.setAttribute("aria-hidden", "false");

    if (cropper) cropper.destroy();

    cropper = new Cropper(cropImage, {
      aspectRatio: 1,
      viewMode: 1,
      dragMode: "move",
      autoCropArea: 1,
      responsive: true,
      background: false,
      movable: true,
      zoomable: true,
      scalable: false,
      rotatable: false
    });
  };

  reader.readAsDataURL(file);
}

function base64ToFile(base64, filename) {
  const arr = base64.split(",");
  const mime = arr[0].match(/:(.*?);/)[1];
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);

  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }

  return new File([u8arr], filename, { type: mime });
}

document.getElementById("applyCrop").addEventListener("click", () => {
  if (!cropper || cropTargetSlot === null) return;

  const canvas = cropper.getCroppedCanvas({
    width: 1200,
    height: 1200,
    imageSmoothingQuality: "high"
  });

  const croppedBase64 = canvas.toDataURL("image/jpeg", 0.9);

  state.images[cropTargetSlot] = croppedBase64;
  state.files[cropTargetSlot] = base64ToFile(
    croppedBase64,
    `gallery_${Date.now()}_${cropTargetSlot}.jpg`
  );

  renderBox(cropTargetSlot);

  document.getElementById("cropModal").classList.remove("is-open");

  cropper.destroy();
  cropper = null;
  cropTargetSlot = null;
});

document.getElementById("cancelCrop").addEventListener("click", () => {
  document.getElementById("cropModal").classList.remove("is-open");
  if (cropper) cropper.destroy();
  cropper = null;
  cropTargetSlot = null;
});

document.getElementById("closeCrop").addEventListener("click", () => {
  document.getElementById("cropModal").classList.remove("is-open");
  if (cropper) cropper.destroy();
  cropper = null;
  cropTargetSlot = null;
});
      
      function openFilePicker(slot) {
        state.selectedSlot = Number(slot);
        fileInput.value = "";
        fileInput.click();
      }

      function swapImages(fromSlot, toSlot) {
        const temp = state.images[fromSlot];
        state.images[fromSlot] = state.images[toSlot];
        state.images[toSlot] = temp;

        const tempFile = state.files[fromSlot];
        state.files[fromSlot] = state.files[toSlot];
        state.files[toSlot] = tempFile;
        renderBox(fromSlot);
        renderBox(toSlot);
      }

      function getMainImage() {
        return state.images[0];
      }

      function getTitle() {
        return workTitle.value.trim() || "未命名作品";
      }

      function getDesc() {
        const content = workCategory.value || "雷刻作品";
        const carrier = carrierCategory.value || "未分類載體";
        return `${content}・${carrier}`;
      }

      function maskName(name) {
        const cleanName = (name || "顧客").trim();
        if (cleanName.length <= 1) return `${cleanName}＊`;
        const first = cleanName.slice(0, 1);
        const suffix = cleanName.includes("先生") ? "生" : cleanName.includes("小姐") ? "姐" : cleanName.slice(-1);
        return `${first}＊${suffix}`;
      }

      function timeAgo(dateString) {
        if (!dateString) return "剛剛分享";
        const now = new Date();
        const date = new Date(dateString);
        const diff = Math.max(0, now - date);
        const minute = 60 * 1000;
        const hour = 60 * minute;
        const day = 24 * hour;

        if (diff < minute) return "剛剛分享";
        if (diff < hour) return `${Math.floor(diff / minute)}分鐘前分享`;
        if (diff < day) return `${Math.floor(diff / hour)}小時前分享`;
        if (diff < day * 2) return "昨天分享";
        return `${Math.floor(diff / day)}天前分享`;
      }

      function renderGalleryCard(post, prepend = false) {
        const imageUrl = post.image_urls?.[0] || post.main_image_url || "images/lens-01.jpg";
        const displayName = maskName(post.customer_name || "顧客");
        const sharedTime = timeAgo(post.created_at);

        const card = document.createElement("a");
        card.href = "#";
        card.className = "plan1-card";
        card.dataset.topic = post.topic || "";
        card.dataset.carrier = post.carrier || "";
        card.dataset.name = displayName;
        card.dataset.story = post.story || "這是一份來自顧客分享的刻圖作品。";
        card.dataset.images = (post.image_urls || [imageUrl]).join(",");
        card.innerHTML = `
          <div class="img-box"><img src="${imageUrl}" alt="${post.title || "雷刻作品"}" /></div>
          <div class="info">
            <div>
              <div class="topic-pill">${post.topic || "靈感主題"}</div>
              <div class="title">${post.title || "未命名作品"}</div>
              <div class="desc">${displayName}</div>
            </div>
          </div>
        `;

        if (prepend) galleryGrid.prepend(card);
        else galleryGrid.appendChild(card);
      }

      function updateCommunityStats(posts = []) {
        const totalPosts = posts.length;
        const uniqueNames = new Set(posts.map(post => post.customer_name || post.customer_mask || "顧客")).size;
        document.querySelectorAll(".stat-item").forEach((item, index) => {
          const strong = item.querySelector("strong");
          if (!strong) return;
          if (index % 2 === 0) strong.textContent = uniqueNames || totalPosts;
          if (index % 2 === 1) strong.textContent = totalPosts;
        });
      }

      async function loadPostsFromSupabase() {
        // Supabase 尚未填入正式 URL / KEY 時，先保留靜態作品，避免畫面當掉。
        if (SUPABASE_URL.includes("YOUR_PROJECT_ID") || SUPABASE_ANON_KEY.includes("YOUR_SUPABASE_ANON_KEY")) {
          applyFilters();
          return;
        }

        const { data, error } = await supabaseClient
          .from(SUPABASE_TABLE)
          .select("id,title,topic,carrier,story,customer_name,member_id,image_urls,main_image_url,created_at")
          .eq("is_public", true)
          .order("created_at", { ascending: false });

        if (error) {
          console.error(error);
          showToast("讀取作品失敗，請檢查 Supabase 設定");
          return;
        }

        
data.forEach(post => renderGalleryCard(post, true));

updateCommunityStats(data);
applyFilters();
      }

      function validateForm() {
  if (workTitleError) {
    workTitleError.textContent = "";
  }

  if (!workTitle.value.trim()) {
    if (workTitleError) {
      workTitleError.textContent = "請輸入分享名稱";
    }
    workTitle.focus();
    return false;
  }

  if (!getMainImage()) {
    showToast("請至少上傳一張首圖");
    return false;
  }

  return true;
}

      function applyFilters() {
        const cards = Array.from(document.querySelectorAll(".plan1-card"));
        let visibleCount = 0;

        cards.forEach(card => {
          const topic = card.dataset.topic || "";
          const carrier = card.dataset.carrier || "";
          const normalizedTopic = filterState.topic === "想刻什麼？" ? "全部作品" : filterState.topic;
          const normalizedCarrier = filterState.carrier === "刻在哪裡？" ? "全部位置" : filterState.carrier;
          const keyword = (filterState.keyword || "").toLowerCase().trim();
          const title = card.querySelector(".title")?.textContent.toLowerCase() || "";
          const desc = card.querySelector(".desc")?.textContent.toLowerCase() || "";
          const tags = `${topic} ${carrier} ${title} ${desc}`.toLowerCase();
          const matchTopic = normalizedTopic === "全部作品" || topic === normalizedTopic;
          const matchCarrier = normalizedCarrier === "全部位置" || carrier === normalizedCarrier;
          const matchKeyword = !keyword || tags.includes(keyword);
          const shouldShow = matchTopic && matchCarrier && matchKeyword;

          card.style.display = shouldShow ? "block" : "none";
          if (shouldShow) visibleCount += 1;
        });

        if (resultMeta) resultMeta.textContent = `共 ${visibleCount} 件作品`;
      }

      function syncDesktopFilters() {
        if (desktopTopicFilter) filterState.topic = desktopTopicFilter.value;
        if (desktopCarrierFilter) filterState.carrier = desktopCarrierFilter.value;
        if (desktopSearchInput) filterState.keyword = desktopSearchInput.value;
        applyFilters();
      }

      async function uploadImagesToSupabase() {
        const uploadedUrls = [];
        const files = state.files.filter(Boolean);

        for (const file of files) {
          const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
          const filePath = `public/${Date.now()}-${crypto.randomUUID()}.${ext}`;
          const { error: uploadError } = await supabaseClient.storage
            .from(SUPABASE_BUCKET)
            .upload(filePath, file, { cacheControl: "3600", upsert: false });

          if (uploadError) throw uploadError;

          const { data } = supabaseClient.storage
            .from(SUPABASE_BUCKET)
            .getPublicUrl(filePath);

          uploadedUrls.push(data.publicUrl);
        }

        return uploadedUrls;
      }

      async function submitPostToSupabase() {
  if (SUPABASE_URL.includes("YOUR_PROJECT_ID") || SUPABASE_ANON_KEY.includes("YOUR_SUPABASE_ANON_KEY")) {
    throw new Error("請先填入 Supabase URL 與 Anon Key");
  }

  const member = JSON.parse(localStorage.getItem("lohasMember") || "null");

  if (!member || !member.erpid) {
    throw new Error("請先登入會員後再分享作品");
  }

  const imageUrls = await uploadImagesToSupabase();

  const postPayload = {
    title: getTitle(),
    topic: workCategory.value,
    carrier: carrierCategory.value,
    story: shareText.value.trim(),

    customer_name: member.name || "顧客",
    member_id: member.erpid,

    image_urls: imageUrls,
    main_image_url: imageUrls[0],
    is_public: true
  };

  const { data, error } = await supabaseClient
    .from(SUPABASE_TABLE)
    .insert(postPayload)
    .select("id,title,topic,carrier,story,customer_name,member_id,image_urls,main_image_url,created_at,is_public")
    .single();

  if (error) throw error;
  return data;
}

      function clearForm() {
        state.images = [null, null, null];
        state.files = [null, null, null];
        uploadBoxes.forEach(box => resetBox(Number(box.dataset.slot)));
        workTitle.value = "";
        shareText.value = "";
        currentChar.textContent = "0";
        workCategory.selectedIndex = 0;
        carrierCategory.selectedIndex = 0;
      }

      if (menu && navList) {
        menu.addEventListener("click", () => {
          menu.classList.toggle("active");
          navList.classList.toggle("active");
        });
      }

     openUploadBtns.forEach(btn => {
  btn.addEventListener("click", () => {
    const member = JSON.parse(localStorage.getItem("lohasMember") || "null");

    if (!member || !member.erpid) {
      localStorage.setItem("redirectAfterLogin", "gallery.html?openUpload=1");
      window.location.href = "login.html";
      return;
    }

    openModal();
  });
});
      closeUpload.addEventListener("click", closeModal);
      closeDetail.addEventListener("click", closeDetailModal);

      uploadModal.addEventListener("click", event => {
        if (event.target === uploadModal) closeModal();
      });

      detailModal.addEventListener("click", event => {
        if (event.target === detailModal) closeDetailModal();
      });

      document.addEventListener("keydown", event => {
        if (event.key === "Escape") {
          if (uploadModal.classList.contains("is-open")) closeModal();
          if (detailModal.classList.contains("is-open")) closeDetailModal();
          if (filterDrawer.classList.contains("is-open")) closeFilterDrawer();
        }
      });

      fileInput.addEventListener("change", event => {
        const file = event.target.files[0];
        if (state.selectedSlot !== null) readImageFile(file, state.selectedSlot);
      });

      uploadBoxes.forEach(box => {
        const slot = Number(box.dataset.slot);
        resetBox(slot);

        box.addEventListener("click", event => {
          const deleteBtn = event.target.closest("[data-delete-slot]");
          if (deleteBtn) {
            event.stopPropagation();
            const deleteSlot = Number(deleteBtn.dataset.deleteSlot);
            state.files[deleteSlot] = null;
            state.images[deleteSlot] = null;
            renderBox(deleteSlot);
            return;
          }
          openFilePicker(slot);
        });

        box.addEventListener("keydown", event => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            openFilePicker(slot);
          }
        });

        box.addEventListener("dragover", event => {
          event.preventDefault();
          box.classList.add("drag-enter");
        });

        box.addEventListener("dragleave", () => box.classList.remove("drag-enter"));

        box.addEventListener("drop", event => {
  event.preventDefault();

  document.querySelectorAll(".upload-box").forEach(item => {
    item.classList.remove("dragging", "drag-enter");
    item.style.opacity = "";
  });
          const file = event.dataTransfer.files[0];
          if (file) {
            readImageFile(file, slot);
            return;
          }
          if (state.draggedSlot !== null && state.draggedSlot !== slot) swapImages(state.draggedSlot, slot);
        });

        box.addEventListener("dragstart", event => {
          if (!state.images[slot]) {
            event.preventDefault();
            return;
          }
          state.draggedSlot = slot;
          box.classList.add("dragging");
          event.dataTransfer.setData("text/plain", String(slot));
        });

        box.addEventListener("dragend", () => {
  state.draggedSlot = null;

  document.querySelectorAll(".upload-box").forEach(item => {
    item.classList.remove("dragging", "drag-enter");
    item.style.opacity = "";
  });
});
      });

      shareText.addEventListener("input", () => {
        currentChar.textContent = shareText.value.length;
      });

      workTitle.addEventListener("input", () => {
  if (workTitleError) {
    workTitleError.textContent = "";
  }
});

      function openFilterDrawer() {
        filterDrawer.classList.add("is-open");
        filterDrawer.setAttribute("aria-hidden", "false");
        document.body.style.overflow = "hidden";
      }

      function closeFilterDrawer() {
        filterDrawer.classList.remove("is-open");
        filterDrawer.setAttribute("aria-hidden", "true");
        document.body.style.overflow = "";
      }

      if (mobileFilterBtn && filterDrawer) {
        mobileFilterBtn.addEventListener("click", openFilterDrawer);
        drawerClose.addEventListener("click", closeFilterDrawer);
        drawerApply.addEventListener("click", () => {
          closeFilterDrawer();
          applyFilters();
          showToast("已套用篩選條件");
        });
        drawerReset.addEventListener("click", () => {
          filterState.topic = "全部作品";
          filterState.carrier = "全部位置";
          if (desktopTopicFilter) desktopTopicFilter.value = "全部作品";
          if (desktopCarrierFilter) desktopCarrierFilter.value = "全部位置";
          if (mobileTopicFilter) mobileTopicFilter.value = "想刻什麼？";
          if (mobileCarrierFilter) mobileCarrierFilter.value = "刻在哪裡？";
          document.querySelectorAll(".drawer-chip-grid").forEach(group => {
            group.querySelectorAll(".chip").forEach(item => item.classList.remove("active"));
            const firstChip = group.querySelector(".chip");
            if (firstChip) firstChip.classList.add("active");
          });
          applyFilters();
          showToast("已重設篩選");
        });
        filterDrawer.addEventListener("click", event => {
          if (event.target === filterDrawer) closeFilterDrawer();
        });
      }

      document.querySelectorAll(".chip").forEach(chip => {
        chip.addEventListener("click", () => {
          const group = chip.parentElement;
          const value = chip.textContent.trim();
          group.querySelectorAll(".chip").forEach(item => item.classList.remove("active"));
          chip.classList.add("active");

          const sectionTitle = group.closest(".drawer-section")?.querySelector(".drawer-section-title")?.textContent || "";
          if (sectionTitle.includes("靈感")) filterState.topic = value;
          if (sectionTitle.includes("刻圖")) filterState.carrier = value;
        });
      });

      [desktopTopicFilter, desktopCarrierFilter, mobileTopicFilter, mobileCarrierFilter].forEach(select => {
        if (select) select.addEventListener("change", () => {
          if (select === mobileTopicFilter) filterState.topic = mobileTopicFilter.value;
          else if (select === mobileCarrierFilter) filterState.carrier = mobileCarrierFilter.value;
          else syncDesktopFilters();
          applyFilters();
        });
      });

      [desktopSearchInput, mobileSearchInput].forEach(input => {
        if (input) input.addEventListener("input", () => {
          filterState.keyword = input.value;
          if (input === desktopSearchInput && mobileSearchInput) mobileSearchInput.value = input.value;
          if (input === mobileSearchInput && desktopSearchInput) desktopSearchInput.value = input.value;
          applyFilters();
        });
      });

      galleryGrid.addEventListener("click", event => {
        const card = event.target.closest(".plan1-card");
        if (!card) return;
        event.preventDefault();
        openDetailModal(card);
      });

      previewBtn.addEventListener("click", () => {
  if (!validateForm()) return;

  const member = JSON.parse(localStorage.getItem("lohasMember") || "null");
  const previewName = maskName(member?.name || "顧客");

  const images = state.images.filter(Boolean);
  const mainImage = images[0];
  const subImages = images.slice(1, 3);

  detailBody.innerHTML = `
    <div class="detail-gallery">
      <div class="detail-main-image">
        <img src="${mainImage}" alt="${getTitle()}" />
      </div>
      <div class="detail-sub-list">
        ${subImages.map(src => `
          <div class="detail-sub-image">
            <img src="${src}" alt="${getTitle()}" />
          </div>
        `).join("")}
      </div>
    </div>

    <div class="detail-title-row">
      <h3 class="detail-title">${getTitle()}</h3>
      <span class="detail-user">${previewName}</span>
    </div>

    <div class="detail-meta">
      <span class="detail-chip">${workCategory.value}</span>
      <span class="detail-chip">${carrierCategory.value}</span>
    </div>

    <p class="detail-story">
      ${shareText.value.trim() || "這是一份來自顧客分享的刻圖作品。"}
    </p>
  `;

state.isPreviewMode = true;
            
  detailModal.classList.add("is-open");
  detailModal.setAttribute("aria-hidden", "false");
  uploadModal.classList.remove("is-open");
  uploadModal.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "hidden";
});

      submitBtn.addEventListener("click", async () => {
        if (!validateForm()) return;

        try {
          submitBtn.disabled = true;
          submitBtn.textContent = "上傳中...";
          const newPost = await submitPostToSupabase();
          renderGalleryCard(newPost, true);
          closeModal();
          clearForm();
          applyFilters();
          showToast("你的作品已成功分享");
        } catch (error) {
          console.error(error);
          showToast(error.message || "上傳失敗，請檢查 Supabase 權限設定");
        } finally {
          submitBtn.disabled = false;
          submitBtn.textContent = "送出分享";
        }
      });

      applyFilters();
      loadPostsFromSupabase();
    });


