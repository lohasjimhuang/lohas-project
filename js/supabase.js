(function (window) {
  'use strict';

  const CONFIG = {
    SUPABASE_URL: 'https://mbmuextzyyhseibruaop.supabase.co',
    SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1ibXVleHR6eXloc2VpYnJ1YW9wIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY4NTUxNzMsImV4cCI6MjA5MjQzMTE3M30.F6iclxio0NijUmp5pTYgNlMElg42J6fbai0XJEdnQoM',
    STORAGE_BUCKET: 'gallery-uploads',
    POSTS_TABLE: 'gallery_posts',
    FAVORITES_TABLE: 'gallery_favorites'
  };

  function isConfigured() {
    return !!CONFIG.SUPABASE_URL && !!CONFIG.SUPABASE_ANON_KEY;
  }

  function getClient() {
    if (!window.supabase || !isConfigured()) return null;
    return window.supabase.createClient(
      CONFIG.SUPABASE_URL,
      CONFIG.SUPABASE_ANON_KEY
    );
  }

  window.LohasSupabase = {
    CONFIG,
    isConfigured,
    getClient
  };
})(window);
