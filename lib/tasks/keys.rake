require_relative '../key_gen'

namespace :keys do
  desc "Reset RSA keys used for signing / verifying tokens."
  task generate: :environment do
    puts KeyGen.run.to_pem
    puts "Saved in '#{KeyGen::SAVE_PATH}'."
  end
end
