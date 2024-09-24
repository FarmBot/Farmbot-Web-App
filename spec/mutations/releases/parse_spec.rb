require "spec_helper"

describe Releases::Parse do
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

  it "parses a release" do
    input = {
      draft: false,
      prerelease: false,
      tag_name: "v12.1.0",
      assets: [
        {
          name: "farmbot-rpi-12.1.0.fw",
          content_type: "application/octet-stream",
          state: "uploaded",
          browser_download_url: "https://github.com/FarmBot/farmbot_os/releases/download/v12.1.0/farmbot-rpi-12.1.0.fw",
        },
        {
          name: "farmbot-rpi-12.1.0.img",
          content_type: "application/octet-stream",
          state: "uploaded",
          browser_download_url: "https://github.com/FarmBot/farmbot_os/releases/download/v12.1.0/farmbot-rpi-12.1.0.img",
        },
        {
          name: "farmbot-rpi-12.1.0.sha256",
          content_type: "application/octet-stream",
          state: "uploaded",
          browser_download_url: "https://github.com/FarmBot/farmbot_os/releases/download/v12.1.0/farmbot-rpi-12.1.0.sha256",
        },
        {
          name: "farmbot-rpi3-12.1.0.fw",
          content_type: "application/octet-stream",
          state: "uploaded",
          browser_download_url: "https://github.com/FarmBot/farmbot_os/releases/download/v12.1.0/farmbot-rpi3-12.1.0.fw",
        },
        {
          name: "farmbot-rpi3-12.1.0.img",
          content_type: "application/octet-stream",
          state: "uploaded",
          browser_download_url: "https://github.com/FarmBot/farmbot_os/releases/download/v12.1.0/farmbot-rpi3-12.1.0.img",
        },
        {
          name: "farmbot-rpi3-12.1.0.sha256",
          content_type: "application/octet-stream",
          state: "uploaded",
          browser_download_url: "https://github.com/FarmBot/farmbot_os/releases/download/v12.1.0/farmbot-rpi3-12.1.0.sha256",
        },
      ],
    }
    output = Releases::Parse.run!(input)
    expect(output.count).to be 2
    expect(output).to include({
                        image_url: "https://github.com/FarmBot/farmbot_os/releases/download/v12.1.0/farmbot-rpi-12.1.0.fw",
                        version: "12.1.0",
                        platform: "rpi",
                      })
    expect(output).to include({
                        image_url: "https://github.com/FarmBot/farmbot_os/releases/download/v12.1.0/farmbot-rpi3-12.1.0.fw",
                        version: "12.1.0",
                        platform: "rpi3",
                      })
  end

  it "refuses to parse drafts" do
    expect {
      Releases::Parse.run!({ draft: true, prerelease: false, tag_name: "11.0.1", assets: [] })
     }.to raise_error(Mutations::ValidationException, "Don't publish drafts.")
  end

  it "double checks the platform detection regex" do
    expect{
      Releases::Parse.run!({
        draft: false,
        prerelease: false,
        tag_name: "11.0.1",
        assets: [
          {
            browser_download_url: "whatever.fw",
            content_type: "application/octet-stream",
            name: "farmbot-bbb3-11.0.1.fw", # <== Intentionally wrong format.
            state: "uploaded",
          },
        ],
      })
    }.to raise_error("Invalid platform?: bbb3")
  end
end
