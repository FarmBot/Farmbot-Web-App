# Api::SequencesController performs CRUD on stored sequences
module Api
  class SequencesController < Api::AbstractController
    def create
      mutate Sequences::Create.run(params, user: current_user)
    end
  end
end
