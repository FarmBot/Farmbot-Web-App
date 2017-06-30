if Rails.env.development?
  module Delayed
    module Backend
      module ActiveRecord
        class Job
          class << self
            alias_method :reserve_original, :reserve
            def reserve(worker, max_run_time = Worker.max_run_time)
              previous_level = ::ActiveRecord::Base.logger.level
              ::ActiveRecord::Base.logger.level = Logger::WARN if previous_level < Logger::WARN
              value = reserve_original(worker, max_run_time)
              ::ActiveRecord::Base.logger.level = previous_level
              value
            end
          end
        end
      end
    end
  end
end
