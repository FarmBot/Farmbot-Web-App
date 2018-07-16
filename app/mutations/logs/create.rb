module Logs
  class Create < Mutations::Command
    BLACKLIST = /WPA|PSK|PASSWORD|NERVES/
    BAD_WORDS = "Log message contained blacklisted words"

    required do
      # TODO: Some strange stuff happened with caching in the log service.
      #       Had to change this from "model" to "duck" as a result.
      #       See Device#refresh_cache(). Rails thinks cached `Device` objects
      #       are unsaved.
      duck  :device, methods: [:id, :is_device]
      string :message
    end

    optional do
      array :channels,
            class: String,
            in: CeleryScriptSettingsBag::ALLOWED_CHANNEL_NAMES
      # LEGACY SHIM AHEAD!!! ===================================================
      #
      # We once stored certain fields in a `meta` column.
      # The API has evolved since that time, the requirements are pretty solid
      # at this point and we need the ability to perform SQL queries. The `meta`
      # field is no longer useful nor is it a clean solution.
      #
      # Legacy FBOS versions expect logs to be in the same shape as before
      # and they also produce logs with the expectation that logs have a `meta`
      # field.
      #
      # We will keep the `meta` field around for now, but ideally, API users
      # should access `log.FOO` instead of `log.meta.FOO` for future
      # compatibility.
      #
      # TODO: delete the `meta` field once FBOS < v6.4.0 reach EOL.
      string  :type, in: Log::TYPES
      float :x
      float :y
      float :z
      integer :verbosity
      integer :major_version
      integer :minor_version
      integer :created_at

      hash :meta do # This can be transitioned out soon.
        string :type, in: Log::TYPES
        optional do
          float :x
          float :y
          float :z
          integer :verbosity
          integer :major_version
          integer :minor_version
        end
      end
      # END LEGACY SHIM ========================================================
    end

    def validate
      add_error :log, :private, BAD_WORDS if has_bad_words
      add_error :device, :no_id, "ID of device can't be nil" unless device.id
      @log               = Log.new
      @log.device_id     = device.id
      @log.message       = message
      @log.channels      = channels || []
      @log.x             = transitional_field(:x)
      @log.y             = transitional_field(:y)
      @log.z             = transitional_field(:z)
      @log.verbosity     = transitional_field(:verbosity, 1)
      @log.major_version = transitional_field(:major_version)
      @log.minor_version = transitional_field(:minor_version)
      @log.type          = transitional_field(:type, "info")
      @log.created_at    = DateTime.strptime(created_at.to_s,'%s') if created_at
      @log.validate!
    end

    def execute
      @log.save! && maybe_deliver
      @log
    end

    private

    def maybe_deliver
      Log.delay.deliver(device, @log)
    end

    def has_bad_words
      !!inputs[:message].upcase.match(BLACKLIST)
    end

    # Helper for dealing with the gradual removal of the meta field.
    def transitional_field(name, default = nil)
      m = meta || {} # New logs wont have `meta`.
      return inputs[name] || m[name] || m[name.to_s] || default
    end
  end
end
