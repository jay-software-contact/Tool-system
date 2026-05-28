const { Client, Databases } = require('appwrite');

module.exports = async function (req, res) {
  const client = new Client()
    .setEndpoint(process.env.APPWRITE_ENDPOINT || 'https://nyc.cloud.appwrite.io/v1')
    .setProject(process.env.APPWRITE_PROJECT_ID || '6a13543d0006a286284f')
    .setKey(process.env.APPWRITE_API_KEY || '');

  const databases = new Databases(client);

  try {
    // Fetch all components from the 'components' collection
    const components = await databases.listDocuments(
      'components',
      'components',
      []
    );

    // Build tree structure grouped by aestheticCategory
    const tree = {};
    for (const doc of components.documents) {
      const category = doc.aestheticCategory || 'uncategorized';
      if (!tree[category]) {
        tree[category] = {
          name: category,
          type: 'category',
          children: []
        };
      }
      tree[category].children.push({
        id: doc.$id,
        name: doc.name,
        type: doc.type || 'component',
        code: doc.code || '',
        designTokens: doc.designTokens || {}
      });
    }

    const treeArray = Object.values(tree);

    res.json({
      success: true,
      data: {
        name: 'components-root',
        type: 'root',
        children: treeArray
      },
      total: components.total
    });
  } catch (error) {
    // If collection doesn't exist yet, return empty tree
    if (error.code === 404 || (error.message && error.message.includes('not found'))) {
      res.json({
        success: true,
        data: {
          name: 'components-root',
          type: 'root',
          children: []
        },
        total: 0,
        message: 'No components collection found — returning empty tree'
      });
      return;
    }

    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch component tree'
    });
  }
};
