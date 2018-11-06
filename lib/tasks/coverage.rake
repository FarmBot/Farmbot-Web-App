COVERAGE_FILE_PATH = "./coverage_fe/index.html"
THRESHOLD      = 0.001
REPO_URL       = "https://api.github.com/repos/Farmbot/Farmbot-Web-App/git"\
                 "/refs/heads/staging"
CURRENT_COMMIT = ENV.fetch("CIRCLE_SHA1", "")
CSS_SELECTOR   = ".fraction"
FRACTION_DELIM = "/"

# Fetch JSON over HTTP. Rails probably already has a helper for this :shrug:
def open_json(url)
  JSON.parse(open(url).read)
end

def to_percent(pair)
  return ((pair.head / pair.tail) * 100).round(4)
end

namespace :coverage do
  desc "Coveralls stats stopped working :("
  task run: :environment do
    statements, branches, functions, lines = Nokogiri::HTML(open(COVERAGE_FILE_PATH))
      .css(CSS_SELECTOR)
      .map(&:text)
      .map { |x| x.split(FRACTION_DELIM).map(&:to_f) }
      .map { |x| Pair.new(*x) }

    puts
    puts "This build: #{CURRENT_COMMIT}"
    puts "Statements: #{to_percent(statements)}%"
    puts "Branches:   #{to_percent(branches)}%"
    puts "Functions:  #{to_percent(functions)}%"
    puts "Lines:      #{to_percent(lines)}%"
    puts

    covered       = lines.head + branches.head
    total         = lines.tail + branches.tail
    build_percent = (covered / total) * 100

    latest_commit_staging = open_json(REPO_URL).dig("object", "sha")
    puts "staging: #{latest_commit_staging}"
    build_url             = "https://coveralls.io/builds/#{latest_commit_staging}.json"
    begin
      staging_percent     = open_json(build_url).fetch("covered_percent")
    rescue OpenURI::HTTPError => exception
      puts exception.message
      puts "Error getting coveralls data. Wait for build to finish and try again."
      staging_percent     = 100
    end

    if CURRENT_COMMIT == latest_commit_staging
      staging_percent = build_percent
    end

    diff = (build_percent - staging_percent)
    pass = (diff > -THRESHOLD)

    puts "=" * 37
    puts "COVERAGE RESULTS"
    puts "This build:    #{build_percent.round(8)}% #{CURRENT_COMMIT[0,7]}"
    puts "Staging build: #{staging_percent.round(8)}% #{latest_commit_staging[0,7]}"
    puts "=" * 37
    puts "Difference:    #{diff.round(8)}%"
    puts "Pass?:         #{pass ? "yes" : "no"}"

    exit pass ? 0 : 1

  end
end
