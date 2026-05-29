/**
 * Normalize Quill HTML so blank lines, lists, and Enter key spacing render the same
 * in the editor and on the public invitation page.
 */

const LIST_TYPES = "bullet|ordered|checked|unchecked";

function ensureQuillListUi(html) {
  return html.replace(
    new RegExp(
      `<li([^>]*\\bdata-list\\s*=\\s*["'](?:${LIST_TYPES})["'][^>]*)>(?!\\s*<span[^>]*\\bql-ui\\b)`,
      "gi"
    ),
    '<li$1><span class="ql-ui" contenteditable="false"></span>'
  );
}

function convertLegacyUlToQuill(html) {
  return html.replace(/<ul\b([^>]*)>([\s\S]*?)<\/ul>/gi, (_match, _attrs, inner) => {
    const innerWithListType = inner.replace(
      /<li\b([^>]*)>/gi,
      (liMatch, liAttrs) => {
        const attrs = (liAttrs || "").trim();
        if (/\bdata-list\s*=/i.test(attrs)) return liMatch;
        return attrs
          ? `<li data-list="bullet" ${attrs}>`
          : `<li data-list="bullet">`;
      }
    );
    return `<ol>${ensureQuillListUi(innerWithListType)}</ol>`;
  });
}

function repairLegacyOl(html) {
  return html.replace(/<ol\b([^>]*)>([\s\S]*?)<\/ol>/gi, (match, attrs, inner) => {
    if (/\bdata-list\s*=/i.test(inner)) {
      return `<ol${attrs}>${ensureQuillListUi(inner)}</ol>`;
    }
    const innerWithListType = inner.replace(
      /<li\b([^>]*)>/gi,
      (liMatch, liAttrs) => {
        const a = (liAttrs || "").trim();
        if (/\bdata-list\s*=/i.test(a)) return liMatch;
        return a ? `<li data-list="ordered" ${a}>` : `<li data-list="ordered">`;
      }
    );
    return `<ol${attrs}>${ensureQuillListUi(innerWithListType)}</ol>`;
  });
}

function normalizeInvitationHtml(html) {
  if (!html || typeof html !== "string") return "";

  let out = html;

  out = convertLegacyUlToQuill(out);
  out = repairLegacyOl(out);
  out = ensureQuillListUi(out);

  out = out.replace(/<p>\s*<\/p>/gi, "<p><br></p>");

  out = out.replace(
    /<p>(?!\s*(?:&nbsp;|&#160;|\u00a0))[\t \r\n\f\v]*<\/p>/gi,
    "<p><br></p>"
  );

  out = out.replace(/<p>\s*<br[^>]*\/?>\s*<\/p>/gi, "<p><br></p>");

  return out;
}

module.exports = { normalizeInvitationHtml };
