require "net/http"
require "uri"

module FarmBotOsAssets
  BASE_URL = "https://raw.githubusercontent.com/FarmBot/farmbot_os/staging"
  FILENAMES_WITH_FALLBACKS = {
    "FEATURE_MIN_VERSIONS.json" => "{}",
    "RELEASE_NOTES.md" => "",
  }.freeze

  module_function

  def fetch(filename)
    uri = URI("#{BASE_URL}/#{filename}")
    puts "Fetching FarmBot OS asset: #{uri}"
    response = Net::HTTP.get_response(uri)
    return response.body if response.is_a?(Net::HTTPSuccess)

    raise "FarmBot OS asset download failed for #{filename}: " \
      "HTTP #{response.code} #{response.body}"
  end

  def download(output_dir: Rails.root.join("public"), fallback: false)
    downloads = begin
      FILENAMES_WITH_FALLBACKS.keys.to_h do |filename|
        [filename, fetch(filename)]
      end
    rescue StandardError => error
      raise unless fallback

      warn "FarmBot OS asset download failed: #{error.message}"
      FILENAMES_WITH_FALLBACKS
    end
    downloads.each do |filename, contents|
      File.binwrite(File.join(output_dir, filename), contents)
    end
  end
end
