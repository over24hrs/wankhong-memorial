// ════════════════════════════════════════════════
//  api.js — API Client
//  แทนที่ google.script.run ทั้งหมด
// ════════════════════════════════════════════════

const API = {
  BASE_URL: 'https://script.google.com/macros/s/AKfycbwMlkGgnFg0R8w0YcfQN2L_2bc0prq9urtWijhednbkv8rFyZeBxYBGHPN9rqlY9HRfMw/exec',

  // ── JSONP (แก้ CORS) ──
  _jsonp(params) {
    return new Promise((resolve, reject) => {
      const cb    = '_cb_' + Date.now() + '_' + Math.random().toString(36).slice(2);
      const timer = setTimeout(() => {
        delete window[cb];
        document.getElementById(cb)?.remove();
        reject(new Error('หมดเวลาเชื่อมต่อ (timeout 15s)'));
      }, 15000);

      window[cb] = (data) => {
        clearTimeout(timer);
        delete window[cb];
        document.getElementById(cb)?.remove();
        // รองรับทั้ง { success, data } และ { success, message, role }
        if (data.success === false) {
          reject(new Error(data.error || data.message || 'เกิดข้อผิดพลาด'));
        } else {
          resolve(data.data !== undefined ? data.data : data);
        }
      };

      const qs = new URLSearchParams({ ...params, callback: cb }).toString();
      const s  = document.createElement('script');
      s.id     = cb;
      s.src    = this.BASE_URL + '?' + qs;
      s.onerror = () => {
        clearTimeout(timer);
        delete window[cb];
        s.remove();
        reject(new Error('เชื่อมต่อ server ไม่ได้'));
      };
      document.head.appendChild(s);
    });
  },

  // ════ AUTH ════
  login:     (email, password) => API._jsonp({ action: 'login', email, password }),
  verifyOTP: (email, otp)      => API._jsonp({ action: 'verifyOTP', email, otp }),

  // register ยังคงใช้ POST (ข้อมูลเยอะ URL ยาวเกิน)
  register: (userData) => API._post('register', { userData }),

  // ════ MEMBERS ════
  getMembers:         ()     => API._jsonp({ action: 'getMembers' }),
  saveMember:         (data) => API._post('saveMember', { data }),
  updateMemberStatus: (data) => API._post('updateMemberStatus', { data }),
  saveMemberMovement: (data) => API._post('saveMemberMovement', { data }),
  checkDuplicate: (fname, lname, houseno, moo, editingId, idcard) =>
    API._post('checkDuplicate', { fname, lname, houseno, moo, editingId, idcard }),

  // ════ DASHBOARD ════
  getDashboardStats:  () => API._jsonp({ action: 'getDashboardStats' }),
  getMemberMovements: () => API._jsonp({ action: 'getMemberMovements' }),

  // ════ FINANCE ════
  getAllFinanceData:      ()       => API._jsonp({ action: 'getFinance' }),
  saveFinance:           (data)   => API._post('saveFinance', { data }),
  deleteFinance:         (txnId)  => API._post('deleteFinance', { txnId }),
  saveBankTransaction:   (data)   => API._post('saveBankTransaction', { data }),
  deleteBankTransaction: (txnId)  => API._post('deleteBankTransaction', { txnId }),
  saveTransfer:          (data)   => API._post('saveTransfer', { data }),
  deleteTransfer:        (id)     => API._post('deleteTransfer', { transferId: id }),
  uploadSlip: (base64Data, mimeType, fileName, txnId) =>
    API._post('uploadSlip', { base64Data, mimeType, fileName, txnId }),

  // ════ ANNUAL ════
  getAnnualSummary:     ()     => API._jsonp({ action: 'getAnnualSummary' }),
  saveAnnualNewMembers: (data) => API._post('saveAnnualNewMembers', { data }),
  saveAnnualDeaths:     (data) => API._post('saveAnnualDeaths', { data }),
  updateAnnualRecord:   (data) => API._post('updateAnnualRecord', { data }),
  deleteAnnualRecord:   (id)   => API._post('deleteAnnualRecord', { id }),

  // ── POST (สำหรับ action ที่ส่งข้อมูลเยอะ) ──
  // หมายเหตุ: POST จาก GitHub Pages จะถูก redirect แต่ยังทำงานได้
  // เพราะ GAS รับ doPost() ได้ปกติ
  async _post(action, body = {}) {
    const res = await fetch(this.BASE_URL, {
      method:  'POST',
      headers: { 'Content-Type': 'text/plain' },
      body:    JSON.stringify({ action, ...body }),
      redirect: 'follow'
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.error || json.message || 'เกิดข้อผิดพลาด');
    return json.data !== undefined ? json.data : json;
  }
};
  
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
