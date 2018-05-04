
module Api
  # A "corpus" is a dictionary of celery script nodes and arg types.
  # The corpus helps celery script users know the correct format of CS nodes.
  class CorpusesController < Api::AbstractController
    skip_before_action :check_fbos_version, only: [:index, :show]
    skip_before_action :authenticate_user!, only: [:index, :show]
    CORPUS = Sequence::Corpus.as_json({})

    # GET /api/corpuses
    def show
      render json: CORPUS
    end
  end
end
