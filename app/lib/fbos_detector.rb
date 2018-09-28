module FbosDetector
  FARMBOT_UA_STRING = "FARMBOTOS"
  NO_UA_FOUND       = FARMBOT_UA_STRING + "/0.0.0 (RPI3) RPI3 (MISSING)"

  # Format the user agent header in a way that is easier for us to parse.
  def self.pretty_ua(request)
    # "FARMBOTOS/3.1.0 (RPI3) RPI3 ()"
    # If there is no user-agent present, we assume it is a _very_ old version
    # of FBOS.
    (request.user_agent || NO_UA_FOUND).upcase
  end

  def self.is_fbos_ua?(request)
    pretty_ua(request).include?(FARMBOT_UA_STRING)
  end
end
