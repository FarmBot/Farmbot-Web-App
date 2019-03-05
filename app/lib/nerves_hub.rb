require "net/http"
require "openssl"
require "base64"
class NervesHub
  class NervesHubHTTPError < StandardError; end
  # There is a lot of configuration available in this class to support:
  #   * Self Hosters
  #   * Running a local instance of Nerves-Hub
  #   * Not using NervesHub at all.
  # Here is a short description of each configurable option and what it does.
  #   * NERVES_HUB_HOST - Hostname or ip address of NervesHub server.
  #   * NERVES_HUB_PORT - Port for NervesHub server.
  #   * NERVES_HUB_ORG  - Organization name that the FarmBot API is authorized
  #                       to use.
  #
  # Authorizing the FarmBot API is done by installing an authorized client side
  # SSL certificate as assigned by the NervesHub CA. There are two options for
  # configuring this. If none or many of the settings below are missing,
  # This module will simply not do anything.
  #
  #   * Environment variables (Heroku style deploys, will be loaded first)
  #     * NERVES_HUB_CERT - X509 PEM Cert (not a path to a file)
  #     * NERVES_HUB_KEY  - EC Private key (not a path to a file)
  #     * NERVES_HUB_CA   - NervesHub Certificates. (not a path to a file)
  #   * Files (Self hosters/local development, will be loaded if they exist)
  #     * nerves_hub_cert.<ENV>.pem - for example: nerves_hub_cert.production.pem
  #     * nerves_hub_key.<ENV>.pem  - for example: nerves_hub_key.production.pem
  #     * nerves_hub_ca.<ENV>.pem   - for example: nerves_hub_ca.production.pem
  #
  # Once the FarmBot API is authenticated to make calls to NervesHub here's what
  # will happen from a fresh boot/flash of FarmBotOS:
  #   * New FarmBot boots without access to NervesHub
  #   * FarmBot gets configured via configurator
  #   * FarmBot gets a JWT from the FarmBot API
  #   * FarmBot makes an authenticated call to the FarmBot API asking for a
  #     NervesHub SSL Private Key/Cert combo.
  #   * FarmBot API makes a call to NervesHub generating a `device` resource.
  #   * FarmBot API makes a call to NervesHub generating a `device_cert` resouce.
  #     * This require creating a CSR (certificate signing request).
  #   * FarmBot API sends this cert (without saving it) directly to the FarmBot
  #     via AMQP.
  #   * FarmBot burns that cert into internal storage on it's SD card.

  NERVES_HUB_HOST             = ENV.fetch("NERVES_HUB_HOST") { "api.nerves-hub.org" }
  NERVES_HUB_PORT             = ENV.fetch("NERVES_HUB_PORT") { 443 }
  NERVES_HUB_ORG              = ENV.fetch("NERVES_HUB_ORG")  { "farmbot" }
  NERVES_HUB_BASE_URL         = "https://#{NERVES_HUB_HOST}:#{NERVES_HUB_PORT}"
  NERVES_HUB_URI              = URI.parse(NERVES_HUB_BASE_URL)

  # Locations of where files _may_ exist.
  NERVES_HUB_CERT_PATH        = "nerves_hub_cert.#{Rails.env}.pem"
  NERVES_HUB_KEY_PATH         = "nerves_hub_key.#{Rails.env}.pem"
  NERVES_HUB_CA_PATH          = "nerves_hub_ca.#{Rails.env}.pem"

  # This file is for loading the CA from ENV.
  # net/http doesn't support loading this as a X509::Certificate
  # So it needs to be written to a path.
  NERVES_HUB_CA_HACK          = "/tmp/nerves_hub_ca.#{Rails.env}.pem"
  NERVES_HUB_ERROR            = "NervesHub request failed: %s: %s"
  COLON                       = ":"
  BAD_TAG                     = "A device sent a malformed tag"

  # HEADERS for HTTP requests to NervesHub
  HEADERS      = {"Content-Type" => "application/json"}
  DEFAULT_HTTP = Net::HTTP.new(NERVES_HUB_URI.host, NERVES_HUB_URI.port)

  # Raises an exception for when NervesHub API requests fail.
  def self.bad_http(code, body)
    raise NervesHubHTTPError, NERVES_HUB_ERROR % [code, body]
  end

  APPLICATION = "application"
  CHANNEL     = "channel"

  def self.update_channel(serial_number, channel)
    dev = device(serial_number)
    return unless dev
    # ["application:prod", "channel:stable"]
    # Becomes: {"application"=>"prod", "channel"=>"stable"}
    # NEVER DUPLICATE TAG PREFIXES (thing before COLON). Must be unique!
    tag_map = dev.fetch(:tags).map { |x| x.split(COLON) }.to_h
    tag_map[CHANNEL] = channel
    next_tags        = tag_map.to_a.map { |x| x.join(COLON) }
    update(serial_number, next_tags)
  end

  # Checks if a deivce exists in NervesHub
  # if it does     -> does a PUT request updating the tags.
  # if it does not -> does a POST request creating the device with given tags.
  def self.create_or_update(serial_number, tags)
    # Hash | nil
    current_nerves_hub_device = device(serial_number)

    # It's really hard to debug malformed tags; Catch them here:
    if tags.detect{|x| !x.include?(COLON) }
      report_problem(error: BAD_TAG, serial_number: serial_number, tags: tags)
      return
    end

    if current_nerves_hub_device
      update(serial_number, tags)
    else
      new_device(serial_number, tags)
    end
  end

  # GET request for the current device.
  # this method will return `nil` instead of raising an exception.
  def self.device(serial_number)
    resp = conn.get(device_path(serial_number))

    case resp.code.to_s
    when "200" then return JSON(resp.body)["data"].deep_symbolize_keys
    when "404" then return
    else
      bad_http(resp.code, resp.body)
    end
  end

  # PUT request to a device to update it's tags.
  def self.update(serial_number, tags)
    data = {tags: tags}
    resp = conn.put(device_path(serial_number), data.to_json, HEADERS)
    bad_http(resp.code, resp.body) if resp.code != "201"
    JSON(resp.body)["data"].deep_symbolize_keys
  end

  # Create a new device in NervesHub. `tags` should be a list of strings
  # to identify the ENV that FarmBotOS is running in.
  def self.new_device(serial_number, tags)
    data = { description: "farmbot-#{serial_number}",
             identifier:  serial_number,
             tags:        tags }
    resp = conn.post(devices_path, data.to_json, HEADERS)
    bad_http(resp.code, resp.body) if resp.code != "201"
    JSON(resp.body)["data"].deep_symbolize_keys
  end

  # Creates a device certificate that is able to access NervesHub.
  # This creates a CSR on behalf of the device.
  def self.sign_device(serial_number)
    key = generate_device_key
    csr = generate_device_csr(serial_number, key)

    key_safe = Base64.strict_encode64(key.to_pem)
    csr_safe = Base64.strict_encode64(csr.to_pem)

    data = { identifier: serial_number,
             csr:        csr_safe, }
    resp = conn.post(device_sign_path(serial_number), data.to_json, HEADERS)
    bad_http(resp.code, resp.body) if resp.code != "200"
    cert = JSON(resp.body)["data"].deep_symbolize_keys[:cert]

    return { cert: Base64.strict_encode64(cert),
             csr:  csr_safe,
             key:  key_safe, }
  end

  # Is the NervesHub module configured.
  # Doesn't mean the configuration is correct, just that it exists
  def self.active?
    !(current_cert.nil? && current_key.nil?)
  end

  def self.set_conn(obj = DEFAULT_HTTP)
    @conn            = obj
    # Setting the contents of this
    # in the CA store doesn't work for some reason?
    @conn.ca_file    = self.current_ca_file
    # Don't think this is absolutely needed.
    @conn.cert_store = nil
    @conn            = obj
    @conn.use_ssl    = true
    @conn.cert       = current_cert
    @conn.key        = current_key
    @conn
  end

  # HTTP connection.
  def self.conn
    (active? && !@conn) ? set_conn : @conn
  end

