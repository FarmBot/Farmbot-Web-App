 describe Sequences::Update do
    let!(:sequence) { FactoryGirl.create(:sequence) }
    let(:user) {FactoryGirl.create(:user, device: sequence.device )}
    it 'updates nested steps' do 
      sequence_params =  {  :name => "New Sequence", 
                            :color => "green", 
                            :user => user, 
                            :sequence => sequence,
                            :steps => [{ :message_type => "if_statement",
                                        :command => {},
                                        :position => 0 },

                                      { :message_type => "read_pin",
                                        :command => {},
                                        :sequence_id => 16,
                                        :position => 1 }] }

      seq = Sequences::Update.run!(sequence_params)
      seq.reload
      seq.validate!
      expect(seq.name).to eq(sequence_params[:name])
      expect(seq.color).to eq(sequence_params[:color])
    end
end