module.exports = async (context) => {
  const req = context.req;
  const res = context.res;
  let body = {};
  try {
    body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
  } catch (e) {
    return res.json({ error: 'Invalid JSON body' }, 400);
  }
  const { template, data } = body;
  if (!template) {
    return res.json({ error: 'Missing "template" field' }, 400);
  }
  let result = template;
  for (const [key, value] of Object.entries(data || {})) {
    const placeholder = `{{${key}}}`;
    result = result.split(placeholder).join(value);
  }
  return res.json({ resolved: result });
};
