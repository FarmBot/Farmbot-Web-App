
module Api
  # A "corpus" is a dictionary of celery script nodes and arg types.
  # The corpus helps ceery script users know the correct format of CS nodes.
  # My original intention was to support multiple corpuses based on use case.
  # In retrospec, that was a case of YAGNI. TODO: Remove `#index` action.
  class CorpusesController < Api::AbstractController
    skip_before_action :check_fbos_version, only: [:index, :show]
    skip_before_action :authenticate_user!, only: [:index, :show]
    THE_ONLY_CORPUS_FOR_NOW = Sequence::Corpus.as_json({})

    # GET /api/corpuses
    def index
      render json: [THE_ONLY_CORPUS_FOR_NOW]
    end

    # GET /api/corpuses/:id
    def show
      render json: THE_ONLY_CORPUS_FOR_NOW
    end
  end
end
