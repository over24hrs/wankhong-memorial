// ════════════════════════════════════════════════
//  api.js — API Client (GitHub Pages → GAS)
// ════════════════════════════════════════════════

const API = {
  BASE_URL: 'https://script.google.com/macros/s/AKfycbxypGlbJfSzrHgqMB4GRjin6E80glV9Q6AckgzuRhSN9pcz1BlQlJfiVZMy7yfixwi2sg/exec',

  // ── JSONP (แก้ CORS สำหรับ GET) ──
  _jsonp(params) {
    return new Promise((resolve, reject) => {
      const cb    = '_cb_' + Date.now() + '_' + Math.random().toString(36).slice(2);
      const timer = setTimeout(() => {
        delete window[cb];
        const el = document.getElementById(cb);
        if (el) el.remove();
        reject(new Error('หมดเวลาเชื่อมต่อ (timeout 15s)'));
      }, 15000);

      window[cb] = (data) => {
        clearTimeout(timer);
        delete window[cb];
        const el = document.getElementById(cb);
        if (el) el.remove();
        if (data && data.success === false) {
          reject(new Error(data.error || data.message || 'เกิดข้อผิดพลาด'));
        } else {
          resolve(data && data.data !== undefined ? data.data : data);
        }
      };

      const qs = new URLSearchParams(Object.assign({}, params, { callback: cb })).toString();
      const s  = document.createElement('script');
      s.id     = cb;
      s.src    = API.BASE_URL + '?' + qs;
      s.onerror = () => {
        clearTimeout(timer);
        delete window[cb];
        s.remove();
        reject(new Error('เชื่อมต่อ server ไม่ได้'));
      };
      document.head.appendChild(s);
    });
  },

  // ── POST (สำหรับ action ที่ส่งข้อมูลเยอะ) ──
  async _post(action, body) {
    body = body || {};
    const res = await fetch(API.BASE_URL, {
      method:   'POST',
      headers:  { 'Content-Type': 'text/plain' },
      body:     JSON.stringify(Object.assign({ action: action }, body)),
      redirect: 'follow'
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.error || json.message || 'เกิดข้อผิดพลาด');
    return json.data !== undefined ? json.data : json;
  },

  // ════ AUTH ════
  login:     function(email, password) { return API._jsonp({ action: 'login', email: email, password: password }); },
  verifyOTP: function(email, otp)      { return API._jsonp({ action: 'verifyOTP', email: email, otp: otp }); },
  register:  function(userData)        { return API._post('register', { userData: userData }); },

  // ════ MEMBERS ════
  getMembers:         function()     { return API._jsonp({ action: 'getMembers' }); },
  saveMember:         function(data) { return API._post('saveMember', { data: data }); },
  updateMemberStatus: function(data) { return API._post('updateMemberStatus', { data: data }); },
  saveMemberMovement: function(data) { return API._post('saveMemberMovement', { data: data }); },
  checkDuplicate: function(fname, lname, houseno, moo, editingId, idcard) {
    return API._post('checkDuplicate', { fname: fname, lname: lname, houseno: houseno, moo: moo, editingId: editingId, idcard: idcard });
  },

  // ════ DASHBOARD ════
  getDashboardStats:  function() { return API._jsonp({ action: 'getDashboardStats' }); },
  getMemberMovements: function() { return API._jsonp({ action: 'getMemberMovements' }); },

  // ════ FINANCE ════
  getAllFinanceData:      function()      { return API._jsonp({ action: 'getFinance' }); },
  saveFinance:           function(data)  { return API._post('saveFinance', { data: data }); },
  deleteFinance:         function(txnId) { return API._post('deleteFinance', { txnId: txnId }); },
  saveBankTransaction:   function(data)  { return API._post('saveBankTransaction', { data: data }); },
  deleteBankTransaction: function(txnId) { return API._post('deleteBankTransaction', { txnId: txnId }); },
  saveTransfer:          function(data)  { return API._post('saveTransfer', { data: data }); },
  deleteTransfer:        function(id)    { return API._post('deleteTransfer', { transferId: id }); },
  uploadSlip: function(base64Data, mimeType, fileName, txnId) {
    return API._post('uploadSlip', { base64Data: base64Data, mimeType: mimeType, fileName: fileName, txnId: txnId });
  },

  // ════ ANNUAL ════
  getAnnualSummary:     function()     { return API._jsonp({ action: 'getAnnualSummary' }); },
  saveAnnualNewMembers: function(data) { return API._post('saveAnnualNewMembers', { data: data }); },
  saveAnnualDeaths:     function(data) { return API._post('saveAnnualDeaths', { data: data }); },
  updateAnnualRecord:   function(data) { return API._post('updateAnnualRecord', { data: data }); },
  deleteAnnualRecord:   function(id)   { return API._post('deleteAnnualRecord', { id: id }); }
};
// เพิ่มใน api.js หรือก่อน </script> ของแต่ละหน้า
function api_getAllFinanceData()     { return API.getAllFinanceData(); }
function api_getMembers()            { return API.getMembers(); }
function api_getAnnualSummary()      { return API.getAnnualSummary(); }
function api_saveMember(data)        { return API.saveMember(data); }
function api_updateMemberStatus(data){ return API.updateMemberStatus(data); }
function api_saveMemberMovement(data){ return API.saveMemberMovement(data); }
function api_saveFinanceV2(data)     { return API.saveFinance(data); }
function api_saveBankTransaction(data){ return API.saveBankTransaction(data); }
function api_saveTransfer(data)      { return API.saveTransfer(data); }
function api_deleteFinance(id)       { return API.deleteFinance(id); }
function api_deleteBankTransaction(id){ return API.deleteBankTransaction(id); }
function api_deleteTransfer(id)      { return API.deleteTransfer(id); }
function api_saveAnnualNewMembers(d) { return API.saveAnnualNewMembers(d); }
function api_registerUser(data)      { return API.register(data); }
function api_verifyOTP(email, otp)   { return API.verifyOTP(email, otp); }
function api_uploadSlipToDrive(b64, mime, name, txnId) { return API.uploadSlip(b64, mime, name, txnId); }
