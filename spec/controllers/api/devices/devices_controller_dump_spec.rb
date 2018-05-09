require 'spec_helper'

describe Api::DevicesController do
  include Devise::Test::ControllerHelpers
  let(:user) { FactoryBot.create(:user) }

  around(:each) do |example|
    b4 = Api::DevicesController.send_emails
    example.run
    Api::DevicesController.send_emails = b4
  end

  describe '#dump' do
    it 'queues the creation of an account backup to email when an email server is available' do
      Api::DevicesController.send_emails = true
      sign_in user
      empty_mail_bag
      run_jobs_now do
        post :dump, params: {}, session: { format: :json }
      end
      expect(response.status).to eq(202)
      mail = ActionMailer::Base.deliveries.last
      expect(mail).to be_kind_of(Mail::Message)
      expect(mail.to).to include(user.email)
      expect(mail.subject).to eq(DataDumpMailer::SUBJECT)
      expect(mail.attachments.count).to eq(1)
      expect(mail.attachments.first.filename)
        .to eq(DataDumpMailer::EXPORT_FILENAME)
    end

    it 'stores to disk when no email server is available' do
      Api::DevicesController.send_emails = false
      sign_in user
      post :dump, params: {}, session: { format: :json }
      expect(response.status).to eq(200)
      # Just a spot check. Handle in depth usage at the mutation spec level. -RC
      expect(json[:tools]).to be_kind_of(Array)
    end
  end
end
