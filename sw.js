// ZANKIN Service Worker
// 一度開けばオフライン（電波のない場所）でもアプリが動くようにファイルをキャッシュする
"use strict";

const CACHE_NAME = "zankin-v1";
const ASSETS = [
  "./",
  "./index.html",
  "./manifest.json",
  "./icon.svg",
  "./icon-192.png",
  "./icon-512.png",
];

// インストール時: 必要なファイルをまとめてキャッシュに保存
self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS)));
  self.skipWaiting();
});

// 有効化時: 古いバージョンのキャッシュを削除（CACHE_NAME を変えると更新される）
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// 通信時: まずネットワークから取得し（常に最新を表示）、失敗したらキャッシュで代用
self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        const copy = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});
