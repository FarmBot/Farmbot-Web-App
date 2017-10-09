module Logs
  class BatchCreate < Mutations::Command
    required do
      model  :device, class: Device
      array :logs do
        hash do
          string :message
          optional do
            array :channels,
                  class: String,
                  in: CeleryScriptSettingsBag::ALLOWED_CHANNEL_NAMES
            hash :meta do
              integer :x
              integer :y
              integer :z
              string :type, in: Log::TYPES
            end
          end
        end
      end
    end

    def execute
      Log
        .create(clean_logs)
        .tap { |i| LogDispatch.deliver(device, i) }
    end

  private

    def clean_logs
      @clean_logs ||= logs
        .last(device.max_log_count)
        .map    { |i| Logs::Create.run(i, device: device) }
        .select { |i| i.success? } # <= Ignore rejects
        .map    { |i| i.result }
        .reject do |i|
          # Don't save jokes or debug info:
          t = i.meta["type"]
          ["fun", "debug"].include?(t)
        end
        .map    { |i| i.as_json }
    end
  end
end
