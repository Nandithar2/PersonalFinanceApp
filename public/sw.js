self.addEventListener("install", event => {
  console.log("Service worker installed");
});

self.addEventListener("activate", event => {
  console.log("Service worker activated");
});

importScripts('idb.js');

self.addEventListener("fetch", async event => {
  const req = event.request;
  console.log(req)
  if (req.method === "POST") {
      event.respondWith(new Promise((resolve, reject) => {
          event.request.clone().json()
          .then((data) => {
              const id = crypto.randomUUID();
              const transaction = {
                  id,
                  ...data,
              };
              this.idbKeyval.set(id, transaction);
              const response = new Response(JSON.stringify(transaction));
              resolve(response);
          })
          .catch((error) => {
              reject(error);
          });
      }))
  }
  if (req.method === "GET" && req.url.endsWith('/transactions')) {
      event.respondWith(new Promise((resolve, reject) => {
          this.idbKeyval.values()
              .then((values) => {
                  const response = new Response(JSON.stringify(values));
                  resolve(response);
              })
              .catch((error) => {
                  reject(error);
              });
      }))
  }
});
