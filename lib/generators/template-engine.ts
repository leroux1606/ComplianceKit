/**
 * Simple template engine for policy generation
 * Supports: {{variable}}, {{#if condition}}...{{/if}}, {{#each items}}...{{/each}}
 */

export interface TemplateData {
  [key: string]: string | number | boolean | null | undefined | TemplateData | TemplateData[];
}

/**
 * Process a template string with data
 */
export function processTemplate(template: string, data: TemplateData): string {
  let result = template;

  // Process each loops first
  result = processEachBlocks(result, data);

  // Process if/else conditionals
  result = processIfBlocks(result, data);

  // Process simple variable replacements
  result = processVariables(result, data);

  return result;
}

/**
 * Process {{#each items}}...{{/each}} blocks
 */
function processEachBlocks(template: string, data: TemplateData): string {
  const eachRegex = /\{\{#each\s+(\w+)\}\}([\s\S]*?)\{\{\/each\}\}/g;

  return template.replace(eachRegex, (match, arrayName, content) => {
    const items = data[arrayName];

    if (!Array.isArray(items) || items.length === 0) {
      return "";
    }

    return items
      .map((item, index) => {
        let itemContent = content;
        
        // Replace {{this}} with the item itself if it's a primitive
        if (typeof item === "string" || typeof item === "number") {
          itemContent = itemContent.replace(/\{\{this\}\}/g, String(item));
        }
        
        // Replace {{@index}} with the current index
        itemContent = itemContent.replace(/\{\{@index\}\}/g, String(index));
        itemContent = itemContent.replace(/\{\{@number\}\}/g, String(index + 1));
        
        // If item is an object, process its properties
        if (typeof item === "object" && item !== null) {
          itemContent = processVariables(itemContent, item as TemplateData);
          itemContent = processIfBlocks(itemContent, item as TemplateData);
        }

        return itemContent;
      })
      .join("");
  });
}

/**
 * Process {{#if condition}}...{{else}}...{{/if}} blocks
 */
function processIfBlocks(template: string, data: TemplateData): string {
  // Handle if/else blocks
  const ifElseRegex = /\{\{#if\s+(\w+)\}\}([\s\S]*?)\{\{else\}\}([\s\S]*?)\{\{\/if\}\}/g;
  let result = template.replace(ifElseRegex, (match, condition, ifContent, elseContent) => {
    const value = data[condition];
    const isTruthy = Boolean(value) && value !== "false" && value !== "0";
    return isTruthy ? ifContent : elseContent;
  });

  // Handle simple if blocks (no else)
  const ifRegex = /\{\{#if\s+(\w+)\}\}([\s\S]*?)\{\{\/if\}\}/g;
  result = result.replace(ifRegex, (match, condition, content) => {
    const value = data[condition];
    const isTruthy = Boolean(value) && value !== "false" && value !== "0";
    return isTruthy ? content : "";
  });

  return result;
}

/**
 * Process {{variable}} replacements
 */
function processVariables(template: string, data: TemplateData): string {
  const variableRegex = /\{\{(\w+(?:\.\w+)*)\}\}/g;

  return template.replace(variableRegex, (match, path) => {
    const value = getNestedValue(data, path);

    if (value === null || value === undefined) {
      return "";
    }

    // Escape HTML entities for security
    return escapeHtml(String(value));
  });
}

/**
 * Get nested value from object using dot notation
 */
function getNestedValue(obj: TemplateData, path: string): unknown {
  const keys = path.split(".");
  let value: unknown = obj;

  for (const key of keys) {
    if (value === null || value === undefined || typeof value !== "object") {
      return undefined;
    }
    value = (value as TemplateData)[key];
  }

  return value;
}

/**
 * Escape HTML entities
 */
function escapeHtml(text: string): string {
  const htmlEntities: Record<string, string> = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  };

  return text.replace(/[&<>"']/g, (char) => htmlEntities[char] || char);
}

/**
 * Format date for display in policies
 */
export function formatPolicyDate(date: Date = new Date()): string {
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

