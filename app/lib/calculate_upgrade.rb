class CalculateUpgrade < Mutations::Command
    NULL          = Gem::Version::new("0.0.0")
    MEDIUM_OLDISH = Gem::Version.new("5.0.9")
    LEGACY_CUTOFF = Gem::Version.new("5.0.6")

    # For extremely old versions:
    OLD_OS_URL    = "https://api.github.com/repos/farmbot/farmbot_os" +
                    "/releases/8772352"

    # For versions that are slightly out of date:
    MID_OS_URL    = "https://api.github.com/repos/FarmBot/farmbot_os/releases" +
                    "/9200943"

    # Latest version when you don't have a custom release URL.
    DEFAULT_OS    = "https://api.github.com/repos/farmbot/farmbot_os/releases" +
                    "/latest"

    # Custom URL, or fallback to default if no custom URL is set.
    OS_RELEASE    = ENV.fetch("OS_UPDATE_SERVER") { DEFAULT_OS }

  required do
    model :version, class: Gem::Version
  end

  def execute
    return OLD_OS_URL if version <= LEGACY_CUTOFF
    return MID_OS_URL if version <= MEDIUM_OLDISH
    return OS_RELEASE
  end
end
