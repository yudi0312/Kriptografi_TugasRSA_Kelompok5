"use strict";

const $ = (selector) => document.querySelector(selector);
const encoder = new TextEncoder();
const decoder = new TextDecoder("utf-8", { fatal: true });

function gcd(a, b) {
  while (b !== 0n) [a, b] = [b, a % b];
  return a < 0n ? -a : a;
}

function extendedGcd(a, b) {
  if (b === 0n) return [a, 1n, 0n];
  const [g, x, y] = extendedGcd(b, a % b);
  return [g, y, x - (a / b) * y];
}

function modInverse(value, modulus) {
  const [g, x] = extendedGcd(value, modulus);
  if (g !== 1n) throw new Error("Eksponen publik tidak memiliki invers modulo φ(n).");
  return ((x % modulus) + modulus) % modulus;
}

function modPow(base, exponent, modulus) {
  let result = 1n;
  base %= modulus;
  while (exponent > 0n) {
    if (exponent & 1n) result = (result * base) % modulus;
    exponent >>= 1n;
    base = (base * base) % modulus;
  }
  return result;
}

function isPrime(value) {
  if (value < 2n) return false;
  if (value === 2n) return true;
  if (value % 2n === 0n) return false;
  for (let divisor = 3n; divisor * divisor <= value; divisor += 2n) {
    if (value % divisor === 0n) return false;
  }
  return true;
}

function randomInteger(min, max) {
  const range = max - min + 1;
  const bytes = new Uint32Array(1);
  globalThis.crypto.getRandomValues(bytes);
  return min + (bytes[0] % range);
}

function randomPrime() {
  for (let attempt = 0; attempt < 10000; attempt++) {
    const candidate = BigInt(randomInteger(257, 997) | 1);
    if (isPrime(candidate)) return candidate;
  }
  throw new Error("Tidak berhasil mendapatkan bilangan prima. Coba lagi.");
}

let rsaKeys = null;

function invalidateRsaKeys() {
  rsaKeys = null;
  $("#rsa-encrypt").disabled = true;
  $("#rsa-decrypt").disabled = true;
  $("#rsa-ciphertext").value = "";
  $("#public-n").textContent = "—";
  $("#public-e").textContent = "—";
  $("#private-n").textContent = "—";
  $("#private-d").textContent = "—";
  $("#math-n").textContent = "n = —";
  $("#math-phi").textContent = "φ(n) = —";
  $("#math-e").textContent = "e = —";
  $("#math-d").textContent = "d = —";
  $("#math-operation").textContent = "mᵈ mod n mengembalikan pesan";
}

function generateRsaKeys() {
  const errorBox = $("#rsa-key-error");
  errorBox.textContent = "";
  try {
    const p = BigInt($("#prime-p").value);
    const q = BigInt($("#prime-q").value);
    if (p === q) throw new Error("Bilangan prima p dan q harus berbeda.");
    if (!isPrime(p) || !isPrime(q)) throw new Error("Nilai p dan q harus berupa bilangan prima.");
    const n = p * q;
    if (n <= 255n) throw new Error("Hasil n harus lebih besar dari 255 agar setiap byte pesan dapat dienkripsi.");
    const phi = (p - 1n) * (q - 1n);
    let e = 65537n;
    if (e >= phi || gcd(e, phi) !== 1n) {
      e = 3n;
      while (e < phi && gcd(e, phi) !== 1n) e += 2n;
    }
    if (e >= phi) throw new Error("Tidak dapat memilih eksponen publik untuk nilai p dan q tersebut.");
    const d = modInverse(e, phi);
    rsaKeys = { p, q, n, phi, e, d };
    $("#public-n").textContent = n.toString();
    $("#public-e").textContent = e.toString();
    $("#private-n").textContent = n.toString();
    $("#private-d").textContent = d.toString();
    $("#math-n").textContent = `n = ${p} × ${q} = ${n}`;
    $("#math-phi").textContent = `φ(n) = ${p - 1n} × ${q - 1n} = ${phi}`;
    $("#math-e").textContent = `e = ${e} (gcd = 1)`;
    $("#math-d").textContent = `d = ${d} (${e} × ${d} mod ${phi} = 1)`;
    $("#math-operation").textContent = `c = m^${e} mod ${n} · m kembali = c^${d} mod ${n}`;
    $("#rsa-ciphertext").value = "";
    $("#rsa-encrypt").disabled = false;
    $("#rsa-decrypt").disabled = true;
    $("#rsa-message-status").textContent = "Pasangan kunci berhasil dibuat. Enkripsi pesan untuk melihat hasil.";
    $("#rsa-message-status").classList.remove("error");
  } catch (error) {
    invalidateRsaKeys();
    errorBox.textContent = error.message;
    $("#rsa-message-status").textContent = "Kunci tidak berhasil dibuat. Periksa nilai prima p dan q.";
    $("#rsa-message-status").classList.add("error");
  }
}

