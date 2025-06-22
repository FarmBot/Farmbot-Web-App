namespace :corpus do
  desc "Convert CeleryScript to typescript type definition file. This is " +
       "mostly used by the FarmBot core team when making large updates to" +
       "CeleryScript"
  task generate: :environment do
    sh "rails r scripts/latest_corpus.rb"
    puts "Now run 'xclip -sel clip < ./latest_corpus.ts'"
  end
end
