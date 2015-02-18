module Api
  class SchedulesController < Api::AbstractController
    def index
      render json: Schedule.where(user: current_user)
    end

    def create
      mutate Schedules::Create.run(params,
                                   user: current_user,
                                   sequence: sequence)
    end

    # def show
    #   render json: schedule
    # end

    # def update
    #   mutate Schedules::Update.run(params[:schedule],
    #                                user: current_user)
    # end

    # def destroy
    #   if (schedule.user == current_user) && schedule.destroy
    #     render nothing: true
    #   else
    #     raise Errors::Forbidden, "Not your schedule."
    #   end
    # end

    private

      def sequence
        @sequence ||= Sequence.find(params[:sequence_id])
      end
    # def schedule
    #   @schedule ||= Schedule.find(params[:id])
    # end
  end
end
