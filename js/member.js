(function (window) {
  'use strict';

  const Utils = window.LohasUtils;
  const Auth = window.LohasAuth;
  const Supabase = window.LohasSupabase;

  const elements = {
    loginBtn: Utils.$('#login-btn'),
    errorMsg: Utils.$('#error-msg'),
    loginSection: Utils.$('#login-section'),
    profileSection: Utils.$('#profile-section'),
    account: Utils.$('#account'),
    password: Utils.$('#password')
  };

  function showError(message) {
    if (!elements.errorMsg) return;
    elements.errorMsg.innerText = message;
    Utils.show(elements.errorMsg);
  }

  function clearError() {
    if (!elements.errorMsg) return;
    elements.errorMsg.innerText = '';
    Utils.hide(elements.errorMsg);
  }

  function setLoading(status) {
    if (!elements.loginBtn) return;
    elements.loginBtn.disabled = status;
    elements.loginBtn.innerText = status ? '登入中...' : '登入';
  }

  function getLoginName(loginResult) {
    return loginResult.data?.erpname ||
      loginResult.data?.erpName ||
      loginResult.data?.name ||
      '';
  }

  function getSupabaseClient() {
    if (!Supabase || !Supabase.getClient) return null;
    return Supabase.getClient();
  }

  async function fetchProfileByClientId(erpid) {
    const result = await Auth.apiPost('/proxy/member/list', {
      client_id: Number(erpid)
    });

    if (Utils.normalizeApiCode(result.code) !== '200' || !result.data) {
      throw new Error('登入成功，但查無完整會員資料');
    }

    return result.data;
  }

  function renderProfile(member) {
    Utils.setText('#profile-name', member.name || '-');
    Utils.setText('#profile-mobile', member.mobile || '-');
    Utils.setText('#profile-email', member.email || '-');
    Utils.setText('#profile-birthday', member.birthday || '-');

    Utils.setText('#mobile-profile-name', member.name || '-');
    Utils.setText('#mobile-profile-mobile', member.mobile || '-');

    Utils.hide(elements.loginSection);
    Utils.show(elements.profileSection);

    loadMyPhotos();
  }

  async function handleLogin() {
    const account = elements.account?.value.trim() || '';
    const password = elements.password?.value.trim() || '';

    if (!account || !password) {
      showError('請輸入 APP帳號與密碼');
      return;
    }

    clearError();
    setLoading(true);

    try {
      const loginResult = await Auth.loginWithAccount(account, password);
      const erpid = loginResult.data?.erpid;
      const loginName = getLoginName(loginResult);

      if (!erpid) {
        throw new Error('登入成功，但未取得會員編號');
      }

      let member;

      try {
        member = await fetchProfileByClientId(erpid);
      } catch (profileError) {
        console.warn('[會員資料讀取失敗，改用登入資料]', profileError);

        member = {
          client_id: erpid,
          name: loginName,
          mobile: '',
          email: '',
          birthday: ''
        };
      }

      const storedMember = {
        erpid: member.client_id || erpid,
        name: member.name || loginName || '',
        mobile: member.mobile || '',
        email: member.email || '',
        birthday: member.birthday || ''
      };

      Auth.saveMember(storedMember);

      const redirect = Auth.getRedirect('login.html');

      if (redirect !== 'login.html') {
        window.location.href = redirect;
        return;
      }

      renderProfile(storedMember);
    } catch (error) {
      console.error('[登入錯誤]', error);
      showError(error.message || '連線失敗，請稍後再試');
    } finally {
      setLoading(false);
    }
  }

  async function loadMyPhotos() {
    const member = Auth.getStoredMember();
    const list = document.getElementById('myPhotoList');

    if (!list) return;

    if (!member || !member.erpid) {
      list.innerHTML = '<p class="empty-text">請先登入會員</p>';
      return;
    }

    const supabaseClient = getSupabaseClient();

    if (!supabaseClient) {
      list.innerHTML = '<p class="empty-text">尚未設定 Supabase</p>';
      return;
    }

    const postsTable = Supabase.CONFIG.POSTS_TABLE || 'gallery_posts';

    const { data, error } = await supabaseClient
      .from(postsTable)
      .select('id,title,topic,carrier,image_urls,main_image_url,created_at')
      .eq('member_id', member.erpid)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[讀取我的分享照片失敗]', error);
      list.innerHTML = '<p class="empty-text">讀取分享照片失敗</p>';
      return;
    }

    if (!data || data.length === 0) {
      list.innerHTML = '<p class="empty-text">尚未上傳分享照片</p>';
      return;
    }

    list.innerHTML = data.map(function (post) {
      const imageUrl =
        post.main_image_url ||
        (Array.isArray(post.image_urls) ? post.image_urls[0] : '') ||
        'images/lens-01.jpg';

      return `
        <div class="my-photo-card" data-id="${post.id}">
          <img src="${imageUrl}" alt="${post.title || '分享照片'}">

          <div class="my-photo-info">
            <h3>${post.title || '未命名照片'}</h3>
            <p>${post.topic || ''}・${post.carrier || ''}</p>
          </div>

          <button class="delete-my-photo" data-id="${post.id}" type="button">
            刪除
          </button>
        </div>
      `;
    }).join('');
  }

  async function deleteMyPhoto(postId) {
    if (!postId) return;

    const confirmed = window.confirm('確定要刪除這張分享照片嗎？');
    if (!confirmed) return;

    const member = Auth.getStoredMember();

    if (!member || !member.erpid) {
      window.alert('請先登入會員');
      return;
    }

    const supabaseClient = getSupabaseClient();

    if (!supabaseClient) {
      window.alert('尚未設定 Supabase');
      return;
    }

    const postsTable = Supabase.CONFIG.POSTS_TABLE || 'gallery_posts';

    const { data, error } = await supabaseClient
  .from(postsTable)
  .delete()
  .eq('id', postId)
  .eq('member_id', member.erpid)
  .select('id');

if (error) {
  console.error('[刪除分享照片失敗]', error);
  window.alert('刪除失敗，請確認 Supabase 權限設定');
  return;
}

if (!data || data.length === 0) {
  window.alert('刪除失敗：找不到這筆照片，或目前會員沒有刪除權限');
  return;
}

loadMyPhotos();
  }

  function bindEvents() {
    if (elements.loginBtn) {
      elements.loginBtn.addEventListener('click', handleLogin);
    }

    if (elements.password) {
      elements.password.addEventListener('keydown', function (event) {
        if (event.key === 'Enter') handleLogin();
      });
    }

    document
      .querySelectorAll('#logout-btn, #logout-btn-sidebar, #mobile-logout-btn')
      .forEach(function (btn) {
        btn.addEventListener('click', Auth.logout);
      });

    document.addEventListener('click', function (event) {
      const btn = event.target.closest('.delete-my-photo');
      if (!btn) return;

      deleteMyPhoto(btn.dataset.id);
    });
  }

  function initMemberPage() {
    bindEvents();

    const storedMember = Auth.getStoredMember();

    if (
      storedMember &&
      storedMember.erpid &&
      elements.profileSection &&
      elements.loginSection
    ) {
      renderProfile(storedMember);
    }
  }

  document.addEventListener('DOMContentLoaded', initMemberPage);

  window.LohasMember = {
    fetchProfileByClientId,
    renderProfile,
    handleLogin,
    loadMyPhotos,
    deleteMyPhoto
  };
})(window);
