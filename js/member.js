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
    mobile: Utils.$('#mobile'),
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

  async function fetchProfileByMobile(mobile) {
    const result = await Auth.apiPost('/proxy/member/list', { mobile });

    if (Utils.normalizeApiCode(result.code) !== '200' || !result.data) {
      throw new Error('會員帳號與手機號碼不一致，請確認後再試');
    }

    return result.data;
  }

  function renderProfile(member) {
    Utils.setText('#profile-name', member.name);
    Utils.setText('#profile-mobile', member.mobile);
    Utils.setText('#profile-email', member.email);
    Utils.setText('#profile-birthday', member.birthday);

    Utils.hide(elements.loginSection);
    Utils.show(elements.profileSection);
  }

  async function handleLogin() {
    const account = elements.account?.value.trim() || '';
    const mobile = elements.mobile?.value.trim() || '';
    const password = elements.password?.value.trim() || '';

    if (!account || !mobile || !password) {
      showError('請輸入 APP帳號、手機號碼與密碼');
      return;
    }

    clearError();
    setLoading(true);

    try {
      const loginResult = await Auth.loginWithAccount(account, password);
      const loginName = getLoginName(loginResult);
      const member = await fetchProfileByMobile(mobile);
      const memberName = member.name || '';

      if (loginName && memberName && loginName !== memberName) {
        console.warn('[姓名不一致]', { loginName, memberName });
        throw new Error('會員帳號與手機號碼不一致，請確認後再試');
      }

      const storedMember = {
        erpid: member.client_id || loginResult.data?.erpid || null,
        name: member.name || loginName || '',
        mobile: member.mobile || mobile || '',
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

    document.querySelectorAll('#logout-btn, #logout-btn-sidebar').forEach(function (btn) {
      btn.addEventListener('click', Auth.logout);
    });
  }

  function initMemberPage() {
    bindEvents();

    const storedMember = Auth.getStoredMember();
    if (storedMember && elements.profileSection && elements.loginSection) {
      renderProfile(storedMember);
    }
  }

  document.addEventListener('DOMContentLoaded', initMemberPage);

  window.LohasMember = {
    fetchProfileByMobile,
    renderProfile,
    handleLogin
  };
})(window);
