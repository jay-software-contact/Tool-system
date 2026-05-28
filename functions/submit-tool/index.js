module.exports = async function (req, res) {
  // Assuming Appwrite passes authentication info in request headers
  const role = req.headers['x-appwrite-user-role'];
  if (role && role.includes('users')) {
    res.json({ success: true, message: 'Submit tool received' });
  } else {
    res.status(401).json({ success: false, error: 'Unauthorized' });
  }
};