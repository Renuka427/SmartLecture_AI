const appPromise = import("../artifacts/api-server/src/app.ts");

module.exports = async function handler(req, res) {
  const mod = await appPromise;
  return mod.default(req, res);
};
