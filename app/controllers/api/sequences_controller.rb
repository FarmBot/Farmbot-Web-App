module Api
  class SequencesController < Api::AbstractController
    # TODO add user authorization maybe (privacy)
    def index
      query = { user: current_user }
      query.merge!(schedule_id: params[:schedule_id]) if params[:schedule_id]
      render json: Sequence.where(query)
    end

    def show
      render json: sequence
    end

    def create
      mutate Sequences::Create.run(params, user: current_user)
    end

    def update
      mutate Sequences::Update.run(params[:sequence],
                                   user: current_user,
                                   sequence: sequence)
    end

    def destroy
      # HEY YOU!! If you touch this again, add a mutation. This is the most
      # complexity I would like to see in one controlelr action.
      if (sequence.user == current_user) && sequence.destroy
        render nothing: true
      else
        raise Errors::Forbidden, "Not your Sequence object."
      end
    end

    private

    def sequence
      @sequence ||= Sequence.find(params[:id])
    end
  end
end
