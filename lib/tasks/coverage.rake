COVERAGE_FILE_PATH = "./coverage_fe/index.html"
THRESHOLD      = 0.001
REPO_URL       = "https://api.github.com/repos/Farmbot/Farmbot-Web-App"
CURRENT_BRANCH = ENV.fetch("CIRCLE_BRANCH", "staging")
CURRENT_COMMIT = ENV.fetch("CIRCLE_SHA1", "")
CSS_SELECTOR   = ".fraction"
FRACTION_DELIM = "/"

# Fetch JSON over HTTP. Rails probably already has a helper for this :shrug:
def open_json(url)
  begin
    JSON.parse(open(url).read)
  rescue OpenURI::HTTPError => exception
    puts exception.message
    return {}
  end
end

# Determine the branch of the current build.
def fetch_current_branch()
  if CURRENT_BRANCH.include? "/"
    gh_data = open_json("#{REPO_URL}/pulls/#{CURRENT_BRANCH.split("/")[1]}")
    return gh_data.dig("head", "ref")
  else
    return CURRENT_BRANCH
  end
end

# Assemble the coverage data URL using the provided branch.
def coverage_url(branch)
  commit = open_json("#{REPO_URL}/git/refs/heads/#{branch}").dig("object", "sha")
  return "https://coveralls.io/builds/#{commit}.json"
end

# Fetch relevant remote coverage data.
def fetch_build_data(url)
  build_data = open_json(url)
  return {
    branch: build_data.dig("branch"),
    commit: build_data.dig("commit_sha"),
    percent: build_data.dig("covered_percent")}
end

def to_percent(pair)
  return ((pair.head / pair.tail) * 100).round(4)
end

namespace :coverage do
  desc "Coveralls stats stopped working :("
  task run: :environment do
    # Fetch current build coverage data from the HTML summary.
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

    # Calculate an aggregate coverage percentage for the current build.
    covered       = lines.head + branches.head
    total         = lines.tail + branches.tail
    build_percent = (covered / total) * 100
    puts "Aggregate:  #{build_percent.round(4)}%"
    puts

    # Attempt to fetch remote build coverage data for the current branch.
    current_branch = fetch_current_branch()
    remote = fetch_build_data(coverage_url(current_branch))

    if remote[:percent].nil? && CURRENT_COMMIT == remote[:commit]
      puts "Coverage already calculated for #{remote[:branch]}."
      puts "Using this build's data instead."
      remote[:percent] = build_percent
    end

    if remote[:percent].nil? && current_branch != "staging"
      puts "Error getting coveralls data for #{current_branch}."
      puts "Attempting to use staging build coveralls data."
      remote = fetch_build_data(coverage_url("staging"))
    end

    if remote[:percent].nil?
      puts "Error getting coveralls data for staging."
      puts "Attempting to use latest build coveralls data."
      latest_cov_url = "https://coveralls.io/github/FarmBot/Farmbot-Web-App.json"
      remote = fetch_build_data(latest_cov_url)
    end

    if remote[:percent].nil?
      puts "Error getting coveralls data."
      puts "Wait for build to finish and try again or check for build errors."
      puts "Using 100 instead of nil for remote coverage value."
      remote = {branch: "N/A", commit: "", percent: 100}
    end

    # Adjust remote build data values for printing.
    r = {
      branch: (remote[:branch] + ' ' * 8)[0,8],
      percent: remote[:percent].round(8),
      commit: remote[:commit][0,8]}

    # Calculate coverage difference between the current and previous build.
    diff = (build_percent - remote[:percent])
    pass = (diff > -THRESHOLD)

    puts
    puts "=" * 37
    puts "COVERAGE RESULTS"
    puts "This build:     #{build_percent.round(8)}% #{CURRENT_COMMIT[0,8]}"
    puts "#{r[:branch]} build: #{r[:percent]}% #{r[:commit]}"
    puts "=" * 37
    puts "Difference:     #{diff.round(8)}%"
    puts "Pass?           #{pass ? "yes" : "no"}"
    puts

    exit pass ? 0 : 1

  end
end
