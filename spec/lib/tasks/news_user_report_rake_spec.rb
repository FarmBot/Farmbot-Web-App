require "spec_helper"
require "rake"

Rake.application = Rake::Application.new
Rake::Task.define_task("environment")
ENV["API_HOST"] ||= "example.com"
load Rails.root.join("lib/tasks/news_user_report.rake").to_s

describe "news_user_report.rake" do
  describe NewUserReportMailer, type: :mailer do
    it "builds the daily report email" do
      mail = NewUserReportMailer.daily_report("hello", ["test@example.com"])

      expect(mail.subject).to eq("Daily Report: New FarmBot Setups")
      expect(mail.to).to eq(["test@example.com"])
      expect(mail.from).to eq(["do-not-reply@#{ENV["API_HOST"]}"])
      expect(mail.body.encoded).to include("hello")
    end
  end

  describe "new_user_report:run" do
    let(:task) { Rake::Task["new_user_report:run"] }

    before do
      task.reenable
    end

    it "delivers the generated report" do
      report = instance_double(NewUserReport, deliver: true)

      expect(NewUserReport).to receive(:new).and_return(report)

      task.invoke
    end
  end
end
