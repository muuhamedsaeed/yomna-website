// Run with SUPABASE_URL, SUPABASE_SECRET_KEY, and ADMIN_PASSWORD set.
// Requires Node.js 22 or newer.
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');

const root = __dirname;

function loadLocalEnv() {
  const file = path.join(root, '.env');
  if (!fs.existsSync(file)) return;
  for (const line of fs.readFileSync(file, 'utf8').split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const match = trimmed.match(/^(?:export\s+)?([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/);
    if (!match || process.env[match[1]] !== undefined) continue;
    let value = match[2].trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) value = value.slice(1, -1);
    process.env[match[1]] = value;
  }
}
loadLocalEnv();

const defaults = JSON.parse(fs.readFileSync(path.join(root, 'data', 'defaults.json'), 'utf8'));
const store = require('./supabase-store');
const password = process.env.ADMIN_PASSWORD;
if (!password || password.length < 12) {
  console.error('Set ADMIN_PASSWORD to a unique password of at least 12 characters.');
  process.exit(1);
}
const PORT = Number(process.env.PORT || 3000);
const sessionTtl = 12 * 60 * 60 * 1000;
const sessions = new Map();
const failedLogins = new Map();
const inquiryTimes = new Map();
function json(res, status, body, headers={}) {
  res.writeHead(status, { 'Content-Type':'application/json; charset=utf-8', 'Cache-Control':'no-store', ...headers });
  res.end(JSON.stringify(body));
}
function publicState(site) {
  const { inquiries, ...publicSite } = site;
  return { ...publicSite, cvDataUrl: undefined };
}
function getCookie(req, key) {
  const value = (req.headers.cookie || '').split(';').map(s=>s.trim()).find(s=>s.startsWith(key+'='));
  return value ? value.slice(key.length+1) : '';
}
function authorized(req) {
  const token = getCookie(req, 'yomna_admin');
  const expiration = sessions.get(token);
  if (!expiration) return false;
  if (expiration <= Date.now()) { sessions.delete(token); return false; }
  return true;
}
function sameOrigin(req) {
  const origin = req.headers.origin;
  if (!origin) return true; // non-browser clients can omit Origin
  try { return new URL(origin).host === req.headers.host; } catch { return false; }
}
async function body(req, limit=8*1024*1024) {
  if (!(req.headers['content-type'] || '').startsWith('application/json')) throw Object.assign(new Error('JSON required.'), {status:415});
  let bytes = 0, chunks=[];
  for await (const chunk of req) {
    bytes += chunk.length;
    if (bytes > limit) throw Object.assign(new Error('Upload is too large.'), {status:413});
    chunks.push(chunk);
  }
  try { return JSON.parse(Buffer.concat(chunks).toString('utf8')); }
  catch { throw Object.assign(new Error('Invalid JSON.'), {status:400}); }
}
function text(value, max) { return typeof value === 'string' ? value.trim().slice(0,max) : ''; }
function rate(map, ip, max, period) {
  const now=Date.now(), history=(map.get(ip)||[]).filter(t=>now-t<period);
  if(history.length>=max) { map.set(ip, history); return false; }
  history.push(now); map.set(ip, history); return true;
}
const passwordDigest = crypto.createHash('sha256').update(password).digest();
function validPassword(value) {
  const digest=crypto.createHash('sha256').update(String(value || '')).digest();
  return crypto.timingSafeEqual(digest, passwordDigest);
}
const editable = new Set([
  ...Object.keys(defaults).filter(k=>k!=='inquiries'),
  'contactFormTitle',
  'contactFormSubtitle',
  'contactFormButton',
  'contactFormPlaceholder',
  'contactProjectTypeOptions',
  'contactBudgetOptions'
]);

const server=http.createServer(async(req,res)=>{
  try {
    const url=new URL(req.url, 'http://localhost');
    const route=url.pathname;
    if (req.method==='GET' && route==='/api/site') {
      const site = await store.loadSite(defaults);
      return json(res,200,publicState(site));
    }
    if (req.method==='GET' && route==='/api/cv') {
      const site = await store.loadSite(defaults);
      if (!site.cvDataUrl) return json(res,404,{error:'CV not uploaded yet.'});
      const found=site.cvDataUrl.match(/^data:([\w.+/-]+);base64,(.*)$/s);
      if (!found) return json(res,500,{error:'CV file is invalid.'});
      const file=Buffer.from(found[2],'base64');
      const name=(site.cvName||'Yomna_Ehab_CV.pdf').replace(/[^\w. -]/g,'_');
      res.writeHead(200,{'Content-Type':found[1],'Content-Disposition':`attachment; filename="${name}"`,'Content-Length':file.length});
      return res.end(file);
    }
    if (req.method==='GET' && route==='/api/admin/session') return json(res,200,{authenticated:authorized(req)});
    if (req.method==='GET' && route==='/api/admin/state') {
      if (!authorized(req)) return json(res,401,{error:'Sign in required.'});
      const [site, inquiries] = await Promise.all([store.loadSite(defaults), store.loadInquiries()]);
      return json(res,200,{...site,inquiries});
    }
    if (req.method==='POST' && route==='/api/admin/login') {
      if (!sameOrigin(req)) return json(res,403,{error:'Invalid origin.'});
      const ip=req.socket.remoteAddress;
      if (!rate(failedLogins, ip, 8, 15*60*1000)) return json(res,429,{error:'Too many attempts. Try again later.'});
      const input=await body(req,1024);
      if (!validPassword(input.password)) return json(res,401,{error:'Incorrect password.'});
      failedLogins.delete(ip);
      const token=crypto.randomBytes(32).toString('hex');
      sessions.set(token,Date.now()+sessionTtl);
      const secure=process.env.COOKIE_SECURE==='1' ? '; Secure' : '';
      return json(res,200,{ok:true},{'Set-Cookie':`yomna_admin=${token}; HttpOnly; SameSite=Strict; Path=/; Max-Age=43200${secure}`});
    }
    if (req.method==='POST' && route==='/api/admin/logout') {
      if (!sameOrigin(req)) return json(res,403,{error:'Invalid origin.'});
      sessions.delete(getCookie(req,'yomna_admin'));
      return json(res,200,{ok:true},{'Set-Cookie':'yomna_admin=; HttpOnly; SameSite=Strict; Path=/; Max-Age=0'});
    }
    if (req.method==='PUT' && route==='/api/admin/state') {
      if (!sameOrigin(req)) return json(res,403,{error:'Invalid origin.'});
      if (!authorized(req)) return json(res,401,{error:'Sign in required.'});
      const input=await body(req);
      if (!input || typeof input!=='object' || Array.isArray(input)) return json(res,400,{error:'Invalid content.'});
      const next=await store.loadSite(defaults);
      for (const key of editable) if (Object.hasOwn(input,key)) next[key]=input[key];
      if (!Array.isArray(next.projects) || !Array.isArray(next.career) || !Array.isArray(next.skills) || !Array.isArray(next.software) || !Array.isArray(next.brands)) {
        return json(res,400,{error:'Invalid content lists.'});
      }
      if (next.contactProjectTypeOptions && !Array.isArray(next.contactProjectTypeOptions)) {
        return json(res,400,{error:'Project type options must be a list.'});
      }
      if (next.contactBudgetOptions && !Array.isArray(next.contactBudgetOptions)) {
        return json(res,400,{error:'Budget options must be a list.'});
      }
      await store.saveSite(input);
      return json(res,200,{ok:true});
    }
    if (req.method==='POST' && route==='/api/inquiries') {
      if (!sameOrigin(req)) return json(res,403,{error:'Invalid origin.'});
      if (!rate(inquiryTimes,req.socket.remoteAddress,5,10*60*1000)) return json(res,429,{error:'Too many messages. Try again later.'});
      const input=await body(req,16*1024);
      const name=text(input.name,100), email=text(input.email,254), projectType=text(input.projectType,100), message=text(input.message,4000);
      const budget=text(input.budget,100);
      if (!name || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email) || !projectType || !message) return json(res,400,{error:'Please complete all required fields.'});
      await store.insertInquiry({id:crypto.randomUUID(),name,email,projectType,budget,message,date:new Date().toISOString()});
      return json(res,201,{ok:true});
    }
    const match=route.match(/^\/api\/admin\/inquiries\/([a-f0-9-]+)$/);
    if (match && (req.method==='PATCH' || req.method==='DELETE')) {
      if (!sameOrigin(req)) return json(res,403,{error:'Invalid origin.'});
      if (!authorized(req)) return json(res,401,{error:'Sign in required.'});
      const item=await store.findInquiry(match[1]);
      if (!item) return json(res,404,{error:'Inquiry not found.'});
      if (req.method==='DELETE') await store.deleteInquiry(item.id);
      else {
        const input=await body(req,1024);
        await store.updateInquiry(item.id,input);
      }
      return json(res,200,{ok:true});
    }
    if (req.method==='GET' && (route==='/' || route==='/index.html')) {
      res.writeHead(200,{'Content-Type':'text/html; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'});
      return fs.createReadStream(path.join(root,'public','index.html')).pipe(res);
    }
    json(res,404,{error:'Not found.'});
  } catch(err) {
    console.error(err);
    if (!res.headersSent) json(res,err.status||500,{error:err.status?err.message:'The request could not be completed.'});
  }
});
store.testConnection().then(() => {
  server.listen(PORT,()=>console.log(`Portfolio connected to Supabase at ${projectHost()} and running on http://localhost:${PORT}`));
}).catch(error => {
  console.error(`Could not connect to Supabase. Check SUPABASE_URL and the server secret key: ${error.message}`);
  process.exit(1);
});

function projectHost() {
  return new URL(process.env.SUPABASE_URL).host;
}
