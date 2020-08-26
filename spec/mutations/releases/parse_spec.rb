require "spec_helper"

describe Sensors::Create do
  HUGE_EXAMPLE = {
    draft: false,
    prerelease: false,
    tag_name: "v11.0.1",
    assets: [
      {
        browser_download_url: "https://github.com/FarmBot/farmbot_os/releases/download/v11.0.1/farmbot-rpi-11.0.1.fw",
        content_type: "application/octet-stream",
        name: "farmbot-rpi-11.0.1.fw",
        state: "uploaded",
      },
      {
        browser_download_url: "https://github.com/FarmBot/farmbot_os/releases/download/v11.0.1/farmbot-rpi-11.0.1.img",
        content_type: "application/octet-stream",
        name: "farmbot-rpi-11.0.1.img",
        state: "uploaded",
      },
      {
        browser_download_url: "https://github.com/FarmBot/farmbot_os/releases/download/v11.0.1/farmbot-rpi-11.0.1.sha256",
        content_type: "application/octet-stream",
        name: "farmbot-rpi-11.0.1.sha256",
        state: "uploaded",
      },
      {
        browser_download_url: "https://github.com/FarmBot/farmbot_os/releases/download/v11.0.1/farmbot-rpi3-11.0.1.fw",
        content_type: "application/octet-stream",
        name: "farmbot-rpi3-11.0.1.fw",
        state: "uploaded",
      },
      {
        browser_download_url: "https://github.com/FarmBot/farmbot_os/releases/download/v11.0.1/farmbot-rpi3-11.0.1.img",
        content_type: "application/octet-stream",
        name: "farmbot-rpi3-11.0.1.img",
        state: "uploaded",
      },
      {
        browser_download_url: "https://github.com/FarmBot/farmbot_os/releases/download/v11.0.1/farmbot-rpi3-11.0.1.sha256",
        content_type: "application/octet-stream",
        name: "farmbot-rpi3-11.0.1.sha256",
        state: "uploaded",
      },
    ],
  }

  it "creates a release" do
    raw_json = `curl -s https://api.github.com/repos/farmbot/farmbot_os/releases/latest`
    input = JSON.parse(raw_json, symbolize_names: true)
    output = Releases::Parse.run!(input)
    expect(output.count).to be 2
    expect(output).to include({
                        image_url: "https://github.com/FarmBot/farmbot_os/releases/download/v11.0.1/farmbot-rpi-11.0.1.fw",
                        version: "v11.0.1",
                        platform: "rpi",
                        channel: "stable",
                      })
    expect(output).to include({
                        image_url: "https://github.com/FarmBot/farmbot_os/releases/download/v11.0.1/farmbot-rpi3-11.0.1.fw",
                        version: "v11.0.1",
                        platform: "rpi3",
                        channel: "stable",
                      })
  end

  it "refuses to publish drafts" do
    boom = -> do
      Releases::Parse.run!({ draft: true, prerelease: false, tag_name: "v11.0.1", assets: [] })
    end
    expect(boom).to raise_error(Mutations::ValidationException, "Don't publish drafts.")
  end

  it "double checks the platform detection regex" do
    boom = -> do
      Releases::Parse.run!({
        draft: false,
        prerelease: false,
        tag_name: "v11.0.1",
        assets: [
          {
            browser_download_url: "whatever.fw",
            content_type: "application/octet-stream",
            name: "farmbot-bbb3-11.0.1.fw", # <== Intentionally wrong format.
            state: "uploaded",
          },
        ],
      })
    end

    expect(boom).to raise_error("Invalid platform?")
  end
end
