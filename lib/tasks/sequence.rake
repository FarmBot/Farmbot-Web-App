namespace :sequence do
  desc "Publish an official shared sequence"
  task publish: :environment do
    class PublishOfficial < Sequences::Publish
      def enforce_allow_list; false; end
    end

    dev = User.find_by(email: ENV.fetch("AUTHORIZED_PUBLISHER")).device
    puts "Enter sequence ID: "
    dev.sequences.order(id: :asc).pluck(:id, :name).map do |(id, name)|
      puts "#{id.to_s.rjust(7)}) #{name}"
    end
    id = STDIN.gets.chomp.to_i
    sequence = dev.sequences.find(id)
    PublishOfficial.run!(copyright: "Farmbot, Inc.",
                         sequence: sequence,
                         device: dev)

    sv = SequencePublication
      .find_by(author_sequence_id: sequence.id)
      .sequence_versions
      .order(created_at: :desc)
      .last
      .id
    puts "=" * 60
    puts "Published Sequence version #{sv}"
  end
end
