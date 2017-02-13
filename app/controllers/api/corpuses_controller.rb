
module Api
  class CorpusesController < Api::AbstractController
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
