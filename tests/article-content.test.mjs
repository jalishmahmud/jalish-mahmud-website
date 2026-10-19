import assert from "node:assert/strict";
import test from "node:test";
import { marked } from "marked";
import { sanitizeContent } from "../lib/article-content.js";

test("pasted HTML keeps article structure without editor spacing or unsafe styles", () => {
  const html = `<div style="margin: 80px"><h1>Technical title</h1><p>&nbsp;</p>
    <p><strong>Bold</strong> and <em>italic</em> <a href="https://example.com" style="font-size:30px">link</a>.</p><br>
    <ul><li>First<ul><li>Nested</li></ul></li><li>Second</li></ul>
    <blockquote><p>Quoted text</p></blockquote>
    <pre><code class="language-js"><span class="hljs-keyword">const</span> value = 1;</code></pre>
    <table><thead><tr><th style="text-align: right; color: red">Name</th></tr></thead><tbody><tr><td>Value</td></tr></tbody></table></div>`;
  const result = sanitizeContent(html);
  assert.match(result, /^<h1>Technical title<\/h1>/);
  assert.match(result, /<ul><li>First<ul><li>Nested<\/li><\/ul><\/li>/);
  assert.match(result, /<blockquote><p>Quoted text<\/p><\/blockquote>/);
  assert.match(result, /<code class="language-js"><span class="hljs-keyword">const<\/span>/);
  assert.match(result, /<th align="right">Name<\/th>/);
  assert.doesNotMatch(result, /style=|<p>(?:&nbsp;)?<\/p>|<br\s*\/?><ul>/);
});

test("empty paragraph cleanup preserves linked images and intentional breaks", () => {
  const result = sanitizeContent('<p><span> </span></p><p><a href="https://example.com"><img src="https://example.com/image.png" alt="Diagram"></a></p><p>first<br>second</p>');
  assert.doesNotMatch(result, /<p><span> <\/span><\/p>/);
  assert.match(result, /<p><a href="https:\/\/example.com"[^>]*><img[^>]*alt="Diagram"[^>]*><\/a><\/p>/);
  assert.match(result, /<p>first<br\s*\/>second<\/p>/);
});

test("Markdown from a technical article survives conversion and sanitization", () => {
  const markdown = `## Setup\n\nA **strong** step with *emphasis* and \`inline\`.\n\n1. First\n   - Nested\n2. Second\n\n> Keep this note.\n\n\`\`\`js\nconst value = 1;\n\`\`\`\n\n| Name | Value |\n| --- | --- |\n| One | 1 |`;
  const result = sanitizeContent(marked.parse(markdown));
  for (const tag of ["h2", "strong", "em", "code", "ol", "ul", "blockquote", "pre", "table", "th", "td"]) {
    assert.match(result, new RegExp(`<${tag}(?:\\s|>)`), `missing ${tag}`);
  }
  assert.match(result, /class="language-js"/);
});

test("unsafe content and links are removed", () => {
  const result = sanitizeContent('<p onclick="alert(1)"><a href="javascript:alert(1)">bad</a><script>alert(1)</script></p>');
  assert.doesNotMatch(result, /onclick|javascript:|<script>/);
});
