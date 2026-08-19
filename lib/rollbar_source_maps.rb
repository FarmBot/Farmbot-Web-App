require "net/http"
require "securerandom"
require "uri"

module RollbarSourceMaps
  ENDPOINT = "https://api.rollbar.com/api/1/sourcemap"

  module_function

  def multipart_field(boundary, name, value)
    [
      "--#{boundary}",
      %(Content-Disposition: form-data; name="#{name}"),
      "",
      value,
    ].join("\r\n") + "\r\n"
  end

  def multipart_file(boundary, name, path)
    [
      "--#{boundary}",
      %(Content-Disposition: form-data; name="#{name}"; ) +
        %(filename="#{File.basename(path)}"),
      "Content-Type: application/json",
      "",
      File.binread(path),
    ].join("\r\n") + "\r\n"
  end

  def upload_map(token:, version:, minified_url:, map_path:)
    boundary = "farmbot-#{SecureRandom.hex(16)}"
    body = multipart_field(boundary, "version", version)
    body += multipart_field(boundary, "minified_url", minified_url)
    body += multipart_file(boundary, "source_map", map_path)
    body += "--#{boundary}--\r\n"

    uri = URI(ENDPOINT)
    request = Net::HTTP::Post.new(uri)
    request["X-Rollbar-Access-Token"] = token
    request["Content-Type"] = "multipart/form-data; boundary=#{boundary}"
    request.body = body
    response = Net::HTTP.start(
      uri.host,
      uri.port,
      use_ssl: uri.scheme == "https",
    ) { |http| http.request(request) }
    return if response.is_a?(Net::HTTPSuccess)

    raise "Rollbar source map upload failed for #{minified_url}: " \
      "HTTP #{response.code} #{response.body}"
  end

  def upload
    token = ENV["ROLLBAR_SRCMAP_TOKEN"]
    revision = ENV["BUILT_AT"] || ENV["SOURCE_VERSION"] || ENV["HEROKU_BUILD_COMMIT"]
    unless token && revision
      puts "Skipping Rollbar source map upload: configuration incomplete."
      return
    end

    puts "Uploading Rollbar source maps for revision #{revision}..."

    version = revision.first(8)
    asset_hosts = [
      ENV.fetch("API_HOST"),
      *ENV.fetch("ROLLBAR_ASSET_HOSTS", "").split(","),
    ]
      .compact
      .map(&:strip)
      .reject(&:empty?)
      .uniq
      .map { |host| "https://#{host}" }
    map_glob = File.join(
      DashboardController::PUBLIC_OUTPUT_DIR,
      "**/*.js.map",
    )
    map_paths = Dir.glob(map_glob).sort
    progress_width = map_paths.length.to_s.length
    map_paths.each_with_index do |map_path, index|
      js_path = map_path.delete_suffix(".map")
      raise "Missing minified file for #{map_path}" unless File.exist?(js_path)

      public_path = js_path.delete_prefix("public/")
      asset_hosts.each do |asset_host|
        upload_map(
          token: token,
          version: version,
          minified_url: "#{asset_host}/#{public_path}",
          map_path: map_path,
        )
      end
      filename = public_path.delete_prefix("assets/dist/")
      progress = format("%#{progress_width}d", index + 1)
      puts "  (#{progress} / #{map_paths.length}) #{filename}"
      $stdout.flush
    end
  end
end
