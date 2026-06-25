#!/usr/bin/env python3
"""
Web Component Extractor — Working Implementation
Extracts UI components from HTML using CSS selector analysis and classification.
"""

import re
import json
import sys
from typing import List, Dict, Optional
from urllib.request import urlopen, Request
from urllib.error import HTTPError, URLError


def fetch_html(url: str, timeout: int = 15) -> str:
    """Fetch HTML from a URL."""
    req = Request(url, headers={
        'User-Agent': 'Mozilla/5.0 (compatible; ComponentExtractor/1.0)',
        'Accept': 'text/html,application/xhtml+xml,*/*',
    })
    try:
        with urlopen(req, timeout=timeout) as resp:
            return resp.read().decode('utf-8', errors='ignore')
    except Exception as e:
        return f"ERROR: {e}"


def parse_elements(html: str) -> List[Dict]:
    """Parse HTML into structured component data."""
    pattern = r'<(\w+)\s*([^>]*?)(?:/>|>)'
    matches = re.findall(pattern, html)
    
    elements = []
    for tag, attrs in matches:
        if tag in ('script', 'style', 'meta', 'link', 'noscript', 'template'):
            continue
        
        # Extract attributes
        class_match = re.search(r'class=[\'"]([^\'"]*)[\'"]', attrs)
        id_match = re.search(r'id=[\'"]([^\'"]*)[\'"]', attrs)
        style_match = re.search(r'style=[\'"]([^\'"]*)[\'"]', attrs)
        data_matches = re.findall(r'data-(\w+)=[\'"]([^\'"]*)[\'"]', attrs)
        
        classes = class_match.group(1) if class_match else ''
        id_ = id_match.group(1) if id_match else ''
        style = style_match.group(1) if style_match else ''
        data_attrs = dict(data_matches) if data_matches else {}
        
        # Skip pure structural elements without any identifying info
        if not (classes or id_ or style):
            continue
        
        elements.append({
            'tag': tag,
            'classes': classes,
            'id': id_,
            'style': style,
            'data_attrs': data_attrs,
        })
    
    return elements


def classify_type(tag: str, classes: str) -> str:
    """Classify structural type from tag + classes."""
    classes_lower = (classes or '').lower()
    tag = tag.lower()
    
    # Button detection
    if tag == 'button' or 'btn' in classes_lower or 'button' in classes_lower:
        return 'Button'
    
    # Input detection
    if tag == 'input' or 'input' in classes_lower or 'field' in classes_lower:
        return 'Input'
    
    # Card detection
    if 'card' in classes_lower or 'panel' in classes_lower:
        return 'Card'
    
    # Navbar detection
    if 'nav' in classes_lower or 'navbar' in classes_lower or 'navigation' in classes_lower:
        return 'Navbar'
    
    # Hero detection
    if 'hero' in classes_lower or 'banner' in classes_lower:
        return 'Hero'
    
    # Modal/Dialog detection
    if 'modal' in classes_lower or 'dialog' in classes_lower or 'popup' in classes_lower:
        return 'Modal'
    
    # Dropdown detection
    if 'dropdown' in classes_lower or 'select' in classes_lower or 'menu' in classes_lower:
        return 'Dropdown'
    
    # Badge detection
    if 'badge' in classes_lower or 'tag' in classes_lower or 'label' in classes_lower:
        return 'Badge'
    
    # Tooltip detection
    if 'tooltip' in classes_lower or 'popover' in classes_lower:
        return 'Tooltip'
    
    # Divider detection
    if 'divider' in classes_lower or 'separator' in classes_lower or 'hr' == tag:
        return 'Divider'
    
    # Footer detection
    if 'footer' in classes_lower or 'copyright' in classes_lower:
        return 'Footer'
    
    # Sidebar detection
    if 'sidebar' in classes_lower or 'aside' == tag or 'side' in classes_lower:
        return 'Sidebar'
    
    # Pricing detection
    if 'pricing' in classes_lower or 'price' in classes_lower or 'plan' in classes_lower:
        return 'Pricing Table'
    
    # Testimonial detection
    if 'testimonial' in classes_lower or 'quote' in classes_lower or 'review' in classes_lower:
        return 'Testimonial'
    
    # Feature/Grid detection
    if 'feature' in classes_lower or 'grid' in classes_lower:
        return 'Feature Grid'
    
    # Stat detection
    if 'stat' in classes_lower or 'metric' in classes_lower or 'counter' in classes_lower:
        return 'Stat Card'
    
    # Avatar detection
    if 'avatar' in classes_lower or 'profile' in classes_lower or 'user-icon' in classes_lower:
        return 'Avatar'
    
    # Breadcrumb detection
    if 'breadcrumb' in classes_lower or 'bread' in classes_lower:
        return 'Breadcrumb'
    
    # Tabs detection
    if 'tab' in classes_lower or 'tabpanel' in classes_lower:
        return 'Tabs'
    
    # Accordion detection
    if 'accordion' in classes_lower or 'collapse' in classes_lower or 'expand' in classes_lower:
        return 'Accordion'
    
    # Progress detection
    if 'progress' in classes_lower or 'bar' in classes_lower:
        return 'Progress Bar'
    
    # Fallback based on tag
    type_map = {
        'a': 'Link/Button', 'div': 'Container', 'span': 'Inline',
        'p': 'Text', 'h1': 'Heading', 'h2': 'Heading', 'h3': 'Heading',
        'h4': 'Heading', 'h5': 'Heading', 'h6': 'Heading',
        'ul': 'List', 'ol': 'List', 'li': 'List Item',
        'img': 'Image', 'svg': 'Icon', 'form': 'Form',
        'table': 'Table', 'tr': 'Table Row', 'td': 'Table Cell',
        'th': 'Table Header', 'section': 'Section', 'article': 'Article',
        'header': 'Header', 'footer': 'Footer', 'nav': 'Navigation',
        'aside': 'Aside', 'main': 'Main', 'figure': 'Figure',
        'figcaption': 'Caption', 'blockquote': 'Blockquote',
        'code': 'Code Block', 'pre': 'Preformatted',
    }
    return type_map.get(tag, 'Container')


