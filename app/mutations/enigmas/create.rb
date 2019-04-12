module Enigmas
  class Create < Mutations::Command
    required do
      model :device
      string :problem_tag, in: Enigma::PROBLEM_TAGS
    end

    def execute
      Enigma.create!(device: device,
                     problem_tag: problem_tag,
                     uuid: SecureRandom.uuid)
    end
  end
end
