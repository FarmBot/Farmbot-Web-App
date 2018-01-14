class CalculateUpgrade < Mutations::Command
    # If version <= this, you can't just fast forward to the latest FBOS version.
    FBOS_CUTOFF  = Gem::Version.new("5.0.6")
    # If you have a really, really old FBOS
    OLD_OS_URL   = "https://api.github.com/repos/farmbot/farmbot_os"+
                   "/releases/8772352"
    OS_RELEASE   = ENV.fetch("OS_UPDATE_SERVER") { DEFAULT_OS }

  required do
    model :version, class: Gem::Version
  end

  def execute
    (version <= FBOS_CUTOFF) ? OLD_OS_URL : OS_RELEASE
  end
end