def classify_function(classes: str, tag: str) -> str:
    """Classify functional purpose from classes and tag."""
    classes_lower = (classes or '').lower()
    combined = f"{tag} {classes_lower}"
    
    if any(x in combined for x in ['cta', 'submit', 'buy', 'signup', 'subscribe', 'download', 'get-started', 'try', 'contact-sales']):
        return 'Conversion'
    
    if any(x in combined for x in ['nav', 'menu', 'breadcrumb', 'sidebar', 'tab', 'skip']):
        return 'Navigation'
    
    if any(x in combined for x in ['stat', 'metric', 'counter', 'number', 'data', 'chart', 'graph', 'analytics']):
        return 'Information'
    
    if any(x in combined for x in ['input', 'field', 'form', 'search', 'select', 'checkbox', 'radio', 'textarea', 'toggle', 'upload']):
        return 'Input'
    
    if any(x in combined for x in ['card', 'hero', 'banner', 'feature', 'gallery', 'image', 'video', 'media', 'showcase']):
        return 'Display'
    
    if any(x in combined for x in ['testimonial', 'quote', 'review', 'rating', 'star', 'trust', 'logo', 'client', 'partner']):
        return 'Social Proof'
    
    if any(x in combined for x in ['progress', 'loading', 'spinner', 'alert', 'toast', 'notification', 'error', 'success', 'warning', 'status']):
        return 'Feedback'
    
    return 'Display'


def classify_aesthetic(style: str, classes: str) -> Dict:
    """Classify aesthetic category from inline styles and classes."""
    combined = f"{style} {classes}".lower()
    
    # Metal Heart: dark, sharp, monospace
    if any(x in combined for x in ['#1a1a', '#2a2a', '#333', 'sharp', 'mono', 'jetbrains', 'border-radius: 0', 'border-radius:0']):
        return {'category': 'Metal Heart', 'confidence': 0.7, 'evidence': 'Dark colors or sharp corners or monospace'}
    
    # Futuristic: gradients, glow, blur, large radius
    if any(x in combined for x in ['linear-gradient', 'backdrop-filter', 'blur(', 'box-shadow: 0 0', 'border-radius: 1', 'glow', 'neon', 'cyber']):
        return {'category': 'Futuristic', 'confidence': 0.7, 'evidence': 'Gradients or glow effects or large radius'}
    
    # Playful: rounded, bright, soft shadows
    if any(x in combined for x in ['border-radius: 2', 'border-radius: 3', 'rounded-2xl', 'rounded-3xl', 'rounded-full', 'pastel', 'pink', 'purple', 'yellow', 'orange']):
        return {'category': 'Playful', 'confidence': 0.6, 'evidence': 'Large radius or bright colors'}
    
    # Minimalist: white, no border, no shadow
    if any(x in combined for x in ['#ffffff', '#fff', 'border: none', 'box-shadow: none', 'whitespace-', 'space-y-', 'minimal']):
        return {'category': 'Minimalist', 'confidence': 0.6, 'evidence': 'White background or no decorations'}
    
    # Corporate: blue, serif, structured
    if any(x in combined for x in ['#0066ff', '#0052', 'georgia', 'serif', 'enterprise', 'corporate', 'business']):
        return {'category': 'Corporate', 'confidence': 0.6, 'evidence': 'Blue primary or serif fonts'}
    
    # Grunge: texture, irregular, mixed
    if any(x in combined for x in ['noise', 'grunge', 'distressed', 'rough', 'mixed', 'irregular']):
        return {'category': 'Grunge', 'confidence': 0.5, 'evidence': 'Texture or irregular patterns'}
    
    # Default: Structured Baseline
    return {'category': 'Structured Baseline', 'confidence': 0.5, 'evidence': 'Default classification'}


