export const sanitizeHtml2CanvasColors = (clonedDoc: Document, containerId: string) => {
  const container = clonedDoc.getElementById(containerId);
  if (!container) return;

  // Helper canvas context to convert any browser-native color string (oklab, oklch, etc.) to standard rgba()
  const tempCanvas = clonedDoc.createElement('canvas');
  tempCanvas.width = 1;
  tempCanvas.height = 1;
  const ctx = tempCanvas.getContext('2d', { willReadFrequently: true });

  const convertColorToRgb = (colorStr: string): string => {
    if (!colorStr || (!colorStr.includes('oklab') && !colorStr.includes('oklch'))) {
      return colorStr;
    }
    if (!ctx) return 'rgba(99, 102, 241, 1)';
    try {
      ctx.clearRect(0, 0, 1, 1);
      ctx.fillStyle = 'rgba(0, 0, 0, 0)';
      ctx.fillStyle = colorStr;
      ctx.fillRect(0, 0, 1, 1);
      const [r, g, b, a] = ctx.getImageData(0, 0, 1, 1).data;
      return `rgba(${r}, ${g}, ${b}, ${(a / 255).toFixed(2)})`;
    } catch {
      return 'rgba(99, 102, 241, 1)';
    }
  };

  // 1. Sanitize all <style> tags in the cloned document
  const styleElements = clonedDoc.querySelectorAll('style');
  styleElements.forEach((style) => {
    if (style.textContent && (style.textContent.includes('oklab') || style.textContent.includes('oklch'))) {
      style.textContent = style.textContent
        .replace(/oklab\([^)]+\)/gi, (match) => convertColorToRgb(match))
        .replace(/oklch\([^)]+\)/gi, (match) => convertColorToRgb(match));
    }
  });

  // 2. Iterate through all elements in container and compute styles, replacing oklab/oklch with inline explicit RGB values
  const allElements = [container, ...Array.from(container.querySelectorAll('*'))];
  
  const cssProperties = [
    'color',
    'background-color',
    'border-color',
    'border-top-color',
    'border-right-color',
    'border-bottom-color',
    'border-left-color',
    'outline-color',
    'fill',
    'stroke'
  ];

  allElements.forEach((el) => {
    const htmlEl = el as HTMLElement;
    const computed = clonedDoc.defaultView?.getComputedStyle(htmlEl);

    if (computed) {
      cssProperties.forEach((prop) => {
        const val = computed.getPropertyValue(prop);
        if (val && (val.includes('oklab') || val.includes('oklch'))) {
          const rgbVal = convertColorToRgb(val);
          htmlEl.style.setProperty(prop, rgbVal, 'important');
        }
      });
    }

    // Also check inline style cssText
    if (htmlEl.style && htmlEl.style.cssText && (htmlEl.style.cssText.includes('oklab') || htmlEl.style.cssText.includes('oklch'))) {
      htmlEl.style.cssText = htmlEl.style.cssText
        .replace(/oklab\([^)]+\)/gi, (match) => convertColorToRgb(match))
        .replace(/oklch\([^)]+\)/gi, (match) => convertColorToRgb(match));
    }
  });
};
