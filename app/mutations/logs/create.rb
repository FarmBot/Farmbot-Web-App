module Logs
  class Create < Mutations::Command
    BLACKLIST = /WPA|PSK|PASSWORD|NERVES/
    BAD_WORDS = "Log message contained blacklisted words"

    required do
      model  :device, class: Device
      string :message
    end

    optional do
      array :channels,
            class: String,
            in: CeleryScriptSettingsBag::ALLOWED_CHANNEL_NAMES
      # LEGACY SHIM AHEAD!!! ===================================================
      #
      # We onced stored certain fields in a `meta` column.
      # The API has evolved since that time, the requirements are pretty solid
      # at this point and we need the ability to perform SQL queries. The `meta`
      # field is no longer useful nor is it a clean solution.
      #
      # Too many bots expect logs to be in the same shape as before and they
      # also create logs with the expectation that logs have a `meta` field.
      #
      # We will keep the `meta` field aroundn for now, but ideally, API users
      # should access `log.FOO` instead of `log.meta.FOO` for future
      # compatibility.
      #
      # TODO: Make the fields below mandadtory (allowing nil in some cases, but
      #       always requiring the key) and delete the `meta` field.
      string  :type, in: Log::TYPES
      integer :x
      integer :y
      integer :z
      integer :verbosity
      integer :major_version
      integer :minor_version

      hash :meta do # This can be transitioned out soon.
        string :type, in: Log::TYPES
        optional do
          integer :x
          integer :y
          integer :z
          integer :verbosity
          integer :major_version
          integer :minor_version
        end
      end
      # END LEGACY SHIM ========================================================
    end

    def validate
      @log               = Log.new
      @log.device        = device
      @log.message       = message
      @log.channels      = channels || []
      @log.x             = transitional_field(:x)
      @log.y             = transitional_field(:y)
      @log.z             = transitional_field(:z)
      @log.verbosity     = transitional_field(:verbosity)
      @log.major_version = transitional_field(:major_version)
      @log.minor_version = transitional_field(:minor_version)
      @log.type          = transitional_field(:type)
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

    # Helper for dealing with the gradual removal of the meta field.
    def transitional_field(name, default = nil)
      return inputs[name] || meta[name] || meta[name.to_s] || default
    end
  end
end
