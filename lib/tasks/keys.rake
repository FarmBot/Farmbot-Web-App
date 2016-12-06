require_relative '../../app/lib/key_gen'

namespace :keys do
  desc "Reset RSA keys used for signing / verifying tokens."
  task generate: :environment do
    puts KeyGen.generate_new_key.to_pem
    puts "Saved in '#{KeyGen::SAVE_PATH}'."
  end
end
