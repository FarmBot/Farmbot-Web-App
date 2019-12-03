module Logs
  class Create < Mutations::Command
    BLACKLIST = /WPA|PSK|PASSWORD|NERVES/
    BAD_WORDS = "Log message contained blacklisted words"

    required do
      # TODO: Some strange stuff happened with caching in the log service.
      #       Had to change this from "model" to "duck" as a result.
      #       See Device#refresh_cache(). Rails thinks cached `Device` objects
      #       are unsaved.
      duck :device, methods: [:id, :is_device]
      string :message
    end

    optional do
      array :channels,
            class: String,
            in: CeleryScriptSettingsBag::ALLOWED_CHANNEL_NAMES,
            default: []
      string :type, in: Log::TYPES, default: "info"
      float :x
      float :y
      float :z
      integer :verbosity, default: 1
      integer :major_version
      integer :minor_version
      integer :created_at
    end

    def validate
      add_error :log, :private, BAD_WORDS if has_bad_words

      @log = Log.new(clean_inputs)
      @log.validate!
    end

    def execute
      @log.save! && maybe_deliver
      @log
    end

    private

    def clean_inputs
      @clean_inputs ||= inputs
        .except(:device, :created_at)
        .merge(created_at: formatted_timestamp, device_id: device.id)
    end

    def formatted_timestamp
      @formatted_timestamp ||= created_at ?
        DateTime.strptime(created_at.to_s, "%s") : nil
    end

    def maybe_deliver
      Log.delay.deliver(@log.id)
    end

    def has_bad_words
      !!inputs[:message].upcase.match(BLACKLIST)
    end
  end
end
