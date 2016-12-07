module Logs
  class Create < Mutations::Command
    required do
      model  :device, class: Device
      string :message
    end

    optional do
      array :channels, class: String
      hash :meta do
        integer :x
        integer :y
        integer :z
        string :type, in: Log::TYPES
      end
    end

    def validate
      @log = Log.new(inputs)
      binding.pry
    end

    def execute
      @log
    end
  end
end
