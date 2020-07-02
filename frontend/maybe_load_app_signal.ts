export async function maybeLoadAppSignal() {
  const token = globalConfig["APP_SIGNAL_TOKEN"];

  if (window.appSignal) {
    return;
  }

  if (token) {
    const AppSignal = (await import("@appsignal/javascript")).default;
    const { plugin } = await import("@appsignal/plugin-window-events");
    const as = new AppSignal({
      key: "YOUR FRONTEND API KEY"
    });
    as.use(plugin);
    window.appSignal = as;
  }
}
