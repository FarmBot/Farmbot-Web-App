 describe Sequences::Update do
    let(:user) { FactoryGirl.create(:user) }
    let(:device) { user.device }
    
    it 'updates nested steps' do 
      sequence_params =  {  :name => "New Sequence", 
                            :color => "green", 
                            :device => device,
                            :steps => [{ :message_type => "if_statement",
                                        :command => {},
                                        :sequence_id => 16,
                                        :position => 0 },

                                      { :message_type => "read_pin",
                                        :command => {},
                                        :sequence_id => 16,
                                        :position => 1 }] }

      seq = Sequences::Create.run!(sequence_params)
      binding.pry
    end
end