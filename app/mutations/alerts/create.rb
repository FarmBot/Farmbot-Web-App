module Alerts
  class Create < Mutations::Command
    required do
      model :device
      string :problem_tag, in: Alert::PROBLEM_TAGS
    end

    optional { string :slug }

    def execute
      Alert.create!(device: device,
                    problem_tag: problem_tag,
                    slug: slug || SecureRandom.uuid)
    end
  end
end
