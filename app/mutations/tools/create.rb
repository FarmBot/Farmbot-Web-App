module Tools
  class Create < Mutations::Command
    required do
      string :name
      model  :device, class: Device
    end

    def execute
      Tool.create!(inputs)
    end
  end
end
