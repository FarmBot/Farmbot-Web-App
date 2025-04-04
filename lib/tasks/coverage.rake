require "find"

COVERAGE_FILE_PATH = "./coverage_fe/index.html"
JSON_COVERAGE_FILE_PATH = "./coverage_fe/coverage-final.json"
THRESHOLD = 0.001
REPO_URL = "https://api.github.com/repos/Farmbot/Farmbot-Web-App"
LATEST_COV_URL = "https://coveralls.io/github/FarmBot/Farmbot-Web-App.json"
COV_API_BUILDS_PER_PAGE = 5
COV_BUILDS_TO_FETCH = 20
PULL_REQUEST = ENV.fetch("CIRCLE_PULL_REQUEST", "/0")
CURRENT_BRANCH = ENV.fetch("CIRCLE_BRANCH", "staging") # "staging" or "pull/11"
BASE_BRANCHES = ["main", "staging"]
CURRENT_COMMIT = ENV.fetch("CIRCLE_SHA1", "")
CSS_SELECTOR = ".fraction"
FRACTION_DELIM = "/"
REMOTE_COVERAGE_OVERRIDE = ENV.fetch('REMOTE_COVERAGE_OVERRIDE', '0').to_f

# Fetch JSON over HTTP. Rails probably already has a helper for this :shrug:
def maybe_open_json(url)
  if REMOTE_COVERAGE_OVERRIDE > 0
    return {}
  end
  begin
    JSON.parse(URI.parse(url).open.read)
  rescue *[OpenURI::HTTPError, SocketError] => exception
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
    return maybe_open_json("#{REPO_URL}/pulls/#{pr_number}")
  end
  return {}
end

# Determine the base branch of the current build.
def get_base_branch(pull_data)
  current_branch = BASE_BRANCHES.empty? ||
                   BASE_BRANCHES.include?(CURRENT_BRANCH) ? CURRENT_BRANCH : "staging"
  provided_base_branch =
    CURRENT_BRANCH.start_with?("main-hotfix/") ? "main" : nil
  pull_data.dig("base", "ref") || provided_base_branch || current_branch
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
    build_data = maybe_open_json("https://coveralls.io/builds/#{commit}.json")
  end
  return relevant_data(build_data)
end

# Fetch relevant remote coverage data for the latest commit on a branch.
def fetch_latest_branch_build(branch)
  github_data = maybe_open_json("#{REPO_URL}/git/refs/heads/#{branch}")
  if github_data.is_a? Array
    github_data = {} # Didn't match a branch
  end
  commit = github_data.dig("object", "sha")
  return fetch_build_data_from_commit(commit)
end

# Fetch latest remote coverage data for a branch (commit fetched via GH PR API).
def fetch_latest_pr_base_branch_build(branch)
  github_data = maybe_open_json("#{REPO_URL}/pulls?state=closed&base=#{branch}")
  commit = (github_data[0] || {}).dig("base", "sha")
  return fetch_build_data_from_commit(commit)
end

# Fetch a page of build coverage report results.
def fetch_builds_for_page(page_number)
  maybe_open_json("#{LATEST_COV_URL}?page=#{page_number}")["builds"] || []
end

# Number of coverage build data pages required to fetch the desired build count.
def cov_pages_required
  (COV_BUILDS_TO_FETCH / COV_API_BUILDS_PER_PAGE.to_f).ceil
end

# Fetch coverage data from the last COV_BUILDS_TO_FETCH builds.
def fetch_build_data()
  build_data = fetch_builds_for_page(1)
  for page_number in 2..cov_pages_required
    build_data.push(*fetch_builds_for_page(page_number))
  end
  clean_build_data = build_data
    .reject { |build| build["covered_percent"].nil? }
    .reject { |build| build["branch"].nil? }
    .reject { |build| build["branch"].include? "/" }
  puts "Using data from #{clean_build_data.length} of #{build_data.length}" \
       " recent coverage builds."
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

# Calculate coverage results from JSON coverage report.
def get_json_coverage_results()
  results = { lines: { covered: 0, total: 0 }, branches: { covered: 0, total: 0 } }
  begin
    data = JSON.parse(File.open(JSON_COVERAGE_FILE_PATH).read)
  rescue Errno::ENOENT
    return results
  end
  data.each do |filename, file_coverage|
    lineMap = {}
    file_coverage["s"].each do |statement, count|
      line = file_coverage["statementMap"][statement]["start"]["line"]
      if lineMap[line].nil? || lineMap[line] < count
        lineMap[line] = count
      end
    end
    results[:lines][:covered] += lineMap.map { |line, count| count }
      .filter { |count| count != 0 }.length
    results[:lines][:total] += lineMap.length

    branches = []
    file_coverage["b"].each do |branch, counts|
      counts.map { |count| branches.push(count) }
    end
    results[:branches][:covered] += branches.filter { |count| count != 0 }.length
    results[:branches][:total] += branches.length
  end
  results
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

