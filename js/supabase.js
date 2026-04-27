(function (window) {
  'use strict';

  // Supabase 專用封裝：Storage 上傳、posts 新增/查詢、收藏資料。
  // 使用前請先在這裡填入自己的 Supabase URL / anon key，或改由環境設定注入。
  const CONFIG = {
    SUPABASE_URL: '',
    SUPABASE_ANON_KEY: '',
    STORAGE_BUCKET: 'gallery-uploads',
    POSTS_TABLE: 'gallery_posts'
  };

  function isConfigured() {
    return !!CONFIG.SUPABASE_URL && !!CONFIG.SUPABASE_ANON_KEY;
  }

  window.LohasSupabase = {
    CONFIG,
    isConfigured
  };
})(window);
