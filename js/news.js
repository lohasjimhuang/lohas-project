document.addEventListener("DOMContentLoaded", () => {
  initNewsFilter();
  initLoadMore();
});

/* =========================
   最新消息分類篩選
========================= */

function initNewsFilter() {
  const filterButtons = document.querySelectorAll(".filter-btn");
  const cards = document.querySelectorAll(".news-card");
  const loadMoreBtn = document.getElementById("loadMoreBtn");

  if (!filterButtons.length || !cards.length) return;

  filterButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const filter = button.dataset.filter;

      filterButtons.forEach((btn) => btn.classList.remove("active"));
      button.classList.add("active");

      cards.forEach((card) => {
        const category = card.dataset.category;
        const isMatch = filter === "all" || category === filter;

        card.classList.remove("is-hidden-card");

        if (isMatch) {
          card.classList.remove("is-filter-hidden");
        } else {
          card.classList.add("is-filter-hidden");
        }
      });

      if (loadMoreBtn) {
        loadMoreBtn.classList.add("is-hidden");
      }
    });
  });
}

/* =========================
   更多文章
========================= */

function initLoadMore() {
  const loadMoreBtn = document.getElementById("loadMoreBtn");
  const hiddenCards = document.querySelectorAll(".news-card.is-hidden-card");

  if (!loadMoreBtn || !hiddenCards.length) {
    if (loadMoreBtn) loadMoreBtn.classList.add("is-hidden");
    return;
  }

  loadMoreBtn.addEventListener("click", () => {
    hiddenCards.forEach((card) => {
      card.classList.remove("is-hidden-card");
    });

    loadMoreBtn.classList.add("is-hidden");
  });
}
