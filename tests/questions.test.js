import test from "node:test";
import assert from "node:assert/strict";

import {
  initialAnswers,
  validateAnswers
} from "../src/data/questions.js";

import {
  csvCell,
  recordsToCSV
} from "../src/lib/csv.js";

function validAnswers() {
  return {
    ...initialAnswers(),
    gender: "female",
    age: "20s",
    region: "chuncheon",
    awareness: "never",
    souvenir: "yes",
    before: 2,
    water: "maero",
    fire: "maero",
    keepsakes: [],
    maero: "basic",
    fit: 4,
    price: "p7900",
    comment: ""
  };
}

test("이메일 없이 동의하지 않아도 제출할 수 있다", () => {
  assert.deepEqual(validateAnswers(validAnswers()), {});
});

test("이메일을 쓰면 동의가 필요하다", () => {
  const answers = {
    ...validAnswers(),
    email: "person@example.com"
  };

  assert.ok(validateAnswers(answers).emailConsent);
});

test("이메일 수집이 꺼져 있으면 주소를 받지 않는다", () => {
  const answers = {
    ...validAnswers(),
    email: "person@example.com",
    emailConsent: true
  };

  assert.ok(
    validateAnswers(answers, { allowEmail: false }).email
  );
});

test("선형 배율은 1부터 5까지만 허용한다", () => {
  const answers = { ...validAnswers(), before: 0 };
  assert.ok(validateAnswers(answers).before);
});

test("물건은 선택하지 않아도 된다", () => {
  assert.equal(
    validateAnswers(validAnswers()).keepsakes,
    undefined
  );
});

test("중복 물건 값은 거부한다", () => {
  const answers = {
    ...validAnswers(),
    keepsakes: ["keyring", "keyring"]
  };

  assert.ok(validateAnswers(answers).keepsakes);
});

test("CSV 수식 시작 문자열을 보호한다", () => {
  assert.equal(csvCell("=1+1"), "\"'=1+1\"");
  assert.equal(csvCell(-1), "\"-1\"");
});

test("CSV는 중첩된 탐색 기록을 포함한다", () => {
  const csv = recordsToCSV([
    {
      id: "sample",
      evidence: {
        photos: {
          viewedIds: ["festival-water"]
        }
      }
    }
  ]);

  assert.ok(csv.startsWith("\uFEFF"));
  assert.ok(csv.includes("evidence.photos.viewedIds"));
  assert.ok(csv.includes("festival-water"));
});
