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
      string :type, in: Log::TYPES
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
      @log = Log.new(inputs.except(:meta).merge(temporary_stub))
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

    # We won't need this after `meta` field removal.
    def temporary_stub
      {
        x:             meta[:x],
        y:             meta[:y],
        z:             meta[:z],
        verbosity:     meta[:verbosity],
        major_version: meta[:major_version],
        minor_version: meta[:minor_version],
      }
    end
  end
end
