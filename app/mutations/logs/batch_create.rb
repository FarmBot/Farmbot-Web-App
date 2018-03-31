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
              string :type, in: Log::TYPES
              optional do
                integer :x
                integer :y
                integer :z
              end
            end
          end
        end
      end
    end

    def execute
      BatchLogDispatchJob.perform_later(device, clean_logs)
      return clean_logs
    end

  private

    def clean_logs
      @clean_logs ||= logs
      .last(device.max_log_count)
      .map    { |i| Logs::Create.run(i, device: device) }
      .select { |i| i.success? } # <= Ignore rejects
      .map    { |i| i.result }
      .reject { |i| Log::DISCARD.include?(i.type) } # Discard jokes
      .map    { |i| i.as_json.except("id") }
    end
  end
end
