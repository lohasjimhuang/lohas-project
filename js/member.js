(function (window) {
  'use strict';

  const Utils = window.LohasUtils;
  const Auth = window.LohasAuth;

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
    return loginResult.data?.erpname || loginResult.data?.erpName || loginResult.data?.name || '';
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

  function bindEvents() {
    if (elements.loginBtn) {
      elements.loginBtn.addEventListener('click', handleLogin);
    }

    if (elements.password) {
      elements.password.addEventListener('keydown', function (event) {
        if (event.key === 'Enter') handleLogin();
      });
    }

    document.querySelectorAll(
    '#logout-btn, #logout-btn-sidebar, #mobile-logout-btn'
  ).forEach(function (btn) {
    btn.addEventListener('click', Auth.logout);
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
    handleLogin
  };
})(window);

<section class="my-photos-section">
    <div class="member-section-title">
      <h1>我的分享照片</h1>
    </div>

    <div id="myPhotoList" class="my-photo-list">
      <p class="empty-text">尚未上傳分享照片</p>
    </div>
  </section>

</section>
