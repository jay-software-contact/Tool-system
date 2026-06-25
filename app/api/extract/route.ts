import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const url = body?.url;

    if (!url || typeof url !== 'string') {
      return NextResponse.json(
        { error: 'url field is required' },
        { status: 400 }
      );
    }

    // Normalize URL
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      return NextResponse.json(
        { error: 'url must start with http:// or https://' },
        { status: 400 }
      );
    }

    // Dynamically import Python extraction (if available)
    // Or use built-in HTML parser for client-side extraction
    
    try {
      // Try to spawn the Python extractor
      const { spawn } = require('child_process');
      const scriptPath = process.cwd() + '/extract.py';
      
      const result = await new Promise<string>((resolve, reject) => {
        const proc = spawn('python', [scriptPath, url], { timeout: 30000 });
        let output = '';
        let error = '';
        
        proc.stdout.on('data', (data: Buffer) => { output += data.toString(); });
        proc.stderr.on('data', (data: Buffer) => { error += data.toString(); });
        
        proc.on('close', (code: number) => {
          if (code === 0) {
            resolve(output);
          } else {
            reject(new Error(error || `Process exited with code ${code}`));
          }
        });
        
        proc.on('error', () => {
          // Python not available — fall back to inline extraction
          resolve('');
        });
      });
      
      if (result) {
        const data = JSON.parse(result);
        return NextResponse.json(data);
      }
    } catch {
      // Python not available — fall back to inline extraction
    }

    // Fallback: inline HTML extraction using built-in fetch
    const response = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; ComponentExtractor/1.0)' },
      signal: AbortSignal.timeout(15000),
    });
    
    if (!response.ok) {
      return NextResponse.json(
        { error: `Failed to fetch URL: ${response.status}`, status: response.status },
        { status: 502 }
      );
    }
    
    const html = await response.text();
    
    // Simple inline extraction
    const components = extractInline(html, url);
    
    return NextResponse.json({
      url,
      status: 'success',
      componentCount: components.length,
      components,
      method: 'inline-html',
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || 'Extraction failed' },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const url = searchParams.get('url');
  
  if (!url) {
    return NextResponse.json({ error: 'url parameter is required' }, { status: 400 });
  }
  
  // Call POST handler
  const postReq = new Request(req.url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url }),
  });
  return POST(postReq as NextRequest);
}

/**
 * Inline HTML extraction — runs in the browser/Node when Python is unavailable
 */
function extractInline(html: string, sourceUrl: string) {
  const elements: any[] = [];
  
  // Parse HTML elements with attributes
  const tagRegex = /<(\w+)([^>]*?)(?:\/>|>)/g;
  let match;
  let index = 0;
  
  while ((match = tagRegex.exec(html)) !== null) {
    const [, tag, attrs] = match;
    if (['script', 'style', 'meta', 'link', 'noscript', 'template', '!doctype', 'br', 'hr', 'img', 'input', 'source'].includes(tag.toLowerCase())) {
      continue;
    }
    
    // Extract class
    const classMatch = attrs.match(/class=[\'"]([^\'"]*)[\'"]/);
    const classes = classMatch ? classMatch[1] : '';
    
    // Extract id
    const idMatch = attrs.match(/id=[\'"]([^\'"]*)[\'"]/);
    const id = idMatch ? idMatch[1] : '';
    
    // Extract inline style
    const styleMatch = attrs.match(/style=[\'"]([^\'"]*)[\'"]/);
    const style = styleMatch ? styleMatch[1] : '';
    
    if (!classes && !id && !style) continue;
    
    index++;
    
    // Classify
    const classesLower = classes.toLowerCase();
    const tagLower = tag.toLowerCase();
    
    // Classify type
    let type = 'Container';
    if (tagLower === 'button' || classesLower.includes('btn') || classesLower.includes('button')) type = 'Button';
    else if (tagLower === 'input' || classesLower.includes('input') || classesLower.includes('field')) type = 'Input';
    else if (classesLower.includes('card') || classesLower.includes('panel')) type = 'Card';
    else if (classesLower.includes('nav') || tagLower === 'nav') type = 'Navbar';
    else if (classesLower.includes('hero') || classesLower.includes('banner')) type = 'Hero';
    else if (tagLower === 'a') type = 'Link/Button';
    else if (tagLower.startsWith('h') && tagLower.length === 2) type = 'Heading';
    
    // Classify function
    let func = 'Display';
    if (classesLower.includes('submit') || classesLower.includes('cta')) func = 'Conversion';
    else if (classesLower.includes('nav') || classesLower.includes('menu') || tagLower === 'nav') func = 'Navigation';
    else if (classesLower.includes('input') || classesLower.includes('form') || classesLower.includes('search')) func = 'Input';
    else if (classesLower.includes('stat') || classesLower.includes('metric') || classesLower.includes('counter')) func = 'Information';
    else if (classesLower.includes('testimonial') || classesLower.includes('quote') || classesLower.includes('review')) func = 'Social Proof';
    else if (classesLower.includes('progress') || classesLower.includes('loading') || classesLower.includes('alert')) func = 'Feedback';
    
    // Classify aesthetic
    let aesthetic = 'Structured Baseline';
    let confidence = 0.5;
    const combined = (style + ' ' + classes).toLowerCase();
    if (combined.includes('gradient') || combined.includes('glow') || combined.includes('blur')) {
      aesthetic = 'Futuristic'; confidence = 0.6;
    } else if (combined.includes('#1a1a') || combined.includes('#2a2a') || combined.includes('mono')) {
      aesthetic = 'Metal Heart'; confidence = 0.6;
    } else if (combined.includes('rounded-2xl') || combined.includes('rounded-3xl') || combined.includes('rounded-full')) {
      aesthetic = 'Playful'; confidence = 0.6;
    } else if (combined.includes('#ffffff') || combined.includes('border: none') || combined.includes('box-shadow: none')) {
      aesthetic = 'Minimalist'; confidence = 0.6;
    } else if (combined.includes('#0066') || combined.includes('#0052') || combined.includes('serif')) {
      aesthetic = 'Corporate'; confidence = 0.6;
    }
    
    // Extract design tokens from inline style
    const tokens: Record<string, string> = {};
    if (style) {
      style.split(';').forEach((decl: string) => {
        const [key, val] = decl.split(':').map(s => s.trim());
        if (key && val && val !== 'initial') {
          const tokenKey = key.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
          tokens[tokenKey] = val;
        }
      });
    }
    
    elements.push({
      name: `${tag.charAt(0).toUpperCase() + tag.slice(1)}${index}`,
      description: `<${tag}> element` + (classes ? ` with classes: ${classes.slice(0, 50)}` : ''),
      aestheticCategory: aesthetic,
      aestheticConfidence: confidence,
      type,
      function: func,
      designTokens: tokens,
      sourceUrl,
      rawTag: tag,
      rawId: id,
    });
  }
  
  return elements;
}
