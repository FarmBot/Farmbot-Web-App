COVERAGE_FILE_PATH = [ ENV.fetch("COVERAGE_DIRECTORY"), "index.html" ].join("/")
THRESHOLD = 0.001
REPO_URL  = "https://api.github.com/repos/Farmbot/Farmbot-Web-App/git/refs/heads/staging"
fractions = Nokogiri::HTML(open(COVERAGE_FILE_PATH))
  .css(".fraction")
  .map { |x| x.text.split("/").map(&:to_f).reduce(:/) }
  .map { |x| x * 100.0 }

statements = fractions[0]
branches   = fractions[1]
functions  = fractions[2]
lines      = fractions[3]

def open_json(url)
  JSON.parse(open(url).read)
end

latest_commit_staging = open_json(REPO_URL).dig("object", "sha")
build_url             = "https://coveralls.io/builds/#{latest_commit_staging}.json"
staging_percent       = open_json(build_url).fetch("covered_percent")

binding.pry
# # Determine coverage change and compare against threshold
# change = build_percent - staging_percent
# print("this build ({}%) - staging ({}%) = {}%".format(
#     build_percent, staging_percent, change))
# if change < -THRESHOLD:
#     sys.exit(1)
