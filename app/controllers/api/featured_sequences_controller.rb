module Api
  class FeaturedSequencesController < Api::AbstractController
    JOIN = "INNER JOIN sequence_publications ON sequence_publications.id = sequence_versions.sequence_publication_id"

    skip_before_action :authenticate_user!, only: [:index]

    def index
      render json: publisher_email ? publications : []
    end

    private

    def publisher_email
      @publisher_email ||= ENV["AUTHORIZED_PUBLISHER"]
    end

    def publications
      Rails.cache.fetch("farmbot_featured_sequences", expires_in: 10.minutes) do
        SequenceVersion
          .joins(JOIN)
          .where("sequence_publications.cached_author_email = ?", publisher_email)
          .where("sequence_publications.published = ?", true)
          .order(updated_at: :desc)
          .uniq(&:sequence_publication_id)
          .map do |x|
          {
            id: x.id,
            path: "/app/shared/sequence/#{x.id}",
            name: x.name,
            description: x.description,
            color: x.color,
          }
        end
      end
    end
  end
end
