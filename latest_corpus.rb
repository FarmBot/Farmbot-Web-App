require "json"
require "pry"

HASH = JSON.parse(File.read("./latest_corpus.json"))

binding.pry