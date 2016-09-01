module Api
  class SchedulesController < Api::AbstractController
    def index
      render json: current_device.schedules
    end

    def create
      mutate Schedules::Create.run(params,
                                   device: current_device,
                                   sequence: sequence)
    rescue Exception => e
      binding.pry
    end

    def update
      if schedule.device != current_device
        raise Errors::Forbidden, 'Not your schedule.'
      end
      mutate Schedules::Update.run(params[:schedule],
                                   device: current_device,
                                   schedule: schedule)
    end

    def destroy
      if (schedule.device_id == current_device.id) && schedule.destroy
        render nothing: true
      else
        raise Errors::Forbidden, 'Not your schedule.'
      end
    end

    private

    def sequence
      @sequence ||= Sequence.where(id: params[:sequence_id]).first
    end

    def schedule
      @schedule ||= Schedule.find(params[:id])
    end

    def default_serializer_options
      # For some strange reason, angular-data crashes if we don't call super()
      # here. Rails doesn't care, though.
      super.merge(start: params[:start],
                  finish: params[:finish])
    end
  end
end
