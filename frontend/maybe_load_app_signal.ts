export async function maybeLoadAppSignal() {
  const token = globalConfig["APPSIGNAL_TOKEN"];

  if (window.appSignal) {
    console.log("Already have appSignal loaded.");
    return;
  }

  if (token) {
    console.log("Load appsignal");
    const AppSignal = (await import("@appsignal/javascript")).default;
    console.log("Load window events plugin");
    const { plugin } = await import("@appsignal/plugin-window-events");
    console.log("instantiate appsignal");
    const as = new AppSignal({
      key: "YOUR FRONTEND API KEY"
    });
    console.log("Use plugins");
    as.use(plugin);
    console.log("Make it global");
    window.appSignal = as;
    console.log("done");
  } else {
    console.log("No appsignal token detected.");
  }
}
