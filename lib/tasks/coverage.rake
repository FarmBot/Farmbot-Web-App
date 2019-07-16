COVERAGE_FILE_PATH = "./coverage_fe/index.html"
THRESHOLD = 0.001
REPO_URL = "https://api.github.com/repos/Farmbot/Farmbot-Web-App"
LATEST_COV_URL = "https://coveralls.io/github/FarmBot/Farmbot-Web-App.json"
PULL_REQUEST = ENV.fetch("CIRCLE_PULL_REQUEST", "/0")
CURRENT_BRANCH = ENV.fetch("CIRCLE_BRANCH", "staging") # "staging" or "pull/11"
CURRENT_COMMIT = ENV.fetch("CIRCLE_SHA1", "")
CSS_SELECTOR = ".fraction"
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

# Don't fail on staging builds (i.e., not a pull request) to allow auto-deploys.
def exit_0?
  CURRENT_BRANCH == "staging"
end

# Get pull request number. Return 0 if not a PR.
def pr_number
  PULL_REQUEST.split("/")[-1].to_i
end

# Get pull request information from the GitHub API.
def fetch_pull_data()
  if pr_number != 0
    return open_json("#{REPO_URL}/pulls/#{pr_number}")
  end
  return {}
end

# Determine the base branch of the current build.
def get_current_branch(pull_data)
  pull_data.dig("base", "ref") || CURRENT_BRANCH
end

# Gather relevant coverage data.
def relevant_data(build)
  { branch: build["branch"],
   commit: build["commit_sha"],
   percent: build["covered_percent"] }
end

# Fetch relevant coverage build data from commit.
def fetch_build_data_from_commit(commit)
  if commit.nil?
    puts "Commit not found."
    build_data = {}
  else
    build_data = open_json("https://coveralls.io/builds/#{commit}.json")
  end
  return relevant_data(build_data)
end

# Fetch relevant remote coverage data for the latest commit on a branch.
def fetch_latest_branch_build(branch)
  github_data = open_json("#{REPO_URL}/git/refs/heads/#{branch}")
  if github_data.is_a? Array
    github_data = {} # Didn't match a branch
  end
  commit = github_data.dig("object", "sha")
  return fetch_build_data_from_commit(commit)
end

# Fetch latest remote coverage data for a branch (commit fetched via GH PR API).
def fetch_latest_pr_base_branch_build(branch)
  github_data = open_json("#{REPO_URL}/pulls?state=closed&base=#{branch}")
  commit = (github_data[0] || {}).dig("base", "sha")
  return fetch_build_data_from_commit(commit)
end

# Fetch a page of build coverage report results.
def fetch_builds_for_page(page_number)
  open_json("#{LATEST_COV_URL}?page=#{page_number}")["builds"]
end

# Fetch coverage data from the last 10 builds.
def fetch_build_data()
  build_data = fetch_builds_for_page(1)
  build_data.push(*fetch_builds_for_page(2))
  clean_build_data = build_data
    .reject { |build| build["covered_percent"].nil? }
    .reject { |build| build["branch"].include? "/" }
  puts "Using data from #{clean_build_data.length} recent coverage builds."
  clean_build_data.map { |build| relevant_data(build) }
end

# Print history and return the most recent match for the provided branch.
def latest_build_data(build_history, branch)
  if branch == "*"
    branch_builds = build_history
  else
    branch_builds = build_history.select { |build| build[:branch] == branch }
  end
  if branch_builds.length > 0
    puts "\nCoverage history (newest to oldest):"
    branch_builds.map { |build|
      puts "#{build[:branch]}: #{build[:percent].round(3)}%"
    }
    branch_builds[0]
  else
    { branch: branch, commit: nil, percent: nil }
  end
end

# <commit hash> on <username>:<branch>
def branch_info_string?(target, pull_data)
  unless pull_data.dig(target, "sha").nil?
    "#{pull_data.dig(target, "sha")} on #{pull_data.dig(target, "label")}"
  end
end

# Print a coverage difference summary string.
def print_summary_text(build_percent, remote, pull_data)
  diff = (build_percent - remote[:percent]).round(3)
  direction = diff > 0 ? "increased" : "decreased"
  description = diff == 0 ? "remained the same at" : "#{direction} (#{diff}%) to"
  puts "Coverage #{description} #{build_percent.round(3)}%" \
       " when pulling #{branch_info_string?("head", pull_data)}" \
       " into #{branch_info_string?("base", pull_data) || remote[:branch]}."
end

def to_percent(pair)
  return ((pair.head / pair.tail) * 100).round(4)
end

namespace :coverage do
  desc "Verify code test coverage changes remain within acceptable thresholds." \
       "Compares current test coverage percentage from Jest output to previous" \
       "values from the base branch of a PR (or the build branch if not a PR)." \
       "This task is used during ci to fail PR builds if test coverage" \
       "decreases significantly and can also be run locally after running" \
       "`jest --coverage` or `npm test-slow`." \
       "The Coveralls stats reporter used to perform this check, but didn't" \
       "compare against a PR's base branch and would always return 0% change."
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
    covered = lines.head + branches.head
    total = lines.tail + branches.tail
    build_percent = (covered / total) * 100
    puts "Aggregate:  #{build_percent.round(4)}%"
    puts

    # Fetch remote build coverage data for the current branch.
    pull_request_data = fetch_pull_data()
    coverage_history_data = fetch_build_data()

    # Use fetched data.
    current_branch = get_current_branch(pull_request_data)
    remote = latest_build_data(coverage_history_data, current_branch)

    if remote[:percent].nil?
      puts "Coveralls data for '#{current_branch}' not found within history."
      puts "Attempting to get coveralls build data for latest commit."
      remote = fetch_latest_branch_build(current_branch)
    end

    if remote[:percent].nil?
      puts "Coverage data for latest '#{current_branch}' commit not available."
      puts "Attempting to use data from the previous commit (latest PR base)."
      remote = fetch_latest_pr_base_branch_build(current_branch)
    end

    if remote[:percent].nil? && current_branch != "staging"
      puts "Error getting coveralls data for '#{current_branch}'."
      puts "Attempting to use staging build coveralls data."
      remote = latest_build_data(coverage_history_data, "staging")
    end

    if remote[:percent].nil?
      puts "Error getting coveralls data for staging."
      puts "Attempting to use latest build coveralls data."
      remote = latest_build_data(coverage_history_data, "*")
    end

    if remote[:percent].nil?
      puts "Error getting coveralls data."
      puts "Using 100 instead of nil for remote coverage value."
      remote = { branch: "N/A", commit: "", percent: 100 }
    end

    # Adjust remote build data values for printing.
    r = {
      branch: (remote[:branch] + " " * 8)[0, 8],
      percent: remote[:percent].round(8),
      commit: remote[:commit][0, 8],
    }

    # Calculate coverage difference between the current and previous build.
    diff = (build_percent - remote[:percent])
    pass = (diff > -THRESHOLD)

    puts
    puts "=" * 37
    puts "COVERAGE RESULTS"
    puts "This build:     #{build_percent.round(8)}% #{CURRENT_COMMIT[0, 8]}"
    puts "#{r[:branch]} build: #{r[:percent]}% #{r[:commit]}"
    puts "=" * 37
    puts "Difference:     #{diff.round(8)}%"
    puts "Pass?           #{pass ? "yes" : "no"}"
    puts

    print_summary_text(build_percent, remote, pull_request_data)

    exit (pass || exit_0?) ? 0 : 1
  end
end
