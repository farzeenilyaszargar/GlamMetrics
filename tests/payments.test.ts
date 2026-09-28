import { test } from "node:test";
import assert from "node:assert/strict";
import { createHmac } from "node:crypto";
import { signatureValid } from "../lib/payments";
test("payment signatures bind payment to subscription and reject malformed input", () => {
  const payload = "pay_123|sub_456",
    secret = "test-secret";
  const signature = createHmac("sha256", secret).update(payload).digest("hex");
  assert.equal(signatureValid(payload, signature, secret), true);
  for (const invalid of ["", signature.slice(1), "z".repeat(64)])
    assert.equal(signatureValid(payload, invalid, secret), false);
  assert.equal(signatureValid("pay_123|sub_other", signature, secret), false);
  assert.equal(signatureValid(payload, signature, "other-secret"), false);
});
