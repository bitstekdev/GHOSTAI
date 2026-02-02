/**
 * It Replaces placeholders in HTML with dynamic values
 * Ex:
 * {{userName}} → Asad
 */

exports.renderTemplate = (html, variables = {}) => {
  let renderedHtml = html;

  for (const key in variables) {
    const regex = new RegExp(`{{\\s*${key}\\s*}}`, 'g');
    renderedHtml = renderedHtml.replace(regex, variables[key]);
  }

  return renderedHtml;
};
