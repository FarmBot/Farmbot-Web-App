COVERAGE_FILE_PATH = [
  ENV.fetch("CIRCLE_WORKING_DIRECTORY", "./coverage_fe"),
  "index.html"
].join("/")
THRESHOLD      = 0.001
REPO_URL       = "https://api.github.com/repos/Farmbot/Farmbot-Web-App/git"\
                 "/refs/heads/staging"
CSS_SELECTOR   = ".fraction"
FRACTION_DELIM = "/"

# Fetch JSON over HTTP. Rails probably already has a helper for this :shrug:
def open_json(url)
  JSON.parse(open(url).read)
end

namespace :coverage do
  desc "Coveralls stats stopped working :("
  task run: :environment do
    _, branches, _, lines = Nokogiri::HTML(open(COVERAGE_FILE_PATH))
      .css(CSS_SELECTOR)
      .map(&:text)
      .map { |x| x.split(FRACTION_DELIM).map(&:to_f) }
      .map { |x| Pair.new(*x) }

    numerator     = lines.head + branches.head
    denominator   = lines.tail + branches.tail
    build_percent = (numerator / denominator) * 100

    latest_commit_staging = open_json(REPO_URL).dig("object", "sha")
    build_url             = "https://coveralls.io/builds/#{latest_commit_staging}.json"
    staging_percent       = open_json(build_url).fetch("covered_percent")

    diff = (build_percent - staging_percent)
    pass = (diff > -THRESHOLD)

    puts "=" * 37
    puts "COVERAGE RESULTS"
    puts "This build:    #{build_percent}"
    puts "Staging build: #{staging_percent}"
    puts "=" * 37
    puts "Difference:    #{diff}"
    puts "Pass?:         #{pass ? "yes" : "no"}"

    exit pass ? 0 : 1

  end
end
