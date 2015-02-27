module Api
  class SchedulesController < Api::AbstractController
    def index
      start  = Time.now - 2.day
      finish = Time.now + 4.days
      # Follow this for better querying in the future:
      # http://www.js-data.io/v1.3.0/docs/query-syntax
      render json: Schedule.where(user: current_user),
             start: start,
             finish: finish
    end

    def create
      mutate Schedules::Create.run(params,
                                   user: current_user,
                                   sequence: sequence)
    end

    # def show
    #   render json: schedule
    # end

    def update
      if schedule.user != current_user
        raise Errors::Forbidden, 'Not your schedule.'
      end
      mutate Schedules::Update.run(params[:schedule],
                                   user: current_user,
                                   schedule: schedule)
    end

    def destroy
      if (schedule.user == current_user) && schedule.destroy
        render nothing: true
      else
        raise Errors::Forbidden, 'Not your schedule.'
      end
    end

    private

    def sequence
      @sequence ||= Sequence.find(params[:sequence_id])
    end

    def schedule
      @schedule ||= Schedule.find(params[:id])
    end
  end
end
