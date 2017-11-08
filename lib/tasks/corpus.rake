namespace :corpus do
  desc "Convert CeleryScript to typescript type definition file. This is " +
       "mostly used by the FarmBot core team when making large updates to" +
       "CeleryScript"
  task generate: :environment do
    sh "rails r latest_corpus.rb > latest_corpus.ts"
    sh "xclip -sel clip < ./latest_corpus.ts"
    puts "Your clipboard and `latest_corpus.ts` now contain the latest corpus."
  end
end