def extract_tokens(style: str) -> Dict[str, str]:
    """Extract design tokens from inline style string."""
    if not style:
        return {}
    
    tokens = {}
    # Parse CSS properties
    for prop in style.split(';'):
        prop = prop.strip()
        if ':' in prop:
            key, val = prop.split(':', 1)
            key = key.strip().lower()
            val = val.strip()
            if val and val != 'initial' and val != 'inherit' and val != 'unset':
                # Map CSS properties to token names
                mapping = {
                    'background-color': 'backgroundColor',
                    'background': 'background',
                    'color': 'color',
                    'border-radius': 'borderRadius',
                    'padding': 'padding',
                    'margin': 'margin',
                    'font-size': 'fontSize',
                    'font-family': 'fontFamily',
                    'font-weight': 'fontWeight',
                    'border': 'border',
                    'border-top': 'borderTop',
                    'border-bottom': 'borderBottom',
                    'box-shadow': 'boxShadow',
                    'display': 'display',
                    'position': 'position',
                    'opacity': 'opacity',
                    'gap': 'gap',
                    'grid-template-columns': 'gridTemplateColumns',
                    'flex-direction': 'flexDirection',
                    'justify-content': 'justifyContent',
                    'align-items': 'alignItems',
                    'text-align': 'textAlign',
                    'text-transform': 'textTransform',
                    'letter-spacing': 'letterSpacing',
                    'line-height': 'lineHeight',
                    'background-image': 'backgroundImage',
                    'background-gradient': 'backgroundGradient',
                    'backdrop-filter': 'backdropFilter',
                    'transform': 'transform',
                    'transition': 'transition',
                    'z-index': 'zIndex',
                    'overflow': 'overflow',
                    'width': 'width',
                    'height': 'height',
                    'min-height': 'minHeight',
                    'max-width': 'maxWidth',
                }
                token_key = mapping.get(key, key)
                tokens[token_key] = val
    
    return tokens


def extract_components(url: str) -> Dict:
    """Main extraction function."""
    html = fetch_html(url)
    
    if html.startswith('ERROR:'):
        return {
            'url': url,
            'status': 'failed',
            'error': html,
            'components': []
        }
    
    elements = parse_elements(html)
    
    components = []
    for el in elements:
        comp = {
            'name': f"{el['tag'].title()}{len(components) + 1}",
            'description': f"<{el['tag']}> element" + (f" with classes: {el['classes'][:50]}" if el['classes'] else ""),
            'aestheticCategory': classify_aesthetic(el['style'], el['classes'])['category'],
            'aestheticConfidence': classify_aesthetic(el['style'], el['classes'])['confidence'],
            'aestheticEvidence': classify_aesthetic(el['style'], el['classes'])['evidence'],
            'type': classify_type(el['tag'], el['classes']),
            'function': classify_function(el['classes'], el['tag']),
            'designTokens': extract_tokens(el['style']),
            'sourceUrl': url,
            'rawTag': el['tag'],
            'rawClasses': el['classes'][:200],
            'rawId': el['id'],
        }
        components.append(comp)
    
    return {
        'url': url,
        'status': 'success',
        'componentCount': len(components),
        'components': components
    }


if __name__ == '__main__':
    url = sys.argv[1] if len(sys.argv) > 1 else 'https://docs.nextjs.org'
    result = extract_components(url)
    print(json.dumps(result, indent=2))
