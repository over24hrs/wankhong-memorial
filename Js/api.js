// ════════════════════════════════════════════════
//  api.js — API Client (GitHub Pages → GAS)
//  ใช้ fetch แทน JSONP (echo URL มี Access-Control-Allow-Origin: *)
// ════════════════════════════════════════════════

const API = {
  BASE_URL: 'https://script.google.com/macros/s/AKfycbxypGlbJfSzrHgqMB4GRjin6E80glV9Q6AckgzuRhSN9pcz1BlQlJfiVZMy7yfixwi2sg/exec',

  // ── GET via fetch (รองรับ CORS, ไม่ต้องใช้ JSONP) ──
  async _get(params) {
    const qs = new URLSearchParams(params).toString();
    const res = await fetch(API.BASE_URL + '?' + qs, { redirect: 'follow' });
    if (!res.ok) throw new Error('เชื่อมต่อ server ไม่ได้ (HTTP ' + res.status + ')');
    const data = await res.json();
    if (data && data.success === false) {
      throw new Error(data.error || data.message || 'เกิดข้อผิดพลาด');
    }
    return data && data.data !== undefined ? data.data : data;
  },

  // ── POST via fetch ──
  async _post(action, body) {
    body = body || {};
    const res = await fetch(API.BASE_URL, {
      method:   'POST',
      headers:  { 'Content-Type': 'text/plain' },
      body:     JSON.stringify(Object.assign({ action: action }, body)),
      redirect: 'follow'
    });
    if (!res.ok) throw new Error('เชื่อมต่อ server ไม่ได้ (HTTP ' + res.status + ')');
    const json = await res.json();
    if (!json.success) throw new Error(json.error || json.message || 'เกิดข้อผิดพลาด');
    return json.data !== undefined ? json.data : json;
  },

  // ════ AUTH ════
  login:     function(email, password) { return API._get({ action: 'login', email: email, password: password }); },
  verifyOTP: function(email, otp)      { return API._get({ action: 'verifyOTP', email: email, otp: otp }); },
  register:  function(userData)        { return API._post('register', { userData: userData }); },

  // ════ MEMBERS ════
  getMembers:         function()     { return API._get({ action: 'getMembers' }); },
  saveMember:         function(data) { return API._post('saveMember', { data: data }); },
  updateMemberStatus: function(data) { return API._post('updateMemberStatus', { data: data }); },
  saveMemberMovement: function(data) { return API._post('saveMemberMovement', { data: data }); },
  checkDuplicate: function(fname, lname, houseno, moo, editingId, idcard) {
    return API._post('checkDuplicate', { fname: fname, lname: lname, houseno: houseno, moo: moo, editingId: editingId, idcard: idcard });
  },

  // ════ DASHBOARD ════
  getDashboardStats:  function() { return API._get({ action: 'getDashboardStats' }); },
  getMemberMovements: function() { return API._get({ action: 'getMemberMovements' }); },

  // ════ FINANCE ════
  getAllFinanceData:      function()      { return API._get({ action: 'getFinance' }); },
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
  getAnnualSummary:     function()     { return API._get({ action: 'getAnnualSummary' }); },
  saveAnnualNewMembers: function(data) { return API._post('saveAnnualNewMembers', { data: data }); },
  saveAnnualDeaths:     function(data) { return API._post('saveAnnualDeaths', { data: data }); },
  updateAnnualRecord:   function(data) { return API._post('updateAnnualRecord', { data: data }); },
  deleteAnnualRecord:   function(id)   { return API._post('deleteAnnualRecord', { id: id }); }
};

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
