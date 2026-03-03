(function (window) {
  window.__env = window.__env || {};
  const env = window.__env;
  env.serverAPI = '${APP_SERVER_API}';
  env.dataspaceURL = '${APP_DATASPACE_URL}';
})(this);
