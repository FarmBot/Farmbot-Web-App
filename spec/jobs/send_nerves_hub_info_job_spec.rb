require "spec_helper"

describe SendNervesHubInfoJob do
  let(:device) { FactoryBot.create(:device) }

  it "handles failure" do
    conn = double("handles failure", :ca_file=    => nil,
                                     :cert_store  => nil,
                                     :cert_store= => nil,
                                     :use_ssl     => nil,
                                     :use_ssl=    => nil,
                                     :cert=       => nil,
                                     :key=        => nil,
                                     :get         => nil,)
    params = { device_id:     device.id,
               serial_number: "xyz",
               tags:          [],
               error:         StandardError.new("Hello!"), }
    not_work = \
      receive(:create_or_update).with(any_args).and_raise(params.fetch(:error))
    expect(NervesHub).to not_work
    old_logger             = ActiveJob::Base.logger
    ActiveJob::Base.logger = Logger.new(nil)
    expect do
      SendNervesHubInfoJob.perform_now(**params.except(:error))
    end.to raise_error(params.fetch(:error))
    ActiveJob::Base.logger = old_logger
  end
end
