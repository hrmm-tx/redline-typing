/**
 * Helper to render high-performance HTML templates
 */
export function renderPage(content: string, title: string = 'REDLINE') {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${title}</title>
        <style>
          body { background: black; color: white; font-family: sans-serif; }
        </style>
    </head>
    <body>
        ${content}
    </body>
    </html>
  `;
}