private

  # Helper for making requests to a device url on NervesHub
  def self.devices_path(*chunks)
    ["/orgs", NERVES_HUB_ORG, "devices"].concat(chunks).join("/")
  end

  # Helper for making requests to a particular device on NervesHub
  def self.device_path(serial_number)
    devices_path(serial_number)
  end

  # Helper for making signing requests for a device on NervesHub
  def self.device_sign_path(serial_number)
    devices_path(serial_number, "certificates", "sign")
  end

  # Generates a key on behalf of a NervesHub device
  def self.generate_device_key
    OpenSSL::PKey::EC.new("prime256v1").generate_key!
  end

  # Generates a CSR on behalf of a NervesHub device
  # This CSR is POSTed to the NervesHub API.
  # The signed key and a cert are then returned by NervesHub.
  # This key and cert must be passed to a NervesHub device. In the case of
  # FarmBotOS, it will be delivered via AMQP.
  def self.generate_device_csr(serial_number, key)
    options = {
      :organization => NERVES_HUB_ORG,
    }

    request = OpenSSL::X509::Request.new
    request.version = 0
    request.subject = OpenSSL::X509::Name.new([
      ['O', options[:organization], OpenSSL::ASN1::UTF8STRING],
    ])
    request.public_key = real_public_key(key)
    request.sign(key, OpenSSL::Digest::SHA1.new)
  end

  # This is because OpenSSL::PKey::EC doesn't follow the same API
  # as other private keys for some reason.
  # https://github.com/ruby/openssl/issues/29#issuecomment-149799052
  def self.real_public_key(k)
    point = k.public_key
    pub = OpenSSL::PKey::EC.new(point.group)
    pub.public_key = point
    pub
  end

  ## CERT STUFF

  # Cert for authenticating Farmbot API (NOT FARMBOT OS) to NervesHub
  def self.try_env_cert
    OpenSSL::X509::Certificate.new(ENV['NERVES_HUB_CERT']) if ENV['NERVES_HUB_CERT']
  end

  # Cert for authenticating Farmbot API (NOT FARMBOT OS) to NervesHub
  def self.try_file_cert
    OpenSSL::X509::Certificate.new(File.read(NERVES_HUB_CERT_PATH)) if File.exist?(NERVES_HUB_CERT_PATH)
  end
  ## END CERT STUFF

  ## PRIVATE KEY STUFF

  # Cert for authenticating Farmbot API (NOT FARMBOT OS) to NervesHub
  def self.try_env_key
    OpenSSL::PKey::EC.new(ENV['NERVES_HUB_KEY']) if ENV['NERVES_HUB_KEY']
  end

  # Private Key for authenticating Farmbot API (NOT FARMBOT OS) to NervesHub
  def self.try_file_key
    OpenSSL::PKey::EC.new(File.read(NERVES_HUB_KEY_PATH)) if File.exist?(NERVES_HUB_KEY_PATH)
  end

  ## END PRIVATE KEY STUFF

  ## CA STUFF

  # THE CA File _must_ be a file, not the contents of a file.
  # This means these functions return a path to a file, not
  # the contents of a file.

  # NervesHub CA bundle for authenticating Farmbot API (NOT FARMBOT OS) to NervesHub
  def self.try_file_ca_file
    # Don't read the file, just the path.
    File.exist?(NERVES_HUB_CA_PATH) && NERVES_HUB_CA_PATH
  end

  # This is a hack because Ruby "net/http" client doesn't
  # Allow loading this as a normal cert, it only allows
  # loading a flie from the filesystem.
  # https://stackoverflow.com/questions/36993208/how-to-enumerate-through-multiple-certificates-in-a-bundle
  def self.try_env_ca_file
    if ENV['NERVES_HUB_CA']
      file = File.open(NERVES_HUB_CA_HACK, 'w')
      file.write(ENV['NERVES_HUB_CA'])
      file.close
      NERVES_HUB_CA_HACK
    end
  end

  ## END CA STUFF

  # Cert for authenticating Farmbot API (NOT FARMBOT OS) to NervesHub
  def self.current_cert
    @current_cert ||= (try_env_cert || try_file_cert || nil)
  end

  # Private Key for authenticating Farmbot API (NOT FARMBOT OS) to NervesHub
  def self.current_key
    @current_key ||= (try_env_key || try_file_key || nil)
  end

  # Certificate Authority file. See `try_file_ca_file`
  def self.current_ca_file
    @current_ca_file ||= (try_env_ca_file || try_file_ca_file || nil)
  end

  WHOOPS = "🚨 NervesHub Anomaly Detected! 🚨"
  def self.report_problem(payload = {})
    Rollbar.error(WHOOPS, payload)
  end
end
