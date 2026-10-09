const { createClient } = require('@supabase/supabase-js');

const projectUrl = process.env.SUPABASE_URL;
const secretKey = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!projectUrl || !secretKey) {
  throw new Error('Set SUPABASE_URL and SUPABASE_SECRET_KEY in the project .env file.');
}

const supabase = createClient(projectUrl, secretKey, {
  auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false }
});

function fail(error) {
  if (error) throw new Error(`Supabase request failed: ${error.message}`);
}

async function replaceRows(table, rows) {
  const { error: deleteError } = await supabase.from(table).delete().gte('sort_order', 0);
  fail(deleteError);
  if (!rows.length) return;
  const { error: insertError } = await supabase.from(table).insert(rows);
  fail(insertError);
}

async function loadSite(defaults) {
  const [configRows, skillRows, softwareRows, brandRows, careerRows, projectRows, typeRows, budgetRows] = await Promise.all([
    supabase.from('site_config').select('key,value'),
    supabase.from('skills').select('name').order('sort_order'),
    supabase.from('software').select('name').order('sort_order'),
    supabase.from('brands').select('name').order('sort_order'),
    supabase.from('career').select('dates,company,role').order('sort_order'),
    supabase.from('projects').select('*').order('sort_order'),
    supabase.from('contact_project_types').select('label').order('sort_order'),
    supabase.from('contact_budget_options').select('label').order('sort_order')
  ]);
  for (const result of [configRows, skillRows, softwareRows, brandRows, careerRows, projectRows, typeRows, budgetRows]) fail(result.error);

  const site = structuredClone(defaults);
  for (const { key, value } of configRows.data || []) {
    // The seed leaves this empty until the portrait is uploaded to Storage.
    if (key === 'portrait' && !value) continue;
    site[key] = value;
  }
  site.skills = (skillRows.data || []).map(row => row.name);
  site.software = (softwareRows.data || []).map(row => row.name);
  site.brands = (brandRows.data || []).map(row => row.name);
  site.career = (careerRows.data || []).map(row => ({ dates: row.dates, co: row.company, role: row.role }));
  site.projects = (projectRows.data || []).map(row => ({
    id: row.id,
    title: row.title,
    client: row.client,
    mainCategory: row.main_category,
    type: row.type,
    desc: row.description,
    role: row.role,
    software: row.software,
    thumbColor: row.thumb_color,
    videoUrl: row.video_url,
    originalLink: row.original_link,
    views: row.views,
    featured: row.featured,
    published: row.published
  }));
  site.contactProjectTypeOptions = (typeRows.data || []).map(row => row.label);
  site.contactBudgetOptions = (budgetRows.data || []).map(row => row.label);
  delete site.inquiries;
  return site;
}

async function loadInquiries() {
  const { data, error } = await supabase.from('inquiries')
    .select('id,name,email,project_type,budget,message,submitted_at,is_read,is_archived')
    .order('submitted_at', { ascending: false });
  fail(error);
  return (data || []).map(row => ({
    id: row.id,
    name: row.name,
    email: row.email,
    projectType: row.project_type,
    budget: row.budget,
    message: row.message,
    date: row.submitted_at,
    read: row.is_read,
    archived: row.is_archived
  }));
}

async function saveSite(input) {
  const writes = [];
  if (Object.hasOwn(input, 'skills')) writes.push(replaceRows('skills', input.skills.map((name, i) => ({ name, sort_order: i + 1 }))));
  if (Object.hasOwn(input, 'software')) writes.push(replaceRows('software', input.software.map((name, i) => ({ name, sort_order: i + 1 }))));
  if (Object.hasOwn(input, 'brands')) writes.push(replaceRows('brands', input.brands.map((name, i) => ({ name, sort_order: i + 1 }))));
  if (Object.hasOwn(input, 'career')) writes.push(replaceRows('career', input.career.map((item, i) => ({
    dates: item.dates, company: item.co, role: item.role, sort_order: i + 1
  }))));
  if (Object.hasOwn(input, 'projects')) writes.push(replaceRows('projects', input.projects.map((item, i) => ({
    id: item.id,
    title: item.title,
    client: item.client || '',
    main_category: item.mainCategory,
    type: item.type || '',
    description: item.desc || '',
    role: item.role || '',
    software: item.software || [],
    thumb_color: item.thumbColor || '#123b34',
    video_url: item.videoUrl || '',
    original_link: item.originalLink || '',
    views: item.views || '',
    featured: Boolean(item.featured),
    published: Boolean(item.published),
    sort_order: i + 1
  }))));
  if (Object.hasOwn(input, 'contactProjectTypeOptions')) writes.push(replaceRows('contact_project_types', input.contactProjectTypeOptions.map((label, i) => ({ label, sort_order: i + 1 }))));
  if (Object.hasOwn(input, 'contactBudgetOptions')) writes.push(replaceRows('contact_budget_options', input.contactBudgetOptions.map((label, i) => ({ label, sort_order: i + 1 }))));

  const listKeys = new Set(['skills','software','brands','career','projects','contactProjectTypeOptions','contactBudgetOptions','inquiries']);
  const settings = Object.entries(input)
    .filter(([key, value]) => !listKeys.has(key) && ['string', 'number', 'boolean'].includes(typeof value));
  const configRows = await Promise.all(settings.map(async ([key, value]) => {
    let storedValue = String(value);
    if (key === 'portrait' && storedValue.startsWith('data:image/')) {
      const match = storedValue.match(/^data:(image\/[\w.+-]+);base64,(.*)$/s);
      if (!match) throw new Error('The portrait image data is invalid.');
      const bytes = Buffer.from(match[2], 'base64');
      const { error } = await supabase.storage.from('portfolio-assets').upload('portrait.png', bytes, {
        contentType: match[1],
        upsert: true,
        cacheControl: '3600'
      });
      fail(error);
      storedValue = supabase.storage.from('portfolio-assets').getPublicUrl('portrait.png').data.publicUrl;
    }
    return { key, value: storedValue };
  }));
  if (configRows.length) {
    const { error } = await supabase.from('site_config').upsert(configRows, { onConflict: 'key' });
    fail(error);
  }
  await Promise.all(writes);
}

async function insertInquiry(inquiry) {
  const { error } = await supabase.from('inquiries').insert({
    id: inquiry.id,
    name: inquiry.name,
    email: inquiry.email,
    project_type: inquiry.projectType,
    budget: inquiry.budget,
    message: inquiry.message,
    submitted_at: inquiry.date,
    is_read: false,
    is_archived: false
  });
  fail(error);
}

async function findInquiry(id) {
  const { data, error } = await supabase.from('inquiries').select('id').eq('id', id).maybeSingle();
  fail(error);
  return data;
}

async function updateInquiry(id, changes) {
  const update = {};
  if (typeof changes.read === 'boolean') update.is_read = changes.read;
  if (typeof changes.archived === 'boolean') update.is_archived = changes.archived;
  if (!Object.keys(update).length) return;
  const { error } = await supabase.from('inquiries').update(update).eq('id', id);
  fail(error);
}

async function deleteInquiry(id) {
  const { error } = await supabase.from('inquiries').delete().eq('id', id);
  fail(error);
}

async function testConnection() {
  const { error } = await supabase.from('site_config').select('key').limit(1);
  fail(error);
}

module.exports = { loadSite, loadInquiries, saveSite, insertInquiry, findInquiry, updateInquiry, deleteInquiry, testConnection };