def print_lib_progress
  counts = {
    "file" => { "enzyme" => 0, "rtl" => 0, "both" => 0 },
    "line" => { "enzyme" => 0, "rtl" => 0, "both" => 0 },
  }
  component_counts = { "class" => 0, "const" => 0, "function" => 0 }
  Find.find("frontend") do |path|
    next unless File.file?(path)
    includesEnzyme = false
    includesRTL = false
    File.foreach(path) do |line|
      if line.include?("mount(") || line.include?("shallow(") || line.include?("svgMount(")
        counts["line"]["enzyme"] += 1
        includesEnzyme = true
      end
      if line.include?("render(<")
        counts["line"]["rtl"] += 1
        includesRTL = true
      end
      if line.include?("export class ")
        component_counts["class"] += 1
      end
      if line.include?("export const ")
        component_counts["const"] += 1
      end
      if line.include?("export function ")
        component_counts["function"] += 1
      end
    end
    if includesEnzyme && includesRTL
      counts["file"]["both"] += 1
    elsif includesEnzyme
      counts["file"]["enzyme"] += 1
    elsif includesRTL
      counts["file"]["rtl"] += 1
    end
  end
  puts
  puts "enzyme -> RTL progress:"
  counts.each do |text, counts|
    total = counts["enzyme"] + counts["rtl"] + counts["both"]
    rtl_both_count = counts["rtl"] + counts["both"]
    rtl_both_percent = (rtl_both_count / total.to_f * 100).round(2)
    rtl_percent = (counts["rtl"] / total.to_f * 100).round(2)
    both_percent = (counts["both"] / total.to_f * 100).round(2)
    puts "#{text}s: #{rtl_both_count} / #{total} (#{rtl_both_percent}%)"
    length = 50
    rtl = (rtl_percent * (length.to_f / 100)).ceil
    both = (both_percent * (length.to_f / 100)).ceil
    remain = length - rtl - both
    puts "█" * rtl + "▓" * both + "░" * remain
  end
  puts
  exports = component_counts.map{ |text, count| " #{count} #{text}"}.join(",")
  puts "component exports:" + exports
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
    begin
      # Fetch current build coverage data from the HTML summary.
      statements, branches, functions, lines =
        Nokogiri::HTML(File.open(COVERAGE_FILE_PATH))
          .css(CSS_SELECTOR)
          .map(&:text)
          .map { |x| x.split(FRACTION_DELIM).map(&:to_f) }
          .map { |x| Pair.new(*x) }
    rescue Errno::ENOENT
    end

    puts "\nUnable to determine coverage from HTML report." if lines.nil?
    puts "Checking JSON report..." if lines.nil?
    results = get_json_coverage_results()
    lines_json_report = Pair.new(
      results[:lines][:covered].to_f, results[:lines][:total].to_f
    )
    branches_json_report = Pair.new(
      results[:branches][:covered].to_f, results[:branches][:total].to_f
    )
    if results[:lines][:total] > 0
      lines = lines || lines_json_report
      branches = branches || branches_json_report
    end
    covered = lines_json_report.head + branches_json_report.head
    total = lines_json_report.tail + branches_json_report.tail
    puts "JSON report aggregate:  #{covered / total * 100}%"
    puts

    fallback_fraction = Pair.new(0.0, 1.0)
    puts "\nUnable to determine coverage from build." if lines.nil?
    statements = statements || fallback_fraction
    branches = branches || fallback_fraction
    functions = functions || fallback_fraction
    lines = lines || fallback_fraction

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
    base_branch = get_base_branch(pull_request_data)
    remote = latest_build_data(coverage_history_data, base_branch)

    if remote[:percent].nil?
      puts "Coveralls data for '#{base_branch}' not found within history."
      puts "Attempting to get coveralls build data for latest commit."
      remote = fetch_latest_branch_build(base_branch)
    end

    if remote[:percent].nil?
      puts "Coverage data for latest '#{base_branch}' commit not available."
      puts "Attempting to use data from the previous commit (latest PR base)."
      remote = fetch_latest_pr_base_branch_build(base_branch)
    end

    if remote[:percent].nil? && base_branch != "staging"
      puts "Error getting coveralls data for '#{base_branch}'."
      puts "Attempting to use staging build coveralls data from history."
      remote = latest_build_data(coverage_history_data, "staging")
    end

    if remote[:percent].nil?
      puts "Error getting coveralls data for staging."
      puts "Attempting to use latest build coveralls data in history."
      remote = latest_build_data(coverage_history_data, "*")
    end

    if remote[:percent].nil?
      puts "Error getting coveralls data."
      puts "Checking for override."
      percent = REMOTE_COVERAGE_OVERRIDE
      if percent > 0
        puts "Using override of #{percent}% for remote coverage value."
        remote = { branch: "N/A", commit: "", percent: percent }
      end
    end

    if remote[:percent].nil?
      puts "No override available."
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

    print_lib_progress

    exit (pass || exit_0?) ? 0 : 1
  end
end
