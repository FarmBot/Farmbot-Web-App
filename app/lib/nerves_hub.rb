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
  #   * NERVES_HUB_DEVICE_CSR_DIR - Where device csr will be generated
  #                                 temporarily. The private device cert will
  #                                 never be stored to disk.
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
  #     NervesHub SSL Cert
  #   * FarmBot API makes a call to NervesHub generating a `device` resource.
  #   * FarmBot API makes a call to NervesHub generating a `device_cert` resouce.
  #   * FarmBot API sends this cert (without saving it) directly to the FarmBot.
  #   * FarmBot burns that cert into internal storage on it's SD card.

  # Device Certs are generated locally, and should be discarded
  # after a successful request to nerves-hub.
  NERVES_HUB_DEVICE_CSR_DIR   = ENV.fetch("NERVES_HUB_DEVICE_CSR_DIR") {"/tmp/"}
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

  NERVES_HUB_ERROR = "NervesHub request failed: %s: %s"

  def self.bad_http(code, body)
    raise NervesHubHTTPError, NERVES_HUB_ERROR % [code, body]
  end

  def self.create_or_update(serial_number, tags)
    current_nerves_hub_devcice = device(serial_number)
    if current_nerves_hub_devcice
      update_device(serial_number, tags)
    else
      new_device(serial_number, tags)
    end
  end

  def self.device(serial_number)
    resp = conn.get(device_path(serial_number))
    if resp.code == "200"
      JSON(resp.body)["data"].deep_symbolize_keys()
    end
  end

  def self.update(serial_number, tags)
    data = {tags: tags}
    resp = conn.put(device_path(serial_number), data.to_json(), headers())
    bad_http(resp.code, resp.body) if resp.code != "201"

    JSON(resp.body)["data"].deep_symbolize_keys()
  end

  # Create a new device in NervesHub. `tags` should be a list of strings
  # to identify the ENV that FarmBotOS is running in.
  def self.new_device(serial_number, tags)
    puts("creating nerves hub device: #{serial_number}")
    data = {
      description: "farmbot-#{serial_number}",
      identifier:  serial_number,
      tags:        tags
    }
    resp = conn.post(devices_path(), data.to_json(), headers())
    bad_http(resp.code, resp.body) if resp.code != "201"
    JSON(resp.body)["data"].deep_symbolize_keys()
  end

  # Delete a device.
  def self.delete_device(serial_number)
    resp = conn.delete("#{devices_path()}/#{serial_number}")
    bad_http(resp.code, resp.body) if resp.code != "204"
    resp.body
  end

  # Creates a device certificate that is able to access NervesHub.
  def self.sign_device(serial_number)
    puts("signing nerves hub device: #{serial_number}")
    key_file = generate_device_key(serial_number)
    csr_file = generate_device_csr(serial_number, key_file)

    key_bin = File.read(key_file)
    csr_bin = File.read(csr_file)

    key_safe = Base64.strict_encode64(key_bin)
    csr_safe = Base64.strict_encode64(csr_bin)

    data = {
      identifier: serial_number,
      csr:        csr_safe,
    }
    resp = conn.post(device_sign_path(serial_number), data.to_json(), headers())
    bad_http(resp.code, resp.body) if resp.code != "200"
    cert = JSON(resp.body)["data"].deep_symbolize_keys()[:cert]
    FileUtils.rm(key_file)
    FileUtils.rm(csr_file)
    ret = {
      cert: Base64.strict_encode64(cert),
      csr:  csr_safe,
      key:  key_safe,
    }
  end

  def self.active?
    !(current_cert.nil? && current_key.nil?)
  end

  def self.hostname
    NERVES_HUB_HOST
  end

  def self.port
    NERVES_HUB_PORT
  end

  def self.ca
    Base64.strict_encode64(File.read(@current_ca_file))
  end

private

  def self.devices_path
    "/orgs/#{NERVES_HUB_ORG}/devices"
  end

  def self.device_path(serial_number)
    "/orgs/#{NERVES_HUB_ORG}/devices/#{serial_number}"
  end

  def self.device_sign_path(serial_number)
    "#{devices_path}/#{serial_number}/certificates/sign"
  end

  def self.headers
    {"Content-Type" => "application/json"}
  end

  def self.generate_device_key(serial_number)
    file = File.join(NERVES_HUB_DEVICE_CSR_DIR, "#{serial_number}-key.pem")
    %x[openssl ecparam -genkey -name prime256v1 -noout -out #{file}]
    file
  end

  def self.generate_device_csr(serial_number, key_file)
    file = File.join(NERVES_HUB_DEVICE_CSR_DIR, "#{serial_number}-csr.pem")
    %x[openssl req -new -sha256 -key #{key_file} -out #{file} -subj /O=#{NERVES_HUB_ORG}]
    file
  end

  def self.try_env_cert
    OpenSSL::X509::Certificate.new(ENV['NERVES_HUB_CERT']) if ENV['NERVES_HUB_CERT']
  end

  def self.try_file_cert
    OpenSSL::X509::Certificate.new(File.read(NERVES_HUB_CERT_PATH)) if File.exist?(NERVES_HUB_CERT_PATH)
  end

  def self.try_env_key
    OpenSSL::PKey::EC.new(ENV['NERVES_HUB_KEY']) if ENV['NERVES_HUB_KEY']
  end

  def self.try_file_key
    OpenSSL::PKey::EC.new(File.read(NERVES_HUB_KEY_PATH)) if File.exist?(NERVES_HUB_KEY_PATH)
  end

  def self.try_env_ca_file
    File.exist?(NERVES_HUB_CA_PATH) && NERVES_HUB_CA_PATH
  end

  # This is a hack because net/http doesn't
  # Allo loading this as a normal cert, it only allows
  # loading a flie.
  def self.try_file_ca_file
    if ENV['NERVES_HUB_KEY']
      file = File.open(NERVES_HUB_CA_HACK, 'w')
      file.write(ENV['NERVES_HUB_KEY'])
      file.close()
      NERVES_HUB_CA_HACK
    end
  end

  def self.current_cert
    @current_cert ||= (try_env_cert() || try_file_cert() || nil)
  end

  def self.current_key
    @current_key ||= (try_env_key() || try_file_key() || nil)
  end

  def self.current_ca_file
    @current_ca_file ||= (try_env_ca_file() || try_file_ca_file() || nil)
  end

  def self.conn
    if active?() && !@conn
      FileUtils.mkdir_p NERVES_HUB_DEVICE_CSR_DIR
      @conn = Net::HTTP.new(NERVES_HUB_URI.host, NERVES_HUB_URI.port)
      @conn.use_ssl = true
      @conn.cert = current_cert()
      @conn.key = current_key()
      # Setting the contents of this
      # in the CA store doesn't work for some reason?
      @conn.ca_file = self.current_ca_file()
      # Don't think this is absolutely needed.
      @conn.cert_store = nil
    end
    @conn
  end

end