function encryptRsaMessage() {
  const status = $("#rsa-message-status");
  try {
    if (!rsaKeys) throw new Error("Bangkitkan pasangan kunci terlebih dahulu.");
    const bytes = encoder.encode($("#rsa-message").value);
    if (bytes.length === 0) throw new Error("Masukkan pesan tender yang akan dienkripsi.");
    const numbers = [];
    for (const byte of bytes) numbers.push(modPow(BigInt(byte), rsaKeys.e, rsaKeys.n).toString());
    $("#rsa-ciphertext").value = numbers.join(" ");
    $("#rsa-decrypt").disabled = false;
    status.textContent = `${bytes.length} byte dienkripsi satu per satu: c = m^e mod n.`;
    status.classList.remove("error");
  } catch (error) {
    status.textContent = error.message;
    status.classList.add("error");
  }
}

function decryptRsaMessage() {
  const status = $("#rsa-message-status");
  try {
    if (!rsaKeys) throw new Error("Bangkitkan pasangan kunci terlebih dahulu.");
    const entered = $("#rsa-ciphertext").value.trim().split(/\s+/).filter(Boolean);
    if (!entered.length || entered.some((value) => !/^\d+$/.test(value))) throw new Error("Ciphertext harus berupa deretan integer desimal.");
    const bytes = entered.map((value) => {
      const cipher = BigInt(value);
      if (cipher < 0n || cipher >= rsaKeys.n) throw new Error("Setiap nilai ciphertext harus berada dalam rentang 0 hingga n−1.");
      const plain = modPow(cipher, rsaKeys.d, rsaKeys.n);
      if (plain > 255n) throw new Error("Hasil dekripsi bukan byte yang valid. Periksa kunci dan ciphertext.");
      return Number(plain);
    });
    const message = decoder.decode(Uint8Array.from(bytes));
    $("#rsa-message").value = message;
    status.textContent = `${bytes.length} byte berhasil dipulihkan menggunakan kunci privat: m = c^d mod n.`;
    status.classList.remove("error");
  } catch (error) {
    status.textContent = error.message;
    status.classList.add("error");
  }
}

$("#generate-keys").addEventListener("click", generateRsaKeys);
["#prime-p", "#prime-q"].forEach((selector) => {
  $(selector).addEventListener("input", () => {
    invalidateRsaKeys();
    $("#rsa-key-error").textContent = "";
    $("#rsa-message-status").textContent = "Nilai prima berubah. Bangkitkan ulang pasangan kunci.";
    $("#rsa-message-status").classList.remove("error");
  });
});

$("#generate-primes").addEventListener("click", () => {
  try {
    const p = randomPrime();
    let q = randomPrime();
    while (q === p) q = randomPrime();
    $("#prime-p").value = p.toString();
    $("#prime-q").value = q.toString();
    $("#rsa-key-error").textContent = "";
    generateRsaKeys();
  } catch (error) {
    $("#rsa-key-error").textContent = error.message;
  }
});

$("#rsa-encrypt").addEventListener("click", encryptRsaMessage);
$("#rsa-decrypt").addEventListener("click", decryptRsaMessage);
$("#rsa-ciphertext").addEventListener("input", () => {
  $("#rsa-decrypt").disabled = !rsaKeys || !$("#rsa-ciphertext").value.trim();
  if ($("#rsa-decrypt").disabled && rsaKeys) {
    $("#rsa-message-status").textContent = "Tempel ciphertext integer untuk mengaktifkan dekripsi.";
  }
});

// Initialize first keys
generateRsaKeys();
