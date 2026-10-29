import assert from "node:assert/strict";
import test from "node:test";
import { splitBilingualText } from "../app/bilingual-text.ts";
import { DEFAULT_SITE_CONTENT } from "../app/site-content.ts";

test("translation boundaries preserve complete English sentences, Chinese dates and labels", () => {
  assert.deepEqual(splitBilingualText("Panels · 專題研討"), ["Panels", "專題研討"]);
  assert.deepEqual(splitBilingualText("How do I register? / 如何報名？"), ["How do I register?", "如何報名？"]);
  assert.deepEqual(splitBilingualText("Registration & abstracts by March 1 · 3月1日截止"), ["Registration & abstracts by March 1", "3月1日截止"]);
  assert.deepEqual(splitBilingualText("Two sentences. Still English. 中文翻譯。"), ["Two sentences. Still English.", "中文翻譯。"]);
  assert.deepEqual(splitBilingualText("Registration closes March 1. 2027年3月1日截止。"), ["Registration closes March 1.", "2027年3月1日截止。"]);
  assert.deepEqual(splitBilingualText("May 26–27: conference.\n5月26—27日：會議。"), ["May 26–27: conference.", "5月26—27日：會議。"]);
  assert.deepEqual(splitBilingualText("Journal of Daoist Studies / Three Pines Press"), ["Journal of Daoist Studies / Three Pines Press"]);
});

test("every mixed-language body and label in the revised conference content has a complete translation block", () => {
  const content = DEFAULT_SITE_CONTENT;
  const pairs = [content.about.kicker, content.venue.kicker, content.venue.address, content.venue.transport, ...content.venue.tags, ...content.feeNotes];
  for (const item of [...content.formats, ...content.remarks, ...content.registration.materials]) pairs.push(item.title, item.body);
  for (const day of content.schedule) {
    pairs.push(day.weekday);
    for (const item of day.items) pairs.push(item.title, item.place, item.host);
  }
  for (const item of content.fees) pairs.push(item.title, item.detail, item.payment);
  for (const item of content.faqs) pairs.push(item.question, item.answer);
  for (const value of pairs) {
    const lines = splitBilingualText(value);
    assert.equal(lines.length, 2, `Translation not separated: ${value}`);
    assert.match(lines[1], /\p{Script=Han}/u);
    assert.doesNotMatch(lines[0], /\p{Script=Han}/u);
  }
});
