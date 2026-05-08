// ════════════════════════════════════════════════
//  api.js — API Client
//  แทนที่ google.script.run ทั้งหมด
// ════════════════════════════════════════════════

const API = {
  // ── ตั้งค่า ──
  BASE_URL: 'https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec',
  TOKEN: '',  // ถ้าตั้ง API_SECRET ไว้ใน GAS Properties
  
  // ── GET request ──
  async get(action, params = {}) {
    const url = new URL(this.BASE_URL);
    url.searchParams.set('action', action);
    Object.entries(params).forEach(([k, v]) => {
      url.searchParams.set(k, v);
    });
    
    const res = await fetch(url.toString());
    const json = await res.json();
    
    if (!json.success) throw new Error(json.error);
    return json.data;
  },
  
  // ── POST request ──
  async post(action, body = {}) {
    const res = await fetch(this.BASE_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain' },
      // NOTE: GAS ต้องการ text/plain ไม่ใช่ application/json
      body: JSON.stringify({ action, token: this.TOKEN, ...body })
    });
    const json = await res.json();
    
    if (!json.success) throw new Error(json.error);
    return json.data;
  },
  
  // ════════════ AUTH ════════════
  login: (email, password) => 
    API.post('login', { email, password }),
  
  register: (userData) => 
    API.post('register', { userData }),
  
  verifyOTP: (email, otp) => 
    API.post('verifyOTP', { email, otp }),
  
  // ════════════ MEMBERS ════════════
  getMembers: () => 
    API.get('getMembers'),
  
  saveMember: (data) => 
    API.post('saveMember', { data }),
  
  updateMemberStatus: (data) => 
    API.post('updateMemberStatus', { data }),
  
  saveMemberMovement: (data) => 
    API.post('saveMemberMovement', { data }),
  
  checkDuplicate: (fname, lname, houseno, moo, editingId, idcard) =>
    API.post('checkDuplicate', { fname, lname, houseno, moo, editingId, idcard }),
  
  // ════════════ DASHBOARD ════════════
  getDashboardStats: () => 
    API.get('getDashboardStats'),
  
  getMemberMovements: () => 
    API.get('getMemberMovements'),
  
  // ════════════ FINANCE ════════════
  getAllFinanceData: () => 
    API.get('getFinance'),
  
  saveFinance: (data) => 
    API.post('saveFinance', { data }),
  
  deleteFinance: (txnId) => 
    API.post('deleteFinance', { txnId }),
  
  saveBankTransaction: (data) => 
    API.post('saveBankTransaction', { data }),
  
  deleteBankTransaction: (txnId) => 
    API.post('deleteBankTransaction', { txnId }),
  
  saveTransfer: (data) => 
    API.post('saveTransfer', { data }),
  
  deleteTransfer: (transferId) => 
    API.post('deleteTransfer', { transferId }),
  
  uploadSlip: (base64Data, mimeType, fileName, txnId) =>
    API.post('uploadSlip', { base64Data, mimeType, fileName, txnId }),
  
  // ════════════ ANNUAL ════════════
  getAnnualSummary: () => 
    API.get('getAnnualSummary'),
  
  saveAnnualNewMembers: (data) => 
    API.post('saveAnnualNewMembers', { data }),
  
  saveAnnualDeaths: (data) => 
    API.post('saveAnnualDeaths', { data }),
  
  updateAnnualRecord: (data) => 
    API.post('updateAnnualRecord', { data }),
  
  deleteAnnualRecord: (id) => 
    API.post('deleteAnnualRecord', { id }),
};
