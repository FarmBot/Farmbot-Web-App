require 'spec_helper'

describe Api::DevicesController do
  include Devise::Test::ControllerHelpers
  let(:user) { FactoryBot.create(:user) }

  describe '#dump' do
    it 'queues the creation of an account backup' do
      sign_in user
      empty_mail_bag
      run_jobs_now do
        post :dump, params: {}, session: { format: :json }
      end
      expect(response.status).to eq(200)
      mail = ActionMailer::Base.deliveries.last
      expect(mail).to be_kind_of(Mail::Message)
      expect(mail.to).to include(user.email)
      expect(mail.subject).to eq(DataDumpMailer::SUBJECT)
      expect(mail.attachments.count).to eq(1)
      expect(mail.attachments.first.filename)
        .to eq(DataDumpMailer::EXPORT_FILENAME)
    end
  end
end
