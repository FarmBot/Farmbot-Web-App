export async function maybeLoadAppSignal() {
  const token = globalConfig["APPSIGNAL_TOKEN"];

  if (window.appSignal) {
    return;
  }

  if (token) {
    const AppSignal = (await import("@appsignal/javascript")).default;
    const { plugin } = await import("@appsignal/plugin-window-events");
    const as = new AppSignal({
      key: token,
      revision: globalConfig["LONG_REVISION"]
    });
    as.use(plugin({}));
    window.appSignal = as;
    console.log("AppSignal loaded.");
  }
}
