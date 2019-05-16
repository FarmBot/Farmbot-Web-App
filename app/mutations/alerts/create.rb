module Alerts
  class Create < Mutations::Command
    required do
      model :device
      string :problem_tag, in: Alert::PROBLEM_TAGS
    end

    optional do
      string :slug
      integer :priority, default: 99
    end

    def execute
      Alert.create!({ slug: slug || SecureRandom.uuid }.merge(inputs))
    end
  end
end
