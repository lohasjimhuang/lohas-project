(function (window) {
  'use strict';

  // 圖片上傳互動專用：預覽、刪圖、主圖排序、裁切。
  // 你目前已在 gallery.html 實作上傳功能，所以 login.html 不需要載入這支。
  function renderPreview(container, imgSrc) {
    if (!container || !imgSrc) return;

    container.classList.add('has-image');
    container.innerHTML = `
      <img src="${imgSrc}" style="width:100%; height:100%; object-fit:cover; border-radius:12px;">
      <div class="delete-btn" onclick="LohasUpload.removeImage(event, this)">
        <i class="fas fa-times"></i>
      </div>
    `;

    if (container.classList.contains('main-upload')) {
      const badge = document.createElement('span');
      badge.className = 'badge-main';
      badge.innerText = '主圖';
      container.appendChild(badge);
    }
  }

  function removeImage(event, btn) {
    if (event) event.stopPropagation();
    const container = btn?.parentElement;
    if (!container) return;

    container.classList.remove('has-image');

    if (container.classList.contains('main-upload')) {
      container.innerHTML = `
        <span class="badge-main">主圖</span>
        <div class="upload-placeholder">
          <i class="fas fa-plus"></i>
          <p>上傳主圖</p>
        </div>
      `;
    } else {
      container.innerHTML = `
        <div class="upload-placeholder">
          <i class="fas fa-plus"></i>
        </div>
      `;
    }
  }

  window.LohasUpload = {
    renderPreview,
    removeImage
  };
})(window);
