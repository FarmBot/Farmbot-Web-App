module Logs
  class Create < Mutations::Command
    BLACKLIST = /WPA|PSK|PASSWORD|NERVES/
    BAD_WORDS = "Log message contained blacklisted words"

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
      @log.validate!
      add_error :log, :private, BAD_WORDS if has_bad_words
    end

    def execute
      @log
    end

    private

    def has_bad_words
      !!inputs[:message].upcase.match(BLACKLIST)
    end
  end
end
