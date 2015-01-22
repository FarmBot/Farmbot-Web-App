module Api
  class SequencesController < Api::AbstractController
    def index
      render json: Sequence.where(user: current_user)
    end

    def create
      mutate Sequences::Create.run(params, user: current_user)
    end

    def update
      binding.pry
    end

    def destroy
      # TODO: If you touch this again, add a mutation.
      seq = Sequence.find(params[:id])
      if (seq.user == current_user) && seq.destroy
        render nothing: true
      else
        raise Errors::Forbidden, "Not your Sequence object."
      end
    end
  end
end
