module Alerts
  class Destroy < Mutations::Command
    required do
      model :alert
    end

    def execute
      alert.destroy!
    end
  end
end
